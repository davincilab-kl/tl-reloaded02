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

print("Erhöhe status_id für alle Teachers in 4 Durchgängen...")

# Anzahl der betroffenen Teachers abrufen
cursor.execute("SELECT COUNT(*) FROM teachers")
total_count = cursor.fetchone()[0]
print(f"Gefunden: {total_count} Teachers\n")

# 4 Durchgänge
for iteration in range(1, 5):
    print(f"=== Durchgang {iteration}/4 ===")
    
    # Alle Teachers mit aktueller status_id abrufen
    cursor.execute("SELECT id, status_id FROM teachers")
    teachers = cursor.fetchall()
    
    updated_count = 0
    for teacher_id, current_status_id in teachers:
        # Zufällige Erhöhung zwischen 0 und 3 (0 = keine Erhöhung)
        increment = random.randint(0, 3)
        
        # Neue status_id berechnen (maximal 19)
        new_status_id = min(current_status_id + increment, 19)
        
        # Nur updaten, wenn sich etwas geändert hat
        if new_status_id != current_status_id:
            cursor.execute(
                "UPDATE teachers SET status_id = %s WHERE id = %s",
                (new_status_id, teacher_id)
            )
            updated_count += 1
    
    # Änderungen nach jedem Durchgang speichern
    conn.commit()
    print(f"  {updated_count} Teachers aktualisiert (status_id erhöht, max. 19)")
    
    # Statistiken nach jedem Durchgang anzeigen
    cursor.execute("SELECT status_id, COUNT(*) FROM teachers GROUP BY status_id ORDER BY status_id")
    status_counts = cursor.fetchall()
    
    print("  Verteilung der status_id Werte:")
    for status_id, count in status_counts:
        print(f"    status_id {status_id}: {count} Teachers")
    print()

print("Alle 4 Durchgänge abgeschlossen!")

# Zusätzlicher Schritt: Einige Teachers zufällig auf status_id 19 setzen
print("\n=== Setze vereinzelte Teachers auf status_id 19 ===")
cursor.execute("SELECT id FROM teachers WHERE status_id < 19")
teachers_below_19 = cursor.fetchall()

if len(teachers_below_19) > 0:
    # Etwa 5-10% der Teachers zufällig auf 19 setzen
    num_to_set_19 = max(1, int(len(teachers_below_19) * random.uniform(0.05, 0.10)))
    teachers_to_update = random.sample(teachers_below_19, min(num_to_set_19, len(teachers_below_19)))
    
    for (teacher_id,) in teachers_to_update:
        cursor.execute(
            "UPDATE teachers SET status_id = 19 WHERE id = %s",
            (teacher_id,)
        )
    
    conn.commit()
    print(f"  {len(teachers_to_update)} Teachers auf status_id 19 gesetzt.")
else:
    print("  Alle Teachers sind bereits auf status_id 19 oder höher.")

# Finale Statistiken anzeigen
cursor.execute("SELECT status_id, COUNT(*) FROM teachers GROUP BY status_id ORDER BY status_id")
status_counts = cursor.fetchall()

print("\nFinale Verteilung der status_id Werte:")
for status_id, count in status_counts:
    print(f"  status_id {status_id}: {count} Teachers")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

