// Schulauswahl und -erstellung

let searchTimeout = null;
let hasSearched = false;
let lastSearchResults = null; // Speichert die letzten Suchergebnisse
let allSchoolsInBundesland = []; // Speichert alle Schulen im ausgewählten Bundesland

// Bundesland-Auswahl - lädt automatisch alle Schulen
document.getElementById('bundesland-filter').addEventListener('change', function() {
    const bundesland = this.value;
    const schulartContainer = document.getElementById('schulart-filter-container');
    const searchContainer = document.getElementById('school-search-container');
    const searchInput = document.getElementById('school-search');
    const schulartFilter = document.getElementById('schulart-filter');
    const resultsDiv = document.getElementById('school-results');
    const createLinkDiv = document.getElementById('create-school-link');
    
    // Felder zurücksetzen
    searchInput.value = '';
    schulartFilter.value = '';
    
    if (bundesland) {
        // Schulart- und Suchfeld anzeigen
        schulartContainer.style.display = 'block';
        searchContainer.style.display = 'block';
        // Alle Schulen im Bundesland laden
        loadSchoolsByBundesland(bundesland);
    } else {
        // Alles zurücksetzen
        schulartContainer.style.display = 'none';
        searchContainer.style.display = 'none';
        resultsDiv.innerHTML = '';
        createLinkDiv.style.display = 'none';
        hasSearched = false;
        allSchoolsInBundesland = [];
        lastSearchResults = null;
    }
});

// Schulart-Filter - lädt Schulen neu oder filtert die bereits geladenen
document.getElementById('schulart-filter').addEventListener('change', function() {
    const bundesland = document.getElementById('bundesland-filter').value;
    const schulart = this.value;
    const searchInput = document.getElementById('school-search');
    
    if (bundesland) {
        // Wenn Bundesland bereits ausgewählt, lade Schulen mit Schulart-Filter neu
        // für bessere Performance (kürzere Liste vom Server)
        loadSchoolsByBundesland(bundesland, schulart);
    } else {
        // Falls nur lokal filtern (sollte nicht vorkommen, aber sicherheitshalber)
        filterSchools(searchInput.value.trim(), schulart);
    }
});

// Suche nach Schulen - filtert die bereits geladenen Schulen
document.getElementById('school-search').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const searchTerm = this.value.trim();
    const schulartFilter = document.getElementById('schulart-filter');
    const schulart = schulartFilter ? schulartFilter.value : '';
    
    searchTimeout = setTimeout(() => {
        filterSchools(searchTerm, schulart);
    }, 300);
});

// Lädt alle Schulen eines Bundeslandes
async function loadSchoolsByBundesland(bundesland, schulart = '') {
    const resultsDiv = document.getElementById('school-results');
    const createLinkDiv = document.getElementById('create-school-link');
    
    // Loading-State anzeigen
    resultsDiv.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i> Lade Schulen...</div>';
    resultsDiv.style.opacity = '1';
    createLinkDiv.style.display = 'none';
    
    try {
        let url = `/api/schools/get_schools_register.php?bundesland=${encodeURIComponent(bundesland)}&limit=1000`;
        if (schulart) {
            url += `&schulart=${encodeURIComponent(schulart)}`;
        }
        
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Fehler beim Laden der Schulen');
        }
        
        if (!data.schools) {
            throw new Error('Invalid response format');
        }
        
        // Alle Schulen speichern
        allSchoolsInBundesland = data.schools || [];
        
        // Liste anzeigen (alphabetisch sortiert)
        const searchInput = document.getElementById('school-search');
        filterSchools(searchInput.value.trim(), schulart);
        
        hasSearched = true;
        createLinkDiv.style.display = 'block';
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error-messages">Fehler beim Laden der Schulen: ${error.message}</div>`;
        resultsDiv.style.opacity = '1';
        console.error('Fehler:', error);
        hasSearched = true;
        createLinkDiv.style.display = 'block';
    }
}

