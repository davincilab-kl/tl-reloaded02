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

print("Füge last_login Spalte zu students hinzu...")

# 1. Prüfen ob last_login Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE students ADD COLUMN last_login DATETIME")
    print("Spalte 'last_login' wurde zur Tabelle 'students' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'last_login' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'last_login': {err}")

# Datumsbereich: 01.09.2025 bis 20.12.2025
start_date = datetime(2025, 9, 1, 8, 0, 0)
end_date = datetime(2025, 12, 20, 22, 0, 0)

def get_random_datetime():
    """Generiert ein zufälliges Datum und Uhrzeit zwischen start_date und end_date"""
    time_between = end_date - start_date
    total_seconds = int(time_between.total_seconds())
    random_seconds = random.randint(0, total_seconds)
    random_datetime = start_date + timedelta(seconds=random_seconds)
    return random_datetime.strftime('%Y-%m-%d %H:%M:%S')

# 2. Alle Studenten abrufen
cursor.execute("SELECT id FROM students")
students = cursor.fetchall()
print(f"Gefunden: {len(students)} Studenten")

# 3. Studenten aktualisieren
updated_count = 0
for student_id, in students:
    # Zufälliges Datum und Uhrzeit generieren
    last_login = get_random_datetime()
    
    # Update-Query
    cursor.execute("""
        UPDATE students 
        SET last_login = %s 
        WHERE id = %s
    """, (last_login, student_id))
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Studenten aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Studenten wurden erfolgreich aktualisiert.")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM students")
total_students = cursor.fetchone()[0]

cursor.execute("SELECT MIN(last_login), MAX(last_login) FROM students")
date_range = cursor.fetchone()

print(f"\nStatistiken:")
print(f"Gesamt Studenten: {total_students}")
print(f"Frühester Login: {date_range[0]}")
print(f"Spätester Login: {date_range[1]}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
