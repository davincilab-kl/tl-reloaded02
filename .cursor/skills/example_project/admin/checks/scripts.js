class ChecksManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Status prüfen Button
        document.getElementById('check-teacher-status-btn').addEventListener('click', () => {
            this.checkAllTeacherStatus();
        });
        
        // Förderung prüfen Button
        document.getElementById('check-funding-btn').addEventListener('click', () => {
            this.checkSchoolsFunding();
        });
    }
    
    async checkAllTeacherStatus() {
        const modal = document.getElementById('status-check-modal');
        const body = document.getElementById('status-check-body');
        
        modal.style.display = 'flex';
        body.innerHTML = '<div class="loading-status-check"><i class="fas fa-spinner fa-spin"></i><span>Status werden geprüft...</span></div>';
        
        // Verwende SSE für Fortschrittsanzeige
        const eventSource = new EventSource('/api/pipeline/validate_all_teacher_status_stream.php');
        let finalData = null;
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'start') {
                    body.innerHTML = `
                        <div class="status-check-progress">
                            <div class="progress-header">
                                <h4>Status werden geprüft...</h4>
                                <span id="progress-text">0 / ${data.total}</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" id="progress-bar">
                                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                                </div>
                            </div>
                            <div class="progress-stats">
                                <span>Korrekt: <strong id="progress-correct">0</strong></span>
                                <span>Inkorrekt: <strong id="progress-incorrect">0</strong></span>
                            </div>
                        </div>
                    `;
                } else if (data.type === 'progress') {
                    const progressFill = document.getElementById('progress-fill');
                    const progressText = document.getElementById('progress-text');
                    const progressCorrect = document.getElementById('progress-correct');
                    const progressIncorrect = document.getElementById('progress-incorrect');
                    
                    if (progressFill) {
                        progressFill.style.width = data.progress + '%';
                    }
                    if (progressText) {
                        progressText.textContent = `${data.processed} / ${data.total}`;
                    }
                    if (progressCorrect) {
                        progressCorrect.textContent = data.correct;
                    }
                    if (progressIncorrect) {
                        progressIncorrect.textContent = data.incorrect;
                    }
                } else if (data.type === 'complete') {
                    eventSource.close();
                    finalData = {
                        success: true,
                        total_teachers: data.total_teachers,
                        correct: data.correct,
                        incorrect: data.incorrect,
                        inconsistent_teachers: data.inconsistent_teachers,
                        summary: data.summary
                    };
                    this.displayStatusCheckResults(finalData);
                } else if (data.type === 'error') {
                    eventSource.close();
                    body.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> Fehler: ${this.escapeHtml(data.message || 'Unbekannter Fehler')}</div>`;
                }
            } catch (error) {
                console.error('Fehler beim Verarbeiten der SSE-Daten:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE-Fehler:', error);
            eventSource.close();
            if (!finalData) {
                body.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> Fehler beim Laden der Daten</div>`;
            }
        };
    }
    
    displayStatusCheckResults(data) {
        const body = document.getElementById('status-check-body');
        
        let html = `
            <div class="status-check-summary">
                <h4>Zusammenfassung</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Gesamt:</span>
                        <span class="stat-value">${data.total_teachers}</span>
                    </div>
                    <div class="stat-item correct">
                        <span class="stat-label">Korrekt:</span>
                        <span class="stat-value">${data.correct}</span>
                    </div>
                    <div class="stat-item incorrect">
                        <span class="stat-label">Inkorrekt:</span>
                        <span class="stat-value">${data.incorrect}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (data.inconsistent_teachers && data.inconsistent_teachers.length > 0) {
            html += `
                <div class="inconsistent-teachers">
                    <h4>Inkonsistente Lehrer (${data.inconsistent_teachers.length})</h4>
                    <table class="status-check-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>E-Mail</th>
                                <th>Aktueller Status</th>
                                <th>Erwarteter Status</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            data.inconsistent_teachers.forEach(teacher => {
                html += `
                    <tr data-teacher-id="${teacher.teacher_id}">
                        <td>${teacher.teacher_id}</td>
                        <td>${this.escapeHtml((teacher.first_name || '') + ' ' + (teacher.last_name || ''))}</td>
                        <td>${this.escapeHtml(teacher.email || '')}</td>
                        <td>${teacher.current_status_id || 'Kein Status'}</td>
                        <td>${this.escapeHtml(teacher.expected_status_label || 'Unbekannt')} (ID: ${teacher.expected_status_id})</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="checksManager.fixTeacherStatus(${teacher.teacher_id})">
                                <i class="fas fa-wrench"></i> Korrigieren
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            html += '<div class="success-message"><i class="fas fa-check-circle"></i> Alle Status sind korrekt!</div>';
        }
        
        body.innerHTML = html;
    }
    
    async fixTeacherStatus(teacherId) {
        if (!confirm('Möchten Sie den Status für diesen Lehrer wirklich korrigieren?')) {
            return;
        }
        
        // Finde die Zeile in der Tabelle
        const row = document.querySelector(`tr[data-teacher-id="${teacherId}"]`);
        const button = row ? row.querySelector('button') : null;
        
        // Deaktiviere Button während der Korrektur
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Korrigiere...';
        }
        
        try {
            const response = await fetch('/api/pipeline/fix_teacher_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacher_id: teacherId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.fixed_count > 0) {
                    // Status wurde korrigiert - entferne Zeile aus Tabelle
                    if (row) {
                        row.style.opacity = '0.5';
                        row.style.transition = 'opacity 0.3s';
                        setTimeout(() => {
                            row.remove();
                            this.updateStatusCheckSummary();
                        }, 300);
                    }
                    
                    // Zeige Erfolgsmeldung
                    this.showStatusMessage('success', `Status erfolgreich korrigiert!`);
                } else {
                    // Status war bereits korrekt
                    if (row) {
                        row.style.opacity = '0.5';
                        row.style.transition = 'opacity 0.3s';
                        setTimeout(() => {
                            row.remove();
                            this.updateStatusCheckSummary();
                        }, 300);
                    }
                    this.showStatusMessage('info', 'Status ist bereits korrekt.');
                }
            } else {
                this.showStatusMessage('error', 'Fehler: ' + (data.error || 'Unbekannter Fehler'));
                if (button) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-wrench"></i> Korrigieren';
                }
            }
        } catch (error) {
            console.error('Fehler beim Korrigieren:', error);
            this.showStatusMessage('error', 'Fehler beim Korrigieren des Status');
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-wrench"></i> Korrigieren';
            }
        }
    }
    
    updateStatusCheckSummary() {
        const table = document.querySelector('.status-check-table tbody');
        if (!table) return;
        
        const remainingCount = table.querySelectorAll('tr').length;
        const summaryIncorrect = document.querySelector('.stat-item.incorrect .stat-value');
        const summaryCorrect = document.querySelector('.stat-item.correct .stat-value');
        const header = document.querySelector('.inconsistent-teachers h4');
        
        if (summaryIncorrect && remainingCount >= 0) {
            const currentIncorrect = parseInt(summaryIncorrect.textContent) || 0;
            summaryIncorrect.textContent = Math.max(0, currentIncorrect - 1);
        }
        
        if (summaryCorrect) {
            const currentCorrect = parseInt(summaryCorrect.textContent) || 0;
            summaryCorrect.textContent = currentCorrect + 1;
        }
        
        if (header) {
            header.textContent = `Inkonsistente Lehrer (${remainingCount})`;
        }
        
        // Wenn keine inkonsistenten Lehrer mehr, zeige Erfolgsmeldung
        if (remainingCount === 0) {
            const inconsistentSection = document.querySelector('.inconsistent-teachers');
            if (inconsistentSection) {
                inconsistentSection.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Alle Status sind jetzt korrekt!</div>';
            }
        }
    }
    
    showStatusMessage(type, message) {
        // Entferne vorherige Meldung falls vorhanden
        const existingMessage = document.getElementById('status-fix-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageClass = type === 'success' ? 'success-message' : 
                            type === 'error' ? 'error-message' : 
                            'info-message';
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'status-fix-message';
        messageDiv.className = messageClass;
        messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px; animation: slideIn 0.3s ease-out;';
        messageDiv.innerHTML = `<i class="fas ${icon}"></i> ${this.escapeHtml(message)}`;
        
        document.body.appendChild(messageDiv);
        
        // Entferne Meldung nach 5 Sekunden
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }
        }, 5000);
    }
    
    closeStatusCheckModal() {
        document.getElementById('status-check-modal').style.display = 'none';
    }
    
    async checkSchoolsFunding() {
        const modal = document.getElementById('funding-check-modal');
        const body = document.getElementById('funding-check-body');
        
        modal.style.display = 'flex';
        body.innerHTML = '<div class="loading-status-check"><i class="fas fa-spinner fa-spin"></i><span>Förderung wird geprüft...</span></div>';
        
        try {
            const response = await fetch('/api/checks/check_schools_funding.php');
            const data = await response.json();
            
            if (data.success) {
                this.displayFundingCheckResults(data);
            } else {
                body.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> Fehler: ${this.escapeHtml(data.error || 'Unbekannter Fehler')}</div>`;
            }
        } catch (error) {
            console.error('Fehler beim Prüfen der Förderung:', error);
            body.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> Fehler beim Laden der Daten</div>`;
        }
    }
    
    displayFundingCheckResults(data) {
        const body = document.getElementById('funding-check-body');
        
        let html = `
            <div class="status-check-summary">
                <h4>Zusammenfassung</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Gefundene Schulen:</span>
                        <span class="stat-value">${data.schools.length}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (data.schools && data.schools.length > 0) {
            html += `
                <div class="inconsistent-teachers">
                    <h4>Schulen ohne Förderung trotz Infowebinar-Teilnahme (${data.schools.length})</h4>
                    <table class="status-check-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Schule</th>
                                <th>Ort</th>
                                <th>Bundesland</th>
                                <th>Anzahl Lehrkräfte mit Infowebinar</th>
                                <th>Aktion</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            data.schools.forEach(school => {
                html += `
                    <tr data-school-id="${school.id}">
                        <td>${school.id}</td>
                        <td>${this.escapeHtml(school.name || '')}</td>
                        <td>${this.escapeHtml(school.ort || '')}</td>
                        <td>${this.escapeHtml(school.bundesland || '')}</td>
                        <td>${school.teacher_count}</td>
                        <td>
                            <a href="/admin/schools/edit/index.php?id=${school.id}" class="btn btn-sm btn-primary" target="_blank">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </a>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            html += '<div class="success-message"><i class="fas fa-check-circle"></i> Alle Schulen mit Infowebinar-Teilnahme haben die Förderung eingestellt!</div>';
        }
        
        body.innerHTML = html;
    }
    
    closeFundingCheckModal() {
        document.getElementById('funding-check-modal').style.display = 'none';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const checksManager = new ChecksManager();

