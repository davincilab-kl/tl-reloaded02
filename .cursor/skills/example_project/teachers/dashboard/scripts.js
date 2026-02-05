async function loadTeacherStats() {
    try {
        const userId = await getTeacherUserId();
        if (!userId) {
            throw new Error('Keine User-ID gefunden');
        }
        
        const url = `/api/teachers/get_teacher_stats.php?user_id=${userId}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const statsContent = document.getElementById('teacher-stats-content');
        
        if (data.error) {
            statsContent.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(data.error)}</span>
                </div>
            `;
            return;
        }
        
        statsContent.innerHTML = `
            <div class="stat-row">
                <div class="stat-item-small">
                    <div class="stat-icon-small">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label-small">Klassen</div>
                        <div class="stat-value-small">${data.classes_count ?? 0}</div>
                    </div>
                </div>
                <div class="stat-item-small">
                    <div class="stat-icon-small">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label-small">Schüler</div>
                        <div class="stat-value-small">${data.students_count ?? 0}</div>
                    </div>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item-small">
                    <div class="stat-icon-small">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label-small">T!Score</div>
                        <div class="stat-value-small">${(data.avg_t_coins ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                    </div>
                </div>
                <div class="stat-item-small">
                    <div class="stat-icon-small">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label-small">Letzte Aktivität</div>
                        <div class="stat-value-small time-value">${escapeHtml(data.last_activity ?? 'Keine Aktivität')}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Fehler beim Laden der Lehrer-Statistiken:', e);
        document.getElementById('teacher-stats-content').innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Statistiken</span>
            </div>
        `;
    }
}

// Nachricht senden Modal Logik
function openMessageModal() {
    document.getElementById('message-modal').style.display = 'flex';
}

function closeMessageModal() {
    document.getElementById('message-modal').style.display = 'none';
    document.getElementById('message-text').value = '';
    document.getElementById('message-title').value = '';
    const hint = document.getElementById('message-hint');
    hint.textContent = '';
    hint.style.display = 'none';
}

function showSuccessMessage() {
    const messagesContent = document.getElementById('messages-content');
    const existingSuccess = messagesContent.querySelector('.success-message');
    
    if (existingSuccess) {
        return; // Erfolgsmeldung bereits vorhanden
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Nachricht erfolgreich an TalentsLounge-Team gesendet</span>
    `;
    
    // Erfolgsmeldung am Anfang einfügen
    const firstChild = messagesContent.firstChild;
    if (firstChild) {
        messagesContent.insertBefore(successDiv, firstChild);
    } else {
        messagesContent.appendChild(successDiv);
    }
}

async function sendMessage() {
    const textarea = document.getElementById('message-text');
    const titleInput = document.getElementById('message-title');
    const hint = document.getElementById('message-hint');
    const message = (textarea.value || '').trim();
    const title = (titleInput.value || '').trim();
    
    if (message.length < 5) {
        hint.textContent = 'Bitte mindestens 5 Zeichen eingeben.';
        hint.style.display = 'block';
        return;
    }
    
    try {
        const userId = await getTeacherUserId();
        const res = await fetch('/api/messages/send_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message,
                title: title || null,
                user_id: userId
            })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Senden');
        }
        closeMessageModal();
        showSuccessMessage();
        // Nachrichten neu laden, aber Erfolgsmeldung bleibt erhalten
        loadMessages();
    } catch (e) {
        hint.textContent = 'Senden fehlgeschlagen: ' + e.message;
        hint.style.display = 'block';
    }
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
    // Fallback auf localStorage
    return localStorage.getItem('teacher_user_id') || null;
}

async function loadMessages() {
    try {
        const userId = await getTeacherUserId();
        const url = userId ? `/api/messages/get_messages.php?user_id=${userId}` : '/api/messages/get_messages.php';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const messagesContent = document.getElementById('messages-content');
        const messageCount = document.getElementById('message-count');
        
        // Erfolgsmeldung speichern, falls vorhanden
        const existingSuccess = messagesContent.querySelector('.success-message');
        const successHtml = existingSuccess ? existingSuccess.outerHTML : null;
        
        messageCount.textContent = data.total_unread || 0;
        
        if (data.messages && data.messages.length > 0) {
            const messagesHtml = data.messages.map(msg => `
                <div class="message-item clickable" data-thread-id="${msg.thread_id}" data-receiver="${msg.sender || 0}">
                    <div class="message-header">
                        <i class="fas fa-user-circle text-info"></i>
                        <span class="sender-name">${msg.sender_name || 'TalentsLounge-Team'}</span>
                        <small class="message-time">${msg.time_ago}</small>
                    </div>
                    <div class="message-text">${msg.title || msg.message}</div>
                </div>
            `).join('');
            
            // Erfolgsmeldung wieder einfügen, falls vorhanden
            messagesContent.innerHTML = successHtml ? successHtml + messagesHtml : messagesHtml;
            
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
            // Erfolgsmeldung wieder einfügen, falls vorhanden
            const noMessagesHtml = `
                <div class="no-messages">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Keine ausstehenden Nachrichten</span>
                </div>
            `;
            messagesContent.innerHTML = successHtml ? successHtml + noMessagesHtml : noMessagesHtml;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Nachrichten:', e);
        const messagesContent = document.getElementById('messages-content');
        const existingSuccess = messagesContent.querySelector('.success-message');
        const successHtml = existingSuccess ? existingSuccess.outerHTML : null;
        
        const errorHtml = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Nachrichten</span>
            </div>
        `;
        messagesContent.innerHTML = successHtml ? successHtml + errorHtml : errorHtml;
    }
}

