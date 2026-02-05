# Teacher Stati - Dokumentation

Diese Datei dokumentiert alle verfügbaren Status-Werte in der `teacher_stati` Tabelle.

## Status-Übersicht

| ID | Label | Beschreibung |
|----|-------|--------------|
| 1 | `email_bestaetigen` | E-Mail bestätigen |
| 2 | `schule_verbinden` | Schule verbinden |
| 3 | `warteliste_schule` | Auf Warteliste einer Schule |
| 4 | `infowebinar_besuchen` | Schule verbunden - Infowebinar besuchen |
| 5 | `schule_letztes_jahr_aktiv` | Schule war letztes Jahr aktiv |
| 6 | `infowebinar_gebucht` | Infowebinar gebucht |
| 7 | `nicht_teilgenommen` | Nicht teilgenommen |
| 8 | `schule_aktiv` | Schule aktiv |
| 9 | `klasse_erstellt` | Klasse erstellt |
| 10 | `10_tcoins_gesammelt` | 10 T!Coins gesammelt |
| 11 | `10_schueler_5_tcoins` | 10 Schüler haben mehr als 5 T!Coins gesammelt |
| 12 | `5_projekte_erstellt` | 5 Projekte erstellt |
| 13 | `erstes_projekt_eingereicht` | Erstes eingereichtes Projekt |
| 14 | `erstes_projekt_bewertet` | Erstes Projekt mit Bewertung von Lehrkraft |
| 15 | `projekt_oeffentlich` | Projekt öffentlich |
| 16 | `projekt_3_likes` | Projekt mit 3+ Likes |
| 17 | `10_projekte_veroeffentlicht` | 10+ Projekte veröffentlicht |
| 18 | `1_schueler_100_punkte` | 1 Schüler hat 100+ Punkte |
| 19 | `3_schueler_100_punkte` | 3 Schüler haben 100+ Punkte |
| 20 | `konto_deaktiviert` | Konto deaktiviert |

## Status-Gruppen

### Registrierung & Onboarding (1-3)
- **1**: E-Mail bestätigen
- **2**: Schule verbinden
- **3**: Auf Warteliste einer Schule

### Schule & Infowebinar (4-8)
- **4**: Schule verbunden - Infowebinar besuchen
- **5**: Schule war letztes Jahr aktiv
- **6**: Infowebinar gebucht
- **7**: Nicht teilgenommen
- **8**: Schule aktiv

### Aktivität & Engagement (9-19)
- **9**: Klasse erstellt
- **10**: 10 T!Coins gesammelt
- **11**: 10 Schüler haben mehr als 5 T!Coins gesammelt
- **12**: 5 Projekte erstellt
- **13**: Erstes eingereichtes Projekt
- **14**: Erstes Projekt mit Bewertung von Lehrkraft
- **15**: Projekt öffentlich
- **16**: Projekt mit 3+ Likes
- **17**: 10+ Projekte veröffentlicht
- **18**: 1 Schüler hat 100+ Punkte
- **19**: 3 Schüler haben 100+ Punkte

### Deaktivierung (20)
- **20**: Konto deaktiviert

## Verwendung in der Codebase

Die Stati werden hauptsächlich verwendet in:
- `api/pipeline/get_teacher_details.php` - Lehrer-Details mit Status
- `api/pipeline/get_status_counts_by_date.php` - Status-Zählungen nach Datum
- `api/pipeline/get_teachers_by_status.php` - Lehrer nach Status filtern
- `api/auth/register.php` - Initialer Status bei Registrierung
- `api/auth/verify_email_code.php` - Status-Update nach E-Mail-Verifizierung
- `api/teachers/assign_school.php` - Status-Update bei Schulzuweisung

## Hinweise

- Die Status-ID 1 wird standardmäßig bei der Registrierung verwendet
- Die Status-ID 2 wird nach erfolgreicher E-Mail-Verifizierung gesetzt
- Status-Änderungen werden in der `teacher_status_history` Tabelle protokolliert

