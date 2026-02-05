import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Hole alle Users aus der users Tabelle...")

# Alle Users abrufen
cursor.execute("SELECT id, role, role_id, name FROM users")
users = cursor.fetchall()

print(f"Gefunden: {len(users)} Users")

# Namen aktualisieren
updated_teachers_count = 0
updated_students_count = 0
not_found_teachers_count = 0
not_found_students_count = 0
failed_count = 0

for user_id, role, role_id, old_name in users:
    try:
        new_name = None
        
        if role == 'teacher':
            # Namen aus teachers Tabelle holen
            cursor.execute("SELECT name FROM teachers WHERE id = %s", (role_id,))
            result = cursor.fetchone()
            
            if result:
                new_name = result[0]
                # Namen in users Tabelle aktualisieren
                cursor.execute("""
                    UPDATE users 
                    SET name = %s 
                    WHERE id = %s AND role = 'teacher'
                """, (new_name, user_id))
                updated_teachers_count += 1
                
                # Fortschritt anzeigen
                if updated_teachers_count % 50 == 0:
                    print(f"{updated_teachers_count} Lehrer aktualisiert...")
            else:
                print(f"Lehrer nicht gefunden für User ID {user_id} (role_id: {role_id}, alter Name: {old_name})")
                not_found_teachers_count += 1
                
        elif role == 'student':
            # Namen aus students Tabelle holen
            cursor.execute("SELECT name FROM students WHERE id = %s", (role_id,))
            result = cursor.fetchone()
            
            if result:
                new_name = result[0]
                # Namen in users Tabelle aktualisieren
                cursor.execute("""
                    UPDATE users 
                    SET name = %s 
                    WHERE id = %s AND role = 'student'
                """, (new_name, user_id))
                updated_students_count += 1
                
                # Fortschritt anzeigen
                if updated_students_count % 100 == 0:
                    print(f"{updated_students_count} Studenten aktualisiert...")
            else:
                print(f"Student nicht gefunden für User ID {user_id} (role_id: {role_id}, alter Name: {old_name})")
                not_found_students_count += 1
                
    except Exception as err:
        print(f"Fehler beim Aktualisieren von User ID {user_id} (Role: {role}, role_id: {role_id}): {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()
print(f"\nNamen-Update abgeschlossen!")
print(f"Erfolgreich aktualisiert: {updated_teachers_count} Lehrer, {updated_students_count} Studenten")
if not_found_teachers_count > 0:
    print(f"Nicht gefunden (Lehrer): {not_found_teachers_count}")
if not_found_students_count > 0:
    print(f"Nicht gefunden (Studenten): {not_found_students_count}")
if failed_count > 0:
    print(f"Fehler: {failed_count}")

# Beispiel-Updates anzeigen
print(f"\nBeispiel-Updates (Lehrer):")
cursor.execute("""
    SELECT u.id, u.role_id, u.name, t.name as teacher_name
    FROM users u
    LEFT JOIN teachers t ON u.role_id = t.id
    WHERE u.role = 'teacher'
    LIMIT 5
""")
sample_teachers = cursor.fetchall()
for user_id, role_id, user_name, teacher_name in sample_teachers:
    print(f"  User ID {user_id} (role_id: {role_id}): {user_name}")

print(f"\nBeispiel-Updates (Studenten):")
cursor.execute("""
    SELECT u.id, u.role_id, u.name, s.name as student_name
    FROM users u
    LEFT JOIN students s ON u.role_id = s.id
    WHERE u.role = 'student'
    LIMIT 5
""")
sample_students = cursor.fetchall()
for user_id, role_id, user_name, student_name in sample_students:
    print(f"  User ID {user_id} (role_id: {role_id}): {user_name}")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

