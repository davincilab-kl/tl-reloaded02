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

# Österreichische Bundesländer
bundeslaender = [
    'Wien', 'Niederösterreich', 'Oberösterreich', 'Salzburg', 
    'Tirol', 'Vorarlberg', 'Kärnten', 'Steiermark', 'Burgenland'
]

# Schulnamen-Templates
schulnamen_templates = [
    'Mittelschule', 'BRG', 'AHS', 'PTS', 'PMS'
]

# 1. Neue Tabelle 'schools' erstellen
try:
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        bundesland VARCHAR(255)
    );
    ''')
    print("Tabelle 'schools' wurde erfolgreich erstellt.")
except mysql.connector.Error as err:
    print(f"Fehler beim Erstellen der Tabelle: {err}")
    exit(1)

# 2. 500 zufällige Schulen generieren und in die Tabelle 'schools' einfügen
for i in range(500):
    # Generiere einen Schulnamen
    schulart = random.choice(schulnamen_templates)
    nummer = random.randint(1, 50)
    name = f"{schulart} {nummer}"
    
    # Zufälliges Bundesland auswählen
    bundesland = random.choice(bundeslaender)
    
    cursor.execute('''
        INSERT INTO schools (name, bundesland) VALUES (%s, %s)
    ''', (name, bundesland))

    # Ausgabe alle 50 Datensätze
    if (i + 1) % 50 == 0:
        print(f"{i + 1} Schulen wurden erfolgreich erstellt.")

# Änderungen speichern
conn.commit()
print("500 zufällige Schulen wurden erfolgreich in die Tabelle 'schools' eingefügt.")

# Verbindung schließen
cursor.close()
conn.close()
