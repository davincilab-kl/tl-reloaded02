// HTML Blocks Widget-System

// Benutzerdefiniertes Theme erstellen
const customTheme = Blockly.Theme.defineTheme('htmlBlocksTheme', {
    'blockStyles': {
        'html_structure_blocks': {
            'colourPrimary': '#E67E22',
            'colourSecondary': '#D35400',
            'colourTertiary': '#A04000'
        },
        'container_blocks': {
            'colourPrimary': '#A0A0A0',
            'colourSecondary': '#808080',
            'colourTertiary': '#606060'
        },
        'text_blocks': {
            'colourPrimary': '#54a131',
            'colourSecondary': '#3f7524',
            'colourTertiary': '#355a1e'
        },
        'media_blocks': {
            'colourPrimary': '#8E44AD',
            'colourSecondary': '#6C3483',
            'colourTertiary': '#512E5F'
        },
        'interaction_blocks': {
            'colourPrimary': '#3498DB',
            'colourSecondary': '#2874A6',
            'colourTertiary': '#1F618D'
        },
        'list_blocks': {
            'colourPrimary': '#E74C3C',
            'colourSecondary': '#C0392B',
            'colourTertiary': '#922B21'
        }
    },
    'categoryStyles': {
        'html_structure_category': {
            'colour': '#E67E22'
        },
        'container_category': {
            'colour': '#A0A0A0'
        },
        'text_category': {
            'colour': '#54a131'
        },
        'media_category': {
            'colour': '#8E44AD'
        },
        'interaction_category': {
            'colour': '#3498DB'
        },
        'list_category': {
            'colour': '#E74C3C'
        }
    },
    'componentStyles': {
        'workspaceBackgroundColour': '#F8F9FA',
        'toolboxBackgroundColour': '#eee',
        'toolboxForegroundColour': '#333333',
        'flyoutBackgroundColour': '#eee',
        'flyoutForegroundColour': '#333333',
        'flyoutOpacity': 1,
        'scrollbarColour': '#4182ff',
        'scrollbarOpacity': 0.6,
        'insertionMarkerColour': '#4182ff',
        'insertionMarkerOpacity': 0.3,
        'markerColour': '#4182ff',
        'cursorColour': '#4182ff'
    }
});

// Verfügbare Block-Kategorien
const BLOCK_CATEGORIES = {
    'html_structure': {
        name: 'HTML Struktur',
        colour: '#E67E22',
        blocks: ['html_document']
    },
    'container': {
        name: 'Container',
        colour: '#A0A0A0',
        blocks: ['html_div']
    },
    'text': {
        name: 'Text',
        colour: '#54a131',
        blocks: ['html_heading', 'html_paragraph', 'html_text']
    },
    'media': {
        name: 'Medien',
        colour: '#8E44AD',
        blocks: ['html_image']
    },
    'interaction': {
        name: 'Interaktion',
        colour: '#3498DB',
        blocks: ['html_link']
    },
    'list': {
        name: 'Listen',
        colour: '#E74C3C',
        blocks: ['html_list', 'html_list_item']
    }
};

