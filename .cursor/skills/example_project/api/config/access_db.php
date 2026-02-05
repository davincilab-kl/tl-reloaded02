<?php
    /**
     * Stellt eine neue MySQLi-Verbindung her, basierend auf ENV-Variablen.
     * Erwartete ENV-Variablen: DB_HOST, DB_USER, DB_PASS, DB_NAME
     */
    
    // Österreichische Zeitzone setzen
    date_default_timezone_set('Europe/Vienna');
    
    function db_connect() {
        $host = "gfram1.siteground.biz";
        $user = "upj3mlvklzwuu";
        $pass = "P3201q3991b.";
        $name = "dbgqpq6nxd7mlp";

        $conn = new mysqli($host, $user, $pass, $name);

        if ($conn->connect_error) {
            http_response_code(500);
            die('Verbindung fehlgeschlagen: ' . $conn->connect_error);
        }

        // UTF-8 sicherstellen
        $conn->set_charset('utf8mb4');
        
        // MySQL Zeitzone auf Österreich setzen
        $conn->query("SET time_zone = '+01:00'");

        return $conn;
    }
?>