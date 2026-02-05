/**
 * Universelle Drag & Drop Funktionalität für alle Modals
 * Aktiviert automatisch Drag & Drop am Header für alle Modals
 */
(function() {
    'use strict';

    function makeModalDraggable(modal) {
        const modalContent = modal.querySelector('.modal-content') || modal.querySelector('.modal-dialog');
        if (!modalContent) return;

        const modalHeader = modalContent.querySelector('.modal-header');
        if (!modalHeader) return;

        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX;
        let initialY;
        let startX;
        let startY;
        let originalLeft = null;
        let originalTop = null;

        // Setze initiale Position
        modalContent.style.position = 'relative';
        modalContent.style.margin = '0';
        modalContent.style.transform = 'translate(0, 0)';

        // Mache Header draggable
        modalHeader.style.cursor = 'move';
        modalHeader.style.userSelect = 'none';

        function dragStart(e) {
            // Verhindere Drag bei Klick auf Close-Button
            if (e.target.closest('.modal-close')) {
                return;
            }

            if (e.target === modalHeader || modalHeader.contains(e.target)) {
                // Hole aktuelle Position des Modals
                const rect = modalContent.getBoundingClientRect();
                
                // Speichere ursprüngliche Position beim ersten Drag (wenn noch nicht gesetzt)
                if (originalLeft === null) {
                    // Berechne ursprüngliche zentrierte Position
                    originalLeft = (window.innerWidth - rect.width) / 2;
                    originalTop = (window.innerHeight - rect.height) / 2;
                }
                
                if (e.type === 'touchstart') {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else {
                    startX = e.clientX;
                    startY = e.clientY;
                }
                
                // Berechne initiale Mausposition relativ zum aktuellen Offset
                initialX = startX - currentX;
                initialY = startY - currentY;
                
                isDragging = true;
            }
        }

        function drag(e) {
            if (!isDragging) return;

            e.preventDefault();

            let clientX, clientY;
            
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                // Begrenze nur Y nach oben (minY = 0), damit Modal nicht über oberen Rand hinausgeht
                // X-Werte werden nicht begrenzt, damit Modal in alle horizontalen Richtungen bewegt werden kann
                clientX = e.clientX;
                clientY = Math.max(0, e.clientY);
            }

            // Berechne neue Offset-Position relativ zum Startpunkt
            currentX = clientX - initialX;
            currentY = clientY - initialY;

            // Hole aktuelle Größe des Modal-Contents
            const rect = modalContent.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Aktualisiere ursprüngliche Position wenn Viewport-Größe sich geändert hat
            if (originalLeft === null) {
                originalLeft = (window.innerWidth - width) / 2;
                originalTop = (window.innerHeight - height) / 2;
            }
            
            // Berechne neue absolute Position
            const newLeft = originalLeft + currentX;
            const newTop = originalTop + currentY;
            
            // Begrenze nur nach oben (minY = 0), damit Modal nicht über oberen Rand hinausgeht
            // Alle anderen Richtungen sind unbegrenzt
            const minY = 0;
            
            // Korrigiere Offset nur wenn oberer Rand überschritten wird
            if (newTop < minY) {
                currentY = minY - originalTop;
            }

            setTranslate(currentX, currentY, modalContent);
        }

        function dragEnd(e) {
            if (!isDragging) return;
            
            // Beende das Draggen unabhängig davon, ob Maus im Viewport ist
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }

        // Event Listener für Maus
        modalHeader.addEventListener('mousedown', dragStart);
        
        // Verwende document für mousemove und mouseup, damit es auch außerhalb des Viewports funktioniert
        const handleMouseMove = (e) => drag(e);
        const handleMouseUp = (e) => dragEnd(e);
        
        // Verwende capture phase, damit Events auch erfasst werden, wenn Maus Viewport verlässt
        document.addEventListener('mousemove', handleMouseMove, true);
        document.addEventListener('mouseup', handleMouseUp, true);
        
        // Zusätzlich: Beende Drag wenn Maus den Viewport verlässt
        document.addEventListener('mouseleave', (e) => {
            if (isDragging && e.target === document.documentElement) {
                dragEnd(e);
            }
        }, true);
        
        // Speichere Event Listener für späteres Entfernen
        modalContent._dragHandlers = {
            mousemove: handleMouseMove,
            mouseup: handleMouseUp
        };

        // Event Listener für Touch (Mobile)
        modalHeader.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);

        // Reset Position beim Schließen des Modals
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = modal.style.display;
                    if (display === 'none' || display === '') {
                        // Reset Position
                        currentX = 0;
                        currentY = 0;
                        originalLeft = null;
                        originalTop = null;
                        setTranslate(0, 0, modalContent);
                    }
                }
            });
        });

        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Initialisiere Drag & Drop für alle Modals beim Laden der Seite
    function initDraggableModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            makeModalDraggable(modal);
        });
    }

    // Initialisiere sofort wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggableModals);
    } else {
        initDraggableModals();
    }

    // Initialisiere auch für dynamisch hinzugefügte Modals
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('modal')) {
                        makeModalDraggable(node);
                    }
                    // Prüfe auch auf Modals innerhalb des hinzugefügten Nodes
                    const modals = node.querySelectorAll ? node.querySelectorAll('.modal') : [];
                    modals.forEach(modal => makeModalDraggable(modal));
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

/**
 * Wiederverwendbare XLSX-Export-Funktion
 * Exportiert Daten als Excel-Datei
 * 
 * @param {Array} data - Array von Objekten mit den zu exportierenden Daten
 * @param {Array} columns - Array von Spaltenkonfigurationen: [{key: 'field', label: 'Spaltenname'}, ...]
 * @param {String} filename - Name der zu erstellenden Datei (ohne .xlsx)
 */
window.exportToXLSX = function(data, columns, filename) {
    // Lade SheetJS-Bibliothek dynamisch falls noch nicht geladen
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
        script.onload = function() {
            performExport(data, columns, filename);
        };
        script.onerror = function() {
            alert('Fehler beim Laden der Export-Bibliothek. Bitte versuchen Sie es später erneut.');
        };
        document.head.appendChild(script);
    } else {
        performExport(data, columns, filename);
    }
    
    function performExport(data, columns, filename) {
        try {
            // Erstelle Arbeitsblatt-Daten
            const worksheetData = [];
            
            // Header-Zeile
            const headers = columns.map(col => col.label || col.key);
            worksheetData.push(headers);
            
            // Daten-Zeilen
            data.forEach(row => {
                const rowData = columns.map(col => {
                    let value = row[col.key];
                    
                    // Formatiere spezielle Datentypen
                    if (value === null || value === undefined) {
                        value = '';
                    } else if (typeof value === 'boolean') {
                        value = value ? 'Ja' : 'Nein';
                    } else if (value instanceof Date) {
                        value = value.toLocaleDateString('de-DE') + ' ' + value.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
                    } else if (Array.isArray(value)) {
                        value = value.join(', ');
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    
                    return value;
                });
                worksheetData.push(rowData);
            });
            
            // Erstelle Workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);
            
            // Setze Spaltenbreiten
            const colWidths = columns.map(() => ({ wch: 15 }));
            ws['!cols'] = colWidths;
            
            // Füge Arbeitsblatt zum Workbook hinzu
            XLSX.utils.book_append_sheet(wb, ws, 'Daten');
            
            // Exportiere Datei
            const fileName = (filename || 'export') + '.xlsx';
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Export-Fehler:', error);
            alert('Fehler beim Exportieren der Daten: ' + error.message);
        }
    }
};