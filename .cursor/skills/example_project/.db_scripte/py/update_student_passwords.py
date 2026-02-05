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

# Liste von 25 technik-bezogenen deutschen Wörtern (kleingeschrieben, max 11 Buchstaben)
tech_woerter = [
    'algorithmus',  # 11 Buchstaben
    'prozessor',    # 8 Buchstaben
    'speicher',     # 7 Buchstaben
    'netzwerk',     # 8 Buchstaben
    'software',     # 8 Buchstaben
    'hardware',     # 8 Buchstaben
    'programm',     # 8 Buchstaben
    'datenbank',    # 9 Buchstaben
    'server',       # 6 Buchstaben
    'client',       # 6 Buchstaben
    'browser',      # 7 Buchstaben
    'system',       # 6 Buchstaben
    'plattform',    # 9 Buchstaben
    'anwendung',    # 9 Buchstaben
    'komponente',   # 10 Buchstaben
    'protokoll',    # 9 Buchstaben
    'architektur',  # 11 Buchstaben
    'framework',    # 9 Buchstaben
    'bibliothek',   # 10 Buchstaben
    'entwicklung',  # 11 Buchstaben
    'funktion',     # 8 Buchstaben
    'modul',        # 5 Buchstaben
    'sicherheit',   # 10 Buchstaben
    'parameter',    # 9 Buchstaben
    'zugang'        # 6 Buchstaben
]

def generate_unique_password(existing_passwords):
    """Generiert ein eindeutiges Passwort im Format: wort-wort-wort-dreistelligeZahl"""
    max_attempts = 10000  # Sicherheitsgrenze gegen Endlosschleife
    attempt = 0
    
    while attempt < max_attempts:
        # Drei zufällige Wörter auswählen
        wort1 = random.choice(tech_woerter)
        wort2 = random.choice(tech_woerter)
        wort3 = random.choice(tech_woerter)
        
        # Dreistellige Zahl generieren (000-999)
        zahl = random.randint(0, 999)
        dreistellige_zahl = f"{zahl:03d}"
        
        # Passwort zusammenstellen
        password = f"{wort1}-{wort2}-{wort3}-{dreistellige_zahl}"
        
        # Prüfen ob Passwort bereits existiert
        if password not in existing_passwords:
            return password
        
        attempt += 1
    
    raise Exception("Konnte kein eindeutiges Passwort generieren nach 10000 Versuchen")

print("Hole alle Studenten aus der users Tabelle...")

# Alle Studenten abrufen
cursor.execute("SELECT id, role_id, name, password FROM users WHERE role = 'student'")
students = cursor.fetchall()

print(f"Gefunden: {len(students)} Studenten")

# Alle existierenden Passwörter für Studenten sammeln (für Eindeutigkeitsprüfung)
cursor.execute("SELECT password FROM users WHERE role = 'student' AND password IS NOT NULL")
existing_passwords = set(row[0] for row in cursor.fetchall())

print(f"Existierende Passwörter: {len(existing_passwords)}")

# Passwörter für alle Studenten aktualisieren
updated_count = 0
failed_count = 0

for user_id, role_id, name, old_password in students:
    try:
        # Neues eindeutiges Passwort generieren
        new_password = generate_unique_password(existing_passwords)
        
        # Passwort zur Set hinzufügen (für Eindeutigkeitsprüfung bei nächsten Studenten)
        existing_passwords.add(new_password)
        
        # Passwort in Datenbank aktualisieren
        cursor.execute("""
            UPDATE users 
            SET password = %s 
            WHERE id = %s AND role = 'student'
        """, (new_password, user_id))
        
        updated_count += 1
        
        # Fortschritt anzeigen
        if updated_count % 100 == 0:
            print(f"{updated_count} Studenten aktualisiert...")
            
    except Exception as err:
        print(f"Fehler beim Aktualisieren von Student ID {user_id} ({name}): {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()
print(f"\nPasswort-Update abgeschlossen!")
print(f"Erfolgreich aktualisiert: {updated_count} Studenten")
if failed_count > 0:
    print(f"Fehler: {failed_count} Studenten")

# Beispiel-Passwörter anzeigen
cursor.execute("SELECT role_id, name, password FROM users WHERE role = 'student' LIMIT 5")
sample_students = cursor.fetchall()
print(f"\nBeispiel-Passwörter:")
for role_id, name, password in sample_students:
    print(f"  Student ID {role_id}: {name} | Passwort: {password}")

# Verbindung schließen
cursor.close()
conn.close()

print("\nUpdate abgeschlossen!")

