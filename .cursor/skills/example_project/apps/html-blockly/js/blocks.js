// Custom HTML-Blöcke für Blockly definieren

Blockly.Blocks['html_document'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("HTML")
            .appendField(new Blockly.FieldTextInput("Meine Website"), "TITLE");
        this.appendStatementInput("BODY")
            .setCheck("html_element");
        this.setColour(230);
        this.setStyle('html_structure_blocks');
        this.setTooltip("Ein vollständiges HTML-Dokument");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['html_div'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Container (div)");
        this.appendStatementInput("CONTENT")
            .setCheck("html_element");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(160);
        this.setStyle('container_blocks');
        this.setTooltip("Ein Container-Element");
    }
};

Blockly.Blocks['html_heading'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Überschrift")
            .appendField(new Blockly.FieldDropdown([
                ["H1 (groß)", "h1"],
                ["H2 (mittel)", "h2"],
                ["H3 (klein)", "h3"]
            ]), "LEVEL");
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Text:");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(120);
        this.setStyle('text_blocks');
        this.setTooltip("Eine Überschrift");
    }
};

Blockly.Blocks['html_paragraph'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Absatz (p)");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(200);
        this.setStyle('text_blocks');
        this.setTooltip("Ein Textabsatz");
    }
};

Blockly.Blocks['html_text'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("Hallo Welt"), "TEXT");
        this.setOutput(true, "String");
        this.setColour(60);
        this.setStyle('text_blocks');
        this.setTooltip("Ein Text-String");
    }
};

Blockly.Blocks['html_image'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Bild (img)");
        this.appendDummyInput()
            .appendField("URL:")
            .appendField(new Blockly.FieldTextInput("https://tlr.pakeiki.at/imgs/tl_logo.png"), "SRC");
        this.appendDummyInput()
            .appendField("Breite:")
            .appendField(new Blockly.FieldTextInput(""), "WIDTH")
            .appendField("px");
        this.appendDummyInput()
            .appendField("Höhe:")
            .appendField(new Blockly.FieldTextInput(""), "HEIGHT")
            .appendField("px");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(280);
        this.setStyle('media_blocks');
        this.setTooltip("Ein Bild einfügen");
    }
};

Blockly.Blocks['html_link'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Link (a)");
        this.appendValueInput("URL")
            .setCheck("String")
            .appendField("Adresse:");
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Text:");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(40);
        this.setStyle('interaction_blocks');
        this.setTooltip("Ein Link zu einer anderen Seite");
    }
};

Blockly.Blocks['html_list'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Liste")
            .appendField(new Blockly.FieldDropdown([
                ["Aufzählung (ul)", "ul"],
                ["Nummeriert (ol)", "ol"]
            ]), "TYPE");
        this.appendStatementInput("ITEMS")
            .setCheck("list_item")
            .appendField("Elemente:");
        this.setPreviousStatement(true, "html_element");
        this.setNextStatement(true, "html_element");
        this.setColour(100);
        this.setStyle('list_blocks');
        this.setTooltip("Eine Liste");
    }
};

Blockly.Blocks['html_list_item'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("Listenelement (li)");
        this.setPreviousStatement(true, "list_item");
        this.setNextStatement(true, "list_item");
        this.setColour(100);
        this.setStyle('list_blocks');
        this.setTooltip("Ein Listenelement");
    }
};

