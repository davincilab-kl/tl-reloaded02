class SchoolsManager {
    constructor() {
        this.currentPage = 1;
        this.currentSearch = '';
        this.currentBundesland = '';
        this.currentInfowebinar = '';
        this.currentSponsor = '';
        this.bundeslaender = [];
        
        this.init();
    }

    async init() {
        // Prüfe URL-Parameter für school_name
        const urlParams = new URLSearchParams(window.location.search);
        const schoolNameParam = urlParams.get('school_name');
        if (schoolNameParam) {
            // Setze Suchbegriff im Suchfeld
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = schoolNameParam;
                this.currentSearch = schoolNameParam;
            }
        }
        
        this.bindEvents();
        await this.loadSchools();
    }

    bindEvents() {
        // Such-Button
        document.getElementById('search-btn').addEventListener('click', () => {
            this.currentSearch = document.getElementById('search-input').value;
            this.currentPage = 1;
            this.loadSchools();
        });

        // Enter-Taste in Suchfeld
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.loadSchools();
            }
        });

        // Bundesland-Filter
        document.getElementById('bundesland-filter').addEventListener('change', (e) => {
            this.currentBundesland = e.target.value;
            this.currentPage = 1;
            this.loadSchools();
        });

        // Info-Webinar-Filter
        document.getElementById('infowebinar-filter').addEventListener('change', (e) => {
            this.currentInfowebinar = e.target.value;
            this.currentPage = 1;
            this.loadSchools();
        });

        // Sponsor-Filter
        document.getElementById('sponsor-filter').addEventListener('change', (e) => {
            this.currentSponsor = e.target.value;
            this.currentPage = 1;
            this.loadSchools();
        });

        // Filter zurücksetzen
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('bundesland-filter').value = '';
            document.getElementById('infowebinar-filter').value = '';
            document.getElementById('sponsor-filter').value = '';
            this.currentSearch = '';
            this.currentBundesland = '';
            this.currentInfowebinar = '';
            this.currentSponsor = '';
            this.currentPage = 1;
            this.loadSchools();
        });
    }

    populateBundeslandFilter() {
        const select = document.getElementById('bundesland-filter');
        select.innerHTML = '<option value="">Alle Bundesländer</option>';
        
        this.bundeslaender.forEach(bundesland => {
            const option = document.createElement('option');
            option.value = bundesland;
            option.textContent = bundesland;
            select.appendChild(option);
        });
    }

    async loadSchools() {
        const schoolsList = document.getElementById('schools-list');
        const resultsCount = document.getElementById('results-count');
        const pagination = document.getElementById('pagination');
        const paginationTop = document.getElementById('pagination-top');

        // Loading State
        schoolsList.innerHTML = '<div class="loading">Lade Schulen...</div>';
        resultsCount.textContent = 'Lade...';

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 20
            });

            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            if (this.currentBundesland) {
                params.append('bundesland', this.currentBundesland);
            }
            if (this.currentInfowebinar) {
                params.append('infowebinar', this.currentInfowebinar);
            }
            if (this.currentSponsor) {
                params.append('sponsor', this.currentSponsor);
            }

            const response = await fetch(`/api/schools/get_schools.php?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Fehler beim Laden der Schulen');
            }

            if (!data.schools || !Array.isArray(data.schools)) {
                throw new Error('Ungültiges Antwortformat: Schulen-Array fehlt');
            }

            this.renderSchools(data.schools);
            this.renderResultsCount(data.total);
            this.renderPagination(data.total, data.page, data.limit);
            this.renderPaginationTop(data.total, data.page, data.limit);
            
            // Scroll-Position und Dropdown-Status wiederherstellen
            this.restoreScrollAndDropdownState();

        } catch (error) {
            console.error('Fehler beim Laden der Schulen:', error);
            schoolsList.innerHTML = '<div class="loading">Fehler beim Laden der Schulen: ' + error.message + '</div>';
            resultsCount.textContent = 'Fehler';
        }
    }

    renderSchools(schools) {
        const schoolsList = document.getElementById('schools-list');
        
        if (!schools || !Array.isArray(schools)) {
            schoolsList.innerHTML = '<div class="loading">Fehler: Ungültige Daten</div>';
            return;
        }
        
        if (schools.length === 0) {
            schoolsList.innerHTML = '<div class="loading">Keine Schulen gefunden</div>';
            return;
        }

        schoolsList.innerHTML = schools.map(school => {
            // Bestimme die Klasse für den farbigen Balken
            let cardClass = 'foerderung-no';
            if (school.foerderung) {
                cardClass = 'foerderung-yes';
            } else if (school.info_webinar_teilnahme) {
                cardClass = 'foerderung-infowebinar';
            }
            
            return `
            <div class="school-card ${cardClass}" data-school-id="${school.id}">
                <div class="school-header">
                    <h3 class="school-name">${this.escapeHtml(school.name)} <span class="detail-value" style="margin-left:13px">(${this.escapeHtml(school.schulart || 'unbekannt')})</span></h3>
                    <div class="school-header-right">
                        <span class="school-id">ID: ${school.id}</span>
                        <div class="school-menu">
                            <button class="school-menu-trigger" onclick="event.stopPropagation(); schoolsManager.toggleSchoolMenu(${school.id})" title="Mehr Optionen">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="school-context-menu" id="school-menu-${school.id}" style="display: none;">
                                <div class="menu-item" onclick="event.stopPropagation(); schoolsManager.editSchool(${school.id})">
                                    <i class="fas fa-edit"></i> Bearbeiten
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="school-details">
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Straße</span>
                            <span class="detail-value">${this.escapeHtml(school.strasse || 'unbekannt')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">PLZ</span>
                            <span class="detail-value">${this.escapeHtml(school.plz || 'unbekannt')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ort</span>
                            <span class="detail-value">${this.escapeHtml(school.ort || 'unbekannt')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Bundesland</span>
                            <span class="detail-value">${this.escapeHtml(school.bundesland)}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Info-Webinar</span>
                            <span class="detail-value ${school.info_webinar_teilnahme ? 'status-yes' : 'status-no'}">${school.info_webinar_teilnahme ? 'Ja' : 'Nein'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Förderung</span>
                            <div class="foerderung-control">
                                <span class="detail-value ${school.foerderung ? 'status-yes' : 'status-no'}">${school.foerderung ? 'Ja' : 'Nein'}</span>
                                <button class="foerderung-btn ${school.foerderung ? 'btn-disable' : 'btn-enable'}" 
                                        onclick="event.stopPropagation(); schoolsManager.toggleFoerderung(${school.id}, ${!school.foerderung})">
                                    ${school.foerderung ? 'Deaktivieren' : 'Aktivieren'}
                                </button>
                            </div>
                        </div>
                         <div class="detail-item">
                             <span class="detail-label">Sponsor</span>
                             <div class="sponsor-with-year">
                                 <span class="detail-value">${school.foerderung ? this.escapeHtml(school.sponsor || '-') : '-'}</span>
                                 <button class="sponsor-search-btn" onclick="event.stopPropagation(); schoolsManager.showSchoolYearsModal(${school.id})" title="Alle Schuljahre mit Sponsor anzeigen">
                                     <i class="fas fa-search"></i>
                                 </button>
                             </div>
                             <div class="school-year-info">
                                 <span class="detail-label">Letztes aktives Schuljahr</span>
                                 <span class="detail-value">${school.last_current_school_year ? this.escapeHtml(school.last_current_school_year) : '-'}</span>
                             </div>
                         </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Lehrkraft</span>
                            <span class="detail-value teacher-count">${school.teacher_count}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Klassen</span>
                            <span class="detail-value class-count">${school.class_count}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Schüler</span>
                            <span class="detail-value student-count">${school.student_count}</span>
                        </div>
                        <div class="detail-item stat-expand">
                            <button class="expand-btn" onclick="event.stopPropagation(); schoolsManager.toggleDetails(${school.id})" title="Details anzeigen">
                                <i class="fas fa-chevron-down expand-icon" id="expand-icon-${school.id}"></i>
                            </button>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Erstelldatum</span>
                            <span class="detail-value">
                                ${this.formatDate(school.erstelldatum)}
                                <span class="created-by-name"> (${school.created_by_name ? this.escapeHtml(school.created_by_name) : 'unbekannt'})</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Letzter Login</span>
                            <span class="detail-value">
                                ${this.formatDate(school.letzter_login)}
                                ${school.letzter_login_teacher ? `<span class="login-teacher-name"> (${this.escapeHtml(school.letzter_login_teacher)})</span>` : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="details-section" id="details-${school.id}" style="display: none;">
                    <div class="tab-group">
                        <button class="tab-button" onclick="event.stopPropagation(); schoolsManager.showDetailsType(${school.id}, 'teachers')" data-type="teachers">
                            <i class="fas fa-chalkboard-teacher"></i> Lehrkräfte
                        </button>
                        <button class="tab-button" onclick="event.stopPropagation(); schoolsManager.showDetailsType(${school.id}, 'classes')" data-type="classes">
                            <i class="fas fa-users"></i> Klassen
                        </button>
                        <button class="tab-button" onclick="event.stopPropagation(); schoolsManager.showDetailsType(${school.id}, 'students')" data-type="students">
                            <i class="fas fa-user-graduate"></i> Schüler
                        </button>
                    </div>
                    <div class="details-content" id="details-content-${school.id}">
                        <!-- Inhalt wird dynamisch geladen -->
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    renderResultsCount(total) {
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `${total} Schule${total !== 1 ? 'n' : ''} gefunden`;
    }

    renderPagination(total, currentPage, limit) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(total / limit);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHtml = '';
        
        // Zurück-Button
        paginationHtml += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="schoolsManager.goToPage(${currentPage - 1})">Zurück</button>`;
        
        // Seitenzahlen
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button onclick="schoolsManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="schoolsManager.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span>...</span>`;
            }
            paginationHtml += `<button onclick="schoolsManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Weiter-Button
        paginationHtml += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="schoolsManager.goToPage(${currentPage + 1})">Weiter</button>`;
        
        pagination.innerHTML = paginationHtml;
    }

    renderPaginationTop(total, currentPage, limit) {
        const pagination = document.getElementById('pagination-top');
        const totalPages = Math.ceil(total / limit);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHtml = '';
        
        paginationHtml += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="schoolsManager.goToPage(${currentPage - 1})">Zurück</button>`;
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button onclick=\"schoolsManager.goToPage(1)\">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class=\"${i === currentPage ? 'active' : ''}\" onclick=\"schoolsManager.goToPage(${i})\">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span>...</span>`;
            }
            paginationHtml += `<button onclick=\"schoolsManager.goToPage(${totalPages})\">${totalPages}</button>`;
        }
        
        paginationHtml += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick=\"schoolsManager.goToPage(${currentPage + 1})\">Weiter</button>`;
        
        pagination.innerHTML = paginationHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadSchools();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === '0000-00-00' || dateString === null) {
            return '-';
        }
        try {
            // Handle DD.MM.YY HH:MM:SS format
            if (dateString.includes('.') && dateString.includes(':')) {
                const parts = dateString.split(' ');
                if (parts.length === 2) {
                    const datePart = parts[0]; // DD.MM.YY
                    const timePart = parts[1]; // HH:MM:SS
                    
                    const dateComponents = datePart.split('.');
                    if (dateComponents.length === 3) {
                        const day = dateComponents[0];
                        const month = dateComponents[1];
                        const year = dateComponents[2];
                        
                        // Convert YY to YYYY
                        const fullYear = year.length === 2 ? (parseInt(year) < 50 ? '20' + year : '19' + year) : year;
                        
                        // Create date in YYYY-MM-DD format for JavaScript
                        const jsDateString = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;
                        const date = new Date(jsDateString);
                        
                        if (isNaN(date.getTime())) {
                            return '-';
                        }
                        
                        return date.toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                }
            }
            
            // Fallback for other date formats
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    }

    formatInfowebinarDate(infowebinarValue) {
        // Wenn infowebinar null, leer oder '0000-00-00 00:00:00' ist, zeige "Nein"
        if (!infowebinarValue || infowebinarValue === '0000-00-00 00:00:00' || infowebinarValue === '0000-00-00' || infowebinarValue === null) {
            return '<span class="status-badge status-no">Nein</span>';
        }
        
        // Wenn es ein Datum ist, formatiere es
        try {
            const formattedDate = this.formatDate(infowebinarValue);
            if (formattedDate === '-') {
                return '<span class="status-badge status-no">Nein</span>';
            }
            return `<span class="status-badge status-yes">${formattedDate}</span>`;
        } catch (e) {
            return '<span class="status-badge status-no">Nein</span>';
        }
    }

    toggleDetails(schoolId) {
        const detailsSection = document.getElementById(`details-${schoolId}`);
        const expandIcon = document.getElementById(`expand-icon-${schoolId}`);
        
        if (!detailsSection || !expandIcon) {
            return;
        }
        
        const isOpen = detailsSection.style.display !== 'none';
        
        if (isOpen) {
            // Sektion schließen
            detailsSection.style.display = 'none';
            expandIcon.classList.remove('expanded');
            this.unmarkAllDetailsButtons(schoolId);
        } else {
            // Sektion öffnen - Standardmäßig Lehrkraft anzeigen
            detailsSection.style.display = 'block';
            expandIcon.classList.add('expanded');
            this.showDetailsType(schoolId, 'teachers');
        }
    }

    showDetailsType(schoolId, type) {
        // Alle Tab-Buttons zurücksetzen
        this.unmarkAllDetailsButtons(schoolId);
        
        // Aktiven Button markieren
        const activeButton = document.querySelector(`[data-school-id="${schoolId}"] .tab-button[data-type="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Inhalt laden
        this.loadDetailsContent(schoolId, type);
    }

    unmarkAllDetailsButtons(schoolId) {
        const buttons = document.querySelectorAll(`[data-school-id="${schoolId}"] .tab-button`);
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
    }

    closeAllSections() {
        // Alle Details-Sektionen schließen
        document.querySelectorAll('.details-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Alle Expand-Icons zurücksetzen
        document.querySelectorAll('.expand-icon').forEach(icon => {
            icon.classList.remove('expanded');
        });
        
        // Alle Tab-Buttons zurücksetzen
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    sortTable(headerElement, tableType, column) {
        const table = headerElement.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Aktuellen Sortier-Status ermitteln
        const currentSort = headerElement.dataset.sort || 'none';
        const newSort = currentSort === 'asc' ? 'desc' : 'asc';
        
        // Alle Sort-Indikatoren zurücksetzen
        table.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '↕';
        });
        
        // Neuen Sort-Indikator setzen
        const indicator = headerElement.querySelector('.sort-indicator');
        indicator.textContent = newSort === 'asc' ? '↑' : '↓';
        headerElement.dataset.sort = newSort;
        
        // Zeilen sortieren
        rows.sort((a, b) => {
            const aValue = this.getCellValue(a, column, tableType);
            const bValue = this.getCellValue(b, column, tableType);
            
            if (newSort === 'asc') {
                return this.compareValues(aValue, bValue);
            } else {
                return this.compareValues(bValue, aValue);
            }
        });
        
        // Sortierte Zeilen wieder einfügen
        rows.forEach(row => tbody.appendChild(row));
    }

    getCellValue(row, column, tableType) {
        const cellIndex = this.getColumnIndex(column, tableType);
        const cell = row.children[cellIndex];
        if (!cell) return '';
        
        const text = cell.textContent.trim();
        
        // Zahlen extrahieren für numerische Spalten
        if (this.isNumericColumn(column)) {
            const number = parseFloat(text.replace(/[^\d.-]/g, ''));
            return isNaN(number) ? 0 : number;
        }
        
        // Spezielle Behandlung für Info-Webinar-Spalte (Datum)
        if (column === 'infowebinar') {
            // Wenn "Nein", dann 0 für Sortierung
            if (text === 'Nein') {
                return 0;
            }
            // Wenn es ein Datum ist, konvertiere zu Timestamp für Sortierung
            try {
                const date = new Date(text);
                return isNaN(date.getTime()) ? 0 : date.getTime();
            } catch (e) {
                return 0;
            }
        }
        
        return text.toLowerCase();
    }

    getColumnIndex(column, tableType) {
        const columnMaps = {
            'teachers': { 'name': 0, 'email': 1, 'class_count': 2, 'student_count': 3, 'infowebinar': 4, 'last_login': 5 },
            'classes': { 'name': 0, 'teacher_id': 1, 'student_count': 2, 'total_t_coins': 3, 'avg_t_coins': 4 },
            'students': { 'name': 0, 'class_name': 1, 'courses_done': 2, 'projects_wip': 3, 'projects_pending': 4, 'projects_public': 5, 't_coins': 6 }
        };
        
        return columnMaps[tableType][column] || 0;
    }

    isNumericColumn(column) {
        const numericColumns = ['teacher_id', 'student_count', 'courses_done', 'projects_wip', 'projects_pending', 'projects_public', 't_coins', 'total_t_coins', 'avg_t_coins', 'class_count'];
        return numericColumns.includes(column);
    }

    compareValues(a, b) {
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        return a.localeCompare(b);
    }

    toggleContextMenu(teacherId) {
        // Alle anderen Menüs schließen
        document.querySelectorAll('.context-menu').forEach(menu => {
            if (menu.id !== `menu-${teacherId}`) {
                menu.style.display = 'none';
            }
        });

        // Aktuelles Menü umschalten
        const menu = document.getElementById(`menu-${teacherId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }

        // Event-Listener für Klick außerhalb hinzufügen
        if (menu && menu.style.display === 'block') {
            setTimeout(() => {
                document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target)) {
                        menu.style.display = 'none';
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 0);
        }
    }

    async loadDetailsContent(schoolId, type) {
        const detailsContent = document.getElementById(`details-content-${schoolId}`);
        detailsContent.innerHTML = '<div class="loading">Lade...</div>';

        try {
            let endpoint = '';
            switch (type) {
                case 'teachers':
                    endpoint = `/api/teachers/get_teachers.php?school_id=${schoolId}`;
                    break;
                case 'classes':
                    endpoint = `/api/misc/get_classes.php?school_id=${schoolId}`;
                    break;
                case 'students':
                    endpoint = `/api/students/get_students.php?school_id=${schoolId}`;
                    break;
            }

            const response = await fetch(endpoint);
            const data = await response.json();

            if (type === 'teachers') {
                this.renderTeachersList(detailsContent, data.teachers);
            } else if (type === 'classes') {
                this.renderClassesList(detailsContent, data.classes);
            } else if (type === 'students') {
                this.renderStudentsList(detailsContent, data.students);
            }
        } catch (error) {
            console.error(`Fehler beim Laden der ${type}:`, error);
            detailsContent.innerHTML = `<div class="error">Fehler beim Laden der ${type}</div>`;
        }
    }

    renderTeachersList(container, teachers) {
        if (!teachers || teachers.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Lehrkräfte gefunden</div>';
            return;
        }

        container.innerHTML = `
            <h4>Lehrkräfte (${teachers.length})</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'name')" class="sortable">
                            Name <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'email')" class="sortable">
                            E-Mail <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'class_count')" class="sortable">
                            Klassen <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'student_count')" class="sortable">
                            Schüler <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'infowebinar')" class="sortable">
                            Info-Webinar <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'teachers', 'last_login')" class="sortable">
                            Letzter Login <span class="sort-indicator">↕</span>
                        </th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody id="teachers-tbody">
                    ${teachers.map(teacher => `
                        <tr>
                            <td>
                                <a href="/admin/teachers/?teacher_name=${encodeURIComponent(teacher.name)}" class="teacher-link">${this.escapeHtml(teacher.name)}</a>
                                ${teacher.admin ? '<span class="admin-badge">Admin</span>' : ''}
                            </td>
                            <td>${this.escapeHtml(teacher.email)}</td>
                            <td class="numeric-cell">${teacher.class_count || 0}</td>
                            <td class="numeric-cell">${teacher.student_count || 0}</td>
                            <td>
                                ${this.formatInfowebinarDate(teacher.infowebinar)}
                            </td>
                            <td>${this.formatDate(teacher.last_login)}</td>
                            <td>
                                <div class="action-menu">
                                    <img src="../../imgs/more.png" alt="Mehr Optionen" class="menu-trigger" 
                                         onclick="schoolsManager.toggleContextMenu(${teacher.id})">
                                    <div class="context-menu" id="menu-${teacher.id}" style="display: none;">
                                        <div class="menu-item" onclick="schoolsManager.toggleInfowebinar(${teacher.school_id}, ${teacher.id}, ${!teacher.infowebinar})">
                                            ${teacher.infowebinar ? 'Info-Webinar deaktivieren' : 'Info-Webinar aktivieren'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderClassesList(container, classes) {
        if (!classes || classes.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Klassen gefunden</div>';
            return;
        }

        container.innerHTML = `
            <h4>Klassen (${classes.length})</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th onclick="schoolsManager.sortTable(this, 'classes', 'name')" class="sortable">
                            Klassenname <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'classes', 'teacher_id')" class="sortable">
                            Lehrkraft-ID <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'classes', 'student_count')" class="sortable">
                            Schüler-Anzahl <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'classes', 'total_t_coins')" class="sortable numeric-header">
                            T!Coins gesamt <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'classes', 'avg_t_coins')" class="sortable numeric-header">
                            T!Score <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody id="classes-tbody">
                    ${classes.map(cls => `
                        <tr>
                            <td>${this.escapeHtml(cls.name)}</td>
                            <td>${cls.teacher_id || 'N/A'}</td>
                            <td class="numeric-cell">${cls.student_count || 0}</td>
                            <td class="numeric-cell">${cls.total_t_coins || 0}</td>
                            <td class="numeric-cell">${cls.avg_t_coins || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderStudentsList(container, students) {
        if (!students || students.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Schüler gefunden</div>';
            return;
        }

        container.innerHTML = `
            <h4>Schüler (${students.length})</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'name')" class="sortable">
                            Name <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'class_name')" class="sortable">
                            Klasse <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'courses_done')" class="sortable">
                            Kurse abgeschlossen <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'projects_wip')" class="sortable">
                            Projekte in Arbeit <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'projects_pending')" class="sortable">
                            Projekte ausstehend <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 'projects_public')" class="sortable">
                            Öffentliche Projekte <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="schoolsManager.sortTable(this, 'students', 't_coins')" class="sortable">
                            T!Coins <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody id="students-tbody">
                    ${students.map(student => `
                        <tr>
                            <td>${this.escapeHtml(student.name)}</td>
                            <td>${this.escapeHtml(student.class_name || 'N/A')}</td>
                            <td><span class="courses-done">${student.courses_done || 0}</span></td>
                            <td><span class="projects-wip">${student.projects_wip || 0}</span></td>
                            <td><span class="projects-pending">${student.projects_pending || 0}</span></td>
                            <td><span class="projects-public">${student.projects_public || 0}</span></td>
                            <td><span class="t-coins">${student.t_coins || 0}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async toggleFoerderung(schoolId, newStatus) {
        if (newStatus) {
            // Förderung aktivieren - Modal anzeigen
            this.currentSchoolId = schoolId;
            this.showFoerderungModal();
        } else {
            // Förderung deaktivieren - direkt ausführen
            await this.updateFoerderung(schoolId, false, null);
        }
    }

    async showFoerderungModal() {
        const modal = document.getElementById('foerderung-modal');
        const sponsorSelect = document.getElementById('sponsor-select');
        
        // Sponsoren laden
        await this.loadSponsors();
        
        // Aktuellen Sponsor vorauswählen, falls vorhanden
        // Da der Sponsor nur angezeigt wird wenn Förderung aktiv ist, müssen wir die Daten direkt aus der API holen
        // oder die Schule-Daten durchsuchen, um den ursprünglichen Sponsor zu finden
        const currentSchoolElement = document.querySelector(`[data-school-id="${this.currentSchoolId}"]`);
        if (currentSchoolElement) {
            // Finde das Sponsor-Element in der Status-Gruppe
            const statusGroup = currentSchoolElement.querySelector('.detail-group:last-child');
            if (statusGroup) {
                const sponsorItem = statusGroup.querySelector('.detail-item:last-child .detail-value');
                if (sponsorItem && sponsorItem.textContent.trim() !== '-') {
                    sponsorSelect.value = sponsorItem.textContent.trim();
                } else {
                    // Wenn Sponsor nicht angezeigt wird (weil Förderung deaktiviert), 
                    // versuche den ursprünglichen Sponsor aus den geladenen Daten zu finden
                    this.setSponsorFromSchoolData();
                }
            }
        }
        
        // Modal anzeigen
        modal.style.display = 'flex';
        
        // Event-Listener für vollständigen Klick außerhalb hinzufügen
        this.foerderungModalMouseDownHandler = (e) => {
            if (e.target === modal) {
                this.foerderungModalMouseDownTarget = modal;
            } else {
                this.foerderungModalMouseDownTarget = null;
            }
        };
        
        this.foerderungModalClickHandler = (e) => {
            if (e.target === modal && this.foerderungModalMouseDownTarget === modal) {
                this.closeFoerderungModal();
            }
        };
        
        modal.addEventListener('mousedown', this.foerderungModalMouseDownHandler);
        modal.addEventListener('click', this.foerderungModalClickHandler);
        
        // Select fokussieren
        setTimeout(() => {
            sponsorSelect.focus();
        }, 100);
    }

    async loadSponsors() {
        try {
            const response = await fetch('/api/misc/get_sponsors.php');
            const data = await response.json();
            
            const sponsorSelect = document.getElementById('sponsor-select');
            
            // Bestehende Optionen (außer der ersten) entfernen
            while (sponsorSelect.children.length > 1) {
                sponsorSelect.removeChild(sponsorSelect.lastChild);
            }
            
            // Neue Optionen hinzufügen
            data.sponsors.forEach(sponsor => {
                const option = document.createElement('option');
                option.value = sponsor;
                option.textContent = sponsor;
                sponsorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Sponsoren:', error);
        }
    }

    setSponsorFromSchoolData() {
        // Hole die aktuellen Schuldaten aus der API, um den ursprünglichen Sponsor zu finden
        // Suche nach der spezifischen Schule über ID (falls API das unterstützt) oder lade erste Seite
        fetch(`/api/schools/get_schools.php?page=1&limit=100`)
            .then(response => response.json())
            .then(data => {
                const currentSchool = data.schools.find(school => school.id === this.currentSchoolId);
                if (currentSchool && currentSchool.sponsor && currentSchool.sponsor !== '-') {
                    const sponsorSelect = document.getElementById('sponsor-select');
                    sponsorSelect.value = currentSchool.sponsor;
                }
            })
            .catch(error => {
                console.error('Fehler beim Laden der Schuldaten für Sponsor:', error);
            });
    }

    closeFoerderungModal() {
        const modal = document.getElementById('foerderung-modal');
        const sponsorSelect = document.getElementById('sponsor-select');
        
        // Modal verstecken
        modal.style.display = 'none';
        
        // Event-Listener entfernen
        if (this.foerderungModalClickHandler) {
            modal.removeEventListener('click', this.foerderungModalClickHandler);
            this.foerderungModalClickHandler = null;
        }
        if (this.foerderungModalMouseDownHandler) {
            modal.removeEventListener('mousedown', this.foerderungModalMouseDownHandler);
            this.foerderungModalMouseDownHandler = null;
        }
        this.foerderungModalMouseDownTarget = null;
        
        // Select zurücksetzen
        sponsorSelect.value = '';
        
        // School ID zurücksetzen
        this.currentSchoolId = null;
    }

    async confirmFoerderung() {
        const sponsorSelect = document.getElementById('sponsor-select');
        const sponsor = sponsorSelect.value;
        
        if (!sponsor) {
            alert('Bitte wählen Sie einen Sponsor aus.');
            return;
        }
        
        if (this.currentSchoolId) {
            await this.updateFoerderung(this.currentSchoolId, true, sponsor);
            this.closeFoerderungModal();
        }
    }

    async updateFoerderung(schoolId, foerderung, sponsor) {
        try {
            const response = await fetch('/api/schools/update_foerderung.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    school_id: schoolId,
                    foerderung: foerderung,
                    sponsor: sponsor
                })
            });

            if (response.ok) {
                // Scroll-Position und Dropdown-Status speichern
                this.saveScrollAndDropdownState();
                // Seite neu laden um aktualisierte Daten zu zeigen
                this.loadSchools();
            } else {
                console.error('Fehler beim Aktualisieren der Förderung');
                alert('Fehler beim Aktualisieren der Förderung');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Förderung:', error);
            alert('Fehler beim Aktualisieren der Förderung');
        }
    }

    async toggleInfowebinar(schoolId, teacherId, newStatus) {
        // Wenn Infowebinar aktiviert wird, Modal anzeigen
        if (newStatus) {
            this.currentSchoolId = schoolId;
            this.currentTeacherId = teacherId;
            
            // Sicherstellen, dass DOM bereit ist
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.showInfowebinarModal();
                });
            } else {
                this.showInfowebinarModal();
            }
        } else {
            // Wenn deaktiviert, direkt API aufrufen
            await this.updateInfowebinar(teacherId, null);
        }
    }

    showInfowebinarModal() {
        const modal = document.getElementById('infowebinar-modal');
        const dateInput = document.getElementById('infowebinar-date');
        const timeInput = document.getElementById('infowebinar-time');
        
        // Sicherheitsprüfung: Elemente existieren
        if (!modal || !dateInput || !timeInput) {
            console.error('Info-Webinar Modal Elemente nicht gefunden');
            return;
        }
        
        // Aktuelles Datum als Standard setzen (heute)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // Heutiges Datum setzen (YYYY-MM-DD Format für date input)
        dateInput.value = `${year}-${month}-${day}`;
        
        // Aktuelle Uhrzeit setzen (HH:MM Format für time input)
        timeInput.value = `${hours}:${minutes}`;
        
        // Modal anzeigen
        modal.style.display = 'flex';
        
        // Event-Listener für vollständigen Klick außerhalb hinzufügen
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
        
        // Input fokussieren
        setTimeout(() => {
            dateInput.focus();
        }, 100);
    }

    closeInfowebinarModal() {
        const modal = document.getElementById('infowebinar-modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Event-Listener entfernen
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
        
        // Sicherheitsprüfung: Elemente existieren
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
        await this.updateInfowebinar(this.currentTeacherId, selectedDateTime);
    }

    async updateInfowebinar(teacherId, infowebinarDateTime) {
        try {
            const response = await fetch('/api/schools/update_infowebinar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacher_id: teacherId,
                    infowebinar: infowebinarDateTime
                })
            });

            if (response.ok) {
                // Scroll-Position und Dropdown-Status speichern
                this.saveScrollAndDropdownState();
                // Seite neu laden um aktualisierte Daten zu zeigen
                this.loadSchools();
            } else {
                console.error('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
                alert('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Info-Webinar-Teilnahme:', error);
            alert('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
        }
    }

    saveScrollAndDropdownState() {
        // Scroll-Position speichern
        sessionStorage.setItem('schoolsScrollPosition', window.pageYOffset);
        
        // Offene Details-Sektionen und aktive Stats speichern
        const openSections = [];
        const activeStats = [];
        
        document.querySelectorAll('.details-section').forEach(section => {
            if (section.style.display !== 'none') {
                const schoolId = section.id.replace('details-', '');
                openSections.push(schoolId);
                
                // Aktiven Stat für diese Schule finden
                const detailsSection = document.getElementById(`details-${schoolId}`);
                const activeButton = document.querySelector(`[data-school-id="${schoolId}"] .tab-button.active`);
                if (detailsSection && detailsSection.style.display !== 'none' && activeButton) {
                    const type = activeButton.getAttribute('data-type');
                    if (type) {
                        activeStats.push({schoolId, type});
                    }
                }
            }
        });
        
        sessionStorage.setItem('schoolsOpenSections', JSON.stringify(openSections));
        sessionStorage.setItem('schoolsActiveStats', JSON.stringify(activeStats));
    }

    restoreScrollAndDropdownState() {
        // Offene Details-Sektionen und aktive Stats wiederherstellen
        const savedSections = sessionStorage.getItem('schoolsOpenSections');
        const savedActiveStats = sessionStorage.getItem('schoolsActiveStats');
        const savedScrollPosition = sessionStorage.getItem('schoolsScrollPosition');
        
        if (savedSections) {
            const openSections = JSON.parse(savedSections);
            const activeStats = savedActiveStats ? JSON.parse(savedActiveStats) : [];
            
            setTimeout(() => {
                // Aktive Stats wiederherstellen und Inhalte laden
                activeStats.forEach(({schoolId, type}) => {
                    const detailsSection = document.getElementById(`details-${schoolId}`);
                    const expandIcon = document.getElementById(`expand-icon-${schoolId}`);
                    if (detailsSection) {
                        // Inhalt laden und Sektion öffnen
                        detailsSection.style.display = 'block';
                        if (expandIcon) {
                            expandIcon.classList.add('expanded');
                        }
                        this.showDetailsType(schoolId, type);
                    }
                });
                
                // Scroll-Position wiederherstellen (immer, wenn eine Position gespeichert ist)
                if (savedScrollPosition) {
                    setTimeout(() => {
                        window.scrollTo(0, parseInt(savedScrollPosition));
                    }, activeStats.length > 0 ? 200 : 100); // Länger warten wenn Sektionen geöffnet werden
                }
                
                sessionStorage.removeItem('schoolsOpenSections');
                sessionStorage.removeItem('schoolsActiveStats');
                sessionStorage.removeItem('schoolsScrollPosition');
            }, 150);
        } else if (savedScrollPosition) {
            // Wenn keine Sektionen zu öffnen sind, aber Scroll-Position gespeichert ist, trotzdem wiederherstellen
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
                sessionStorage.removeItem('schoolsScrollPosition');
            }, 100);
        }
    }

    toggleSchoolMenu(schoolId) {
        // Alle anderen Menüs schließen
        document.querySelectorAll('.school-context-menu').forEach(menu => {
            if (menu.id !== `school-menu-${schoolId}`) {
                menu.style.display = 'none';
            }
        });

        // Aktuelles Menü umschalten
        const menu = document.getElementById(`school-menu-${schoolId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }

        // Event-Listener für Klick außerhalb hinzufügen
        if (menu && menu.style.display === 'block') {
            setTimeout(() => {
                const closeMenu = (e) => {
                    if (!menu.contains(e.target) && !e.target.closest('.school-menu-trigger')) {
                        menu.style.display = 'none';
                        document.removeEventListener('click', closeMenu);
                    }
                };
                document.addEventListener('click', closeMenu);
            }, 0);
        }
    }

    editSchool(schoolId) {
        // Menü schließen
        const menu = document.getElementById(`school-menu-${schoolId}`);
        if (menu) {
            menu.style.display = 'none';
        }

        // Zur Bearbeitungsseite weiterleiten
        window.location.href = `edit?id=${schoolId}`;
    }

    async showSchoolYearsModal(schoolId) {
        const modal = document.getElementById('school-years-modal');
        const modalContent = document.getElementById('school-years-modal-content');
        const schoolName = document.querySelector(`[data-school-id="${schoolId}"] .school-name`)?.textContent || 'Schule';
        
        // Modal-Titel setzen
        const modalTitle = document.getElementById('school-years-modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Schuljahre mit Sponsor - ${schoolName}`;
        }
        
        // Loading anzeigen
        modalContent.innerHTML = '<div class="loading">Lade Schuljahre...</div>';
        modal.style.display = 'flex';
        
        // Event-Listener für Klick außerhalb hinzufügen
        this.schoolYearsModalMouseDownHandler = (e) => {
            if (e.target === modal) {
                this.schoolYearsModalMouseDownTarget = modal;
            } else {
                this.schoolYearsModalMouseDownTarget = null;
            }
        };
        
        this.schoolYearsModalClickHandler = (e) => {
            if (e.target === modal && this.schoolYearsModalMouseDownTarget === modal) {
                this.closeSchoolYearsModal();
            }
        };
        
        modal.addEventListener('mousedown', this.schoolYearsModalMouseDownHandler);
        modal.addEventListener('click', this.schoolYearsModalClickHandler);
        
        // Schuljahre laden
        try {
            const response = await fetch(`/api/schools/get_school_years_with_sponsor.php?school_id=${schoolId}`);
            const data = await response.json();
            
            if (data.success && data.school_years && data.school_years.length > 0) {
                this.renderSchoolYearsList(modalContent, data.school_years);
            } else {
                modalContent.innerHTML = '<div class="no-items">Keine aktiven Schuljahre mit Sponsor gefunden</div>';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Schuljahre:', error);
            modalContent.innerHTML = '<div class="error">Fehler beim Laden der Schuljahre</div>';
        }
    }
    
    async exportToXLSX() {
        try {
            // Lade alle Schulen für den Export durch mehrere Seiten
            let allSchools = [];
            let page = 1;
            const limit = 100; // Max Limit pro Seite
            
            // Basis-Parameter für alle Anfragen
            const baseParams = new URLSearchParams({
                limit: limit
            });
            
            if (this.currentSearch) {
                baseParams.append('search', this.currentSearch);
            }
            if (this.currentBundesland) {
                baseParams.append('bundesland', this.currentBundesland);
            }
            if (this.currentInfowebinar) {
                baseParams.append('infowebinar', this.currentInfowebinar);
            }
            if (this.currentSponsor) {
                baseParams.append('sponsor', this.currentSponsor);
            }
            
            // Lade alle Seiten
            let hasMore = true;
            while (hasMore) {
                const params = new URLSearchParams(baseParams);
                params.append('page', page);
                
                const response = await fetch(`/api/schools/get_schools.php?${params}`);
                const data = await response.json();
                
                if (!data || !data.schools || !Array.isArray(data.schools)) {
                    alert('Fehler beim Laden der Daten');
                    return;
                }
                
                allSchools = allSchools.concat(data.schools);
                
                // Prüfe ob es weitere Seiten gibt
                const totalPages = Math.ceil(data.total / limit);
                hasMore = page < totalPages;
                page++;
            }
            
            // Definiere Spalten für den Export
            const columns = [
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'bundesland', label: 'Bundesland' },
                { key: 'ort', label: 'Ort' },
                { key: 'schulart', label: 'Schulart' },
                { key: 'info_webinar_teilnahme', label: 'Info-Webinar' },
                { key: 'foerderung', label: 'Förderung' },
                { key: 'sponsor', label: 'Sponsor' },
                { key: 'teacher_count', label: 'Lehrkraft' },
                { key: 'class_count', label: 'Klassen' },
                { key: 'student_count', label: 'Schüler' },
                { key: 'last_current_school_year', label: 'Letztes aktives Schuljahr' }
            ];
            
            // Bereite Daten für Export vor
            const exportData = allSchools.map(school => ({
                id: school.id,
                name: school.name || '',
                bundesland: school.bundesland || '',
                ort: school.ort || '',
                schulart: school.schulart || '',
                info_webinar_teilnahme: school.info_webinar_teilnahme ? 'Ja' : 'Nein',
                foerderung: school.foerderung ? 'Ja' : 'Nein',
                sponsor: school.sponsor || '',
                teacher_count: school.teacher_count || 0,
                class_count: school.class_count || 0,
                student_count: school.student_count || 0,
                last_current_school_year: school.last_current_school_year || ''
            }));
            
            // Exportiere
            const filename = `Schulen_${new Date().toISOString().split('T')[0]}`;
            window.exportToXLSX(exportData, columns, filename);
        } catch (error) {
            console.error('Export-Fehler:', error);
            alert('Fehler beim Exportieren: ' + error.message);
        }
    }

    renderSchoolYearsList(container, schoolYears) {
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Schuljahr</th>
                        <th>Startdatum</th>
                        <th>Enddatum</th>
                        <th>Sponsor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${schoolYears.map(sy => `
                        <tr>
                            <td>${this.escapeHtml(sy.name)}</td>
                            <td>${this.formatDate(sy.start_date)}</td>
                            <td>${this.formatDate(sy.end_date)}</td>
                            <td>${this.escapeHtml(sy.sponsor || '-')}</td>
                            <td>
                                <span class="status-badge ${sy.is_current ? 'status-yes' : 'status-no'}">
                                    ${sy.is_current ? 'Aktuell' : 'Vergangen'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    closeSchoolYearsModal() {
        const modal = document.getElementById('school-years-modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Event-Listener entfernen
            if (this.schoolYearsModalClickHandler) {
                modal.removeEventListener('click', this.schoolYearsModalClickHandler);
                this.schoolYearsModalClickHandler = null;
            }
            if (this.schoolYearsModalMouseDownHandler) {
                modal.removeEventListener('mousedown', this.schoolYearsModalMouseDownHandler);
                this.schoolYearsModalMouseDownHandler = null;
            }
            this.schoolYearsModalMouseDownTarget = null;
        }
    }
}

// Scroll to Top Funktion
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Scroll to Top Button Sichtbarkeit
function toggleScrollToTopButton() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (window.pageYOffset > 100) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
}

// Globale Instanz
let schoolsManager;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    schoolsManager = new SchoolsManager();
    
    // Scroll to Top Button Event Listener
    window.addEventListener('scroll', toggleScrollToTopButton);
});