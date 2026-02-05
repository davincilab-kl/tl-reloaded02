class TeachersManager {
    constructor() {
        this.currentPage = 1;
        this.currentSearch = '';
        this.currentSchool = '';
        this.currentInfowebinar = '';
        this.currentAdmin = '';
        this.schools = [];
        
        this.init();
    }

    async init() {
        // Prüfe URL-Parameter für teacher_name
        const urlParams = new URLSearchParams(window.location.search);
        const teacherNameParam = urlParams.get('teacher_name');
        if (teacherNameParam) {
            // Setze Suchbegriff im Suchfeld
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = teacherNameParam;
                this.currentSearch = teacherNameParam;
            }
        }
        
        this.bindEvents();
        await this.loadTeachers();
    }

    bindEvents() {
        // Such-Button
        document.getElementById('search-btn').addEventListener('click', () => {
            this.currentSearch = document.getElementById('search-input').value;
            this.currentSchool = document.getElementById('school-filter').value;
            this.currentPage = 1;
            this.loadTeachers();
        });

        // Enter-Taste in Suchfeld
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentSearch = e.target.value;
                this.currentSchool = document.getElementById('school-filter').value;
                this.currentPage = 1;
                this.loadTeachers();
            }
        });

        // Enter-Taste in Schule-Suchfeld
        document.getElementById('school-filter').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentSearch = document.getElementById('search-input').value;
                this.currentSchool = e.target.value;
                this.currentPage = 1;
                this.loadTeachers();
            }
        });

        // Info-Webinar-Filter
        document.getElementById('infowebinar-filter').addEventListener('change', (e) => {
            this.currentInfowebinar = e.target.value;
            this.currentPage = 1;
            this.loadTeachers();
        });

        // Admin-Filter
        document.getElementById('admin-filter').addEventListener('change', (e) => {
            this.currentAdmin = e.target.value;
            this.currentPage = 1;
            this.loadTeachers();
        });

        // Filter zurücksetzen
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('school-filter').value = '';
            document.getElementById('infowebinar-filter').value = '';
            document.getElementById('admin-filter').value = '';
            this.currentSearch = '';
            this.currentSchool = '';
            this.currentInfowebinar = '';
            this.currentAdmin = '';
            this.currentPage = 1;
            this.loadTeachers();
        });
    }

    async loadTeachers() {
        const teachersList = document.getElementById('teachers-list');
        const resultsCount = document.getElementById('results-count');
        const pagination = document.getElementById('pagination');
        const paginationTop = document.getElementById('pagination-top');

        // Loading State
        teachersList.innerHTML = '<div class="loading">Lade Lehrkräfte...</div>';
        resultsCount.textContent = 'Lade...';

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 20
            });

            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            if (this.currentSchool) {
                params.append('school', this.currentSchool);
            }
            if (this.currentInfowebinar) {
                params.append('infowebinar', this.currentInfowebinar);
            }
            if (this.currentAdmin) {
                params.append('admin', this.currentAdmin);
            }

            const response = await fetch(`/api/teachers/get_all_teachers.php?${params}`);
            const data = await response.json();

            this.renderTeachers(data.teachers);
            this.renderResultsCount(data.total);
            this.renderPagination(data.total, data.page, data.limit);
            this.renderPaginationTop(data.total, data.page, data.limit);
            
            // Scroll-Position wiederherstellen
            this.restoreScrollPosition();

        } catch (error) {
            console.error('Fehler beim Laden der Lehrkräfte:', error);
            teachersList.innerHTML = '<div class="loading">Fehler beim Laden der Lehrkräfte</div>';
            resultsCount.textContent = 'Fehler';
        }
    }

    renderTeachers(teachers) {
        const teachersList = document.getElementById('teachers-list');
        
        if (teachers.length === 0) {
            teachersList.innerHTML = '<div class="loading">Keine Lehrkräfte gefunden</div>';
            return;
        }

        teachersList.innerHTML = teachers.map(teacher => {
            // Förderstatus-Tag bestimmen
            let foerderungTag = '';
            if (!teacher.school_id || teacher.school_id === 0 || !teacher.school_name) {
                foerderungTag = '<span class="foerderung-badge foerderung-no-school">Keine Schule</span>';
            } else if (teacher.school_foerderung === true) {
                foerderungTag = '<span class="foerderung-badge foerderung-yes">Gefördert</span>';
            } else if (this.hasInfowebinar(teacher.infowebinar)) {
                foerderungTag = '<span class="foerderung-badge foerderung-infowebinar">Förderung offen</span>';
            } else {
                foerderungTag = '<span class="foerderung-badge foerderung-no">Nicht gefördert</span>';
            }
            
            // Bestimme die Klasse für den farbigen Balken
            let cardClass = 'foerderung-no';
            if (teacher.school_foerderung === true) {
                cardClass = 'foerderung-yes';
            } else if (this.hasInfowebinar(teacher.infowebinar)) {
                cardClass = 'foerderung-infowebinar';
            }
            
            return `
            <div class="teacher-card ${cardClass}" data-teacher-id="${teacher.id}">
                <div class="teacher-header">
                    <div class="teacher-name-wrapper">
                        <h3 class="teacher-name">${this.escapeHtml(teacher.name)}</h3>
                        ${foerderungTag}
                    </div>
                    <div class="teacher-header-right">
                        <span class="teacher-id">ID: ${teacher.id}</span>
                        <div class="teacher-menu">
                            <button class="teacher-menu-trigger" onclick="event.stopPropagation(); teachersManager.toggleTeacherMenu(${teacher.id})" title="Mehr Optionen">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="teacher-context-menu" id="teacher-menu-${teacher.id}" style="display: none;">
                                <div class="menu-item" onclick="event.stopPropagation(); teachersManager.impersonateTeacher(${teacher.id}, '${this.escapeHtml(teacher.name)}')">
                                    <i class="fas fa-user-secret"></i> Als Lehrkraft einloggen
                                </div>
                                <div class="menu-item" onclick="event.stopPropagation(); teachersManager.showNotesModal(${teacher.id}, '${this.escapeHtml(teacher.name)}')">
                                    <i class="fas fa-sticky-note"></i> Notizen verwalten
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="teacher-details">
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">E-Mail</span>
                            <span class="detail-value">${this.escapeHtml(teacher.email)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Schule</span>
                            ${teacher.school_name ? `<a href="/admin/schools/?school_name=${encodeURIComponent(teacher.school_name)}" class="detail-value school-link">${this.escapeHtml(teacher.school_name)}</a>` : '<span class="detail-value">N/A</span>'}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rolle</span>
                            <span class="detail-value ${teacher.admin ? 'status-yes' : ''}">${teacher.admin ? 'Admin' : 'Lehrkräfte'}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Letzter Login</span>
                            <span class="detail-value">${this.formatDate(teacher.last_login)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Info-Webinar</span>
                            <div class="infowebinar-control">
                                <span class="detail-value ${this.hasInfowebinar(teacher.infowebinar) ? 'status-yes' : 'status-no'}">${this.formatInfowebinarDate(teacher.infowebinar)}</span>
                                <button class="infowebinar-btn ${this.hasInfowebinar(teacher.infowebinar) ? 'btn-disable' : 'btn-enable'}" 
                                        onclick="event.stopPropagation(); teachersManager.toggleInfowebinar(${teacher.school_id}, ${teacher.id}, ${!this.hasInfowebinar(teacher.infowebinar)})">
                                    ${this.hasInfowebinar(teacher.infowebinar) ? 'Deaktivieren' : 'Aktivieren'}
                                </button>
                            </div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value">${this.escapeHtml(teacher.status_name || 'N/A')}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-item">
                            <span class="detail-label">Klassen</span>
                            <span class="detail-value class-count">${teacher.class_count || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Schüler</span>
                            <span class="detail-value student-count">${teacher.student_count || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Projekte</span>
                            <span class="detail-value project-count">${teacher.project_count || 0}</span>
                        </div>
                        <div class="detail-item stat-expand">
                            <button class="expand-btn" onclick="event.stopPropagation(); teachersManager.toggleDetails(${teacher.id})" title="Details anzeigen">
                                <i class="fas fa-chevron-down expand-icon" id="expand-icon-${teacher.id}"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="details-section" id="details-${teacher.id}" style="display: none;">
                    <div class="tab-group">
                        <button class="tab-button" onclick="event.stopPropagation(); teachersManager.showDetailsType(${teacher.id}, 'classes')" data-type="classes">
                            <i class="fas fa-users"></i> Klassen
                        </button>
                        <button class="tab-button" onclick="event.stopPropagation(); teachersManager.showDetailsType(${teacher.id}, 'students')" data-type="students">
                            <i class="fas fa-user-graduate"></i> Schüler
                        </button>
                        <button class="tab-button" onclick="event.stopPropagation(); teachersManager.showDetailsType(${teacher.id}, 'projects')" data-type="projects">
                            <i class="fas fa-project-diagram"></i> Projekte
                        </button>
                    </div>
                    <div class="details-content" id="details-content-${teacher.id}">
                        <!-- Inhalt wird dynamisch geladen -->
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    renderResultsCount(total) {
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `${total} Lehrkräfte${total !== 1 ? '' : ''} gefunden`;
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
        paginationHtml += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="teachersManager.goToPage(${currentPage - 1})">Zurück</button>`;
        
        // Seitenzahlen
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button onclick="teachersManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="teachersManager.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span>...</span>`;
            }
            paginationHtml += `<button onclick="teachersManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Weiter-Button
        paginationHtml += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="teachersManager.goToPage(${currentPage + 1})">Weiter</button>`;
        
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
        
        paginationHtml += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="teachersManager.goToPage(${currentPage - 1})">Zurück</button>`;
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button onclick="teachersManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="teachersManager.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span>...</span>`;
            }
            paginationHtml += `<button onclick="teachersManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        paginationHtml += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="teachersManager.goToPage(${currentPage + 1})">Weiter</button>`;
        
        pagination.innerHTML = paginationHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadTeachers();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === '0000-00-00' || dateString === null) {
            return 'N/A';
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    }

    hasInfowebinar(infowebinarValue) {
        return infowebinarValue && 
               infowebinarValue !== '0000-00-00 00:00:00' && 
               infowebinarValue !== '0000-00-00' && 
               infowebinarValue !== null;
    }

    formatInfowebinarDate(infowebinarValue) {
        if (!this.hasInfowebinar(infowebinarValue)) {
            return 'Nein';
        }
        
        try {
            const formattedDate = this.formatDate(infowebinarValue);
            if (formattedDate === 'N/A') {
                return 'Nein';
            }
            return formattedDate;
    } catch (e) {
            return 'Nein';
        }
    }

    toggleDetails(teacherId) {
        const detailsSection = document.getElementById(`details-${teacherId}`);
        const expandIcon = document.getElementById(`expand-icon-${teacherId}`);
        
        if (!detailsSection || !expandIcon) {
            return;
        }
        
        const isOpen = detailsSection.style.display !== 'none';
        
        if (isOpen) {
            // Sektion schließen
            detailsSection.style.display = 'none';
            expandIcon.classList.remove('expanded');
            this.unmarkAllDetailsButtons(teacherId);
        } else {
            // Sektion öffnen - Standardmäßig Klassen anzeigen
            detailsSection.style.display = 'block';
            expandIcon.classList.add('expanded');
            this.showDetailsType(teacherId, 'classes');
        }
    }

    showDetailsType(teacherId, type) {
        // Alle Tab-Buttons zurücksetzen
        this.unmarkAllDetailsButtons(teacherId);
        
        // Aktiven Button markieren
        const activeButton = document.querySelector(`[data-teacher-id="${teacherId}"] .tab-button[data-type="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Inhalt laden
        this.loadDetailsContent(teacherId, type);
    }

    unmarkAllDetailsButtons(teacherId) {
        const buttons = document.querySelectorAll(`[data-teacher-id="${teacherId}"] .tab-button`);
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
        
        return text.toLowerCase();
    }

    getColumnIndex(column, tableType) {
        const columnMaps = {
            'classes': { 'name': 0, 'student_count': 1, 'total_t_coins': 2, 'avg_t_coins': 3 },
            'students': { 'name': 0, 'class_name': 1, 'courses_done': 2, 'projects_wip': 3, 'projects_pending': 4, 'projects_public': 5, 't_coins': 6 },
            'projects': { 'title': 0, 'student_name': 1, 'class_name': 2, 'status': 3, 'like_count': 4 }
        };
        
        return columnMaps[tableType][column] || 0;
    }

    isNumericColumn(column) {
        const numericColumns = ['student_count', 'courses_done', 'projects_wip', 'projects_pending', 'projects_public', 't_coins', 'total_t_coins', 'avg_t_coins', 'like_count'];
        return numericColumns.includes(column);
    }

    compareValues(a, b) {
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        return a.localeCompare(b);
    }

    async loadDetailsContent(teacherId, type) {
        const detailsContent = document.getElementById(`details-content-${teacherId}`);
        detailsContent.innerHTML = '<div class="loading">Lade...</div>';

        try {
            let endpoint = '';
            switch (type) {
                case 'classes':
                    endpoint = `/api/misc/get_classes.php?teacher_id=${teacherId}`;
                    break;
                case 'students':
                    endpoint = `/api/students/get_students.php?teacher_id=${teacherId}`;
                    break;
                case 'projects':
                    endpoint = `/api/projects/get_teacher_projects.php?teacher_id=${teacherId}`;
                    break;
            }

            const response = await fetch(endpoint);
            const data = await response.json();

            if (type === 'classes') {
                this.renderClassesList(detailsContent, data.classes);
            } else if (type === 'students') {
                this.renderStudentsList(detailsContent, data.students);
            } else if (type === 'projects') {
                this.renderProjectsList(detailsContent, data.projects);
            }
        } catch (error) {
            console.error(`Fehler beim Laden der ${type}:`, error);
            detailsContent.innerHTML = `<div class="error">Fehler beim Laden der ${type}</div>`;
        }
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
                        <th onclick="teachersManager.sortTable(this, 'classes', 'name')" class="sortable">
                            Klassenname <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'classes', 'student_count')" class="sortable">
                            Schüler-Anzahl <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'classes', 'total_t_coins')" class="sortable">
                            T!Coins gesamt <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'classes', 'avg_t_coins')" class="sortable">
                            T!Score <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr>
                            <td>${this.escapeHtml(cls.name)}</td>
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
                        <th onclick="teachersManager.sortTable(this, 'students', 'name')" class="sortable">
                            Name <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 'class_name')" class="sortable">
                            Klasse <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 'courses_done')" class="sortable">
                            Kurse abgeschlossen <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 'projects_wip')" class="sortable">
                            Projekte in Arbeit <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 'projects_pending')" class="sortable">
                            Projekte ausstehend <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 'projects_public')" class="sortable">
                            Öffentliche Projekte <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'students', 't_coins')" class="sortable">
                            T!Coins <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
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

    renderProjectsList(container, projects) {
        if (!projects || projects.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Projekte gefunden</div>';
            return;
        }

        container.innerHTML = `
            <h4>Projekte (${projects.length})</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th onclick="teachersManager.sortTable(this, 'projects', 'title')" class="sortable">
                            Titel <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'projects', 'student_name')" class="sortable">
                            Schüler <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'projects', 'class_name')" class="sortable">
                            Klasse <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'projects', 'status')" class="sortable">
                            Status <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="teachersManager.sortTable(this, 'projects', 'like_count')" class="sortable">
                            Likes <span class="sort-indicator">↕</span>
                        </th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(project => `
                        <tr>
                            <td>${this.escapeHtml(project.title || 'Ohne Titel')}</td>
                            <td>${this.escapeHtml(project.student_name || 'N/A')}</td>
                            <td>${this.escapeHtml(project.class_name || 'N/A')}</td>
                            <td>
                                <span class="status-badge ${project.status === 'published' ? 'status-yes' : project.status === 'check' ? 'status-pending' : 'status-no'}">
                                    ${project.status === 'published' ? 'Veröffentlicht' : project.status === 'check' ? 'Prüfung' : 'In Arbeit'}
                                </span>
                            </td>
                            <td class="numeric-cell">${project.like_count || 0}</td>
                            <td>
                                ${project.link ? `<a href="${this.escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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
                // Scroll-Position speichern
                this.saveScrollPosition();
                // Seite neu laden um aktualisierte Daten zu zeigen
                this.loadTeachers();
            } else {
                console.error('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
                alert('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Info-Webinar-Teilnahme:', error);
            alert('Fehler beim Aktualisieren der Info-Webinar-Teilnahme');
        }
    }

    saveScrollPosition() {
        sessionStorage.setItem('teachersScrollPosition', window.pageYOffset);
    }

    restoreScrollPosition() {
        const savedScrollPosition = sessionStorage.getItem('teachersScrollPosition');
        if (savedScrollPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
                sessionStorage.removeItem('teachersScrollPosition');
            }, 100);
        }
    }

    toggleTeacherMenu(teacherId) {
        // Alle anderen Menüs schließen
        document.querySelectorAll('.teacher-context-menu').forEach(menu => {
            if (menu.id !== `teacher-menu-${teacherId}`) {
                menu.style.display = 'none';
            }
        });

        // Aktuelles Menü umschalten
        const menu = document.getElementById(`teacher-menu-${teacherId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }

        // Event-Listener für Klick außerhalb hinzufügen
        if (menu && menu.style.display === 'block') {
            setTimeout(() => {
                const closeMenu = (e) => {
                    if (!menu.contains(e.target) && !e.target.closest('.teacher-menu-trigger')) {
                        menu.style.display = 'none';
                        document.removeEventListener('click', closeMenu);
                    }
                };
                document.addEventListener('click', closeMenu);
            }, 0);
        }
    }

    async impersonateTeacher(teacherId, teacherName) {
        // Menü schließen
        const menu = document.getElementById(`teacher-menu-${teacherId}`);
        if (menu) {
            menu.style.display = 'none';
        }

        if (!confirm(`Möchten Sie sich wirklich als "${teacherName}" einloggen?`)) {
            return;
        }

        try {
            const response = await fetch('/api/auth/impersonate.php', {
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
                // Weiterleitung zum Lehrkräfte-Dashboard
                window.location.href = data.redirect || '/teachers/dashboard/';
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Impersonieren:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    // Notizen-Funktionen
    currentTeacherId = null;
    currentTeacherName = null;
    currentNoteId = null;
    notes = [];

    async showNotesModal(teacherId, teacherName) {
        // Menü schließen
        const menu = document.getElementById(`teacher-menu-${teacherId}`);
        if (menu) {
            menu.style.display = 'none';
        }

        this.currentTeacherId = teacherId;
        this.currentTeacherName = teacherName;
        this.currentNoteId = null;

        const modal = document.getElementById('notes-modal');
        const title = document.getElementById('notes-modal-title');
        const container = document.getElementById('notes-list-container');

        if (!modal || !title || !container) {
            console.error('Notizen-Modal Elemente nicht gefunden');
            return;
        }

        title.textContent = `Notizen für ${this.escapeHtml(teacherName)}`;
        container.innerHTML = '<div class="loading">Lade Notizen...</div>';
        modal.style.display = 'flex';

        // Event-Listener für Klick außerhalb hinzufügen
        this.notesModalMouseDownHandler = (e) => {
            if (e.target === modal) {
                this.notesModalMouseDownTarget = modal;
            } else {
                this.notesModalMouseDownTarget = null;
            }
        };

        this.notesModalClickHandler = (e) => {
            if (e.target === modal && this.notesModalMouseDownTarget === modal) {
                this.closeNotesModal();
            }
        };

        modal.addEventListener('mousedown', this.notesModalMouseDownHandler);
        modal.addEventListener('click', this.notesModalClickHandler);

        // Notizen laden
        await this.loadTeacherNotes(teacherId);
    }

    closeNotesModal() {
        const modal = document.getElementById('notes-modal');
        if (modal) {
            modal.style.display = 'none';

            // Event-Listener entfernen
            if (this.notesModalClickHandler) {
                modal.removeEventListener('click', this.notesModalClickHandler);
                this.notesModalClickHandler = null;
            }
            if (this.notesModalMouseDownHandler) {
                modal.removeEventListener('mousedown', this.notesModalMouseDownHandler);
                this.notesModalMouseDownHandler = null;
            }
            this.notesModalMouseDownTarget = null;
        }

        this.currentTeacherId = null;
        this.currentTeacherName = null;
        this.currentNoteId = null;
    }

    async loadTeacherNotes(teacherId) {
        const container = document.getElementById('notes-list-container');
        if (!container) return;

        try {
            const response = await fetch(`/api/teachers/get_notes.php?teacher_id=${teacherId}`);
            const data = await response.json();

            if (data.success) {
                this.notes = data.notes;
                this.renderNotesList(data.notes);
            } else {
                container.innerHTML = `<div class="error">Fehler: ${data.error || 'Unbekannter Fehler'}</div>`;
            }
        } catch (error) {
            console.error('Fehler beim Laden der Notizen:', error);
            container.innerHTML = '<div class="error">Fehler beim Laden der Notizen</div>';
        }
    }

    renderNotesList(notes) {
        const container = document.getElementById('notes-list-container');
        if (!container) return;

        if (!notes || notes.length === 0) {
            container.innerHTML = '<div class="no-notes">Noch keine Notizen vorhanden</div>';
            return;
        }

        container.innerHTML = notes.map(note => {
            const createdDate = new Date(note.created_at);
            const formattedDate = createdDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="note-item">
                    <div class="note-text">${this.escapeHtml(note.note_text).replace(/\n/g, '<br>')}</div>
                    <div class="note-meta">
                        <span class="note-author">Erstellt von: ${this.escapeHtml(note.created_by_name)}</span>
                        <span class="note-date">${formattedDate}</span>
                    </div>
                    <div class="note-actions">
                        <button class="btn-icon" onclick="teachersManager.showNoteEditModal(${note.id})" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="teachersManager.deleteNote(${note.id})" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showNoteEditModal(noteId = null) {
        this.currentNoteId = noteId;

        const modal = document.getElementById('note-edit-modal');
        const title = document.getElementById('note-edit-modal-title');
        const textarea = document.getElementById('note-text-input');

        if (!modal || !title || !textarea) {
            console.error('Notiz-Bearbeiten-Modal Elemente nicht gefunden');
            return;
        }

        if (noteId) {
            // Bearbeiten: Notiz-Text laden
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                title.textContent = 'Notiz bearbeiten';
                textarea.value = note.note_text;
            } else {
                title.textContent = 'Notiz bearbeiten';
                textarea.value = '';
            }
        } else {
            // Neu: Felder leeren
            title.textContent = 'Neue Notiz';
            textarea.value = '';
        }

        modal.style.display = 'flex';

        // Event-Listener für Klick außerhalb hinzufügen
        this.noteEditModalMouseDownHandler = (e) => {
            if (e.target === modal) {
                this.noteEditModalMouseDownTarget = modal;
            } else {
                this.noteEditModalMouseDownTarget = null;
            }
        };

        this.noteEditModalClickHandler = (e) => {
            if (e.target === modal && this.noteEditModalMouseDownTarget === modal) {
                this.closeNoteEditModal();
            }
        };

        modal.addEventListener('mousedown', this.noteEditModalMouseDownHandler);
        modal.addEventListener('click', this.noteEditModalClickHandler);

        // Textarea fokussieren
        setTimeout(() => {
            textarea.focus();
        }, 100);
    }

    closeNoteEditModal() {
        const modal = document.getElementById('note-edit-modal');
        if (modal) {
            modal.style.display = 'none';

            // Event-Listener entfernen
            if (this.noteEditModalClickHandler) {
                modal.removeEventListener('click', this.noteEditModalClickHandler);
                this.noteEditModalClickHandler = null;
            }
            if (this.noteEditModalMouseDownHandler) {
                modal.removeEventListener('mousedown', this.noteEditModalMouseDownHandler);
                this.noteEditModalMouseDownHandler = null;
            }
            this.noteEditModalMouseDownTarget = null;
        }

        this.currentNoteId = null;
    }

    async saveNote() {
        const textarea = document.getElementById('note-text-input');
        if (!textarea) return;

        const noteText = textarea.value.trim();

        if (!noteText) {
            alert('Bitte geben Sie einen Notiz-Text ein.');
            return;
        }

        if (!this.currentTeacherId) {
            alert('Fehler: Keine Lehrkraft ausgewählt.');
            return;
        }

        try {
            let response;
            if (this.currentNoteId) {
                // Update
                response = await fetch('/api/teachers/update_note.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        note_id: this.currentNoteId,
                        note_text: noteText
                    })
                });
            } else {
                // Create
                response = await fetch('/api/teachers/create_note.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        teacher_id: this.currentTeacherId,
                        note_text: noteText
                    })
                });
            }

            const data = await response.json();

            if (data.success) {
                this.closeNoteEditModal();
                // Notizen neu laden
                await this.loadTeacherNotes(this.currentTeacherId);
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Notiz:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Möchten Sie diese Notiz wirklich löschen?')) {
            return;
        }

        try {
            const response = await fetch('/api/teachers/delete_note.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    note_id: noteId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Notizen neu laden
                await this.loadTeacherNotes(this.currentTeacherId);
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Notiz:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }
    
    async exportToXLSX() {
        try {
            // Lade alle Lehrkräfte für den Export
            const params = new URLSearchParams({
                page: 1,
                limit: 999999
            });
            
            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            if (this.currentSchool) {
                params.append('school', this.currentSchool);
            }
            if (this.currentInfowebinar) {
                params.append('infowebinar', this.currentInfowebinar);
            }
            if (this.currentAdmin) {
                params.append('admin', this.currentAdmin);
            }
            
            const response = await fetch(`/api/teachers/get_all_teachers.php?${params}`);
            const data = await response.json();
            
            if (!data || !data.teachers || !Array.isArray(data.teachers)) {
                alert('Fehler beim Laden der Daten');
                return;
            }
            
            // Definiere Spalten für den Export
            const columns = [
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'E-Mail' },
                { key: 'school_name', label: 'Schule' },
                { key: 'admin', label: 'Rolle' },
                { key: 'infowebinar', label: 'Info-Webinar' },
                { key: 'status_name', label: 'Status' },
                { key: 'school_foerderung', label: 'Förderung' },
                { key: 'class_count', label: 'Klassen' },
                { key: 'student_count', label: 'Schüler' },
                { key: 'project_count', label: 'Projekte' },
                { key: 'last_login', label: 'Letzter Login' }
            ];
            
            // Bereite Daten für Export vor
            const exportData = data.teachers.map(teacher => ({
                id: teacher.id,
                name: teacher.name || '',
                email: teacher.email || '',
                school_name: teacher.school_name || '',
                admin: teacher.admin ? 'Admin' : 'Lehrkräfte',
                infowebinar: this.formatInfowebinarDate(teacher.infowebinar),
                status_name: teacher.status_name || '',
                school_foerderung: teacher.school_foerderung === true ? 'Ja' : teacher.school_foerderung === false ? 'Nein' : '-',
                class_count: teacher.class_count || 0,
                student_count: teacher.student_count || 0,
                project_count: teacher.project_count || 0,
                last_login: this.formatDate(teacher.last_login)
            }));
            
            // Exportiere
            const filename = `Lehrkraefte_${new Date().toISOString().split('T')[0]}`;
            window.exportToXLSX(exportData, columns, filename);
        } catch (error) {
            console.error('Export-Fehler:', error);
            alert('Fehler beim Exportieren: ' + error.message);
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
let teachersManager;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    teachersManager = new TeachersManager();
    
    // Scroll to Top Button Event Listener
    window.addEventListener('scroll', toggleScrollToTopButton);
});