import mysql.connector

conn = mysql.connector.connect(
    host='gfram1.siteground.biz',
    user='upj3mlvklzwuu',
    password='P3201q3991b.',
    database='dbgqpq6nxd7mlp'
)
cursor = conn.cursor()

# Setzt name = <erstes Wort aus altem Namen> + ' ' + <id>
# Beispiel: "AHS 13" -> "AHS 123" (wenn id=123)
update_sql = (
    "UPDATE schools "
    "SET name = CONCAT(SUBSTRING_INDEX(name, ' ', 1), ' ', id)"
)

cursor.execute(update_sql)
print(f"Betroffene Zeilen: {cursor.rowcount}")

conn.commit()
cursor.close()
conn.close()


