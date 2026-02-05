import mysql.connector
import sys

# Prüfe ob --yes Flag gesetzt ist
auto_confirm = '--yes' in sys.argv or '-y' in sys.argv

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Suche nach verwaisten Student-Usern (role='student' ohne Eintrag in students Tabelle)...")

# Finde alle User mit role='student', die keinen Eintrag in students haben
cursor.execute("""
    SELECT u.id, u.role_id, u.name, u.email, u.created_at
    FROM users u
    LEFT JOIN students s ON u.role_id = s.id
    WHERE u.role = 'student' AND s.id IS NULL
""")
orphaned_users = cursor.fetchall()

print(f"\nGefunden: {len(orphaned_users)} verwaiste Student-User")

if len(orphaned_users) == 0:
    print("Keine verwaisten User gefunden. Nichts zu löschen.")
    cursor.close()
    conn.close()
    exit()

# Zeige Details der zu löschenden User
print("\nZu löschende User:")
print("-" * 80)
for user_id, role_id, name, email, created_at in orphaned_users:
    print(f"  User ID: {user_id}, role_id: {role_id}, Name: {name}, Email: {email}, Erstellt: {created_at}")

# Bestätigung
print("\n" + "=" * 80)
if not auto_confirm:
    try:
        response = input(f"Möchten Sie diese {len(orphaned_users)} User wirklich löschen? (ja/nein): ")
        if response.lower() != 'ja':
            print("Löschen abgebrochen.")
            cursor.close()
            conn.close()
            exit()
    except EOFError:
        print("\nFehler: Keine interaktive Eingabe möglich.")
        print("Verwenden Sie '--yes' oder '-y' als Parameter für automatisches Löschen.")
        print("Beispiel: python delete_orphaned_student_users.py --yes")
        cursor.close()
        conn.close()
        exit()
else:
    print(f"Automatisches Löschen aktiviert. Lösche {len(orphaned_users)} User...")

# Lösche die verwaisten User
deleted_count = 0
failed_count = 0

for user_id, role_id, name, email, created_at in orphaned_users:
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        deleted_count += 1
        print(f"  [OK] User ID {user_id} (role_id: {role_id}, Name: {name}) gelöscht")
    except Exception as err:
        print(f"  [FEHLER] Fehler beim Löschen von User ID {user_id}: {err}")
        failed_count += 1

# Änderungen speichern
conn.commit()

print("\n" + "=" * 80)
print(f"Löschvorgang abgeschlossen!")
print(f"Erfolgreich gelöscht: {deleted_count} User")
if failed_count > 0:
    print(f"Fehler: {failed_count} User konnten nicht gelöscht werden")

# Verbindung schließen
cursor.close()
conn.close()

print("\nSkript abgeschlossen!")

