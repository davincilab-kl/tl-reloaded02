// Übungssystem für HTMLblockly

document.addEventListener('DOMContentLoaded', function() {
    const exercises = [
        {
            id: 0,
            title: 'HTML-Grundlagen und Text',
            availableBlocks: ['html_structure', 'text'],
            widgetId: 'exercise-0-widget'
        },
        {
            id: 1,
            title: 'Medien hinzufügen',
            availableBlocks: ['html_structure', 'text', 'media'],
            widgetId: 'exercise-1-widget'
        },
        {
            id: 2,
            title: 'Interaktive Elemente',
            availableBlocks: ['html_structure', 'text', 'media', 'interaction'],
            widgetId: 'exercise-2-widget'
        },
        {
            id: 3,
            title: 'Listen erstellen',
            availableBlocks: ['html_structure', 'text', 'media', 'interaction', 'list'],
            widgetId: 'exercise-3-widget'
        },
        {
            id: 4,
            title: 'Organisation mit Containern',
            availableBlocks: ['html_structure', 'text', 'media', 'interaction', 'list', 'container'],
            widgetId: 'exercise-4-widget'
        },
        {
            id: 5,
            title: 'HTML direkt schreiben',
            isCodeEditor: true
        }
    ];
    
    let currentExercise = 0;
    const widgets = [];
    
    // Widgets initialisieren (alle, aber nur das aktive wird angezeigt)
    exercises.forEach((exercise, index) => {
        if (!exercise.isCodeEditor) {
            const widget = new HTMLBlocksWidget(exercise.widgetId, {
                availableBlocks: exercise.availableBlocks,
                workspaceHeight: '500px',
                autoInitDocument: true
            });
            widgets.push(widget);
        } else {
            widgets.push(null); // Platzhalter für Code-Editor
        }
    });
    
    let codeEditorInitialized = false;
    
    // Navigation-Buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const progressDots = document.querySelectorAll('.progress-dot');
    const exerciseSections = document.querySelectorAll('.exercise-section');
    
    // Übung anzeigen
    function showExercise(index) {
        // Alle Übungen verstecken
        exerciseSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Aktuelle Übung anzeigen
        exerciseSections[index].classList.add('active');
        
        // Fortschrittsanzeige aktualisieren
        progressDots.forEach((dot, i) => {
            if (i <= index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Navigation-Buttons aktualisieren
        btnPrev.disabled = index === 0;
        btnNext.disabled = index === exercises.length - 1;
        
        // Workspace-Größe anpassen
        setTimeout(() => {
            if (widgets[index] && widgets[index] && widgets[index].workspace) {
                Blockly.svgResize(widgets[index].workspace);
            }
        }, 100);
        
        // Code-Editor initialisieren, wenn Übung 6 aktiv ist
        if (exercises[index].isCodeEditor && !codeEditorInitialized) {
            setTimeout(() => {
                initCodeEditor();
                codeEditorInitialized = true;
            }, 200);
        }
    }
    
    // Code-Editor Funktionen
    function initCodeEditor() {
        const editor = document.getElementById('html-code-editor');
        const highlight = document.getElementById('html-code-highlight');
        const preview = document.getElementById('html-code-preview');
        const downloadBtn = document.getElementById('btn-download-html');
        const uploadBtn = document.getElementById('btn-upload-image');
        const uploadInput = document.getElementById('image-upload-input');
        
        if (!editor || !highlight || !preview) return;
        
        // Initiale Anzeige
        updateCodeEditor();
        
        // Event-Listener für Eingaben
        editor.addEventListener('input', updateCodeEditor);
        editor.addEventListener('scroll', () => {
            highlight.scrollTop = editor.scrollTop;
            highlight.scrollLeft = editor.scrollLeft;
        });
        
        // Tab-Unterstützung
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 4;
                updateCodeEditor();
            }
        });
        
        // Download-Button
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadHTML);
        }
        
        // Upload-Button
        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => {
                uploadInput.click();
            });
            
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    uploadImage(file);
                }
                // Reset input, damit derselbe Datei wieder hochgeladen werden kann
                e.target.value = '';
            });
        }
    }
    
    let uploadedImages = [];
    
    function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        // Zeige Ladeanzeige
        const uploadBtn = document.getElementById('btn-upload-image');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird hochgeladen...';
        
        // Lese das Bild als Base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            
            // Lade das Bild auf den Server
            fetch('/apps/html-blockly/api/upload_image.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = originalText;
                
                if (data.success) {
                    // Füge Bild zur Liste hinzu (mit Base64)
                    addImageToList({
                        url: data.url,
                        filename: data.filename,
                        originalName: file.name,
                        base64: base64
                    });
                } else {
                    alert('Fehler beim Hochladen: ' + (data.error || 'Unbekannter Fehler'));
                }
            })
            .catch(error => {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = originalText;
                alert('Fehler beim Hochladen: ' + error.message);
            });
        };
        
        reader.onerror = function() {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalText;
            alert('Fehler beim Lesen der Datei');
        };
        
        reader.readAsDataURL(file);
    }
    
    function addImageToList(image) {
        uploadedImages.push(image);
        updateImagesList();
    }
    
    function updateImagesList() {
        const listContainer = document.getElementById('uploaded-images-list');
        if (!listContainer) return;
        
        if (uploadedImages.length === 0) {
            listContainer.innerHTML = '<p class="no-images-message">Noch keine Bilder hochgeladen</p>';
            return;
        }
        
        listContainer.innerHTML = uploadedImages.map((image, index) => {
            // Verwende Base64 für die Anzeige, falls verfügbar
            const imageSrc = image.base64 || image.url;
            return `
                <div class="uploaded-image-item">
                    <div class="image-preview">
                        <img src="${imageSrc}" alt="${image.originalName}" onerror="this.style.display='none'">
                    </div>
                    <div class="image-info">
                        <div class="image-filename" title="${image.filename}">${image.filename}</div>
                        <button class="btn-insert-image" data-base64="${image.base64 || ''}" data-filename="${image.filename}" title="Bild einfügen">
                            <i class="fas fa-plus"></i> Einfügen
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event-Listener für Einfügen-Buttons
        listContainer.querySelectorAll('.btn-insert-image').forEach(btn => {
            btn.addEventListener('click', () => {
                const base64 = btn.getAttribute('data-base64');
                const filename = btn.getAttribute('data-filename');
                insertImageTag(base64, filename);
            });
        });
    }
    
    function insertImageTag(base64, filename) {
        const editor = document.getElementById('html-code-editor');
        if (!editor) return;
        
        // Erstelle img-Tag mit nur dem Dateinamen (ohne alt-Attribut)
        const imgTag = `<img src="${filename}">`;
        
        // Finde die Cursor-Position
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        // Füge das img-Tag an der Cursor-Position ein
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        editor.value = before + imgTag + after;
        
        // Setze Cursor nach dem eingefügten Tag
        const newPosition = start + imgTag.length;
        editor.selectionStart = editor.selectionEnd = newPosition;
        editor.focus();
        
        // Aktualisiere die Anzeige
        updateCodeEditor();
    }
    
    async function downloadHTML() {
        const editor = document.getElementById('html-code-editor');
        if (!editor) return;
        
        let code = editor.value;
        
        // Finde alle img-Tags mit Server-URLs
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const images = [];
        let match;
        
        while ((match = imgRegex.exec(code)) !== null) {
            const imgUrl = match[1];
            // Prüfe ob es ein Dateiname ist (beginnt mit img_ und hat eine Dateiendung)
            const isFilename = /^img_[a-z0-9_.-]+\.(jpg|jpeg|png|gif|webp)$/i.test(imgUrl);
            
            // Prüfe ob es eine Server-URL ist
            const isServerUrl = imgUrl.startsWith('/apps/html-blockly/api/uploads/') || 
                               imgUrl.includes('/apps/html-blockly/api/uploads/') ||
                               imgUrl.includes('html-blockly/api/uploads');
            
            if (isFilename || isServerUrl) {
                // Wenn es nur ein Dateiname ist, erstelle die volle URL
                let fullUrl = imgUrl;
                if (isFilename) {
                    const protocol = window.location.protocol;
                    const host = window.location.host;
                    fullUrl = protocol + '//' + host + '/apps/html-blockly/api/uploads/index.php?file=' + encodeURIComponent(imgUrl);
                } else if (imgUrl.startsWith('/')) {
                    const protocol = window.location.protocol;
                    const host = window.location.host;
                    fullUrl = protocol + '//' + host + imgUrl;
                } else if (imgUrl.includes('html-blockly/api/uploads')) {
                    // Relative URL, füge Protokoll und Host hinzu
                    const protocol = window.location.protocol;
                    const host = window.location.host;
                    if (!imgUrl.startsWith('http')) {
                        fullUrl = protocol + '//' + host + (imgUrl.startsWith('/') ? '' : '/') + imgUrl;
                    } else {
                        fullUrl = imgUrl;
                    }
                }
                
                images.push({
                    url: fullUrl,
                    fullMatch: match[0],
                    index: match.index,
                    originalUrl: imgUrl
                });
            }
        }
        
        if (images.length > 0) {
            // Lade alle Bilder herunter und konvertiere zu Base64
            const downloadBtn = document.getElementById('btn-download-html');
            const originalText = downloadBtn.innerHTML;
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird vorbereitet...';
            
            try {
                for (let i = images.length - 1; i >= 0; i--) {
                    const img = images[i];
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    
                    // Ersetze die URL durch Base64 im Code
                    const newImgTag = img.fullMatch.replace(/src=["'][^"']+["']/, `src="${base64}"`);
                    code = code.substring(0, img.index) + newImgTag + code.substring(img.index + img.fullMatch.length);
                }
                
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalText;
            } catch (error) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalText;
                alert('Fehler beim Herunterladen der Bilder: ' + error.message);
                return;
            }
        }
        
        // HTML-Datei herunterladen
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meine-website.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function updateCodeEditor() {
        const editor = document.getElementById('html-code-editor');
        const highlight = document.getElementById('html-code-highlight');
        const preview = document.getElementById('html-code-preview');
        
        if (!editor || !highlight || !preview) return;
        
        let code = editor.value;
        
        // Erstelle eine Map von Dateinamen zu Base64
        const filenameToBase64 = {};
        uploadedImages.forEach(img => {
            if (img.base64) {
                filenameToBase64[img.filename] = img.base64;
            }
        });
        
        // Erstelle eine Liste der erlaubten Dateinamen (nur die in dieser Session hochgeladenen)
        const allowedFilenames = uploadedImages.map(img => img.filename);
        
        // Konvertiere Dateinamen zu Base64 für die Preview
        code = code.replace(/<img([^>]+)src=["']([^"']+)["']/gi, (match, attrs, src) => {
            // Prüfe ob es ein Dateiname ist (beginnt mit img_ und hat eine Dateiendung)
            if (/^img_\d+\.(jpg|jpeg|png|gif|webp)$/i.test(src)) {
                // Nur anzeigen, wenn das Bild in dieser Session hochgeladen wurde
                if (allowedFilenames.includes(src) && filenameToBase64[src]) {
                    // Verwende Base64 statt URL
                    return `<img${attrs}src="${filenameToBase64[src]}"`;
                } else {
                    // Bild nicht gefunden - zeige Platzhalter
                    return `<img${attrs}src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EBild nicht gefunden%3C/text%3E%3C/svg%3E"`;
                }
            }
            return match;
        });
        
        // Syntax-Highlighting (verwendet die highlightHTML Funktion aus app.js)
        const highlighted = highlightHTML(editor.value); // Verwende original code für Highlighting
        highlight.innerHTML = highlighted;
        
        // Preview aktualisieren (mit Base64)
        preview.srcdoc = code;
    }
    
    function highlightHTML(code) {
        // Tag-Farben basierend auf Kategorien (aus app.js)
        const tagColors = {
            // HTML Struktur
            'html': '#E67E22',
            'head': '#E67E22',
            'body': '#E67E22',
            'title': '#E67E22',
            // Container
            'div': '#A0A0A0',
            // Text
            'h1': '#54a131',
            'h2': '#54a131',
            'h3': '#54a131',
            'h4': '#54a131',
            'h5': '#54a131',
            'h6': '#54a131',
            'p': '#54a131',
            // Medien
            'img': '#8E44AD',
            // Interaktion
            'a': '#3498DB',
            // Listen
            'ul': '#E74C3C',
            'ol': '#E74C3C',
            'li': '#E74C3C'
        };
        
        // HTML-Code escapen
        let highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        
        // Tags mit Farben versehen
        highlighted = highlighted.replace(/&lt;(\/?)(\w+)((?:(?!&gt;).)*?)(&gt;)/g, (match, closing, tag, attrs, gt) => {
            const color = tagColors[tag.toLowerCase()] || '#333';
            if (closing === '/') {
                return `<span style="color: ${color}">&lt;/${tag}${gt}</span>`;
            }
            return `<span style="color: ${color}">&lt;${tag}${attrs}${gt}</span>`;
        });
        
        return highlighted;
    }
    
    // Zurück-Button
    btnPrev.addEventListener('click', () => {
        if (currentExercise > 0) {
            currentExercise--;
            showExercise(currentExercise);
        }
    });
    
    // Weiter-Button
    btnNext.addEventListener('click', () => {
        if (currentExercise < exercises.length - 1) {
            currentExercise++;
            showExercise(currentExercise);
        }
    });
    
    // Fortschritts-Punkte klickbar machen
    progressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentExercise = index;
            showExercise(currentExercise);
        });
    });
    
    // Erste Übung anzeigen
    showExercise(0);
});

