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

print("Füge register_date Spalte zu teachers hinzu...")

# 1. Prüfen ob register_date Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN register_date DATETIME")
    print("Spalte 'register_date' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'register_date' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'register_date': {err}")

# 2. Alle Lehrer mit ihren Schulen abrufen
cursor.execute("""
    SELECT t.id, s.erstelldatum 
    FROM teachers t
    LEFT JOIN schools s ON t.school_id = s.id
    ORDER BY t.id
""")
teachers_data = cursor.fetchall()

print(f"Verarbeite {len(teachers_data)} Lehrer...")

# 3. Lehrer register_date basierend auf Schul-Erstellungsdatum setzen
updated_count = 0
with_school_date = 0
with_random_date = 0

for teacher_id, school_erstelldatum in teachers_data:
    if school_erstelldatum:
        # Schule hat Erstellungsdatum -> Lehrer bekommt ähnliches Datum (mit kleiner Variation)
        school_date = datetime.strptime(str(school_erstelldatum), '%Y-%m-%d %H:%M:%S')
        
        # Zufällige Variation: -7 bis +14 Tage vom Schul-Erstellungsdatum
        variation_days = random.randint(-7, 14)
        register_date = school_date + timedelta(days=variation_days)
        
        # Zufällige Uhrzeit hinzufügen (08:00:00 bis 18:00:00)
        random_hour = random.randint(8, 18)
        random_minute = random.randint(0, 59)
        random_second = random.randint(0, 59)
        
        register_date = register_date.replace(hour=random_hour, minute=random_minute, second=random_second)
        register_date_str = register_date.strftime('%Y-%m-%d %H:%M:%S')
        
        with_school_date += 1
    else:
        # Schule hat kein Erstellungsdatum -> zufälliges Datum zwischen 01.09.2025 und 25.10.2025
        start_date = datetime(2025, 9, 1, 8, 0, 0)
        end_date = datetime(2025, 10, 25, 18, 0, 0)
        
        time_between = end_date - start_date
        total_seconds = int(time_between.total_seconds())
        random_seconds = random.randint(0, total_seconds)
        register_date = start_date + timedelta(seconds=random_seconds)
        
        register_date_str = register_date.strftime('%Y-%m-%d %H:%M:%S')
        with_random_date += 1
    
    # Update-Query
    cursor.execute("""
        UPDATE teachers 
        SET register_date = %s 
        WHERE id = %s
    """, (register_date_str, teacher_id))
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Lehrer verarbeitet...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich aktualisiert.")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM teachers")
total_teachers = cursor.fetchone()[0]

cursor.execute("SELECT MIN(register_date), MAX(register_date) FROM teachers")
date_range = cursor.fetchone()

print(f"\nStatistiken:")
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Mit Schul-basiertem Datum: {with_school_date}")
print(f"Mit zufälligem Datum: {with_random_date}")
print(f"Früheste Registrierung: {date_range[0]}")
print(f"Späteste Registrierung: {date_range[1]}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
