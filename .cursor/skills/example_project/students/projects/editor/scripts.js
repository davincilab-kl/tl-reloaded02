// Scratch Editor Integration

let currentProjectId = null;
let scratchEditor = null;
let autoSaveInterval = null;
let lastSaveTime = null;
let isSaving = false;

// Initialisierung
document.addEventListener('DOMContentLoaded', async function() {
    currentProjectId = window.PROJECT_ID;
    
    if (!currentProjectId) {
        alert('Keine Projekt-ID gefunden. Bitte wählen Sie ein Projekt aus der Projekt-Übersicht.');
        window.close(); // Schließe Tab, da kein Zurück-Link vorhanden
        return;
    }

    // Lade Projekt-Daten
    await loadProject();
    
    // Initialisiere Scratch Editor
    await initializeScratchEditor();
    
    // Auto-Save starten (alle 30 Sekunden)
    startAutoSave();
});

// Lade Projekt-Daten
async function loadProject() {
    try {
        const response = await fetch(`/api/projects/load_project_data.php?project_id=${currentProjectId}`);
        const data = await response.json();
        
        if (data.success) {
            // Speichere Projekt-Daten für Scratch Editor
            // (Status-Prüfung erfolgt bereits in index.php, bevor Scratch-GUI geladen wird)
            window.projectData = data.project_data;
            window.projectTitle = data.title;
            
            // Zeige Einreichen-Button wenn Projekt Status "working" hat
            // (Status wird später aus der Projekt-Liste geladen)
        } else {
            alert('Fehler beim Laden des Projekts: ' + (data.error || 'Unbekannter Fehler'));
            window.close(); // Schließe Tab, da kein Zurück-Link vorhanden
        }
    } catch (error) {
        console.error('Fehler beim Laden des Projekts:', error);
        alert('Fehler beim Laden des Projekts');
        window.close(); // Schließe Tab, da kein Zurück-Link vorhanden
    }
}

