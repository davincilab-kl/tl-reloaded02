// Profil-Seite

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
    return localStorage.getItem('teacher_user_id') || null;
}

function getTeacherUserId() {
    return localStorage.getItem('teacher_user_id') || null;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentStudentId = null;

// Lade Privatsphäre-Einstellungen aus API
async function getPrivacySettings() {
    try {
        const response = await fetch(`/api/students/get_privacy_settings.php?student_id=${currentStudentId}`);
        const data = await response.json();
        
        if (data.success && data.settings) {
            return {
                profilePicture: data.settings.profile_picture_visible,
                name: data.settings.name_visible,
                stats: data.settings.stats_visible,
                scratchProjects: data.settings.scratch_projects_visible
            };
        }
    } catch (error) {
        console.error('Fehler beim Laden der Privatsphäre-Einstellungen:', error);
    }
    
    // Standard: alles sichtbar
    return {
        profilePicture: true,
        name: true,
        stats: true,
        scratchProjects: true
    };
}

// Speichere Privatsphäre-Einstellungen über API
async function savePrivacySettings(settings) {
    try {
        const response = await fetch('/api/students/update_privacy_settings.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: currentStudentId,
                profile_picture_visible: settings.profilePicture,
                name_visible: settings.name,
                stats_visible: settings.stats,
                scratch_projects_visible: settings.scratchProjects
            })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Fehler beim Speichern der Privatsphäre-Einstellungen:', data.error);
        }
    } catch (error) {
        console.error('Fehler beim Speichern der Privatsphäre-Einstellungen:', error);
    }
}

// Lade zuerst den ersten Schüler der Lehrkraft
async function loadFirstStudent() {
    const userId = await getCurrentUserId();
    if (!userId) {
        document.getElementById('profile-content').innerHTML = '<div class="error-messages">Keine User-ID gefunden</div>';
        return;
    }

    // Direkt loadProfile mit user_id aufrufen - keine separate API-Abfrage mehr nötig
    await loadProfile(userId);
}

