import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Füge school_id zu classes und students hinzu...")

# 1. school_id zu classes hinzufügen
try:
    cursor.execute("ALTER TABLE classes ADD COLUMN school_id INT")
    print("Spalte 'school_id' wurde zur Tabelle 'classes' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'school_id' existiert bereits in 'classes'.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte zu 'classes': {err}")

# 2. school_id zu students hinzufügen
try:
    cursor.execute("ALTER TABLE students ADD COLUMN school_id INT")
    print("Spalte 'school_id' wurde zur Tabelle 'students' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'school_id' existiert bereits in 'students'.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte zu 'students': {err}")

# 3. school_id für classes setzen (über teacher_id)
print("Setze school_id für classes...")
cursor.execute("""
    UPDATE classes c
    JOIN teachers t ON c.teacher_id = t.id
    SET c.school_id = t.school_id
    WHERE t.school_id IS NOT NULL
""")
print(f"Classes aktualisiert: {cursor.rowcount}")

# 4. school_id für students setzen (über class_id)
print("Setze school_id für students...")
cursor.execute("""
    UPDATE students s
    JOIN classes c ON s.class_id = c.id
    SET s.school_id = c.school_id
    WHERE c.school_id IS NOT NULL
""")
print(f"Students aktualisiert: {cursor.rowcount}")

# 5. Indizes für bessere Performance hinzufügen
try:
    cursor.execute("CREATE INDEX idx_classes_school_id ON classes(school_id)")
    print("Index für classes.school_id erstellt.")
except mysql.connector.Error as err:
    if "Duplicate key name" in str(err):
        print("Index für classes.school_id existiert bereits.")
    else:
        print(f"Fehler beim Erstellen des Index für classes: {err}")

try:
    cursor.execute("CREATE INDEX idx_students_school_id ON students(school_id)")
    print("Index für students.school_id erstellt.")
except mysql.connector.Error as err:
    if "Duplicate key name" in str(err):
        print("Index für students.school_id existiert bereits.")
    else:
        print(f"Fehler beim Erstellen des Index für students: {err}")

# Änderungen speichern
conn.commit()
print("Alle school_id Spalten wurden erfolgreich hinzugefügt und befüllt.")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
