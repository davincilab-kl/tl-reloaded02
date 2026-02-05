<?php
    /**
     * Calendly API Konfiguration
     * 
     * Um einen Personal Access Token zu erstellen:
     * 1. Gehe zu https://calendly.com/integrations/api_webhooks
     * 2. Klicke auf "Personal Access Tokens"
     * 3. Erstelle einen neuen Token
     * 4. Kopiere den Token hier hinein
     */
    
    function calendly_config() {
        return [
            'api_token' => 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY3ODA5MjAwLCJqdGkiOiI3YTU2ZjJjNy0yMzJhLTQyZDgtYTg4Ny04ZmJkNWZjYTdiNGQiLCJ1c2VyX3V1aWQiOiJmYzZhNWNmMi1lN2MyLTQ3MjMtYjFmNS1hZjhlZDNmZmViOGQifQ.81qplfhhRI6ketGv1nIcDBFl1BpGSwWzmS7QxMQz4t_ZvRo33Dcr0HakpE6_U1mwLkhRzaLc5yMfxZlEe-oxlA', // Calendly Personal Access Token hier eintragen
            'event_type_uri' => 'https://api.calendly.com/event_types/patrick-thum-davincilab/tlr-test', // Event-Type URI
            'user_uri' => 'https://api.calendly.com/users/fc6a5cf2-e7c2-4723-b1f5-af8ed3ffeb8d', // User/Organization URI (UUID)
            'api_base_url' => 'https://api.calendly.com'
        ];
    }
?>

