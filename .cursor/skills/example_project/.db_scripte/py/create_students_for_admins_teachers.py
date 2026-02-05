import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Hole alle Users mit Rolle 'admin' oder 'teacher'...")

# Alle Users mit Rolle admin oder teacher abrufen und ihre school_id aus teachers Tabelle holen
cursor.execute("""
    SELECT u.id, u.role_id, u.role, u.name, t.school_id
    FROM users u
    LEFT JOIN teachers t ON u.role_id = t.id
    WHERE u.role IN ('admin', 'teacher')
    AND t.school_id IS NOT NULL
""")
users = cursor.fetchall()

print(f"Gefunden: {len(users)} Users (admin/teacher) mit school_id")

# Student-Einträge erstellen
created_count = 0
skipped_count = 0
failed_count = 0

for user_id, role_id, role, name, school_id in users:
    try:
        # Prüfen ob bereits ein Student-Eintrag mit derselben school_id und name existiert
        cursor.execute("""
            SELECT COUNT(*) FROM students
            WHERE school_id = %s AND name = %s
        """, (school_id, name))
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"Überspringe User ID {user_id} ({name}) - Student-Eintrag existiert bereits")
            skipped_count += 1
            continue
        
        # Student-Eintrag erstellen
        cursor.execute("""
            INSERT INTO students (name, class_id, school_id, courses_done, projects_wip, projects_pending, projects_public, t_coins)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (name, 0, school_id, 0, 0, 0, 0, 0))
        
        created_count += 1
        
        # Fortschritt anzeigen
        if created_count % 50 == 0:
            print(f"{created_count} Student-Einträge erstellt...")
            
    except Exception as err:
        print(f"Fehler beim Erstellen von Student-Eintrag für User ID {user_id} ({name}, Role: {role}): {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()
print(f"\nStudent-Einträge-Erstellung abgeschlossen!")
print(f"Erfolgreich erstellt: {created_count}")
print(f"Übersprungen (bereits vorhanden): {skipped_count}")
if failed_count > 0:
    print(f"Fehler: {failed_count}")

# Beispiel-Einträge anzeigen (neueste Student-Einträge, die möglicherweise für Admins/Teachers erstellt wurden)
cursor.execute("""
    SELECT s.id, s.name, s.school_id, s.class_id
    FROM students s
    WHERE s.class_id = 0
    ORDER BY s.id DESC
    LIMIT 5
""")
sample_students = cursor.fetchall()
print(f"\nBeispiel-Student-Einträge (neueste mit class_id = 0):")
for student_id, name, school_id, class_id in sample_students:
    print(f"  Student ID {student_id}: {name} | School ID: {school_id} | Class ID: {class_id}")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

