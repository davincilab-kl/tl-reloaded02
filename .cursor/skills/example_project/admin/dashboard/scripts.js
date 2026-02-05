let chartInstance = null;
let secondChartInstance = null;
let chartData = {};

async function loadCounts() {
    try {
        const res = await fetch('/api/config/count_db.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        document.getElementById('count-schools').textContent = data.schools ?? '0';
        document.getElementById('count-teachers').textContent = data.teachers ?? '0';
        document.getElementById('count-classes').textContent = data.classes ?? '0';
        document.getElementById('count-students').textContent = data.students ?? '0';
        
        // Daten für Diagramme speichern
        window.dashboardData = data;
        
        // T-Coins-Gesamtzahl der letzten 14 Tage laden
        await loadTcoinsTotal();
    } catch (e) {
        console.error('Fehler beim Laden der Kennzahlen:', e);
    }
}

async function loadTcoinsTotal() {
    try {
        const res = await fetch('/api/misc/get_tcoins_stats.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        // Summe aller T-Coins der letzten 14 Tage berechnen
        const total = data.tcoins ? data.tcoins.reduce((sum, val) => sum + val, 0) : 0;
        document.getElementById('count-tcoins').textContent = total.toLocaleString('de-DE');
    } catch (e) {
        console.error('Fehler beim Laden der T-Coins-Gesamtzahl:', e);
        document.getElementById('count-tcoins').textContent = '0';
    }
}

async function loadChartData(type) {
    try {
        let urls = [];
        switch(type) {
            case 'schools':
                urls = ['/api/schools/get_schools_funding.php', '/api/schools/get_schools_timeline.php'];
                break;
            case 'teachers':
                urls = ['/api/teachers/get_teachers_registrations.php'];
                break;
            case 'students':
                urls = ['/api/students/get_students_registrations.php'];
                break;
            case 'classes':
                urls = ['/api/misc/get_classes_timeline.php'];
                break;
            case 'tcoins':
                urls = ['/api/misc/get_tcoins_stats.php'];
                break;
            default:
                return null;
        }
        
        const promises = urls.map(url => fetch(url, { cache: 'no-store' }));
        const responses = await Promise.all(promises);
        
        const data = [];
        for (let i = 0; i < responses.length; i++) {
            if (!responses[i].ok) throw new Error('HTTP ' + responses[i].status);
            data.push(await responses[i].json());
        }
        
        chartData[type] = data;
        return data;
    } catch (e) {
        console.error('Fehler beim Laden der Diagramm-Daten:', e);
        return null;
    }
}

async function showChart(type) {
    const chartsSection = document.getElementById('charts-section');
    const chartTitle = document.getElementById('chart-title');
    
    // Titel setzen
    const titles = {
        'schools': 'Schulen Förderung',
        'teachers': 'Lehrer-Registrierungen (14 Tage)', 
        'classes': 'Erstellte Klassen (14 Tage)',
        'students': 'Schüler-Logins (14 Tage)',
        'tcoins': 'T-Coins Verlauf (14 Tage)'
    };
    
    chartTitle.textContent = titles[type] || 'Diagramm';
    
    // Diagramm-Bereich anzeigen
    chartsSection.style.display = 'block';
    
    // Sanftes Scrollen, aber Statistik-Karten bleiben sichtbar
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
        const statsGridRect = statsGrid.getBoundingClientRect();
        const chartsSectionRect = chartsSection.getBoundingClientRect();
        
        // Scrollen nur wenn das Diagramm unter den Karten ist
        if (chartsSectionRect.top < statsGridRect.bottom) {
            chartsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }
    }
    
    // Daten laden und Diagramm erstellen
    const data = await loadChartData(type);
    if (data) {
        createChart(type, data);
        
        // Zweites Diagramm für Schulen anzeigen
        if (type === 'schools' && data.length > 1) {
            const secondChartContainer = document.getElementById('second-chart-container');
            secondChartContainer.style.display = 'block';
            createSecondChart(data[1]);
        } else {
            const secondChartContainer = document.getElementById('second-chart-container');
            secondChartContainer.style.display = 'none';
        }
    } else {
        // Fallback mit simulierten Daten
        createChart(type, null);
        const secondChartContainer = document.getElementById('second-chart-container');
        secondChartContainer.style.display = 'none';
    }
}

function hideChart() {
    const chartsSection = document.getElementById('charts-section');
    chartsSection.style.display = 'none';
    
    // Charts zerstören
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    if (secondChartInstance) {
        secondChartInstance.destroy();
        secondChartInstance = null;
    }
    
    // Zweites Diagramm verstecken
    const secondChartContainer = document.getElementById('second-chart-container');
    secondChartContainer.style.display = 'none';
}

function createChart(type, realData) {
    const chartContent = document.querySelector('.chart-content');
    
    // Canvas-Element wiederherstellen falls es durch Klassen-Statistik ersetzt wurde
    if (!chartContent.querySelector('canvas')) {
        chartContent.innerHTML = '<canvas id="main-chart"></canvas>';
    }
    
    const ctx = document.getElementById('main-chart').getContext('2d');
    
    // Chart zerstören falls vorhanden
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const fallbackData = window.dashboardData || {};
    
    let chartConfig = {};
    
    switch(type) {
        case 'schools':
            const schoolsData = (realData && realData[0]) || { total: fallbackData.schools || 0, with_funding: 0, without_funding: 0 };
            chartConfig = {
                type: 'doughnut',
                data: {
                    labels: ['Mit Förderung', 'Ohne Förderung'],
                    datasets: [{
                        data: [schoolsData.with_funding, schoolsData.without_funding],
                        backgroundColor: [
                            '#27ae60',
                            '#95a5a6'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            };
            break;
            
        case 'teachers':
            const teachersData = (realData && realData[0]) || { dates: [], counts: [] };
            chartConfig = {
                type: 'line',
                data: {
                    labels: teachersData.dates.length > 0 ? teachersData.dates : ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
                    datasets: [{
                        label: 'Neue Registrierungen',
                        data: teachersData.counts.length > 0 ? teachersData.counts : [2, 5, 3, 7, 4],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#ecf0f1'
                            },
                            title: {
                                display: true,
                                text: 'Anzahl Registrierungen'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Datum'
                            }
                        }
                    }
                }
            };
            break;
            
        case 'students':
            const studentsData = (realData && realData[0]) || { dates: [], logins: [] };
            chartConfig = {
                type: 'line',
                data: {
                    labels: studentsData.dates.length > 0 ? studentsData.dates : ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
                    datasets: [{
                        label: 'Schüler-Logins',
                        data: studentsData.logins.length > 0 ? studentsData.logins : [15, 22, 18, 25, 20],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2ecc71',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#ecf0f1'
                            },
                            title: {
                                display: true,
                                text: 'Anzahl Logins'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Datum'
                            }
                        }
                    }
                }
            };
            break;
            
        case 'classes':
            const classesData = (realData && realData[0]) || { dates: [], counts: [] };
            chartConfig = {
                type: 'line',
                data: {
                    labels: classesData.dates.length > 0 ? classesData.dates : ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
                    datasets: [{
                        label: 'Erstellte Klassen',
                        data: classesData.counts.length > 0 ? classesData.counts : [0, 0, 0, 0, 0],
                        borderColor: '#8e44ad',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#8e44ad',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#ecf0f1'
                            },
                            title: {
                                display: true,
                                text: 'Anzahl Klassen'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Datum'
                            }
                        }
                    }
                }
            };
            break;
            
        case 'tcoins':
            const tcoinsData = (realData && realData[0]) || { dates: [], tcoins: [] };
            chartConfig = {
                type: 'line',
                data: {
                    labels: tcoinsData.dates.length > 0 ? tcoinsData.dates : ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
                    datasets: [{
                        label: 'T-Coins',
                        data: tcoinsData.tcoins.length > 0 ? tcoinsData.tcoins : [0, 0, 0, 0, 0],
                        borderColor: '#ffa000',
                        backgroundColor: 'rgba(155, 89, 182, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ffa000',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#ecf0f1'
                            },
                            title: {
                                display: true,
                                text: 'Anzahl T-Coins'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Datum'
                            }
                        }
                    }
                }
            };
            break;
    }
    
    chartInstance = new Chart(ctx, chartConfig);
}

function createSecondChart(timelineData) {
    const ctx = document.getElementById('second-chart').getContext('2d');
    
    // Chart zerstören falls vorhanden
    if (secondChartInstance) {
        secondChartInstance.destroy();
    }
    
    const chartConfig = {
        type: 'line',
        data: {
            labels: timelineData.dates.length > 0 ? timelineData.dates : ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'],
            datasets: [{
                label: 'Neue Schulen',
                data: timelineData.counts.length > 0 ? timelineData.counts : [1, 2, 0, 3, 1],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#ecf0f1'
                    },
                    title: {
                        display: true,
                        text: 'Anzahl Schulen'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Datum'
                    }
                }
            }
        }
    };
    
    secondChartInstance = new Chart(ctx, chartConfig);
}

