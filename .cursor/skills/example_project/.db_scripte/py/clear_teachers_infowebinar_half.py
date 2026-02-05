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

print("Setze infowebinar auf NULL für etwa 20% der Lehrer...")

# 1. Gesamtanzahl Lehrer und Lehrer mit Sponsor-Schule ermitteln
cursor.execute("SELECT COUNT(*) FROM teachers")
total_teachers = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM teachers t
    JOIN schools s ON t.school_id = s.id
    WHERE s.sponsor IS NOT NULL AND s.sponsor != ''
""")
teachers_with_sponsor = cursor.fetchone()[0]

teachers_without_sponsor = total_teachers - teachers_with_sponsor
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Lehrer mit Sponsor-Schule: {teachers_with_sponsor}")
print(f"Lehrer ohne Sponsor-Schule: {teachers_without_sponsor}")

# 2. Berechne wie viele Lehrer ohne Sponsor auf NULL gesetzt werden müssen
# Ziel: 20% aller Lehrer sollen NULL haben
target_null_total = int(total_teachers * 0.2)
# Lehrer mit Sponsor behalten ihr Datum, also müssen alle anderen auf NULL
target_null_without_sponsor = target_null_total

print(f"Ziel: {target_null_total} Lehrer sollen NULL haben")
print(f"Davon aus Lehrer ohne Sponsor: {target_null_without_sponsor}")

# 3. Alle Lehrer-IDs ohne Sponsor abrufen
cursor.execute("""
    SELECT t.id FROM teachers t
    LEFT JOIN schools s ON t.school_id = s.id
    WHERE s.sponsor IS NULL OR s.sponsor = ''
""")
teachers_without_sponsor_ids = cursor.fetchall()
teacher_ids = [row[0] for row in teachers_without_sponsor_ids]

# 4. Zufällig die benötigte Anzahl auswählen
if target_null_without_sponsor > len(teacher_ids):
    target_null_without_sponsor = len(teacher_ids)
    print(f"Angepasst: Alle {len(teacher_ids)} Lehrer ohne Sponsor werden auf NULL gesetzt")

selected_teachers = random.sample(teacher_ids, target_null_without_sponsor)
print(f"Setze infowebinar auf NULL für {len(selected_teachers)} Lehrer")

# 5. Ausgewählte Lehrer aktualisieren
updated_count = 0
for teacher_id in selected_teachers:
    cursor.execute("""
        UPDATE teachers 
        SET infowebinar = NULL 
        WHERE id = %s
    """, (teacher_id,))
    updated_count += 1
    
    # Fortschritt anzeigen
    if updated_count % 100 == 0:
        print(f"{updated_count} Lehrer aktualisiert...")

# Änderungen speichern
conn.commit()
print(f"Alle {updated_count} Lehrer wurden erfolgreich aktualisiert.")

# 6. Statistiken anzeigen

cursor.execute("SELECT COUNT(*) FROM teachers WHERE infowebinar IS NOT NULL")
with_infowebinar = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM teachers WHERE infowebinar IS NULL")
without_infowebinar = cursor.fetchone()[0]

# Statistiken für Lehrer mit/ohne Sponsor-Schule
cursor.execute("""
    SELECT COUNT(*) FROM teachers t
    JOIN schools s ON t.school_id = s.id
    WHERE s.sponsor IS NOT NULL AND s.sponsor != ''
""")
teachers_with_sponsor = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM teachers t
    JOIN schools s ON t.school_id = s.id
    WHERE s.sponsor IS NOT NULL AND s.sponsor != '' AND t.infowebinar IS NOT NULL
""")
teachers_with_sponsor_and_infowebinar = cursor.fetchone()[0]

print(f"\nStatistiken:")
print(f"Gesamt Lehrer: {total_teachers}")
print(f"Mit Infowebinar-Datum: {with_infowebinar}")
print(f"Ohne Infowebinar-Datum (NULL): {without_infowebinar}")
print(f"Verhältnis NULL: {(without_infowebinar/total_teachers)*100:.1f}%")
print(f"\nSponsor-Statistiken:")
print(f"Lehrer mit Sponsor-Schule: {teachers_with_sponsor}")
print(f"Davon mit Infowebinar-Datum: {teachers_with_sponsor_and_infowebinar}")
print(f"Sponsor-Lehrer Infowebinar-Rate: {(teachers_with_sponsor_and_infowebinar/teachers_with_sponsor)*100:.1f}%")

# Verbindung schließen
cursor.close()
conn.close()

print("Update abgeschlossen!")