// Initialisiere Scratch Editor
async function initializeScratchEditor() {
    const wrapper = document.getElementById('scratch-editor-wrapper');
    const config = window.EDITOR_CONFIG || {};
    
    try {
        // Erstelle iframe für Scratch Editor
        const iframe = document.createElement('iframe');
        iframe.id = 'scratch-editor-iframe';
        
        // Baue URL mit Konfigurations-Parametern - direkt auf Build-Ordner
        let scratchUrl = './tmp/scratch-gui/build/index.html';
        const urlParams = new URLSearchParams();
        
        // Konvertiere Konfiguration zu URL-Parametern für Scratch GUI
        if (config.hideFileMenu) urlParams.set('hide_file_menu', '1');
        if (config.hideEditMenu) urlParams.set('hide_edit_menu', '1');
        if (config.hideTutorials) urlParams.set('hide_tutorials', '1');
        if (config.hideShare) urlParams.set('hide_share', '1');
        if (config.hideSave) urlParams.set('hide_save', '1');
        if (config.hideLoad) urlParams.set('hide_load', '1');
        if (config.hidePublish) urlParams.set('hide_publish', '1');
        if (config.hideSpriteLibrary) urlParams.set('hide_sprite_library', '1');
        if (config.hideBackdropLibrary) urlParams.set('hide_backdrop_library', '1');
        if (config.hideSoundLibrary) urlParams.set('hide_sound_library', '1');
        if (config.hideExtensionLibrary) urlParams.set('hide_extension_library', '1');
        if (config.hideExtensionButton) urlParams.set('hide_extension_button', '1');
        if (config.hideCostumesTab) urlParams.set('hide_costumes_tab', '1');
        if (config.hideSoundsTab) urlParams.set('hide_sounds_tab', '1');
        if (config.hideCodeTab) urlParams.set('hide_code_tab', '1');
        if (config.mode) urlParams.set('mode', config.mode);
        // Block-Kategorien
        if (config.hideCategoryMotion) urlParams.set('hide_category_motion', '1');
        if (config.hideCategoryLooks) urlParams.set('hide_category_looks', '1');
        if (config.hideCategorySound) urlParams.set('hide_category_sound', '1');
        if (config.hideCategoryEvent) urlParams.set('hide_category_event', '1');
        if (config.hideCategoryControl) urlParams.set('hide_category_control', '1');
        if (config.hideCategorySensing) urlParams.set('hide_category_sensing', '1');
        if (config.hideCategoryOperators) urlParams.set('hide_category_operators', '1');
        if (config.hideCategoryData) urlParams.set('hide_category_data', '1');
        if (config.hideCategoryProcedures) urlParams.set('hide_category_procedures', '1');
        
        if (urlParams.toString()) {
            scratchUrl += '?' + urlParams.toString();
        }
        
        iframe.src = scratchUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        
        // Warte bis iframe geladen ist
        iframe.onload = function() {
            scratchEditor = iframe.contentWindow;
            
            // Sende Konfiguration auch über postMessage (falls nötig)
            if (scratchEditor && config) {
                scratchEditor.postMessage({
                    type: 'editorConfig',
                    config: config
                }, '*');
            }
            
            // Sende Projekt-ID an Scratch Editor
            if (scratchEditor && currentProjectId) {
                scratchEditor.postMessage({
                    type: 'setProjectId',
                    projectId: currentProjectId
                }, '*');
            }
            
            // Event Listener für postMessage von Scratch Editor
            window.addEventListener('message', handleScratchMessage);
            
            // Lade Projekt-Daten in Scratch Editor (falls vorhanden)
            // Warte kurz, damit die VM initialisiert ist
            if (window.projectData) {
                setTimeout(() => {
                    loadProjectIntoScratch(window.projectData);
                }, 500); // Warte 500ms, damit die VM bereit ist
            }
            
            // Fade-Out des Loading-Screens und Fade-In des Editors mit 200ms Verzögerung
            setTimeout(() => {
                const loading = wrapper.querySelector('.loading-messages');
                if (loading) {
                    // Füge 'loaded' Klasse zum iframe hinzu für Fade-In
                    iframe.classList.add('loaded');
                    
                    // Fade-Out des Loading-Screens
                    loading.classList.add('fade-out');
                    
                    // Entferne Loading-Screen nach Animation
                    setTimeout(() => {
                        loading.style.display = 'none';
                    }, 500); // Warte bis Fade-Out Animation fertig ist
                }
            }, 200); // 200ms Verzögerung vor dem Fade-Effekt
        };
        
        wrapper.appendChild(iframe);
        
    } catch (error) {
        console.error('Fehler beim Initialisieren des Scratch Editors:', error);
        wrapper.innerHTML = '<div class="error-messages">Fehler beim Laden des Scratch Editors. Bitte stellen Sie sicher, dass Scratch korrekt installiert ist.</div>';
    }
}

// Lade Projekt-Daten in Scratch Editor
function loadProjectIntoScratch(projectData) {
    // Sende loadProjectData-Nachricht an Scratch Editor
    if (scratchEditor && projectData) {
        scratchEditor.postMessage({
            type: 'loadProjectData',
            projectData: projectData,
            title: window.projectTitle || ''
        }, '*');
    }
}

// Event Listener einrichten (minimal - keine Header-Elemente mehr)
function setupEventListeners() {
    // Warnung beim Verlassen der Seite, wenn ungespeicherte Änderungen
    window.addEventListener('beforeunload', (e) => {
        if (isSaving) {
            e.preventDefault();
            e.returnValue = 'Projekt wird gespeichert. Bitte warten Sie...';
            return e.returnValue;
        }
    });
}

// Speichere Projekt
async function saveProject(showFeedback = true, titleOnly = false) {
    if (isSaving) {
        return;
    }
    
    isSaving = true;
    
    try {
        // Hole Projekt-Daten aus Scratch Editor
        let projectData = null;
        if (!titleOnly && scratchEditor) {
            // Versuche Projekt-Daten aus Scratch Editor zu extrahieren
            // Hinweis: Die genaue API hängt von der Scratch-Version ab
            try {
                // Beispiel: scratchEditor.Scratch.vm.exportProject()
                // Dies muss an die tatsächliche Scratch API angepasst werden
                projectData = getProjectDataFromScratch();
            } catch (error) {
                console.error('Fehler beim Extrahieren der Projekt-Daten:', error);
            }
        }
        
        // Hole Projekt-Titel (aus window.projectTitle, falls vorhanden)
        const title = window.projectTitle || null;
        
        // Sende Daten an API
        const response = await fetch('/api/projects/save_project_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: currentProjectId,
                project_data: projectData,
                title: title
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            lastSaveTime = new Date();
            console.log('Projekt erfolgreich gespeichert');
            // Sende Erfolgs-Nachricht an Scratch Editor (auch bei Auto-Save)
            if (scratchEditor) {
                scratchEditor.postMessage({
                    type: 'saveProjectSuccess',
                    message: showFeedback ? 'Erfolgreich!' : 'Auto-gespeichert'
                }, '*');
            }
        } else {
            throw new Error(data.error || 'Unbekannter Fehler');
        }
        
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        if (showFeedback) {
            alert('Fehler beim Speichern: ' + error.message);
        }
    } finally {
        isSaving = false;
    }
}

