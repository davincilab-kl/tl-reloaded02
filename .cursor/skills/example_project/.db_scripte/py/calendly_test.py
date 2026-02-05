import requests

# KONFIGURATION
API_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY3ODA5MjAwLCJqdGkiOiI3YTU2ZjJjNy0yMzJhLTQyZDgtYTg4Ny04ZmJkNWZjYTdiNGQiLCJ1c2VyX3V1aWQiOiJmYzZhNWNmMi1lN2MyLTQ3MjMtYjFmNS1hZjhlZDNmZmViOGQifQ.81qplfhhRI6ketGv1nIcDBFl1BpGSwWzmS7QxMQz4t_ZvRo33Dcr0HakpE6_U1mwLkhRzaLc5yMfxZlEe-oxlA'
BASE_URL = 'https://api.calendly.com'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

def get_event_types():
    try:        
        user_uri = 'https://api.calendly.com/users/fc6a5cf2-e7c2-4723-b1f5-af8ed3ffeb8d'

        params = {'user': user_uri, 'active': 'true'}
        events_response = requests.get(f"{BASE_URL}/event_types", headers=headers, params=params)
        events_response.raise_for_status()

        event_types = events_response.json().get('collection', [])

        if not event_types:
            print("Keine aktiven Event-Typen gefunden.")
            return

        print(f"{'NAME':<25} | {'DAUER':<10} | {'STATUS'}")
        print("-" * 50)

        for et in event_types:
            name = et['name']
            duration = f"{et['duration']} min"
            active = "Aktiv" if et['active'] else "Inaktiv"
            print(f"{name:<25} | {duration:<10} | {active}")
            print(f"Link: {et['scheduling_url']}\n")

    except requests.exceptions.HTTPError as err:
        print(f"HTTP Fehler: {err}")
    except Exception as e:
        print(f"Ein Fehler ist aufgetreten: {e}")

if __name__ == "__main__":
    get_event_types()