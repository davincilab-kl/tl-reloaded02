import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Aktualisiere teachers-Tabelle...")

# 1. Prüfen ob admin und infowebinar Spalten existieren, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN admin BOOLEAN DEFAULT 0")
    print("Spalte 'admin' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'admin' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'admin': {err}")

try:
    cursor.execute("ALTER TABLE teachers ADD COLUMN infowebinar BOOLEAN DEFAULT 0")
    print("Spalte 'infowebinar' wurde zur Tabelle 'teachers' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'infowebinar' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'infowebinar': {err}")

# 2. Admin-Spalte für die ersten 500 Lehrer auf 1 setzen
print("Setze admin=1 für die ersten 500 Lehrer...")
cursor.execute("""
    UPDATE teachers 
    SET admin = 1 
    WHERE id IN (
        SELECT id FROM (
            SELECT id FROM teachers 
            ORDER BY id 
            LIMIT 500
        ) AS temp
    )
""")
print(f"Admin-Status für {cursor.rowcount} Lehrer gesetzt.")

# 3. Infowebinar-Spalte basierend auf Schule-Status setzen
print("Setze infowebinar basierend auf Schule-Status...")
cursor.execute("""
    UPDATE teachers t
    JOIN schools s ON t.school_id = s.id
    SET t.infowebinar = 1
    WHERE s.info_webinar_teilnahme = 1
""")
print(f"Infowebinar-Status für {cursor.rowcount} Lehrer gesetzt.")

# 4. Infowebinar auf 0 setzen für Lehrer, die nicht Admin sind
print("Setze infowebinar=0 für Lehrer, die nicht Admin sind...")
cursor.execute("""
    UPDATE teachers 
    SET infowebinar = 0 
    WHERE admin = 0 AND infowebinar = 1
""")
print(f"Infowebinar-Status für {cursor.rowcount} nicht-Admin Lehrer auf 0 gesetzt.")

# 5. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM teachers WHERE admin = 1")
admin_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM teachers WHERE infowebinar = 1")
infowebinar_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM teachers")
total_teachers = cursor.fetchone()[0]

print(f"\nStatistiken:")
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Admin-Lehrer: {admin_count}")
print(f"Infowebinar-Lehrer: {infowebinar_count}")

# Änderungen speichern
conn.commit()
print("Alle Updates wurden erfolgreich durchgeführt.")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