// Filtert die bereits geladenen Schulen
function filterSchools(searchTerm, schulart = '') {
    const resultsDiv = document.getElementById('school-results');
    const schulartFilter = document.getElementById('schulart-filter');
    
    // Wenn keine schulart übergeben wurde, aus dem Filter lesen
    if (!schulart && schulartFilter) {
        schulart = schulartFilter.value;
    }
    
    if (!allSchoolsInBundesland || allSchoolsInBundesland.length === 0) {
        // Keine Schulen vorhanden - Loading-State entfernen und "Keine gefunden" anzeigen
        resultsDiv.innerHTML = '<div class="no-results">Keine Schulen gefunden</div>';
        resultsDiv.style.opacity = '1';
        return;
    }
    
    let filteredSchools = allSchoolsInBundesland;
    
    // Schulart-Filter anwenden
    if (schulart) {
        filteredSchools = filteredSchools.filter(school => {
            return (school.schulart || '').toLowerCase() === schulart.toLowerCase();
        });
    }
    
    // Suchterm-Filter anwenden
    if (searchTerm.length >= 2) {
        const searchLower = searchTerm.toLowerCase();
        filteredSchools = filteredSchools.filter(school => {
            const name = (school.name || '').toLowerCase();
            const ort = (school.ort || '').toLowerCase();
            const schulartName = (school.schulart || '').toLowerCase();
            
            return name.includes(searchLower) || ort.includes(searchLower) || schulartName.includes(searchLower);
        });
    }
    
    displaySchools(filteredSchools);
}

// Zeigt die Schulen an
function displaySchools(schools) {
    const resultsDiv = document.getElementById('school-results');
    
    // Sortiere alphabetisch nach Name
    const sortedSchools = [...schools].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    // Prüfe ob sich die Ergebnisse geändert haben
    const currentResults = JSON.stringify(sortedSchools);
    if (lastSearchResults === currentResults) {
        return; // Keine Änderung
    }
    
    lastSearchResults = currentResults;
    
    if (sortedSchools.length > 0) {
        let html = '<div class="school-list">';
        sortedSchools.forEach(school => {
            // Details-Array aufbauen (nur vorhandene Werte)
            const details = [];
            if (school.bundesland) {
                details.push(escapeHtml(school.bundesland));
            }
            if (school.ort) {
                details.push(escapeHtml(school.ort));
            }
            if (school.schulart) {
                details.push(escapeHtml(school.schulart));
            }
            
            html += `
                <div class="school-item" data-school-id="${school.id}">
                    <div class="school-item-info">
                        <div class="school-item-name">${escapeHtml(school.name)}</div>
                        ${details.length > 0 ? `<div class="school-item-details">${details.join(' • ')}</div>` : ''}
                    </div>
                    <button class="btn-select-school" data-school-id="${school.id}">
                        <i class="fas fa-check"></i> Auswählen
                    </button>
                </div>
            `;
        });
        html += '</div>';
        resultsDiv.innerHTML = html;
        resultsDiv.style.opacity = '1';
        
        // Event-Listener für Auswahl-Buttons
        document.querySelectorAll('.btn-select-school').forEach(btn => {
            btn.addEventListener('click', function() {
                const schoolId = parseInt(this.getAttribute('data-school-id'));
                assignSchool(schoolId);
            });
        });
    } else {
        // Keine Schulen gefunden - Loading-State entfernen
        resultsDiv.innerHTML = '<div class="no-results">Keine Schulen gefunden</div>';
        resultsDiv.style.opacity = '1';
    }
    
    // Sicherstellen, dass Loading-State immer entfernt wird
    if (resultsDiv.innerHTML.includes('loading-messages') || resultsDiv.innerHTML.includes('Lade Schulen')) {
        if (sortedSchools.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">Keine Schulen gefunden</div>';
        }
        resultsDiv.style.opacity = '1';
    }
}

