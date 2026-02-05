import mysql.connector
import random

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Aktualisiere status_id für alle Teachers...")

# Alle Teachers abrufen
cursor.execute("SELECT id FROM teachers")
teachers = cursor.fetchall()
print(f"Gefunden: {len(teachers)} Teachers")

# Für jeden Teacher einen zufälligen status_id-Wert zwischen 1 und 20 setzen
updated_count = 0
for (teacher_id,) in teachers:
    status_id = random.randint(1, 20)
    cursor.execute(
        "UPDATE teachers SET status_id = %s WHERE id = %s",
        (status_id, teacher_id)
    )
    updated_count += 1
    
    # Fortschritt alle 100 Einträge anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Teachers aktualisiert...")

print(f"\nStatus-ID für {updated_count} Teachers aktualisiert.")

# Statistiken anzeigen
cursor.execute("SELECT status_id, COUNT(*) FROM teachers GROUP BY status_id ORDER BY status_id")
status_counts = cursor.fetchall()

print("\nVerteilung der status_id Werte:")
for status_id, count in status_counts:
    print(f"  status_id {status_id}: {count} Teachers")

# Änderungen speichern
conn.commit()
print("\nAlle Updates wurden erfolgreich durchgeführt.")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")

