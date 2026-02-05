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

print("Setze changed_at für teacher_status_history auf zufällige Daten zwischen 1.11. und 22.11....")

# Datumsbereich: 1.11. bis 22.11. (Jahr 2025)
start_date = datetime(2025, 11, 1)
end_date = datetime(2025, 11, 22)

# Alle Teachers abrufen
cursor.execute("SELECT DISTINCT teacher_id FROM teacher_status_history ORDER BY teacher_id")
teachers = cursor.fetchall()
print(f"Gefunden: {len(teachers)} Teachers mit Status-Historie\n")

total_updated = 0

# Für jeden Teacher die Historie-Einträge verarbeiten
for (teacher_id,) in teachers:
    # Alle Historie-Einträge für diesen Teacher nach id sortiert abrufen (chronologisch)
    cursor.execute("""
        SELECT id, status_id, previous_status_id 
        FROM teacher_status_history 
        WHERE teacher_id = %s 
        ORDER BY id ASC
    """, (teacher_id,))
    
    history_entries = cursor.fetchall()
    
    if len(history_entries) == 0:
        continue
    
    # Zeitraum gleichmäßig auf die Einträge verteilen
    # Jeder Eintrag bekommt ein Datum, das mindestens so spät ist wie der vorherige
    time_span = end_date - start_date
    interval_per_entry = time_span / len(history_entries)
    
    last_datetime = start_date
    
    for entry_id, status_id, previous_status_id in history_entries:
        # Zufälliges Datum zwischen letztem Datum und Ende des Zeitraums
        # Für den letzten Eintrag: bis zum end_date
        if entry_id == history_entries[-1][0]:
            # Letzter Eintrag: kann bis zum end_date gehen
            max_datetime = end_date
        else:
            # Nicht-letzter Eintrag: kann bis zum nächsten möglichen Datum gehen
            # Wir verwenden einen Puffer, damit der nächste Eintrag noch Platz hat
            max_datetime = min(
                last_datetime + interval_per_entry * 2,
                end_date - timedelta(hours=1)
            )
        
        # Zufälliges Datum zwischen last_datetime und max_datetime
        if max_datetime > last_datetime:
            time_between = max_datetime - last_datetime
            random_seconds = random.randint(0, int(time_between.total_seconds()))
            new_datetime = last_datetime + timedelta(seconds=random_seconds)
        else:
            # Falls kein Platz mehr: minimal nach dem letzten Datum
            new_datetime = last_datetime + timedelta(minutes=random.randint(1, 60))
            if new_datetime > end_date:
                new_datetime = end_date
        
        # Zufällige Uhrzeit hinzufügen (falls noch nicht gesetzt)
        if new_datetime.hour == 0 and new_datetime.minute == 0:
            new_datetime = new_datetime.replace(
                hour=random.randint(0, 23),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
        
        # Update durchführen
        mysql_datetime = new_datetime.strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("""
            UPDATE teacher_status_history 
            SET changed_at = %s 
            WHERE id = %s
        """, (mysql_datetime, entry_id))
        
        last_datetime = new_datetime
        total_updated += 1
    
    # Fortschritt anzeigen
    if total_updated % 50 == 0:
        print(f"{total_updated} Einträge aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"\n{total_updated} Historie-Einträge wurden erfolgreich aktualisiert.")

# Statistiken anzeigen
cursor.execute("""
    SELECT 
        DATE(changed_at) as date, 
        COUNT(*) as count 
    FROM teacher_status_history 
    GROUP BY DATE(changed_at) 
    ORDER BY date
""")
date_counts = cursor.fetchall()

print("\nVerteilung der changed_at Daten:")
for date, count in date_counts:
    print(f"  {date.strftime('%d.%m.%Y')}: {count} Einträge")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

