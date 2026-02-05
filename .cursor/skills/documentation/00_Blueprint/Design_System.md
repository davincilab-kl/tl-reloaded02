---
title: Design System
description: Modern UI Components, Colors, Typography und Button-Prioritäten
enableToc: true
tags:
  - blueprint
  - design
---

# 🎨 Design System

> [!important] Design-Prinzipien
> Das Design-System basiert auf einem **modernen Blau-Farbschema** mit klarer visueller Hierarchie und state-of-the-art UI-Patterns.

---

## 🎨 Farben

### Primär-Farben (Blau-Spektrum)
- **Blau Primary** (`#3b82f6`) - Haupt-Akzentfarbe, primäre Buttons, Links
- **Blau Dark** (`#2563eb`) - Hover-States, aktive Zustände
- **Blau Light** (`#60a5fa`) - Sekundäre Akzente, Icons
- **Blau Subtle** (`#dbeafe`) - Hintergründe, Highlights, Badges
- **Blau Ultra Light** (`#eff6ff`) - Subtile Hintergründe, Hover-States

### Neutrale Farben
- **Weiß** (`#FFFFFF`) - Haupt-Hintergrund, Cards, Buttons
- **Grau 50** (`#f9fafb`) - Subtile Hintergründe, Alternating Rows
- **Grau 100** (`#f3f4f6`) - Borders, Dividers, Input-Backgrounds
- **Grau 200** (`#e5e7eb`) - Subtile Borders
- **Grau 500** (`#6b7280`) - Sekundärer Text, Placeholders
- **Grau 700** (`#374151`) - Tertiärer Text
- **Grau 900** (`#111827`) - Primärer Text, Überschriften

### Text-Farben
- **Primary Text:** `#111827` (Grau 900) - Haupt-Text auf weißem Hintergrund
- **Secondary Text:** `#6b7280` (Grau 500) - Sekundärer Text, Captions
- **Tertiary Text:** `#374151` (Grau 700) - Weniger wichtige Texte
- **White Text:** `#FFFFFF` - Text auf farbigen Hintergründen (Blau, etc.)

### Status-Farben
- **Erfolg** (`#10b981`) - Erfolg, Bestätigungen, positive Aktionen
- **Erfolg Light** (`#d1fae5`) - Erfolg-Hintergründe
- **Warnung** (`#f59e0b`) - Warnungen, Aufmerksamkeit erforderlich
- **Warnung Light** (`#fef3c7`) - Warnung-Hintergründe
- **Fehler** (`#ef4444`) - Fehler, kritische Meldungen
- **Fehler Light** (`#fee2e2`) - Fehler-Hintergründe
- **Info** (`#3b82f6`) - Informative Meldungen (verwendet Blau Primary)

---

## 🔘 Button-Prioritäten

### 1. Primary (Höchste Priorität) - CTA
- **Farbe:** Blau Primary (`#3b82f6`) mit weißem Text
- **Hover:** Blau Dark (`#2563eb`) mit subtiler Shadow-Erhöhung
- **Verwendung:** Haupt-Aktionen, CTAs, wichtige Entscheidungen
- **Position:** Prominent platziert, oben oder zentral
- **Beispiele:** "Jetzt registrieren", "Kurs buchen", "Zahlung abschließen"

```tsx
// Primary Button
<button className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98]">
  Primary Action
</button>
```

### 2. Secondary - Sekundäre Aktion
- **Farbe:** Weiß mit blauem Border (`#3b82f6`)
- **Text:** Blau Primary (`#3b82f6`)
- **Hover:** Blau Ultra Light Hintergrund (`#eff6ff`)
- **Verwendung:** Alternative Aktionen, weniger wichtige Entscheidungen
- **Position:** Neben Primary Buttons
- **Beispiele:** "Zurück", "Überspringen", "Später"

```tsx
// Secondary Button
<button className="bg-white text-blue-500 border-2 border-blue-500 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 active:scale-[0.98]">
  Secondary Action
</button>
```