// Hole Projekt-Daten aus Scratch Editor
function getProjectDataFromScratch() {
    // Diese Funktion muss an die tatsächliche Scratch API angepasst werden
    // Beispiel-Implementierung:
    if (scratchEditor && scratchEditor.Scratch) {
        try {
            // Versuche Projekt zu exportieren
            // return scratchEditor.Scratch.vm.exportProject();
            return null; // Placeholder
        } catch (error) {
            console.error('Fehler beim Exportieren des Projekts:', error);
            return null;
        }
    }
    return null;
}

// Auto-Save starten
function startAutoSave() {
    // Speichere alle 30 Sekunden automatisch
    autoSaveInterval = setInterval(() => {
        if (!isSaving && scratchEditor) {
            saveProject(false);
        }
    }, 30000); // 30 Sekunden
}

// Auto-Save stoppen
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Reiche Projekt ein
async function submitProject() {
    if (!confirm('Möchten Sie das Projekt wirklich einreichen? Nach dem Einreichen können Sie es nicht mehr bearbeiten, bis es freigegeben wurde.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/projects/submit_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ project_id: currentProjectId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Projekt erfolgreich eingereicht!');
            window.close(); // Schließe Tab, da kein Zurück-Link vorhanden
        } else {
            alert('Fehler beim Einreichen: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Einreichen:', error);
        alert('Fehler beim Einreichen');
    }
}

// Handle postMessage von Scratch Editor
function handleScratchMessage(event) {
    // Sicherheitsprüfung: Nur Nachrichten von unserem iframe akzeptieren
    if (event.source !== scratchEditor) {
        return;
    }
    
    const message = event.data;
    
    switch (message.type) {
        case 'saveProject':
            // Speichere Projekt mit Screenshot
            saveProjectFromScratch(message.projectData, message.title, message.coverImage);
            break;
        case 'getStageScreenshot':
            // Screenshot wurde vom Scratch Editor gesendet
            if (message.screenshot) {
                // Speichere Screenshot temporär für nächsten Save
                window.pendingCoverImage = message.screenshot;
            }
            break;
        case 'openLoadProjectModal':
            // Öffne Load-Modal
            openLoadProjectModal();
            break;
        case 'openPublishProjectModal':
            // Prüfe zuerst, ob Projekt bearbeitbar ist
            checkProjectEditableBeforePublish();
            break;
        case 'navigateToProjects':
            // Navigiere zur Projekt-Übersichtsseite
            window.location.href = '/students/projects/';
            break;
        case 'projectPublished':
            // Projekt wurde veröffentlicht
            console.log('Projekt wurde veröffentlicht');
            break;
    }
}

