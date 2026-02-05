---
title: Login
description: Benutzer-Anmeldung
enableToc: true
tags:
  - features
  - auth
---

# 🔐 Login

> [!abstract] User Story
> Als Benutzer möchte ich mich mit meinen Credentials anmelden, um auf meine Daten zuzugreifen.

## Verwandte Features

- **Register:** [[01_Features/Auth/Register|Register]] - Registrierung für neue Benutzer
- **Password Reset:** [[01_Features/Auth/Password_Reset|Password Reset]] - Passwort zurücksetzen
- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Registrierungs-Prozess für Lehrer
- **Student Dashboard:** [[01_Features/Dashboard/Student/Overview|Student Dashboard]] - Nach Login
- **Teacher Dashboard:** [[01_Features/Dashboard/Teacher/Overview|Teacher Dashboard]] - Nach Login
- **Admin Dashboard:** [[01_Features/Dashboard/Admin/Overview|Admin Dashboard]] - Nach Login

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell mit Authentifizierung

## Multi-Role Authentication System

Die Plattform unterstützt ein Multi-Rollen-System mit drei verschiedenen Rollen und unterschiedlichen Anmeldeverfahren:

### 👨‍🏫 Lehrer/Lehrerin (Teacher)
- **Anmeldeverfahren:** E-Mail-Adresse oder Benutzername + Passwort
- **Zugriff:** Vollzugriff auf Lehrer-Funktionen & Schüler Funktionen
- **Berechtigungen:** Kann Schüler in Klassen erstellen und verwalten, kann Schülerpasswörter zurücksetzen

### 👨‍🎓 Schüler/Schülerin (Student)
- **Anmeldeverfahren:** Persönliches Schülerpasswort (einzigartiges Passwort)
- **Zugriff:** Eingeschränkter Zugriff auf Schüler-Funktionen
- **Verwaltung:** Werden von Lehrern erstellt und verwaltet

### 👨‍💼 Admin (Administrator)
- **Anmeldeverfahren:** Verwendet normales Teacher-Login-Formular (kein separates Login-Formular nötig)
- **Zugriff:** Vollzugriff auf Admin-Funktionen und Systemverwaltung
- **Rolle:** Separate Admin-Rolle mit administrativen Berechtigungen (zusätzlich zu Teacher & Schüler-Funktionen)

## Login-Interface

### Benutzerrollen-Auswahl
- Zwei Tab-Buttons zur Auswahl:
  - "Lehrerin oder Lehrer" (Teacher)
  - "Schülerin oder Schüler" (Student)

### Teacher Login
- **Eingabefelder:**
  - Benutzername oder E-Mail
  - Passwort*
- **Zusätzliche Funktionen:**
  - "Passwort vergessen?" Link

### Student Login
- **Titel:** "Schülerpasswort Eingabe"
- **Anweisung:** "Melde dich immer mit deinem persönlichen Schülerpasswort an."
- **Eingabefeld:** Schülerpasswort eingeben
- **Hinweis:** "Hast du dein Passwort vergessen? Wende dich an deinen Lehrer."
- **Siehe:** [[01_Features/Auth/Student_Password_System|Student Password System]] für Details zum Schülerpasswort-System