### 3. Tertiary - Subtile Aktion
- **Farbe:** Transparent/Weiß mit grauem Text
- **Text:** Grau 700 (`#374151`)
- **Hover:** Grau 100 Hintergrund (`#f3f4f6`)
- **Verwendung:** Weniger wichtige Aktionen, Links als Buttons
- **Position:** Unten oder in Sidebar
- **Beispiele:** "Abbrechen", "Mehr erfahren", "Details"

```tsx
// Tertiary Button
<button className="bg-transparent text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]">
  Tertiary Action
</button>
```

### 4. Ghost - Minimale Aktion
- **Farbe:** Vollständig transparent
- **Text:** Grau 500 (`#6b7280`)
- **Hover:** Grau 50 Hintergrund (`#f9fafb`)
- **Verwendung:** Minimale Aktionen, Icon-Buttons, Admin-Funktionen
- **Position:** In Toolbars, Sidebars, als Icon-Buttons
- **Beispiele:** "Löschen", "Bearbeiten", "Einstellungen"

```tsx
// Ghost Button
<button className="bg-transparent text-gray-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-700 transition-all duration-200">
  Ghost Action
</button>
```

---

## 📝 Typography

### Überschriften
- **H1:** `text-5xl md:text-6xl font-bold text-gray-900 tracking-tight` - Hero-Überschriften
- **H2:** `text-4xl md:text-5xl font-bold text-gray-900 tracking-tight` - Sektions-Überschriften
- **H3:** `text-3xl font-semibold text-gray-900` - Unter-Sektionen
- **H4:** `text-2xl font-semibold text-gray-900` - Cards, Modals
- **H5:** `text-xl font-semibold text-gray-900` - Kleinere Überschriften
- **H6:** `text-lg font-semibold text-gray-900` - Labels, Captions

### Text
- **Body Large:** `text-lg text-gray-900 leading-relaxed` - Wichtiger Body-Text
- **Body:** `text-base text-gray-900 leading-relaxed` - Standard Body-Text
- **Body Small:** `text-sm text-gray-700 leading-relaxed` - Sekundärer Text
- **Caption:** `text-xs text-gray-500` - Captions, Meta-Informationen
- **Link:** `text-blue-500 hover:text-blue-600 underline-offset-4 hover:underline transition-colors` - Links

### Font Family
- **Primary:** `font-sans` - Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace:** `font-mono` - "Fira Code", "Courier New", monospace (für Code)

### Font Weights
- **Light:** `font-light` (300)
- **Normal:** `font-normal` (400)
- **Medium:** `font-medium` (500)
- **Semibold:** `font-semibold` (600)
- **Bold:** `font-bold` (700)

---

## 🧩 UI Components

### Cards (Modern mit Subtle Shadow)
```tsx
// Standard Card
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
  {/* Card Content */}
</div>

// Elevated Card (für wichtige Inhalte)
<div className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 border border-gray-100 p-8">
  {/* Card Content */}
</div>

// Interactive Card (klickbar)
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all duration-200">
  {/* Card Content */}
</div>
```

### Input Fields (Modern mit Focus States)
```tsx
// Standard Input
<input 
  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400"
  type="text"
  placeholder="Placeholder Text"
/>

// Input mit Label
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Label
  </label>
  <input 
    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    type="text"
  />
</div>

// Input mit Error State
<input 
  className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 transition-all duration-200"
  type="text"
/>
```

### Buttons (Standard-Größen)
- **XSmall:** `px-3 py-1.5 text-xs` - Icon-Buttons, Badges
- **Small:** `px-4 py-2 text-sm` - Kompakte Buttons
- **Medium:** `px-6 py-3 text-base` - Standard (am häufigsten verwendet)
- **Large:** `px-8 py-4 text-lg` - Prominente CTAs
- **XLarge:** `px-10 py-5 text-xl` - Hero-CTAs

### Badges & Tags
```tsx
// Primary Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
  Badge
</span>

// Success Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
  Success
</span>
```

