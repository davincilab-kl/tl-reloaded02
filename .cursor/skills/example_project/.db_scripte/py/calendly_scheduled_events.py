import requests
from datetime import datetime

# KONFIGURATION
API_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY3ODA5MjAwLCJqdGkiOiI3YTU2ZjJjNy0yMzJhLTQyZDgtYTg4Ny04ZmJkNWZjYTdiNGQiLCJ1c2VyX3V1aWQiOiJmYzZhNWNmMi1lN2MyLTQ3MjMtYjFmNS1hZjhlZDNmZmViOGQifQ.81qplfhhRI6ketGv1nIcDBFl1BpGSwWzmS7QxMQz4t_ZvRo33Dcr0HakpE6_U1mwLkhRzaLc5yMfxZlEe-oxlA'
BASE_URL = 'https://api.calendly.com'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

def get_invitee_details(event_uri):
    """Holt die Teilnehmer-Details für ein spezifisches Event."""
    url = f"{event_uri}/invitees"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        invitees = response.json().get('collection', [])
        return invitees
    return []

def get_full_schedule():
    try:
        user_uri = 'https://api.calendly.com/users/fc6a5cf2-e7c2-4723-b1f5-af8ed3ffeb8d'

        params = {'user': user_uri, 'status': 'active', 'sort': 'start_time:asc'}
        events_response = requests.get(f"{BASE_URL}/scheduled_events", headers=headers, params=params)
        events_response.raise_for_status()
        events = events_response.json().get('collection', [])

        if not events:
            print("Keine anstehenden Termine gefunden.")
            return

        print(f"{'TERMIN (Lokal)':<20} | {'TEILNEHMER':<20} | {'E-MAIL'}")
        print("-" * 75)

        for event in events:
            # Zeit formatieren
            dt = datetime.fromisoformat(event['start_time'].replace('Z', '+00:00'))
            readable_time = dt.strftime('%d.%m.%Y %H:%M')
            
            # Invitees für dieses Event abrufen
            invitees = get_invitee_details(event['uri'])
            
            if not invitees:
                print(f"{readable_time:<20} | {'Kein Teilnehmer':<20} | -")
            else:
                for person in invitees:
                    name = person.get('name', '-')
                    email = person.get('email', '-')
                    print(f"{readable_time:<20} | {name:<20} | {email}")

    except Exception as e:
        print(f"Fehler: {e}")

if __name__ == "__main__":
    get_full_schedule()