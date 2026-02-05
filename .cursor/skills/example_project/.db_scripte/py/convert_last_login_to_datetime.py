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

print("Konvertiere last_login von VARCHAR zu DATETIME...")

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
    return random_datetime.strftime('%Y-%m-%d %H:%M:%S')

# 1. Prüfen welche Werte in last_login stehen
cursor.execute("SELECT DISTINCT last_login FROM teachers WHERE last_login IS NOT NULL LIMIT 10")
sample_values = cursor.fetchall()
print(f"Beispielwerte in last_login: {[row[0] for row in sample_values]}")

# 2. Alle Lehrer mit last_login-Werten abrufen
cursor.execute("SELECT id, last_login FROM teachers WHERE last_login IS NOT NULL")
teachers_with_login = cursor.fetchall()

print(f"Gefunden: {len(teachers_with_login)} Lehrer mit last_login-Werten")

# 3. Lehrer mit gültigen Datums-Strings konvertieren, andere mit zufälligen Datums ersetzen
updated_count = 0
converted_count = 0
replaced_count = 0

for teacher_id, last_login_value in teachers_with_login:
    try:
        # Versuche das bestehende Format zu parsen (dd.mm.yyyy hh:mm:ss)
        if isinstance(last_login_value, str) and last_login_value != 'N/A':
            # Parse das deutsche Datumsformat
            parsed_date = datetime.strptime(last_login_value, '%d.%m.%Y %H:%M:%S')
            # Konvertiere zu MySQL DATETIME Format
            mysql_datetime = parsed_date.strftime('%Y-%m-%d %H:%M:%S')
            
            cursor.execute("""
                UPDATE teachers 
                SET last_login = %s 
                WHERE id = %s
            """, (mysql_datetime, teacher_id))
            converted_count += 1
        else:
            # Für 'N/A' oder andere ungültige Werte: zufälliges Datum
            random_datetime = get_random_datetime()
            cursor.execute("""
                UPDATE teachers 
                SET last_login = %s 
                WHERE id = %s
            """, (random_datetime, teacher_id))
            replaced_count += 1
            
    except ValueError:
        # Falls Parsing fehlschlägt: zufälliges Datum
        random_datetime = get_random_datetime()
        cursor.execute("""
            UPDATE teachers 
            SET last_login = %s 
            WHERE id = %s
        """, (random_datetime, teacher_id))
        replaced_count += 1
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Lehrer verarbeitet...")

# 4. Lehrer ohne last_login-Wert bekommen zufälliges Datum
cursor.execute("SELECT id FROM teachers WHERE last_login IS NULL")
teachers_without_login = cursor.fetchall()

print(f"Gefunden: {len(teachers_without_login)} Lehrer ohne last_login-Wert")

for teacher_id, in teachers_without_login:
    random_datetime = get_random_datetime()
    cursor.execute("""
        UPDATE teachers 
        SET last_login = %s 
        WHERE id = %s
    """, (random_datetime, teacher_id))
    updated_count += 1

# 5. Spalte von VARCHAR zu DATETIME ändern
print("Ändere Spalte last_login von VARCHAR zu DATETIME...")
try:
    cursor.execute("ALTER TABLE teachers MODIFY COLUMN last_login DATETIME")
    print("Spalte 'last_login' wurde erfolgreich zu DATETIME geändert.")
except mysql.connector.Error as err:
    print(f"Fehler beim Ändern der Spalte: {err}")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich aktualisiert.")

# 6. Statistiken anzeigen
print(f"\nStatistiken:")
print(f"Gesamt verarbeitete Lehrer: {updated_count}")
print(f"Konvertierte gültige Datums: {converted_count}")
print(f"Ersetzte ungültige Werte: {replaced_count}")
print(f"Lehrer ohne Wert bekommen Datum: {len(teachers_without_login)}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
