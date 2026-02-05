// Meine Projekte

async function getCurrentUserId() {
    try {
        const response = await fetch('/api/auth/get_current_user.php');
        const data = await response.json();
        if (data.success && data.user_id) {
            return data.user_id;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der User-ID:', error);
    }
    // Fallback auf localStorage für Kompatibilität
    return localStorage.getItem('teacher_user_id') || null;
}

function getTeacherUserId() {
    // Diese Funktion wird für Kompatibilität beibehalten
    return localStorage.getItem('teacher_user_id') || null;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentStudentId = null;

// Lade zuerst den ersten Schüler der Lehrkraft
async function loadFirstStudent() {
    const userId = await getCurrentUserId();
    if (!userId) {
        document.getElementById('projects-content').innerHTML = '<div class="error-messages">Keine User-ID gefunden</div>';
        return;
    }

    try {
        const response = await fetch(`/api/students/get_first_student.php?user_id=${userId}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            document.getElementById('projects-content').innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        currentStudentId = data.student.id;
        await loadProjects();
    } catch (error) {
        console.error('Fehler beim Laden des Schülers:', error);
        document.getElementById('projects-content').innerHTML = '<div class="error-messages">Fehler beim Laden des Schülers</div>';
    }
}

// Lade Projekte des Schülers
async function loadProjects() {
    const projectsContent = document.getElementById('projects-content');
    
    // Button zum Starten eines neuen Projekts
    projectsContent.innerHTML = `
        <div class="new-project-section">
            <button class="btn-new-project" id="btn-new-project">
                <i class="fas fa-plus"></i>
                Neues Projekt starten
            </button>
        </div>
        <div class="projects-list-container">
            <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Lade Projekte...</span>
            </div>
        </div>
    `;

    // Event Listener für neuen Projekt-Button
    document.getElementById('btn-new-project').addEventListener('click', async function() {
        await createProject();
    });

    const projectsListContainer = projectsContent.querySelector('.projects-list-container');

    try {
        // Hole student_id des aktuell eingeloggten Users
        let currentLoggedInStudentId = null;
        try {
            const currentStudentResponse = await fetch('/api/students/get_current_student_id.php');
            const currentStudentData = await currentStudentResponse.json();
            if (currentStudentData.success && currentStudentData.student_id) {
                currentLoggedInStudentId = currentStudentData.student_id;
            }
        } catch (error) {
            console.error('Fehler beim Laden der aktuellen student_id:', error);
        }

        const response = await fetch(`/api/projects/get_student_projects.php?student_id=${currentStudentId}`);
        const data = await response.json();

        if (data.error) {
            projectsListContainer.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        if (data.projects.length === 0) {
            projectsListContainer.innerHTML = '<div class="no-messages">Noch keine Projekte vorhanden</div>';
            return;
        }

        // Rendere Projekt-Karten
        projectsListContainer.innerHTML = '<div class="courses-grid"></div>';
        const projectsGrid = projectsListContainer.querySelector('.courses-grid');

        data.projects.forEach(project => {
            const status = project.status || 'working';
            const likeCount = project.like_count || 0;
            
            // Prüfe ob Like-Button angezeigt werden soll (nur wenn nicht eigenes Projekt)
            const canLike = currentLoggedInStudentId !== null && currentLoggedInStudentId !== project.student_id && status === 'published';
            
            // Status-Anzeige
            const statusIcon = status === 'published' ? 'fa-globe' : status === 'check' ? 'fa-check-circle' : 'fa-edit';
            const statusText = status === 'published' ? 'Veröffentlicht' : status === 'check' ? 'Zur Prüfung' : 'In Arbeit';
            
            const linkHtml = project.link ? `<a href="${escapeHtml(project.link)}" target="_blank" class="project-link-btn" onclick="event.stopPropagation();">
                <i class="fas fa-external-link-alt"></i>
            </a>` : '';
            
            const projectCard = document.createElement('div');
            projectCard.className = 'course-card scratch-project-card';
            projectCard.dataset.projectId = project.id;
            if (project.link) {
                projectCard.onclick = () => window.open(escapeHtml(project.link), '_blank');
                projectCard.style.cursor = 'pointer';
            }
            
            // Cover-Bild oder Standard-Icon
            const coverHtml = project.cover ? 
                `<img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title || 'Projekt')}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<i class="fas fa-code"></i>`;
            
            projectCard.innerHTML = `
                <div class="course-image">
                    ${coverHtml}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${escapeHtml(project.title || 'Unbenanntes Projekt')}</h3>
                    <p class="course-description">${escapeHtml(project.description || 'Keine Beschreibung verfügbar')}</p>
                    <div class="project-meta-info">
                        <span class="project-status-badge ${status}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        <span class="project-likes-count">
                            <i class="fas fa-heart"></i> ${likeCount || 0}
                        </span>
                    </div>
                    <div class="project-actions-bottom">
                        ${status === 'working' ? `
                            <button class="btn-edit" data-project-id="${project.id}" onclick="event.stopPropagation();" title="Projekt bearbeiten">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                        ` : ''}
                    </div>
                    <div class="project-actions">
                        ${canLike ? `<button class="project-like-btn" data-project-id="${project.id}" onclick="event.stopPropagation();" title="Projekt liken">
                            <i class="far fa-heart"></i>
                        </button>` : ''}
                        ${linkHtml}
                    </div>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });
        
        // Event Listener für Bearbeiten-Buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const projectId = parseInt(this.dataset.projectId);
                window.location.href = `editor/?project_id=${projectId}`;
            });
        });
        
        // Event Listener für Like-Buttons
        document.querySelectorAll('.project-like-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const projectId = parseInt(this.dataset.projectId);
                await likeProject(projectId, this);
            });
        });

    } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        projectsListContainer.innerHTML = '<div class="error-messages">Fehler beim Laden der Projekte</div>';
    }
}