### Dividers
```tsx
// Standard Divider
<hr className="border-0 border-t border-gray-200" />

// Spaced Divider
<div className="my-8 border-t border-gray-200" />
```

---

## 📐 Layout

### Container
- **Max Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Narrow Container:** `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`
- **Wide Container:** `max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8`

### Grid System
```tsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Grid Items */}
</div>

// Auto-fit Grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  {/* Grid Items */}
</div>
```

### Spacing System
- Konsistente Abstände mit Tailwind: `4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Section Spacing: `py-12 md:py-16 lg:py-24`
- Container Padding: `px-4 sm:px-6 lg:px-8`

---

## 🎯 Design-Tokens

### Spacing Scale
- `space-1` = 4px
- `space-2` = 8px
- `space-3` = 12px
- `space-4` = 16px
- `space-6` = 24px
- `space-8` = 32px
- `space-12` = 48px
- `space-16` = 64px

### Border Radius
- **None:** `rounded-none` (0px)
- **Small:** `rounded` (4px)
- **Medium:** `rounded-lg` (8px)
- **Large:** `rounded-xl` (12px) - **Standard für Buttons, Inputs**
- **XLarge:** `rounded-2xl` (16px) - **Standard für Cards**
- **Full:** `rounded-full` - **Für Pills, Badges, Avatare**

### Shadows (Modern & Subtle)
- **None:** `shadow-none`
- **Small:** `shadow-sm` - Subtile Elevation
- **Medium:** `shadow-md` - Standard für Cards
- **Large:** `shadow-lg` - Wichtige Cards
- **XLarge:** `shadow-xl` - Modals, Dropdowns
- **Colored:** `shadow-lg shadow-blue-500/25` - Für Primary Buttons

### Transitions
- **Standard:** `transition-all duration-200` - Für Buttons, Cards
- **Fast:** `transition-all duration-150` - Für Hover-States
- **Slow:** `transition-all duration-300` - Für komplexe Animationen

---

## ✨ Moderne Effekte

### Gradient-Buttons (Optional für Hero-CTAs)
```tsx
<button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200">
  Gradient CTA
</button>
```

### Glassmorphism (Optional für Modals, Overlays)
```tsx
<div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
  {/* Glassmorphism Content */}
</div>
```

### Hover-Lift Effect
```tsx
<div className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
  {/* Content with lift effect */}
</div>
```

---

## 💡 Usage Guidelines

> [!tip] Implementation Best Practices
> - **Konsistenz:** Immer die definierten Button-Prioritäten verwenden
> - **Hierarchie:** Primary > Secondary > Tertiary > Ghost
> - **Text-Farbe:** Standard-Text ist **Grau 900** auf weißem Hintergrund
> - **Text in Buttons:** **Weiß** in Primary Buttons, **Blau** in Secondary Buttons
> - **Farbe:** Blau ist die einzige primäre Akzentfarbe - konsistent verwenden
> - **Shadows:** Subtile, moderne Shadows verwenden - nicht zu stark
> - **Border Radius:** `rounded-xl` für Buttons/Inputs, `rounded-2xl` für Cards
> - **Transitions:** Immer smooth Transitions für interaktive Elemente
> - **Spacing:** Konsistente Abstände mit Tailwind-Spacing-Scale

> [!important] Design-Philosophie
> - **Minimalistisch:** Weniger ist mehr - klare Hierarchie
> - **Modern:** State-of-the-art UI-Patterns, subtile Effekte
> - **Konsistent:** Einheitliches Design-System durchgehend
> - **Accessible:** Gute Kontraste, klare States, fokussierbare Elemente
> - **Performance:** Smooth Transitions, optimierte Shadows

> [!warning] Vermeiden
> - Keine roten Buttons oder CTAs (nur Blau als Primärfarbe)
> - Keine zu starken Shadows oder überladene Effekte
> - Keine inkonsistenten Border-Radius-Werte
> - Keine harten Transitions ohne duration
> - Keine bunten, inkonsistenten Farben
