class InfowebinarManager {
    constructor() {
        this.isSyncing = false;
        this.init();
    }

    async init() {
        await this.loadCalendlyEvents();
        this.bindRefreshButton();
        await this.loadLastSyncTime();
    }

    bindRefreshButton() {
        const refreshBtn = document.getElementById('refresh-calendly-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                // Standard: Letzte 30 Tage
                const minDate = new Date();
                minDate.setDate(minDate.getDate() - 30);
                this.syncCalendlyEvents(minDate);
            });
        }

        // Dropdown-Button
        const dropdownBtn = document.getElementById('refresh-calendly-dropdown-btn');
        const dropdown = document.getElementById('refresh-calendly-dropdown');
        if (dropdownBtn && dropdown) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            // Dropdown schließen bei Klick außerhalb
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== dropdownBtn) {
                    dropdown.style.display = 'none';
                }
            });
        }

        // "Alle aktualisieren" Button
        const syncAllBtn = document.getElementById('sync-all-btn');
        if (syncAllBtn) {
            syncAllBtn.addEventListener('click', () => {
                const minDateInput = document.getElementById('sync-min-date');
                let minDate = null;
                
                if (minDateInput && minDateInput.value) {
                    // datetime-local gibt lokales Datum zurück, new Date() interpretiert es als lokale Zeit
                    // toISOString() konvertiert automatisch zu UTC
                    minDate = new Date(minDateInput.value);
                }
                
                dropdown.style.display = 'none';
                this.syncCalendlyEvents(minDate);
            });
        }
    }

    async syncCalendlyEvents(minStartDate = null) {
        if (this.isSyncing) {
            return;
        }

        const refreshBtn = document.getElementById('refresh-calendly-btn');
        const dropdownBtn = document.getElementById('refresh-calendly-dropdown-btn');
        if (!refreshBtn) return;

        this.isSyncing = true;
        const originalHTML = refreshBtn.innerHTML;
        const originalDropdownHTML = dropdownBtn ? dropdownBtn.innerHTML : '';
        refreshBtn.disabled = true;
        if (dropdownBtn) dropdownBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Synchronisiere...</span>';

        try {
            // Erstelle URL mit min_start_time Parameter falls angegeben
            let url = '/api/infowebinar/sync_calendly_events.php';
            if (minStartDate) {
                // Konvertiere zu UTC ISO-Format wie von Calendly erwartet
                const isoDate = minStartDate.toISOString();
                url += `?min_start_time=${encodeURIComponent(isoDate)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                // Nach erfolgreicher Synchronisation Events neu laden
                await this.loadCalendlyEvents();
                
                // Letzten Sync-Zeitpunkt aktualisieren
                await this.loadLastSyncTime();
                
                // Erfolgsmeldung anzeigen
                const message = `Synchronisation abgeschlossen: ${data.new || 0} neue, ${data.updated || 0} aktualisierte Events`;
                this.showNotification(message, 'success');
            } else {
                this.showNotification(data.error || 'Fehler bei der Synchronisation', 'error');
            }
        } catch (error) {
            console.error('Fehler beim Synchronisieren:', error);
            this.showNotification('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
        } finally {
            this.isSyncing = false;
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = originalHTML;
            if (dropdownBtn) {
                dropdownBtn.disabled = false;
                dropdownBtn.innerHTML = originalDropdownHTML;
            }
        }
    }

    async loadLastSyncTime() {
        try {
            const response = await fetch('/api/infowebinar/get_last_sync_time.php');
            const data = await response.json();
            
            const lastSyncTimeElement = document.getElementById('last-sync-time');
            if (!lastSyncTimeElement) return;
            
            if (data.success && data.last_updated) {
                const lastUpdated = new Date(data.last_updated);
                const now = new Date();
                const diffMs = now - lastUpdated;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeText = '';
                if (diffMins < 1) {
                    timeText = 'gerade eben';
                } else if (diffMins < 60) {
                    timeText = `vor ${diffMins} Minute${diffMins !== 1 ? 'n' : ''}`;
                } else if (diffHours < 24) {
                    timeText = `vor ${diffHours} Stunde${diffHours !== 1 ? 'n' : ''}`;
                } else if (diffDays < 7) {
                    timeText = `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
                } else {
                    // Formatiere als Datum
                    timeText = lastUpdated.toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                lastSyncTimeElement.textContent = `Zuletzt aktualisiert: ${timeText}`;
                lastSyncTimeElement.style.display = 'block';
            } else {
                lastSyncTimeElement.textContent = 'Noch nicht aktualisiert';
                lastSyncTimeElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Fehler beim Laden des letzten Sync-Zeitpunkts:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Einfache Notification (kann später durch ein Toast-System ersetzt werden)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 0.9rem;
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async loadCalendlyEvents() {
        const content = document.getElementById('infowebinar-content');
        if (!content) return;

        content.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i><span>Lade Termine...</span></div>';

        try {
            const response = await fetch('/api/infowebinar/get_calendly_events.php');
            const data = await response.json();

            if (data.success) {
                let html = '';
                
                // Anstehende Events
                html += `
                    <div class="events-section">
                        <h2 class="events-section-title">
                            <i class="fas fa-calendar-check"></i> Anstehende Termine (${data.upcoming_count || 0})
                        </h2>
                `;
                
                if (data.upcoming_events && data.upcoming_events.length > 0) {
                    // Gruppiere nach Datum
                    const groupedByDate = {};
                    data.upcoming_events.forEach(event => {
                        const date = new Date(event.start_time);
                        const dateKey = date.toLocaleDateString('de-DE', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit' 
                        });
                        
                        if (!groupedByDate[dateKey]) {
                            groupedByDate[dateKey] = [];
                        }
                        groupedByDate[dateKey].push(event);
                    });
                    
                    // Sortiere Daten
                    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                        return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'));
                    });
                    
                    html += '<div class="events-list">';
                    
                    sortedDates.forEach(dateKey => {
                        const events = groupedByDate[dateKey];
                        
                        html += `
                            <div class="date-group">
                                <h3 class="date-group-header">
                                    <i class="fas fa-calendar-day"></i> ${dateKey}
                                </h3>
                                <div class="date-group-events">
                        `;
                        
                        events.forEach(event => {
                            html += `
                                <div class="event-card">
                                    <div class="event-header">
                                        <div class="event-time">
                                            <i class="fas fa-clock"></i> ${event.start_time_formatted}
                                        </div>
                                        <button class="btn btn-sm btn-secondary btn-edit-event" onclick="infowebinarManager.openEventEditModal(${event.id})">
                                            <i class="fas fa-edit"></i> Bearbeiten
                                        </button>
                                    </div>
                                    <div class="event-name">
                                        ${this.escapeHtml(event.name)}
                                    </div>
                            `;
                            
                            if (event.location) {
                                html += `
                                    <div>
                                        <a href="${this.escapeHtml(event.location)}" target="_blank" rel="noopener noreferrer" class="meeting-link">
                                            <i class="fas fa-video"></i>
                                            <span>Meeting beitreten</span>
                                        </a>
                                    </div>
                                `;
                            }
                            
                            if (event.invitees && event.invitees.length > 0) {
                                html += '<div class="invitees-list">';
                                event.invitees.forEach(invitee => {
                                    html += `
                                        <div class="invitee-item">
                                            <i class="fas fa-user"></i> ${this.escapeHtml(invitee.name)} 
                                            <span class="invitee-email">(${this.escapeHtml(invitee.email)})</span>
                                        </div>
                                    `;
                                });
                                html += '</div>';
                            } else {
                                html += '<div class="no-invitees">Kein Teilnehmer</div>';
                            }
                            
                            html += '</div>';
                        });
                        
                        html += `
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                } else {
                    html += '<div class="empty-state"><p>Keine anstehenden Termine</p></div>';
                }
                
                html += '</div>';
                
                // Vergangene Events
                html += `
                    <div class="events-section">
                        <h2 class="events-section-title">
                            <i class="fas fa-history"></i> Vergangene Termine (${data.past_count || 0})
                        </h2>
                `;
                
                if (data.past_events && data.past_events.length > 0) {
                    // Gruppiere nach Datum
                    const groupedByDate = {};
                    data.past_events.forEach(event => {
                        const date = new Date(event.start_time);
                        const dateKey = date.toLocaleDateString('de-DE', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit' 
                        });
                        
                        if (!groupedByDate[dateKey]) {
                            groupedByDate[dateKey] = [];
                        }
                        groupedByDate[dateKey].push(event);
                    });
                    
                    // Sortiere Daten (neueste zuerst)
                    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                        return new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-'));
                    });
                    
                    html += '<div class="events-list">';
                    
                    sortedDates.forEach(dateKey => {
                        const events = groupedByDate[dateKey];
                        
                        html += `
                            <div class="date-group">
                                <h3 class="date-group-header">
                                    <i class="fas fa-calendar-day"></i> ${dateKey}
                                </h3>
                                <div class="date-group-events">
                        `;
                        
                        events.forEach(event => {
                            html += `
                                <div class="event-card">
                                    <div class="event-header">
                                        <div class="event-time">
                                            <i class="fas fa-clock"></i> ${event.start_time_formatted}
                                        </div>
                                        <button class="btn btn-sm btn-secondary btn-edit-event" onclick="infowebinarManager.openEventEditModal(${event.id})">
                                            <i class="fas fa-edit"></i> Bearbeiten
                                        </button>
                                    </div>
                                    <div class="event-name">
                                        ${this.escapeHtml(event.name)}
                                    </div>
                            `;
                            
                            if (event.location) {
                                html += `
                                    <div>
                                        <a href="${this.escapeHtml(event.location)}" target="_blank" rel="noopener noreferrer" class="meeting-link">
                                            <i class="fas fa-video"></i>
                                            <span>Meeting beitreten</span>
                                        </a>
                                    </div>
                                `;
                            }
                            
                            if (event.invitees && event.invitees.length > 0) {
                                html += '<div class="invitees-list">';
                                event.invitees.forEach(invitee => {
                                    const attendedClass = invitee.attended === true ? 'attended' : invitee.attended === false ? 'not-attended' : 'not-set';
                                    const attendedIcon = invitee.attended === true ? 'check-circle' : invitee.attended === false ? 'times-circle' : 'question-circle';
                                    const attendedText = invitee.attended === true ? 'Anwesend' : invitee.attended === false ? 'Nicht anwesend' : 'Offen';
                                    
                                    html += `
                                        <div class="past-invitee-item">
                                            <div class="past-invitee-info">
                                                <i class="fas fa-user"></i> ${this.escapeHtml(invitee.name)} 
                                                <span class="invitee-email">(${this.escapeHtml(invitee.email)})</span>
                                            </div>
                                            <div class="past-invitee-actions">
                                                <span class="attendance-status ${attendedClass} attendance-status-inline">
                                                    <i class="fas fa-${attendedIcon}"></i>
                                                    <span>${attendedText}</span>
                                                </span>
                                                <div>
                                                    <button 
                                                        class="btn-attendance btn-attended btn-attendance-small btn-attended-small" 
                                                        data-attendee-id="${invitee.id}"
                                                        data-attended="true"
                                                        title="Als anwesend markieren">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button 
                                                        class="btn-attendance btn-not-attended btn-attendance-small btn-not-attended-small" 
                                                        data-attendee-id="${invitee.id}"
                                                        data-attended="false"
                                                        title="Als nicht anwesend markieren">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                });
                                html += '</div>';
                            } else {
                                html += '<div class="no-invitees">Kein Teilnehmer</div>';
                            }
                            
                            html += '</div>';
                        });
                        
                        html += `
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                } else {
                    html += '<div class="empty-state"><p>Keine vergangenen Termine</p></div>';
                }
                
                html += '</div>';
                
                content.innerHTML = html;
                
                // Event-Listener für Anwesenheits-Buttons
                document.querySelectorAll('.btn-attendance').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const attendeeId = parseInt(btn.getAttribute('data-attendee-id'));
                        const attended = btn.getAttribute('data-attended') === 'true';
                        this.updateAttendance(attendeeId, attended, btn);
                    });
                });
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Fehler beim Laden der Termine'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Termine:', error);
            content.innerHTML = `
                <div class="error-message">
                    Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
                </div>
            `;
        }
    }

    removeNewAttendeeCard(cardId) {
        const card = document.getElementById(`attendee-card-${cardId}`);
        if (card) {
            card.remove();
        }
    }

    async deleteAttendee(attendeeId, eventId) {
        // Bestätigung anzeigen
        if (!confirm('Möchten Sie diesen Teilnehmer wirklich löschen?')) {
            return;
        }

        try {
            const response = await fetch('/api/infowebinar/delete_attendee.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attendee_id: attendeeId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Teilnehmer gelöscht', 'success');
                
                // Entferne die Card aus dem Modal
                const attendeeCard = document.querySelector(`.attendee-form-card .attendance-buttons-group[data-attendee-id="${attendeeId}"]`)?.closest('.attendee-form-card');
                if (attendeeCard) {
                    attendeeCard.remove();
                }

                // Prüfe ob noch Teilnehmer vorhanden sind
                const attendeesList = document.querySelector('.attendees-list');
                if (attendeesList && attendeesList.querySelectorAll('.attendee-form-card').length === 0) {
                    attendeesList.innerHTML = '<div class="empty-state"><p>Keine Teilnehmer</p></div>';
                }

                // Aktualisiere die Event-Card auf der Hauptseite
                await this.updateEventCard(eventId);
            } else {
                this.showNotification(data.error || 'Fehler beim Löschen des Teilnehmers', 'error');
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            this.showNotification('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
        }
    }

    async updateAttendance(attendeeId, attended, buttonElement) {
        try {
            // Finde die Event-ID aus der Event-Card
            const eventCard = buttonElement.closest('.event-card');
            if (!eventCard) {
                console.error('Event-Card nicht gefunden');
                return;
            }

            // Finde den Edit-Button in der Card, um die Event-ID zu extrahieren
            const editButton = eventCard.querySelector('.btn-edit-event');
            if (!editButton) {
                console.error('Edit-Button nicht gefunden');
                return;
            }

            // Extrahiere Event-ID aus dem onclick-Attribut
            const onclickAttr = editButton.getAttribute('onclick');
            const eventIdMatch = onclickAttr.match(/openEventEditModal\((\d+)\)/);
            if (!eventIdMatch) {
                console.error('Event-ID nicht gefunden');
                return;
            }

            const eventId = parseInt(eventIdMatch[1]);

            const response = await fetch('/api/infowebinar/update_attendee_attendance.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attendee_id: attendeeId,
                    attended: attended
                })
            });

            const data = await response.json();

            if (data.success) {
                // Aktualisiere nur die Event-Card, nicht die ganze Seite
                await this.updateEventCard(eventId);
            } else {
                console.error('Fehler beim Aktualisieren der Anwesenheit');
                alert(data.error || 'Fehler beim Aktualisieren der Anwesenheit');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    async updateEventCard(eventId) {
        try {
            // Lade alle Events und finde das entsprechende Event
            const response = await fetch('/api/infowebinar/get_calendly_events.php');
            const data = await response.json();

            if (!data.success) {
                console.error('Fehler beim Laden der Events');
                return;
            }

            // Finde das Event in upcoming oder past events
            let event = null;
            if (data.upcoming_events) {
                event = data.upcoming_events.find(e => e.id === eventId);
            }
            if (!event && data.past_events) {
                event = data.past_events.find(e => e.id === eventId);
            }

            if (!event) {
                console.error('Event nicht gefunden');
                return;
            }

            // Finde die Event-Card im DOM (über den Button mit der Event-ID)
            const editButton = document.querySelector(`button.btn-edit-event[onclick*="openEventEditModal(${eventId})"]`);
            if (!editButton) {
                console.error('Event-Card nicht im DOM gefunden');
                return;
            }

            const eventCard = editButton.closest('.event-card');
            if (!eventCard) {
                console.error('Event-Card Container nicht gefunden');
                return;
            }

            // Erstelle den HTML-Inhalt für die Card
            let html = `
                <div class="event-header">
                    <div class="event-time">
                        <i class="fas fa-clock"></i> ${event.start_time_formatted}
                    </div>
                    <button class="btn btn-sm btn-secondary btn-edit-event" onclick="infowebinarManager.openEventEditModal(${event.id})">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                </div>
                <div class="event-name">
                    ${this.escapeHtml(event.name)}
                </div>
            `;

            if (event.location) {
                html += `
                    <div>
                        <a href="${this.escapeHtml(event.location)}" target="_blank" rel="noopener noreferrer" class="meeting-link">
                            <i class="fas fa-video"></i>
                            <span>Meeting beitreten</span>
                        </a>
                    </div>
                `;
            }

            if (event.invitees && event.invitees.length > 0) {
                html += '<div class="invitees-list">';
                event.invitees.forEach(invitee => {
                    // Prüfe ob es ein vergangenes Event ist (hat attended-Status)
                    if (invitee.attended !== undefined) {
                        const attendedClass = invitee.attended === true ? 'attended' : invitee.attended === false ? 'not-attended' : 'not-set';
                        const attendedIcon = invitee.attended === true ? 'check-circle' : invitee.attended === false ? 'times-circle' : 'question-circle';
                        const attendedText = invitee.attended === true ? 'Anwesend' : invitee.attended === false ? 'Nicht anwesend' : 'Offen';
                        
                        html += `
                            <div class="past-invitee-item">
                                <div class="past-invitee-info">
                                    <i class="fas fa-user"></i> ${this.escapeHtml(invitee.name)} 
                                    <span class="invitee-email">(${this.escapeHtml(invitee.email)})</span>
                                </div>
                                <div class="past-invitee-actions">
                                    <span class="attendance-status ${attendedClass} attendance-status-inline">
                                        <i class="fas fa-${attendedIcon}"></i>
                                        <span>${attendedText}</span>
                                    </span>
                                    <div>
                                        <button 
                                            class="btn-attendance btn-attended btn-attendance-small btn-attended-small" 
                                            data-attendee-id="${invitee.id}"
                                            data-attended="true"
                                            title="Als anwesend markieren">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button 
                                            class="btn-attendance btn-not-attended btn-attendance-small btn-not-attended-small" 
                                            data-attendee-id="${invitee.id}"
                                            data-attended="false"
                                            title="Als nicht anwesend markieren">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="invitee-item">
                                <i class="fas fa-user"></i> ${this.escapeHtml(invitee.name)} 
                                <span class="invitee-email">(${this.escapeHtml(invitee.email)})</span>
                            </div>
                        `;
                    }
                });
                html += '</div>';
            } else {
                html += '<div class="no-invitees">Kein Teilnehmer</div>';
            }

            // Aktualisiere die Card
            eventCard.innerHTML = html;

            // Event-Listener für Anwesenheits-Buttons neu hinzufügen
            eventCard.querySelectorAll('.btn-attendance').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const attendeeId = parseInt(btn.getAttribute('data-attendee-id'));
                    const attended = btn.getAttribute('data-attended') === 'true';
                    this.updateAttendance(attendeeId, attended, btn);
                });
            });
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Event-Card:', error);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async openEventEditModal(eventId) {
        const modal = document.getElementById('event-edit-modal');
        if (!modal) return;

        modal.classList.add('show');
        const modalBody = document.getElementById('event-edit-modal-body');
        modalBody.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i><span>Lade Event-Details...</span></div>';

        try {
            const response = await fetch(`/api/infowebinar/get_event_details.php?event_id=${eventId}`);
            const data = await response.json();

            if (data.success) {
                // Auto-Matching wird bereits im Backend durchgeführt
                // Die User-Zuordnung ist bereits in data.event.attendees enthalten
                this.renderEventEditModal(data.event);
            } else {
                modalBody.innerHTML = `<div class="error-message">${data.error || 'Fehler beim Laden der Event-Details'}</div>`;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Event-Details:', error);
            modalBody.innerHTML = '<div class="error-message">Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</div>';
        }
    }

    closeEventEditModal() {
        const modal = document.getElementById('event-edit-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    renderEventEditModal(event) {
        const modalTitle = document.getElementById('event-edit-modal-title');
        const modalBody = document.getElementById('event-edit-modal-body');

        modalTitle.textContent = `${event.name} - ${event.start_time_formatted}`;
        
        // Setze Event-ID als data-Attribut für späteren Zugriff
        modalBody.setAttribute('data-event-id', event.id);
        
        // Setze Event-ID als data-Attribut für späteren Zugriff
        modalBody.setAttribute('data-event-id', event.id);

        let html = `
            <div class="event-info-header">
                <div class="event-info-label">Event</div>
                <div class="event-info-name">${this.escapeHtml(event.name)}</div>
                <div class="event-info-time">
                    <i class="fas fa-calendar"></i> ${event.start_time_formatted}
                </div>
                ${event.location ? `
                    <div class="event-info-location">
                        <a href="${this.escapeHtml(event.location)}" target="_blank" rel="noopener noreferrer" class="event-info-location-link">
                            <i class="fas fa-video"></i>
                            <span>Meeting beitreten</span>
                        </a>
                    </div>
                ` : ''}
            </div>
            <div class="attendees-list">
        `;

        if (event.attendees && event.attendees.length > 0) {
            event.attendees.forEach(attendee => {
                const matchedUser = attendee.user;
                html += this.renderAttendeeForm(attendee, event.id, matchedUser);
            });
        } else {
            html += '<div class="empty-state"><p>Keine Teilnehmer</p></div>';
        }

        html += '</div>';
        
        // Button zum Hinzufügen neuer Teilnehmer (immer am Ende der Liste)
        html += `
            <div class="new-attendee-section">
                <button class="btn btn-secondary btn-show-new-attendee-form" 
                        data-event-id="${event.id}">
                    <i class="fas fa-user-plus"></i> Neuen Teilnehmer hinzufügen
                </button>
            </div>
        `;
        
        modalBody.innerHTML = html;

        // Event-Listener für User-Suche
        document.querySelectorAll('.user-search-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleUserSearch(e.target);
            });
        });

        // Event-Listener für zentralen Speichern-Button wird in saveAllAttendees gehandhabt

        // Event-Listener für "Neuen Teilnehmer hinzufügen" Button
        const showNewAttendeeFormBtn = document.querySelector('.btn-show-new-attendee-form');
        if (showNewAttendeeFormBtn) {
            showNewAttendeeFormBtn.addEventListener('click', () => {
                const eventId = showNewAttendeeFormBtn.getAttribute('data-event-id');
                if (eventId) {
                    this.addNewAttendeeCard(parseInt(eventId));
                }
            });
        }
    }

    renderAttendeeForm(attendee, eventId, matchedUser = null) {
        // Sicherstellen, dass attendee.id existiert
        if (!attendee || !attendee.id) {
            console.error('Attendee ohne ID:', attendee);
            return '';
        }

        const userDisplay = matchedUser 
            ? `${this.escapeHtml(matchedUser.first_name)} ${this.escapeHtml(matchedUser.last_name)} (${this.escapeHtml(matchedUser.email)})`
            : 'Kein User zugeordnet';

        const attendedState = attendee.attended === true ? 'attended' : attendee.attended === false ? 'not-attended' : 'open';

        return `
            <div class="attendee-form-card">
                <div class="attendee-header-collapsed" onclick="infowebinarManager.toggleAttendeeForm(${attendee.id})">
                    <div class="attendee-name-collapsed">
                        <i class="fas fa-user"></i> ${this.escapeHtml(attendee.name || 'Unbekannt')}
                    </div>
                    <div class="attendee-actions-collapsed">
                        <div class="attendance-buttons-group" data-attendee-id="${attendee.id}">
                            <button type="button" 
                                    class="attendance-btn attendance-btn-attended ${attendedState === 'attended' ? 'active' : ''}"
                                    data-attendee-id="${attendee.id}"
                                    data-value="true"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance(${attendee.id}, true, ${eventId})">
                                <i class="fas fa-check"></i> Anwesend
                            </button>
                            <button type="button" 
                                    class="attendance-btn attendance-btn-not-attended ${attendedState === 'not-attended' ? 'active' : ''}"
                                    data-attendee-id="${attendee.id}"
                                    data-value="false"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance(${attendee.id}, false, ${eventId})">
                                <i class="fas fa-times"></i> Abwesend
                            </button>
                            <button type="button" 
                                    class="attendance-btn attendance-btn-open ${attendedState === 'open' ? 'active' : ''}"
                                    data-attendee-id="${attendee.id}"
                                    data-value="null"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance(${attendee.id}, null, ${eventId})">
                                <i class="fas fa-question"></i> Offen
                            </button>
                        </div>
                        <button type="button" 
                                class="btn btn-sm btn-danger btn-delete-attendee" 
                                data-attendee-id="${attendee.id}"
                                data-event-id="${eventId}"
                                onclick="event.stopPropagation(); infowebinarManager.deleteAttendee(${attendee.id}, ${eventId})"
                                title="Teilnehmer löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                        <i class="fas fa-chevron-down attendee-toggle-icon" id="toggle-icon-${attendee.id}"></i>
                    </div>
                </div>
                
                <div class="attendee-form-expanded" id="attendee-form-${attendee.id}" style="display: none;">
                    <div class="form-group">
                        <label for="attendee_email_${attendee.id}">E-Mail</label>
                        <input type="email" 
                               class="form-input attendee-email-readonly" 
                               id="attendee_email_${attendee.id}"
                               value="${this.escapeHtml(attendee.email)}"
                               readonly>
                    </div>

                    <div class="form-group">
                        <label>User-Zuordnung</label>
                        <div class="user-search-container">
                            <input type="text" 
                                   class="form-input user-search-input" 
                                   id="user_search_${attendee.id}"
                                   placeholder="User suchen (Name)..."
                                   data-attendee-id="${attendee.id}"
                                   value="${matchedUser ? this.escapeHtml(userDisplay) : ''}"
                                   autocomplete="off">
                            <input type="hidden" 
                                   class="user-id-input" 
                                   id="user_id_${attendee.id}"
                                   value="${matchedUser ? matchedUser.id : ''}">
                            <div class="user-search-results" id="user_search_results_${attendee.id}"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="prognosis_class_count_${attendee.id}">Prognose Anzahl Klassen</label>
                        <input type="number" 
                               class="form-input" 
                               id="prognosis_class_count_${attendee.id}"
                               value="${attendee.prognosis_class_count || ''}"
                               min="0">
                    </div>

                    <div class="form-group">
                        <label for="prognosis_start_${attendee.id}">Prognose Start</label>
                        <input type="text" 
                               class="form-input" 
                               id="prognosis_start_${attendee.id}"
                               value="${this.escapeHtml(attendee.prognosis_start || '')}"
                               placeholder="z.B. Q1 2025, September 2025">
                    </div>

                    <div class="form-group">
                        <label for="notes_${attendee.id}">Notizen</label>
                        <textarea class="form-input" 
                                  id="notes_${attendee.id}"
                                  rows="3"
                                  placeholder="Formlose Notizen...">${this.escapeHtml(attendee.notes || '')}</textarea>
                    </div>

                </div>
            </div>
        `;
    }

    async handleUserSearch(inputElement) {
        const attendeeId = inputElement.getAttribute('data-attendee-id');
        const query = inputElement.value.trim();
        let resultsDiv;
        
        if (attendeeId === 'new') {
            resultsDiv = document.getElementById('new_attendee_user_search_results');
        } else {
            resultsDiv = document.getElementById(`user_search_results_${attendeeId}`);
        }

        if (!resultsDiv) {
            return;
        }

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/api/infowebinar/search_users.php?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success && data.users && data.users.length > 0) {
                let resultsHtml = '<div class="user-search-results-dropdown">';
                data.users.forEach(user => {
                    resultsHtml += `
                        <div class="user-search-result-item" 
                             data-user-id="${user.id}"
                             data-user-name="${this.escapeHtml(user.full_name)}"
                             data-user-email="${this.escapeHtml(user.email)}"
                             onclick="infowebinarManager.selectUser('${attendeeId}', ${user.id}, '${this.escapeHtml(user.full_name)}', '${this.escapeHtml(user.email)}')">
                            <div class="user-search-result-name">${this.escapeHtml(user.full_name)}</div>
                            <div class="user-search-result-email">${this.escapeHtml(user.email)}</div>
                        </div>
                    `;
                });
                resultsHtml += '</div>';
                resultsDiv.innerHTML = resultsHtml;
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = '<div class="user-search-no-results">Keine Ergebnisse</div>';
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Fehler bei der User-Suche:', error);
        }
    }

    selectUser(attendeeId, userId, userName, userEmail) {
        let searchInput, userIdInput, resultsDiv;
        
        if (attendeeId === 'new') {
            searchInput = document.getElementById('new_attendee_user_search');
            userIdInput = document.getElementById('new_attendee_user_id');
            resultsDiv = document.getElementById('new_attendee_user_search_results');
        } else {
            searchInput = document.getElementById(`user_search_${attendeeId}`);
            userIdInput = document.getElementById(`user_id_${attendeeId}`);
            resultsDiv = document.getElementById(`user_search_results_${attendeeId}`);
        }

        if (searchInput && userIdInput && resultsDiv) {
            searchInput.value = `${userName} (${userEmail})`;
            userIdInput.value = userId;
            resultsDiv.style.display = 'none';
        }
    }

    resetNewAttendeeForm() {
        // Setze alle Felder zurück
        const nameInput = document.getElementById('new_attendee_name');
        const emailInput = document.getElementById('new_attendee_email');
        const userSearchInput = document.getElementById('new_attendee_user_search');
        const userIdInput = document.getElementById('new_attendee_user_id');
        const prognosisClassCountInput = document.getElementById('new_attendee_prognosis_class_count');
        const prognosisStartInput = document.getElementById('new_attendee_prognosis_start');
        const notesInput = document.getElementById('new_attendee_notes');
        const userSearchResults = document.getElementById('new_attendee_user_search_results');
        
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (userSearchInput) userSearchInput.value = '';
        if (userIdInput) userIdInput.value = '';
        if (prognosisClassCountInput) prognosisClassCountInput.value = '';
        if (prognosisStartInput) prognosisStartInput.value = '';
        if (notesInput) notesInput.value = '';
        if (userSearchResults) {
            userSearchResults.innerHTML = '';
            userSearchResults.style.display = 'none';
        }
        
        // Setze Anwesenheits-Button auf "Offen" zurück
        const attendanceButtons = document.querySelectorAll('.attendance-buttons-group[data-attendee-id="new"] .attendance-btn');
        attendanceButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'null') {
                btn.classList.add('active');
            }
        });
        
        // Schließe das erweiterte Formular
        const formExpanded = document.getElementById('attendee-form-new');
        const toggleIcon = document.getElementById('toggle-icon-new');
        if (formExpanded) {
            formExpanded.style.display = 'none';
        }
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
        }
    }

    toggleAttendeeForm(attendeeId) {
        const formExpanded = document.getElementById(`attendee-form-${attendeeId}`);
        const toggleIcon = document.getElementById(`toggle-icon-${attendeeId}`);
        const attendeeCard = formExpanded?.closest('.attendee-form-card');
        const modalBody = document.getElementById('event-edit-modal-body');
        
        if (formExpanded && toggleIcon) {
            if (formExpanded.style.display === 'none') {
                formExpanded.style.display = 'block';
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-up');
                
                // Scroll zum Card-Header
                if (attendeeCard && modalBody) {
                    setTimeout(() => {
                        const cardHeader = attendeeCard.querySelector('.attendee-header-collapsed');
                        if (cardHeader) {
                            const modalContent = modalBody.closest('.modal-content');
                            if (modalContent) {
                                const headerRect = cardHeader.getBoundingClientRect();
                                const modalRect = modalContent.getBoundingClientRect();
                                const headerTop = headerRect.top;
                                const modalTop = modalRect.top;
                                const scrollOffset = headerTop - modalTop - 20; // 20px Abstand oben
                                
                                // Prüfe, ob wir nicht über das Ende des Modals hinaus scrollen
                                const maxScroll = modalContent.scrollHeight - modalContent.clientHeight;
                                const currentScroll = modalContent.scrollTop;
                                const targetScroll = Math.min(Math.max(0, currentScroll + scrollOffset), maxScroll);
                                
                                modalContent.scrollTo({
                                    top: targetScroll,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }, 50); // Kurze Verzögerung, damit das Display-Update abgeschlossen ist
                }
            } else {
                formExpanded.style.display = 'none';
                toggleIcon.classList.remove('fa-chevron-up');
                toggleIcon.classList.add('fa-chevron-down');
            }
        }
    }

    async setAttendance(attendeeId, attended, eventId) {
        // Aktualisiere Button-States
        const attendeeIdStr = String(attendeeId);
        const buttons = document.querySelectorAll(`.attendance-buttons-group[data-attendee-id="${attendeeIdStr}"] .attendance-btn`);
        buttons.forEach(btn => {
            btn.classList.remove('active');
            const btnValue = btn.getAttribute('data-value');
            if ((attended === true && btnValue === 'true') || 
                (attended === false && btnValue === 'false') || 
                (attended === null && btnValue === 'null')) {
                btn.classList.add('active');
            }
        });

        // Speichere direkt nur wenn es kein neuer Teilnehmer ist
        // Hinweis: Automatisches Speichern wurde entfernt - Speichern erfolgt über den zentralen Button
        // if (attendeeId !== 'new' && attendeeIdStr !== 'new') {
        //     await this.saveAttendeeInternal(attendeeId, eventId, false);
        // }
    }

    async saveAllAttendees() {
        const saveButton = document.getElementById('save-all-attendees-btn');
        if (!saveButton) return;

        const originalHTML = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere...';

        // Hole Event-ID aus dem Modal-Body
        const modalBody = document.getElementById('event-edit-modal-body');
        const eventId = modalBody?.getAttribute('data-event-id') || 
                       document.querySelector('.btn-show-new-attendee-form')?.getAttribute('data-event-id');
        
        if (!eventId) {
            this.showNotification('Event-ID nicht gefunden', 'error');
            saveButton.disabled = false;
            saveButton.innerHTML = originalHTML;
            return;
        }

        const errors = [];
        let hasChanges = false;
        let hasNewAttendees = false;

        // 1. Speichere zuerst alle neuen Teilnehmer (alle Cards mit IDs die mit "new_" beginnen)
        const allNewAttendeeCards = document.querySelectorAll('.attendee-form-card[id^="attendee-card-new_"]');
        
        for (const card of allNewAttendeeCards) {
            const cardId = card.id.replace('attendee-card-', '');
            const nameInput = document.getElementById(`new_attendee_name_${cardId}`);
            const emailInput = document.getElementById(`new_attendee_email_${cardId}`);
            
            if (nameInput && emailInput) {
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                
                if (name && email) {
                    try {
                        await this.saveAttendeeInternal(cardId, parseInt(eventId), true);
                        hasChanges = true;
                        hasNewAttendees = true;
                    } catch (error) {
                        errors.push(`Fehler beim Hinzufügen: ${error.message}`);
                    }
                }
            }
        }

        // 2. Speichere alle bestehenden Teilnehmer
        const existingAttendeeForms = document.querySelectorAll('.attendee-form-card');
        for (const form of existingAttendeeForms) {
            const attendeeId = form.querySelector('.attendance-buttons-group')?.getAttribute('data-attendee-id');
            // Überspringe neue Teilnehmer (IDs die mit "new" beginnen oder "new" sind)
            if (!attendeeId || attendeeId === 'new' || (typeof attendeeId === 'string' && attendeeId.startsWith('new_'))) continue;

            try {
                await this.saveAttendeeInternal(parseInt(attendeeId), parseInt(eventId), false);
                hasChanges = true;
            } catch (error) {
                errors.push(`Fehler bei Teilnehmer ${attendeeId}: ${error.message}`);
            }
        }

        saveButton.disabled = false;
        saveButton.innerHTML = originalHTML;

        if (errors.length > 0) {
            this.showNotification(`Fehler: ${errors.join(', ')}`, 'error');
        } else if (hasChanges) {
            this.showNotification('Alle Änderungen gespeichert', 'success');
            
            // Aktualisiere die Event-Card auf der Hauptseite
            await this.updateEventCard(parseInt(eventId));
            
            // Wenn neue Teilnehmer hinzugefügt wurden, lade das Modal neu
            if (hasNewAttendees) {
                await this.openEventEditModal(parseInt(eventId));
            }
        } else {
            this.showNotification('Keine Änderungen zum Speichern', 'info');
        }
    }

    addNewAttendeeCard(eventId) {
        const attendeesList = document.querySelector('.attendees-list');
        const newAttendeeSection = document.querySelector('.new-attendee-section');
        
        if (!attendeesList || !newAttendeeSection) return;

        // Erstelle eine neue Card mit eindeutiger ID
        const cardId = 'new_' + Date.now();
        const newCardHtml = `
            <div class="attendee-form-card" id="attendee-card-${cardId}">
                <div class="attendee-header-collapsed" onclick="infowebinarManager.toggleAttendeeForm('${cardId}')">
                    <div class="attendee-name-collapsed">
                        <i class="fas fa-user"></i>
                        <input type="text" 
                               class="form-input attendee-name-input" 
                               id="new_attendee_name_${cardId}"
                               placeholder="Vor- und Nachname"
                               required
                               onclick="event.stopPropagation();">
                    </div>
                    <div class="attendee-actions-collapsed">
                        <div class="attendance-buttons-group" data-attendee-id="${cardId}">
                            <button type="button" 
                                    class="attendance-btn attendance-btn-attended"
                                    data-attendee-id="${cardId}"
                                    data-value="true"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance('${cardId}', true, ${eventId})">
                                <i class="fas fa-check"></i> Anwesend
                            </button>
                            <button type="button" 
                                    class="attendance-btn attendance-btn-not-attended"
                                    data-attendee-id="${cardId}"
                                    data-value="false"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance('${cardId}', false, ${eventId})">
                                <i class="fas fa-times"></i> Abwesend
                            </button>
                            <button type="button" 
                                    class="attendance-btn attendance-btn-open active"
                                    data-attendee-id="${cardId}"
                                    data-value="null"
                                    onclick="event.stopPropagation(); infowebinarManager.setAttendance('${cardId}', null, ${eventId})">
                                <i class="fas fa-question"></i> Offen
                            </button>
                        </div>
                        <button type="button" 
                                class="btn btn-sm btn-danger btn-delete-attendee" 
                                data-card-id="${cardId}"
                                onclick="event.stopPropagation(); infowebinarManager.removeNewAttendeeCard('${cardId}')"
                                title="Teilnehmer entfernen">
                            <i class="fas fa-trash"></i>
                        </button>
                        <i class="fas fa-chevron-down attendee-toggle-icon" id="toggle-icon-${cardId}"></i>
                    </div>
                </div>
                
                <div class="attendee-form-expanded" id="attendee-form-${cardId}" style="display: none;">
                    <div class="form-group">
                        <label for="new_attendee_email_${cardId}">E-Mail *</label>
                        <input type="email" 
                               class="form-input" 
                               id="new_attendee_email_${cardId}"
                               placeholder="email@example.com"
                               required>
                    </div>

                    <div class="form-group">
                        <label>User-Zuordnung</label>
                        <div class="user-search-container">
                            <input type="text" 
                                   class="form-input user-search-input" 
                                   id="new_attendee_user_search_${cardId}"
                                   placeholder="User suchen (Name)..."
                                   data-attendee-id="${cardId}"
                                   autocomplete="off">
                            <input type="hidden" 
                                   class="user-id-input" 
                                   id="new_attendee_user_id_${cardId}"
                                   value="">
                            <div class="user-search-results" id="new_attendee_user_search_results_${cardId}"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="new_attendee_prognosis_class_count_${cardId}">Prognose Anzahl Klassen</label>
                        <input type="number" 
                               class="form-input" 
                               id="new_attendee_prognosis_class_count_${cardId}"
                               value=""
                               min="0">
                    </div>

                    <div class="form-group">
                        <label for="new_attendee_prognosis_start_${cardId}">Prognose Start</label>
                        <input type="text" 
                               class="form-input" 
                               id="new_attendee_prognosis_start_${cardId}"
                               value=""
                               placeholder="z.B. Q1 2025, September 2025">
                    </div>

                    <div class="form-group">
                        <label for="new_attendee_notes_${cardId}">Notizen</label>
                        <textarea class="form-input" 
                                  id="new_attendee_notes_${cardId}"
                                  rows="3"
                                  placeholder="Formlose Notizen..."></textarea>
                    </div>
                </div>
            </div>
        `;

        // Füge die neue Card direkt in die attendees-list ein
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newCardHtml;
        const newCard = tempDiv.firstElementChild;
        
        // Füge die Card am Ende der attendees-list ein
        attendeesList.appendChild(newCard);
        
        // Öffne die neue Card automatisch und scrolle
        setTimeout(() => {
            this.toggleAttendeeForm(cardId);
        }, 100);

        // Event-Listener für User-Suche hinzufügen
        const userSearchInput = document.getElementById(`new_attendee_user_search_${cardId}`);
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => {
                this.handleUserSearch(e.target);
            });
        }
    }

    async saveAttendeeInternal(attendeeId, eventId, isNew = false) {
        let name, email, attended, userId, prognosisClassCount, prognosisStart, notes;
        
        if (isNew || attendeeId === 'new' || (typeof attendeeId === 'string' && attendeeId.startsWith('new_'))) {
            // Für neuen Teilnehmer - prüfe ob es die ursprüngliche "new" Card ist oder eine dynamische
            if (attendeeId === 'new') {
                name = document.getElementById('new_attendee_name')?.value.trim();
                email = document.getElementById('new_attendee_email')?.value.trim();
                const attendedBtn = document.querySelector('.attendance-buttons-group[data-attendee-id="new"] .attendance-btn.active');
                attended = attendedBtn ? (attendedBtn.getAttribute('data-value') === 'null' ? null : attendedBtn.getAttribute('data-value') === 'true') : null;
                userId = document.getElementById('new_attendee_user_id')?.value || null;
                prognosisClassCount = document.getElementById('new_attendee_prognosis_class_count')?.value || null;
                prognosisStart = document.getElementById('new_attendee_prognosis_start')?.value || null;
                notes = document.getElementById('new_attendee_notes')?.value || null;
            } else {
                // Dynamische Card-ID (z.B. "new_1234567890")
                name = document.getElementById(`new_attendee_name_${attendeeId}`)?.value.trim();
                email = document.getElementById(`new_attendee_email_${attendeeId}`)?.value.trim();
                const attendedBtn = document.querySelector(`.attendance-buttons-group[data-attendee-id="${attendeeId}"] .attendance-btn.active`);
                attended = attendedBtn ? (attendedBtn.getAttribute('data-value') === 'null' ? null : attendedBtn.getAttribute('data-value') === 'true') : null;
                userId = document.getElementById(`new_attendee_user_id_${attendeeId}`)?.value || null;
                prognosisClassCount = document.getElementById(`new_attendee_prognosis_class_count_${attendeeId}`)?.value || null;
                prognosisStart = document.getElementById(`new_attendee_prognosis_start_${attendeeId}`)?.value || null;
                notes = document.getElementById(`new_attendee_notes_${attendeeId}`)?.value || null;
            }
            
            // Validierung für neue Teilnehmer
            if (!name || !email) {
                throw new Error('Name und E-Mail sind erforderlich');
            }
        } else {
            // Für bestehenden Teilnehmer - hole Anwesenheit aus aktiven Button
            const attendedBtn = document.querySelector(`.attendance-buttons-group[data-attendee-id="${attendeeId}"] .attendance-btn.active`);
            attended = attendedBtn ? (attendedBtn.getAttribute('data-value') === 'null' ? null : attendedBtn.getAttribute('data-value') === 'true') : null;
            userId = document.getElementById(`user_id_${attendeeId}`)?.value || null;
            prognosisClassCount = document.getElementById(`prognosis_class_count_${attendeeId}`)?.value || null;
            prognosisStart = document.getElementById(`prognosis_start_${attendeeId}`)?.value || null;
            notes = document.getElementById(`notes_${attendeeId}`)?.value || null;
        }

        try {
            let response;
            if (isNew) {
                // Neuen Teilnehmer erstellen
                response = await fetch('/api/infowebinar/create_attendee.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event_id: eventId,
                        name: name,
                        email: email,
                        attended: attended,
                        user_id: userId,
                        prognosis_class_count: prognosisClassCount,
                        prognosis_start: prognosisStart,
                        notes: notes
                    })
                });
            } else {
                // Bestehenden Teilnehmer aktualisieren
                response = await fetch('/api/infowebinar/update_attendee.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        attendee_id: attendeeId,
                        attended: attended,
                        user_id: userId,
                        prognosis_class_count: prognosisClassCount,
                        prognosis_start: prognosisStart,
                        notes: notes
                    })
                });
            }

            // Prüfe HTTP-Status-Code
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Fehler beim Speichern';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Fehler beim Speichern');
            }
        } catch (error) {
            // Nur echte Fehler weiterwerfen, nicht Netzwerkfehler etc.
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('Netzwerkfehler beim Speichern von Attendee:', attendeeId, error);
                throw new Error('Netzwerkfehler: Bitte versuchen Sie es erneut');
            }
            console.error('Fehler beim Speichern von Attendee:', attendeeId, error);
            throw error;
        }
    }

}

// Globale Instanz
let infowebinarManager;

    // Initialisiere Manager wenn Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    infowebinarManager = new InfowebinarManager();

    // Modal schließen bei ESC-Taste
    document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
            const modal = document.getElementById('event-edit-modal');
            if (modal && modal.classList.contains('show')) {
                infowebinarManager.closeEventEditModal();
            }
        }
    });

    // User-Suche-Ergebnisse schließen bei Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-search-input') && !e.target.closest('.user-search-results')) {
            document.querySelectorAll('.user-search-results').forEach(results => {
                results.style.display = 'none';
            });
        }
    });
});