// Erstelle neues Projekt
async function createProject() {
    try {
        const response = await fetch('/api/projects/create_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.project_id) {
            // Öffne Editor im gleichen Tab
            window.location.href = `editor/?project_id=${data.project_id}`;
        } else {
            alert('Fehler beim Erstellen des Projekts: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Erstellen des Projekts:', error);
        alert('Fehler beim Erstellen des Projekts');
    }
}

// Reiche Projekt ein (Status: check)
async function submitProject(projectId) {
    try {
        const response = await fetch('/api/projects/submit_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: projectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Projekte neu laden
            await loadProjects();
        } else {
            alert('Fehler beim Einreichen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Einreichen:', error);
        alert('Fehler beim Einreichen');
    }
}

// Veröffentliche Projekt (Status: published)
async function publishProject(projectId) {
    try {
        const response = await fetch('/api/projects/publish_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: projectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Projekte neu laden
            await loadProjects();
        } else {
            alert('Fehler beim Veröffentlichen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Veröffentlichen:', error);
        alert('Fehler beim Veröffentlichen');
    }
}

// Like Projekt
async function likeProject(projectId, buttonElement) {
    try {
        // Button deaktivieren während des Requests
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.style.opacity = '0.6';
        }
        
        const response = await fetch('/api/projects/like_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: projectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Button ausblenden oder deaktivieren
            if (buttonElement) {
                buttonElement.style.display = 'none';
            }
            
            // Like-Count aktualisieren
            const projectCard = document.querySelector(`[data-project-id="${projectId}"]`);
            if (projectCard) {
                const likesCountElement = projectCard.querySelector('.project-likes-count');
                if (likesCountElement) {
                    likesCountElement.innerHTML = `<i class="fas fa-heart"></i> ${data.like_count || 0}`;
                } else {
                    const metaInfo = projectCard.querySelector('.project-meta-info');
                    if (metaInfo) {
                        const likesCount = document.createElement('span');
                        likesCount.className = 'project-likes-count';
                        likesCount.innerHTML = `<i class="fas fa-heart"></i> ${data.like_count || 0}`;
                        metaInfo.appendChild(likesCount);
                    }
                }
            }
        } else {
            alert('Fehler beim Liken: ' + (data.error || 'Unbekannter Fehler'));
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error('Fehler beim Liken:', error);
        alert('Fehler beim Liken');
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.style.opacity = '1';
        }
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadFirstStudent();
});
