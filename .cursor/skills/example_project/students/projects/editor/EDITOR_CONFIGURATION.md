# Scratch Editor Konfiguration über URL-Parameter

Der Scratch Editor kann über URL-Parameter konfiguriert werden, um bestimmte UI-Elemente auszublenden. Dies ist besonders nützlich, wenn der Editor in verschiedenen Kontexten verwendet wird (z.B. in Lektionen, wo bestimmte Funktionen nicht benötigt werden).

## Verwendung

### Basis-URL
```
/students/projects/editor/?project_id=123
```

### Mit Konfigurations-Parametern
```
/students/projects/editor/?project_id=123&hide_save=1&hide_load=1&hide_publish=1
```

## Verfügbare Parameter

### Menü-Buttons

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `hide_save=1` | Versteckt den "Speichern"-Button | `?hide_save=1` |
| `hide_load=1` | Versteckt den "Laden"-Button | `?hide_load=1` |
| `hide_publish=1` | Versteckt den "Veröffentlichen"-Button | `?hide_publish=1` |
| `hide_file_menu=1` | Versteckt das Datei-Menü | `?hide_file_menu=1` |
| `hide_edit_menu=1` | Versteckt das Bearbeiten-Menü | `?hide_edit_menu=1` |
| `hide_tutorials=1` | Versteckt den Tutorials-Button | `?hide_tutorials=1` |

### Editor-Header

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `hide_back_button=1` | Versteckt den "Zurück"-Button im Header | `?hide_back_button=1` |
| `hide_title=1` | Versteckt das Titel-Eingabefeld im Header | `?hide_title=1` |

### Tabs

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `hide_code_tab=1` | Versteckt den "Code"-Tab | `?hide_code_tab=1` |
| `hide_costumes_tab=1` | Versteckt den "Kostüme"-Tab | `?hide_costumes_tab=1` |
| `hide_sounds_tab=1` | Versteckt den "Sounds"-Tab | `?hide_sounds_tab=1` |

### Libraries

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `hide_sprite_library=1` | Versteckt die Sprite-Bibliothek | `?hide_sprite_library=1` |
| `hide_backdrop_library=1` | Versteckt die Hintergrund-Bibliothek | `?hide_backdrop_library=1` |
| `hide_sound_library=1` | Versteckt die Sound-Bibliothek | `?hide_sound_library=1` |
| `hide_extension_library=1` | Versteckt die Erweiterungs-Bibliothek | `?hide_extension_library=1` |
| `hide_extension_button=1` | Versteckt den Erweiterungen-Button | `?hide_extension_button=1` |

### Modus

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `mode=full` | Vollständiger Editor (Standard) | `?mode=full` |
| `mode=blocks-only` | Nur Blöcke anzeigen | `?mode=blocks-only` |
| `mode=player-only` | Nur Player-Modus | `?mode=player-only` |

### Block-Kategorien

| Parameter | Beschreibung | Beispiel |
|-----------|--------------|----------|
| `hide_category_motion=1` | Versteckt die "Bewegung"-Kategorie | `?hide_category_motion=1` |
| `hide_category_looks=1` | Versteckt die "Aussehen"-Kategorie | `?hide_category_looks=1` |
| `hide_category_sound=1` | Versteckt die "Klang"-Kategorie | `?hide_category_sound=1` |
| `hide_category_event=1` | Versteckt die "Ereignisse"-Kategorie | `?hide_category_event=1` |
| `hide_category_control=1` | Versteckt die "Steuerung"-Kategorie | `?hide_category_control=1` |
| `hide_category_sensing=1` | Versteckt die "Fühlen"-Kategorie | `?hide_category_sensing=1` |
| `hide_category_operators=1` | Versteckt die "Operatoren"-Kategorie | `?hide_category_operators=1` |
| `hide_category_data=1` | Versteckt die "Variablen"-Kategorie | `?hide_category_data=1` |
| `hide_category_procedures=1` | Versteckt die "Meine Blöcke"-Kategorie | `?hide_category_procedures=1` |

## Beispiele

### Minimaler Editor für Lektionen
Versteckt alle unnötigen Elemente für eine einfache Lektion:
```
/students/projects/editor/?project_id=123&hide_save=1&hide_load=1&hide_publish=1&hide_file_menu=1&hide_edit_menu=1&hide_tutorials=1&hide_back_button=1&hide_sprite_library=1&hide_backdrop_library=1&hide_sound_library=1&hide_extension_library=1
```

### Nur Code-Tab
Zeigt nur den Code-Tab an:
```
/students/projects/editor/?project_id=123&hide_costumes_tab=1&hide_sounds_tab=1
```

### Nur Blöcke
Zeigt nur die Blöcke an (ohne Tabs):
```
/students/projects/editor/?project_id=123&mode=blocks-only
```

### Bestimmte Block-Kategorien ausblenden
Zeigt nur bestimmte Block-Kategorien (z.B. nur Bewegung und Aussehen):
```
/students/projects/editor/?project_id=123&hide_category_sound=1&hide_category_event=1&hide_category_control=1&hide_category_sensing=1&hide_category_operators=1&hide_category_data=1&hide_category_procedures=1
```

### Einfacher Editor für Anfänger
Versteckt erweiterte Kategorien für Anfänger:
```
/students/projects/editor/?project_id=123&hide_category_operators=1&hide_category_data=1&hide_category_procedures=1
```

## Integration in Lektionen

### PHP-Beispiel
```php
// In einer Lektion
$editorUrl = '/students/projects/editor/?project_id=' . $project_id;
$editorUrl .= '&hide_save=1';
$editorUrl .= '&hide_load=1';
$editorUrl .= '&hide_publish=1';
$editorUrl .= '&hide_file_menu=1';
$editorUrl .= '&hide_back_button=1';

echo '<a href="' . htmlspecialchars($editorUrl) . '">Editor öffnen</a>';
```

### JavaScript-Beispiel
```javascript
// Editor mit Konfiguration öffnen
function openEditor(projectId, config) {
    const params = new URLSearchParams({
        project_id: projectId,
        ...config
    });
    window.location.href = `/students/projects/editor/?${params.toString()}`;
}

// Beispiel: Editor für Lektion öffnen
openEditor(123, {
    hide_save: '1',
    hide_load: '1',
    hide_publish: '1',
    hide_file_menu: '1',
    hide_back_button: '1'
});
```

## Hinweise

- Alle Parameter sind optional
- Parameter mit Wert `1` aktivieren die Option (Element wird ausgeblendet)
- Parameter mit Wert `0` oder fehlende Parameter deaktivieren die Option (Element wird angezeigt)
- Mehrere Parameter können kombiniert werden
- Die Konfiguration wird sowohl in PHP als auch in JavaScript verarbeitet

## Technische Details

- Die Konfiguration wird in `index.php` gelesen und an JavaScript weitergegeben
- Die Scratch GUI liest die Parameter aus der URL
- UI-Elemente werden basierend auf der Konfiguration gerendert oder ausgeblendet
- Die Konfiguration wird auch über `postMessage` an das iframe weitergegeben (falls nötig)