// Öffne Load Project Modal
async function openLoadProjectModal() {
    const modal = document.getElementById('load-project-modal');
    const loading = document.getElementById('load-project-loading');
    const error = document.getElementById('load-project-error');
    const list = document.getElementById('load-project-list');
    
    modal.style.display = 'flex';
    loading.style.display = 'block';
    error.style.display = 'none';
    list.style.display = 'none';
    
    try {
        // Hole student_id
        const studentResponse = await fetch('/api/students/get_current_student_id.php');
        const studentData = await studentResponse.json();
        
        if (!studentData.success || !studentData.student_id) {
            error.textContent = 'Keine Student-ID gefunden';
            error.style.display = 'block';
            loading.style.display = 'none';
            return;
        }

        // Hole Projekte
        const projectsResponse = await fetch(`/api/projects/get_student_projects.php?student_id=${studentData.student_id}`);
        const projectsData = await projectsResponse.json();

        if (projectsData.error) {
            error.textContent = projectsData.error;
            error.style.display = 'block';
            loading.style.display = 'none';
            return;
        }

        // Filtere Scratch-Projekte
        // Ein Projekt ist ein Scratch-Projekt, wenn es project_data hat (Scratch-Projektdatei)
        // Zeige nur Projekte mit Status "working" (nicht "check" oder "published")
        const scratchProjects = (projectsData.projects || []).filter(project => {
            // Nur Projekte mit Status "working" anzeigen
            const projectStatus = project.status || 'working';
            if (projectStatus !== 'working') {
                return false;
            }
            // Wenn project_data vorhanden -> Scratch-Projekt
            if (project.has_project_data) {
                return true;
            }
            // Zeige auch neue Projekte ohne project_data (können bearbeitet werden)
            return true;
        });

        loading.style.display = 'none';
        
        if (scratchProjects.length === 0) {
            error.textContent = 'Keine Scratch-Projekte gefunden';
            error.style.display = 'block';
            return;
        }

        // Rendere Projekt-Liste
        list.innerHTML = '';
        scratchProjects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.onclick = () => {
                loadProjectById(project.id);
                closeLoadProjectModal();
            };
            
            const title = document.createElement('div');
            title.className = 'project-item-title';
            title.textContent = project.title || `Projekt #${project.id}`;
            
            if (project.description) {
                const desc = document.createElement('div');
                desc.className = 'project-item-description';
                desc.textContent = project.description;
                item.appendChild(title);
                item.appendChild(desc);
            } else {
                item.appendChild(title);
            }
            
            list.appendChild(item);
        });
        
        list.style.display = 'block';
    } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        loading.style.display = 'none';
        error.textContent = 'Fehler beim Laden der Projekte';
        error.style.display = 'block';
    }
}

// Schließe Load Project Modal
function closeLoadProjectModal() {
    document.getElementById('load-project-modal').style.display = 'none';
}

// Zeige Modal, dass Projekt nicht bearbeitbar ist
function showProjectNotEditableModal(status) {
    const modal = document.getElementById('project-not-editable-modal');
    const messageDiv = document.getElementById('project-not-editable-message');
    
    let message = '';
    if (status === 'check') {
        message = 'Dieses Projekt wurde zur Prüfung eingereicht und kann nicht mehr bearbeitet werden, bis es von der Lehrkraft freigegeben oder abgelehnt wurde.';
    } else if (status === 'published') {
        message = 'Dieses Projekt wurde bereits veröffentlicht und kann nicht mehr bearbeitet werden.';
    } else {
        message = 'Dieses Projekt kann nicht bearbeitet werden.';
    }
    
    messageDiv.textContent = message;
    modal.style.display = 'flex';
}

// Schließe Modal, dass Projekt nicht bearbeitbar ist
function closeProjectNotEditableModal() {
    const modal = document.getElementById('project-not-editable-modal');
    modal.style.display = 'none';
    // Navigiere zur Projekt-Übersichtsseite
    window.location.href = '/students/projects/';
}

