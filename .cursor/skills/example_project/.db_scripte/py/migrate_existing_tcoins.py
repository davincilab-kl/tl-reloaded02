import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Migriere bestehende T!Coins in Transaktionshistorie...")

# 1. Prüfe ob tcoins_transactions Tabelle existiert
try:
    cursor.execute("SHOW TABLES LIKE 'tcoins_transactions'")
    if cursor.fetchone() is None:
        print("FEHLER: Tabelle 'tcoins_transactions' existiert nicht!")
        print("Bitte zuerst create_tcoins_transactions_table.sql ausführen!")
        cursor.close()
        conn.close()
        exit(1)
except mysql.connector.Error as err:
    print(f"Fehler beim Prüfen der Tabelle: {err}")
    cursor.close()
    conn.close()
    exit(1)

# 2. Alle Schüler mit t_coins > 0 abrufen
cursor.execute("SELECT id, t_coins FROM students WHERE t_coins > 0")
students = cursor.fetchall()
print(f"Gefunden: {len(students)} Schüler mit T!Coins > 0")

if len(students) == 0:
    print("Keine Schüler mit T!Coins gefunden. Migration nicht nötig.")
    cursor.close()
    conn.close()
    exit(0)

# 3. Für jeden Schüler Transaktion erstellen
migrated_count = 0
skipped_count = 0
failed_count = 0

for student_id, t_coins in students:
    try:
        # Prüfe ob bereits eine initial_migration Transaktion existiert
        cursor.execute("""
            SELECT COUNT(*) FROM tcoins_transactions
            WHERE student_id = %s AND reason = 'initial_migration'
        """, (student_id,))
        
        if cursor.fetchone()[0] > 0:
            print(f"Überspringe Schüler ID {student_id} - Migration bereits vorhanden")
            skipped_count += 1
            continue
        
        # Erstelle Transaktion
        cursor.execute("""
            INSERT INTO tcoins_transactions (student_id, amount, reason, reference_id, reference_type)
            VALUES (%s, %s, %s, %s, %s)
        """, (student_id, t_coins, 'initial_migration', None, None))
        
        migrated_count += 1
        
        # Fortschritt anzeigen
        if migrated_count % 100 == 0:
            print(f"{migrated_count} Schüler migriert...")
            
    except mysql.connector.Error as err:
        print(f"Fehler beim Migrieren von Schüler ID {student_id}: {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()
print(f"\nMigration abgeschlossen!")
print(f"Erfolgreich migriert: {migrated_count}")
print(f"Übersprungen (bereits vorhanden): {skipped_count}")
if failed_count > 0:
    print(f"Fehler: {failed_count}")

# 4. Statistiken anzeigen
cursor.execute("SELECT COUNT(*) FROM tcoins_transactions WHERE reason = 'initial_migration'")
total_migrations = cursor.fetchone()[0]

cursor.execute("SELECT SUM(amount) FROM tcoins_transactions WHERE reason = 'initial_migration'")
total_coins = cursor.fetchone()[0] or 0

print(f"\nStatistiken:")
print(f"Gesamt initial_migration Transaktionen: {total_migrations}")
print(f"Gesamt T!Coins in Migration: {total_coins}")

# Verbindung schließen
cursor.close()
conn.close()

print("Migration erfolgreich abgeschlossen!")

