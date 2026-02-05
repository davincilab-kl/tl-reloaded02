import mysql.connector
import random

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',  # Server-Host
    user='upj3mlvklzwuu',          # Benutzername
    password='P3201q3991b.',      # Passwort
    database='dbgqpq6nxd7mlp'      # Datenbankname
)
cursor = conn.cursor()

# 1. Prüfen ob school_id Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN school_id INT")
    print("Spalte 'school_id' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'school_id' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte: {err}")

# 2. Alle verfügbaren School-IDs holen
cursor.execute("SELECT id FROM schools")
school_ids = [row[0] for row in cursor.fetchall()]
print(f"Gefunden: {len(school_ids)} Schulen")

# 3. Alle Teacher-IDs holen
cursor.execute("SELECT id FROM teachers")
teacher_ids = [row[0] for row in cursor.fetchall()]
print(f"Gefunden: {len(teacher_ids)} Lehrer")

# 4. Lehrer ungleichmäßig auf Schulen verteilen (1-8 pro Schule)
# Jede Schule bekommt mindestens 1 Lehrer
updated_count = 0
teacher_index = 0

# Zuerst jeder Schule mindestens 1 Lehrer zuordnen
for school_id in school_ids:
    if teacher_index < len(teacher_ids):
        teacher_id = teacher_ids[teacher_index]
        
        cursor.execute('''
            UPDATE teachers SET school_id = %s WHERE id = %s
        ''', (school_id, teacher_id))
        
        teacher_index += 1
        updated_count += 1

print(f"Alle {len(school_ids)} Schulen haben mindestens 1 Lehrer erhalten.")

# Verbleibende Lehrer zufällig verteilen (0-7 zusätzliche Lehrer pro Schule)
remaining_teachers = len(teacher_ids) - len(school_ids)
print(f"Verbleibende Lehrer für zufällige Verteilung: {remaining_teachers}")

for _ in range(remaining_teachers):
    if teacher_index < len(teacher_ids):
        # Zufällige Schule auswählen
        school_id = random.choice(school_ids)
        teacher_id = teacher_ids[teacher_index]
        
        cursor.execute('''
            UPDATE teachers SET school_id = %s WHERE id = %s
        ''', (school_id, teacher_id))
        
        teacher_index += 1
        updated_count += 1

print(f"Zusätzliche Lehrer wurden zufällig verteilt.")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich Schulen zugeordnet.")

# Verbindung schließen
cursor.close()
conn.close()