// Prüfe ob Projekt bearbeitbar ist, bevor Publish-Modal geöffnet wird
async function checkProjectEditableBeforePublish() {
    try {
        const response = await fetch(`/api/projects/load_project_data.php?project_id=${currentProjectId}`);
        const data = await response.json();
        
        if (data.success) {
            const projectStatus = data.status || 'working';
            if (projectStatus === 'check' || projectStatus === 'published') {
                // Projekt kann nicht bearbeitet werden - zeige Modal
                showProjectNotEditableModal(projectStatus);
                return;
            }
            // Projekt ist bearbeitbar - öffne Publish-Modal
            openPublishProjectModal();
        } else {
            alert('Fehler beim Laden des Projekt-Status: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Prüfen des Projekt-Status:', error);
        alert('Fehler beim Prüfen des Projekt-Status');
    }
}

// Öffne Publish Project Modal
function openPublishProjectModal() {
    const modal = document.getElementById('publish-project-modal');
    const titleInput = document.getElementById('publish-project-title');
    const descriptionInput = document.getElementById('publish-project-description');
    const coverInput = document.getElementById('publish-project-cover');
    const preview = document.getElementById('publish-project-cover-preview');
    
    // Setze aktuelle Werte
    titleInput.value = window.projectTitle || '';
    descriptionInput.value = '';
    coverInput.value = '';
    preview.style.display = 'none';
    
    // Cover Preview
    coverInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Bitte wählen Sie eine Bilddatei aus');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Bilddatei ist zu groß (max 5MB)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('publish-project-cover-img').src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };
    
    modal.style.display = 'flex';
}

// Schließe Publish Project Modal
function closePublishProjectModal() {
    document.getElementById('publish-project-modal').style.display = 'none';
}

// Veröffentliche Projekt
async function handlePublishProject() {
    const titleInput = document.getElementById('publish-project-title');
    const descriptionInput = document.getElementById('publish-project-description');
    const coverInput = document.getElementById('publish-project-cover');
    const errorDiv = document.getElementById('publish-project-error');
    const submitBtn = document.getElementById('publish-project-submit');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const coverFile = coverInput.files[0];
    
    if (!title) {
        errorDiv.textContent = 'Bitte geben Sie einen Projekttitel ein';
        errorDiv.style.display = 'block';
        return;
    }
    
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Veröffentliche...';
    
    try {
        const formData = new FormData();
        formData.append('project_id', currentProjectId);
        formData.append('title', title);
        formData.append('description', description);
        if (coverFile) {
            formData.append('cover', coverFile);
        }

        const response = await fetch('/api/projects/publish_project.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            closePublishProjectModal();
            // Navigiere zur Projekt-Übersichtsseite
            window.location.href = '/students/projects/';
        } else {
            errorDiv.textContent = data.error || 'Fehler beim Veröffentlichen';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Fehler beim Veröffentlichen:', error);
        errorDiv.textContent = 'Fehler beim Veröffentlichen';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Veröffentlichen';
    }
}

// Modal schließen bei Klick außerhalb
document.addEventListener('DOMContentLoaded', () => {
    const loadModal = document.getElementById('load-project-modal');
    const publishModal = document.getElementById('publish-project-modal');
    
    if (loadModal) {
        loadModal.addEventListener('click', function(e) {
            if (e.target === loadModal) {
                closeLoadProjectModal();
            }
        });
    }
    
    if (publishModal) {
        publishModal.addEventListener('click', function(e) {
            if (e.target === publishModal) {
                closePublishProjectModal();
            }
        });
    }
});

// Speichere Projekt von Scratch Editor
async function saveProjectFromScratch(projectData, title, coverImage = null) {
    if (!currentProjectId) {
        console.error('Keine Projekt-ID verfügbar');
        return;
    }
    
    // Wenn kein Cover-Bild übergeben wurde, aber ein pending Cover vorhanden ist, verwende das
    if (!coverImage && window.pendingCoverImage) {
        coverImage = window.pendingCoverImage;
        window.pendingCoverImage = null;
    }
    
    try {
        const response = await fetch('/api/projects/save_project_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: currentProjectId,
                project_data: projectData,
                title: title,
                cover: coverImage
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Projekt erfolgreich gespeichert');
            // Aktualisiere window.projectTitle
            if (title) {
                window.projectTitle = title;
            }
            // Sende Erfolgs-Nachricht an Scratch Editor
            if (scratchEditor) {
                scratchEditor.postMessage({
                    type: 'saveProjectSuccess',
                    message: 'Erfolgreich!'
                }, '*');
            }
        } else {
            console.error('Fehler beim Speichern:', data.error);
            alert('Fehler beim Speichern: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern');
    }
}

// Lade Projekt nach ID
async function loadProjectById(projectId) {
    try {
        const response = await fetch(`/api/projects/load_project_data.php?project_id=${projectId}`);
        const data = await response.json();
        
        if (data.success && data.project_data) {
            // Lade Projekt in Scratch Editor
            if (scratchEditor) {
                scratchEditor.postMessage({
                    type: 'loadProjectData',
                    projectData: data.project_data,
                    title: data.title
                }, '*');
            }
            
            // Aktualisiere currentProjectId
            currentProjectId = projectId;
            window.PROJECT_ID = projectId;
            window.projectData = data.project_data;
            window.projectTitle = data.title;
        } else {
            alert('Fehler beim Laden: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        alert('Fehler beim Laden');
    }
}

// Cleanup beim Verlassen
window.addEventListener('beforeunload', () => {
    stopAutoSave();
    window.removeEventListener('message', handleScratchMessage);
});

