// Helper-Funktion: Teacher-ID (role_id) aus Session holen
async function getTeacherUserId() {
    try {
        const userResponse = await fetch('/api/auth/get_current_user.php');
        const userData = await userResponse.json();
        if (userData.success && userData.role_id) {
            // role_id ist die teacher_id (ID in der teachers-Tabelle)
            return userData.role_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Teacher-ID:', error);
    }
    // Fallback auf localStorage
    return localStorage.getItem('teacher_user_id') || null;
}

// Helper-Funktion: HTML escapen
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper-Funktion: Datum formatieren
function formatLastLogin(lastLogin) {
    if (!lastLogin || lastLogin === '0000-00-00 00:00:00' || lastLogin === null) {
        return 'Nie';
    }
    
    try {
        const date = new Date(lastLogin);
        if (isNaN(date.getTime())) {
            return 'Nie';
        }
        
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));
        
        if (days > 0) {
            return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
        } else if (hours > 0) {
            return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
        } else if (minutes > 0) {
            return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
        } else {
            return 'Gerade eben';
        }
    } catch (e) {
        return 'Nie';
    }
}

// Klassen laden
async function loadClasses() {
    try {
        const userId = await getTeacherUserId();
        if (!userId) {
            throw new Error('Keine User-ID gefunden');
        }
        
        const url = `/api/misc/get_classes.php?teacher_id=${userId}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        
        const classesContent = document.getElementById('classes-content');
        
        if (data.error) {
            classesContent.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(data.error)}</span>
                </div>
            `;
            return;
        }
        
        if (data.classes && data.classes.length > 0) {
            classesContent.innerHTML = `
                <div class="classes-grid">
                    ${data.classes.map(cls => `
                        <div class="class-card" data-class-id="${cls.id}" data-class-name="${escapeHtml(cls.name)}">
                            <div class="class-card-header">
                                <div class="class-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <h2 class="class-name">${escapeHtml(cls.name)}</h2>
                                <button class="delete-class-btn" data-class-id="${cls.id}" data-class-name="${escapeHtml(cls.name)}" data-student-count="${cls.student_count || 0}" title="Klasse löschen">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="class-stats">
                                <div class="class-stat-item students">
                                    <div class="class-stat-label">Schüler</div>
                                    <div class="class-stat-value">${cls.student_count || 0}</div>
                                </div>
                                <div class="class-stat-item coins">
                                    <div class="class-stat-label">T-Coins</div>
                                    <div class="class-stat-value">${(cls.total_t_coins || 0).toLocaleString('de-DE')}</div>
                                </div>
                                <div class="class-stat-item avg">
                                    <div class="class-stat-label">T!Score</div>
                                    <div class="class-stat-value">${(cls.avg_t_coins || 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Click-Handler für Klassen-Karten hinzufügen
            classesContent.querySelectorAll('.class-card').forEach(card => {
                card.addEventListener('click', function(e) {
                    // Ignoriere Klicks auf Lösch-Buttons
                    if (e.target.closest('.delete-class-btn')) {
                        return;
                    }
                    const classId = parseInt(this.getAttribute('data-class-id'));
                    const className = this.getAttribute('data-class-name');
                    openClassDetailsModal(classId, className);
                });
            });
        } else {
            classesContent.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Keine Klassen gefunden</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Klassen:', e);
        document.getElementById('classes-content').innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Klassen</span>
            </div>
        `;
    }
}

// Klassendetails-Modal öffnen
let currentClassId = null;

async function openClassDetailsModal(classId, className) {
    const modal = document.getElementById('class-details-modal');
    const modalHeader = document.getElementById('modal-class-name');
    const classStats = document.getElementById('class-stats');
    const studentsList = document.getElementById('students-list');
    const projectsList = document.getElementById('projects-list');
    
    currentClassId = classId;
    modal.style.display = 'flex';
    modal.setAttribute('data-current-class-id', classId);
    modalHeader.innerHTML = `<i class="fas fa-users"></i> ${escapeHtml(className)}`;
    
    // Tabs zurücksetzen
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="students"]').classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    studentsList.classList.add('active');
    
    classStats.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Statistiken...</span>
        </div>
    `;
    
    studentsList.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Schüler...</span>
        </div>
    `;
    
    projectsList.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Projekte...</span>
        </div>
    `;
    
    try {
        // Klasse-Statistiken laden (aus den bereits geladenen Klassen)
        const userId = await getTeacherUserId();
        const classesUrl = `/api/misc/get_classes.php?teacher_id=${userId}`;
        const classesRes = await fetch(classesUrl, { cache: 'no-store' });
        if (classesRes.ok) {
            const classesData = await classesRes.json();
            const classData = classesData.classes?.find(c => c.id === classId);
            
            if (classData) {
                classStats.innerHTML = `
                    <div class="class-stat-item students">
                        <div class="class-stat-label">Schüler</div>
                        <div class="class-stat-value">${classData.student_count || 0}</div>
                    </div>
                    <div class="class-stat-item coins">
                        <div class="class-stat-label">Gesamt T!Coins</div>
                        <div class="class-stat-value">${(classData.total_t_coins || 0).toLocaleString('de-DE')}</div>
                    </div>
                    <div class="class-stat-item avg">
                        <div class="class-stat-label">T!Score</div>
                        <div class="class-stat-value">${(classData.avg_t_coins || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                `;
            }
        }
        
        // Schüler laden
        const studentsUrl = `/api/students/get_students.php?teacher_id=${userId}`;
        const studentsRes = await fetch(studentsUrl, { cache: 'no-store' });
        if (!studentsRes.ok) throw new Error('HTTP ' + studentsRes.status);
        
        const studentsData = await studentsRes.json();
        
        if (studentsData.error) {
            studentsList.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(studentsData.error)}</span>
                </div>
            `;
            return;
        }
        
        // Schüler nach Klasse filtern
        const classStudents = studentsData.students?.filter(s => s.class_id === classId) || [];
        
        if (classStudents.length > 0) {
            // Sortiere nach T-Coins (absteigend)
            classStudents.sort((a, b) => (b.t_coins || 0) - (a.t_coins || 0));
            
            studentsList.innerHTML = `
                <div class="students-list-header">
                    <i class="fas fa-user-graduate"></i>
                    <span>Schüler (${classStudents.length})</span>
                </div>
                <div class="students-table-container">
                    <table class="students-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>T-Coins</th>
                                <th>Projekte in Arbeit</th>
                                <th>Zur Freigabe</th>
                                <th>Veröffentlicht</th>
                                <th>Letzter Login</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classStudents.map(student => `
                                <tr>
                                    <td class="student-name-cell">${escapeHtml(student.name)}</td>
                                    <td class="student-coins-cell">
                                        <i class="fas fa-coins"></i>
                                        ${(student.t_coins || 0).toLocaleString('de-DE')}
                                    </td>
                                    <td>${student.projects_wip || 0}</td>
                                    <td>${student.projects_pending || 0}</td>
                                    <td>${student.projects_public || 0}</td>
                                    <td>${formatLastLogin(student.last_login)}</td>
                                    <td class="student-actions-cell">
                                        <button class="delete-student-btn" data-student-id="${student.id}" data-student-name="${escapeHtml(student.name)}" title="Schüler löschen">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            studentsList.innerHTML = `
                <div class="students-list-header">
                    <i class="fas fa-user-graduate"></i>
                    <span>Schüler</span>
                </div>
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Keine Schüler in dieser Klasse</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Klassendetails:', e);
        classStats.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Statistiken</span>
            </div>
        `;
        studentsList.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Schüler</span>
            </div>
        `;
    }
    
    // Projekte laden
    await loadClassProjects(classId);
}

// Projekte einer Klasse laden
async function loadClassProjects(classId) {
    const projectsList = document.getElementById('projects-list');
    
    try {
        const response = await fetch(`/api/projects/get_class_projects.php?class_id=${classId}`, { cache: 'no-store' });
        
        if (!response.ok) {
            let errorMessage = 'HTTP ' + response.status;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Falls kein JSON zurückkommt, bleibe beim HTTP-Status
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.error) {
            projectsList.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(data.error)}</span>
                </div>
            `;
            return;
        }
        
        const projects = data.projects || [];
        
        if (projects.length > 0) {
            // Sortiere: pending zuerst, dann published, dann working
            projects.sort((a, b) => {
                const order = { 'check': 0, 'published': 1, 'working': 2 };
                return (order[a.status] || 3) - (order[b.status] || 3);
            });
            
            projectsList.innerHTML = `
                <div class="projects-list-header">
                    <i class="fas fa-project-diagram"></i>
                    <span>Projekte (${projects.length})</span>
                </div>
                <div class="projects-table-container">
                    <table class="projects-table">
                        <thead>
                            <tr>
                                <th>Schüler</th>
                                <th>Titel</th>
                                <th>Status</th>
                                <th class="project-likes-header">Likes</th>
                                <th class="project-actions-header">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${projects.map(project => {
                                let statusHtml = '';
                                if (project.status === 'working') {
                                    statusHtml = '<span class="project-status working"><i class="fas fa-edit"></i> In Arbeit</span>';
                                } else if (project.status === 'check') {
                                    statusHtml = '<span class="project-status check"><i class="fas fa-check-circle"></i> Zur Prüfung</span>';
                                } else if (project.status === 'published') {
                                    statusHtml = '<span class="project-status published"><i class="fas fa-globe"></i> Veröffentlicht</span>';
                                }
                                
                                let actionsHtml = '';
                                if (project.status === 'check') {
                                    actionsHtml = `
                                        <button class="btn-review-project" data-project-id="${project.id}" title="Projekt prüfen">
                                            <i class="fas fa-clipboard-check"></i> Prüfen
                                        </button>
                                    `;
                                } else {
                                    actionsHtml = '<span class="text-muted">-</span>';
                                }
                                
                                return `
                                    <tr>
                                        <td class="project-student-cell">${escapeHtml(project.student_name)}</td>
                                        <td class="project-title-cell">${escapeHtml(project.title)}</td>
                                        <td>${statusHtml}</td>
                                        <td class="project-likes-column">
                                            <i class="fas fa-heart"></i> ${project.like_count || 0}
                                        </td>
                                        <td class="project-actions-column">${actionsHtml}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Event Listeners für Prüfen Button
            projectsList.querySelectorAll('.btn-review-project').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const projectId = parseInt(this.getAttribute('data-project-id'));
                    await openProjectReviewModal(projectId, classId);
                });
            });
        } else {
            projectsList.innerHTML = `
                <div class="projects-list-header">
                    <i class="fas fa-project-diagram"></i>
                    <span>Projekte</span>
                </div>
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Keine Projekte in dieser Klasse</span>
                </div>
            `;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Projekte:', e);
        projectsList.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Projekte</span>
            </div>
        `;
    }
}

// Projekt-Prüfungs-Modal öffnen
let currentReviewProjectId = null;
let currentReviewClassId = null;

async function openProjectReviewModal(projectId, classId) {
    currentReviewProjectId = projectId;
    currentReviewClassId = classId;
    
    const modal = document.getElementById('project-review-modal');
    const content = document.getElementById('project-review-content');
    
    modal.style.display = 'flex';
    content.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Projekt-Details...</span>
        </div>
    `;
    
    try {
        // Lade Projekt-Details und relevante Challenges parallel
        const [projectResponse, challengesResponse] = await Promise.all([
            fetch(`/api/projects/get_class_projects.php?class_id=${classId}`, { cache: 'no-store' }),
            fetch(`/api/challenges/get_relevant_challenges.php?project_id=${projectId}`, { cache: 'no-store' })
        ]);
        
        if (!projectResponse.ok || !challengesResponse.ok) {
            let errorMsg = 'Fehler beim Laden der Daten';
            if (!projectResponse.ok) {
                try {
                    const errorData = await projectResponse.json();
                    if (errorData && errorData.error) errorMsg = 'Projekt-Fehler: ' + errorData.error;
                } catch(e) {}
            } else if (!challengesResponse.ok) {
                try {
                    const errorData = await challengesResponse.json();
                    if (errorData && errorData.error) errorMsg = 'Challenge-Fehler: ' + errorData.error;
                } catch(e) {}
            }
            throw new Error(errorMsg);
        }
        
        const projectData = await projectResponse.json();
        const challengesData = await challengesResponse.json();
        
        if (!projectData.success || !challengesData.success) {
            throw new Error(projectData.error || challengesData.error || 'Unbekannter Fehler');
        }
        
        const project = projectData.projects.find(p => p.id === projectId);
        if (!project) {
            throw new Error('Projekt nicht gefunden');
        }
        
        const challenges = challengesData.challenges || [];
        
        // Rendere Modal-Inhalt
        content.innerHTML = `
            <div class="project-review-section">
                <h4 class="project-review-section-title">
                    <i class="fas fa-info-circle"></i> Projekt-Details
                </h4>
                <div class="project-review-details">
                    <div class="project-review-detail-item">
                        <label>Schüler:in:</label>
                        <span>${escapeHtml(project.student_name)}</span>
                    </div>
                    <div class="project-review-detail-item editable-field" data-field="title">
                        <label>Titel:</label>
                        <div class="project-review-field-wrapper">
                            <input type="text" class="project-review-field-input" value="${escapeHtml(project.title)}" readonly>
                            <div class="project-review-field-actions">
                                <button class="project-review-accept-btn" data-field="title" title="Titel akzeptieren">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="project-review-edit-btn" data-field="title" title="Titel bearbeiten">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>                                
                            </div>
                        </div>
                    </div>
                    <div class="project-review-detail-item editable-field" data-field="description">
                        <label>Beschreibung:</label>
                        <div class="project-review-field-wrapper">
                            <textarea class="project-review-field-input project-review-textarea" readonly>${escapeHtml(project.description || '')}</textarea>
                            <div class="project-review-field-actions">
                                <button class="project-review-accept-btn" data-field="description" title="Beschreibung akzeptieren">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="project-review-edit-btn" data-field="description" title="Beschreibung bearbeiten">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="project-review-section">
                <h4 class="project-review-section-title">
                    <i class="fas fa-trophy"></i> Challenge-Teilnahme
                </h4>
                ${challenges.length > 0 ? `
                <p class="project-review-hint">Wählen Sie die Challenges aus, an denen dieses Projekt teilnehmen soll:</p>
                <div class="challenges-selection">
                    ${challenges.map(challenge => `
                        <label class="challenge-checkbox-label">
                            <input type="checkbox" class="challenge-checkbox" value="${challenge.id}" data-challenge-id="${challenge.id}">
                            <div class="challenge-checkbox-content">
                                <div class="challenge-checkbox-title">${escapeHtml(challenge.title)}</div>
                                ${challenge.description ? `<div class="challenge-checkbox-description">${escapeHtml(challenge.description)}</div>` : ''}
                                <div class="challenge-checkbox-meta">
                                    ${challenge.start_date ? `<span><i class="far fa-calendar-alt"></i> Start: ${new Date(challenge.start_date).toLocaleDateString('de-DE')}</span>` : ''}
                                    ${challenge.end_date ? `<span><i class="far fa-calendar"></i> Ende: ${new Date(challenge.end_date).toLocaleDateString('de-DE')}</span>` : ''}
                                    ${challenge.state_filter ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(challenge.state_filter)}</span>` : ''}
                                    ${challenge.sponsor_filter ? `<span><i class="fas fa-hand-holding-usd"></i> ${escapeHtml(challenge.sponsor_filter)}</span>` : ''}
                                </div>
                            </div>
                        </label>
                    `).join('')}
                </div>
                ` : `
                <div class="no-challenges-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Für dieses Projekt sind derzeit keine relevanten Challenges verfügbar.</p>
                    <p class="no-challenges-hint">Das Projekt kann trotzdem freigegeben werden.</p>
                </div>
                `}
            </div>
        `;
        
        // Event-Listener für Bearbeiten/Akzeptieren-Buttons hinzufügen
        setupProjectFieldEditButtons();
    } catch (error) {
        console.error('Fehler beim Laden der Projekt-Details:', error);
        content.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Projekt-Details: ${escapeHtml(error.message)}</span>
            </div>
        `;
    }
}

// Event-Listener für Bearbeiten/Akzeptieren-Buttons einrichten
function setupProjectFieldEditButtons() {
    // Bearbeiten-Buttons
    document.querySelectorAll('.project-review-edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            toggleFieldEdit(field);
        });
    });
    
    // Akzeptieren-Buttons
    document.querySelectorAll('.project-review-accept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            acceptFieldChange(field);
        });
    });
}

// Feld zum Bearbeiten freischalten/sperren
function toggleFieldEdit(field) {
    const fieldItem = document.querySelector(`.editable-field[data-field="${field}"]`);
    if (!fieldItem) return;
    
    const inputElement = fieldItem.querySelector('.project-review-field-input');
    const editBtn = fieldItem.querySelector('.project-review-edit-btn');
    const acceptBtn = fieldItem.querySelector('.project-review-accept-btn');
    
    if (!inputElement || !editBtn || !acceptBtn) return;
    
    const isEditing = !inputElement.readOnly;
    
    if (isEditing) {
        // Feld sperren
        inputElement.readOnly = true;
        fieldItem.classList.remove('editing');
    } else {
        // Feld freischalten
        inputElement.readOnly = false;
        fieldItem.classList.add('editing');
        
        // Fokus auf Input setzen
        if (inputElement.tagName === 'TEXTAREA') {
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        } else {
            inputElement.focus();
            inputElement.select();
        }
    }
}

// Feldänderung akzeptieren und speichern
async function acceptFieldChange(field) {
    const fieldItem = document.querySelector(`.editable-field[data-field="${field}"]`);
    if (!fieldItem) return;
    
    const inputElement = fieldItem.querySelector('.project-review-field-input');
    const editBtn = fieldItem.querySelector('.project-review-edit-btn');
    const acceptBtn = fieldItem.querySelector('.project-review-accept-btn');
    
    if (!inputElement || !editBtn || !acceptBtn) return;
    
    const newValue = inputElement.value.trim();
    
    // Deaktiviere Buttons während des Speicherns
    editBtn.disabled = true;
    acceptBtn.disabled = true;
    acceptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch('/api/projects/update_project_field.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentReviewProjectId,
                field: field,
                value: newValue
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Speichern');
        }
        
        // Feld sperren
        inputElement.readOnly = true;
        fieldItem.classList.remove('editing');
        acceptBtn.innerHTML = '<i class="fas fa-check"></i>';
        editBtn.disabled = false;
        acceptBtn.disabled = false;
        
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern: ' + error.message);
        acceptBtn.innerHTML = '<i class="fas fa-check"></i>';
        editBtn.disabled = false;
        acceptBtn.disabled = false;
    }
}

// Projekt-Prüfungs-Modal schließen
function closeProjectReviewModal() {
    const modal = document.getElementById('project-review-modal');
    modal.style.display = 'none';
    currentReviewProjectId = null;
    currentReviewClassId = null;
}

// Projekt akzeptieren (veröffentlichen) mit Challenge-Auswahl
async function approveProjectWithChallenges() {
    if (!currentReviewProjectId || !currentReviewClassId) {
        return;
    }
    
    // Sammle ausgewählte Challenge-IDs
    const selectedChallenges = Array.from(document.querySelectorAll('.challenge-checkbox:checked'))
        .map(cb => parseInt(cb.value))
        .filter(id => id > 0);
    
    try {
        const response = await fetch('/api/projects/approve_project.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                project_id: currentReviewProjectId,
                challenge_ids: selectedChallenges
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Speichere classId vor dem Schließen des Modals
            const classId = currentReviewClassId;
            const className = document.getElementById('modal-class-name')?.textContent.replace(/^[^\s]+\s/, '') || '';
            
            // Modal schließen
            closeProjectReviewModal();
            
            // Projekte neu laden
            await loadClassProjects(classId);
            // Schüler-Tab auch neu laden (für aktualisierte Projektanzahlen)
            await openClassDetailsModal(classId, className);
        } else {
            alert('Fehler beim Akzeptieren: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Akzeptieren:', error);
        alert('Fehler beim Akzeptieren des Projekts');
    }
}

// Projekt ablehnen (zurück auf working) aus Modal
async function rejectProjectFromModal() {
    if (!currentReviewProjectId || !currentReviewClassId) {
        return;
    }
    
    try {
        const response = await fetch('/api/projects/reject_project.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: currentReviewProjectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Speichere classId vor dem Schließen des Modals
            const classId = currentReviewClassId;
            const className = document.getElementById('modal-class-name')?.textContent.replace(/^[^\s]+\s/, '') || '';
            
            // Modal schließen
            closeProjectReviewModal();
            
            // Projekte neu laden
            await loadClassProjects(classId);
            // Schüler-Tab auch neu laden (für aktualisierte Projektanzahlen)
            await openClassDetailsModal(classId, className);
        } else {
            alert('Fehler beim Ablehnen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Ablehnen:', error);
        alert('Fehler beim Ablehnen des Projekts');
    }
}

// Projekt akzeptieren (veröffentlichen) - öffnet jetzt das Modal
async function approveProject(projectId, classId) {
    await openProjectReviewModal(projectId, classId);
}

// Projekt ablehnen (zurück auf working) aus Modal
async function rejectProjectFromModal() {
    if (!currentReviewProjectId || !currentReviewClassId) {
        return;
    }
    
    try {
        const response = await fetch('/api/projects/reject_project.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: currentReviewProjectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Speichere classId vor dem Schließen des Modals
            const classId = currentReviewClassId;
            const className = document.getElementById('modal-class-name')?.textContent.replace(/^[^\s]+\s/, '') || '';
            
            // Modal schließen
            closeProjectReviewModal();
            
            // Projekte neu laden
            await loadClassProjects(classId);
            // Schüler-Tab auch neu laden (für aktualisierte Projektanzahlen)
            await openClassDetailsModal(classId, className);
        } else {
            alert('Fehler beim Ablehnen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Ablehnen:', error);
        alert('Fehler beim Ablehnen des Projekts');
    }
}

// Like Projekt
async function likeProject(projectId, classId) {
    try {
        const response = await fetch('/api/projects/like_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: projectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Projekte neu laden
            await loadClassProjects(classId);
        } else {
            alert('Fehler beim Liken: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Liken:', error);
        alert('Fehler beim Liken');
    }
}

async function rejectProject(projectId, classId) {
    try {
        const response = await fetch('/api/projects/reject_project.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Projekte neu laden
            await loadClassProjects(classId);
            // Schüler-Tab auch neu laden (für aktualisierte Projektanzahlen)
            const className = document.getElementById('modal-class-name').textContent.replace(/^[^\s]+\s/, '');
            await openClassDetailsModal(classId, className);
        } else {
            alert('Fehler beim Ablehnen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Ablehnen:', error);
        alert('Fehler beim Ablehnen des Projekts');
    }
}

// Klassendetails-Modal schließen
function closeClassDetailsModal() {
    const modal = document.getElementById('class-details-modal');
    modal.style.display = 'none';
    currentClassId = null;
}

// Lösch-Funktionalität
let pendingDelete = null; // {type: 'class'|'student', id: number, name: string, studentCount?: number}

function openDeleteConfirmModal(type, id, name, studentCount = 0) {
    pendingDelete = { type, id, name, studentCount };
    const modal = document.getElementById('delete-confirm-modal');
    const message = document.getElementById('delete-confirm-message');
    const inputContainer = document.getElementById('delete-confirm-input-container');
    const confirmInput = document.getElementById('delete-confirm-input');
    const confirmButton = document.getElementById('confirm-delete');
    
    if (!modal) {
        console.error('Delete confirm modal not found!');
        alert('Fehler: Bestätigungs-Modal nicht gefunden');
        return;
    }
    
    if (!message) {
        console.error('Delete confirm message element not found!');
        alert('Fehler: Nachrichten-Element nicht gefunden');
        return;
    }
    
    // Eingabefeld leeren und Button deaktivieren
    if (confirmInput) {
        confirmInput.value = '';
    }
    if (confirmButton) {
        confirmButton.disabled = true;
    }
    
    if (type === 'class') {
        message.innerHTML = `
            <p><strong>Möchten Sie die Klasse "${escapeHtml(name)}" wirklich löschen?</strong></p>
            <p>Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <p style="color: #e74c3c; font-weight: 600;">
                <i class="fas fa-exclamation-triangle"></i> 
                Dabei werden auch alle ${studentCount} Schüler dieser Klasse gelöscht!
            </p>
        `;
        // Eingabefeld nur für Klassen anzeigen
        if (inputContainer) {
            inputContainer.style.display = 'block';
        }
        // Event Listener für Eingabefeld hinzufügen
        if (confirmInput) {
            confirmInput.oninput = function() {
                const confirmButton = document.getElementById('confirm-delete');
                if (confirmButton) {
                    confirmButton.disabled = this.value.trim() !== 'LÖSCHEN';
                }
            };
            // Enter-Taste unterstützen
            confirmInput.onkeypress = function(e) {
                if (e.key === 'Enter' && this.value.trim() === 'LÖSCHEN') {
                    const confirmButton = document.getElementById('confirm-delete');
                    if (confirmButton && !confirmButton.disabled) {
                        confirmButton.click();
                    }
                }
            };
            // Focus auf Eingabefeld setzen
            setTimeout(() => confirmInput.focus(), 100);
        }
    } else if (type === 'student') {
        message.innerHTML = `
            <p><strong>Möchten Sie den Schüler "${escapeHtml(name)}" wirklich löschen?</strong></p>
            <p>Diese Aktion kann nicht rückgängig gemacht werden.</p>
        `;
        // Eingabefeld für Schüler verstecken
        if (inputContainer) {
            inputContainer.style.display = 'none';
        }
        // Button für Schüler aktivieren (keine Eingabe erforderlich)
        if (confirmButton) {
            confirmButton.disabled = false;
        }
    }
    
    modal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('delete-confirm-modal');
    modal.style.display = 'none';
    pendingDelete = null;
    // Eingabefeld leeren
    const confirmInput = document.getElementById('delete-confirm-input');
    if (confirmInput) {
        confirmInput.value = '';
    }
    // Button deaktivieren
    const confirmButton = document.getElementById('confirm-delete');
    if (confirmButton) {
        confirmButton.disabled = true;
    }
}

async function confirmDelete() {
    if (!pendingDelete) return;
    
    const { type, id, name } = pendingDelete;
    
    // Für Klassen: Prüfe ob "LÖSCHEN" eingegeben wurde
    if (type === 'class') {
        const confirmInput = document.getElementById('delete-confirm-input');
        if (!confirmInput || confirmInput.value.trim() !== 'LÖSCHEN') {
            alert('Bitte geben Sie "LÖSCHEN" ein, um fortzufahren.');
            if (confirmInput) {
                confirmInput.focus();
            }
            return;
        }
    }
    
    const userId = await getTeacherUserId();
    
    if (!userId) {
        alert('Keine User-ID gefunden');
        return;
    }
    
    try {
        let url, body;
        
        if (type === 'class') {
            url = '/api/classes/delete_class.php';
            body = JSON.stringify({ class_id: id, teacher_id: userId });
        } else if (type === 'student') {
            url = '/api/students/delete_student.php';
            body = JSON.stringify({ student_id: id, teacher_id: userId });
        }
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Löschen');
        }
        
        closeDeleteConfirmModal();
        
        // Seite neu laden oder Daten aktualisieren
        if (type === 'class') {
            loadClasses();
        } else if (type === 'student') {
            // Wenn ein Schüler gelöscht wird, das Modal aktualisieren
            const currentModal = document.getElementById('class-details-modal');
            if (currentModal.style.display !== 'none') {
                // Hole die aktuelle classId aus dem Modal-Header oder einem versteckten Datenfeld
                const modalClassId = parseInt(currentModal.getAttribute('data-current-class-id') || '0');
                if (modalClassId > 0) {
                    const className = document.getElementById('modal-class-name').textContent.replace(/^[^\s]+\s/, '');
                    await openClassDetailsModal(modalClassId, className);
                }
            }
            loadClasses(); // Aktualisiere auch die Klassenliste (für Statistiken)
        }
        
    } catch (e) {
        console.error('Fehler beim Löschen:', e);
        alert('Fehler beim Löschen: ' + e.message);
    }
}

// Klassenerstellung-Funktionalität (Multi-Step)
let currentCreateStep = 1;
let selectedCoursePackageId = null;
let selectedProvisioningType = 'funded'; // Standard: gefördert
let createdClassId = null;

async function openCreateClassModal() {
    // Prüfe ob Schule gefördert wird
    try {
        const response = await fetch('/api/schools/get_school_details.php');
        const data = await response.json();
        
        if (data.success && data.status === 'assigned' && data.school) {
            const foerderung = data.school.foerderung || false;
            
            if (!foerderung) {
                alert('Die Schule muss freigeschaltet werden, bevor Klassen erstellt werden können.');
                return;
            }
        } else {
            alert('Keine Schule zugewiesen oder Fehler beim Laden der Schulinformationen.');
            return;
        }
    } catch (error) {
        console.error('Fehler beim Prüfen der Schul-Förderung:', error);
        alert('Fehler beim Prüfen der Schul-Förderung. Bitte versuchen Sie es später erneut.');
        return;
    }
    
    const modal = document.getElementById('create-class-modal');
    const classNameInput = document.getElementById('class-name-input');
    const studentCountInput = document.getElementById('student-count-input');
    const hint = document.getElementById('create-class-hint');
    
    if (modal && classNameInput && studentCountInput) {
        modal.style.display = 'flex';
        currentCreateStep = 1;
        selectedCoursePackageId = null;
        selectedProvisioningType = 'funded'; // Reset auf Standard
        createdClassId = null;
        
        // Reset Form
        classNameInput.value = '';
        studentCountInput.value = '20';
        hint.style.display = 'none';
        hint.textContent = '';
        
        // Reset Steps
        showCreateStep(1);
        
        // Reset Bereitstellungsform-Auswahl
        document.querySelectorAll('.provisioning-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        const fundedOption = document.querySelector('.provisioning-option[data-value="funded"]');
        if (fundedOption) {
            fundedOption.classList.add('selected');
        }
        
        // Lade Kurspakete
        await loadCoursePackages();
        
        setTimeout(() => classNameInput.focus(), 100);
    }
}

function closeCreateClassModal() {
    const modal = document.getElementById('create-class-modal');
    const hint = document.getElementById('create-class-hint');
    const hintStep2 = document.getElementById('create-class-hint-step2');
    
    // Wenn Klasse erfolgreich erstellt wurde, Klassenliste aktualisieren
    if (createdClassId) {
        loadClasses();
    }
    
    if (modal) {
        modal.style.display = 'none';
    }
    if (hint) {
        hint.style.display = 'none';
        hint.textContent = '';
    }
    if (hintStep2) {
        hintStep2.style.display = 'none';
        hintStep2.textContent = '';
    }
    currentCreateStep = 1;
    selectedCoursePackageId = null;
    createdClassId = null;
}

function showCreateStep(step) {
    currentCreateStep = step;
    
    // Alle Steps verstecken
    document.querySelectorAll('.create-class-step').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // Aktuellen Step anzeigen
    const currentStepEl = document.getElementById(`create-class-step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
        currentStepEl.style.display = 'block';
    }
    
    // Buttons anpassen
    const backBtn = document.getElementById('back-create-class');
    const nextBtn = document.getElementById('next-create-class');
    const confirmBtn = document.getElementById('confirm-create-class');
    const confirmFreeBtn = document.getElementById('confirm-create-class-free');
    const cancelBtn = document.getElementById('cancel-create-class');
    const finishBtn = document.getElementById('finish-create-class');
    
    if (backBtn) backBtn.style.display = step > 1 && step < 3 ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.style.display = step < 3 ? 'inline-block' : 'none';
    if (confirmBtn) confirmBtn.style.display = 'none';
    if (confirmFreeBtn) confirmFreeBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = step < 3 ? 'inline-block' : 'none';
    if (finishBtn) finishBtn.style.display = step === 3 ? 'inline-block' : 'none';
    
    // In Schritt 2: Buttons je nach Bereitstellungsform anzeigen
    if (step === 2) {
        updateProvisioningPrice();
        if (selectedProvisioningType === 'funded') {
            if (confirmFreeBtn) confirmFreeBtn.style.display = 'inline-block';
        } else {
            if (confirmBtn) confirmBtn.style.display = 'inline-block';
        }
        if (nextBtn) nextBtn.style.display = 'none';
    }
}

async function loadCoursePackages() {
    const packagesList = document.getElementById('course-packages-list');
    if (!packagesList) return;
    
    packagesList.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Kurspakete...</span>
        </div>
    `;
    
    try {
        const response = await fetch('/api/classes/get_course_packages.php');
        const data = await response.json();
        
        if (!data.success || !data.packages || data.packages.length === 0) {
            packagesList.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>Keine Kurspakete verfügbar</span>
                </div>
            `;
            return;
        }
        
        packagesList.innerHTML = data.packages.map(pkg => `
            <div class="course-package-item ${data.packages.length === 1 ? 'selected' : ''}" data-package-id="${pkg.id}">
                <div class="course-package-check">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="course-package-content">
                    <div class="course-package-name">${escapeHtml(pkg.name)}</div>
                </div>
                <button type="button" class="course-package-info-btn" data-package-id="${pkg.id}" title="Informationen anzeigen">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        `).join('');
        
        // Wenn nur ein Paket, automatisch auswählen
        if (data.packages.length === 1) {
            selectedCoursePackageId = data.packages[0].id;
        }
        
        // Event Listeners - Klick auf gesamtes Item
        packagesList.querySelectorAll('.course-package-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // Verhindere Auswahl wenn auf Info-Button geklickt wird
                if (e.target.closest('.course-package-info-btn')) {
                    return;
                }
                
                const packageId = parseInt(this.getAttribute('data-package-id'));
                selectedCoursePackageId = packageId;
                
                // Entferne Auswahl von allen Items
                packagesList.querySelectorAll('.course-package-item').forEach(i => {
                    i.classList.remove('selected');
                });
                
                // Füge Auswahl zum geklickten Item hinzu
                this.classList.add('selected');
            });
        });
        
        packagesList.querySelectorAll('.course-package-info-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const packageId = parseInt(this.getAttribute('data-package-id'));
                openPackageInfoModal(packageId, data.packages);
            });
        });
        
    } catch (error) {
        console.error('Fehler beim Laden der Kurspakete:', error);
        packagesList.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Kurspakete</span>
            </div>
        `;
    }
}

async function openPackageInfoModal(packageId, packages) {
    const modal = document.getElementById('package-info-modal');
    const content = document.getElementById('package-info-content');
    
    if (!modal || !content) return;
    
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    modal.style.display = 'flex';
    
    // Lade Kursdetails
    try {
        const coursesResponse = await fetch('/api/courses/get_courses.php');
        const coursesData = await coursesResponse.json();
        const allCourses = coursesData.courses || [];
        const packageCourses = allCourses.filter(c => pkg.course_ids.includes(c.id));
        
        content.innerHTML = `
            <div class="package-info-name">${escapeHtml(pkg.name)}</div>
            <div class="package-info-description">${escapeHtml(pkg.description || 'Keine Beschreibung verfügbar')}</div>
            <div class="package-info-courses">
                <div class="package-info-courses-title">Enthaltene Kurse (${packageCourses.length}):</div>
                <ul class="package-info-courses-list">
                    ${packageCourses.map(c => `<li>${escapeHtml(c.title)}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error('Fehler beim Laden der Kursdetails:', error);
        content.innerHTML = `
            <div class="package-info-name">${escapeHtml(pkg.name)}</div>
            <div class="package-info-description">${escapeHtml(pkg.description || 'Keine Beschreibung verfügbar')}</div>
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Kursdetails</span>
            </div>
        `;
    }
}

function closePackageInfoModal() {
    const modal = document.getElementById('package-info-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function nextCreateStep() {
    if (currentCreateStep === 1) {
        // Validierung Schritt 1
        const classNameInput = document.getElementById('class-name-input');
        const studentCountInput = document.getElementById('student-count-input');
        const hint = document.getElementById('create-class-hint');
        
        const className = (classNameInput.value || '').trim();
        const studentCount = parseInt(studentCountInput.value || '0');
        
        if (!className) {
            hint.textContent = 'Bitte geben Sie einen Klassenamen ein.';
            hint.style.display = 'block';
            classNameInput.focus();
            return;
        }
        
        if (studentCount < 1 || studentCount > 50) {
            hint.textContent = 'Bitte geben Sie eine Anzahl zwischen 1 und 50 ein.';
            hint.style.display = 'block';
            studentCountInput.focus();
            return;
        }
        
        if (!selectedCoursePackageId) {
            hint.textContent = 'Bitte wählen Sie ein Kurspaket aus.';
            hint.style.display = 'block';
            return;
        }
        
        hint.style.display = 'none';
        
        // Update Preis-Anzeige
        updateProvisioningPrice();
        
        showCreateStep(2);
    }
}

function backCreateStep() {
    if (currentCreateStep > 1) {
        showCreateStep(currentCreateStep - 1);
    }
}

let schoolYears = [];

async function loadSchoolYears() {
    try {
        const response = await fetch('/api/school_years/get_school_years.php');
        const data = await response.json();
        if (data.success && data.school_years) {
            schoolYears = data.school_years;
            updateSchoolYearSelect();
        }
    } catch (error) {
        console.error('Fehler beim Laden der Schuljahre:', error);
    }
}

function updateSchoolYearSelect() {
    // Schuljahr-Auswahl wird nicht mehr benötigt - wird automatisch verwendet
    // Diese Funktion existiert nur, um den Aufruf in loadSchoolYears() zu erfüllen
    const schoolYearSelection = document.getElementById('school-year-selection');
    if (schoolYearSelection && schoolYears && schoolYears.length > 0) {
        // Falls das Element in Zukunft wieder benötigt wird, kann hier die Logik ergänzt werden
    }
}

function getCurrentSchoolYearId() {
    // Aktuelles Schuljahr finden
    const currentYear = schoolYears.find(sy => sy.is_current);
    return currentYear ? currentYear.id : null;
}

function updateProvisioningPrice() {
    const studentCount = parseInt(document.getElementById('student-count-input').value || '0');
    const pricePerStudent = 14.40;
    const totalPrice = (studentCount * pricePerStudent).toFixed(2).replace('.', ',');
    
    const invoicePrice = document.getElementById('price-invoice');
    const uewPrice = document.getElementById('price-uew');
    const schoolYearSelection = document.getElementById('school-year-selection');
    
    if (invoicePrice) {
        invoicePrice.textContent = `${totalPrice}€ (14,40€ × ${studentCount} Schüler)`;
    }
    if (uewPrice) {
        uewPrice.textContent = `${totalPrice}€ (14,40€ × ${studentCount} Schüler)`;
    }
    
    // Schuljahr-Auswahl nicht mehr nötig - wird automatisch verwendet
}

async function createClass() {
    const classNameInput = document.getElementById('class-name-input');
    const studentCountInput = document.getElementById('student-count-input');
    const hint = document.getElementById('create-class-hint');
    const hintStep2 = document.getElementById('create-class-hint-step2');
    
    const className = (classNameInput.value || '').trim();
    const studentCount = parseInt(studentCountInput.value || '0');
    
    // Validierung
    if (!className) {
        if (hintStep2) {
            hintStep2.textContent = 'Bitte geben Sie einen Klassenamen ein.';
            hintStep2.style.display = 'block';
        }
        showCreateStep(1);
        return;
    }
    
    if (studentCount < 1 || studentCount > 50) {
        if (hintStep2) {
            hintStep2.textContent = 'Bitte geben Sie eine Anzahl zwischen 1 und 50 ein.';
            hintStep2.style.display = 'block';
        }
        showCreateStep(1);
        return;
    }
    
    if (!selectedCoursePackageId) {
        if (hintStep2) {
            hintStep2.textContent = 'Bitte wählen Sie ein Kurspaket aus.';
            hintStep2.style.display = 'block';
        }
        showCreateStep(1);
        return;
    }
    
    if (!selectedProvisioningType) {
        if (hintStep2) {
            hintStep2.textContent = 'Bitte wählen Sie eine Bereitstellungsform.';
            hintStep2.style.display = 'block';
        }
        return;
    }
    
    // Hole aktuelles Schuljahr automatisch (nur bei invoice/uew)
    let schoolYearId = null;
    if (selectedProvisioningType === 'invoice' || selectedProvisioningType === 'uew') {
        schoolYearId = getCurrentSchoolYearId();
        if (!schoolYearId) {
            if (hintStep2) {
                hintStep2.textContent = 'Fehler: Kein aktuelles Schuljahr gefunden.';
                hintStep2.style.display = 'block';
            }
            return;
        }
    }
    
    const userId = await getTeacherUserId();
    if (!userId) {
        if (hintStep2) {
            hintStep2.textContent = 'Keine User-ID gefunden.';
            hintStep2.style.display = 'block';
        }
        return;
    }
    
    // Buttons deaktivieren
    const confirmBtn = document.getElementById('confirm-create-class');
    const confirmFreeBtn = document.getElementById('confirm-create-class-free');
    
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Wird erstellt...';
    }
    if (confirmFreeBtn) {
        confirmFreeBtn.disabled = true;
        confirmFreeBtn.textContent = 'Wird erstellt...';
    }
    
    try {
        const requestBody = {
            class_name: className,
            student_count: studentCount,
            teacher_id: userId,
            course_package_id: selectedCoursePackageId,
            provisioning_type: selectedProvisioningType
        };
        
        // Nur bei invoice/uew das school_year_id mitsenden
        if (schoolYearId) {
            requestBody.school_year_id = schoolYearId;
        }
        
        const res = await fetch('/api/classes/create_class.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Fehler beim Erstellen der Klasse');
        }
        
        // Erfolg
        createdClassId = data.class_id;
        const successText = document.getElementById('success-message-text');
        if (successText) {
            successText.textContent = `Die Klasse "${escapeHtml(className)}" wurde erfolgreich mit ${studentCount} Schülern erstellt.`;
        }
        
        showCreateStep(3);
        
    } catch (e) {
        console.error('Fehler beim Erstellen der Klasse:', e);
        if (hintStep2) {
            hintStep2.textContent = 'Fehler: ' + e.message;
            hintStep2.style.display = 'block';
        }
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Kostenpflichtig bestellen';
        }
        if (confirmFreeBtn) {
            confirmFreeBtn.disabled = false;
            confirmFreeBtn.textContent = 'Kostenlos beantragen';
        }
    }
}

// Prüfe ob Schule gefördert wird
async function checkSchoolFunding() {
    try {
        const response = await fetch('/api/schools/get_school_details.php');
        const data = await response.json();
        
        if (data.success && data.status === 'assigned' && data.school) {
            const foerderung = data.school.foerderung || false;
            const createButton = document.getElementById('open-create-class-modal');
            
            if (createButton) {
                if (!foerderung) {
                    createButton.disabled = true;
                    createButton.title = 'Die Schule muss gefördert werden, bevor Klassen erstellt werden können';
                    createButton.style.opacity = '0.6';
                    createButton.style.cursor = 'not-allowed';
                } else {
                    createButton.disabled = false;
                    createButton.title = '';
                    createButton.style.opacity = '1';
                    createButton.style.cursor = 'pointer';
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Prüfen der Schul-Förderung:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadClasses();
    checkSchoolFunding();
    loadSchoolYears();
    
    // Create Class Modal Event Listeners
    document.getElementById('open-create-class-modal')?.addEventListener('click', openCreateClassModal);
    document.getElementById('close-create-class-modal')?.addEventListener('click', closeCreateClassModal);
    document.getElementById('cancel-create-class')?.addEventListener('click', closeCreateClassModal);
    document.getElementById('next-create-class')?.addEventListener('click', nextCreateStep);
    document.getElementById('back-create-class')?.addEventListener('click', backCreateStep);
    document.getElementById('confirm-create-class')?.addEventListener('click', createClass);
    document.getElementById('confirm-create-class-free')?.addEventListener('click', createClass);
    document.getElementById('finish-create-class')?.addEventListener('click', closeCreateClassModal);
    
    // Package Info Modal Event Listeners
    document.getElementById('close-package-info-modal')?.addEventListener('click', closePackageInfoModal);
    document.getElementById('close-package-info-btn')?.addEventListener('click', closePackageInfoModal);
    
    // Package Info Modal schließen bei Klick außerhalb
    const packageInfoModal = document.getElementById('package-info-modal');
    if (packageInfoModal) {
        packageInfoModal.addEventListener('click', function(e) {
            if (e.target === packageInfoModal) {
                closePackageInfoModal();
            }
        });
    }
    
    // Bereitstellungsform Auswahl
    document.querySelectorAll('.provisioning-option').forEach(option => {
        option.addEventListener('click', function() {
            const provisioningType = this.getAttribute('data-value');
            selectedProvisioningType = provisioningType;
            
            // Entferne Auswahl von allen Optionen
            document.querySelectorAll('.provisioning-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Füge Auswahl zur geklickten Option hinzu
            this.classList.add('selected');
            
            // Aktualisiere Preis und Buttons
            updateProvisioningPrice();
            const nextBtn = document.getElementById('next-create-class');
            const confirmBtn = document.getElementById('confirm-create-class');
            const confirmFreeBtn = document.getElementById('confirm-create-class-free');
            
            if (provisioningType === 'funded') {
                if (nextBtn) nextBtn.style.display = 'none';
                if (confirmBtn) confirmBtn.style.display = 'none';
                if (confirmFreeBtn) confirmFreeBtn.style.display = 'inline-block';
            } else {
                if (nextBtn) nextBtn.style.display = 'none';
                if (confirmBtn) confirmBtn.style.display = 'inline-block';
                if (confirmFreeBtn) confirmFreeBtn.style.display = 'none';
            }
        });
    });
    
    // Schüleranzahl-Änderung für Preis-Update
    const studentCountInput = document.getElementById('student-count-input');
    if (studentCountInput) {
        studentCountInput.addEventListener('input', updateProvisioningPrice);
    }
    
    // Download Anmeldekärtchen im Erfolg-Screen
    document.getElementById('download-login-cards-success')?.addEventListener('click', async function() {
        if (!createdClassId) {
            alert('Keine Klasse ausgewählt');
            return;
        }
        
        const userId = await getTeacherUserId();
        if (!userId) {
            alert('Keine User-ID gefunden');
            return;
        }
        
        const url = `/api/classes/generate_login_cards_pdf.php?class_id=${createdClassId}&teacher_id=${userId}`;
        window.open(url, '_blank');
    });
    
    // Create Class Modal schließen bei Klick außerhalb
    const createClassModal = document.getElementById('create-class-modal');
    if (createClassModal) {
        createClassModal.addEventListener('click', function(e) {
            if (e.target === createClassModal) {
                closeCreateClassModal();
            }
        });
    }
    
    // Enter-Taste im Eingabefeld für Klassenerstellung
    const classNameInput = document.getElementById('class-name-input');
    if (classNameInput) {
        classNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const studentInput = document.getElementById('student-count-input');
                if (studentInput) {
                    studentInput.focus();
                }
            }
        });
    }
    if (studentCountInput) {
        studentCountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                createClass();
            }
        });
    }
    
    // Anmeldekärtchen als PDF herunterladen
    document.getElementById('generate-login-cards')?.addEventListener('click', async function() {
        if (!currentClassId) {
            alert('Keine Klasse ausgewählt');
            return;
        }
        
        const userId = await getTeacherUserId();
        if (!userId) {
            alert('Keine User-ID gefunden');
            return;
        }
        
        // Öffne Seite, die automatisch PDF generiert
        const url = `/api/classes/generate_login_cards_pdf.php?class_id=${currentClassId}&teacher_id=${userId}`;
        window.open(url, '_blank');
    });
    
    // Modal schließen Buttons
    document.getElementById('close-class-modal')?.addEventListener('click', closeClassDetailsModal);
    document.getElementById('close-class-details')?.addEventListener('click', closeClassDetailsModal);
    
    // Delete Modal Event Listeners
    document.getElementById('close-delete-modal')?.addEventListener('click', closeDeleteConfirmModal);
    document.getElementById('cancel-delete')?.addEventListener('click', closeDeleteConfirmModal);
    document.getElementById('confirm-delete')?.addEventListener('click', confirmDelete);
    
    // Projekt-Prüfungs-Modal Event Listeners
    document.getElementById('close-project-review-modal')?.addEventListener('click', closeProjectReviewModal);
    document.getElementById('cancel-project-review')?.addEventListener('click', closeProjectReviewModal);
    document.getElementById('approve-project-review')?.addEventListener('click', approveProjectWithChallenges);
    document.getElementById('reject-project-review')?.addEventListener('click', rejectProjectFromModal);
    
    // Projekt-Prüfungs-Modal schließen bei Klick außerhalb
    const projectReviewModal = document.getElementById('project-review-modal');
    if (projectReviewModal) {
        projectReviewModal.addEventListener('click', function(e) {
            if (e.target === projectReviewModal) {
                closeProjectReviewModal();
            }
        });
    }
    
    // Delete Modal schließen bei Klick außerhalb
    const deleteModal = document.getElementById('delete-confirm-modal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                closeDeleteConfirmModal();
            }
        });
    }
    
    // Modal schließen bei Klick außerhalb
    const modal = document.getElementById('class-details-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeClassDetailsModal();
            }
        });
    }
    
    // Tab-Wechsel (nur im class-details-modal)
    const classModal = document.getElementById('class-details-modal');
    if (classModal) {
        classModal.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Tabs aktivieren/deaktivieren (nur im Modal)
                classModal.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Tab-Inhalte anzeigen/verstecken (nur im Modal)
                classModal.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                if (tabName === 'students') {
                    document.getElementById('students-list').classList.add('active');
                } else if (tabName === 'projects') {
                    document.getElementById('projects-list').classList.add('active');
                }
            });
        });
    }
    
    // Event Delegation für Lösch-Buttons
    document.addEventListener('click', function(e) {
        // Klassen löschen
        if (e.target.closest('.delete-class-btn')) {
            e.stopPropagation();
            e.preventDefault();
            const btn = e.target.closest('.delete-class-btn');
            const classId = parseInt(btn.getAttribute('data-class-id'));
            const className = btn.getAttribute('data-class-name');
            const studentCount = parseInt(btn.getAttribute('data-student-count') || '0');
            openDeleteConfirmModal('class', classId, className, studentCount);
            return false;
        }
        
        // Schüler löschen
        if (e.target.closest('.delete-student-btn')) {
            e.stopPropagation();
            e.preventDefault();
            const btn = e.target.closest('.delete-student-btn');
            const studentId = parseInt(btn.getAttribute('data-student-id'));
            const studentName = btn.getAttribute('data-student-name');
            openDeleteConfirmModal('student', studentId, studentName);
        }
    });
});

