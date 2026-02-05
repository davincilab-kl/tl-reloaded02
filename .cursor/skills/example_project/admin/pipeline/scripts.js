class PipelineManager {
    constructor() {
        this.chart = null;
        this.comparisonChart = null;
        this.currentView = 'current'; // 'current' oder 'comparison'
        this.maxYValue = null; // Maximaler Y-Wert für den 30-Tage-Zeitraum
        this.allDaysData = null; // Alle Daten für alle 30 Tage
        this.currentTeachersData = null;
        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        // Lade alle Daten für alle 30 Tage auf einmal
        await this.loadAllDaysData();
        await this.loadPipelineData();
    }
    
    async loadAllDaysData() {
        try {
            const response = await fetch('/api/pipeline/get_status_counts_by_date.php?all_days=true');
            const data = await response.json();
            
            if (data.success && data.all_days_data) {
                this.allDaysData = data.all_days_data;
                
                // Berechne Maximalwert aus allen Tagen
                let max_count = 0;
                for (const date in this.allDaysData) {
                    const dayData = this.allDaysData[date];
                    const dayMax = Math.max(...dayData.map(item => item.count));
                    if (dayMax > max_count) {
                        max_count = dayMax;
                    }
                }
                this.maxYValue = max_count;
            }
        } catch (error) {
            console.error('Fehler beim Laden aller Tage-Daten:', error);
        }
    }

    setupEventListeners() {
        // View-Toggle Buttons
        document.getElementById('view-current').addEventListener('click', () => {
            this.switchView('current');
        });
        document.getElementById('view-comparison').addEventListener('click', () => {
            this.switchView('comparison');
        });
        
        // Vergleich laden Button
        document.getElementById('load-comparison-btn').addEventListener('click', () => {
            this.loadComparisonData();
            this.loadComparisonStats();
        });
        
        // Slider für aktuelles Diagramm
        const dateSlider = document.getElementById('date-slider');
        if (dateSlider) {
            // Initialisiere Datums-Anzeige
            this.updateDateDisplay();
            
            // Event Listener für Slider
            dateSlider.addEventListener('input', () => {
                this.updateDateDisplay();
                this.loadPipelineDataForDate();
            });
        }
    }
    
    updateDateDisplay() {
        const slider = document.getElementById('date-slider');
        const display = document.getElementById('selected-date-display');
        if (!slider || !display) return;
        
        const daysAgo = parseInt(slider.value);
        const date = new Date();
        date.setDate(date.getDate() - (29 - daysAgo));
        
        const dateStr = date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        if (daysAgo === 29) {
            display.textContent = 'Heute (' + dateStr + ')';
        } else {
            display.textContent = dateStr;
        }
    }
    
    async loadPipelineDataForDate() {
        const slider = document.getElementById('date-slider');
        if (!slider) return;
        
        const daysAgo = parseInt(slider.value);
        const date = new Date();
        date.setDate(date.getDate() - (29 - daysAgo));
        const dateStr = date.toISOString().split('T')[0];
        
        // Wenn alle Daten bereits geladen sind, verwende diese
        if (this.allDaysData && this.allDaysData[dateStr]) {
            this.renderChart(this.allDaysData[dateStr]);
        } else {
            // Fallback: Lade einzelnes Datum (sollte nicht nötig sein)
            try {
                const response = await fetch(`/api/pipeline/get_status_counts_by_date.php?date=${dateStr}`);
                const data = await response.json();
                
                if (data.success) {
                    this.renderChart(data.statusCounts);
                } else {
                    console.error('Fehler beim Laden der Pipeline-Daten:', data.error);
                }
            } catch (error) {
                console.error('Fehler:', error);
            }
        }
        
        // Statistiken werden NICHT beim Verschieben des Sliders aktualisiert
        // Sie zeigen immer die Werte bis heute mit 30-Tage-Veränderung
    }
    
    async loadStatsForDate(dateStr, isComparison = false) {
        try {
            // Berechne Startdatum (30 Tage vorher)
            const currentDate = new Date(dateStr);
            const startDate = new Date(currentDate);
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString().split('T')[0];
            
            // Lade aktuelle und vorherige Daten
            const [currentResponse, previousResponse] = await Promise.all([
                fetch(`/api/config/count_db_by_date.php?date=${dateStr}`),
                fetch(`/api/config/count_db_by_date.php?date=${startDateStr}`)
            ]);
            
            const currentData = await currentResponse.json();
            const previousData = await previousResponse.json();
            
            // Aktualisiere die Boxen
            const suffix = isComparison ? '-comp' : '';
            this.updateStatBox('schools', currentData.schools, previousData.schools, suffix);
            this.updateStatBox('teachers', currentData.teachers, previousData.teachers, suffix);
            this.updateStatBox('classes', currentData.classes, previousData.classes, suffix);
            this.updateStatBox('students', currentData.students, previousData.students, suffix);
        } catch (error) {
            console.error('Fehler beim Laden der Statistiken:', error);
            // Zeige Fehler an
            const suffix = isComparison ? '-comp' : '';
            const schoolsEl = document.getElementById(`stat-schools${suffix}`);
            const teachersEl = document.getElementById(`stat-teachers${suffix}`);
            const classesEl = document.getElementById(`stat-classes${suffix}`);
            const studentsEl = document.getElementById(`stat-students${suffix}`);
            if (schoolsEl) schoolsEl.textContent = 'Fehler';
            if (teachersEl) teachersEl.textContent = 'Fehler';
            if (classesEl) classesEl.textContent = 'Fehler';
            if (studentsEl) studentsEl.textContent = 'Fehler';
        }
    }
    
    async loadComparisonStats() {
        const date1 = document.getElementById('comparison-date-1').value;
        const date2 = document.getElementById('comparison-date-2').value;
        
        if (!date1 || !date2) {
            return;
        }
        
        try {
            // Lade Daten für beide Daten
            const [date1Response, date2Response] = await Promise.all([
                fetch(`/api/config/count_db_by_date.php?date=${date1}`),
                fetch(`/api/config/count_db_by_date.php?date=${date2}`)
            ]);
            
            const date1Data = await date1Response.json();
            const date2Data = await date2Response.json();
            
            // Aktualisiere die Boxen mit Veränderung zwischen Datum 1 und Datum 2
            // Zeige den Wert von Datum 2 an, aber berechne die Veränderung von Datum 1 zu Datum 2
            this.updateStatBox('schools', date2Data.schools, date1Data.schools, '-comp');
            this.updateStatBox('teachers', date2Data.teachers, date1Data.teachers, '-comp');
            this.updateStatBox('classes', date2Data.classes, date1Data.classes, '-comp');
            this.updateStatBox('students', date2Data.students, date1Data.students, '-comp');
        } catch (error) {
            console.error('Fehler beim Laden der Vergleichsstatistiken:', error);
            // Zeige Fehler an
            const schoolsEl = document.getElementById('stat-schools-comp');
            const teachersEl = document.getElementById('stat-teachers-comp');
            const classesEl = document.getElementById('stat-classes-comp');
            const studentsEl = document.getElementById('stat-students-comp');
            if (schoolsEl) schoolsEl.textContent = 'Fehler';
            if (teachersEl) teachersEl.textContent = 'Fehler';
            if (classesEl) classesEl.textContent = 'Fehler';
            if (studentsEl) studentsEl.textContent = 'Fehler';
        }
    }
    
    updateStatBox(type, currentValue, previousValue, suffix = '') {
        const valueElement = document.getElementById(`stat-${type}${suffix}`);
        const changeElement = document.getElementById(`stat-${type}-change${suffix}`);
        
        if (!valueElement || !changeElement) return;
        
        // Setze aktuellen Wert
        valueElement.textContent = currentValue.toLocaleString('de-DE');
        
        // Berechne Veränderung
        const change = currentValue - previousValue;
        const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;
        
        // Entferne alte Klassen
        changeElement.classList.remove('positive', 'negative', 'neutral');
        
        if (change > 0) {
            changeElement.textContent = `+${change} (+${changePercent}%)`;
            changeElement.classList.add('positive');
        } else if (change < 0) {
            changeElement.textContent = `${change} (${changePercent}%)`;
            changeElement.classList.add('negative');
        } else {
            changeElement.textContent = 'Keine Änderung';
            changeElement.classList.add('neutral');
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Alle Container verstecken
        document.getElementById('current-chart-container').style.display = 'none';
        document.getElementById('comparison-chart-container').style.display = 'none';
        
        // Tabelle verstecken
        const teachersTableContainer = document.getElementById('teachers-table-container');
        if (teachersTableContainer) {
            teachersTableContainer.style.display = 'none';
        }
        
        // Alle Tab-Buttons deaktivieren
        document.getElementById('view-current').classList.remove('active');
        document.getElementById('view-comparison').classList.remove('active');
        
        if (view === 'current') {
            document.getElementById('current-chart-container').style.display = 'block';
            document.getElementById('view-current').classList.add('active');
            // Lade Daten für aktuelles Datum
            this.loadPipelineData();
        } else if (view === 'comparison') {
            document.getElementById('comparison-chart-container').style.display = 'block';
            document.getElementById('view-comparison').classList.add('active');
            // Lade Vergleichsdaten (Statistiken werden erst beim Klick auf "Vergleich laden" geladen)
            this.loadComparisonData();
        }
    }

    async loadComparisonData() {
        const date1 = document.getElementById('comparison-date-1').value;
        const date2 = document.getElementById('comparison-date-2').value;
        
        if (!date1 || !date2) {
            alert('Bitte wählen Sie beide Daten aus.');
            return;
        }
        
        // Wenn alle Daten bereits geladen sind, verwende diese
        if (this.allDaysData && this.allDaysData[date1] && this.allDaysData[date2]) {
            this.renderComparisonChart(this.allDaysData[date1], this.allDaysData[date2], date1, date2);
            return;
        }
        
        // Fallback: Lade einzelne Daten
        try {
            const [response1, response2] = await Promise.all([
                fetch(`/api/pipeline/get_status_counts_by_date.php?date=${date1}`),
                fetch(`/api/pipeline/get_status_counts_by_date.php?date=${date2}`)
            ]);
            
            const data1 = await response1.json();
            const data2 = await response2.json();
            
            if (data1.success && data2.success) {
                this.renderComparisonChart(data1.statusCounts, data2.statusCounts, date1, date2);
            } else {
                console.error('Fehler beim Laden der Vergleichsdaten');
                alert('Fehler beim Laden der Vergleichsdaten');
            }
        } catch (error) {
            console.error('Fehler:', error);
            alert('Fehler beim Laden der Vergleichsdaten');
        }
    }
    
    renderComparisonChart(data1, data2, date1, date2) {
        const ctx = document.getElementById('comparison-chart');
        if (!ctx) return;
        
        // Erstelle Map für schnellen Zugriff
        const map1 = new Map(data1.map(item => [item.id, item]));
        const map2 = new Map(data2.map(item => [item.id, item]));
        
        // Kombiniere beide Datensätze und stelle sicher, dass alle Stati vorhanden sind
        const allIds = new Set([...data1.map(item => item.id), ...data2.map(item => item.id)]);
        const sortedIds = Array.from(allIds).sort((a, b) => a - b);
        
        const labels = [];
        const counts1 = [];
        const counts2 = [];
        const sortedData1 = [];
        const sortedData2 = [];
        
        sortedIds.forEach(id => {
            const item1 = map1.get(id) || { id, label: '', display_name: `Status ${id}`, description: '', count: 0 };
            const item2 = map2.get(id) || { id, label: '', display_name: `Status ${id}`, description: '', count: 0 };
            
            labels.push(item1.display_name || item2.display_name || `Status ${id}`);
            counts1.push(item1.count || 0);
            counts2.push(item2.count || 0);
            sortedData1.push(item1);
            sortedData2.push(item2);
        });
        
        // Erstelle Farb-Arrays
        // Erste Datum: blasser (reduzierte Opazität)
        const backgroundColors1 = sortedData1.map(item => {
            const color = this.getBarColor(item.id, item.label).backgroundColor;
            return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*1\)/g, 'rgba($1, $2, $3, 0.5)');
        });
        const borderColors1 = sortedData1.map(item => {
            const color = this.getBarColor(item.id, item.label).borderColor;
            return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*1\)/g, 'rgba($1, $2, $3, 0.5)');
        });
        
        // Zweite Datum: volle Opazität
        const backgroundColors2 = sortedData2.map(item => 
            this.getBarColor(item.id, item.label).backgroundColor
        );
        const borderColors2 = sortedData2.map(item => 
            this.getBarColor(item.id, item.label).borderColor
        );
        
        // Berechne Differenzen für Labels
        const differences = counts1.map((count1, index) => {
            const count2 = counts2[index];
            return count2 - count1;
        });
        
        // Formatiere Datums-Labels
        const date1Formatted = new Date(date1).toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        const date2Formatted = new Date(date2).toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }
        
        // Berechne Maximalwert für Y-Achse
        const maxValue = Math.max(
            Math.max(...counts1),
            Math.max(...counts2),
            this.maxYValue || 0
        );
        
        this.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: date1Formatted,
                        data: counts1,
                        backgroundColor: backgroundColors1,
                        borderColor: borderColors1,
                        borderWidth: 1
                    },
                    {
                        label: date2Formatted,
                        data: counts2,
                        backgroundColor: backgroundColors2,
                        borderColor: borderColors2,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart',
                    y: {
                        from: (ctx) => {
                            // Starte von der Basis (unten) - verwende den minimalen Y-Wert
                            return ctx.chart.scales.y.bottom;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxValue,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const datasetIndex = context.datasetIndex;
                                const dataIndex = context.dataIndex;
                                const item = datasetIndex === 0 ? sortedData1[dataIndex] : sortedData2[dataIndex];
                                if (item.description) {
                                    return item.description;
                                }
                                return '';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'differenceLabels',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    const meta1 = chart.getDatasetMeta(0);
                    const meta2 = chart.getDatasetMeta(1);
                    
                    ctx.save();
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    differences.forEach((diff, index) => {
                        const bar1 = meta1.data[index];
                        const bar2 = meta2.data[index];
                        
                        // Finde höchsten Balken
                        const maxY = Math.min(bar1.y, bar2.y);
                        
                        // Position über beiden Balken
                        const x = (bar1.x + bar2.x) / 2;
                        const y = maxY - 5;
                        
                        // Text mit Vorzeichen
                        let text;
                        let fillColor;
                        
                        if (diff === 0) {
                            text = '0';
                            fillColor = '#666666'; // Dunkelgrau
                        } else {
                            text = diff > 0 ? `+${diff}` : `${diff}`;
                            fillColor = diff > 0 ? '#14A117' : '#E35839';
                        }
                        
                        // Zeichne Text mit Hintergrund für bessere Lesbarkeit
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 3;
                        ctx.fillStyle = fillColor;
                        ctx.strokeText(text, x, y);
                        ctx.fillText(text, x, y);
                    });
                    
                    ctx.restore();
                }
            }]
        });
    }

    async loadPipelineData() {
        // Lade Daten für das ausgewählte Datum
        const slider = document.getElementById('date-slider');
        if (slider && this.currentView === 'current') {
            // Wenn alle Daten bereits geladen sind, verwende diese direkt
            if (this.allDaysData) {
                await this.loadPipelineDataForDate();
            } else {
                await this.loadPipelineDataForDate();
            }
            
            // Lade Statistiken nur einmal beim initialen Laden (heute mit 30-Tage-Veränderung)
            // Die Boxen zeigen immer die Werte bis heute, unabhängig vom Slider
            const today = new Date().toISOString().split('T')[0];
            await this.loadStatsForDate(today);
        }
    }

    getBarColor(id, label) {
        // Schwarz für konto_deaktiviert
        if (label === 'konto_deaktiviert') {
            return {
                backgroundColor: 'rgba(0, 0, 0, 1)',
                borderColor: 'rgba(0, 0, 0, 1)'
            };
        }
        
        // Farbverlauf von rot nach grün für ID 1-20 mit gelb in der Mitte
        if (id >= 1 && id <= 20) {
            // Start: #E35839 (227, 88, 57), Mitte: #FDB600 (253, 182, 0), Ende: #14A117 (20, 161, 23)
            const midPoint = 10.5; // Mitte zwischen 1 und 20
            
            let red, green, blue;
            
            if (id <= midPoint) {
                // Erste Hälfte: von Start zu Mitte
                const ratio = (id - 1) / (midPoint - 1); // 0 für ID 1, 1 für ID 10.5
                const startRed = 227;
                const startGreen = 88;
                const startBlue = 57;
                const midRed = 253;
                const midGreen = 182;
                const midBlue = 0;
                
                red = Math.round(startRed + (midRed - startRed) * ratio);
                green = Math.round(startGreen + (midGreen - startGreen) * ratio);
                blue = Math.round(startBlue + (midBlue - startBlue) * ratio);
            } else {
                // Zweite Hälfte: von Mitte zu Ende
                const ratio = (id - midPoint) / (20 - midPoint); // 0 für ID 10.5, 1 für ID 20
                const midRed = 253;
                const midGreen = 182;
                const midBlue = 0;
                const endRed = 20;
                const endGreen = 161;
                const endBlue = 23;
                
                red = Math.round(midRed + (endRed - midRed) * ratio);
                green = Math.round(midGreen + (endGreen - midGreen) * ratio);
                blue = Math.round(midBlue + (endBlue - midBlue) * ratio);
            }
            
            return {
                backgroundColor: `rgba(${red}, ${green}, ${blue}, 1)`,
                borderColor: `rgba(${red}, ${green}, ${blue}, 1)`
            };
        }
        
        // Standardfarbe für andere IDs
        return {
            backgroundColor: 'rgba(54, 162, 235, 1)',
            borderColor: 'rgba(54, 162, 235, 1)'
        };
    }

    renderChart(statusCounts) {
        const ctx = document.getElementById('pipeline-chart');
        if (!ctx) return;

        const labels = statusCounts.map(item => item.display_name);
        const counts = statusCounts.map(item => item.count);
        
        // Erstelle Farb-Arrays für jeden Balken
        const backgroundColors = statusCounts.map(item => 
            this.getBarColor(item.id, item.label).backgroundColor
        );
        const borderColors = statusCounts.map(item => 
            this.getBarColor(item.id, item.label).borderColor
        );

        if (this.chart) {
            this.chart.destroy();
        }

        // Speichere statusCounts für Click-Event
        this.currentStatusCounts = statusCounts;
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Anzahl Lehrkräfte',
                    data: counts,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                onClick: (event, elements) => {
                    // Wenn direkt auf einen Balken geklickt wurde
                    if (elements.length > 0) {
                        const element = elements[0];
                        const statusItem = statusCounts[element.index];
                        this.loadTeachersForStatus(statusItem.id, statusItem.display_name);
                    } else {
                        // Wenn nicht direkt auf einen Balken geklickt wurde, 
                        // bestimme den Status basierend auf der X-Position
                        const canvasPosition = Chart.helpers.getRelativePosition(event, this.chart);
                        const x = canvasPosition.x;
                        
                        // Finde den Index basierend auf der X-Position
                        const meta = this.chart.getDatasetMeta(0);
                        let clickedIndex = -1;
                        let minDistance = Infinity;
                        
                        meta.data.forEach((bar, index) => {
                            const distance = Math.abs(bar.x - x);
                            if (distance < minDistance) {
                                minDistance = distance;
                                clickedIndex = index;
                            }
                        });
                        
                        // Wenn ein Index gefunden wurde und der Klick in einem vernünftigen Bereich war
                        if (clickedIndex >= 0 && clickedIndex < statusCounts.length) {
                            const statusItem = statusCounts[clickedIndex];
                            this.loadTeachersForStatus(statusItem.id, statusItem.display_name);
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.maxYValue !== null ? this.maxYValue : undefined,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const item = statusCounts[context.dataIndex];
                                if (item.description) {
                                    return item.description;
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        });
    }


    async loadTeachersForStatus(statusId, statusName) {
        const slider = document.getElementById('date-slider');
        let targetDate = new Date().toISOString().split('T')[0];
        
        if (slider) {
            const daysAgo = parseInt(slider.value);
            const date = new Date();
            date.setDate(date.getDate() - (29 - daysAgo));
            targetDate = date.toISOString().split('T')[0];
        }
        
        try {
            const response = await fetch(`/api/pipeline/get_teachers_by_status.php?status_id=${statusId}&date=${targetDate}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderTeachersTable(data.teachers, statusName);
            } else {
                console.error('Fehler beim Laden der Lehrkräfte:', data.error);
                alert('Fehler beim Laden der Lehrkräfte: ' + data.error);
            }
        } catch (error) {
            console.error('Fehler:', error);
            alert('Fehler beim Laden der Lehrkräfte');
        }
    }
    
    splitName(fullName) {
        if (!fullName) return { firstname: '', lastname: '' };
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 0) return { firstname: '', lastname: '' };
        if (parts.length === 1) return { firstname: parts[0], lastname: '' };
        return {
            firstname: parts[0],
            lastname: parts.slice(1).join(' ')
        };
    }
    
    renderTeachersTable(teachers, statusName) {
        const container = document.getElementById('teachers-table-container');
        const title = document.getElementById('teachers-table-title');
        const tbody = document.getElementById('teachers-table-body');
        
        if (!container || !title || !tbody) return;
        
        // Speichere Daten für Sortierung
        this.currentTeachersData = teachers.map(teacher => {
            const nameParts = this.splitName(teacher.name);
            return {
                ...teacher,
                firstname: nameParts.firstname,
                lastname: nameParts.lastname,
                status_reached_at_raw: teacher.status_reached_at,
                last_login_raw: teacher.last_login
            };
        });
        
        // Reset Sortierung
        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.updateSortIndicators();
        
        // Zeige Container
        container.style.display = 'block';
        title.textContent = `Lehrkräfte mit Status: ${statusName} (${teachers.length})`;
        
        // Scroll zu Tabelle
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        this.renderTeachersTableBody();
    }
    
    renderTeachersTableBody() {
        const tbody = document.getElementById('teachers-table-body');
        if (!tbody || !this.currentTeachersData) return;
        
        if (this.currentTeachersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Keine Lehrkräfte gefunden</td></tr>';
            return;
        }
        
        // Sortiere Daten falls nötig
        let sortedData = [...this.currentTeachersData];
        if (this.currentSortColumn) {
            sortedData.sort((a, b) => {
                let aVal, bVal;
                
                switch (this.currentSortColumn) {
                    case 'id':
                        aVal = a.id || 0;
                        bVal = b.id || 0;
                        break;
                    case 'firstname':
                        aVal = (a.firstname || '').toLowerCase();
                        bVal = (b.firstname || '').toLowerCase();
                        break;
                    case 'lastname':
                        aVal = (a.lastname || '').toLowerCase();
                        bVal = (b.lastname || '').toLowerCase();
                        break;
                    case 'school':
                        aVal = (a.school_name || '').toLowerCase();
                        bVal = (b.school_name || '').toLowerCase();
                        break;
                    case 'status_reached':
                        aVal = a.status_reached_at_raw ? new Date(a.status_reached_at_raw).getTime() : 0;
                        bVal = b.status_reached_at_raw ? new Date(b.status_reached_at_raw).getTime() : 0;
                        break;
                    case 'last_login':
                        aVal = a.last_login_raw ? new Date(a.last_login_raw).getTime() : 0;
                        bVal = b.last_login_raw ? new Date(b.last_login_raw).getTime() : 0;
                        break;
                    default:
                        return 0;
                }
                
                if (aVal < bVal) return this.currentSortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        tbody.innerHTML = sortedData.map(teacher => {
            const statusReached = teacher.status_reached_at_raw ? 
                new Date(teacher.status_reached_at_raw).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Unbekannt';
            
            const lastLogin = teacher.last_login_raw ? 
                new Date(teacher.last_login_raw).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Nie';
            
            return `
                <tr>
                    <td>${teacher.id}</td>
                    <td>${this.escapeHtml(teacher.firstname || '')}</td>
                    <td>${this.escapeHtml(teacher.lastname || '')}</td>
                    <td>${this.escapeHtml(teacher.email || '')}</td>
                    <td>-</td>
                    <td>${this.escapeHtml(teacher.school_name || 'Keine Schule')}</td>
                    <td>${statusReached}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <button class="btn-details" onclick="pipelineManager.showTeacherDetails(${teacher.id})">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    sortTable(column) {
        if (this.currentSortColumn === column) {
            // Toggle Richtung
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortDirection = 'asc';
        }
        
        this.updateSortIndicators();
        this.renderTeachersTableBody();
    }
    
    updateSortIndicators() {
        const headers = document.querySelectorAll('#teachers-table th.sortable');
        headers.forEach(header => {
            const indicator = header.querySelector('.sort-indicator');
            const column = header.getAttribute('data-sort');
            
            if (indicator) {
                if (this.currentSortColumn === column) {
                    indicator.textContent = this.currentSortDirection === 'asc' ? ' ↑' : ' ↓';
                } else {
                    indicator.textContent = ' ↕';
                }
            }
        });
    }
    
    async showTeacherDetails(teacherId) {
        const modal = document.getElementById('teacher-details-modal');
        const title = document.getElementById('teacher-details-title');
        const body = document.getElementById('teacher-details-body');
        
        if (!modal || !title || !body) return;
        
        modal.style.display = 'flex';
        body.innerHTML = '<div class="loading">Lade Details...</div>';
        
        try {
            const response = await fetch(`/api/pipeline/get_teacher_details.php?teacher_id=${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
                const teacher = data.teacher;
                title.textContent = `Details: ${this.escapeHtml(teacher.name)}`;
                
                const lastLogin = teacher.last_login ? 
                    new Date(teacher.last_login).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 'Nie';
                
                const registeredAt = teacher.registered_at ? 
                    new Date(teacher.registered_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) : 'Unbekannt';
                
                const lastStatusChange = teacher.last_status_change ? 
                    new Date(teacher.last_status_change).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 'Unbekannt';
                
                body.innerHTML = `
                    <div class="teacher-details-grid">
                        <div class="detail-section">
                            <h4>Persönliche Informationen</h4>
                            <div class="detail-item">
                                <label>Name:</label>
                                <span>${this.escapeHtml(teacher.name || '')}</span>
                            </div>
                            <div class="detail-item">
                                <label>E-Mail:</label>
                                <span>${this.escapeHtml(teacher.email || '')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Telefonnummer:</label>
                                <span>-</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Schule</h4>
                            <div class="detail-item">
                                <label>Schule:</label>
                                <span>${this.escapeHtml(teacher.school_name || 'Keine Schule')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Ort:</label>
                                <span>${this.escapeHtml(teacher.school_ort || 'Nicht angegeben')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Bundesland:</label>
                                <span>${this.escapeHtml(teacher.school_bundesland || 'Nicht angegeben')}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Status</h4>
                            <div class="detail-item">
                                <label>Aktueller Status:</label>
                                <span>${this.escapeHtml(teacher.status_name || 'Kein Status')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status-Beschreibung:</label>
                                <span>${this.escapeHtml(teacher.status_description || '')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Letzte Status-Änderung:</label>
                                <span>${lastStatusChange}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Account-Informationen</h4>
                            <div class="detail-item">
                                <label>Registriert am:</label>
                                <span>${registeredAt}</span>
                            </div>
                            <div class="detail-item">
                                <label>Zuletzt eingeloggt:</label>
                                <span>${lastLogin}</span>
                            </div>
                            <div class="detail-item">
                                <label>Admin:</label>
                                <span>${teacher.admin ? 'Ja' : 'Nein'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Info-Webinar:</label>
                                <span>${teacher.infowebinar ? 'Ja' : 'Nein'}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Statistiken</h4>
                            <div class="detail-item">
                                <label>Anzahl Klassen:</label>
                                <span>${teacher.class_count}</span>
                            </div>
                            <div class="detail-item">
                                <label>Anzahl Schüler:</label>
                                <span>${teacher.student_count}</span>
                            </div>
                            <div class="detail-item">
                                <label>T!Coins gesamt:</label>
                                <span>${teacher.total_t_coins}</span>
                            </div>
                            <div class="detail-item">
                                <label>T!Score (Durchschnitt):</label>
                                <span>${teacher.avg_t_coins}</span>
                            </div>
                        </div>
                        
                        ${teacher.classes && teacher.classes.length > 0 ? `
                        <div class="detail-section detail-section-full">
                            <h4>Klassen (${teacher.classes.length})</h4>
                            <div class="classes-list">
                                ${teacher.classes.map(cls => `
                                    <div class="class-item">
                                        <strong>${this.escapeHtml(cls.name)}</strong>
                                        <span>${cls.student_count} Schüler</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
            } else {
                body.innerHTML = '<div class="error">Fehler beim Laden der Details: ' + this.escapeHtml(data.error) + '</div>';
            }
        } catch (error) {
            console.error('Fehler:', error);
            body.innerHTML = '<div class="error">Fehler beim Laden der Details</div>';
        }
    }
    
    closeTeacherDetailsModal() {
        const modal = document.getElementById('teacher-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const pipelineManager = new PipelineManager();

