import mysql.connector
import time

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Prüfe ob first_name und last_name Spalten existieren...")

# Prüfen ob Spalten existieren und ggf. hinzufügen
try:
    cursor.execute("SHOW COLUMNS FROM users LIKE 'first_name'")
    if cursor.fetchone() is None:
        cursor.execute("ALTER TABLE users ADD COLUMN first_name VARCHAR(255) AFTER name")
        print("Spalte 'first_name' wurde hinzugefügt.")
    else:
        print("Spalte 'first_name' existiert bereits.")
    
    cursor.execute("SHOW COLUMNS FROM users LIKE 'last_name'")
    if cursor.fetchone() is None:
        cursor.execute("ALTER TABLE users ADD COLUMN last_name VARCHAR(255) AFTER first_name")
        print("Spalte 'last_name' wurde hinzugefügt.")
    else:
        print("Spalte 'last_name' existiert bereits.")
except mysql.connector.Error as err:
    print(f"Fehler beim Hinzufügen der Spalten: {err}")
    exit(1)

print("\nHole alle Users aus der users Tabelle...")

# Alle Users abrufen (mit role)
cursor.execute("SELECT id, role, name FROM users WHERE name IS NOT NULL AND name != ''")
users = cursor.fetchall()

print(f"Gefunden: {len(users)} Users mit Namen")

# Namen aufteilen und aktualisieren
updated_count = 0
updated_students_count = 0
updated_others_count = 0
empty_name_count = 0
processed_count = 0
batch_start_time = time.time()

for user_id, role, full_name in users:
    processed_count += 1
    try:
        if not full_name or full_name.strip() == '':
            empty_name_count += 1
            continue
        
        # Namen trimmen
        full_name = full_name.strip()
        
        # Bei Students: gesamter Name in first_name
        if role == 'student':
            first_name = full_name
            last_name = None
            updated_students_count += 1
        else:
            # Bei anderen Roles: Namen am letzten Leerzeichen aufteilen
            name_parts = full_name.rsplit(' ', 1)
            
            if len(name_parts) == 1:
                # Nur ein Wort vorhanden -> alles in first_name
                first_name = name_parts[0]
                last_name = None
            else:
                # Mehrere Wörter -> letztes Wort ist last_name, Rest ist first_name
                first_name = name_parts[0]
                last_name = name_parts[1]
            updated_others_count += 1
        
        # Namen in users Tabelle aktualisieren
        cursor.execute("""
            UPDATE users 
            SET first_name = %s, last_name = %s 
            WHERE id = %s
        """, (first_name, last_name, user_id))
        updated_count += 1
        
        # Fortschritt anzeigen
        if updated_count % 100 == 0:
            batch_elapsed_time = time.time() - batch_start_time
            avg_time_per_user = batch_elapsed_time / 100  # Durchschnitt für die letzten 100 User
            remaining_users = len(users) - processed_count
            estimated_remaining_time = avg_time_per_user * remaining_users
            
            # Zeit formatieren
            minutes = int(estimated_remaining_time // 60)
            seconds = int(estimated_remaining_time % 60)
            
            print(f"{updated_count} Users aktualisiert... Geschätzte verbleibende Zeit: {minutes} Min {seconds} Sek")
            
            # Neue Startzeit für die nächsten 100 User
            batch_start_time = time.time()
            
    except mysql.connector.Error as err:
        print(f"Fehler beim Aktualisieren von User ID {user_id}: {err}")

# Änderungen speichern
conn.commit()
print(f"\nUpdate abgeschlossen!")
print(f"  - {updated_count} Users erfolgreich aktualisiert")
print(f"  - {updated_students_count} Students (gesamter Name in first_name)")
print(f"  - {updated_others_count} Andere Users (Name aufgeteilt)")
print(f"  - {empty_name_count} Users hatten keinen Namen")

# Verbindung schließen
cursor.close()
conn.close()

print("\nSkript abgeschlossen!")

