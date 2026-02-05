import mysql.connector

# Datenbankverbindung herstellen
conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

print("Lösche Klassen von Lehrkräften, deren Schule nicht freigeschaltet ist...")
print("=" * 70)

try:
    # 1. Hole alle Lehrer, deren Schule nicht freigeschaltet ist (foerderung = 0 oder NULL)
    cursor.execute("""
        SELECT t.id, u.first_name, u.last_name, s.name as school_name, s.foerderung
        FROM teachers t
        INNER JOIN users u ON u.role_id = t.id AND u.role = 'teacher'
        LEFT JOIN schools s ON t.school_id = s.id
        WHERE s.foerderung = 0 OR s.foerderung IS NULL
        ORDER BY t.id ASC
    """)
    
    teachers = cursor.fetchall()
    print(f"Gefundene Lehrer mit nicht freigeschalteter Schule: {len(teachers)}")
    
    if len(teachers) == 0:
        print("Keine Lehrer mit nicht freigeschalteter Schule gefunden. Nichts zu tun.")
        cursor.close()
        conn.close()
        exit(0)
    
    print()

    # 2. Für jeden Lehrer: Klassen löschen
    total_classes_deleted = 0
    total_students_deleted = 0
    total_users_deleted = 0
    total_projects_deleted = 0
    total_teachers = len(teachers)
    
    for idx, teacher in enumerate(teachers, 1):
        teacher_id = teacher[0]
        teacher_name = f"{teacher[1]} {teacher[2]}"
        school_name = teacher[3] or "Keine Schule"
        foerderung = teacher[4]
        
        progress = (idx / total_teachers) * 100
        print(f"[{idx}/{total_teachers} ({progress:.1f}%)] Verarbeite Lehrer ID {teacher_id} ({teacher_name}) - Schule: {school_name} (Förderung: {foerderung})")
        
        # Hole alle Klassen des Lehrers
        cursor.execute("SELECT id FROM classes WHERE teacher_id = %s", (teacher_id,))
        classes = cursor.fetchall()
        
        if len(classes) == 0:
            print(f"  → Keine Klassen gefunden, überspringe...")
            print()
            continue
        
        print(f"  → Gefundene Klassen: {len(classes)}")
        
        classes_deleted = 0
        students_deleted = 0
        users_deleted = 0
        projects_deleted = 0
        
        # Für jede Klasse: Schüler und User löschen, dann Klasse löschen
        for class_row in classes:
            class_id = class_row[0]
            
            # Hole alle Schüler-IDs der Klasse
            cursor.execute("SELECT id FROM students WHERE class_id = %s", (class_id,))
            student_ids = [row[0] for row in cursor.fetchall()]
            
            if len(student_ids) > 0:
                # Lösche zuerst alle zugehörigen User-Einträge
                placeholders = ','.join(['%s'] * len(student_ids))
                cursor.execute(f"""
                    DELETE FROM users 
                    WHERE role_id IN ({placeholders}) AND role = 'student'
                """, tuple(student_ids))
                users_deleted += cursor.rowcount
                
                # Lösche alle Projekte der Schüler (falls vorhanden)
                cursor.execute(f"""
                    DELETE FROM projects 
                    WHERE student_id IN ({placeholders})
                """, tuple(student_ids))
                projects_deleted += cursor.rowcount
                
                # Lösche alle Schüler der Klasse
                cursor.execute("DELETE FROM students WHERE class_id = %s", (class_id,))
                students_deleted += cursor.rowcount
            
            # Lösche die Klasse
            cursor.execute("DELETE FROM classes WHERE id = %s", (class_id,))
            if cursor.rowcount > 0:
                classes_deleted += 1
        
        conn.commit()
        
        print(f"  → Gelöscht: {classes_deleted} Klassen, {students_deleted} Schüler, {users_deleted} User-Einträge, {projects_deleted} Projekte")
        print()
        
        total_classes_deleted += classes_deleted
        total_students_deleted += students_deleted
        total_users_deleted += users_deleted
        total_projects_deleted += projects_deleted
    
    # Zusammenfassung
    print()
    print("=" * 70)
    print("ZUSAMMENFASSUNG:")
    print(f"  Verarbeitete Lehrer: {total_teachers}")
    print(f"  Gelöschte Klassen: {total_classes_deleted}")
    print(f"  Gelöschte Schüler: {total_students_deleted}")
    print(f"  Gelöschte User-Einträge: {total_users_deleted}")
    print(f"  Gelöschte Projekte: {total_projects_deleted}")
    print("=" * 70)
    print("Fertig!")

except mysql.connector.Error as err:
    print(f"FEHLER: {err}")
    conn.rollback()
except Exception as e:
    print(f"FEHLER: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()

