// Helper-Funktion: User-ID aus Session holen
async function getTeacherUserId() {
    try {
        const userResponse = await fetch('/api/auth/get_current_user.php');
        const userData = await userResponse.json();
        if (userData.success && userData.user_id) {
            return userData.user_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der User-ID:', error);
    }
    return null;
}

// Helper-Funktion: Teacher-ID für Schulauswahl holen
async function getTeacherIdForSchoolSelection() {
    try {
        const userResponse = await fetch('/api/auth/get_current_user.php');
        const userData = await userResponse.json();
        if (userData.success && userData.role === 'teacher' && userData.role_id) {
            return userData.role_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Teacher-ID:', error);
    }
    return null;
}

// Overview Page
async function loadSchoolOverview() {
    const content = document.getElementById('school-overview-content');
    if (!content) return;
    
    try {
            const response = await fetch('/api/schools/get_school_details.php');
            const data = await response.json();
            
            if (data.success) {
                if (data.status === 'waitlist' && data.waitlist) {
                    // Auf Warteliste
                    const waitlist = data.waitlist;
                    content.innerHTML = `
                        <div class="waitlist-info-card">
                            <div class="waitlist-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h2>Sie stehen auf der Warteliste</h2>
                            <p class="waitlist-message">
                                Sie haben sich für folgende Schule auf die Warteliste gesetzt:
                            </p>
                            <div class="waitlist-school-info">
                                <div class="waitlist-school-name">
                                    <i class="fas fa-school"></i>
                                    ${escapeHtml(waitlist.school_name || 'N/A')}
                                </div>
                                <div class="waitlist-school-details">
                                    ${waitlist.school_bundesland ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(waitlist.school_bundesland)}</span>` : ''}
                                    ${waitlist.school_ort ? `<span><i class="fas fa-map-pin"></i> ${escapeHtml(waitlist.school_ort)}</span>` : ''}
                                </div>
                                <div class="waitlist-date">
                                    <i class="fas fa-calendar"></i>
                                    Anfrage gestellt am ${new Date(waitlist.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <p class="waitlist-hint">
                                Bitte warten Sie, bis eine Lehrkraft der Schule Ihre Anfrage akzeptiert.
                            </p>
                        </div>
                    `;
                } else if (data.status === 'no_school') {
                    // Keine Schule, nicht auf Warteliste
                    // Hole teacher_id für den Link
                    getTeacherIdForSchoolSelection().then(teacherId => {
                        const schoolSelectUrl = teacherId ? `/register/select_school.php?teacher_id=${teacherId}` : '/register/select_school.php';
                        content.innerHTML = `
                            <div class="no-school-info-card">
                                <div class="no-school-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <h2>Keine Schule zugewiesen</h2>
                                <p class="no-school-message">
                                    Sie haben noch keine Schule ausgewählt. Bitte wählen Sie eine Schule aus, um fortzufahren.
                                </p>
                                <a href="${schoolSelectUrl}" class="btn-select-school">
                                    <i class="fas fa-school"></i>
                                    Schule auswählen
                                </a>
                            </div>
                        `;
                    }).catch(() => {
                        content.innerHTML = `
                            <div class="no-school-info-card">
                                <div class="no-school-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <h2>Keine Schule zugewiesen</h2>
                                <p class="no-school-message">
                                    Sie haben noch keine Schule ausgewählt. Bitte wählen Sie eine Schule aus, um fortzufahren.
                                </p>
                                <a href="/register/select_school.php" class="btn-select-school">
                                    <i class="fas fa-school"></i>
                                    Schule auswählen
                                </a>
                            </div>
                        `;
                    });
                    return;
                } else if (data.status === 'assigned' && data.school) {
                    // Schule zugewiesen - normale Ansicht
                    const school = data.school;
                    const foerderung = school.foerderung || false;
                    
                    // Lade Infowebinar-Anmeldungen
                    let participationsHtml = '';
                    try {
                        const participationsResponse = await fetch('/api/infowebinar/get_participations.php');
                        const participationsData = await participationsResponse.json();
                        
                        if (participationsData.success && participationsData.participations && participationsData.participations.length > 0) {
                            participationsHtml = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ffc107;"><strong style="color: #856404; display: block; margin-bottom: 10px;">Ihre Anmeldungen:</strong><ul style="margin: 0; padding-left: 20px; color: #856404;">';
                            participationsData.participations.forEach(participation => {
                                const date = new Date(participation.webinar_date);
                                const dateStr = date.toLocaleDateString('de-DE', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                const participated = participation.participated ? ' <span style="color: #28a745;">(Teilgenommen)</span>' : ' <span style="color: #dc3545;">(Noch nicht teilgenommen)</span>';
                                participationsHtml += `<li>${dateStr}${participated}</li>`;
                            });
                            participationsHtml += '</ul></div>';
                        }
                    } catch (error) {
                        console.error('Fehler beim Laden der Anmeldungen:', error);
                    }
                    
                    // Baue Adress-HTML zusammen (untereinander)
                    let addressHtml = '';
                    if (school.strasse) {
                        addressHtml += `<div class="address-line">${escapeHtml(school.strasse)}</div>`;
                    }
                    const plzOrt = [];
                    if (school.plz) plzOrt.push(escapeHtml(school.plz));
                    if (school.ort) plzOrt.push(escapeHtml(school.ort));
                    if (plzOrt.length > 0) {
                        addressHtml += `<div class="address-line">${plzOrt.join(' ')}</div>`;
                    }
                    if (school.bundesland) {
                        addressHtml += `<div class="address-line">${escapeHtml(school.bundesland)}</div>`;
                    }
                    if (!addressHtml) {
                        addressHtml = '<div class="address-line">Nicht angegeben</div>';
                    }
                    
                    // Baue Schulname mit Typ und Art
                    let schoolNameDisplay = escapeHtml(school.name || 'N/A');
                    const typeAndArt = [];
                    if (school.schultyp) typeAndArt.push(escapeHtml(school.schultyp));
                    if (school.schulart) typeAndArt.push(escapeHtml(school.schulart));
                    if (typeAndArt.length > 0) {
                        schoolNameDisplay += ` <span class="school-type-art">(${typeAndArt.join(', ')})</span>`;
                    }
                    
                    content.innerHTML = `
                        ${!foerderung ? `
                            <div class="foerderung-warning-card">
                                <div>
                                    <div class="foerderung-warning-icon">
                                        <i class="fas fa-info-circle"></i>
                                    </div>
                                    <div class="foerderung-warning-content">
                                        <h3>Schule noch nicht freigeschaltet</h3>
                                        <p>
                                            Mindestens eine Lehrkraft muss an einem Infowebinar teilnehmen, damit die Schule freigeschaltet wird.
                                        </p>
                                        <button class="btn-infowebinar" onclick="openInfowebinarModal()">
                                            <i class="fas fa-calendar-check"></i>
                                            Zu Infowebinar anmelden
                                        </button>
                                        ${participationsHtml}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="school-header">
                            <h2 class="school-name">${schoolNameDisplay}</h2>
                        </div>
                        
                        <div class="school-info-grid">
                            <div class="school-address-card">
                                <div class="card-header-small">
                                    <h3><i class="fas fa-map-marker-alt"></i> Adresse</h3>
                                    <button class="edit-btn" id="edit-address-btn" title="Adresse ändern">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                </div>
                                <div class="address-content">
                                    ${addressHtml}
                                </div>
                            </div>
                            
                            <div class="school-stats-card">
                                <div class="card-header-small">
                                    <h3><i class="fas fa-chart-bar"></i> Statistiken</h3>
                                </div>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                                        <div class="stat-info">
                                            <div class="stat-value">${school.teacher_count || 0}</div>
                                            <div class="stat-label">Lehrkräfte</div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                                        <div class="stat-info">
                                            <div class="stat-value">${school.class_count || 0}</div>
                                            <div class="stat-label">Klassen</div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
                                        <div class="stat-info">
                                            <div class="stat-value">${school.student_count || 0}</div>
                                            <div class="stat-label">Schüler</div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-icon"><i class="fas fa-coins"></i></div>
                                        <div class="stat-info">
                                            <div class="stat-value">${school.avg_t_coins || 0}</div>
                                            <div class="stat-label">Ø TCoins</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Event-Listener für Adresse bearbeiten
                    const editAddressBtn = document.getElementById('edit-address-btn');
                    if (editAddressBtn) {
                        editAddressBtn.addEventListener('click', () => {
                            openAddressEditModal(school);
                        });
                    }
                } else {
                    content.innerHTML = `
                        <div class="error-message">
                            ${data.error || 'Fehler beim Laden der Schulinformationen'}
                        </div>
                    `;
                }
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Fehler beim Laden der Schulinformationen'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Schulinformationen:', error);
            if (content) {
                content.innerHTML = `
                    <div class="error-message">
                        Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
                    </div>
                `;
            }
        }
    }

// Adressbearbeitungs-Modal
function openAddressEditModal(school) {
    // Erstelle Modal falls es noch nicht existiert
    let modal = document.getElementById('address-edit-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'address-edit-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-map-marker-alt"></i> Adresse bearbeiten</h3>
                <button class="modal-close" id="close-address-modal" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 25px;">
                <form id="address-edit-form">
                    <div class="form-group">
                        <label for="address-strasse">Straße</label>
                        <input type="text" id="address-strasse" name="strasse" value="${escapeHtml(school.strasse || '')}" placeholder="z.B. Musterstraße 123">
                    </div>
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="address-plz">PLZ</label>
                            <input type="text" id="address-plz" name="plz" value="${escapeHtml(school.plz || '')}" placeholder="z.B. 12345" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label for="address-ort">Ort</label>
                            <input type="text" id="address-ort" name="ort" value="${escapeHtml(school.ort || '')}" placeholder="z.B. Berlin">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="address-bundesland">Bundesland</label>
                        <input type="text" id="address-bundesland" name="bundesland" value="${escapeHtml(school.bundesland || '')}" placeholder="z.B. Berlin">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-address-edit">Abbrechen</button>
                        <button type="submit" class="btn-primary">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Event-Listener
    document.getElementById('close-address-modal').addEventListener('click', () => closeAddressEditModal());
    document.getElementById('cancel-address-edit').addEventListener('click', () => closeAddressEditModal());
    document.getElementById('address-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveAddress(school.id);
    });
    
    // Modal schließen bei Klick außerhalb
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddressEditModal();
        }
    });
}

function closeAddressEditModal() {
    const modal = document.getElementById('address-edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function saveAddress(schoolId) {
    const strasse = document.getElementById('address-strasse').value.trim();
    const plz = document.getElementById('address-plz').value.trim();
    const ort = document.getElementById('address-ort').value.trim();
    const bundesland = document.getElementById('address-bundesland').value.trim();
    
    if (!ort || !bundesland) {
        alert('Ort und Bundesland sind Pflichtfelder.');
        return;
    }
    
    const submitBtn = document.querySelector('#address-edit-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gespeichert...';
    
    try {
        // Lade aktuelle Schuldaten
        const schoolResponse = await fetch('/api/schools/get_school_details.php');
        const schoolData = await schoolResponse.json();
        
        if (!schoolData.success || !schoolData.school) {
            throw new Error('Fehler beim Laden der Schuldaten');
        }
        
        const currentSchool = schoolData.school;
        
        // Aktualisiere mit neuen Adressdaten
        const updateResponse = await fetch('/api/schools/update_school.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: schoolId,
                name: currentSchool.name,
                bundesland: bundesland,
                ort: ort,
                strasse: strasse,
                plz: plz,
                schulart: currentSchool.schulart || '',
                foerderung: currentSchool.foerderung || false
            })
        });
        
        const result = await updateResponse.json();
        
        if (updateResponse.ok && result.success) {
            closeAddressEditModal();
            loadSchoolOverview(); // Neu laden
        } else {
            alert(result.error || 'Fehler beim Speichern der Adresse');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

if (document.getElementById('school-overview-content')) {
    loadSchoolOverview();
}

// Teachers Page
if (document.getElementById('teachers-content')) {
    // Tab-Funktionalität
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update Buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update Contents
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${targetTab}-content`).classList.add('active');
            
            // Load content
            if (targetTab === 'teachers') {
                loadTeachers();
            } else if (targetTab === 'waitlist') {
                loadWaitlist();
            }
        });
    });
    
    async function loadTeachers() {
        const content = document.getElementById('teachers-content');
        content.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i><span>Lade Lehrkräfte...</span></div>';
        
        try {
            const response = await fetch('/api/teachers/get_teachers_by_current_school.php');
            const data = await response.json();
            
            if (data.success && data.teachers) {
                if (data.teachers.length === 0) {
                    content.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>Keine Lehrkräfte gefunden</p>
                        </div>
                    `;
                } else {
                    const teachersHtml = data.teachers.map(teacher => `
                        <div class="teacher-item">
                            <div class="teacher-info">
                                <div class="teacher-name">
                                    ${escapeHtml(teacher.name)}
                                    ${teacher.admin ? '<span style="color: #e74c3c; margin-left: 10px;">(Admin)</span>' : ''}
                                </div>
                                <div class="teacher-email">${escapeHtml(teacher.email)}</div>
                                <div class="teacher-stats">
                                    <div class="teacher-stat">
                                        <i class="fas fa-chalkboard-teacher"></i>
                                        <span>${teacher.class_count} Klassen</span>
                                    </div>
                                    <div class="teacher-stat">
                                        <i class="fas fa-user-graduate"></i>
                                        <span>${teacher.student_count} Schüler</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    content.innerHTML = `
                        <div class="teachers-list">
                            ${teachersHtml}
                        </div>
                    `;
                }
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Fehler beim Laden der Lehrkräfte'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Lehrkräfte:', error);
            content.innerHTML = `
                <div class="error-message">
                    Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
                </div>
            `;
        }
    }
    
    async function loadWaitlist() {
        const content = document.getElementById('waitlist-content');
        content.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i><span>Lade Warteliste...</span></div>';
        
        try {
            const response = await fetch('/api/teachers/get_waitlist.php');
            const data = await response.json();
            
            if (data.success && data.waitlist) {
                if (data.waitlist.length === 0) {
                    content.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-clipboard-list"></i>
                            <p>Keine Einträge auf der Warteliste</p>
                        </div>
                    `;
                } else {
                    const waitlistHtml = data.waitlist.map(item => `
                        <div class="waitlist-item">
                            <div class="waitlist-info">
                                <div class="waitlist-name">${escapeHtml(item.teacher_name)}</div>
                                <div class="waitlist-email">${escapeHtml(item.teacher_email)}</div>
                                <div class="waitlist-date">
                                    <i class="fas fa-clock"></i>
                                    Anfrage vom ${new Date(item.created_at).toLocaleDateString('de-DE')}
                                </div>
                            </div>
                            <button class="btn-accept" data-waitlist-id="${item.id}">
                                <i class="fas fa-check"></i>
                                Akzeptieren
                            </button>
                        </div>
                    `).join('');
                    
                    content.innerHTML = `
                        <div class="teachers-list">
                            ${waitlistHtml}
                        </div>
                    `;
                    
                    // Event-Listener für Akzeptieren-Buttons hinzufügen
                    content.querySelectorAll('.btn-accept').forEach(button => {
                        button.addEventListener('click', function() {
                            const waitlistId = parseInt(this.getAttribute('data-waitlist-id'));
                            acceptWaitlistEntry(waitlistId, this);
                        });
                    });
                }
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Fehler beim Laden der Warteliste'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Warteliste:', error);
            content.innerHTML = `
                <div class="error-message">
                    Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
                </div>
            `;
        }
    }
    
    async function acceptWaitlistEntry(waitlistId, button) {
        if (!confirm('Möchten Sie diese Lehrkraft wirklich akzeptieren?')) {
            return;
        }
        
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird verarbeitet...';
        
        try {
            const response = await fetch('/api/teachers/accept_waitlist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    waitlist_id: waitlistId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Warteliste neu laden
                loadWaitlist();
                // Auch Lehrkräfte-Liste neu laden
                loadTeachers();
            } else {
                alert(data.error || 'Fehler beim Akzeptieren der Anfrage');
                button.disabled = false;
                button.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Fehler beim Akzeptieren:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }
    
    // Initial load
    loadTeachers();
}

// Infowebinar Modal Funktionen
function openInfowebinarModal() {
    const modal = document.getElementById('infowebinar-modal');
    if (!modal) {
        console.error('Infowebinar Modal nicht gefunden');
        return;
    }
    modal.style.display = 'flex';
    // Lade Anmeldungen beim Öffnen des Modals
    loadInfowebinarParticipations();
}

function closeInfowebinarModal() {
    const modal = document.getElementById('infowebinar-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Lade Infowebinar-Anmeldungen
async function loadInfowebinarParticipations() {
    try {
        const response = await fetch('/api/infowebinar/get_participations.php');
        const data = await response.json();
        
        if (data.success && data.participations) {
            // Anmeldungen werden in der Schulübersicht angezeigt
            // Diese Funktion wird von loadSchoolOverview verwendet
        }
    } catch (error) {
        console.error('Fehler beim Laden der Anmeldungen:', error);
    }
}

// Event Listeners für Infowebinar Modal
if (document.getElementById('infowebinar-modal')) {
    document.getElementById('close-infowebinar-modal')?.addEventListener('click', closeInfowebinarModal);
    
    // Modal schließen bei Klick außerhalb
    const infowebinarModal = document.getElementById('infowebinar-modal');
    if (infowebinarModal) {
        infowebinarModal.addEventListener('click', function(e) {
            if (e.target === infowebinarModal) {
                closeInfowebinarModal();
            }
        });
    }
}

// Helper-Funktion: HTML escapen
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Einladungs-Funktionalität
if (document.getElementById('invite-teachers-btn')) {
    const inviteBtn = document.getElementById('invite-teachers-btn');
    const invitationsView = document.getElementById('invitations-view');
    const teachersTabsView = document.getElementById('teachers-tabs-view');
    
    let isInvitationsViewActive = false;
    
    inviteBtn.addEventListener('click', function() {
        if (isInvitationsViewActive) {
            showTeachersTabsView();
        } else {
            showInvitationsView();
        }
    });
    
    function showInvitationsView() {
        isInvitationsViewActive = true;
        if (teachersTabsView) teachersTabsView.style.display = 'none';
        if (invitationsView) {
            invitationsView.style.display = 'block';
            loadInvitationsView();
        }
        // Button zu btn-secondary ändern
        inviteBtn.className = 'btn-secondary btn-invite-teachers';
        inviteBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Zurück zur Übersicht';
    }
    
    function showTeachersTabsView() {
        isInvitationsViewActive = false;
        if (invitationsView) invitationsView.style.display = 'none';
        if (teachersTabsView) teachersTabsView.style.display = 'block';
        // Button zurück zu btn-invite-teachers ändern
        inviteBtn.className = 'btn-primary btn-invite-teachers';
        inviteBtn.innerHTML = '<i class="fas fa-user-plus"></i> Lehrkräfte einladen';
    }
    
    async function loadInvitationsView() {
        const content = document.getElementById('invitations-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="invitations-cards">
                <div class="invitation-card" data-card="same_school">
                    <div class="invitation-card-header-content">
                        <i class="fas fa-school"></i>
                        <h3>Kolleg:innen meiner Schule</h3>
                    </div>
                    <p class="invitation-hint">direkt mit unserer Schule verbinden</p>
                    <div class="invitation-actions-collapsible" data-actions="same_school">
                        <div class="invitation-actions">
                            <button class="btn-primary" data-type="same_school">
                                <i class="fas fa-link"></i> Link kopieren
                            </button>
                            <p class="invitation-or">oder</p>
                            <div class="invitation-email-form">
                                <input type="email" class="invitation-email-input" data-type="same_school" placeholder="E-Mail-Adresse">
                                <button class="btn-primary" data-type="same_school">
                                    <i class="fas fa-paper-plane"></i> Link senden
                                </button>
                            </div>
                            <p class="invitation-email-hint">Hier eingegebene E-Mail-Adressen werden ausschließlich zum Versandt der Einladungs-E-Mail verwendet.</p>
                        </div>
                        <p class="invitation-or invitation-hint-bottom">Link bitte nicht an Schüler:innen oder schulfremde Personen weitergeben!</p>
                    </div>
                </div>
                
                <div class="invitation-card" data-card="other_school">
                    <div class="invitation-card-header-content">
                        <i class="fas fa-globe"></i>
                        <h3>Kolleg:innen anderer Schulen</h3>
                    </div>
                    <p class="invitation-hint">zur TalentsLounge einladen</p>
                    <div class="invitation-actions-collapsible" data-actions="other_school">
                        <div class="invitation-actions">
                            <button class="btn-primary" data-type="other_school">
                                <i class="fas fa-link"></i> Link kopieren
                            </button>
                            <p class="invitation-or">oder</p>
                            <div class="invitation-email-form">
                                <input type="email" class="invitation-email-input" data-type="other_school" placeholder="E-Mail-Adresse">
                                <button class="btn-primary" data-type="other_school">
                                    <i class="fas fa-paper-plane"></i> Link senden
                                </button>
                            </div>
                            <p class="invitation-email-hint">Hier eingegebene E-Mail-Adressen werden ausschließlich zum Versandt der Einladungs-E-Mail verwendet.</p>
                        </div>
                        <p class="invitation-or invitation-hint-bottom"></p>
                    </div>
                </div>
            </div>
        `;
        
        // Event-Listener für Ausklappen/Einklappen - gesamte Card klickbar
        content.querySelectorAll('.invitation-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Verhindere Auslösung bei Klick auf Buttons oder Inputs
                if (e.target.closest('button') || e.target.closest('input')) {
                    return;
                }
                
                const cardType = this.getAttribute('data-card');
                const actionsContainer = content.querySelector(`.invitation-actions-collapsible[data-actions="${cardType}"]`);
                
                if (actionsContainer) {
                    const isExpanded = actionsContainer.classList.contains('expanded');
                    if (isExpanded) {
                        actionsContainer.classList.remove('expanded');
                    } else {
                        actionsContainer.classList.add('expanded');
                    }
                }
            });
        });
        
        // Event-Listener für Link kopieren (Buttons mit "Link kopieren" Text)
        content.querySelectorAll('.btn-primary[data-type]').forEach(button => {
            const buttonText = button.textContent.trim();
            if (buttonText.includes('Link kopieren')) {
                button.addEventListener('click', function() {
                    const type = this.getAttribute('data-type');
                    copyInvitationLink(type, this);
                });
            }
        });
        
        // Event-Listener für E-Mail senden (Buttons mit "Link senden" Text)
        content.querySelectorAll('.btn-primary[data-type]').forEach(button => {
            const buttonText = button.textContent.trim();
            if (buttonText.includes('Link senden')) {
                button.addEventListener('click', function() {
                    const type = this.getAttribute('data-type');
                    const input = content.querySelector(`.invitation-email-input[data-type="${type}"]`);
                    const email = input ? input.value.trim() : '';
                    if (email) {
                        sendInvitationEmail(type, email, this);
                    } else {
                        showToast('Gib bitte eine gültige E-Mail-Adresse ein.', 'error');
                        if (input) input.focus();
                    }
                });
            }
        });
        
        // Enter-Taste für E-Mail-Eingabe
        content.querySelectorAll('.invitation-email-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const type = this.getAttribute('data-type');
                    const email = this.value.trim();
                    if (email) {
                        // Finde den "Link senden" Button für diesen Typ
                        const sendBtn = Array.from(content.querySelectorAll(`.btn-primary[data-type="${type}"]`))
                            .find(btn => btn.textContent.trim().includes('Link senden'));
                        if (sendBtn) sendBtn.click();
                    }
                }
            });
        });
    }
    
    async function copyInvitationLink(type, button) {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird geladen...';
        
        try {
            const response = await fetch('/api/teachers/generate_invitation_link.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    link_type: type
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.invitation_link) {
                try {
                    await navigator.clipboard.writeText(data.invitation_link);
                    showToast('Link erfolgreich in die Zwischenablage kopiert!', 'success');
                    button.innerHTML = '<i class="fas fa-check"></i> Kopiert!';
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }, 2000);
                } catch (err) {
                    // Fallback für ältere Browser
                    const textArea = document.createElement('textarea');
                    textArea.value = data.invitation_link;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showToast('Link erfolgreich in die Zwischenablage kopiert!', 'success');
                        button.innerHTML = '<i class="fas fa-check"></i> Kopiert!';
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.disabled = false;
                        }, 2000);
                    } catch (err2) {
                        showToast('Fehler beim Kopieren. Bitte kopieren Sie den Link manuell.', 'error');
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }
                    document.body.removeChild(textArea);
                }
            } else {
                showToast(data.error || 'Fehler beim Generieren des Links', 'error');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        } catch (error) {
            console.error('Fehler beim Kopieren des Links:', error);
            showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
    
    async function sendInvitationEmail(type, email, button) {
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }
        
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
        
        try {
            const response = await fetch('/api/teachers/send_invitation_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    link_type: type,
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Einladung erfolgreich versendet!', 'success');
                button.innerHTML = '<i class="fas fa-check"></i> Gesendet!';
                const input = document.querySelector(`.invitation-email-input[data-type="${type}"]`);
                if (input) input.value = '';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            } else {
                showToast(data.error || 'Fehler beim Versenden der E-Mail', 'error');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        } catch (error) {
            console.error('Fehler beim Versenden der E-Mail:', error);
            showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
    
    function showToast(message, type = 'info') {
        // Entferne bestehende Toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Entfernen nach 3 Sekunden
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

