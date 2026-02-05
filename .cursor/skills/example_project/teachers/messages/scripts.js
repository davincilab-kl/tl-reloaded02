let currentThreadId = null;
let currentReceiver = null;
let currentTab = 'active'; // 'active' oder 'archived'

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

async function loadThreads(archived = false) {
    try {
        const userId = await getTeacherUserId();
        const res = await fetch('/api/messages/get_all_threads.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                archived: archived,
                user_id: userId
            }),
            cache: 'no-store'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const threadsList = document.getElementById('threads-list');
        
        if (data.threads && data.threads.length > 0) {
            threadsList.innerHTML = data.threads.map(thread => {
                const isUnread = thread.last_message_read === 0;
                const isFromAdmin = thread.last_message_sender_role === 'admin';
                const preview = thread.last_message_text.length > 100 
                    ? thread.last_message_text.substring(0, 100) + '...' 
                    : thread.last_message_text;
                
                // Verwende den Namen des letzten Absenders
                const displayName = thread.last_message_sender_name || thread.thread_user_name || 'TalentsLounge-Team';
                
                return `
                    <div class="thread-item ${isUnread ? 'unread' : ''}" 
                         data-thread-id="${thread.thread_id}" 
                         data-receiver="${thread.receiver_id || 0}">
                        <div class="thread-item-header">
                            <div class="thread-item-info">
                                ${thread.thread_title ? `<div class="thread-title">
                                    ${isUnread ? '<i class="fas fa-circle unread-icon"></i>' : ''}
                                    ${escapeHtml(thread.thread_title)}
                                </div>` : ''}
                                <span class="thread-sender">
                                    <i class="fas ${isFromAdmin ? 'fa-user-shield' : 'fa-user-circle'}"></i>
                                    ${displayName}
                                </span>
                                <span class="thread-time">${thread.time_ago}</span>
                            </div>
                            <div class="thread-item-meta">
                                <span class="message-count-badge">${thread.message_count} ${thread.message_count === 1 ? 'Nachricht' : 'Nachrichten'}</span>
                                ${currentTab === 'active' 
                                    ? `<button class="btn-delete-thread" onclick="event.stopPropagation(); archiveThread(${thread.thread_id})" title="Ins Archiv verschieben">
                                        <i class="fas fa-archive"></i>
                                    </button>`
                                    : `<button class="btn-restore-thread" onclick="event.stopPropagation(); restoreThread(${thread.thread_id})" title="Wiederherstellen">
                                        <i class="fas fa-undo"></i>
                                    </button>`
                                }
                            </div>
                        </div>
                        <div class="thread-preview">${escapeHtml(preview)}</div>
                    </div>
                `;
            }).join('');
            
            // Click-Handler für Threads hinzufügen
            threadsList.querySelectorAll('.thread-item').forEach(item => {
                item.addEventListener('click', function() {
                    const threadId = parseInt(this.getAttribute('data-thread-id'));
                    const receiver = parseInt(this.getAttribute('data-receiver'));
                    openThreadModal(threadId, receiver);
                });
            });
        } else {
            threadsList.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Keine Nachrichten vorhanden</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Threads:', e);
        document.getElementById('threads-list').innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Nachrichten</span>
            </div>
        `;
    }
}

async function openThreadModal(threadId, receiver) {
    currentThreadId = threadId;
    currentReceiver = receiver;
    const modal = document.getElementById('message-thread-modal');
    const threadMessages = document.getElementById('thread-messages');
    const replyText = document.getElementById('reply-text');
    const replyHint = document.getElementById('reply-hint');
    const archiveBtn = document.getElementById('delete-thread-btn');
    const sendReply = document.getElementById('send-reply');
    const modalHeader = modal.querySelector('.modal-header h3');
    
    // Button-Text anpassen je nach aktuellem Tab
    if (currentTab === 'active') {
        archiveBtn.innerHTML = '<i class="fas fa-archive"></i><span>Ins Archiv verschieben</span>';
        archiveBtn.className = 'btn-secondary btn-delete-thread';
        replyText.disabled = false;
        sendReply.disabled = false;
    } else {
        archiveBtn.innerHTML = '<i class="fas fa-undo"></i><span>Wiederherstellen</span>';
        archiveBtn.className = 'btn-secondary btn-restore-thread';
        replyText.disabled = true;
        sendReply.disabled = true;
    }
    
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
        
        // Threadsliste aktualisieren
        loadThreads(currentTab === 'archived');
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

async function archiveThread(threadId) {
    if (!confirm('Möchten Sie diesen Thread ins Archiv verschieben?')) {
        return;
    }
    
    try {
        const res = await fetch('/api/messages/delete_thread.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Archivieren');
        }
        
        // Modal schließen falls geöffnet
        if (currentThreadId === threadId) {
            closeThreadModal();
        }
        
        // Thread-Liste neu laden
        loadThreads(currentTab === 'archived');
    } catch (e) {
        alert('Fehler beim Archivieren: ' + e.message);
    }
}

async function restoreThread(threadId) {
    if (!confirm('Möchten Sie diesen Thread wiederherstellen?')) {
        return;
    }
    
    try {
        const res = await fetch('/api/messages/restore_thread.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Wiederherstellen');
        }
        
        // Modal schließen falls geöffnet
        if (currentThreadId === threadId) {
            closeThreadModal();
        }
        
        // Zum aktiven Tab wechseln und Threads laden
        currentTab = 'active';
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === 'active') {
                btn.classList.add('active');
            }
        });
        
        loadThreads(false);
    } catch (e) {
        alert('Fehler beim Wiederherstellen: ' + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadThreads(false);
    
    // Tab-Navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            currentTab = tab;
            
            // Tab-Buttons aktualisieren
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Threads laden
            loadThreads(tab === 'archived');
        });
    });
    
    // Modal Event Listener
    document.getElementById('close-thread-modal')?.addEventListener('click', closeThreadModal);
    document.getElementById('cancel-reply')?.addEventListener('click', closeThreadModal);
    document.getElementById('send-reply')?.addEventListener('click', sendReply);
    document.getElementById('delete-thread-btn')?.addEventListener('click', function() {
        if (currentThreadId !== null) {
            if (currentTab === 'active') {
                archiveThread(currentThreadId);
            } else {
                restoreThread(currentThreadId);
            }
        }
    });
    
    // Modal schließen bei Klick außerhalb
    const threadModal = document.getElementById('message-thread-modal');
    if (threadModal) {
        threadModal.addEventListener('click', function(e) {
            if (e.target === threadModal) {
                closeThreadModal();
            }
        });
    }
    
    // Threads alle 30 Sekunden aktualisieren
    setInterval(() => loadThreads(currentTab === 'archived'), 30000);
});

