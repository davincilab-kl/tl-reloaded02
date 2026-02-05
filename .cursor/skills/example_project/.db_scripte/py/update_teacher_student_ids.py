import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Hole alle Lehrer aus der teachers Tabelle...")

# Alle Lehrer abrufen
cursor.execute("SELECT id, name FROM teachers")
teachers = cursor.fetchall()

print(f"Gefunden: {len(teachers)} Lehrer")

# Prüfen ob student_id Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN student_id INT")
    print("Spalte 'student_id' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'student_id' existiert bereits in 'teachers'.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte: {err}")

# Student-IDs für alle Lehrer aktualisieren
updated_count = 0
not_found_count = 0
multiple_found_count = 0
failed_count = 0

for teacher_id, teacher_name in teachers:
    try:
        # Suche nach Studenten mit demselben Namen und class_id = 0
        cursor.execute("SELECT id FROM students WHERE name = %s AND class_id = 0", (teacher_name,))
        students = cursor.fetchall()
        
        if len(students) == 0:
            print(f"Kein Student gefunden für Lehrer ID {teacher_id} ({teacher_name})")
            not_found_count += 1
            continue
        
        if len(students) > 1:
            print(f"Warnung: Mehrere Studenten gefunden für Lehrer ID {teacher_id} ({teacher_name}) - verwende erste ID")
            multiple_found_count += 1
        
        # Erste Student-ID verwenden
        student_id = students[0][0]
        
        # student_id in teachers Tabelle aktualisieren
        cursor.execute("""
            UPDATE teachers 
            SET student_id = %s 
            WHERE id = %s
        """, (student_id, teacher_id))
        
        updated_count += 1
        
        # Fortschritt anzeigen
        if updated_count % 50 == 0:
            print(f"{updated_count} Lehrer aktualisiert...")
            
    except Exception as err:
        print(f"Fehler beim Aktualisieren von Lehrer ID {teacher_id} ({teacher_name}): {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()
print(f"\nStudent-ID-Update abgeschlossen!")
print(f"Erfolgreich aktualisiert: {updated_count} Lehrer")
if not_found_count > 0:
    print(f"Nicht gefunden: {not_found_count} Lehrer")
if multiple_found_count > 0:
    print(f"Mehrere Treffer: {multiple_found_count} Lehrer")
if failed_count > 0:
    print(f"Fehler: {failed_count} Lehrer")

# Beispiel-Zuordnungen anzeigen
cursor.execute("""
    SELECT t.id, t.name, t.student_id, s.name as student_name
    FROM teachers t
    LEFT JOIN students s ON t.student_id = s.id
    WHERE t.student_id IS NOT NULL
    LIMIT 5
""")
sample_teachers = cursor.fetchall()
print(f"\nBeispiel-Zuordnungen:")
for teacher_id, teacher_name, student_id, student_name in sample_teachers:
    print(f"  Lehrer ID {teacher_id}: {teacher_name} -> Student ID {student_id}: {student_name}")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

