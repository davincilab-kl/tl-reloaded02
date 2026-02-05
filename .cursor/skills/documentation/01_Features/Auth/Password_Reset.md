---
title: Password Reset
description: Passwort zurücksetzen
enableToc: true
tags:
  - features
  - auth
---

# 🔑 Password Reset

> [!abstract] User Story
> Als Benutzer möchte ich mein Passwort zurücksetzen, wenn ich es vergessen habe.

## Verwandte Features

- **Login:** [[01_Features/Auth/Login|Login]] - Anmeldung nach Passwort-Reset
- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Schülerpasswort-Reset durch Lehrer
- **Class Management:** [[01_Features/Dashboard/Teacher/Class_Management|Class Management]] - Schülerpasswort-Verwaltung

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit Passwort-Reset

## Verfügbarkeit

### Teacher/Lehrer
- **Verfügbar:** Ja
- **Zugriff:** Über "Passwort vergessen?" Link auf der Login-Seite
- **Verfahren:** Standard Passwort-Reset über E-Mail

### Student/Schüler
- **Verfügbar:** Ja, über Teacher Dashboard
- **Verfahren:** Schülerpasswörter werden von Lehrern im Teacher Dashboard zurückgesetzt
- **Zugriff:** Lehrer können Schülerpasswörter für ihre Klassen verwalten und zurücksetzen

## Implementierung
- **Teacher:** Link "Passwort vergessen?" ist auf der Teacher-Login-Seite sichtbar
  - Standard E-Mail-basierter Passwort-Reset-Prozess für Lehrer
- **Student:** Passwort-Reset erfolgt durch Lehrer im Teacher Dashboard
  - Lehrer haben Zugriff auf Passwort-Reset-Funktion für Schüler ihrer Klassen