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

print("Aktualisiere teachers last_login...")

# 1. Prüfen ob last_login Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN last_login VARCHAR(19)")
    print("Spalte 'last_login' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'last_login' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'last_login': {err}")

# Datumsbereich: 01.09.2025 bis 25.10.2025
start_date = datetime(2025, 9, 1)
end_date = datetime(2025, 10, 25)

def get_random_datetime():
    """Generiert ein zufälliges Datum und Uhrzeit zwischen start_date und end_date"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    random_date = start_date + timedelta(days=random_days)
    
    # Zufällige Uhrzeit hinzufügen (00:00:00 bis 23:59:59)
    random_hour = random.randint(0, 23)
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    
    random_datetime = random_date.replace(hour=random_hour, minute=random_minute, second=random_second)
    return random_datetime.strftime('%d.%m.%Y %H:%M:%S')

# 2. Alle Lehrer abrufen
cursor.execute("SELECT id FROM teachers")
teachers = cursor.fetchall()
print(f"Gefunden: {len(teachers)} Lehrer")

# 3. Lehrer aktualisieren
updated_count = 0
for teacher_id, in teachers:
    # Zufälliges Datum und Uhrzeit generieren
    last_login = get_random_datetime()
    
    # Update-Query
    update_sql = """
    UPDATE teachers 
    SET last_login = %s 
    WHERE id = %s
    """
    
    cursor.execute(update_sql, (last_login, teacher_id))
    
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

cursor.execute("SELECT MIN(last_login), MAX(last_login) FROM teachers")
date_range = cursor.fetchone()

print(f"\nStatistiken:")
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Frühester Login: {date_range[0]}")
print(f"Spätester Login: {date_range[1]}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
