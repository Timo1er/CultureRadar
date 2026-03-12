import requests
import re

url = "https://api.openagenda.com/v2/agendas/64168411/events?key=8a135178e6c348169f33f0bab8e1dc17&size=5"
response = requests.get(url)
print("Status code:", response.status_code)

try:
    data = response.json()
    for event in data["events"]:
        print("----")
        for k, v in event.items():
            print(f"{k}: {v}")
        print("----")
except Exception as e:
    print("Erreur JSON:", e)

def extract_url(text):
    urls = re.findall(r'https?://\S+', text)
    return urls[0] if urls else ""

def extract_price(text):
    match = re.search(r'(\d+)\s*euros?', text, re.IGNORECASE)
    if match:
        return match.group(0)
    if "gratuit" in text.lower():
        return "Gratuit"
    return "Non communiqué"

def get_event_url(slug):
    if slug:
        return f"https://openagenda.com/agenda/{slug}"
    return "Lien non communiqué"

for event in data["events"]:
    desc = event.get("description", {}).get("fr", "")
    url = extract_url(desc)
    price = extract_price(desc)
    slug = event.get("slug", "")
    event_url = get_event_url(slug)
    print("Titre:", event.get("title", {}).get("fr", ""))
    print("Prix extrait:", price)
    print("Lien extrait du texte:", url)
    print("Lien OpenAgenda:", event_url)
    print("----")