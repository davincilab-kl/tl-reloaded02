class LeaderboardsManager {
    constructor() {
        this.currentTab = 'schools';
        this.currentSort = {
            schools: 'avg_t_coins',
            teachers: 'avg_t_coins',
            classes: 'avg_t_coins',
            students: 't_coins'
        };
        
        // Cache für geladene Daten
        this.dataCache = {
            schools: null,
            teachers: null,
            classes: null,
            students: null
        };
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadLeaderboard('schools');
    }

    bindEvents() {
        // Tab-Navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Tabellen-Header Sortierung wird über onclick-Handler in den Tabellen behandelt
    }

    switchTab(tab) {
        // Aktiven Tab entfernen
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelector('.tab-content.active').classList.remove('active');

        // Neuen Tab aktivieren
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        this.currentTab = tab;
        
        // Prüfen ob Daten bereits geladen sind
        if (this.dataCache[tab]) {
            this.sortAndRenderLeaderboard(tab);
        } else {
        this.loadLeaderboard(tab);
        }
    }

    async loadLeaderboard(type) {
        const container = document.getElementById(`${type}-leaderboard`);
        container.innerHTML = '<div class="loading">Lade Leaderboard...</div>';

        try {
            // Alle Daten laden (ohne Sortierung, da wir clientseitig sortieren)
            const response = await fetch(`/api/misc/get_leaderboard.php?type=${type}&sort=students&limit=100&_t=${Date.now()}`, { 
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const data = await response.json();

            if (data.success) {
                // Daten im Cache speichern
                this.dataCache[type] = data.data;
                // Standard-Sortierung explizit anwenden
                const defaultSort = this.currentSort[type];
                this.sortAndRenderLeaderboard(type, defaultSort);
            } else {
                container.innerHTML = '<div class="error">Fehler beim Laden der Daten</div>';
            }
        } catch (error) {
            console.error(`Fehler beim Laden des ${type} Leaderboards:`, error);
            container.innerHTML = '<div class="error">Fehler beim Laden der Daten</div>';
        }
    }

    sortAndRenderLeaderboard(type, sortBy) {
        if (!this.dataCache[type]) {
            this.loadLeaderboard(type);
            return;
        }

        this.currentSort[type] = sortBy;
        const sortedData = this.sortData(this.dataCache[type], type, sortBy);
        this.renderLeaderboard(type, sortedData);
    }

    sortData(data, type, sortBy) {
        const sorted = [...data].sort((a, b) => {
            let aVal, bVal;
            
            switch (type) {
                case 'schools':
                    aVal = this.getSchoolSortValue(a, sortBy);
                    bVal = this.getSchoolSortValue(b, sortBy);
                    break;
                case 'teachers':
                    aVal = this.getTeacherSortValue(a, sortBy);
                    bVal = this.getTeacherSortValue(b, sortBy);
                    break;
                case 'classes':
                    aVal = this.getClassSortValue(a, sortBy);
                    bVal = this.getClassSortValue(b, sortBy);
                    break;
                case 'students':
                    aVal = this.getStudentSortValue(a, sortBy);
                    bVal = this.getStudentSortValue(b, sortBy);
                    break;
                default:
                    return 0;
            }
            
            // Numerische Werte absteigend sortieren
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return bVal - aVal;
            }
            
            // String-Werte aufsteigend sortieren
            return String(aVal).localeCompare(String(bVal));
        });
        
        return sorted;
    }

    getSchoolSortValue(school, sortBy) {
        switch (sortBy) {
            case 'students': return school.student_count || 0;
            case 'teachers': return school.teacher_count || 0;
            case 'classes': return school.class_count || 0;
            case 'avg_t_coins': return school.avg_t_coins || 0;
            default: return 0;
        }
    }

    getTeacherSortValue(teacher, sortBy) {
        switch (sortBy) {
            case 'students': return teacher.student_count || 0;
            case 'classes': return teacher.class_count || 0;
            case 'total_t_coins': return teacher.total_t_coins || 0;
            case 'avg_t_coins': return teacher.avg_t_coins || 0;
            default: return 0;
        }
    }

    getClassSortValue(cls, sortBy) {
        switch (sortBy) {
            case 'students': return cls.student_count || 0;
            case 'total_t_coins': return cls.total_t_coins || 0;
            case 'avg_t_coins': return cls.avg_t_coins || 0;
            default: return 0;
        }
    }

    getStudentSortValue(student, sortBy) {
        switch (sortBy) {
            case 't_coins': return student.t_coins || 0;
            case 'courses_done': return student.courses_done || 0;
            case 'projects_public': return student.projects_public || 0;
            case 'projects_wip': return student.projects_wip || 0;
            default: return 0;
        }
    }

    sortTable(headerElement, type, sortBy) {
        this.currentSort[type] = sortBy;
        this.sortAndRenderLeaderboard(type, sortBy);
    }

    renderLeaderboard(type, data) {
        const container = document.getElementById(`${type}-leaderboard`);
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">Keine Daten verfügbar</div>';
            return;
        }

        switch (type) {
            case 'schools':
                container.innerHTML = this.renderSchoolsTable(data);
                break;
            case 'teachers':
                container.innerHTML = this.renderTeachersTable(data);
                break;
            case 'classes':
                container.innerHTML = this.renderClassesTable(data);
                break;
            case 'students':
                container.innerHTML = this.renderStudentsTable(data);
                break;
        }
        
        // Aktive Sortierung nach dem Rendern wiederherstellen
        this.restoreActiveSort(type);
    }

    restoreActiveSort(type) {
        const sortBy = this.currentSort[type];
        
        // Alle Sort-Indikatoren zurücksetzen
        document.querySelectorAll(`#${type}-leaderboard .sort-indicator`).forEach(indicator => {
            indicator.textContent = '↕';
        });
        
        // Alle Header-Klassen zurücksetzen
        document.querySelectorAll(`#${type}-leaderboard th.sortable`).forEach(th => {
            th.classList.remove('active-sort');
        });
        
        // Alle Spalten-Klassen zurücksetzen
        document.querySelectorAll(`#${type}-leaderboard td, #${type}-leaderboard th`).forEach(cell => {
            cell.classList.remove('sorted-column');
        });
        
        // Aktiven Header finden und markieren
        const activeHeader = document.querySelector(`#${type}-leaderboard th[onclick*="${sortBy}"]`);
        if (activeHeader) {
            activeHeader.classList.add('active-sort');
            const indicator = activeHeader.querySelector('.sort-indicator');
            if (indicator) {
                indicator.textContent = '↓';
            }
            
            // Komplette Spalte markieren
            const columnIndex = Array.from(activeHeader.parentNode.children).indexOf(activeHeader);
            document.querySelectorAll(`#${type}-leaderboard tr`).forEach(row => {
                const cells = row.children;
                if (cells[columnIndex]) {
                    cells[columnIndex].classList.add('sorted-column');
                }
            });
        } else {
            // Fallback: Wenn Header nicht gefunden wird, nach Standard-Sortierung suchen
            console.log(`Header für Sortierung "${sortBy}" nicht gefunden für Typ "${type}"`);
        }
    }

    renderSchoolsTable(data) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="rank-header">#</th>
                        <th>Schule</th>
                        <th>Bundesland</th>
                        <th>Schulart</th>
                        <th onclick="leaderboardsManager.sortTable(this, 'schools', 'students')" class="sortable numeric-header">
                            Schüler <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'schools', 'teachers')" class="sortable numeric-header">
                            Lehrer <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'schools', 'classes')" class="sortable numeric-header">
                            Klassen <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'schools', 'avg_t_coins')" class="sortable numeric-header">
                            T!Score <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((school, index) => `
                        <tr class="${index < 3 ? 'top-3-row' : ''} ${index < 3 ? `rank-${index + 1}-row` : ''}">
                            <td class="rank-cell ${index < 3 ? 'top-3' : ''} ${index < 3 ? `rank-${index + 1}` : ''}">${index + 1}</td>
                            <td>${this.escapeHtml(school.name)}</td>
                            <td>${this.escapeHtml(school.bundesland || 'N/A')}</td>
                            <td>${this.escapeHtml(school.schulart || 'N/A')}</td>
                            <td class="numeric-cell">${school.student_count || 0}</td>
                            <td class="numeric-cell">${school.teacher_count || 0}</td>
                            <td class="numeric-cell">${school.class_count || 0}</td>
                            <td class="numeric-cell">${(school.avg_t_coins || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderTeachersTable(data) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="rank-header">#</th>
                        <th>
                            Lehrer
                        </th>
                        <th>
                            E-Mail
                        </th>
                        <th>
                            Schule
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'teachers', 'students')" class="sortable numeric-header">
                            Schüler <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'teachers', 'classes')" class="sortable numeric-header">
                            Klassen <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'teachers', 'total_t_coins')" class="sortable numeric-header">
                            T!Coins <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'teachers', 'avg_t_coins')" class="sortable numeric-header">
                            T!Score <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((teacher, index) => `
                        <tr class="${index < 3 ? 'top-3-row' : ''} ${index < 3 ? `rank-${index + 1}-row` : ''}">
                            <td class="rank-cell ${index < 3 ? 'top-3' : ''} ${index < 3 ? `rank-${index + 1}` : ''}">${index + 1}</td>
                            <td>${this.escapeHtml(teacher.name)} ${teacher.admin ? '<span style="color: #007bff; font-size: 0.8em;">(Admin)</span>' : ''}</td>
                            <td>${this.escapeHtml(teacher.email)}</td>
                            <td>${this.escapeHtml(teacher.school_name || 'N/A')}</td>
                            <td class="numeric-cell">${teacher.student_count || 0}</td>
                            <td class="numeric-cell">${teacher.class_count || 0}</td>
                            <td class="numeric-cell">${teacher.total_t_coins || 0}</td>
                            <td class="numeric-cell">${(teacher.avg_t_coins || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderClassesTable(data) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="rank-header">#</th>
                        <th>
                            Klasse
                        </th>
                        <th>
                            Lehrer
                        </th>
                        <th>
                            Schule
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'classes', 'students')" class="sortable numeric-header">
                            Schüler <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'classes', 'total_t_coins')" class="sortable numeric-header">
                            T!Coins <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'classes', 'avg_t_coins')" class="sortable numeric-header">
                            T!Score <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((cls, index) => `
                        <tr class="${index < 3 ? 'top-3-row' : ''} ${index < 3 ? `rank-${index + 1}-row` : ''}">
                            <td class="rank-cell ${index < 3 ? 'top-3' : ''} ${index < 3 ? `rank-${index + 1}` : ''}">${index + 1}</td>
                            <td>${this.escapeHtml(cls.name)}</td>
                            <td>${this.escapeHtml(cls.teacher_name || 'N/A')}</td>
                            <td>${this.escapeHtml(cls.school_name || 'N/A')}</td>
                            <td class="numeric-cell">${cls.student_count || 0}</td>
                            <td class="numeric-cell">${cls.total_t_coins || 0}</td>
                            <td class="numeric-cell">${(cls.avg_t_coins || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderStudentsTable(data) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="rank-header">#</th>
                        <th>
                            Schüler
                        </th>
                        <th>
                            Klasse
                        </th>
                        <th>
                            Lehrer
                        </th>
                        <th>
                            Schule
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'students', 't_coins')" class="sortable numeric-header">
                            T!Coins <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'students', 'courses_done')" class="sortable numeric-header">
                            Kurse <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'students', 'projects_wip')" class="sortable numeric-header">
                            In Arbeit <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'students', 'projects_pending')" class="sortable numeric-header">
                            Ausstehend <span class="sort-indicator">↕</span>
                        </th>
                        <th onclick="leaderboardsManager.sortTable(this, 'students', 'projects_public')" class="sortable numeric-header">
                            Öffentlich <span class="sort-indicator">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((student, index) => `
                        <tr class="${index < 3 ? 'top-3-row' : ''} ${index < 3 ? `rank-${index + 1}-row` : ''}">
                            <td class="rank-cell ${index < 3 ? 'top-3' : ''} ${index < 3 ? `rank-${index + 1}` : ''}">${index + 1}</td>
                            <td>${this.escapeHtml(student.name)}</td>
                            <td>${this.escapeHtml(student.class_name || 'N/A')}</td>
                            <td>${this.escapeHtml(student.teacher_name || 'N/A')}</td>
                            <td>${this.escapeHtml(student.school_name || 'N/A')}</td>
                            <td class="numeric-cell">${student.t_coins || 0}</td>
                            <td class="numeric-cell">${student.courses_done || 0}</td>
                            <td class="numeric-cell">${student.projects_wip || 0}</td>
                            <td class="numeric-cell">${student.projects_pending || 0}</td>
                            <td class="numeric-cell">${student.projects_public || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    escapeHtml(text) {
        if (!text) return 'N/A';
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
let leaderboardsManager;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    leaderboardsManager = new LeaderboardsManager();
    
    // Scroll to Top Button Event Listener
    window.addEventListener('scroll', toggleScrollToTopButton);
});
