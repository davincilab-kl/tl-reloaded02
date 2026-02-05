---
title: Register
description: Benutzer-Registrierung
enableToc: true
tags:
  - features
  - auth
---

# 📝 Register

> [!abstract] User Story
> Als neuer Benutzer möchte ich mich registrieren, um Zugang zur Plattform zu erhalten.

## Verwandte Features

- **Login:** [[01_Features/Auth/Login|Login]] - Nach Registrierung anmelden
- **Teacher Onboarding:** [[01_Features/Auth/Teacher_Onboarding|Teacher Onboarding]] - Schulverbindung nach Registrierung
- **Password Reset:** [[01_Features/Auth/Password_Reset|Password Reset]] - Passwort zurücksetzen falls vergessen

## Data Models

- **User Model:** [[03_Data_Models/User|User Model]] - Benutzer-Datenmodell

## Registrierungs-Flow

### Willkommens-Popup
Bei der ersten Ankunft auf der Plattform erscheint ein Popup:
- **Frage:** "Bist du schon registriert?" (Are you already registered?)
- **Optionen:** 
  - "Ja" (Yes) → Weiterleitung zum Login
  - "Nein" (No) → Weiterleitung zur Registrierung

## Teacher-Registrierung

### Pflichtfelder (*)
- **Vorname*** (First name)
- **Nachname*** (Last name)
- **Bevorzugte Anrede?** (Preferred salutation)
- **E-Mail Adresse*** (Email address)
- **Mobiltelefon?*** (Mobile phone) - 
  - Format-Beispiel: +436991234567
- **Passwort*** (Password)
- **Passwort wiederholen*** (Repeat password)

### Zusätzliche Optionen
- Link: "Nicht eine Lehrkraft? Hier geht's zur Schüler-Anmeldung." (Not a teacher? Click here for student registration.)
- Newsletter-Checkbox: Einwilligung zum Erhalt von Neuigkeiten, Schulaktionen, Angeboten, Newslettern und Gewinnspielen der DaVinciLab GmbH per E-Mail
- AGB-Checkbox: "Ich habe die Teilnahmebedingungen und Datenschutzbestimmungen gelesen und akzeptiere diese." (I have read and accepted the terms of participation and data protection regulations.)

### Schüler-Registrierung
- Werden nur von Lehrern erstellt, in einer Klasse

## Rollen-System
- **Teacher:** Registrierung mit E-Mail und Passwort
- **Student:** Anmeldung mit einzigartigem Schülerpasswort (von Lehrkraft vergeben), werden von Lehrern in Klassen erstellt
- **Admin:** Separate dritte Rolle mit echten Admin-Zugriffsrechten, kann normales Teacher-Login-Formular verwenden (kein separates Login-Formular nötig)