let currentThreadId = null;
let currentReceiver = null;

async function openThreadModal(threadId, receiver) {
    currentThreadId = threadId;
    currentReceiver = receiver;
    const modal = document.getElementById('message-thread-modal');
    const threadMessages = document.getElementById('thread-messages');
    const replyText = document.getElementById('reply-text');
    const replyHint = document.getElementById('reply-hint');
    const modalHeader = modal.querySelector('.modal-header h3');
    
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
        const userId = await getTeacherUserId();
        const res = await fetch('/api/messages/get_message_thread.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                thread_id: threadId,
                user_id: userId
            })
        });
        
        if (!res.ok) throw new Error('HTTP ' + res.status);
        
        const data = await res.json();
        
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
                            <span class="thread-sender-name">${msg.sender_name || (msg.is_admin ? 'TalentsLounge-Team' : 'Lehrer')}</span>
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
        modalHeader.innerHTML = '<i class="fas fa-comments"></i> Konversation';
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
        const userId = await getTeacherUserId();
        const res = await fetch('/api/messages/reply_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId,
                receiver: currentReceiver,
                user_id: userId
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

document.addEventListener('DOMContentLoaded', () => {
    loadTeacherStats();
    loadMessages();
    
    const modal = document.getElementById('message-modal');
    document.getElementById('open-message-modal').addEventListener('click', openMessageModal);
    document.getElementById('close-message-modal').addEventListener('click', closeMessageModal);
    document.getElementById('cancel-message').addEventListener('click', closeMessageModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeMessageModal(); });
    document.getElementById('send-message').addEventListener('click', sendMessage);
    
    // Thread Modal Event Listener
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
    
    // Nachrichten alle 30 Sekunden aktualisieren
    setInterval(loadMessages, 30000);
    
    // Schulstatus laden
    loadSchoolStatus();
});

// Schulstatus laden und anzeigen
async function loadSchoolStatus() {
    const statusWidget = document.getElementById('school-status-widget');
    const statusContent = document.getElementById('school-status-content');
    
    if (!statusWidget || !statusContent) return;
    
    try {
        const response = await fetch('/api/schools/get_school_details.php');
        const data = await response.json();
        
        if (data.success) {
            if (data.status === 'waitlist' && data.waitlist) {
                // Auf Warteliste
                const waitlist = data.waitlist;
                statusContent.innerHTML = `
                    <div class="school-status-message waitlist-message">
                        <div class="status-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="status-text">
                            <h3>Sie stehen auf der Warteliste</h3>
                            <p>Sie haben sich für die Schule <strong>${escapeHtml(waitlist.school_name || 'N/A')}</strong> auf die Warteliste gesetzt.</p>
                            <p class="status-hint">Bitte warten Sie, bis eine Lehrkraft der Schule Ihre Anfrage akzeptiert.</p>
                        </div>
                    </div>
                `;
                statusWidget.style.display = 'block';
            } else if (data.status === 'no_school') {
                // Keine Schule - hole teacher_id für den Link
                getTeacherIdForSchoolSelection().then(teacherId => {
                    const schoolSelectUrl = teacherId ? `/register/select_school.php?teacher_id=${teacherId}` : '/register/select_school.php';
                    statusContent.innerHTML = `
                        <div class="school-status-message no-school-message">
                            <div class="status-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="status-text">
                                <h3>Keine Schule zugewiesen</h3>
                                <p>Sie haben noch keine Schule ausgewählt. Bitte wählen Sie eine Schule aus, um fortzufahren.</p>
                                <a href="${schoolSelectUrl}" class="btn-select-school">
                                    <i class="fas fa-school"></i>
                                    Schule auswählen
                                </a>
                            </div>
                        </div>
                    `;
                    statusWidget.style.display = 'block';
                }).catch(() => {
                    statusContent.innerHTML = `
                        <div class="school-status-message no-school-message">
                            <div class="status-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="status-text">
                                <h3>Keine Schule zugewiesen</h3>
                                <p>Sie haben noch keine Schule ausgewählt. Bitte wählen Sie eine Schule aus, um fortzufahren.</p>
                                <a href="/register/select_school.php" class="btn-select-school">
                                    <i class="fas fa-school"></i>
                                    Schule auswählen
                                </a>
                            </div>
                        </div>
                    `;
                    statusWidget.style.display = 'block';
                });
                return;
            } else {
                // Schule zugewiesen - Widget ausblenden
                statusWidget.style.display = 'none';
            }
        } else {
            // Fehler - Widget ausblenden
            statusWidget.style.display = 'none';
        }
    } catch (error) {
        console.error('Fehler beim Laden des Schulstatus:', error);
        statusWidget.style.display = 'none';
    }
}