// HTML Blocks Widget Klasse
class HTMLBlocksWidget {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = {
            // Standardmäßig alle Blöcke verfügbar
            availableBlocks: config.availableBlocks || Object.keys(BLOCK_CATEGORIES),
            // Standardmäßig HTML-Dokument-Block initial hinzufügen
            autoInitDocument: config.autoInitDocument !== false,
            // Workspace-Höhe
            workspaceHeight: config.workspaceHeight || '600px',
            ...config
        };
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container mit ID "${containerId}" nicht gefunden`);
        }
        
        this.workspace = null;
        this.instanceId = `htmlblocks-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.init();
    }
    
    init() {
        this.createHTML();
        this.initBlockly();
        this.initTabs();
        this.initEventListeners();
        
        if (this.config.autoInitDocument) {
            setTimeout(() => this.addInitialDocument(), 500);
        }
    }
    
    createHTML() {
        this.container.innerHTML = `
            <div class="html-blocks-widget">
                <div class="workspace-container">
                    <div id="${this.instanceId}-blockly" class="blockly-workspace"></div>
                </div>
                
                <div class="preview-container">
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="preview" data-instance="${this.instanceId}">
                            🔎 Vorschau
                        </button>
                        <button class="tab-btn" data-tab="code" data-instance="${this.instanceId}">
                            💻 HTML-Code
                        </button>
                        <button id="${this.instanceId}-refresh" class="btn-refresh">Aktualisieren</button>
                    </div>
                    
                    <div class="tab-content active" id="${this.instanceId}-preview-tab">
                        <div class="preview-frame">
                            <iframe id="${this.instanceId}-preview" sandbox="allow-same-origin"></iframe>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="${this.instanceId}-code-tab">
                        <div class="code-panel">
                            <pre id="${this.instanceId}-code"><code></code></pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Workspace-Höhe setzen
        const workspaceDiv = document.getElementById(`${this.instanceId}-blockly`);
        if (workspaceDiv) {
            workspaceDiv.style.minHeight = this.config.workspaceHeight;
        }
    }
    
    buildToolbox() {
        const contents = [];
        
        this.config.availableBlocks.forEach(categoryKey => {
            const category = BLOCK_CATEGORIES[categoryKey];
            if (category) {
                contents.push({
                    kind: 'category',
                    name: category.name,
                    colour: category.colour,
                    contents: category.blocks.map(blockType => ({
                        kind: 'block',
                        type: blockType
                    }))
                });
            }
        });
        
        return {
            kind: 'categoryToolbox',
            contents: contents
        };
    }
    
    initBlockly() {
        const blocklyDiv = document.getElementById(`${this.instanceId}-blockly`);
        
        this.workspace = Blockly.inject(blocklyDiv, {
            toolbox: this.buildToolbox(),
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            media: 'https://unpkg.com/blockly/media/',
            theme: customTheme
        });
        
        // Event-Listener für Änderungen im Workspace
        this.workspace.addChangeListener(() => this.updatePreview());
    }
    
    addInitialDocument() {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(
                `<xml><block type="html_document" x="50" y="50"></block></xml>`, 
                'text/xml'
            );
            Blockly.Xml.domToWorkspace(xml.documentElement, this.workspace);
        } catch (e) {
            // Fallback: Block programmatisch erstellen
            const block = this.workspace.newBlock('html_document');
            block.moveBy(50, 50);
            block.initSvg();
            block.render();
        }
    }
    
    highlightHTML(code) {
        // Tag-Farben basierend auf Kategorien
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
        
        // Tags mit Farben versehen - Regex die bis zum &gt; geht
        // Wir müssen zwischen &lt; und &gt; alles erfassen, auch wenn &quot; dazwischen ist
        highlighted = highlighted.replace(/&lt;(\/?)(\w+)((?:(?!&gt;).)*?)(&gt;)/g, (match, closing, tag, attrs, gt) => {
            const color = tagColors[tag.toLowerCase()] || '#333';
            // Wenn es ein schließendes Tag ist, keine Attribute einfärben
            if (closing === '/') {
                return `<span style="color: ${color}">&lt;/${tag}${gt}</span>`;
            }
            // Attribute und Anführungsstriche auch einfärben
            return `<span style="color: ${color}">&lt;${tag}${attrs}${gt}</span>`;
        });
        
        return highlighted;
    }
    
    updatePreview() {
        try {
            const code = Blockly.HTML.workspaceToCode(this.workspace);
            const previewFrame = document.getElementById(`${this.instanceId}-preview`);
            const codeOutput = document.getElementById(`${this.instanceId}-code`);
            
            if (codeOutput) {
                const highlighted = this.highlightHTML(code);
                codeOutput.querySelector('code').innerHTML = highlighted;
            }
            
            if (previewFrame) {
                previewFrame.srcdoc = code;
            }
        } catch (e) {
            console.error('Fehler beim Generieren des HTML:', e);
            const codeOutput = document.getElementById(`${this.instanceId}-code`);
            if (codeOutput) {
                codeOutput.querySelector('code').textContent = 'Fehler: ' + e.message;
            }
        }
    }
    
    initTabs() {
        const tabButtons = this.container.querySelectorAll(`.tab-btn[data-instance="${this.instanceId}"]`);
        const tabContents = this.container.querySelectorAll(`.tab-content`);
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Alle Tabs dieser Instanz deaktivieren
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.container.querySelectorAll('.tab-content').forEach(content => {
                    if (content.id.startsWith(this.instanceId)) {
                        content.classList.remove('active');
                    }
                });
                
                // Aktiven Tab aktivieren
                button.classList.add('active');
                const targetContent = document.getElementById(`${this.instanceId}-${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    initEventListeners() {
        const refreshBtn = document.getElementById(`${this.instanceId}-refresh`);
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updatePreview());
        }
        
        // Initiale Vorschau
        setTimeout(() => this.updatePreview(), 500);
        
        // Workspace-Größe anpassen bei Fenster-Resize
        window.addEventListener('resize', () => {
            if (this.workspace) {
                Blockly.svgResize(this.workspace);
            }
        });
    }
    
    // Öffentliche Methoden
    getCode() {
        return Blockly.HTML.workspaceToCode(this.workspace);
    }
    
    setCode(xmlString) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'text/xml');
        Blockly.Xml.domToWorkspace(xml.documentElement, this.workspace);
    }
    
    clear() {
        this.workspace.clear();
    }
}

// Globale Funktion für einfache Verwendung
window.HTMLBlocksWidget = HTMLBlocksWidget;

// Automatische Initialisierung für bestehende Container (Rückwärtskompatibilität)
document.addEventListener('DOMContentLoaded', function() {
    // Wenn ein Container mit der ID 'html-blocks-app' existiert, initialisiere automatisch
    if (document.getElementById('html-blocks-app')) {
        new HTMLBlocksWidget('html-blocks-app');
    }
});
