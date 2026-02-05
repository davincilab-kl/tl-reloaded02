import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Prüfe für alle Lehrkräfte den erfüllten Status und setze email_verified auf 1...")
print("=" * 70)

def get_highest_fulfilled_status(cursor, teacher_id, email_verified, school_id, school_foerderung, status_map):
    """Bestimmt den höchsten Status, den ein Lehrer erfüllen würde"""
    expected_status_id = None
    expected_status_label = None
    current_order = 0
    
    # WICHTIG: Prüfe zuerst alle höheren Status (3-19), unabhängig von email_verified
    # Nur wenn kein höherer Status erfüllt ist, prüfen wir Status 1-2 basierend auf email_verified
    
    # Prüfe ob auf Warteliste (Status 3)
    if school_id:
        cursor.execute("SHOW TABLES LIKE 'teacher_waitlist'")
        has_waitlist_table = cursor.fetchone() is not None
        
        if has_waitlist_table:
            cursor.execute("""
                SELECT COUNT(*) as count FROM teacher_waitlist 
                WHERE teacher_id = %s AND status = 'pending'
            """, (teacher_id,))
            waitlist_result = cursor.fetchone()
            if waitlist_result and waitlist_result[0] > 0:
                if 'warteliste_schule' in status_map:
                    waitlist_order = status_map['warteliste_schule']['order']
                    if waitlist_order > current_order:
                        expected_status_id = status_map['warteliste_schule']['id']
                        expected_status_label = 'warteliste_schule'
                        current_order = waitlist_order
    
    # Prüfe Schule-Status (4, 8) - nur wenn Schule zugewiesen
    if school_id:
        if school_foerderung:
            # Schule gefördert -> Status 8
            if 'schule_aktiv' in status_map:
                schule_aktiv_order = status_map['schule_aktiv']['order']
                if schule_aktiv_order > current_order:
                    expected_status_id = status_map['schule_aktiv']['id']
                    expected_status_label = 'schule_aktiv'
                    current_order = schule_aktiv_order
        else:
            # Schule nicht gefördert -> Status 4
            if 'infowebinar_besuchen' in status_map:
                infowebinar_order = status_map['infowebinar_besuchen']['order']
                if infowebinar_order > current_order:
                    expected_status_id = status_map['infowebinar_besuchen']['id']
                    expected_status_label = 'infowebinar_besuchen'
                    current_order = infowebinar_order
    
    # Status 9: Klasse erstellt
    cursor.execute("SELECT COUNT(*) as count FROM classes WHERE teacher_id = %s", (teacher_id,))
    class_result = cursor.fetchone()
    has_class = class_result and class_result[0] > 0
    
    if has_class and 'klasse_erstellt' in status_map:
        klasse_order = status_map['klasse_erstellt']['order']
        if klasse_order > current_order:
            expected_status_id = status_map['klasse_erstellt']['id']
            expected_status_label = 'klasse_erstellt'
            current_order = klasse_order
    
    # Status 10-19: Prüfe Schüler-Aktivitäten und Projekte
    # Schüler-Daten
    students_sql = """
        SELECT 
            COALESCE(SUM(s.t_coins), 0) AS total_t_coins,
            COUNT(DISTINCT s.id) AS student_count,
            COUNT(DISTINCT CASE WHEN s.t_coins > 5 THEN s.id END) AS students_with_5plus_tcoins,
            COUNT(DISTINCT CASE WHEN COALESCE(s.t_coins, 0) >= 100 THEN s.id END) AS students_with_100plus_tcoins
        FROM students s 
        INNER JOIN classes c ON s.class_id = c.id 
        WHERE c.teacher_id = %s 
            AND s.class_id IS NOT NULL
            AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
    """
    
    cursor.execute(students_sql, (teacher_id,))
    students_data = cursor.fetchone()
    
    # Projekt-Daten
    cursor.execute("SHOW COLUMNS FROM projects LIKE 'status'")
    has_status_column = cursor.fetchone() is not None
    
    cursor.execute("SHOW COLUMNS FROM projects LIKE 'likes'")
    has_likes_column = cursor.fetchone() is not None
    
    projects_sql = """
        SELECT 
            COUNT(DISTINCT p.id) AS total_projects,
            COUNT(DISTINCT CASE WHEN p.status = 'check' THEN p.id END) AS projects_check,
            COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) AS projects_published,
            COUNT(DISTINCT CASE WHEN COALESCE(p.likes, 0) >= 3 THEN p.id END) AS projects_3plus_likes
        FROM projects p
        INNER JOIN students s ON p.student_id = s.id
        INNER JOIN classes c ON s.class_id = c.id
        WHERE c.teacher_id = %s 
            AND s.class_id IS NOT NULL
            AND (s.is_teacher_placeholder = 0 OR s.is_teacher_placeholder IS NULL)
    """
    
    cursor.execute(projects_sql, (teacher_id,))
    projects_data = cursor.fetchone()
    
    if students_data and projects_data:
        total_t_coins = int(students_data[0] or 0)
        student_count = int(students_data[1] or 0)
        students_with_5plus_tcoins = int(students_data[2] or 0)
        students_with_100plus_tcoins = int(students_data[3] or 0)
        
        total_projects = int(projects_data[0] or 0)
        projects_check = int(projects_data[1] or 0) if has_status_column else 0
        projects_published = int(projects_data[2] or 0) if has_status_column else 0
        projects_3plus_likes = int(projects_data[3] or 0) if has_likes_column else 0
        
        # Status 10: 10 T!Coins gesammelt
        if '10_tcoins_gesammelt' in status_map:
            required_t_coins = 10 + student_count
            if total_t_coins >= required_t_coins:
                status_order = status_map['10_tcoins_gesammelt']['order']
                if status_order > current_order:
                    expected_status_id = status_map['10_tcoins_gesammelt']['id']
                    expected_status_label = '10_tcoins_gesammelt'
                    current_order = status_order
        
        # Status 11: 10 Schüler haben mehr als 5 T!Coins
        if '10_schueler_5_tcoins' in status_map and students_with_5plus_tcoins >= 10:
            status_order = status_map['10_schueler_5_tcoins']['order']
            if status_order > current_order:
                expected_status_id = status_map['10_schueler_5_tcoins']['id']
                expected_status_label = '10_schueler_5_tcoins'
                current_order = status_order
        
        # Status 12: 5 Projekte erstellt
        if '5_projekte_erstellt' in status_map and total_projects >= 5:
            status_order = status_map['5_projekte_erstellt']['order']
            if status_order > current_order:
                expected_status_id = status_map['5_projekte_erstellt']['id']
                expected_status_label = '5_projekte_erstellt'
                current_order = status_order
        
        # Status 13: Erstes Projekt eingereicht
        if has_status_column and 'erstes_projekt_eingereicht' in status_map and projects_check >= 1:
            status_order = status_map['erstes_projekt_eingereicht']['order']
            if status_order > current_order:
                expected_status_id = status_map['erstes_projekt_eingereicht']['id']
                expected_status_label = 'erstes_projekt_eingereicht'
                current_order = status_order
        
        # Status 14: Erstes Projekt mit Bewertung
        if has_status_column and 'erstes_projekt_bewertet' in status_map and projects_published >= 1:
            status_order = status_map['erstes_projekt_bewertet']['order']
            if status_order > current_order:
                expected_status_id = status_map['erstes_projekt_bewertet']['id']
                expected_status_label = 'erstes_projekt_bewertet'
                current_order = status_order
        
        # Status 15: Projekt öffentlich
        if has_status_column and 'projekt_oeffentlich' in status_map and projects_published >= 1:
            status_order = status_map['projekt_oeffentlich']['order']
            if status_order > current_order:
                expected_status_id = status_map['projekt_oeffentlich']['id']
                expected_status_label = 'projekt_oeffentlich'
                current_order = status_order
        
        # Status 16: Projekt mit 3+ Likes
        if has_likes_column and 'projekt_3_likes' in status_map and projects_3plus_likes >= 1:
            status_order = status_map['projekt_3_likes']['order']
            if status_order > current_order:
                expected_status_id = status_map['projekt_3_likes']['id']
                expected_status_label = 'projekt_3_likes'
                current_order = status_order
        
        # Status 17: 10+ Projekte veröffentlicht
        if has_status_column and '10_projekte_veroeffentlicht' in status_map and projects_published >= 10:
            status_order = status_map['10_projekte_veroeffentlicht']['order']
            if status_order > current_order:
                expected_status_id = status_map['10_projekte_veroeffentlicht']['id']
                expected_status_label = '10_projekte_veroeffentlicht'
                current_order = status_order
        
        # Status 18: 1 Schüler hat 100+ T!Coins
        if '1_schueler_100_punkte' in status_map and students_with_100plus_tcoins >= 1:
            status_order = status_map['1_schueler_100_punkte']['order']
            if status_order > current_order:
                expected_status_id = status_map['1_schueler_100_punkte']['id']
                expected_status_label = '1_schueler_100_punkte'
                current_order = status_order
        
        # Status 19: 3 Schüler haben 100+ T!Coins
        if '3_schueler_100_punkte' in status_map and students_with_100plus_tcoins >= 3:
            status_order = status_map['3_schueler_100_punkte']['order']
            if status_order > current_order:
                expected_status_id = status_map['3_schueler_100_punkte']['id']
                expected_status_label = '3_schueler_100_punkte'
                current_order = status_order
    
    # Status 1-2: E-Mail-Verifizierung (nur wenn kein höherer Status erfüllt ist)
    if current_order == 0:  # Kein höherer Status erfüllt
        if email_verified != 1:
            # E-Mail nicht verifiziert -> Status 1
            if 'email_bestaetigen' in status_map:
                expected_status_id = status_map['email_bestaetigen']['id']
                expected_status_label = 'email_bestaetigen'
                current_order = status_map['email_bestaetigen']['order']
        else:
            # E-Mail verifiziert -> Status 2
            if 'schule_verbinden' in status_map:
                expected_status_id = status_map['schule_verbinden']['id']
                expected_status_label = 'schule_verbinden'
                current_order = status_map['schule_verbinden']['order']
    
    return expected_status_id, expected_status_label, current_order

