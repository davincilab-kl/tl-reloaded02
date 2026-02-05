# Scratch IDE Setup

## Voraussetzungen

- Node.js (Version 14 oder höher)
- npm (kommt mit Node.js)
- Git (für das Klonen der Repositories)

## Wichtige Entscheidung: Welche Variante?

### Variante 1: Einfache Integration (OHNE Anpassungen an VM/Blocks/Render)

**Verwenden Sie diese Variante, wenn:**
- Sie Scratch schnell integrieren möchten, ohne Anpassungen
- Keine Änderungen an scratch-vm, scratch-blocks oder scratch-render geplant sind
- Sie erst mal testen möchten, ob Scratch grundsätzlich funktioniert

**Vorteil:** Schnelle Integration, weniger Setup-Aufwand

**Nachteil:** Anpassungen an VM, Blocks oder Render sind **nicht möglich**, da diese als kompilierte npm-Packages installiert werden.

**Wichtig:** Sie können später jederzeit zu Variante 2 wechseln (siehe "Migration von Variante 1 zu Variante 2" unten).

### Variante 2: Anpassbare Integration (MIT Anpassungen an VM/Blocks/Render)

**Verwenden Sie diese Variante, wenn:**
- Sie Anpassungen an scratch-vm, scratch-blocks oder scratch-render planen
- Sie deutsche Übersetzungen, neue Blöcke oder plattform-spezifische Features benötigen
- Sie die volle Kontrolle über alle Komponenten haben möchten

**Vorteil:** Vollständige Anpassbarkeit aller Komponenten möglich.

**Empfehlung:** Starten Sie mit Variante 1, wenn Sie unsicher sind. Sie können später problemlos zu Variante 2 wechseln.

---

## Variante 1: Einfache Integration

1. **Scratch GUI klonen:**
```bash
cd /tmp
git clone https://github.com/scratchfoundation/scratch-gui.git
cd scratch-gui
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Build erstellen:**
```bash
npm run build
```

**Hinweis:** Der Wrapper greift direkt auf den `build` Ordner zu. Es ist **nicht mehr nötig**, die Build-Ausgabe zu kopieren. Der Wrapper verwendet direkt `./tmp/scratch-gui/build/index.html`.

---

## Variante 2: Anpassbare Integration (EMPFOHLEN)

### Schritt 1: Scratch-Komponenten klonen

```bash
# Erstelle einen Arbeitsordner außerhalb des Projekts
mkdir -p ~/scratch-custom
cd ~/scratch-custom

# Klone alle notwendigen Komponenten
git clone https://github.com/scratchfoundation/scratch-gui.git
git clone https://github.com/scratchfoundation/scratch-vm.git
git clone https://github.com/scratchfoundation/scratch-blocks.git
git clone https://github.com/scratchfoundation/scratch-render.git
```

### Schritt 2: Lokale Verknüpfung einrichten

```bash
cd scratch-gui

# Installiere Dependencies
npm install

# Verknüpfe die lokalen Versionen statt npm-Packages
npm link ../scratch-vm
npm link ../scratch-blocks
npm link ../scratch-render
```

### Schritt 3: Anpassungen vornehmen

Jetzt können Sie die Source-Dateien in den jeweiligen Repositories anpassen:

**scratch-blocks anpassen:**
```bash
cd ~/scratch-custom/scratch-blocks
# Bearbeite Dateien in:
# - src/blocks/ (neue Blöcke hinzufügen)
# - msg/de.json (deutsche Übersetzung)
# - core/ (Block-Definitionen)
```

**scratch-vm anpassen:**
```bash
cd ~/scratch-custom/scratch-vm
# Bearbeite Dateien in:
# - src/engine/ (VM-Logik)
# - src/blocks/ (Block-Implementierungen für neue Blöcke)
```

**scratch-render anpassen:**
```bash
cd ~/scratch-custom/scratch-render
# Bearbeite Dateien in:
# - src/ (Rendering-Logik, Branding)
```

### Schritt 4: Build mit Anpassungen

```bash
cd ~/scratch-custom/scratch-gui

# Nach jeder Änderung in den Dependencies:
cd ../scratch-vm && npm run build && cd ../scratch-gui
cd ../scratch-blocks && npm run build && cd ../scratch-gui
cd ../scratch-render && npm run build && cd ../scratch-gui

# Dann Scratch GUI builden
npm run build

# Build-Ausgabe wird direkt verwendet - keine Kopie mehr nötig!
# Der Wrapper greift direkt auf ./tmp/scratch-gui/build/index.html zu
```

### Schritt 5: Automatisierung (Optional)

Erstellen Sie ein Build-Script `build-scratch.sh`:

```bash
#!/bin/bash
SCRATCH_DIR=~/scratch-custom
PROJECT_DIR=/path/to/TalentsLounge/students/projects/editor/scratch

