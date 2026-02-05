// Projekte der gesamten Schule

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Lade Projekte der eigenen Klasse
async function loadClassProjects() {
    const projectsContent = document.getElementById('projects-content');
    
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

        const response = await fetch('/api/projects/get_own_class_projects.php', { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        const data = await response.json();
        
        if (data.error) {
            projectsContent.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(data.error)}</span>
                </div>
            `;
            return;
        }
        
        // Überschrift mit Schulnamen aktualisieren (nur Schulname)
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && data.school_name) {
            pageTitle.innerHTML = escapeHtml(data.school_name);
        }
        
        const projects = data.projects || [];
        
        if (projects.length === 0) {
            projectsContent.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Noch keine Projekte in deiner Schule vorhanden</span>
                </div>
            `;
            return;
        }
        
        // Projekte nach Klassen gruppieren
        const projectsByClass = {};
        projects.forEach(project => {
            const className = project.class_name || 'Keine Klasse';
            if (!projectsByClass[className]) {
                projectsByClass[className] = {
                    class_id: project.class_id,
                    projects: []
                };
            }
            projectsByClass[className].projects.push(project);
        });

        // Rendere Sections für jede Klasse
        projectsContent.innerHTML = '';
        
        // Hole eigene Klasse
        const ownClassId = data.own_class_id;
        const ownClassName = data.own_class_name;
        
        // Sortiere Klassen: eigene Klasse zuerst, dann alphabetisch
        const sortedClassNames = Object.keys(projectsByClass).sort((a, b) => {
            const aIsOwn = projectsByClass[a].class_id === ownClassId;
            const bIsOwn = projectsByClass[b].class_id === ownClassId;
            
            if (aIsOwn && !bIsOwn) return -1;
            if (!aIsOwn && bIsOwn) return 1;
            return a.localeCompare(b, 'de');
        });

        sortedClassNames.forEach(className => {
            const classData = projectsByClass[className];
            const classProjects = classData.projects;
            const isOwnClass = classData.class_id === ownClassId;
            
            // Erstelle Section für die Klasse
            const section = document.createElement('section');
            section.className = isOwnClass ? 'class-section own-class' : 'class-section';
            
            const sectionHeader = document.createElement('h2');
            sectionHeader.className = 'class-section-header';
            
            // Überschrift: "Meine Klasse <Klassenname>" für eigene Klasse, sonst nur Klassenname
            const headerText = isOwnClass && ownClassName 
                ? `Meine Klasse ${escapeHtml(ownClassName)}` 
                : escapeHtml(className);
            
            sectionHeader.innerHTML = `<i class="fas fa-users"></i> ${headerText} <span class="project-count">(${classProjects.length})</span>`;
            
            const projectsGrid = document.createElement('div');
            projectsGrid.className = 'card-grid';
            
            section.appendChild(sectionHeader);
            section.appendChild(projectsGrid);
            projectsContent.appendChild(section);

            classProjects.forEach(project => {
            const status = project.status || 'working';
            const likeCount = project.like_count || 0;
            
            // Prüfe ob Like-Button angezeigt werden soll (nur wenn nicht eigenes Projekt und veröffentlicht)
            const canLike = currentLoggedInStudentId !== null && currentLoggedInStudentId !== project.student_id && status === 'published';
            
            // Status-Anzeige
            const statusIcon = status === 'published' ? 'fa-globe' : status === 'check' ? 'fa-check-circle' : 'fa-edit';
            const statusText = status === 'published' ? 'Veröffentlicht' : status === 'check' ? 'Zur Prüfung' : 'In Arbeit';
            
            const linkHtml = project.link ? `<a href="${escapeHtml(project.link)}" target="_blank" class="project-link-btn" onclick="event.stopPropagation();">
                <i class="fas fa-external-link-alt"></i>
            </a>` : '';
            
            const projectCard = document.createElement('div');
            projectCard.className = 'card scratch-project-card';
            projectCard.dataset.projectId = project.id;
            if (project.link) {
                projectCard.onclick = () => window.open(escapeHtml(project.link), '_blank');
                projectCard.style.cursor = 'pointer';
            }
            
            projectCard.innerHTML = `
                <div class="card-image">
                    <i class="fas fa-code"></i>
                </div>
                <div class="card-content">
                    <div class="project-student-name">
                        <i class="fas fa-user"></i> ${escapeHtml(project.student_name)}
                    </div>
                    <h3 class="card-title">${escapeHtml(project.title || 'Unbenanntes Projekt')}</h3>
                    <p class="card-description">${escapeHtml(project.description || 'Keine Beschreibung verfügbar')}</p>
                    <div class="project-meta-info">
                        <span class="project-status-badge ${status}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        ${canLike ? `<button class="project-like-btn" data-project-id="${project.id}" onclick="event.stopPropagation();" title="Projekt liken">
                            <i class="far fa-heart"></i> ${likeCount || 0}
                        </button>` : `<span class="project-likes-count">
                            <i class="fas fa-heart"></i> ${likeCount || 0}
                        </span>`}
                    </div>
                    <div class="project-actions">
                        ${linkHtml}
                    </div>
                </div>
            `;
                projectsGrid.appendChild(projectCard);
            });
        });
        
        // Event Listeners für Like-Buttons
        document.querySelectorAll('.project-like-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const projectId = parseInt(this.dataset.projectId);
                await likeProject(projectId, this);
            });
        });

    } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        projectsContent.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Projekte</span>
            </div>
        `;
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
            // Herz füllen und Anzahl aktualisieren
            if (buttonElement) {
                const heartIcon = buttonElement.querySelector('i');
                if (heartIcon) {
                    heartIcon.className = 'fas fa-heart';
                }
                buttonElement.innerHTML = `<i class="fas fa-heart"></i> ${data.like_count || 0}`;
                buttonElement.disabled = false;
                buttonElement.style.opacity = '1';
                buttonElement.classList.remove('project-like-btn');
                buttonElement.classList.add('project-likes-count');
                buttonElement.disabled = true;
                buttonElement.style.cursor = 'default';
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

// Tab-Funktionalität
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Alle Tabs deaktivieren
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Aktiven Tab aktivieren
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
            
            // Bestenliste laden, wenn Tab aktiviert wird
            if (targetTab === 'leaderboard') {
                loadLeaderboard();
            }
        });
    });
}

// Lade Bestenliste
async function loadLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboard-content');
    
    try {
        const response = await fetch('/api/schools/get_school_top_classes.php', { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        const data = await response.json();
        
        if (data.error) {
            leaderboardContent.innerHTML = `
                <div class="error-messages">
                    <i class="fas fa-exclamation-triangle text-warning"></i>
                    <span>${escapeHtml(data.error)}</span>
                </div>
            `;
            return;
        }
        
        const classes = data.classes || [];
        
        if (classes.length === 0) {
            leaderboardContent.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-info-circle"></i>
                    <span>Noch keine Klassen mit T!Score vorhanden</span>
                </div>
            `;
            return;
        }
        
        // Rendere Bestenliste
        leaderboardContent.innerHTML = `
            <div class="leaderboard-container">
                <h2 class="leaderboard-title">
                    <i class="fas fa-trophy"></i> Top 3 Klassen
                </h2>
                <div class="leaderboard-list">
                    ${classes.map(cls => {
                        const medalIcon = cls.rank === 1 ? 'fa-medal' : cls.rank === 2 ? 'fa-medal' : 'fa-medal';
                        return `
                            <div class="leaderboard-item rank-${cls.rank}">
                                <div class="leaderboard-rank">
                                    <i class="fas ${medalIcon}"></i>
                                    <span class="rank-number">${cls.rank}</span>
                                </div>
                                <div class="leaderboard-class-info">
                                    <h3 class="class-name">${escapeHtml(cls.name)}</h3>
                                    <div class="class-stats">
                                        <span class="stat-item">
                                            <i class="fas fa-users"></i> ${cls.student_count} Schüler
                                        </span>
                                        <span class="stat-item">
                                            <i class="fas fa-coins"></i> ${cls.total_t_coins.toLocaleString('de-DE')} T-Coins
                                        </span>
                                    </div>
                                </div>
                                <div class="leaderboard-score">
                                    <div class="score-label">T!Score</div>
                                    <div class="score-value">${cls.avg_t_coins.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Fehler beim Laden der Bestenliste:', error);
        leaderboardContent.innerHTML = `
            <div class="error-messages">
                <i class="fas fa-exclamation-triangle text-warning"></i>
                <span>Fehler beim Laden der Bestenliste</span>
            </div>
        `;
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadClassProjects();
});