try:
    # 1. Prüfe ob email_verified Spalte existiert
    cursor.execute("SHOW COLUMNS FROM users LIKE 'email_verified'")
    has_email_verified = cursor.fetchone() is not None
    
    if not has_email_verified:
        print("FEHLER: Spalte 'email_verified' existiert nicht in der users Tabelle!")
        cursor.close()
        conn.close()
        exit(1)
    
    # 2. Hole alle Status-IDs und order-Werte
    cursor.execute("SELECT id, `order`, label FROM teacher_stati ORDER BY `order` ASC")
    status_rows = cursor.fetchall()
    status_map = {}
    for row in status_rows:
        status_map[row[2]] = {
            'id': row[0],
            'order': row[1]
        }
    
    # Hole order-Wert von Status 1
    status1_order = status_map.get('email_bestaetigen', {}).get('order', 0)
    print(f"Status 1 (email_bestaetigen) hat Order: {status1_order}")
    print()

    # 3. Hole alle Lehrer
    cursor.execute("""
        SELECT t.id, u.id as user_id, u.first_name, u.last_name, u.email,
               u.email_verified, t.school_id, s.foerderung AS school_foerderung
        FROM teachers t
        INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
        LEFT JOIN schools s ON t.school_id = s.id
        ORDER BY t.id ASC
    """)
    
    teachers = cursor.fetchall()
    print(f"Gefundene Lehrer: {len(teachers)}")
    print()

    # 4. Prüfe für jeden Lehrer den erfüllten Status
    updated_count = 0
    already_verified_count = 0
    skipped_count = 0
    total_teachers = len(teachers)
    
    for idx, teacher in enumerate(teachers, 1):
        teacher_id = teacher[0]
        user_id = teacher[1]
        teacher_name = f"{teacher[2]} {teacher[3]}"
        email = teacher[4]
        email_verified = int(teacher[5] or 0)
        school_id = int(teacher[6]) if teacher[6] else None
        school_foerderung = bool(teacher[7]) if teacher[7] is not None else False
        
        progress = (idx / total_teachers) * 100
        
        # Bestimme höchsten erfüllten Status
        expected_status_id, expected_status_label, expected_order = get_highest_fulfilled_status(
            cursor, teacher_id, email_verified, school_id, school_foerderung, status_map
        )
        
        if expected_status_id is None:
            print(f"[{idx}/{total_teachers} ({progress:.1f}%)] Lehrer ID {teacher_id} ({teacher_name}) - Kein Status erfüllt, überspringe")
            skipped_count += 1
            continue
        
        if expected_order <= status1_order:
            print(f"[{idx}/{total_teachers} ({progress:.1f}%)] Lehrer ID {teacher_id} ({teacher_name}) - Status: {expected_status_label} (Order: {expected_order}) - Order <= Status 1, überspringe")
            skipped_count += 1
            continue
        
        if email_verified == 1:
            print(f"[{idx}/{total_teachers} ({progress:.1f}%)] Lehrer ID {teacher_id} ({teacher_name}) - Status: {expected_status_label} (Order: {expected_order}) - email_verified bereits 1")
            already_verified_count += 1
            continue
        
        # Update email_verified auf 1
        cursor.execute("UPDATE users SET email_verified = 1 WHERE id = %s", (user_id,))
        conn.commit()
        updated_count += 1
        
        print(f"[{idx}/{total_teachers} ({progress:.1f}%)] Lehrer ID {teacher_id} ({teacher_name}) - Status: {expected_status_label} (Order: {expected_order}) - email_verified auf 1 gesetzt")
    
    # Zusammenfassung
    print()
    print("=" * 70)
    print("ZUSAMMENFASSUNG:")
    print(f"  Gesamt Lehrer: {total_teachers}")
    print(f"  Aktualisiert (email_verified auf 1 gesetzt): {updated_count}")
    print(f"  Bereits verifiziert (email_verified war bereits 1): {already_verified_count}")
    print(f"  Übersprungen (Status <= 1 oder kein Status erfüllt): {skipped_count}")
    print("=" * 70)
    print("Fertig!")

except mysql.connector.Error as err:
    print(f"FEHLER: {err}")
    conn.rollback()
except Exception as e:
    print(f"FEHLER: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cursor.close()
    conn.close()