// Alte Funktion - wird nicht mehr verwendet, aber für Kompatibilität behalten
async function searchSchools(search, bundesland) {
    const resultsDiv = document.getElementById('school-results');
    const createLinkDiv = document.getElementById('create-school-link');
    
    // Loading-State sofort anzeigen
    resultsDiv.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i> Suche Schulen...</div>';
    resultsDiv.style.opacity = '1';
    createLinkDiv.style.display = 'none';
    
    try {
        let url = '/api/schools/get_schools_register.php?limit=20';
        if (search) {
            url += '&search=' + encodeURIComponent(search);
        }
        if (bundesland) {
            url += '&bundesland=' + encodeURIComponent(bundesland);
        }
        
        const response = await fetch(url, { cache: 'no-store' });
        
        // Prüfe ob Response OK ist
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Prüfe ob Request erfolgreich war
        if (!data.success) {
            throw new Error(data.error || 'Fehler beim Laden der Schulen');
        }
        
        // Prüfe ob data.schools existiert
        if (!data.schools) {
            throw new Error('Invalid response format');
        }
        
        hasSearched = true;
        
        // Prüfe ob sich die Ergebnisse geändert haben
        const currentResults = JSON.stringify(data.schools);
        if (lastSearchResults === currentResults) {
            // Keine Änderung - Loading-State entfernen falls noch vorhanden
            // Die Liste bleibt wie sie ist (falls vorhanden)
            if (resultsDiv.innerHTML.includes('loading-messages') || resultsDiv.innerHTML.includes('Suche Schulen')) {
                // Falls noch Loading-State angezeigt wird, entfernen wir ihn
                // Aber wir behalten die alte Liste bei (falls vorhanden)
                if (lastSearchResults && JSON.parse(lastSearchResults).length > 0) {
                    // Re-render die alte Liste
                    const oldData = JSON.parse(lastSearchResults);
                    let html = '<div class="school-list">';
                    oldData.forEach(school => {
                        const details = [];
                        if (school.bundesland) details.push(escapeHtml(school.bundesland));
                        if (school.ort) details.push(escapeHtml(school.ort));
                        if (school.schulart) details.push(escapeHtml(school.schulart));
                        
                        html += `
                            <div class="school-item" data-school-id="${school.id}">
                                <div class="school-item-info">
                                    <div class="school-item-name">${escapeHtml(school.name)}</div>
                                    ${details.length > 0 ? `<div class="school-item-details">${details.join(' • ')}</div>` : ''}
                                </div>
                                <button class="btn-select-school" data-school-id="${school.id}">
                                    <i class="fas fa-check"></i> Auswählen
                                </button>
                            </div>
                        `;
                    });
                    html += '</div>';
                    resultsDiv.innerHTML = html;
                    
                    // Event-Listener wieder hinzufügen
                    document.querySelectorAll('.btn-select-school').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const schoolId = parseInt(this.getAttribute('data-school-id'));
                            assignSchool(schoolId);
                        });
                    });
                } else {
                    resultsDiv.innerHTML = '<div class="no-results">Keine Schulen gefunden</div>';
                }
            }
            resultsDiv.style.opacity = '1';
            return;
        }
        
        lastSearchResults = currentResults;
        
        if (data.schools && data.schools.length > 0) {
            let html = '<div class="school-list">';
            data.schools.forEach(school => {
                // Details-Array aufbauen (nur vorhandene Werte)
                const details = [];
                if (school.bundesland) {
                    details.push(escapeHtml(school.bundesland));
                }
                if (school.ort) {
                    details.push(escapeHtml(school.ort));
                }
                if (school.schulart) {
                    details.push(escapeHtml(school.schulart));
                }
                
                html += `
                    <div class="school-item" data-school-id="${school.id}">
                        <div class="school-item-info">
                            <div class="school-item-name">${escapeHtml(school.name)}</div>
                            ${details.length > 0 ? `<div class="school-item-details">${details.join(' • ')}</div>` : ''}
                        </div>
                        <button class="btn-select-school" data-school-id="${school.id}">
                            <i class="fas fa-check"></i> Auswählen
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            resultsDiv.innerHTML = html;
            resultsDiv.style.opacity = '1';
            
            // Event-Listener für Auswahl-Buttons
            document.querySelectorAll('.btn-select-school').forEach(btn => {
                btn.addEventListener('click', function() {
                    const schoolId = parseInt(this.getAttribute('data-school-id'));
                    assignSchool(schoolId);
                });
            });
        } else {
            resultsDiv.innerHTML = '<div class="no-results">Keine Schulen gefunden</div>';
            resultsDiv.style.opacity = '1';
        }
        
        // Link zum Anlegen einer neuen Schule anzeigen (egal ob gefunden oder nicht)
        createLinkDiv.style.display = 'block';
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error-messages">Fehler beim Laden der Schulen: ${error.message}</div>`;
        resultsDiv.style.opacity = '1';
        console.error('Fehler:', error);
        hasSearched = true;
        createLinkDiv.style.display = 'block';
    }
}

// Link zum Anzeigen des Formulars
document.getElementById('show-create-form-link').addEventListener('click', function(e) {
    e.preventDefault();
    const createSection = document.getElementById('school-create-section');
    const searchInput = document.getElementById('school-search');
    const bundeslandFilter = document.getElementById('bundesland-filter');
    const schulartFilter = document.getElementById('schulart-filter');
    
    // Daten aus der Suche übernehmen
    const schoolNameInput = document.getElementById('school-name');
    const schoolBundeslandSelect = document.getElementById('school-bundesland');
    const schoolSchulartSelect = document.getElementById('school-schulart');
    
    if (searchInput.value.trim()) {
        schoolNameInput.value = searchInput.value.trim();
    }
    
    if (bundeslandFilter.value) {
        schoolBundeslandSelect.value = bundeslandFilter.value;
    }
    
    // Schulart übernehmen
    if (schulartFilter && schulartFilter.value) {
        schoolSchulartSelect.value = schulartFilter.value;
    }
    
    // Formular anzeigen
    createSection.style.display = 'block';
    
    // Zum Formular scrollen
    createSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Schule zuweisen
async function assignSchool(schoolId) {
    const errorDiv = document.getElementById('create-school-error');
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch('/api/teachers/assign_school.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacher_id: teacherId,
                school_id: schoolId
            }),
            cache: 'no-store'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Erfolgreich zugewiesen - automatisch eingeloggt, zum Dashboard weiterleiten
            window.location.href = data.redirect || '/teachers/dashboard/';
        } else {
            errorDiv.className = 'error-message';
            errorDiv.textContent = data.error || 'Fehler beim Zuweisen der Schule';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
    }
}

// Neue Schule erstellen
document.getElementById('create-school-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const schoolName = document.getElementById('school-name').value.trim();
    const bundesland = document.getElementById('school-bundesland').value;
    const ort = document.getElementById('school-ort').value.trim();
    const schulart = document.getElementById('school-schulart').value;
    const schoolType = document.getElementById('school-type').value;
    const errorDiv = document.getElementById('create-school-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!schoolName || !bundesland) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
        errorDiv.style.display = 'block';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird erstellt...';
    errorDiv.style.display = 'none';
    
    try {
        // Neue Schule erstellen
        const createResponse = await fetch('/api/schools/create_school.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: schoolName,
                bundesland: bundesland,
                ort: ort || null,
                schulart: schulart || null,
                school_type: schoolType || null
            }),
            cache: 'no-store'
        });
        
        const createData = await createResponse.json();
        
        if (!createResponse.ok || !createData.success) {
            throw new Error(createData.error || 'Fehler beim Erstellen der Schule');
        }
        
        // Schule dem Lehrer zuweisen (neue Schule = Status 4)
        const assignResponse = await fetch('/api/teachers/assign_school.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacher_id: teacherId,
                school_id: createData.school.id,
                is_new_school: true
            }),
            cache: 'no-store'
        });
        
        const assignData = await assignResponse.json();
        
        if (!assignResponse.ok || !assignData.success) {
            throw new Error(assignData.error || 'Fehler beim Zuweisen der Schule');
        }
        
        // Erfolgreich - automatisch eingeloggt, zum Dashboard weiterleiten
        window.location.href = assignData.redirect || '/teachers/dashboard/';
        
    } catch (error) {
        errorDiv.className = 'error-message';
        errorDiv.textContent = error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Schule anlegen und zuweisen';
    }
});

// Helper-Funktion: HTML escapen
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

