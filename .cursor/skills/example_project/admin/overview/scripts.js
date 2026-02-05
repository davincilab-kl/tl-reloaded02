// Übersichts-Visualisierungen
class OverviewVisualizations {
    constructor() {
        this.currentVisualization = null;
        this.schemaData = null;
        this.init();
    }

    init() {
        this.setupVisualizationSelector();
        this.loadDatabaseSchema();
    }

    setupVisualizationSelector() {
        const boxes = document.querySelectorAll('.visualization-box');
        boxes.forEach(box => {
            box.addEventListener('click', () => {
                boxes.forEach(b => b.classList.remove('active'));
                box.classList.add('active');
                const visualization = box.dataset.visualization;
                this.showVisualization(visualization);
            });
        });
    }

    async loadDatabaseSchema() {
        try {
            const response = await fetch('/api/visualizations/database_schema.json');
            if (!response.ok) {
                throw new Error('Fehler beim Laden des Schemas');
            }
            this.schemaData = await response.json();
            // Zeige standardmäßig die Datenbank-Schema Visualisierung
            this.showVisualization('database-schema');
        } catch (error) {
            console.error('Fehler beim Laden des Datenbank-Schemas:', error);
            this.showError('Fehler beim Laden des Datenbank-Schemas: ' + error.message);
        }
    }