async function loadUpcomingEvents() {
    try {
        const res = await fetch('/api/infowebinar/get_upcoming_webinars_from_calendly.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const eventsContent = document.getElementById('upcoming-events-content');
        
        if (data.success && data.webinars && data.webinars.length > 0) {
            eventsContent.innerHTML = data.webinars.map(webinar => `
                <div class="event-item">
                    <div class="event-header">
                        <div class="event-title-section">
                            <span class="event-name">${escapeHtml(webinar.event_name || 'Infowebinar')}</span>
                            <span class="event-date">${escapeHtml(webinar.webinar_date_formatted)}</span>
                        </div>
                        <span class="event-count">${webinar.participation_count} Anmeldung${webinar.participation_count !== 1 ? 'en' : ''}</span>
                        ${webinar.location ? `
                            <a href="${escapeHtml(webinar.location)}" target="_blank" rel="noopener noreferrer" class="event-location-link">
                                <i class="fas fa-video"></i>
                            </a>
                        ` : '<span class="event-location-placeholder"></span>'}
                    </div>
                </div>
            `).join('');
        } else {
            eventsContent.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Keine anstehenden Termine</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der anstehenden Termine:', e);
        document.getElementById('upcoming-events-content').innerHTML = `
            <div class="error-events">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Termine</span>
            </div>
        `;
    }
}

async function loadMessages() {
    try {
        const res = await fetch('/api/messages/get_messages.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const messagesContent = document.getElementById('messages-content');
        const messageCount = document.getElementById('message-count');
        
        messageCount.textContent = data.total_unread || 0;
        
        if (data.messages && data.messages.length > 0) {
            messagesContent.innerHTML = data.messages.map(msg => `
                <div class="message-item clickable" data-thread-id="${msg.thread_id}" data-receiver="${msg.sender || 0}">
                    <div class="message-header">
                        <i class="fas fa-user-circle text-info"></i>
                        <span class="sender-name">${msg.sender_name || 'Unbekannt'}</span>
                        <small class="message-time">${msg.time_ago}</small>
                    </div>
                    <div class="message-text">${msg.title || msg.message}</div>
                </div>
            `).join('');
            
            // Click-Handler für Nachrichten hinzufügen
            messagesContent.querySelectorAll('.message-item.clickable').forEach(item => {
                item.addEventListener('click', function() {
                    const threadId = parseInt(this.getAttribute('data-thread-id'));
                    const receiver = parseInt(this.getAttribute('data-receiver'));
                    openThreadModal(threadId, receiver);
                });
                item.style.cursor = 'pointer';
            });
        } else {
            messagesContent.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Keine ausstehenden Nachrichten</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Nachrichten:', e);
        document.getElementById('messages-content').innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Nachrichten</span>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCounts();
    loadUpcomingEvents();
    loadMessages();
    
    // Event Listener für Statistik-Karten
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const type = this.classList[1]; // schools, teachers, classes, students
            showChart(type);
        });
        
        // Hover-Effekt für bessere UX
        card.style.cursor = 'pointer';
    });
    
    // Event Listener für Schließen-Button
    document.getElementById('close-chart').addEventListener('click', hideChart);
    
    // Diagramm schließen bei Klick außerhalb
    document.getElementById('charts-section').addEventListener('click', function(e) {
        if (e.target === this) {
            hideChart();
        }
    });
    
    // Nachrichten alle 30 Sekunden aktualisieren
    setInterval(loadMessages, 30000);
    
    // Modal Event Listener
    document.getElementById('close-thread-modal')?.addEventListener('click', closeThreadModal);
    document.getElementById('cancel-reply')?.addEventListener('click', closeThreadModal);
    document.getElementById('send-reply')?.addEventListener('click', sendReply);
    
    // Modal schließen bei Klick außerhalb
    const threadModal = document.getElementById('message-thread-modal');
    if (threadModal) {
        threadModal.addEventListener('click', function(e) {
            if (e.target === threadModal) {
                closeThreadModal();
            }
        });
    }
    
    // Admin-Modal Event Listener
    const createAdminBtn = document.getElementById('create-admin-btn');
    const adminModal = document.getElementById('create-admin-modal');
    const closeAdminModal = document.getElementById('close-admin-modal');
    const cancelAdmin = document.getElementById('cancel-admin');
    const submitAdmin = document.getElementById('submit-admin');
    const adminForm = document.getElementById('create-admin-form');
    
    if (createAdminBtn) {
        createAdminBtn.addEventListener('click', function() {
            adminModal.style.display = 'flex';
            adminForm.reset();
            document.getElementById('admin-error').style.display = 'none';
        });
    }
    
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', closeAdminModalFunc);
    }
    
    if (cancelAdmin) {
        cancelAdmin.addEventListener('click', closeAdminModalFunc);
    }
    
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                closeAdminModalFunc();
            }
        });
    }
    
    if (submitAdmin) {
        submitAdmin.addEventListener('click', handleAdminSubmit);
    }
    
    function closeAdminModalFunc() {
        adminModal.style.display = 'none';
        adminForm.reset();
        document.getElementById('admin-error').style.display = 'none';
    }
    
    async function handleAdminSubmit() {
        const firstName = document.getElementById('admin-first-name').value.trim();
        const lastName = document.getElementById('admin-last-name').value.trim();
        const salutation = document.getElementById('admin-salutation').value;
        const email = document.getElementById('admin-email').value.trim();
        const phone = document.getElementById('admin-phone').value.trim();
        const password = document.getElementById('admin-password').value;
        const passwordConfirm = document.getElementById('admin-password-confirm').value;
        const terms = document.getElementById('admin-terms').checked;
        const errorDiv = document.getElementById('admin-error');
        
        // Validierung
        if (!firstName || !lastName || !salutation || !email || !phone || !password || !passwordConfirm) {
            errorDiv.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (!terms) {
            errorDiv.textContent = 'Bitte akzeptieren Sie die Teilnahmebedingungen und Datenschutzbestimmungen.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // E-Mail-Validierung
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Telefon-Validierung
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone) || phone.length < 6) {
            errorDiv.textContent = 'Bitte geben Sie eine gültige Telefonnummer ein.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Passwort-Validierung
        if (password.length < 6) {
            errorDiv.textContent = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Passwort-Bestätigung
        if (password !== passwordConfirm) {
            errorDiv.textContent = 'Die Passwörter stimmen nicht überein.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Button deaktivieren
        submitAdmin.disabled = true;
        submitAdmin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird angelegt...';
        errorDiv.style.display = 'none';
        
        try {
            const response = await fetch('/api/auth/create_admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    salutation: salutation,
                    email: email,
                    phone: phone,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Erfolgreich angelegt
                alert('Admin erfolgreich angelegt!');
                closeAdminModalFunc();
                // Optional: Seite neu laden oder Liste aktualisieren
                window.location.reload();
            } else {
                // Fehler anzeigen
                errorDiv.textContent = data.error || 'Admin konnte nicht angelegt werden';
                errorDiv.style.display = 'block';
                submitAdmin.disabled = false;
                submitAdmin.innerHTML = 'Admin anlegen';
            }
        } catch (error) {
            errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
            errorDiv.style.display = 'block';
            submitAdmin.disabled = false;
            submitAdmin.innerHTML = 'Admin anlegen';
        }
    }
});

let currentThreadId = null;
let currentReceiver = null;

async function openThreadModal(threadId, receiver) {
    currentThreadId = threadId;
    currentReceiver = receiver;
    const modal = document.getElementById('message-thread-modal');
    const threadMessages = document.getElementById('thread-messages');
    const replyText = document.getElementById('reply-text');
    const replyHint = document.getElementById('reply-hint');
    
    modal.style.display = 'flex';
    threadMessages.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Konversation...</span>
        </div>
    `;
    replyText.value = '';
    replyHint.style.display = 'none';
    
    // Thread laden
    try {
        const res = await fetch('/api/messages/get_message_thread.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });
        
        if (!res.ok) throw new Error('HTTP ' + res.status);
        
        const data = await res.json();
        
        const modalHeader = modal.querySelector('.modal-header h3');
        
        if (data.messages && data.messages.length > 0) {
            // Titel aus der ersten Nachricht holen (falls vorhanden)
            const threadTitle = data.messages[0].title || null;
            if (threadTitle) {
                modalHeader.innerHTML = `<i class="fas fa-comments"></i> ${escapeHtml(threadTitle)}`;
            } else {
                modalHeader.innerHTML = '<i class="fas fa-comments"></i> Konversation';
            }
            
            threadMessages.innerHTML = data.messages.map(msg => `
                <div class="thread-message ${msg.is_admin ? 'admin-message' : 'user-message'}">
                    <div class="thread-message-header">
                        <div class="thread-message-author">
                            <i class="fas ${msg.is_admin ? 'fa-user-shield' : 'fa-user-circle'}"></i>
                            <span class="thread-sender-name">${msg.sender_name || 'Admin'}</span>
                        </div>
                        <small class="thread-message-time">${msg.time_ago}</small>
                    </div>
                    <div class="thread-message-text">${escapeHtml(msg.message)}</div>
                </div>
            `).join('');
            
            // Zum Ende scrollen
            threadMessages.scrollTop = threadMessages.scrollHeight;
        } else {
            modalHeader.innerHTML = '<i class="fas fa-comments"></i> Konversation';
            threadMessages.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Keine Nachrichten gefunden</span>
                </div>
            `;
        }
        
        // Nachrichtenliste aktualisieren
        loadMessages();
    } catch (e) {
        console.error('Fehler beim Laden des Threads:', e);
        threadMessages.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Konversation</span>
            </div>
        `;
    }
}

function closeThreadModal() {
    const modal = document.getElementById('message-thread-modal');
    modal.style.display = 'none';
    currentThreadId = null;
    currentReceiver = null;
}

async function sendReply() {
    const replyText = document.getElementById('reply-text');
    const replyHint = document.getElementById('reply-hint');
    const message = (replyText.value || '').trim();
    
    if (message.length < 5) {
        replyHint.textContent = 'Bitte mindestens 5 Zeichen eingeben.';
        replyHint.style.display = 'block';
        return;
    }
    
    if (currentThreadId === null || currentReceiver === null) {
        replyHint.textContent = 'Fehler: Thread-Informationen fehlen.';
        replyHint.style.display = 'block';
        return;
    }
    
    try {
        const res = await fetch('/api/messages/reply_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId,
                receiver: currentReceiver
            })
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Senden');
        }
        
        // Thread neu laden
        replyText.value = '';
        replyHint.style.display = 'none';
        
        // Thread erneut laden
        await openThreadModal(currentThreadId, currentReceiver);
    } catch (e) {
        replyHint.textContent = 'Senden fehlgeschlagen: ' + e.message;
        replyHint.style.display = 'block';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}