// Lade Profil des Schülers
async function loadProfile(userId = null) {
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Profil...</span>
        </div>
    `;

    try {
        // Verwende user_id falls vorhanden, sonst student_id
        let apiUrl;
        if (userId) {
            apiUrl = `/api/students/get_profile.php?user_id=${userId}`;
        } else if (currentStudentId) {
            apiUrl = `/api/students/get_profile.php?student_id=${currentStudentId}`;
        } else {
            // Fallback: Hole user_id
            userId = await getCurrentUserId();
            if (!userId) {
                profileContent.innerHTML = '<div class="error-messages">Keine User-ID oder Student-ID gefunden</div>';
                return;
            }
            apiUrl = `/api/students/get_profile.php?user_id=${userId}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) {
            profileContent.innerHTML = `<div class="error-messages">Fehler: ${escapeHtml(data.error)}</div>`;
            return;
        }

        if (!data.success || !data.student) {
            profileContent.innerHTML = `<div class="error-messages">Fehler: Keine Student-Daten gefunden</div>`;
            return;
        }
        
        const student = data.student;
        
        // Setze currentStudentId für spätere Verwendung
        currentStudentId = student.id;
        
        // Speichere Student-Daten global für Wiederverwendung (z.B. im Avatar Builder)
        currentStudentData = data;
        
        // Verwende Daten aus der API-Antwort
        const privacySettings = {
            profilePicture: data.privacy_settings.profile_picture_visible,
            name: data.privacy_settings.name_visible,
            stats: data.privacy_settings.stats_visible,
            scratchProjects: data.privacy_settings.scratch_projects_visible
        };
        
        const currentLoggedInStudentId = data.current_logged_in_student_id;
        const projects = data.projects || [];

        // HTML zusammenbauen
        let html = `
            <div class="profile-controls">
                <button id="preview-btn" class="preview-btn">
                    <i class="fas fa-eye"></i>Was andere sehen
                </button>
            </div>
            <div class="profile-wrapper">
                <!-- Profilbild und Name -->
                <div class="profile-section profile-header" data-section="profileHeader" data-privacy-setting="profilePicture">
                    <div class="section-header">
                        <h2></h2>
                        <div class="privacy-toggle-container">
                            <label class="privacy-toggle">
                                <input type="checkbox" id="toggle-profile-header" ${privacySettings.profilePicture && privacySettings.name ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="privacy-label">Sichtbar</span>
                        </div>
                    </div>
                    <div class="profile-picture-container">
                        <div class="profile-picture" id="profile-picture" style="cursor: pointer;" onclick="openAvatarBuilder()">
                            ${getAvatarImage(student?.avatar_seed, student?.avatar_style)}
                        </div>
                    </div>
                    <div class="profile-name">${escapeHtml(student.name)}</div>
                </div>

                <!-- 3er Box mit Stats -->
                <div class="profile-section profile-stats" data-section="stats" data-privacy-setting="stats">
                    <div class="section-header">
                        <h2>Statistiken</h2>
                        <div class="privacy-toggle-container">
                            <label class="privacy-toggle">
                                <input type="checkbox" id="toggle-stats" ${privacySettings.stats ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="privacy-label">Sichtbar</span>
                        </div>
                    </div>
                    <div class="achievements-cards-container">
                        <!-- T!Coins Karte -->
                        <div class="achievement-card tcoins-card" id="tcoins-card">
                            <div class="card-content">
                                <div class="card-icon">
                                    <i class="fas fa-coins"></i>
                                </div>
                                <div class="card-label">T!Coins</div>
                                <div class="card-value">${student.t_coins.toLocaleString('de-DE')}</div>
                            </div>
                            <div class="card-extra">
                                <div class="click-hint">Klicken für Details</div>
                            </div>
                        </div>

                        <!-- Projekte Karte -->
                        <div class="achievement-card projects-card" id="projects-card">
                            <div class="card-content">
                                <div class="card-icon">
                                    <i class="fas fa-project-diagram"></i>
                                </div>
                                <div class="card-label">Veröffentlichte Projekte</div>
                                <div class="card-value">${student.projects_public || 0}</div>
                            </div>
                            <div class="card-extra">
                                <div class="click-hint">Klicken für Details</div>
                            </div>
                        </div>

                        <!-- Urkunden Karte -->
                        <div class="achievement-card certificates-card" id="certificates-card">
                            <div class="card-content">
                                <div class="card-icon">
                                    <i class="fas fa-certificate"></i>
                                </div>
                                <div class="card-label">Urkunden</div>
                                <div class="card-value" id="certificates-count">...</div>
                            </div>
                            <div class="card-extra">
                                <div class="click-hint">Klicken zum Anzeigen</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scratch-Projekte -->
                <div class="profile-section profile-scratch" data-section="scratchProjects" data-privacy-setting="scratchProjects">
                    <div class="section-header">
                        <h2>Scratch-Projekte</h2>
                        <div class="privacy-toggle-container">
                            <label class="privacy-toggle">
                                <input type="checkbox" id="toggle-scratch" ${privacySettings.scratchProjects ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="privacy-label">Sichtbar</span>
                        </div>
                    </div>
                    <div class="courses-grid">
                        ${projects.length > 0 ? projects.map(project => {
                            const status = project.status || 'working';
                            const statusIcon = status === 'published' ? 'fa-globe' : status === 'check' ? 'fa-check-circle' : 'fa-edit';
                            const statusText = status === 'published' ? 'Veröffentlicht' : status === 'check' ? 'Zur Prüfung' : 'In Arbeit';
                            const linkHtml = project.link ? `<a href="${escapeHtml(project.link)}" target="_blank" class="project-link-btn" onclick="event.stopPropagation();">
                                <i class="fas fa-external-link-alt"></i>
                            </a>` : '';
                            
                            // Prüfe ob Like-Button angezeigt werden soll (nur wenn nicht eigenes Projekt)
                            const canLike = currentLoggedInStudentId !== null && currentLoggedInStudentId !== project.student_id;
                            const likeButtonHtml = canLike ? `
                                <button class="project-like-btn" onclick="event.stopPropagation(); likeProject(${project.id}, this);" title="Projekt liken">
                                    <i class="far fa-heart"></i>
                                </button>
                            ` : '';
                            
                            return `
                                <div class="course-card scratch-project-card" ${project.link ? 'onclick="window.open(\'' + escapeHtml(project.link) + '\', \'_blank\')" style="cursor: pointer;"' : ''}>
                                    <div class="course-image">
                                        <i class="fas fa-code"></i>
                                    </div>
                                    <div class="course-content">
                                        <h3 class="course-title">${escapeHtml(project.title || 'Unbenanntes Projekt')}</h3>
                                        <p class="course-description">${escapeHtml(project.description || 'Keine Beschreibung verfügbar')}</p>
                                        <div class="project-meta-info">
                                            <span class="project-status-badge ${status}">
                                                <i class="fas ${statusIcon}"></i> ${statusText}
                                            </span>
                                            <span class="project-likes-count">
                                                <i class="fas fa-heart"></i> ${project.like_count || 0}
                                            </span>
                                        </div>
                                        <div class="project-actions">
                                            ${likeButtonHtml}
                                            ${linkHtml}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<div class="no-projects-message">Noch keine Projekte vorhanden</div>'}
                    </div>
                </div>
            </div>
        `;

        profileContent.innerHTML = html;

        // Event Listeners für Karten
        setupCardListeners();

        // Event Listeners für Toggle-Switches
        setupPrivacyToggles();

        // Event Listener für Vorschau-Button
        setupPreviewButton();

        // Lade Urkunden-Anzahl
        loadCertificatesCount();

    } catch (error) {
        console.error('Fehler beim Laden des Profils:', error);
        profileContent.innerHTML = '<div class="error-messages">Fehler beim Laden des Profils</div>';
    }
}

// Vorschau-Modus Status
let isPreviewMode = false;

// Event Listeners für Privatsphäre-Toggles
async function setupPrivacyToggles() {
    // Toggle für Profilbild und Name
    const toggleProfileHeader = document.getElementById('toggle-profile-header');
    if (toggleProfileHeader) {
        toggleProfileHeader.addEventListener('change', async (e) => {
            const privacySettings = await getPrivacySettings();
            privacySettings.profilePicture = e.target.checked;
            privacySettings.name = e.target.checked;
            await savePrivacySettings(privacySettings);
            // Aktualisiere Vorschau, falls aktiv
            if (isPreviewMode) {
                updatePreview();
            }
        });
    }

    // Toggle für Stats
    const toggleStats = document.getElementById('toggle-stats');
    if (toggleStats) {
        toggleStats.addEventListener('change', async (e) => {
            const privacySettings = await getPrivacySettings();
            privacySettings.stats = e.target.checked;
            await savePrivacySettings(privacySettings);
            // Aktualisiere Vorschau, falls aktiv
            if (isPreviewMode) {
                updatePreview();
            }
        });
    }

    // Toggle für Scratch-Projekte
    const toggleScratch = document.getElementById('toggle-scratch');
    if (toggleScratch) {
        toggleScratch.addEventListener('change', async (e) => {
            const privacySettings = await getPrivacySettings();
            privacySettings.scratchProjects = e.target.checked;
            await savePrivacySettings(privacySettings);
            // Aktualisiere Vorschau, falls aktiv
            if (isPreviewMode) {
                updatePreview();
            }
        });
    }
}

// Vorschau-Button Setup
function setupPreviewButton() {
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            isPreviewMode = !isPreviewMode;
            updatePreview();
            updatePreviewButton();
        });
    }
}

// Aktualisiere Vorschau-Button Text
function updatePreviewButton() {
    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        if (isPreviewMode) {
            previewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Vorschau beenden';
            previewBtn.classList.add('active');
        } else {
            previewBtn.innerHTML = '<i class="fas fa-eye"></i>Was andere sehen';
            previewBtn.classList.remove('active');
        }
    }
}

// Aktualisiere Vorschau basierend auf Privatsphäre-Einstellungen
async function updatePreview() {
    // Toggle-Container ausblenden/anzeigen
    const toggleContainers = document.querySelectorAll('.privacy-toggle-container');
    
    if (!isPreviewMode) {
        // Vorschau aus: Alles anzeigen, Toggles sichtbar
        document.querySelectorAll('[data-privacy-setting]').forEach(section => {
            section.style.display = '';
            section.style.opacity = '1';
        });
        toggleContainers.forEach(container => {
            container.style.display = '';
        });
        return;
    }

    // Vorschau an: Toggles ausblenden
    toggleContainers.forEach(container => {
        container.style.display = 'none';
    });

    // Vorschau an: Basierend auf Einstellungen anzeigen/verstecken
    const privacySettings = await getPrivacySettings();
    
    // Profilbild und Name
    const profileHeader = document.querySelector('[data-section="profileHeader"]');
    if (profileHeader) {
        const isVisible = privacySettings.profilePicture && privacySettings.name;
        profileHeader.style.display = isVisible ? '' : 'none';
        profileHeader.style.opacity = isVisible ? '1' : '0';
    }

    // Stats
    const statsSection = document.querySelector('[data-section="stats"]');
    if (statsSection) {
        const isVisible = privacySettings.stats;
        statsSection.style.display = isVisible ? '' : 'none';
        statsSection.style.opacity = isVisible ? '1' : '0';
    }

    // Scratch-Projekte
    const scratchSection = document.querySelector('[data-section="scratchProjects"]');
    if (scratchSection) {
        const isVisible = privacySettings.scratchProjects;
        scratchSection.style.display = isVisible ? '' : 'none';
        scratchSection.style.opacity = isVisible ? '1' : '0';
    }
}

// Lade Urkunden-Anzahl
async function loadCertificatesCount() {
    try {
        const response = await fetch(`/api/students/get_student_certificates.php?student_id=${currentStudentId}`);
        const data = await response.json();
        
        if (data.success) {
            const count = data.certificates ? data.certificates.length : 0;
            const countElement = document.getElementById('certificates-count');
            if (countElement) {
                countElement.textContent = count;
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der Urkunden-Anzahl:', error);
        const countElement = document.getElementById('certificates-count');
        if (countElement) {
            countElement.textContent = '0';
        }
    }
}

// Event Listeners für Karten
function setupCardListeners() {
    // T!Coins Karte - Modal öffnen
    const tcoinsCard = document.getElementById('tcoins-card');
    if (tcoinsCard) {
        tcoinsCard.addEventListener('click', () => {
            openTcoinsModal();
        });
        tcoinsCard.style.cursor = 'pointer';
    }

    // Projekte Karte - Navigation
    const projectsCard = document.getElementById('projects-card');
    if (projectsCard) {
        projectsCard.addEventListener('click', () => {
            window.location.href = '/students/projects/index.php';
        });
        projectsCard.style.cursor = 'pointer';
    }

    // Urkunden Karte - Modal öffnen
    const certificatesCard = document.getElementById('certificates-card');
    if (certificatesCard) {
        certificatesCard.addEventListener('click', () => {
            openCertificatesModal();
        });
        certificatesCard.style.cursor = 'pointer';
    }
}

// T!Coins Modal öffnen
function openTcoinsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-coins"></i> Wie verdiene ich T!Coins?</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="tcoins-info-list">
                    <div class="tcoins-info-item">
                        <div class="tcoins-info-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="tcoins-info-content">
                            <div class="tcoins-info-title">Avatar erstellen</div>
                            <div class="tcoins-info-amount">+1 T!Coin</div>
                        </div>
                    </div>
                    <div class="tcoins-info-item">
                        <div class="tcoins-info-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="tcoins-info-content">
                            <div class="tcoins-info-title">Lektion abschließen</div>
                            <div class="tcoins-info-amount">+1 T!Coin pro Lektion</div>
                        </div>
                    </div>
                    <div class="tcoins-info-item">
                        <div class="tcoins-info-icon">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                        <div class="tcoins-info-content">
                            <div class="tcoins-info-title">Projekt veröffentlichen</div>
                            <div class="tcoins-info-amount">+5 T!Coins pro Projekt</div>
                        </div>
                    </div>
                    <div class="tcoins-info-item">
                        <div class="tcoins-info-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="tcoins-info-content">
                            <div class="tcoins-info-title">Like erhalten</div>
                            <div class="tcoins-info-amount">+1 T!Coin pro Like</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Schließen bei Klick außerhalb
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Urkunden Modal öffnen
async function openCertificatesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-certificate"></i> Meine Urkunden</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="loading-messages">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Lade Urkunden...</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Lade Urkunden
    try {
        const response = await fetch(`/api/students/get_student_certificates.php?student_id=${currentStudentId}`);
        const data = await response.json();
        
        const modalBody = modal.querySelector('.modal-body');
        if (data.success && data.certificates && data.certificates.length > 0) {
            let certificatesHtml = '<div class="certificates-list">';
            data.certificates.forEach(cert => {
                const earnedDate = new Date(cert.earned_date).toLocaleDateString('de-DE');
                const thumbnailHtml = cert.image_path ? `
                    <div class="certificate-thumbnail">
                        <img src="${escapeHtml(cert.image_path)}" alt="${escapeHtml(cert.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="certificate-thumbnail-fallback" style="display: none;">
                            <i class="fas fa-certificate"></i>
                        </div>
                    </div>
                ` : `
                    <div class="certificate-thumbnail">
                        <div class="certificate-thumbnail-fallback">
                            <i class="fas fa-certificate"></i>
                        </div>
                    </div>
                `;
                
                certificatesHtml += `
                    <div class="certificate-item">
                        ${thumbnailHtml}
                        <div class="certificate-content">
                            <div class="certificate-title">${escapeHtml(cert.title)}</div>
                            ${cert.description ? `<div class="certificate-description">${escapeHtml(cert.description)}</div>` : ''}
                            <div class="certificate-date">Erhalten am: ${earnedDate}</div>
                        </div>
                        ${cert.image_path ? `
                            <a href="${escapeHtml(cert.image_path)}" target="_blank" class="certificate-download-btn" title="Urkunde öffnen">
                                <i class="fas fa-external-link-alt"></i> Öffnen
                            </a>
                        ` : ''}
                    </div>
                `;
            });
            certificatesHtml += '</div>';
            modalBody.innerHTML = certificatesHtml;
        } else {
            modalBody.innerHTML = '<div class="no-certificates">Noch keine Urkunden vorhanden</div>';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Urkunden:', error);
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = '<div class="error-messages">Fehler beim Laden der Urkunden</div>';
    }
    
    // Schließen bei Klick außerhalb
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Like-Projekt Funktion
async function likeProject(projectId, buttonElement) {
    try {
        // Button deaktivieren während des Requests
        buttonElement.disabled = true;
        buttonElement.style.opacity = '0.6';
        
        const response = await fetch('/api/projects/like_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: projectId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Button ausblenden oder deaktivieren
            buttonElement.style.display = 'none';
            
            // Like-Count aktualisieren
            const projectCard = buttonElement.closest('.scratch-project-card');
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
        } else {
            alert('Fehler beim Liken: ' + (data.error || 'Unbekannter Fehler'));
            buttonElement.disabled = false;
            buttonElement.style.opacity = '1';
        }
    } catch (error) {
        console.error('Fehler beim Liken des Projekts:', error);
        alert('Fehler beim Liken des Projekts');
        buttonElement.disabled = false;
        buttonElement.style.opacity = '1';
    }
}

// Avatar-Funktionen
function getAvatarImage(avatarSeed, avatarStyle) {
    // Prüfe ob avatarSeed vorhanden und nicht leer ist
    if (!avatarSeed || avatarSeed === null || avatarSeed === undefined || avatarSeed === '') {
        return '<img src="/imgs/profile_placeholder.png" alt="Profilbild">';
    }
    const style = avatarStyle || 'avataaars';
    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(avatarSeed)}`;
    return `<img src="${avatarUrl}" alt="Profilbild" onerror="this.src='/imgs/profile_placeholder.png'">`;
}