    async loadApiTableAccess() {
        try {
            const response = await fetch('/api/visualizations/api_table_access.json');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der API-Daten');
            }
            return await response.json();
        } catch (error) {
            console.error('Fehler beim Laden der API-Daten:', error);
            throw error;
        }
    }

    showVisualization(type) {
        this.currentVisualization = type;
        const container = document.getElementById('visualization-container');
        
        if (type === 'database-schema') {
            this.renderDatabaseSchema(container);
        } else if (type === 'api-table-access') {
            this.renderApiTableAccess(container);
        } else {
            container.innerHTML = '<div class="loading-message"><span>Visualisierung nicht verfügbar</span></div>';
        }
    }

    renderDatabaseSchema(container) {
        if (!this.schemaData) {
            container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><span>Lade Schema...</span></div>';
            return;
        }

        container.innerHTML = `
            <div class="schema-controls">
                <button class="zoom-btn" data-action="zoom-in">
                    <i class="fas fa-search-plus"></i> Vergrößern
                </button>
                <button class="zoom-btn" data-action="zoom-out">
                    <i class="fas fa-search-minus"></i> Verkleinern
                </button>
                <button class="zoom-btn" data-action="reset">
                    <i class="fas fa-expand-arrows-alt"></i> Zurücksetzen
                </button>
                <button class="layout-btn active" data-layout="hierarchical">
                    <i class="fas fa-sitemap"></i> Hierarchisch
                </button>
                <button class="layout-btn" data-layout="force">
                    <i class="fas fa-project-diagram"></i> Force-Directed
                </button>
            </div>
            <div class="schema-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #007bff;"></div>
                    <span>Tabelle</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #28a745;"></div>
                    <span>Foreign Key Beziehung</span>
                </div>
            </div>
            <div id="database-schema-viz"></div>
        `;

        // Initialisiere die Visualisierung
        setTimeout(() => {
            this.createSchemaVisualization();
            this.setupSchemaControls();
        }, 100);
    }

    createSchemaVisualization() {
        const container = document.getElementById('database-schema-viz');
        if (!container || !this.schemaData) return;

        const tables = this.schemaData.tables;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'schema-svg');
        
        // Berechne benötigte Größe basierend auf Anzahl der Tabellen
        const nodeWidth = 220;
        const nodeHeight = 50;
        const spacing = 60;
        const maxWidth = 1900;
        const tablesPerRow = Math.floor((maxWidth - 100) / (nodeWidth + spacing));
        const rows = Math.ceil(tables.length / tablesPerRow);
        const totalHeight = 50 + (rows * (nodeHeight + spacing * 2));
        const totalWidth = Math.max(2000, maxWidth);
        
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        
        // Definiere Marker für Pfeile
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', '#666');
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Erstelle Tabellen-Nodes
        const nodePositions = {};
        let x = 50;
        let y = 50;
        let currentRow = 0;

        tables.forEach((table, index) => {
            if (index > 0 && index % tablesPerRow === 0) {
                currentRow++;
                x = 50;
            }
            
            const tableY = y + (currentRow * (nodeHeight + spacing * 2));
            nodePositions[table.name] = {
                x: x + nodeWidth / 2,
                y: tableY + nodeHeight / 2,
                width: nodeWidth,
                height: nodeHeight
            };

            // Erstelle Tabellen-Node
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'table-node');
            g.setAttribute('data-table', table.name);
            g.setAttribute('transform', `translate(${x}, ${tableY})`);

            // Body (zuerst, damit Header darüber liegt)
            const bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bodyRect.setAttribute('class', 'table-rect');
            bodyRect.setAttribute('width', nodeWidth);
            bodyRect.setAttribute('height', nodeHeight);
            bodyRect.setAttribute('y', 0);
            bodyRect.setAttribute('rx', 6);
            g.appendChild(bodyRect);

            // Header
            const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            headerRect.setAttribute('class', 'table-header');
            headerRect.setAttribute('width', nodeWidth);
            headerRect.setAttribute('height', 28);
            headerRect.setAttribute('rx', 6);
            g.appendChild(headerRect);

            // Titel
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('class', 'table-title');
            title.setAttribute('x', nodeWidth / 2);
            title.setAttribute('y', 19);
            title.setAttribute('text-anchor', 'middle');
            title.textContent = table.name;
            g.appendChild(title);

            // Spalten-Anzahl anzeigen
            const columnCount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            columnCount.setAttribute('class', 'table-column');
            columnCount.setAttribute('x', nodeWidth / 2);
            columnCount.setAttribute('y', 42);
            columnCount.setAttribute('text-anchor', 'middle');
            columnCount.textContent = `${table.columns.length} Spalten`;
            g.appendChild(columnCount);

            // Event Listener für Hover
            g.addEventListener('mouseenter', (e) => this.showTableTooltip(e, table));
            g.addEventListener('mouseleave', () => this.hideTooltip());
            g.addEventListener('click', () => this.selectTable(table.name));

            svg.appendChild(g);

            x += nodeWidth + spacing;
        });

        // Zeichne Foreign Key Beziehungen
        tables.forEach(table => {
            if (table.foreign_keys) {
                table.foreign_keys.forEach(fk => {
                    const fromTable = nodePositions[table.name];
                    const toTable = nodePositions[fk.references];
                    
                    if (fromTable && toTable) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('class', 'foreign-key-line');
                        line.setAttribute('x1', fromTable.x);
                        line.setAttribute('y1', fromTable.y);
                        line.setAttribute('x2', toTable.x);
                        line.setAttribute('y2', toTable.y);
                        line.setAttribute('data-from', table.name);
                        line.setAttribute('data-to', fk.references);
                        
                        // Füge Line vor den Nodes ein (damit sie unter den Nodes sind)
                        svg.insertBefore(line, svg.firstChild.nextSibling);
                    }
                });
            }
        });

        container.appendChild(svg);
        
        // Pan-Funktionalität für SVG
        this.setupPanAndZoom(svg);
    }

    setupPanAndZoom(svg) {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);

        svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Linke Maustaste
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
                svg.style.cursor = 'grabbing';
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = (e.clientX - startPoint.x) * viewBox[2] / svg.clientWidth;
                const dy = (e.clientY - startPoint.y) * viewBox[3] / svg.clientHeight;
                viewBox[0] -= dx;
                viewBox[1] -= dy;
                svg.setAttribute('viewBox', viewBox.join(' '));
                startPoint = { x: e.clientX, y: e.clientY };
            }
        });

        svg.addEventListener('mouseup', () => {
            isPanning = false;
            svg.style.cursor = 'default';
        });

        svg.addEventListener('mouseleave', () => {
            isPanning = false;
            svg.style.cursor = 'default';
        });

        // Zoom mit Mausrad
        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const xPercent = mouseX / rect.width;
            const yPercent = mouseY / rect.height;
            
            const newWidth = viewBox[2] * delta;
            const newHeight = viewBox[3] * delta;
            
            const dx = (viewBox[2] - newWidth) * xPercent;
            const dy = (viewBox[3] - newHeight) * yPercent;
            
            viewBox[0] += dx;
            viewBox[1] += dy;
            viewBox[2] = newWidth;
            viewBox[3] = newHeight;
            
            svg.setAttribute('viewBox', viewBox.join(' '));
        });
    }

    showTableTooltip(event, table) {
        const tooltip = document.createElement('div');
        tooltip.className = 'schema-tooltip';
        tooltip.innerHTML = `
            <h4>${table.name}</h4>
            <p><strong>Beschreibung:</strong> ${table.description || 'Keine Beschreibung'}</p>
            <p><strong>Spalten:</strong> ${table.columns.length}</p>
            <p><strong>Foreign Keys:</strong> ${table.foreign_keys ? table.foreign_keys.length : 0}</p>
        `;
        document.body.appendChild(tooltip);

        const rect = event.currentTarget.getBoundingClientRect();
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    selectTable(tableName) {
        // Entferne vorherige Auswahl
        document.querySelectorAll('.table-node').forEach(node => {
            node.classList.remove('selected');
        });

        // Markiere ausgewählte Tabelle
        const selectedNode = document.querySelector(`[data-table="${tableName}"]`);
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }

        // Hebe zugehörige Foreign Key Linien hervor
        document.querySelectorAll('.foreign-key-line').forEach(line => {
            if (line.getAttribute('data-from') === tableName || 
                line.getAttribute('data-to') === tableName) {
                line.style.stroke = '#28a745';
                line.style.strokeWidth = '3';
            } else {
                line.style.stroke = '#666';
                line.style.strokeWidth = '2';
            }
        });
    }

    setupSchemaControls() {
        // Zoom Controls
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const svg = document.querySelector('.schema-svg');
                if (!svg) return;

                let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
                const [x, y, width, height] = viewBox;

                if (action === 'zoom-in') {
                    const factor = 0.9;
                    const newWidth = width * factor;
                    const newHeight = height * factor;
                    const newX = x + (width - newWidth) / 2;
                    const newY = y + (height - newHeight) / 2;
                    svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
                } else if (action === 'zoom-out') {
                    const factor = 1.1;
                    const newWidth = width * factor;
                    const newHeight = height * factor;
                    const newX = x - (newWidth - width) / 2;
                    const newY = y - (newHeight - height) / 2;
                    svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
                } else if (action === 'reset') {
                    // Setze ViewBox zurück auf ursprüngliche Größe
                    const tables = window.overviewViz.schemaData.tables;
                    const nodeWidth = 220;
                    const nodeHeight = 50;
                    const spacing = 60;
                    const maxWidth = 1900;
                    const tablesPerRow = Math.floor((maxWidth - 100) / (nodeWidth + spacing));
                    const rows = Math.ceil(tables.length / tablesPerRow);
                    const totalHeight = 50 + (rows * (nodeHeight + spacing * 2));
                    const totalWidth = Math.max(2000, maxWidth);
                    svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
                }
            });
        });

        // Layout Controls (für zukünftige Implementierung)
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                // Layout-Änderung hier implementieren
            });
        });
    }

    async renderApiTableAccess(container) {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><span>Lade API-Daten...</span></div>';
        
        try {
            const data = await this.loadApiTableAccess();
            this.apiTableData = data;
            
            container.innerHTML = `
                <div class="api-viz-controls">
                    <div class="filter-group">
                        <label>Kategorie filtern:</label>
                        <select id="category-filter" class="filter-select">
                            <option value="">Alle Kategorien</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Operation filtern:</label>
                        <select id="operation-filter" class="filter-select">
                            <option value="">Alle Operationen</option>
                            <option value="SELECT">SELECT</option>
                            <option value="INSERT">INSERT</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <button class="zoom-btn" data-action="zoom-in">
                        <i class="fas fa-search-plus"></i> Vergrößern
                    </button>
                    <button class="zoom-btn" data-action="zoom-out">
                        <i class="fas fa-search-minus"></i> Verkleinern
                    </button>
                    <button class="zoom-btn" data-action="reset">
                        <i class="fas fa-expand-arrows-alt"></i> Zurücksetzen
                    </button>
                </div>
                <div class="api-viz-legend">
                    <div class="legend-item">
                        <div class="legend-color api-color"></div>
                        <span>API</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color table-color"></div>
                        <span>Tabelle</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line select-line"></div>
                        <span>SELECT</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line insert-line"></div>
                        <span>INSERT</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line update-line"></div>
                        <span>UPDATE</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-line delete-line"></div>
                        <span>DELETE</span>
                    </div>
                </div>
                <div id="api-table-viz"></div>
            `;

            setTimeout(() => {
                this.createApiTableVisualization();
                this.setupApiTableControls();
            }, 100);
        } catch (error) {
            this.showError('Fehler beim Laden der API-Daten: ' + error.message);
        }
    }

    createApiTableVisualization() {
        const container = document.getElementById('api-table-viz');
        if (!container || !this.apiTableData) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'api-table-svg');
        
        // Sammle alle eindeutigen Tabellen
        const tables = new Set();
        this.apiTableData.apis.forEach(api => {
            api.table_access.forEach(access => {
                tables.add(access.table);
            });
        });

        const tableArray = Array.from(tables);
        const apiCount = this.apiTableData.apis.length;
        const tableCount = tableArray.length;
        
        // Berechne Layout: APIs links, Tabellen rechts
        const nodeWidth = 200;
        const nodeHeight = 60;
        const apiSpacing = 80;
        const tableSpacing = 80;
        const leftMargin = 50;
        const rightMargin = 50;
        const topMargin = 50;
        const middleGap = 200;
        
        const apiAreaWidth = nodeWidth;
        const tableAreaWidth = nodeWidth;
        const totalWidth = leftMargin + apiAreaWidth + middleGap + tableAreaWidth + rightMargin;
        const totalHeight = Math.max(
            topMargin + (apiCount * apiSpacing),
            topMargin + (tableCount * tableSpacing)
        ) + topMargin;
        
        svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

        // Definiere Marker für Pfeile
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Marker für verschiedene Operationen
        const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
        const operationColors = {
            'SELECT': '#28a745',
            'INSERT': '#007bff',
            'UPDATE': '#ffc107',
            'DELETE': '#dc3545'
        };
        
        operations.forEach(op => {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', `arrowhead-${op}`);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', operationColors[op]);
            marker.appendChild(polygon);
            defs.appendChild(marker);
        });
        
        svg.appendChild(defs);

        // Positionen für APIs (links)
        const apiPositions = {};
        this.apiTableData.apis.forEach((api, index) => {
            const x = leftMargin;
            const y = topMargin + (index * apiSpacing);
            apiPositions[api.path] = { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
            
            // API-Node erstellen
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'api-node');
            g.setAttribute('data-api', api.path);
            g.setAttribute('data-category', api.category);
            g.setAttribute('transform', `translate(${x}, ${y})`);

            // Body
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'api-rect');
            rect.setAttribute('width', nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', 8);
            rect.setAttribute('fill', '#007bff');
            g.appendChild(rect);

            // Titel
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('class', 'api-title');
            title.setAttribute('x', nodeWidth / 2);
            title.setAttribute('y', 20);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', 'white');
            title.setAttribute('font-size', '12');
            title.setAttribute('font-weight', '600');
            title.textContent = api.name;
            g.appendChild(title);

            // Kategorie
            const category = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            category.setAttribute('class', 'api-category');
            category.setAttribute('x', nodeWidth / 2);
            category.setAttribute('y', 38);
            category.setAttribute('text-anchor', 'middle');
            category.setAttribute('fill', 'white');
            category.setAttribute('font-size', '10');
            category.setAttribute('opacity', '0.9');
            category.textContent = api.category;
            g.appendChild(category);

            // Method
            const method = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            method.setAttribute('class', 'api-method');
            method.setAttribute('x', nodeWidth / 2);
            method.setAttribute('y', 52);
            method.setAttribute('text-anchor', 'middle');
            method.setAttribute('fill', 'white');
            method.setAttribute('font-size', '9');
            method.setAttribute('opacity', '0.8');
            method.textContent = api.method;
            g.appendChild(method);

            g.addEventListener('mouseenter', (e) => this.showApiTooltip(e, api));
            g.addEventListener('mouseleave', () => this.hideTooltip());
            g.addEventListener('click', () => this.selectApi(api.path));

            svg.appendChild(g);
        });

        // Positionen für Tabellen (rechts)
        const tablePositions = {};
        tableArray.forEach((table, index) => {
            const x = leftMargin + apiAreaWidth + middleGap;
            const y = topMargin + (index * tableSpacing);
            tablePositions[table] = { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
            
            // Tabellen-Node erstellen
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'table-node-viz');
            g.setAttribute('data-table', table);
            g.setAttribute('transform', `translate(${x}, ${y})`);

            // Body
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'table-rect-viz');
            rect.setAttribute('width', nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', 8);
            rect.setAttribute('fill', '#28a745');
            g.appendChild(rect);

            // Titel
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('class', 'table-title-viz');
            title.setAttribute('x', nodeWidth / 2);
            title.setAttribute('y', 35);
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('fill', 'white');
            title.setAttribute('font-size', '13');
            title.setAttribute('font-weight', '600');
            title.textContent = table;
            g.appendChild(title);

            g.addEventListener('mouseenter', (e) => this.showTableTooltipViz(e, table));
            g.addEventListener('mouseleave', () => this.hideTooltip());
            g.addEventListener('click', () => this.selectTableViz(table));

            svg.appendChild(g);
        });

        // Zeichne Verbindungen
        this.apiTableData.apis.forEach(api => {
            api.table_access.forEach(access => {
                const fromPos = apiPositions[api.path];
                const toPos = tablePositions[access.table];
                
                if (fromPos && toPos) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('class', `access-line ${access.operation.toLowerCase()}-line`);
                    line.setAttribute('x1', fromPos.x);
                    line.setAttribute('y1', fromPos.y);
                    line.setAttribute('x2', toPos.x);
                    line.setAttribute('y2', toPos.y);
                    line.setAttribute('stroke', operationColors[access.operation]);
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('opacity', '0.6');
                    line.setAttribute('data-api', api.path);
                    line.setAttribute('data-table', access.table);
                    line.setAttribute('data-operation', access.operation);
                    line.setAttribute('marker-end', `url(#arrowhead-${access.operation})`);
                    
                    // Füge Line vor den Nodes ein
                    svg.insertBefore(line, svg.firstChild.nextSibling);
                }
            });
        });

        container.appendChild(svg);
        this.setupApiTablePanAndZoom(svg, totalWidth, totalHeight);
    }

    setupApiTablePanAndZoom(svg, defaultWidth, defaultHeight) {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);

        svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
                svg.style.cursor = 'grabbing';
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = (e.clientX - startPoint.x) * viewBox[2] / svg.clientWidth;
                const dy = (e.clientY - startPoint.y) * viewBox[3] / svg.clientHeight;
                viewBox[0] -= dx;
                viewBox[1] -= dy;
                svg.setAttribute('viewBox', viewBox.join(' '));
                startPoint = { x: e.clientX, y: e.clientY };
            }
        });

        svg.addEventListener('mouseup', () => {
            isPanning = false;
            svg.style.cursor = 'default';
        });

        svg.addEventListener('mouseleave', () => {
            isPanning = false;
            svg.style.cursor = 'default';
        });

        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const xPercent = mouseX / rect.width;
            const yPercent = mouseY / rect.height;
            
            const newWidth = viewBox[2] * delta;
            const newHeight = viewBox[3] * delta;
            
            const dx = (viewBox[2] - newWidth) * xPercent;
            const dy = (viewBox[3] - newHeight) * yPercent;
            
            viewBox[0] += dx;
            viewBox[1] += dy;
            viewBox[2] = newWidth;
            viewBox[3] = newHeight;
            
            svg.setAttribute('viewBox', viewBox.join(' '));
        });
    }

    showApiTooltip(event, api) {
        const tooltip = document.createElement('div');
        tooltip.className = 'schema-tooltip';
        const operations = api.table_access.reduce((acc, access) => {
            acc[access.operation] = (acc[access.operation] || 0) + 1;
            return acc;
        }, {});
        const opsText = Object.entries(operations).map(([op, count]) => `${op}: ${count}`).join(', ');
        
        tooltip.innerHTML = `
            <h4>${api.name}</h4>
            <p><strong>Pfad:</strong> ${api.path}</p>
            <p><strong>Kategorie:</strong> ${api.category}</p>
            <p><strong>Methode:</strong> ${api.method}</p>
            <p><strong>Beschreibung:</strong> ${api.description}</p>
            <p><strong>Tabellen-Zugriffe:</strong> ${api.table_access.length}</p>
            <p><strong>Operationen:</strong> ${opsText}</p>
        `;
        document.body.appendChild(tooltip);

        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        this.currentTooltip = tooltip;
    }

    showTableTooltipViz(event, tableName) {
        const tooltip = document.createElement('div');
        tooltip.className = 'schema-tooltip';
        
        // Finde alle APIs, die auf diese Tabelle zugreifen
        const accessingApis = this.apiTableData.apis.filter(api => 
            api.table_access.some(access => access.table === tableName)
        );
        
        const operations = {};
        accessingApis.forEach(api => {
            api.table_access.filter(access => access.table === tableName).forEach(access => {
                operations[access.operation] = (operations[access.operation] || 0) + 1;
            });
        });
        
        tooltip.innerHTML = `
            <h4>${tableName}</h4>
            <p><strong>Zugreifende APIs:</strong> ${accessingApis.length}</p>
            <p><strong>Operationen:</strong> ${Object.entries(operations).map(([op, count]) => `${op}: ${count}`).join(', ')}</p>
        `;
        document.body.appendChild(tooltip);

        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';

        this.currentTooltip = tooltip;
    }

    selectApi(apiPath) {
        document.querySelectorAll('.api-node').forEach(node => {
            node.classList.remove('selected');
        });
        
        const selectedNode = document.querySelector(`[data-api="${apiPath}"]`);
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }

        // Hebe zugehörige Linien hervor
        document.querySelectorAll('.access-line').forEach(line => {
            if (line.getAttribute('data-api') === apiPath) {
                line.style.opacity = '1';
                line.style.strokeWidth = '3';
            } else {
                line.style.opacity = '0.2';
                line.style.strokeWidth = '1';
            }
        });
    }

    selectTableViz(tableName) {
        document.querySelectorAll('.table-node-viz').forEach(node => {
            node.classList.remove('selected');
        });
        
        const selectedNode = document.querySelector(`[data-table="${tableName}"]`);
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }

        // Hebe zugehörige Linien hervor
        document.querySelectorAll('.access-line').forEach(line => {
            if (line.getAttribute('data-table') === tableName) {
                line.style.opacity = '1';
                line.style.strokeWidth = '3';
            } else {
                line.style.opacity = '0.2';
                line.style.strokeWidth = '1';
            }
        });
    }

    setupApiTableControls() {
        // Kategorie-Filter
        const categories = [...new Set(this.apiTableData.apis.map(api => api.category))];
        const categoryFilter = document.getElementById('category-filter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        // Filter Event Listeners
        categoryFilter.addEventListener('change', () => this.applyFilters());
        document.getElementById('operation-filter').addEventListener('change', () => this.applyFilters());

        // Zoom Controls
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const svg = document.querySelector('.api-table-svg');
                if (!svg) return;

                let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
                const [x, y, width, height] = viewBox;

                if (action === 'zoom-in') {
                    const factor = 0.9;
                    const newWidth = width * factor;
                    const newHeight = height * factor;
                    const newX = x + (width - newWidth) / 2;
                    const newY = y + (height - newHeight) / 2;
                    svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
                } else if (action === 'zoom-out') {
                    const factor = 1.1;
                    const newWidth = width * factor;
                    const newHeight = height * factor;
                    const newX = x - (newWidth - width) / 2;
                    const newY = y - (newHeight - height) / 2;
                    svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
                } else if (action === 'reset') {
                    const defaultViewBox = svg.getAttribute('viewBox');
                    const parts = defaultViewBox.split(' ');
                    svg.setAttribute('viewBox', `0 0 ${parts[2]} ${parts[3]}`);
                }
            });
        });
    }

    applyFilters() {
        const categoryFilter = document.getElementById('category-filter').value;
        const operationFilter = document.getElementById('operation-filter').value;

        // Filtere APIs
        document.querySelectorAll('.api-node').forEach(node => {
            const category = node.getAttribute('data-category');
            const apiPath = node.getAttribute('data-api');
            const api = this.apiTableData.apis.find(a => a.path === apiPath);
            
            let show = true;
            if (categoryFilter && category !== categoryFilter) {
                show = false;
            }
            
            if (show && operationFilter && api) {
                const hasOperation = api.table_access.some(access => access.operation === operationFilter);
                if (!hasOperation) {
                    show = false;
                }
            }
            
            node.style.opacity = show ? '1' : '0.3';
        });

        // Filtere Linien
        document.querySelectorAll('.access-line').forEach(line => {
            const operation = line.getAttribute('data-operation');
            const apiPath = line.getAttribute('data-api');
            const api = this.apiTableData.apis.find(a => a.path === apiPath);
            
            let show = true;
            if (categoryFilter && api && api.category !== categoryFilter) {
                show = false;
            }
            if (operationFilter && operation !== operationFilter) {
                show = false;
            }
            
            line.style.opacity = show ? '0.6' : '0.1';
            line.style.strokeWidth = show ? '2' : '1';
        });
    }

    showError(message) {
        const container = document.getElementById('visualization-container');
        container.innerHTML = `
            <div class="loading-message" style="color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
    }
}

// Initialisiere beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    window.overviewViz = new OverviewVisualizations();
});

