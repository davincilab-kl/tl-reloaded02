import mysql.connector
import random
import string

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Erstelle users Tabelle für Login-Authentifizierung...")

def generate_password():
    """Generiert ein zufälliges 5-stelliges Passwort aus Buchstaben (groß/klein) und Zahlen"""
    characters = string.ascii_letters + string.digits  # a-z, A-Z, 0-9
    return ''.join(random.choice(characters) for _ in range(5))

# 1. Prüfen ob users Tabelle existiert, falls nicht erstellen
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            role VARCHAR(50) NOT NULL,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(5),
            last_login DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_role_id (role_id),
            INDEX idx_role (role),
            INDEX idx_email (email)
        )
    """)
    print("Tabelle 'users' wurde erstellt oder existiert bereits.")
except mysql.connector.Error as err:
    print(f"Fehler beim Erstellen der Tabelle 'users': {err}")
    exit(1)

# 2. Alle Lehrer abrufen und in users Tabelle einfügen
print("Migriere Lehrer...")
cursor.execute("""
    SELECT t.id, t.name, t.email, t.last_login, t.register_date 
    FROM teachers t 
    WHERE t.email IS NOT NULL AND t.email != ''
""")
teachers = cursor.fetchall()
print(f"Gefunden: {len(teachers)} Lehrer mit E-Mail")

teachers_inserted = 0
for teacher_id, name, email, last_login, register_date in teachers:
    try:
        password = generate_password()
        cursor.execute("""
            INSERT INTO users (role_id, role, name, email, password, last_login, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (teacher_id, 'teacher', name, email, password, last_login, register_date))
        teachers_inserted += 1
        
        # Fortschritt anzeigen
        if teachers_inserted % 100 == 0:
            print(f"{teachers_inserted} Lehrer migriert...")
            
    except mysql.connector.Error as err:
        if "Duplicate entry" in str(err):
            print(f"Lehrer ID {teacher_id} bereits in users Tabelle vorhanden")
        else:
            print(f"Fehler beim Einfügen von Lehrer ID {teacher_id}: {err}")

print(f"Lehrer Migration abgeschlossen: {teachers_inserted} Lehrer eingefügt")

# 3. Alle Studenten abrufen und in users Tabelle einfügen
print("Migriere Studenten...")
cursor.execute("""
    SELECT s.id, s.name, s.last_login, t.register_date 
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN teachers t ON c.teacher_id = t.id
""")
students = cursor.fetchall()
print(f"Gefunden: {len(students)} Studenten")

students_inserted = 0
for student_id, name, last_login, teacher_register_date in students:
    try:
        # Studenten bekommen keine E-Mail, aber trotzdem einen Login-Eintrag
        password = generate_password()
        # created_at basierend auf Lehrer-Registrierungsdatum
        created_at = teacher_register_date if teacher_register_date else None
        cursor.execute("""
            INSERT INTO users (role_id, role, name, email, password, last_login, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (student_id, 'student', name, None, password, last_login, created_at))
        students_inserted += 1
        
        # Fortschritt anzeigen
        if students_inserted % 1000 == 0:
            print(f"{students_inserted} Studenten migriert...")
            
    except mysql.connector.Error as err:
        if "Duplicate entry" in str(err):
            print(f"Student ID {student_id} bereits in users Tabelle vorhanden")
        else:
            print(f"Fehler beim Einfügen von Student ID {student_id}: {err}")

print(f"Studenten Migration abgeschlossen: {students_inserted} Studenten eingefügt")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher'")
total_teachers_in_users = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
total_students_in_users = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM users")
total_users = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM users WHERE email IS NOT NULL")
users_with_email = cursor.fetchone()[0]

print(f"\nStatistiken:")
print(f"Gesamt Einträge in users Tabelle: {total_users}")
print(f"Lehrer in users Tabelle: {total_teachers_in_users}")
print(f"Studenten in users Tabelle: {total_students_in_users}")
print(f"Benutzer mit E-Mail: {users_with_email}")
print(f"Benutzer ohne E-Mail: {total_users - users_with_email}")

# 5. Beispiel-Passwörter anzeigen
cursor.execute("SELECT role_id, role, name, email, password, last_login, created_at FROM users LIMIT 5")
sample_users = cursor.fetchall()
print(f"\nBeispiel-Login-Daten:")
for role_id, role, name, email, password, last_login, created_at in sample_users:
    email_display = email if email else "keine E-Mail"
    last_login_display = last_login.strftime('%Y-%m-%d %H:%M:%S') if last_login else "nie"
    created_at_display = created_at.strftime('%Y-%m-%d %H:%M:%S') if created_at else "unbekannt"
    print(f"  {role} ID {role_id}: {name} | {email_display} | Passwort: {password}")
    print(f"    Last Login: {last_login_display} | Created: {created_at_display}")

# Änderungen speichern
conn.commit()
print("Migration erfolgreich abgeschlossen!")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
