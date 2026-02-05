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

print("Aktualisiere teachers infowebinar mit Datum...")

# 1. Prüfen ob infowebinar Spalte existiert und zu DATETIME ändern
try:
    cursor.execute("ALTER TABLE teachers MODIFY COLUMN infowebinar DATETIME")
    print("Spalte 'infowebinar' wurde zu DATETIME geändert.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'infowebinar' existiert bereits.")
    else:
        print(f"Fehler beim Ändern der Spalte 'infowebinar': {err}")

# Datumsbereich: 01.09.2025 00:00:00 bis 25.10.2025 15:00:00
start_date = datetime(2025, 9, 1, 0, 0, 0)
end_date = datetime(2025, 10, 25, 15, 0, 0)

def get_random_datetime():
    """Generiert ein zufälliges Datum und Uhrzeit zwischen start_date und end_date"""
    time_between = end_date - start_date
    total_seconds = int(time_between.total_seconds())
    random_seconds = random.randint(0, total_seconds)
    random_datetime = start_date + timedelta(seconds=random_seconds)
    return random_datetime.strftime('%Y-%m-%d %H:%M:%S')

# 2. Alle Lehrer abrufen
cursor.execute("SELECT id FROM teachers")
teachers = cursor.fetchall()
print(f"Gefunden: {len(teachers)} Lehrer")

# 3. Lehrer aktualisieren
updated_count = 0
for teacher_id, in teachers:
    # Zufälliges Datum und Uhrzeit generieren
    infowebinar_datetime = get_random_datetime()
    
    # Update-Query
    update_sql = """
    UPDATE teachers 
    SET infowebinar = %s 
    WHERE id = %s
    """
    
    cursor.execute(update_sql, (infowebinar_datetime, teacher_id))
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Lehrer aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich aktualisiert.")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM teachers")
total_teachers = cursor.fetchone()[0]

cursor.execute("SELECT MIN(infowebinar), MAX(infowebinar) FROM teachers")
date_range = cursor.fetchone()

print(f"\nStatistiken:")
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Frühester Infowebinar: {date_range[0]}")
print(f"Spätester Infowebinar: {date_range[1]}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
