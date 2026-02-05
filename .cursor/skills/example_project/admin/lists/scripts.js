class ListsManager {
    constructor() {
        this.currentPage = 1;
        this.currentListId = null;
        this.currentColorFilter = '';
        this.currentTagFilter = '';
        this.currentSearch = '';
        this.currentTeacherId = null;
        this.currentNotes = '';
        this.allTags = new Set();
        this.columnOrder = null; // Gespeicherte Spaltenreihenfolge
        this.columnWidths = {}; // Gespeicherte Spaltenbreiten
        this.draggedColumn = null;
        this.resizingColumn = null;
        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.isFullscreen = false;
        this.refreshInterval = null;
        this.viewRefreshInterval = null;
        this.selectedTags = new Set();
        this.itemsPerPage = 20;
        
        this.init();
    }

    async init() {
        // Stoppe alle laufenden Intervalle beim Init
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.viewRefreshInterval) {
            clearInterval(this.viewRefreshInterval);
            this.viewRefreshInterval = null;
        }
        
        const path = window.location.pathname;
        if (path.includes('/create.php')) {
            this.initCreatePage();
        } else if (path.includes('/view.php')) {
            this.currentListId = typeof LIST_ID !== 'undefined' ? LIST_ID : null;
            this.initViewPage();
        } else {
            this.initIndexPage();
        }
    }

    async initIndexPage() {
        await this.loadLists();
    }

    async initCreatePage() {
        await this.loadSchools();
        await this.loadStatuses();
        this.bindCreateEvents();
    }

    async initViewPage() {
        if (!this.currentListId) {
            alert('Keine Liste ausgewählt');
            window.location.href = './index.php';
            return;
        }
        this.loadColumnSettings();
        this.bindViewEvents();
        await this.loadListData();
    }
    
    loadColumnSettings() {
        // Lade gespeicherte Spaltenreihenfolge und -breiten aus localStorage
        const savedOrder = localStorage.getItem(`list_${this.currentListId}_column_order`);
        const savedWidths = localStorage.getItem(`list_${this.currentListId}_column_widths`);
        
        if (savedOrder) {
            this.columnOrder = JSON.parse(savedOrder);
        }
        
        if (savedWidths) {
            this.columnWidths = JSON.parse(savedWidths);
        }
    }
    
    saveColumnSettings() {
        // Speichere Spaltenreihenfolge und -breiten in localStorage
        if (this.columnOrder) {
            localStorage.setItem(`list_${this.currentListId}_column_order`, JSON.stringify(this.columnOrder));
        }
        if (Object.keys(this.columnWidths).length > 0) {
            localStorage.setItem(`list_${this.currentListId}_column_widths`, JSON.stringify(this.columnWidths));
        }
    }

    bindCreateEvents() {
        const form = document.getElementById('create-list-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createList();
        });
    }

    bindViewEvents() {
        document.getElementById('filter-color').addEventListener('change', (e) => {
            this.currentColorFilter = e.target.value;
            this.currentPage = 1;
            this.loadListData();
        });

        document.getElementById('filter-tag').addEventListener('input', (e) => {
            this.currentTagFilter = e.target.value;
            this.currentPage = 1;
            this.loadListData();
        });

        document.getElementById('filter-search').addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.currentPage = 1;
            this.loadListData();
        });
        
        // Einträge pro Seite
        const perPageSelect = document.getElementById('per-page-select');
        if (perPageSelect) {
            // Lade gespeicherten Wert aus localStorage
            const savedPerPage = localStorage.getItem(`list_${this.currentListId}_per_page`);
            if (savedPerPage) {
                this.itemsPerPage = savedPerPage === 'all' ? 'all' : parseInt(savedPerPage);
                perPageSelect.value = savedPerPage;
            } else {
                perPageSelect.value = '20';
            }
        }
        
        // Enter-Taste für Tag-Eingabe
        const newTagInput = document.getElementById('new-tag-input');
        if (newTagInput) {
            newTagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addNewTag();
                }
            });
        }
    }

    async loadSchools() {
        try {
            const select = document.getElementById('filter-schools');
            select.innerHTML = '<option value="">Lade Schulen...</option>';
            
            // Lade alle Schulen durch mehrere Seiten falls nötig
            let allSchools = [];
            const loadedIds = new Set();
            let page = 1;
            const limit = 100; // Max Limit pro Seite
            let hasMore = true;
            
            while (hasMore) {
                const response = await fetch(`/api/schools/get_schools.php?limit=${limit}&page=${page}`);
                const data = await response.json();
                
                if (data.schools && data.schools.length > 0) {
                    // Nur Schulen hinzufügen, deren ID wir noch nicht haben
                    const uniqueNewSchools = data.schools.filter(school => {
                        if (loadedIds.has(school.id)) {
                            return false;
                        }
                        loadedIds.add(school.id);
                        return true;
                    });
                    
                    allSchools = allSchools.concat(uniqueNewSchools);
                    
                    // Prüfe ob es weitere Seiten gibt
                    const totalPages = Math.ceil(data.total / limit);
                    hasMore = page < totalPages;
                    page++;
                } else {
                    hasMore = false;
                }
            }
            
            // Dropdown füllen
            select.innerHTML = '';
            if (allSchools.length > 0) {
                allSchools.forEach(school => {
                    const option = document.createElement('option');
                    option.value = school.name;
                    option.textContent = school.name;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Fehler beim Laden der Schulen:', error);
            const select = document.getElementById('filter-schools');
            select.innerHTML = '<option value="">Fehler beim Laden</option>';
        }
    }

    async loadStatuses() {
        try {
            const response = await fetch('/api/pipeline/get_teachers_by_status.php?status_id=0&limit=1');
            // Hole Status-Liste direkt aus der Datenbank über eine einfache API
            // Für jetzt verwenden wir einen Workaround
            const select = document.getElementById('filter-status');
            
            // Lade Status über eine separate Abfrage
            const statusResponse = await fetch('/api/admin/lists/get_statuses.php');
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                if (statusData.success && statusData.statuses) {
                    statusData.statuses.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status.id;
                        option.textContent = status.display_name;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Status:', error);
        }
    }

    async createList() {
        const name = document.getElementById('list-name').value.trim();
        if (!name) {
            alert('Bitte geben Sie einen Namen ein');
            return;
        }

        // Sammle Filter
        const schoolsSelect = document.getElementById('filter-schools');
        const selectedSchools = Array.from(schoolsSelect.selectedOptions).map(opt => opt.value);
        
        const filterConfig = {
            schools: selectedSchools.filter(s => s),
            infowebinar: document.getElementById('filter-infowebinar').value,
            admin_role: document.getElementById('filter-admin-role').value,
            status_id: document.getElementById('filter-status').value || null,
            bundesland: document.getElementById('filter-bundesland').value,
            foerderung: document.getElementById('filter-foerderung').value,
            search: document.getElementById('filter-search').value.trim()
        };

        // Sammle Spalten
        const columnsConfig = {};
        document.querySelectorAll('input[type="checkbox"][data-column]').forEach(checkbox => {
            columnsConfig[checkbox.dataset.column] = checkbox.checked;
        });

        // Prüfe ob mindestens eine Spalte ausgewählt ist
        const hasColumns = Object.values(columnsConfig).some(v => v);
        if (!hasColumns) {
            alert('Bitte wählen Sie mindestens eine Spalte aus');
            return;
        }

        try {
            const response = await fetch('/api/admin/lists/create_list.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    filter_config: filterConfig,
                    columns_config: columnsConfig
                })
            });

            const data = await response.json();

            if (data.success) {
                // Weiterleitung zur Übersicht (nicht zur View-Seite)
                window.location.href = './index.php';
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Erstellen der Liste:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    async loadLists() {
        const content = document.getElementById('lists-content');
        content.innerHTML = '<div class="loading">Lade Listen...</div>';

        try {
            const response = await fetch('/api/admin/lists/get_lists.php');
            const data = await response.json();

            if (data.success) {
                this.renderLists(data.lists);
            } else {
                content.innerHTML = '<div class="error">Fehler beim Laden der Listen</div>';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Listen:', error);
            content.innerHTML = '<div class="error">Fehler beim Laden der Listen</div>';
        }
    }

    renderLists(lists) {
        const content = document.getElementById('lists-content');
        
        if (lists.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <p>Noch keine Listen vorhanden</p>
                    <button class="btn btn-primary" onclick="listsManager.createNewList()">
                        <i class="fas fa-plus"></i> Erste Liste erstellen
                    </button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="lists-grid">
                ${lists.map(list => {
                    const statusBadge = list.is_generating ? '' : '';
                    
                    return `
                    <div class="list-card ${list.is_generating ? 'generating' : ''} ${list.is_generating ? '' : 'clickable'}" 
                         ${list.is_generating ? '' : `onclick="window.location.href='./view.php?list_id=${list.id}'"`}>
                        <div class="card-header list-card-header">
                            <div>
                                <h3>${this.escapeHtml(list.name)}</h3>
                                ${statusBadge}
                            </div>
                            <div class="list-card-actions">
                                <button class="btn-trash btn-icon" onclick="event.stopPropagation(); listsManager.deleteList(${list.id}, '${this.escapeHtml(list.name)}')" title="Löschen">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="list-card-body">
                            <div class="list-info">
                                <span><i class="fas fa-users"></i> ${list.teacher_count} Lehrer</span>
                                <span><i class="fas fa-user"></i> ${this.escapeHtml(list.created_by_name)}</span>
                                <span><i class="fas fa-clock"></i> ${this.formatDate(list.last_updated || list.created_at)}</span>
                            </div>
                        </div>
                        <div class="list-card-footer">
                            <span class="list-card-link">
                                <i class="fas fa-eye"></i> ${list.is_generating ? 'Wird erstellt...' : 'Anzeigen'}
                            </span>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
        
        // Auto-Refresh wenn Listen generiert werden
        const hasGenerating = lists.some(list => list.is_generating);
        if (hasGenerating) {
            // Refresh alle 3 Sekunden wenn Listen generiert werden
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            this.refreshInterval = setInterval(() => {
                this.loadLists();
            }, 3000);
        } else {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        }
    }

    async loadListData() {
        const entriesDiv = document.getElementById('list-entries');
        const resultsCount = document.getElementById('results-count');
        
        entriesDiv.innerHTML = '<div class="loading">Lade Einträge...</div>';
        resultsCount.textContent = 'Lade...';

        try {
            // Prüfe zuerst ob Liste noch generiert wird
            const listCheckResponse = await fetch(`/api/admin/lists/get_lists.php`);
            const listCheckData = await listCheckResponse.json();
            
            if (listCheckData.success) {
                const currentList = listCheckData.lists.find(l => l.id === this.currentListId);
                if (currentList && currentList.is_generating) {
                    entriesDiv.innerHTML = `
                        <div class="generating-message">
                            <i class="fas fa-spinner fa-spin"></i>
                            <h3>Liste wird gerade erstellt...</h3>
                            <p>Bitte warten Sie, bis die Liste fertig generiert wurde.</p>
                            <p>Die Seite aktualisiert sich automatisch.</p>
                            <button class="btn btn-secondary" onclick="window.location.href='./index.php'">
                                Zur Übersicht
                            </button>
                        </div>
                    `;
                    resultsCount.textContent = 'Wird generiert...';
                    
                    // Auto-Refresh alle 3 Sekunden
                    if (this.viewRefreshInterval) {
                        clearInterval(this.viewRefreshInterval);
                    }
                    this.viewRefreshInterval = setInterval(() => {
                        this.loadListData();
                    }, 3000);
                    return;
                } else {
                    // Liste ist fertig, stoppe Auto-Refresh
                    if (this.viewRefreshInterval) {
                        clearInterval(this.viewRefreshInterval);
                        this.viewRefreshInterval = null;
                    }
                }
            }
            
            const params = new URLSearchParams({
                list_id: this.currentListId,
                page: this.currentPage,
                limit: this.itemsPerPage === 'all' ? 999999 : this.itemsPerPage
            });

            if (this.currentColorFilter) {
                params.append('color', this.currentColorFilter);
            }
            if (this.currentTagFilter) {
                params.append('tag', this.currentTagFilter);
            }
            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            
            // Sortier-Parameter hinzufügen
            if (this.currentSortColumn) {
                params.append('sort_column', this.currentSortColumn);
                params.append('sort_direction', this.currentSortDirection);
            }

            const response = await fetch(`/api/admin/lists/get_list_data.php?${params}`);
            const data = await response.json();

            if (data.success) {
                document.getElementById('list-title').textContent = data.list_name;
                this.renderEntries(data.entries);
                this.renderResultsCount(data.total);
                // Zeige Pagination nur wenn nicht "alle" ausgewählt
                if (this.itemsPerPage !== 'all') {
                    this.renderPagination(data.total, data.page, data.limit);
                    this.renderPaginationTop(data.total, data.page, data.limit);
                } else {
                    // Verstecke Pagination bei "alle"
                    const pagination = document.getElementById('pagination');
                    const paginationTop = document.getElementById('pagination-top');
                    if (pagination) pagination.innerHTML = '';
                    if (paginationTop) paginationTop.innerHTML = '';
                }
                // Aktualisiere Sort-Indikatoren nach dem Rendern
                this.updateSortIndicators();
            } else {
                entriesDiv.innerHTML = '<div class="error">Fehler beim Laden der Einträge</div>';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Einträge:', error);
            entriesDiv.innerHTML = '<div class="error">Fehler beim Laden der Einträge</div>';
        }
    }

    renderEntries(entries) {
        const entriesDiv = document.getElementById('list-entries');
        
        if (entries.length === 0) {
            entriesDiv.innerHTML = '<div class="empty-state">Keine Einträge gefunden</div>';
            return;
        }

        // Sammle alle Tags für Autocomplete
        entries.forEach(entry => {
            if (entry.tags && Array.isArray(entry.tags)) {
                entry.tags.forEach(tag => this.allTags.add(tag));
            }
        });

        entriesDiv.innerHTML = `
            <div class="table-wrapper">
                <table class="list-table">
                    <thead>
                        <tr>
                            ${this.getColumnHeaders(entries[0]?.data || {})}
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map(entry => this.renderEntryRow(entry)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Initialisiere Drag & Drop, Resize und Sortierung nach dem Rendern
        setTimeout(() => {
            this.initColumnDragDrop();
            this.initColumnResize();
            this.initColumnSorting();
        }, 100);
    }

    getColumnHeaders(data) {
        const headers = [];
        
        // Standard-Spaltenreihenfolge
        const defaultOrder = ['color', 'name', 'email', 'phone', 'school_name', 'school_bundesland', 'infowebinar', 
                            'class_count', 'student_count', 'total_t_coins', 'avg_t_coins', 
                            'project_count', 'last_login', 'registered_at', 'status_name', 'admin', 'school_foerderung',
                            'tags', 'notes'];
        
        // Verwende gespeicherte Reihenfolge oder Standard
        const order = this.columnOrder || defaultOrder;
        
        const labels = {
            color: 'Farbe',
            name: 'Name',
            email: 'E-Mail',
            phone: 'Telefon',
            school_name: 'Schule',
            school_bundesland: 'Bundesland',
            infowebinar: 'Info-Webinar',
            class_count: 'Klassen',
            student_count: 'Schüler',
            total_t_coins: 'T!Coins gesamt',
            avg_t_coins: 'T!Score',
            project_count: 'Projekte',
            last_login: 'Letzter Login',
            registered_at: 'Registriert',
            status_name: 'Status',
            admin: 'Admin',
            school_foerderung: 'Förderung',
            tags: 'Tags',
            notes: 'Notizen'
        };
        
        // Filtere nur Spalten, die in den Daten vorhanden sind (außer fixe Spalten)
        const fixedColumns = ['color', 'name', 'tags', 'notes'];
        
        order.forEach(col => {
            const isFixed = fixedColumns.includes(col);
            const hasData = data[col] !== undefined;
            
            if (isFixed || hasData) {
                const width = this.columnWidths[col] ? `width: ${this.columnWidths[col]}px;` : '';
                const minWidth = col === 'color' ? 'min-width: 60px;' : col === 'name' ? 'min-width: 150px;' : '';
                const isSortable = !['color', 'tags', 'notes'].includes(col);
                const sortClass = isSortable ? 'sortable' : '';
                const sortIndicator = isSortable ? '<span class="sort-indicator">↕</span>' : '';
                headers.push(`<th class="column-header ${sortClass}" data-column="${col}" style="${width}${minWidth}" draggable="true" ${isSortable ? `onclick="listsManager.sortTable('${col}')"` : ''}>
                    <div class="column-header-content">
                        <span class="column-label">${labels[col] || col} ${sortIndicator}</span>
                        <div class="column-resize-handle"></div>
                    </div>
                </th>`);
            }
        });
        
        return headers.join('');
    }

    renderEntryRow(entry) {
        const data = entry.data;
        const colorClass = entry.color_marker ? `color-${entry.color_marker}` : '';
        const hasNotes = entry.notes && entry.notes.trim().length > 0;
        
        // Verwende gespeicherte Reihenfolge oder Standard
        const defaultOrder = ['color', 'name', 'email', 'phone', 'school_name', 'school_bundesland', 'infowebinar', 
                            'class_count', 'student_count', 'total_t_coins', 'avg_t_coins', 
                            'project_count', 'last_login', 'registered_at', 'status_name', 'admin', 'school_foerderung',
                            'tags', 'notes'];
        const order = this.columnOrder || defaultOrder;
        
        const tagsHtml = entry.tags && entry.tags.length > 0 
            ? entry.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')
            : '<span class="no-tags">Keine Tags</span>';
        
        // Farbpunkt mit aktueller Farbe
        const currentColor = entry.color_marker || 'none';
        const colorDotClass = currentColor !== 'none' ? `color-dot-${currentColor}` : 'color-dot-none';
        
        // Filtere nur Spalten, die in den Daten vorhanden sind (außer fixe Spalten)
        const fixedColumns = ['color', 'name', 'tags', 'notes'];
        
        let cells = '';
        order.forEach(col => {
            const isFixed = fixedColumns.includes(col);
            const hasData = data[col] !== undefined;
            
            // Rendere alle fixen Spalten und alle Spalten, die in der Konfiguration aktiviert sind
            if (isFixed || hasData) {
                const width = this.columnWidths[col] ? `width: ${this.columnWidths[col]}px;` : '';
                
                if (col === 'color') {
                    cells += `
                        <td data-column="color" style="${width}">
                            <div class="color-picker-wrapper">
                                <div class="color-dot ${colorDotClass}" 
                                     onclick="listsManager.showColorPicker(${entry.teacher_id}, event)"
                                     data-teacher-id="${entry.teacher_id}"
                                     data-current-color="${currentColor}">
                                </div>
                            </div>
                        </td>
                    `;
                } else if (col === 'name') {
                    const nameValue = data.name && data.name.trim() ? data.name : '-';
                    cells += `<td data-column="name" style="${width}"><strong>${this.escapeHtml(nameValue)}</strong></td>`;
                } else if (col === 'tags') {
                    cells += `
                        <td data-column="tags" style="${width}">
                            <div class="tags-container">
                                ${tagsHtml}
                                <button class="btn-icon-small" onclick="listsManager.showTagEditor(${entry.teacher_id})" title="Tags bearbeiten">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    `;
                } else if (col === 'notes') {
                    const noteSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="note-icon">
                            <path class="note-outline" d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke-width="1.5"/>
                            <path class="note-lines" d="M7 7H15V8H7V7ZM7 10H17V11H7V10ZM7 13H14V14H7V13Z"/>
                            <path class="note-corner" d="M16 13L19 10L17.5 8.5L14.5 11.5V13H16Z"/>
                          </svg>`;
                    cells += `
                        <td data-column="notes" style="${width}">
                            <button class="btn-notes ${hasNotes ? 'has-notes' : ''}" 
                                    onclick="listsManager.showNotesModal(${entry.teacher_id})" 
                                    title="${hasNotes ? 'Notizen anzeigen/bearbeiten' : 'Notizen hinzufügen'}">
                                ${noteSvg}
                            </button>
                        </td>
                    `;
                } else {
                    // Hole Wert, auch wenn undefined
                    let value = data[col];
                    if (col === 'infowebinar') {
                        value = this.formatInfowebinarDate(value);
                    } else if (col === 'last_login' || col === 'registered_at') {
                        value = this.formatDate(value);
                    } else if (col === 'admin') {
                        value = value ? 'Ja' : 'Nein';
                    } else if (col === 'school_foerderung') {
                        value = value === true ? 'Ja' : value === false ? 'Nein' : '-';
                    }
                    
                    // Prüfe ob Wert leer ist (inkl. undefined)
                    const isEmpty = value === null || value === undefined || value === '' || 
                                   (typeof value === 'string' && value.trim() === '');
                    const displayValue = isEmpty ? '-' : value;
                    
                    cells += `<td data-column="${col}" style="${width}">${this.escapeHtml(displayValue)}</td>`;
                }
            }
        });
        
        return `
            <tr class="${colorClass}" data-teacher-id="${entry.teacher_id}" data-cache-id="${entry.cache_id}">
                ${cells}
            </tr>
        `;
    }

    showColorPicker(teacherId, event) {
        event.stopPropagation();
        
        // Schließe alle anderen Color-Picker
        document.querySelectorAll('.color-picker-tooltip').forEach(tooltip => {
            if (tooltip.dataset.teacherId !== teacherId.toString()) {
                tooltip.remove();
            }
        });
        
        // Prüfe ob bereits geöffnet
        const existing = document.querySelector(`.color-picker-tooltip[data-teacher-id="${teacherId}"]`);
        if (existing) {
            existing.remove();
            return;
        }
        
        // Hole aktuelle Farbe
        const dot = event.target.closest('.color-dot');
        const currentColor = dot ? dot.dataset.currentColor : 'none';
        
        // Erstelle Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'color-picker-tooltip';
        tooltip.dataset.teacherId = teacherId;
        
        const colors = [
            { value: 'none', label: 'Keine', color: '#e0e0e0' },
            { value: 'red', label: 'Rot', color: '#dc3545' },
            { value: 'yellow', label: 'Gelb', color: '#ffc107' },
            { value: 'green', label: 'Grün', color: '#28a745' },
            { value: 'blue', label: 'Blau', color: '#007bff' },
            { value: 'orange', label: 'Orange', color: '#fd7e14' },
            { value: 'purple', label: 'Lila', color: '#6f42c1' },
            { value: 'gray', label: 'Grau', color: '#6c757d' },
            { value: 'pink', label: 'Rosa', color: '#e91e63' }
        ];
        
        tooltip.innerHTML = `
            <div class="color-picker-grid">
                ${colors.map(color => `
                    <div class="color-picker-option ${currentColor === color.value ? 'selected' : ''}" 
                         data-color="${color.value}"
                         data-label="${color.label}"
                         style="background-color: ${color.color}"
                         onclick="listsManager.selectColor(${teacherId}, '${color.value}')"
                         title="${color.label}">
                        ${currentColor === color.value ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Positioniere Tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = (rect.left + rect.width / 2 - 90) + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        tooltip.style.zIndex = '10000';
        
        document.body.appendChild(tooltip);
        
        // Schließe beim Klick außerhalb
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!tooltip.contains(e.target) && !e.target.closest('.color-dot')) {
                    tooltip.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 0);
    }
    
    async selectColor(teacherId, color) {
        // Entferne Tooltip
        const tooltip = document.querySelector(`.color-picker-tooltip[data-teacher-id="${teacherId}"]`);
        if (tooltip) {
            tooltip.remove();
        }
        
        await this.updateColor(teacherId, color === 'none' ? null : color);
    }

    async updateColor(teacherId, color) {
        try {
            const response = await fetch('/api/admin/lists/update_entry.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId,
                    teacher_id: teacherId,
                    color_marker: color || null
                })
            });

            const data = await response.json();
            if (data.success) {
                // Aktualisiere Zeile visuell
                const row = document.querySelector(`tr[data-teacher-id="${teacherId}"]`);
                const dot = row ? row.querySelector('.color-dot') : null;
                
                if (row) {
                    // Entferne alle Farbklassen
                    row.className = row.className.replace(/color-\w+/g, '').trim();
                    if (color) {
                        row.classList.add(`color-${color}`);
                    }
                }
                
                if (dot) {
                    // Aktualisiere Farbpunkt
                    dot.className = 'color-dot ' + (color ? `color-dot-${color}` : 'color-dot-none');
                    dot.dataset.currentColor = color || 'none';
                }
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Farbe:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    showTagEditor(teacherId) {
        this.currentTeacherId = teacherId;
        
        // Hole aktuelle Tags des Eintrags
        const row = document.querySelector(`tr[data-teacher-id="${teacherId}"]`);
        const tagsContainer = row ? row.querySelector('.tags-container') : null;
        const currentTags = tagsContainer 
            ? Array.from(tagsContainer.querySelectorAll('.tag')).map(t => t.textContent.trim()).filter(t => t)
            : [];
        
        // Setze aktuelle Tags als ausgewählt
        this.selectedTags = new Set(currentTags);
        
        // Rendere verfügbare Tags (alle bekannten Tags aus der Liste)
        this.renderAvailableTags();
        
        // Setze Modal-Titel
        const teacherName = row ? (row.querySelector('td[data-column="name"]')?.textContent || 'Lehrer') : 'Lehrer';
        document.getElementById('tags-modal-title').textContent = `Tags für ${teacherName}`;
        
        // Öffne Modal
        document.getElementById('tags-modal').style.display = 'flex';
        
        // Fokus auf Eingabefeld
        setTimeout(() => {
            document.getElementById('new-tag-input').focus();
        }, 100);
    }
    
    renderAvailableTags() {
        const container = document.getElementById('available-tags');
        const sortedTags = Array.from(this.allTags).sort();
        
        if (sortedTags.length === 0) {
            container.innerHTML = '<span class="no-tags-text">Noch keine Tags vorhanden</span>';
            return;
        }
        
        container.innerHTML = sortedTags.map(tag => {
            const isSelected = this.selectedTags.has(tag);
            const escapedTag = this.escapeHtml(tag);
            return `
                <span class="tag-badge ${isSelected ? 'selected' : ''}" 
                      onclick="listsManager.toggleTag('${escapedTag}')"
                      title="${isSelected ? 'Tag entfernen' : 'Tag hinzufügen'}">
                    ${escapedTag}
                    ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                    <i class="fas fa-trash tag-delete-icon" 
                       onclick="event.stopPropagation(); listsManager.deleteTag('${escapedTag}')" 
                       title="Tag aus allen Einträgen löschen"></i>
                </span>
            `;
        }).join('');
    }
    
    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }
        this.renderAvailableTags();
    }
    
    addNewTag() {
        const input = document.getElementById('new-tag-input');
        const tag = input.value.trim();
        
        if (!tag) {
            return;
        }
        
        // Füge Tag zu ausgewählten Tags hinzu
        this.selectedTags.add(tag);
        
        // Füge Tag zu bekannten Tags hinzu
        this.allTags.add(tag);
        
        // Leere Eingabefeld
        input.value = '';
        
        // Aktualisiere Anzeige
        this.renderAvailableTags();
        
        // Fokus zurück auf Eingabefeld
        input.focus();
    }
    
    async deleteTag(tag) {
        if (!confirm(`Möchten Sie das Tag "${tag}" wirklich aus allen Einträgen dieser Liste löschen?`)) {
            return;
        }
        
        try {
            // Entferne Tag aus allen Einträgen der Liste
            const response = await fetch('/api/admin/lists/delete_tag.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId,
                    tag: tag
                })
            });

            const data = await response.json();
            if (data.success) {
                // Entferne Tag aus allTags
                this.allTags.delete(tag);
                // Entferne Tag aus selectedTags falls vorhanden
                this.selectedTags.delete(tag);
                // Aktualisiere Anzeige
                this.renderAvailableTags();
                // Lade Liste neu, um Änderungen zu sehen
                await this.loadListData();
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Löschen des Tags:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }
    
    closeTagModal() {
        document.getElementById('tags-modal').style.display = 'none';
        this.currentTeacherId = null;
        this.selectedTags = new Set();
        document.getElementById('new-tag-input').value = '';
    }
    
    async saveTags() {
        const tags = Array.from(this.selectedTags);
        
        try {
            const response = await fetch('/api/admin/lists/update_entry.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId,
                    teacher_id: this.currentTeacherId,
                    tags: tags
                })
            });

            const data = await response.json();
            if (data.success) {
                this.closeTagModal();
                await this.loadListData();
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Tags:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    async showNotesModal(teacherId) {
        this.currentTeacherId = teacherId;
        
        try {
            const response = await fetch(`/api/admin/lists/get_entry_details.php?list_id=${this.currentListId}&teacher_id=${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
                const entry = data.entry;
                document.getElementById('notes-text').value = entry.notes || '';
                document.getElementById('notes-modal-title').textContent = `Notizen für ${entry.cached_data.name || 'Lehrer'}`;
                
                let metaHtml = '';
                if (entry.updated_at) {
                    metaHtml += `<small>Zuletzt geändert: ${this.formatDate(entry.updated_at)}`;
                    if (entry.updated_by_name) {
                        metaHtml += ` von ${this.escapeHtml(entry.updated_by_name)}`;
                    }
                    metaHtml += `</small>`;
                }
                document.getElementById('notes-meta').innerHTML = metaHtml;
                
                document.getElementById('notes-modal').style.display = 'flex';
            } else {
                alert('Fehler beim Laden der Notizen');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Notizen:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    closeNotesModal() {
        document.getElementById('notes-modal').style.display = 'none';
        this.currentTeacherId = null;
        this.currentNotes = '';
    }

    async saveNotes() {
        const notes = document.getElementById('notes-text').value;
        
        try {
            const response = await fetch('/api/admin/lists/update_entry.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId,
                    teacher_id: this.currentTeacherId,
                    notes: notes
                })
            });

            const data = await response.json();
            if (data.success) {
                this.closeNotesModal();
                await this.loadListData();
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Notizen:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    async refreshList() {
        if (!confirm('Möchten Sie die Liste wirklich aktualisieren? Dies kann einige Zeit dauern.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/admin/lists/update_list_cache.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId
                })
            });

            const data = await response.json();
            if (data.success) {
                // Weiterleitung zur Übersicht
                window.location.href = './index.php';
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Liste:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    async transferNotes() {
        if (!confirm('Möchten Sie wirklich alle Notizen aus dieser Liste in die Lehrkräfte-Notizen übertragen?\n\nDies erstellt für jede Lehrkraft mit Notizen einen neuen Eintrag in den Lehrkräfte-Notizen.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/admin/lists/transfer_notes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: this.currentListId
                })
            });

            const data = await response.json();
            if (data.success) {
                let message = `Erfolgreich übertragen: ${data.transferred_count} Notizen`;
                if (data.skipped_count > 0) {
                    message += `\nÜbersprungen: ${data.skipped_count} Einträge`;
                }
                if (data.errors && data.errors.length > 0) {
                    message += `\n\nFehler:\n${data.errors.join('\n')}`;
                }
                alert(message);
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Übertragen der Notizen:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }


    async deleteList(listId, listName) {
        if (!confirm(`Möchten Sie die Liste "${listName}" wirklich löschen?`)) {
            return;
        }
        
        try {
            const response = await fetch('/api/admin/lists/delete_list.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list_id: listId
                })
            });

            const data = await response.json();
            if (data.success) {
                await this.loadLists();
            } else {
                alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Liste:', error);
            alert('Ein Fehler ist aufgetreten.');
        }
    }

    clearFilters() {
        document.getElementById('filter-color').value = '';
        document.getElementById('filter-tag').value = '';
        document.getElementById('filter-search').value = '';
        this.currentColorFilter = '';
        this.currentTagFilter = '';
        this.currentSearch = '';
        this.currentPage = 1;
        this.loadListData();
    }

    createNewList() {
        window.location.href = './create.php';
    }

    renderResultsCount(total) {
        document.getElementById('results-count').textContent = `${total} Einträge gefunden`;
    }

    renderPagination(total, currentPage, limit) {
        const pagination = document.getElementById('pagination');
        this.renderPaginationInternal(pagination, total, currentPage, limit);
    }

    renderPaginationTop(total, currentPage, limit) {
        const pagination = document.getElementById('pagination-top');
        this.renderPaginationInternal(pagination, total, currentPage, limit);
    }

    renderPaginationInternal(container, total, currentPage, limit) {
        const totalPages = Math.ceil(total / limit);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="listsManager.goToPage(${currentPage - 1})">Zurück</button>`;
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button onclick="listsManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span>...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="listsManager.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span>...</span>`;
            }
            html += `<button onclick="listsManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="listsManager.goToPage(${currentPage + 1})">Weiter</button>`;
        
        container.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadListData();
    }

    formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === '0000-00-00' || dateString === null) {
            return '-';
        }
        try {
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

    formatInfowebinarDate(value) {
        if (!value || value === '0000-00-00 00:00:00' || value === '0000-00-00' || value === null) {
            return 'Nein';
        }
        return this.formatDate(value);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    initColumnDragDrop() {
        const headers = document.querySelectorAll('.list-table thead th.column-header');
        
        headers.forEach((header) => {
            // Verhindere Drag & Drop auf Resize-Handle
            const resizeHandle = header.querySelector('.column-resize-handle');
            if (resizeHandle) {
                resizeHandle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
            }
            
            header.addEventListener('dragstart', (e) => {
                // Verhindere Drag & Drop wenn auf Resize-Handle geklickt wird
                if (e.target.classList.contains('column-resize-handle')) {
                    e.preventDefault();
                    return;
                }
                
                this.draggedColumn = header;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', header.dataset.column);
                header.classList.add('dragging');
                header.style.opacity = '0.5';
            });
            
            header.addEventListener('dragend', (e) => {
                header.classList.remove('dragging');
                header.style.opacity = '1';
                document.querySelectorAll('.list-table thead th').forEach(th => {
                    th.classList.remove('drag-over');
                });
                this.draggedColumn = null;
            });
            
            header.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            header.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (this.draggedColumn && this.draggedColumn !== header) {
                    header.classList.add('drag-over');
                }
            });
            
            header.addEventListener('dragleave', (e) => {
                header.classList.remove('drag-over');
            });
            
            header.addEventListener('drop', (e) => {
                e.preventDefault();
                header.classList.remove('drag-over');
                
                if (this.draggedColumn && this.draggedColumn !== header) {
                    const allHeaders = Array.from(document.querySelectorAll('.list-table thead th.column-header'));
                    const draggedIndex = allHeaders.indexOf(this.draggedColumn);
                    const targetIndex = allHeaders.indexOf(header);
                    
                    if (draggedIndex !== -1 && targetIndex !== -1) {
                        const tbody = document.querySelector('.list-table tbody');
                        const rows = Array.from(tbody.querySelectorAll('tr'));
                        
                        rows.forEach(row => {
                            const draggedCell = row.querySelector(`td[data-column="${this.draggedColumn.dataset.column}"]`);
                            const targetCell = row.querySelector(`td[data-column="${header.dataset.column}"]`);
                            
                            if (draggedCell && targetCell) {
                                if (draggedIndex < targetIndex) {
                                    targetCell.after(draggedCell);
                                } else {
                                    targetCell.before(draggedCell);
                                }
                            }
                        });
                        
                        // Aktualisiere Header-Reihenfolge
                        if (draggedIndex < targetIndex) {
                            header.after(this.draggedColumn);
                        } else {
                            header.before(this.draggedColumn);
                        }
                        
                        // Aktualisiere gespeicherte Reihenfolge
                        const newOrder = Array.from(document.querySelectorAll('.list-table thead th.column-header'))
                            .map(th => th.dataset.column);
                        this.columnOrder = newOrder;
                        this.saveColumnSettings();
                    }
                }
            });
        });
    }
    
    
    initColumnResize() {
        const headers = document.querySelectorAll('.list-table thead th.column-header');
        
        headers.forEach(header => {
            const resizeHandle = header.querySelector('.column-resize-handle');
            if (!resizeHandle) return;
            
            let startX, startWidth, column;
            
            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                this.resizingColumn = header;
                startX = e.pageX;
                startWidth = header.offsetWidth;
                column = header.dataset.column;
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                header.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';
            });
            
            const handleMouseMove = (e) => {
                if (!this.resizingColumn) return;
                
                const width = startWidth + (e.pageX - startX);
                const minWidth = 50;
                
                if (width >= minWidth) {
                    header.style.width = width + 'px';
                    this.columnWidths[column] = width;
                    
                    // Aktualisiere alle Zellen in dieser Spalte
                    const cells = document.querySelectorAll(`.list-table tbody td[data-column="${column}"]`);
                    cells.forEach(cell => {
                        cell.style.width = width + 'px';
                    });
                }
            };
            
            const handleMouseUp = () => {
                if (this.resizingColumn) {
                    this.saveColumnSettings();
                    this.resizingColumn = null;
                    document.body.style.cursor = '';
                    header.style.userSelect = '';
                }
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        });
    }
    
    initColumnSorting() {
        // Sortierung wird über onclick im Header gehandhabt
    }
    
    changePerPage(value) {
        this.itemsPerPage = value === 'all' ? 'all' : parseInt(value);
        // Speichere in localStorage
        localStorage.setItem(`list_${this.currentListId}_per_page`, value);
        // Zurück zur ersten Seite
        this.currentPage = 1;
        // Lade Daten neu
        this.loadListData();
    }
    
    sortTable(column) {
        // Verhindere Sortierung während Drag & Drop oder Resize
        if (this.draggedColumn || this.resizingColumn) {
            return;
        }
        
        // Toggle Sortierrichtung
        if (this.currentSortColumn === column) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortDirection = 'asc';
        }
        
        // Zurück zur ersten Seite bei neuer Sortierung
        this.currentPage = 1;
        
        // Lade Daten neu mit Sortierung
        this.loadListData();
    }
    
    updateSortIndicators() {
        const table = document.querySelector('.list-table');
        if (!table) return;
        
        // Setze alle Indikatoren zurück
        table.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '↕';
        });
        table.querySelectorAll('th.column-header').forEach(header => {
            delete header.dataset.sort;
        });
        
        // Setze aktiven Sort-Indikator
        if (this.currentSortColumn) {
            const header = table.querySelector(`th[data-column="${this.currentSortColumn}"]`);
            if (header) {
                const indicator = header.querySelector('.sort-indicator');
                if (indicator) {
                    indicator.textContent = this.currentSortDirection === 'asc' ? '↑' : '↓';
                }
                header.dataset.sort = this.currentSortDirection;
            }
        }
    }
    
    getCellValue(cell, column) {
        const text = cell.textContent.trim();
        
        // Spezielle Behandlung für verschiedene Datentypen
        if (column === 'name') {
            return text;
        } else if (['class_count', 'student_count', 'total_t_coins', 'project_count'].includes(column)) {
            // Zahlen
            const num = parseInt(text.replace(/[^\d]/g, ''), 10);
            return isNaN(num) ? 0 : num;
        } else if (['avg_t_coins'].includes(column)) {
            // Dezimalzahlen
            const num = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));
            return isNaN(num) ? 0 : num;
        } else if (['last_login', 'registered_at', 'infowebinar'].includes(column)) {
            // Datum
            if (text === 'N/A' || text === 'Nein') return '';
            const date = new Date(text);
            return isNaN(date.getTime()) ? '' : date.getTime();
        } else if (column === 'admin') {
            // Boolean
            return text === 'Ja' ? 1 : 0;
        } else if (column === 'school_foerderung') {
            return text === 'Ja' ? 1 : text === 'Nein' ? 0 : -1;
        }
        
        return text;
    }
    
    compareValues(a, b) {
        // Behandle leere Werte
        if (a === '' && b === '') return 0;
        if (a === '') return 1;
        if (b === '') return -1;
        
        // Zahlenvergleich
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        
        // String-Vergleich (case-insensitive)
        const aStr = String(a).toLowerCase();
        const bStr = String(b).toLowerCase();
        
        if (aStr < bStr) return -1;
        if (aStr > bStr) return 1;
        return 0;
    }
    
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        document.body.classList.toggle('fullscreen-mode', this.isFullscreen);
        
        const toggleBtn = document.getElementById('fullscreen-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            const text = toggleBtn.querySelector('span') || toggleBtn.childNodes[1];
            if (this.isFullscreen) {
                icon.className = 'fas fa-compress';
                if (text && text.nodeType === 3) {
                    text.textContent = ' Normal';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-compress"></i> Normal';
                }
            } else {
                icon.className = 'fas fa-expand';
                if (text && text.nodeType === 3) {
                    text.textContent = ' Vollbild';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-expand"></i> Vollbild';
                }
            }
        }
        
        // Zeige/verstecke Exit-Button
        const exitBtn = document.getElementById('fullscreen-exit-btn');
        if (exitBtn) {
            exitBtn.style.display = this.isFullscreen ? 'flex' : 'none';
        }
    }
    
    async exportToXLSX() {
        if (!this.currentListId) {
            alert('Keine Liste ausgewählt');
            return;
        }
        
        try {
            // Lade alle Einträge für den Export
            const params = new URLSearchParams({
                list_id: this.currentListId,
                page: 1,
                limit: 999999
            });
            
            if (this.currentColorFilter) {
                params.append('color', this.currentColorFilter);
            }
            if (this.currentTagFilter) {
                params.append('tag', this.currentTagFilter);
            }
            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            
            const response = await fetch(`/api/admin/lists/get_list_data.php?${params}`);
            const data = await response.json();
            
            if (!data.success || !data.entries) {
                alert('Fehler beim Laden der Daten');
                return;
            }
            
            // Definiere Spalten für den Export
            const columns = [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'E-Mail' },
                { key: 'phone', label: 'Telefon' },
                { key: 'school_name', label: 'Schule' },
                { key: 'school_bundesland', label: 'Bundesland' },
                { key: 'infowebinar', label: 'Info-Webinar' },
                { key: 'class_count', label: 'Klassen' },
                { key: 'student_count', label: 'Schüler' },
                { key: 'total_t_coins', label: 'T-Coins gesamt' },
                { key: 'avg_t_coins', label: 'T-Coins Ø' },
                { key: 'project_count', label: 'Projekte' },
                { key: 'last_login', label: 'Letzter Login' },
                { key: 'registered_at', label: 'Registriert am' },
                { key: 'status_name', label: 'Status' },
                { key: 'admin', label: 'Admin' },
                { key: 'school_foerderung', label: 'Förderung' },
                { key: 'tags', label: 'Tags' },
                { key: 'notes', label: 'Notizen' }
            ];
            
            // Bereite Daten für Export vor
            const exportData = data.entries.map(entry => {
                const row = { ...entry.data };
                
                // Formatiere spezielle Felder
                if (entry.tags && Array.isArray(entry.tags)) {
                    row.tags = entry.tags.join(', ');
                }
                if (entry.notes) {
                    row.notes = entry.notes;
                }
                if (row.admin !== undefined) {
                    row.admin = row.admin ? 'Ja' : 'Nein';
                }
                if (row.school_foerderung === true) {
                    row.school_foerderung = 'Ja';
                } else if (row.school_foerderung === false) {
                    row.school_foerderung = 'Nein';
                }
                if (row.infowebinar) {
                    row.infowebinar = this.formatInfowebinarDate(row.infowebinar);
                }
                if (row.last_login) {
                    row.last_login = this.formatDate(row.last_login);
                }
                if (row.registered_at) {
                    row.registered_at = this.formatDate(row.registered_at);
                }
                
                return row;
            });
            
            // Exportiere
            const listName = data.list_name || 'Liste';
            const filename = `Liste_${listName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
            window.exportToXLSX(exportData, columns, filename);
        } catch (error) {
            console.error('Export-Fehler:', error);
            alert('Fehler beim Exportieren: ' + error.message);
        }
    }
}

// Globale Instanz
let listsManager;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    listsManager = new ListsManager();
});