function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Speichere die aktuellen Student-Daten global, um sie wiederzuverwenden
let currentStudentData = null;

// Avatar Builder Modal öffnen
function openAvatarBuilder() {
    // Verwende bereits geladene Student-Daten, falls verfügbar
    if (currentStudentData && currentStudentData.student) {
        const currentSeed = currentStudentData.student.avatar_seed || generateRandomSeed();
        const currentStyle = currentStudentData.student.avatar_style || 'avataaars';
        showAvatarBuilderModal(currentSeed, currentStyle);
        return;
    }
    
    // Fallback: Hole Avatar-Daten von API (sollte normalerweise nicht nötig sein)
    fetch(`/api/students/get_profile.php?student_id=${currentStudentId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.student) {
                const currentSeed = data.student.avatar_seed || generateRandomSeed();
                const currentStyle = data.student.avatar_style || 'avataaars';
                showAvatarBuilderModal(currentSeed, currentStyle);
            } else {
                showAvatarBuilderModal(generateRandomSeed(), 'avataaars');
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Avatar-Daten:', error);
            showAvatarBuilderModal(generateRandomSeed(), 'avataaars');
        });
}

// Avatar Builder Modal anzeigen
function showAvatarBuilderModal(currentSeed, currentStyle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay avatar-builder-modal';
    
    const avatarStyles = [
        { value: 'avataaars', label: 'Avataaars', icon: '👤' },
        { value: 'bottts', label: 'Bottts', icon: '🤖' },
        { value: 'identicon', label: 'Identicon', icon: '🔷' },
        { value: 'initials', label: 'Initials', icon: '🔤' },
        { value: 'micah', label: 'Micah', icon: '😊' },
        { value: 'openPeeps', label: 'Open Peeps', icon: '👥' },
        { value: 'personas', label: 'Personas', icon: '🎭' },
        { value: 'pixelArt', label: 'Pixel Art', icon: '🎨' },
        { value: 'shapes', label: 'Shapes', icon: '🔺' },
        { value: 'thumbs', label: 'Thumbs', icon: '👍' }
    ];
    
    let selectedStyle = currentStyle;
    let selectedSeed = currentSeed;
    
    const updatePreview = () => {
        const previewImg = modal.querySelector('#avatar-preview img');
        if (previewImg) {
            const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(selectedSeed)}`;
            previewImg.src = avatarUrl;
        }
    };
    
    const styleOptionsHtml = avatarStyles.map(style => 
        `<button class="avatar-style-option ${style.value === selectedStyle ? 'active' : ''}" 
                 data-style="${style.value}" 
                 onclick="selectAvatarStyle('${style.value}', this)">
            <span class="style-icon">${style.icon}</span>
            <span class="style-label">${style.label}</span>
        </button>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content avatar-builder-content">
            <div class="modal-header">
                <h2><i class="fas fa-user-circle"></i> Avatar erstellen</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body avatar-builder-body">
                <div class="avatar-preview-container">
                    <div id="avatar-preview" class="avatar-preview">
                        <img src="https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(selectedSeed)}" alt="Avatar Vorschau">
                    </div>
                </div>
                <div class="avatar-controls">
                    <div class="avatar-style-selection">
                        <h3>Avatar-Stil wählen</h3>
                        <div class="avatar-styles-grid">
                            ${styleOptionsHtml}
                        </div>
                    </div>
                    <div class="avatar-seed-controls">
                        <h3>Avatar anpassen</h3>
                        <div class="seed-input-group">
                            <button class="btn-random-seed" onclick="generateNewSeed()">
                                <i class="fas fa-random"></i> Neuer Avatar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer avatar-builder-footer">
                <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">
                    Abbrechen
                </button>
                <button class="btn-save-avatar" onclick="saveAvatar()">
                    <i class="fas fa-save"></i> Avatar speichern
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Globale Funktionen für das Modal
    window.selectAvatarStyle = function(style, buttonElement) {
        selectedStyle = style;
        // Aktiviere den ausgewählten Button
        modal.querySelectorAll('.avatar-style-option').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
        // Generiere neuen Seed für den neuen Style
        selectedSeed = generateRandomSeed();
        updatePreview();
    };
    
    window.generateNewSeed = function() {
        selectedSeed = generateRandomSeed();
        updatePreview();
    };
    
    window.saveAvatar = async function() {
        try {
            // Hole user_id für den aktuellen Student
            let userId = null;
            
            // Verwende bereits geladene Daten falls vorhanden
            if (currentStudentData && currentStudentData.student && currentStudentData.student.user_id) {
                userId = currentStudentData.student.user_id;
            } else {
                // Fallback: Hole aus API
                try {
                    const studentResponse = await fetch(`/api/students/get_profile.php?student_id=${currentStudentId}`);
                    const studentData = await studentResponse.json();
                    if (studentData.success && studentData.student && studentData.student.user_id) {
                        userId = studentData.student.user_id;
                    }
                } catch (error) {
                    console.error('Fehler beim Laden der Student-Daten:', error);
                }
                
                // Fallback: Versuche user_id aus Session zu holen
                if (!userId) {
                    userId = await getCurrentUserId();
                }
            }
            
            if (!userId) {
                alert('Fehler: Keine User-ID gefunden');
                return;
            }
            
            const response = await fetch('/api/students/update_avatar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    student_id: currentStudentId, // Für Rückwärtskompatibilität
                    avatar_seed: selectedSeed,
                    avatar_style: selectedStyle
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Avatar erfolgreich gespeichert - Profil neu laden
                modal.remove();
                await loadProfile();
                
                // Event auslösen, um Hauptmenü zu aktualisieren
                window.dispatchEvent(new Event('avatarUpdated'));
                
                // Optional: T!Coin für Avatar-Erstellung vergeben (falls noch nicht geschehen)
                // Dies könnte in der API implementiert werden
            } else {
                alert('Fehler beim Speichern: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Avatars:', error);
            alert('Fehler beim Speichern des Avatars');
        }
    };
    
    // Schließen bei Klick außerhalb
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadFirstStudent();
});
