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

print("Setze Infowebinar-Daten für die ersten 500 Lehrer basierend auf Schul-Förderung...")

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

# 1. Die ersten 500 Lehrer mit ihren Schulen abrufen
cursor.execute("""
    SELECT t.id, s.foerderung 
    FROM teachers t
    LEFT JOIN schools s ON t.school_id = s.id
    ORDER BY t.id
    LIMIT 500
""")
teachers_data = cursor.fetchall()

print(f"Verarbeite {len(teachers_data)} Lehrer...")

# 2. Lehrer aktualisieren basierend auf Schul-Förderung
updated_count = 0
with_datetime = 0
with_null = 0

for teacher_id, foerderung in teachers_data:
    if foerderung == 1:
        # Schule ist gefördert -> Lehrer bekommt ein Datum
        infowebinar_datetime = get_random_datetime()
        cursor.execute("""
            UPDATE teachers 
            SET infowebinar = %s 
            WHERE id = %s
        """, (infowebinar_datetime, teacher_id))
        with_datetime += 1
    else:
        # Schule ist nicht gefördert -> Lehrer bekommt NULL
        cursor.execute("""
            UPDATE teachers 
            SET infowebinar = NULL 
            WHERE id = %s
        """, (teacher_id,))
        with_null += 1
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 50 == 0:
        print(f"{updated_count} Lehrer verarbeitet...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich aktualisiert.")

# 3. Statistiken anzeigen
print(f"\nStatistiken:")
print(f"Verarbeitete Lehrer: {updated_count}")
print(f"Mit Infowebinar-Datum (geförderte Schule): {with_datetime}")
print(f"Mit NULL (nicht geförderte Schule): {with_null}")
print(f"Verhältnis mit Datum: {(with_datetime/updated_count)*100:.1f}%")
print(f"Verhältnis NULL: {(with_null/updated_count)*100:.1f}%")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
