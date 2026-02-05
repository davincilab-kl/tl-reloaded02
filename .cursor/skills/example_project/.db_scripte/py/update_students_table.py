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

print("Erweitere students-Tabelle...")

# 1. Neue Spalten hinzufügen
new_columns = [
    ('courses_done', 'INT DEFAULT 0'),
    ('projects_wip', 'INT DEFAULT 0'),
    ('projects_pending', 'INT DEFAULT 0'),
    ('projects_public', 'INT DEFAULT 0'),
    ('t_coins', 'INT DEFAULT 0')
]

for column_name, column_type in new_columns:
    try:
        cursor.execute(f"ALTER TABLE students ADD COLUMN {column_name} {column_type}")
        print(f"Spalte '{column_name}' wurde zur Tabelle 'students' hinzugefügt.")
    except mysql.connector.Error as err:
        if "Duplicate column name" in str(err):
            print(f"Spalte '{column_name}' existiert bereits.")
        else:
            print(f"Fehler beim Hinzufügen der Spalte '{column_name}': {err}")

# 2. Alle Studenten abrufen
cursor.execute("SELECT id FROM students")
students = cursor.fetchall()
print(f"Gefunden: {len(students)} Studenten")

# 3. Studenten aktualisieren
updated_count = 0
for student_id, in students:
    # Zufällige Werte generieren
    courses_done = random.randint(0, 4)
    projects_wip = random.randint(0, 5)
    projects_pending = random.randint(0, 2)
    projects_public = random.randint(0, 2)
    
    # t_coins berechnen: mindestens 5*projects_public + 10*courses_done + maximal 20 zusätzlich
    min_coins = 5 * projects_public + 10 * courses_done
    additional_coins = random.randint(0, 20)
    t_coins = min_coins + additional_coins
    
    # Update-Query
    update_sql = """
    UPDATE students 
    SET courses_done = %s, 
        projects_wip = %s, 
        projects_pending = %s, 
        projects_public = %s, 
        t_coins = %s 
    WHERE id = %s
    """
    
    cursor.execute(update_sql, (
        courses_done,
        projects_wip,
        projects_pending,
        projects_public,
        t_coins,
        student_id
    ))
    
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Studenten aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Studenten wurden erfolgreich aktualisiert.")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM students")
total_students = cursor.fetchone()[0]

cursor.execute("SELECT AVG(courses_done), AVG(projects_wip), AVG(projects_pending), AVG(projects_public), AVG(t_coins) FROM students")
stats = cursor.fetchone()

print(f"\nStatistiken:")
print(f"Gesamt Studenten: {total_students}")
print(f"Durchschnittliche Kurse abgeschlossen: {stats[0]:.2f}")
print(f"Durchschnittliche Projekte in Arbeit: {stats[1]:.2f}")
print(f"Durchschnittliche ausstehende Projekte: {stats[2]:.2f}")
print(f"Durchschnittliche öffentliche Projekte: {stats[3]:.2f}")
print(f"Durchschnittliche T-Coins: {stats[4]:.2f}")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
