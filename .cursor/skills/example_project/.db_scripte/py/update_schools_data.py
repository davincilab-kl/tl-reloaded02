import mysql.connector
import random
from datetime import datetime, timedelta

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

# Österreichische Bundesländer mit ihren Landeshauptstädten
bundesland_hauptstaedte = {
    'Wien': 'Wien',
    'Niederösterreich': 'St. Pölten',
    'Oberösterreich': 'Linz',
    'Salzburg': 'Salzburg',
    'Tirol': 'Innsbruck',
    'Vorarlberg': 'Bregenz',
    'Kärnten': 'Klagenfurt',
    'Steiermark': 'Graz',
    'Burgenland': 'Eisenstadt'
}

# Schularten
schularten = [
    'AHS', 'BRG', 'Mittelschule', 'PTS', 'PMS', 'HTL', 'HAK', 'HLW', 'BORG', 'Gymnasium'
]

# Datumsbereich: 10.09.2025 bis 19.10.2025
start_date = datetime(2025, 9, 10)
end_date = datetime(2025, 10, 19)

def get_random_date():
    """Generiert ein zufälliges Datum zwischen start_date und end_date"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    random_date = start_date + timedelta(days=random_days)
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

# 1. Prüfen ob die neuen Spalten existieren, falls nicht erstellen
new_columns = [
    ('schulart', 'VARCHAR(100)'),
    ('ort', 'VARCHAR(255)'),
    ('erstelldatum', 'DATETIME'),
    ('letzter_login', 'DATETIME'),
    ('info_webinar_teilnahme', 'BOOLEAN'),
    ('foerderung', 'BOOLEAN')
]

for column_name, column_type in new_columns:
    try:
        cursor.execute(f"ALTER TABLE schools ADD COLUMN {column_name} {column_type}")
        print(f"Spalte '{column_name}' wurde zur Tabelle 'schools' hinzugefügt.")
    except mysql.connector.Error as err:
        if "Duplicate column name" in str(err):
            print(f"Spalte '{column_name}' existiert bereits.")
        else:
            print(f"Fehler beim Hinzufügen der Spalte '{column_name}': {err}")

# 2. Alle Schulen abrufen
cursor.execute("SELECT id, bundesland, name FROM schools")
schools = cursor.fetchall()
print(f"Gefunden: {len(schools)} Schulen")

# 3. Schulen aktualisieren
updated_count = 0
for school_id, bundesland, name in schools:
    # Landeshauptstadt basierend auf Bundesland
    ort = bundesland_hauptstaedte.get(bundesland, 'Wien')
    
    # Schulart aus dem ersten Wort des Schulnamens extrahieren
    schulart = name.split()[0] if name else 'N/A'
    
    # Zufällige Daten
    erstelldatum = get_random_date()
    letzter_login = get_random_date()
    
    # Logik für Teilnahme und Förderung:
    # - Wenn Förderung = 1, dann muss auch Teilnahme = 1 sein
    # - Wenn Teilnahme = 1, kann Förderung 0 oder 1 sein
    # - Wenn Teilnahme = 0, dann muss Förderung = 0 sein
    
    # Zuerst Teilnahme entscheiden (70% Wahrscheinlichkeit für 1)
    info_webinar_teilnahme = 1 if random.random() < 0.7 else 0
    
    # Förderung basierend auf Teilnahme
    if info_webinar_teilnahme == 1:
        # Wenn Teilnahme = 1, kann Förderung 0 oder 1 sein (50% für 1)
        foerderung = 1 if random.random() < 0.5 else 0
    else:
        # Wenn Teilnahme = 0, muss Förderung = 0 sein
        foerderung = 0
    
    # Update-Query
    update_sql = """
    UPDATE schools 
    SET schulart = %s, 
        ort = %s, 
        erstelldatum = %s, 
        letzter_login = %s, 
        info_webinar_teilnahme = %s, 
        foerderung = %s 
    WHERE id = %s
    """
    
    cursor.execute(update_sql, (
        schulart,
        ort,
        erstelldatum,
        letzter_login,
        info_webinar_teilnahme,
        foerderung,
        school_id
    ))
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 50 == 0:
        print(f"{updated_count} Schulen aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Schulen wurden erfolgreich aktualisiert.")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
