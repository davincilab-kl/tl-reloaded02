import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Setze status_id für alle Teachers auf 1...")

# Anzahl der betroffenen Teachers abrufen
cursor.execute("SELECT COUNT(*) FROM teachers")
total_count = cursor.fetchone()[0]
print(f"Gefunden: {total_count} Teachers")

# Alle Teachers auf status_id = 0 setzen
cursor.execute("UPDATE teachers SET status_id = 1")
updated_count = cursor.rowcount

print(f"\nStatus-ID für {updated_count} Teachers auf 1 gesetzt.")

# Änderungen speichern
conn.commit()
print("Alle Updates wurden erfolgreich durchgeführt.")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")

