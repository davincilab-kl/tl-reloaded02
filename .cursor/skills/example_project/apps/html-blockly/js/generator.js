// HTML-Code-Generator für HTML-Blöcke

// Eigener HTML-Generator erstellen
Blockly.HTML = new Blockly.Generator('HTML');

// ORDER-Konstanten für den HTML-Generator
Blockly.HTML.ORDER_ATOMIC = 0;

// Einrückungsebene verfolgen
Blockly.HTML.indentLevel = 0;
Blockly.HTML.INDENT = '    '; // 4 Leerzeichen

// Hilfsfunktion: Einrückung basierend auf aktueller Ebene
Blockly.HTML.indent = function() {
    return Blockly.HTML.INDENT.repeat(Blockly.HTML.indentLevel);
};

// Hilfsfunktion: Text mit Einrückung versehen (jede Zeile)
Blockly.HTML.indentText = function(text) {
    if (!text) return '';
    const indent = Blockly.HTML.indent();
    return text.split('\n').map(line => {
        if (line.trim() === '') return '';
        return indent + line;
    }).join('\n');
};

// Hilfsfunktion: Alle Blöcke in einer Statement-Kette durchlaufen
Blockly.HTML.statementToCode = function(block, name) {
    const targetBlock = block.getInputTargetBlock(name);
    if (!targetBlock) {
        return '';
    }
    // Einrückungsebene erhöhen
    Blockly.HTML.indentLevel++;
    let code = '';
    let currentBlock = targetBlock;
    while (currentBlock) {
        const blockCode = Blockly.HTML.blockToCode(currentBlock);
        if (blockCode) {
            code += blockCode;
        }
        currentBlock = currentBlock.nextConnection && currentBlock.nextConnection.targetBlock();
    }
    // Einrückungsebene wieder reduzieren
    Blockly.HTML.indentLevel--;
    return code;
};

Blockly.HTML.forBlock['html_document'] = function(block) {
    const title = block.getFieldValue('TITLE');
    Blockly.HTML.indentLevel = 1; // Start bei Ebene 1 für body-Inhalt
    const bodyContent = Blockly.HTML.statementToCode(block, 'BODY') || '';
    Blockly.HTML.indentLevel = 0; // Zurück auf 0
    
    return `<html>
    <head>
        <title>${title}</title>
    </head>
    
    <body>
${bodyContent}    </body>
</html>`;
};

Blockly.HTML.forBlock['html_div'] = function(block) {
    const indent = Blockly.HTML.indent();
    const content = Blockly.HTML.statementToCode(block, 'CONTENT') || '';
    // Content hat bereits die richtige Einrückung durch statementToCode
    const indentedContent = content ? '\n' + content + indent : '';
    return `${indent}<div>${indentedContent}</div>\n`;
};

Blockly.HTML.forBlock['html_heading'] = function(block) {
    const level = block.getFieldValue('LEVEL');
    const text = Blockly.HTML.valueToCode(block, 'TEXT', Blockly.HTML.ORDER_ATOMIC) || '';
    const cleanText = text.replace(/^["']|["']$/g, '');
    const indent = Blockly.HTML.indent();
    return `${indent}<${level}>${cleanText}</${level}>\n`;
};

Blockly.HTML.forBlock['html_paragraph'] = function(block) {
    const text = Blockly.HTML.valueToCode(block, 'TEXT', Blockly.HTML.ORDER_ATOMIC) || '';
    const cleanText = text.replace(/^["']|["']$/g, '');
    const indent = Blockly.HTML.indent();
    return `${indent}<p>${cleanText}</p>\n`;
};

Blockly.HTML.forBlock['html_text'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return ['"' + text.replace(/"/g, '&quot;') + '"', Blockly.HTML.ORDER_ATOMIC];
};

Blockly.HTML.forBlock['html_image'] = function(block) {
    const src = block.getFieldValue('SRC') || '';
    let width = block.getFieldValue('WIDTH') || '';
    let height = block.getFieldValue('HEIGHT') || '';
    
    // Automatisch "px" hinzufügen, wenn nur eine Zahl eingegeben wurde
    if (width && /^\d+$/.test(width.trim())) {
        width = width.trim() + 'px';
    }
    if (height && /^\d+$/.test(height.trim())) {
        height = height.trim() + 'px';
    }
    
    let attributes = `src="${src.replace(/"/g, '&quot;')}"`;
    
    if (width) {
        attributes += ` width="${width.replace(/"/g, '&quot;')}"`;
    }
    if (height) {
        attributes += ` height="${height.replace(/"/g, '&quot;')}"`;
    }
    
    const indent = Blockly.HTML.indent();
    return `${indent}<img ${attributes}>\n`;
};

Blockly.HTML.forBlock['html_link'] = function(block) {
    const url = Blockly.HTML.valueToCode(block, 'URL', Blockly.HTML.ORDER_ATOMIC) || '""';
    const text = Blockly.HTML.valueToCode(block, 'TEXT', Blockly.HTML.ORDER_ATOMIC) || '';
    const cleanUrl = url.replace(/^["']|["']$/g, '');
    const cleanText = text.replace(/^["']|["']$/g, '');
    const indent = Blockly.HTML.indent();
    return `${indent}<a href="${cleanUrl.replace(/"/g, '&quot;')}">${cleanText}</a>\n`;
};

Blockly.HTML.forBlock['html_list'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const indent = Blockly.HTML.indent();
    const items = Blockly.HTML.statementToCode(block, 'ITEMS') || '';
    // Items haben bereits die richtige Einrückung durch statementToCode
    const indentedItems = items ? '\n' + items + indent : '';
    return `${indent}<${type}>${indentedItems}</${type}>\n`;
};

Blockly.HTML.forBlock['html_list_item'] = function(block) {
    const text = Blockly.HTML.valueToCode(block, 'TEXT', Blockly.HTML.ORDER_ATOMIC) || '';
    const cleanText = text.replace(/^["']|["']$/g, '');
    const indent = Blockly.HTML.indent();
    return `${indent}<li>${cleanText}</li>\n`;
};