cd $SCRATCH_DIR/scratch-vm && npm run build
cd $SCRATCH_DIR/scratch-blocks && npm run build
cd $SCRATCH_DIR/scratch-render && npm run build
cd $SCRATCH_DIR/scratch-gui && npm run build

# Build-Ausgabe wird direkt verwendet - keine Kopie mehr nötig!
# Der Wrapper greift direkt auf ./tmp/scratch-gui/build/index.html zu

echo "Build abgeschlossen!"
```

---

## Struktur nach dem Build

Der Wrapper greift direkt auf den Build-Ordner zu:

```
students/projects/editor/tmp/scratch-gui/build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── ...
```

**Wichtig:** Es ist nicht mehr nötig, die Build-Ausgabe zu kopieren. Der Wrapper verwendet direkt `./tmp/scratch-gui/build/index.html`.

## Anpassungsmöglichkeiten (nur Variante 2)

### scratch-blocks
- **Neue Blöcke hinzufügen:** `scratch-blocks/src/blocks/`
- **Deutsche Übersetzung:** `scratch-blocks/msg/de.json`
- **Block-Kategorien anpassen:** `scratch-blocks/src/core/toolbox.js`
- **Progressive Block-Freischaltung:** Anpassung in `scratch-gui/src/lib/toolbox-xml.js`

### scratch-vm
- **Neue Block-Implementierungen:** `scratch-vm/src/blocks/`
- **Plattform-spezifische Blöcke:** Eigene Block-Definitionen in `scratch-vm/src/blocks/`
- **Analytics/Tracking:** Anpassung in `scratch-vm/src/engine/`

### scratch-render
- **Rendering-Optimierungen:** `scratch-render/src/`
- **Branding:** Anpassung der Standard-Farben und Logos

### scratch-gui
- **UI-Anpassungen:** `scratch-gui/src/components/`
- **Storage-Adapter:** `scratch-gui/src/lib/storage/` (für lokale Speicherung)
- **Design-Integration:** `scratch-gui/src/components/gui.css`

## Workflow für Anpassungen (Variante 2)

1. **Änderung in Komponente** (z.B. scratch-blocks)
2. **Build der Komponente** (`npm run build` in der Komponente)
3. **Build von scratch-gui** (`npm run build` in scratch-gui)
4. **Testen** in der Browser-Konsole (Build-Ausgabe wird direkt verwendet)

## Migration von Variante 1 zu Variante 2

Falls Sie mit Variante 1 gestartet haben und später doch Anpassungen an den anderen Komponenten benötigen, können Sie problemlos zu Variante 2 wechseln:

### Schritt 1: Klone die anderen Komponenten

```bash
# Gehe zu deinem scratch-gui Ordner (z.B. /tmp/scratch-gui)
cd /tmp/scratch-gui
cd ..

# Klone die anderen Komponenten separat
git clone https://github.com/scratchfoundation/scratch-vm.git
git clone https://github.com/scratchfoundation/scratch-blocks.git
git clone https://github.com/scratchfoundation/scratch-render.git
```

### Schritt 2: Entferne npm-Packages und verknüpfe lokal

```bash
cd scratch-gui

# Entferne die npm-Packages (optional, aber empfohlen)
npm uninstall scratch-vm scratch-blocks scratch-render

# Verknüpfe die lokalen Versionen
npm link ../scratch-vm
npm link ../scratch-blocks
npm link ../scratch-render
```

### Schritt 3: Baue die Komponenten

```bash
# Baue alle Komponenten
cd ../scratch-vm && npm install && npm run build && cd ../scratch-gui
cd ../scratch-blocks && npm install && npm run build && cd ../scratch-gui
cd ../scratch-render && npm install && npm run build && cd ../scratch-gui
```

### Schritt 4: Baue scratch-gui neu

```bash
cd scratch-gui
npm run build
# Build-Ausgabe wird direkt verwendet - keine Kopie mehr nötig!
# Der Wrapper greift direkt auf ./tmp/scratch-gui/build/index.html zu
```

**Fertig!** Jetzt können Sie die Source-Dateien der Komponenten bearbeiten und nach Änderungen neu builden.

## Hinweise

- **Variante 1:** Schnell, aber keine Anpassungen an VM/Blocks/Render möglich
- **Variante 2:** Mehr Aufwand, aber vollständige Anpassbarkeit
- **Migration:** Sie können jederzeit von Variante 1 zu Variante 2 wechseln
- **Git-Submodules:** Für bessere Versionskontrolle können Sie Git-Submodules verwenden
- **Fork erstellen:** Für eigene Anpassungen empfiehlt es sich, einen Fork der Repositories zu erstellen
- **Versionierung:** Dokumentieren Sie, welche Versionen der Komponenten Sie verwenden
- **Updates:** Bei Updates der Scratch-Komponenten müssen Anpassungen möglicherweise migriert werden

