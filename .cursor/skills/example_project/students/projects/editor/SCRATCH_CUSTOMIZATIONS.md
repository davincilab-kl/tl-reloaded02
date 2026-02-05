# Scratch GUI Anpassungen

Dieses Dokument beschreibt die Anpassungen, die an der Scratch GUI vorgenommen werden sollen.

## Schnellstart

Für die Entfernung der UI-Elemente (Account-Info, Backpack, Tutorials, Debug) siehe: **[REMOVE_UI_ELEMENTS.md](REMOVE_UI_ELEMENTS.md)**

## Voraussetzung

Diese Anpassungen erfordern **Variante 2** (Anpassbare Integration) aus `README_SCRATCH_SETUP.md`, da die Source-Dateien bearbeitet werden müssen.

## Anpassungen

### 1. Entfernen von UI-Elementen aus dem Menübalken

Folgende Elemente sollen aus der Scratch GUI entfernt werden:
- Account-Info-Group-Div (Benutzer-Account-Informationen)
- Backpack-Button
- Tutorials-Button
- Debug-Button

### 2. Dateien, die angepasst werden müssen

#### Account-Info-Group entfernen

**Datei:** `scratch-gui/src/components/menu-bar/menu-bar.jsx`

Suchen Sie nach dem Element mit der Klasse `menu-bar_account-info-group` oder ähnlich und entfernen/kommentieren Sie es aus.

**Beispiel:**
```jsx
// Entfernen oder auskommentieren:
{/* <div className="menu-bar_account-info-group">
    ... Account-Info-Inhalt ...
</div> */}
```

#### Backpack-Button entfernen

**Datei:** `scratch-gui/src/components/menu-bar/menu-bar.jsx`

Suchen Sie nach dem Backpack-Button (meist mit `backpack` oder `menu-bar_backpack` Klasse) und entfernen Sie ihn.

**Beispiel:**
```jsx
// Entfernen oder auskommentieren:
{/* <button className="menu-bar_backpack">
    ... Backpack-Button ...
</button> */}
```

#### Tutorials-Button entfernen

**Datei:** `scratch-gui/src/components/menu-bar/menu-bar.jsx`

Suchen Sie nach dem Tutorials-Button (meist mit `tutorials` oder `menu-bar_tutorials` Klasse) und entfernen Sie ihn.

**Beispiel:**
```jsx
// Entfernen oder auskommentieren:
{/* <button className="menu-bar_tutorials">
    ... Tutorials-Button ...
</button> */}
```

#### Debug-Button entfernen

**Datei:** `scratch-gui/src/components/menu-bar/menu-bar.jsx`

Suchen Sie nach dem Debug-Button (meist mit `debug` oder `menu-bar_debug` Klasse) und entfernen Sie ihn.

**Beispiel:**
```jsx
// Entfernen oder auskommentieren:
{/* <button className="menu-bar_debug">
    ... Debug-Button ...
</button> */}
```

### 3. Workflow

1. **Öffnen Sie die Datei:**
   ```bash
   cd ~/scratch-custom/scratch-gui
   # Öffnen Sie src/components/menu-bar/menu-bar.jsx in einem Editor
   ```

2. **Suchen Sie nach den Elementen:**
   - Suchen Sie nach `account-info-group`, `backpack`, `tutorials`, `debug`
   - Oder suchen Sie nach den entsprechenden Klassen/IDs

3. **Entfernen Sie die Elemente:**
   - Kommentieren Sie die entsprechenden JSX-Blöcke aus
   - Oder entfernen Sie sie komplett

4. **Build neu erstellen:**
   ```bash
   cd ~/scratch-custom/scratch-gui
   npm run build
   cp -r build/* /path/to/TalentsLounge/students/projects/editor/scratch/
   ```

### 4. Alternative: CSS-basiertes Ausblenden

Falls die Elemente nicht einfach entfernt werden können, können Sie sie auch per CSS ausblenden:

**Datei:** `scratch-gui/src/components/gui.css` oder eigene CSS-Datei

```css
/* Account-Info-Group ausblenden */
.menu-bar_account-info-group {
    display: none !important;
}

/* Backpack-Button ausblenden */
.menu-bar_backpack,
button[class*="backpack"] {
    display: none !important;
}

/* Tutorials-Button ausblenden */
.menu-bar_tutorials,
button[class*="tutorials"] {
    display: none !important;
}

/* Debug-Button ausblenden */
.menu-bar_debug,
button[class*="debug"] {
    display: none !important;
}
```

**Hinweis:** CSS-basiertes Ausblenden ist weniger sauber, aber schneller umzusetzen. Die Elemente sind dann zwar noch im DOM, aber nicht sichtbar.

## Spezifische Anleitung für die genannten Elemente

### Account-Info-Group

Die Account-Info-Group zeigt normalerweise den angemeldeten Benutzer an. In einer lokalen Installation ist dies nicht nötig.

**Typische Struktur:**
```jsx
<div className="menu-bar_account-info-group">
    <div className="menu-bar_user">
        {/* Benutzer-Avatar, Name, etc. */}
    </div>
</div>
```

### Backpack-Button

Der Backpack-Button ermöglicht es, Blöcke zwischen Projekten zu teilen. Für eine lokale Installation kann dies entfernt werden.

**Typische Struktur:**
```jsx
<button
    className="menu-bar_backpack"
    onClick={handleBackpackClick}
    title="Backpack"
>
    {/* Backpack-Icon */}
</button>
```

### Tutorials-Button

Der Tutorials-Button öffnet die Scratch-Tutorials. Diese können entfernt werden, wenn eigene Tutorials verwendet werden.

**Typische Struktur:**
```jsx
<button
    className="menu-bar_tutorials"
    onClick={handleTutorialsClick}
    title="Tutorials"
>
    {/* Tutorials-Icon */}
</button>
```

### Debug-Button

Der Debug-Button ist für Entwickler gedacht und kann in einer Produktionsumgebung entfernt werden.

**Typische Struktur:**
```jsx
<button
    className="menu-bar_debug"
    onClick={handleDebugClick}
    title="Debug"
>
    {/* Debug-Icon */}
</button>
```

## Testing

Nach den Änderungen:

1. **Build erstellen** (siehe Workflow oben)
2. **Im Browser testen:**
   - Öffnen Sie `students/projects/editor/index.php`
   - Prüfen Sie, ob die Elemente nicht mehr sichtbar sind
   - Testen Sie, ob die restliche Funktionalität noch funktioniert

## Troubleshooting

**Problem:** Elemente sind nach dem Build noch sichtbar
- **Lösung:** Browser-Cache leeren (Strg+Shift+R oder Cmd+Shift+R)
- **Lösung:** Prüfen Sie, ob die Build-Ausgabe korrekt kopiert wurde

**Problem:** Build schlägt fehl
- **Lösung:** Prüfen Sie die Syntax in den geänderten Dateien
- **Lösung:** Stellen Sie sicher, dass alle JSX-Tags korrekt geschlossen sind

**Problem:** Elemente sind entfernt, aber es gibt Lücken im Layout
- **Lösung:** Passen Sie das CSS/Layout an, um die Lücken zu schließen
- **Lösung:** Verwenden Sie Flexbox/Grid, um die verbleibenden Elemente neu zu positionieren

