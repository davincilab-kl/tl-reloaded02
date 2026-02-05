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

print("Aktualisiere schools sponsor...")

# Verfügbare Sponsoren
sponsors = [
    'Amazon Future Engineer',
    'Mastercard',
    'fit4internet',
    'Apprentigo'
]

# 1. Prüfen ob sponsor Spalte existiert, falls nicht erstellen
try:
    cursor.execute("ALTER TABLE schools ADD COLUMN sponsor VARCHAR(50)")
    print("Spalte 'sponsor' wurde zur Tabelle 'schools' hinzugefügt.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("Spalte 'sponsor' existiert bereits.")
    else:
        print(f"Fehler beim Hinzufügen der Spalte 'sponsor': {err}")

# 2. Alle Schulen abrufen
cursor.execute("SELECT id FROM schools")
schools = cursor.fetchall()
print(f"Gefunden: {len(schools)} Schulen")

# 3. Schulen aktualisieren
updated_count = 0
for school_id, in schools:
    # Prüfen ob Schule Förderung hat
    cursor.execute("SELECT foerderung FROM schools WHERE id = %s", (school_id,))
    foerderung = cursor.fetchone()[0]
    
    if foerderung == 1:
        # Zufälligen Sponsor auswählen
        sponsor = random.choice(sponsors)
        
        # Update-Query
        update_sql = """
        UPDATE schools 
        SET sponsor = %s 
        WHERE id = %s
        """
        
        cursor.execute(update_sql, (sponsor, school_id))
        updated_count += 1
    else:
        # Kein Sponsor für Schulen ohne Förderung
        update_sql = """
        UPDATE schools 
        SET sponsor = NULL 
        WHERE id = %s
        """
        
        cursor.execute(update_sql, (school_id,))
    
    # Fortschritt anzeigen
    if (updated_count + 1) % 50 == 0:
        print(f"{updated_count + 1} Schulen verarbeitet...")

# Änderungen speichern
conn.commit()
print(f"{updated_count} Schulen mit Förderung haben einen Sponsor erhalten.")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM schools")
total_schools = cursor.fetchone()[0]

print(f"\nStatistiken:")
print(f"Gesamt Schulen: {total_schools}")

# Sponsor-Verteilung anzeigen
cursor.execute("SELECT COUNT(*) FROM schools WHERE foerderung = 1")
schools_with_funding = cursor.fetchone()[0]

print(f"Schulen mit Förderung: {schools_with_funding}")
print(f"Schulen ohne Förderung: {total_schools - schools_with_funding}")

for sponsor in sponsors:
    cursor.execute("SELECT COUNT(*) FROM schools WHERE sponsor = %s", (sponsor,))
    count = cursor.fetchone()[0]
    percentage = (count / schools_with_funding) * 100 if schools_with_funding > 0 else 0
    print(f"{sponsor}: {count} Schulen ({percentage:.1f}% der geförderten Schulen)")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
