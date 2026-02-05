class InfowebinarManager {
    constructor() {
        this.currentParticipationId = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadParticipations();
    }

    bindEvents() {
        // Modal Event Listeners werden in showInfowebinarModal gesetzt
    }

    async loadParticipations() {
        const content = document.getElementById('infowebinar-content');
        if (!content) return;

        content.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i><span>Lade Anmeldungen...</span></div>';

        try {
            const response = await fetch('/api/infowebinar/get_all_participations.php');
            const data = await response.json();

            if (data.success && data.participations) {
                if (data.participations.length === 0) {
                    content.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-video"></i>
                            <p>Keine Anmeldungen gefunden</p>
                        </div>
                    `;
                    return;
                }

                // Gruppiere nach Datum
                const groupedByDate = {};
                data.participations.forEach(participation => {
                    const date = new Date(participation.webinar_date);
                    const dateKey = date.toLocaleDateString('de-DE', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                    });
                    
                    if (!groupedByDate[dateKey]) {
                        groupedByDate[dateKey] = [];
                    }
                    groupedByDate[dateKey].push(participation);
                });

                // Sortiere Daten
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                    return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'));
                });

                let html = '<div class="participations-list">';
                
                sortedDates.forEach(dateKey => {
                    const participations = groupedByDate[dateKey];
                    // Sortiere nach Uhrzeit
                    participations.sort((a, b) => {
                        return new Date(a.webinar_date) - new Date(b.webinar_date);
                    });

                    html += `
                        <div class="date-group">
                            <h2 class="date-header">
                                <i class="fas fa-calendar-day"></i>
                                ${dateKey}
                            </h2>
                            <div class="participations-grid">
                    `;

                    participations.forEach(participation => {
                        const webinarDateTime = new Date(participation.webinar_date);
                        const timeStr = webinarDateTime.toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        const createdAt = new Date(participation.created_at);
                        const createdAtStr = createdAt.toLocaleDateString('de-DE', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        html += `
                            <div class="participation-card ${participation.participated ? 'participated' : ''}">
                                <div class="participation-header">
                                    <div class="participation-time">
                                        <i class="fas fa-clock"></i>
                                        ${timeStr}
                                    </div>
                                    <div class="participation-status">
                                        ${participation.participated === true ? 
                                            '<span class="status-badge participated-badge"><i class="fas fa-check-circle"></i> Teilgenommen</span>' : 
                                            participation.participated === false ?
                                            '<span class="status-badge not-participated-badge"><i class="fas fa-times-circle"></i> Nicht teilgenommen</span>' :
                                            '<span class="status-badge pending-badge"><i class="fas fa-clock"></i> Noch nicht bewertet</span>'
                                        }
                                    </div>
                                </div>
                                <div class="participation-body">
                                    <div class="participation-info">
                                        <div class="info-row">
                                            <strong>Lehrer:</strong> ${this.escapeHtml(participation.teacher_name)}
                                        </div>
                                        <div class="info-row">
                                            <strong>E-Mail:</strong> ${this.escapeHtml(participation.teacher_email)}
                                        </div>
                                        ${participation.school_name ? `
                                        <div class="info-row">
                                            <strong>Schule:</strong> ${this.escapeHtml(participation.school_name)}
                                        </div>
                                        ` : ''}
                                        <div class="info-row">
                                            <strong>Angemeldet am:</strong> ${createdAtStr}
                                        </div>
                                    </div>
                                    <div class="participation-actions">
                                        <button class="btn-participated ${participation.participated === true ? 'active' : ''}" 
                                                onclick="infowebinarManager.markParticipated(${participation.id}, ${participation.teacher_id}, '${participation.webinar_date}')"
                                                ${participation.participated === true ? 'disabled' : ''}>
                                            <i class="fas fa-check-circle"></i>
                                            Teilgenommen
                                        </button>
                                        <button class="btn-not-participated ${participation.participated === false ? 'active' : ''}" 
                                                onclick="infowebinarManager.markNotParticipated(${participation.id}, ${participation.teacher_id})"
                                                ${participation.participated === false ? 'disabled' : ''}>
                                            <i class="fas fa-times-circle"></i>
                                            Nicht teilgenommen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    html += `
                            </div>
                        </div>
                    `;
                });

                html += '</div>';
                content.innerHTML = html;
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Fehler beim Laden der Anmeldungen'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Anmeldungen:', error);
            content.innerHTML = `
                <div class="error-message">
                    Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
                </div>
            `;
        }
    }

    async markParticipated(participationId, teacherId, webinarDate) {
        // Öffne Modal für Datum/Zeit-Eingabe
        this.currentParticipationId = participationId;
        this.currentTeacherId = teacherId;
        this.currentWebinarDate = webinarDate;
        this.showInfowebinarModal();
    }

    async markNotParticipated(participationId, teacherId) {
        // Direkt als nicht teilgenommen markieren
        await this.updateParticipation(participationId, false, null, teacherId);
    }

    showInfowebinarModal() {
        const modal = document.getElementById('infowebinar-modal');
        const dateInput = document.getElementById('infowebinar-date');
        const timeInput = document.getElementById('infowebinar-time');
        
        if (!modal || !dateInput || !timeInput) {
            console.error('Info-Webinar Modal Elemente nicht gefunden');
            return;
        }
        
        // Setze Datum und Uhrzeit aus webinar_date
        if (this.currentWebinarDate) {
            const webinarDate = new Date(this.currentWebinarDate);
            const year = webinarDate.getFullYear();
            const month = String(webinarDate.getMonth() + 1).padStart(2, '0');
            const day = String(webinarDate.getDate()).padStart(2, '0');
            const hours = String(webinarDate.getHours()).padStart(2, '0');
            const minutes = String(webinarDate.getMinutes()).padStart(2, '0');
            
            dateInput.value = `${year}-${month}-${day}`;
            timeInput.value = `${hours}:${minutes}`;
        } else {
            // Aktuelles Datum als Standard setzen
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            dateInput.value = `${year}-${month}-${day}`;
            timeInput.value = `${hours}:${minutes}`;
        }
        
        modal.style.display = 'flex';
        
        // Event-Listener für Klick außerhalb
        this.infowebinarModalMouseDownHandler = (e) => {
            if (e.target === modal) {
                this.infowebinarModalMouseDownTarget = modal;
            } else {
                this.infowebinarModalMouseDownTarget = null;
            }
        };
        
        this.infowebinarModalClickHandler = (e) => {
            if (e.target === modal && this.infowebinarModalMouseDownTarget === modal) {
                this.closeInfowebinarModal();
            }
        };
        
        modal.addEventListener('mousedown', this.infowebinarModalMouseDownHandler);
        modal.addEventListener('click', this.infowebinarModalClickHandler);
        
        setTimeout(() => {
            dateInput.focus();
        }, 100);
    }

    closeInfowebinarModal() {
        const modal = document.getElementById('infowebinar-modal');
        if (modal) {
            modal.style.display = 'none';
            
            if (this.infowebinarModalClickHandler) {
                modal.removeEventListener('click', this.infowebinarModalClickHandler);
                this.infowebinarModalClickHandler = null;
            }
            if (this.infowebinarModalMouseDownHandler) {
                modal.removeEventListener('mousedown', this.infowebinarModalMouseDownHandler);
                this.infowebinarModalMouseDownHandler = null;
            }
            this.infowebinarModalMouseDownTarget = null;
        }
    }

    async confirmInfowebinar() {
        const dateInput = document.getElementById('infowebinar-date');
        const timeInput = document.getElementById('infowebinar-time');
        
        if (!dateInput || !timeInput) {
            console.error('Info-Webinar Modal Input-Elemente nicht gefunden');
            return;
        }
        
        const selectedDate = dateInput.value;
        const selectedTime = timeInput.value;
        
        if (!selectedDate || !selectedTime) {
            alert('Bitte wählen Sie ein Datum und eine Uhrzeit aus.');
            return;
        }
        
        // Datum und Uhrzeit kombinieren
        const selectedDateTime = `${selectedDate} ${selectedTime}`;
        
        // Modal schließen
        this.closeInfowebinarModal();
        
        // API aufrufen
        await this.updateParticipation(this.currentParticipationId, true, selectedDateTime, this.currentTeacherId);
    }

    async updateParticipation(participationId, participated, infowebinarDatetime, teacherId = null) {
        try {
            const response = await fetch('/api/infowebinar/update_participation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participation_id: participationId,
                    participated: participated,
                    infowebinar_datetime: infowebinarDatetime,
                    teacher_id: teacherId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Seite neu laden um aktualisierte Daten zu zeigen
                await this.loadParticipations();
            } else {
                console.error('Fehler beim Aktualisieren der Teilnahme');
                alert(data.error || 'Fehler beim Aktualisieren der Teilnahme');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async exportToXLSX() {
        try {
            // Lade alle Anmeldungen
            const response = await fetch('/api/infowebinar/get_all_participations.php');
            const data = await response.json();
            
            if (!data.success || !data.participations) {
                alert('Fehler beim Laden der Daten');
                return;
            }
            
            // Definiere Spalten für den Export
            const columns = [
                { key: 'webinar_date', label: 'Webinar-Datum' },
                { key: 'teacher_name', label: 'Lehrer' },
                { key: 'teacher_email', label: 'E-Mail' },
                { key: 'school_name', label: 'Schule' },
                { key: 'participated', label: 'Teilgenommen' },
                { key: 'created_at', label: 'Angemeldet am' }
            ];
            
            // Bereite Daten für Export vor
            const exportData = data.participations.map(participation => {
                const webinarDate = new Date(participation.webinar_date);
                const createdAt = new Date(participation.created_at);
                
                let participatedText = 'Noch nicht bewertet';
                if (participation.participated === true) {
                    participatedText = 'Ja';
                } else if (participation.participated === false) {
                    participatedText = 'Nein';
                }
                
                return {
                    webinar_date: webinarDate.toLocaleDateString('de-DE') + ' ' + webinarDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'}),
                    teacher_name: participation.teacher_name || '',
                    teacher_email: participation.teacher_email || '',
                    school_name: participation.school_name || '',
                    participated: participatedText,
                    created_at: createdAt.toLocaleDateString('de-DE') + ' ' + createdAt.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})
                };
            });
            
            // Exportiere
            const filename = `Infowebinar_Anmeldungen_${new Date().toISOString().split('T')[0]}`;
            window.exportToXLSX(exportData, columns, filename);
        } catch (error) {
            console.error('Export-Fehler:', error);
            alert('Fehler beim Exportieren: ' + error.message);
        }
    }
}

// Globale Instanz
let infowebinarManager;

// Initialisiere Manager wenn Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    infowebinarManager = new InfowebinarManager();
});

