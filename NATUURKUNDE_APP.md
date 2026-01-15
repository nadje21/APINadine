# Natuurkunde Oefenapp - Elektriciteit

Een interactieve web-app waar leerlingen van HAVO/VWO onderbouw kunnen oefenen met elektriciteitsberekeningen.

## Functies

### Formules
- **E = P × t** (Energie = Vermogen × tijd)
- **P = U × I** (Vermogen = Spanning × Stroomsterkte)
- **R = U / I** (Weerstand = Spanning / Stroomsterkte)

### Stapsgewijze Methode
De app dwingt leerlingen om de correcte natuurkunde methode te gebruiken:

1. **Gegeven** - Alle gegeven waarden met eenheden opschrijven
2. **Gevraagd** - Aangeven wat er gevraagd wordt
3. **Berekening** - De formule toepassen en uitwerken
4. **Antwoord** - Het eindantwoord met de juiste eenheid

### Features
- AI-gegenereerde opgaven met realistische situaties
- Keuze uit 3 moeilijkheidsgraden (makkelijk, gemiddeld, moeilijk)
- Automatische controle met gedetailleerde feedback
- Score bijhouden per leerling
- Persoonlijke tips bij foute antwoorden
- Responsive design voor alle apparaten

## Setup

### Vereisten
Je hebt een **Gemini API Key** nodig om de app te gebruiken.

### Stap 1: API Key verkrijgen
1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Log in met je Google account
3. Klik op "Get API Key" of "Create API Key"
4. Kopieer je API key

### Stap 2: API Key instellen
Open het `.env` bestand in de root van het project en vervang `your_actual_api_key_here` met je echte API key:

```env
GEMINI_API_KEY=AIzaSy...jouw_echte_key_hier
```

### Stap 3: App starten
```bash
npm run dev
```

### Stap 4: Open de app
Ga naar [http://localhost:3000/natuurkunde](http://localhost:3000/natuurkunde)

## Gebruik

### Voor Leerlingen
1. Vul je naam in
2. Kies een formule type (energie, vermogen of weerstand)
3. Kies een moeilijkheidsgraad
4. Klik op "Start Opgave"
5. Vul stap voor stap je antwoord in:
   - Schrijf eerst wat gegeven is
   - Schrijf wat gevraagd wordt
   - Werk je berekening uit
   - Geef je eindantwoord
6. Krijg automatisch feedback
7. Bekijk je score en doe nog een opgave!

### Voor Docenten
- Alle leerling pogingen worden opgeslagen in de database
- Je kunt de database raadplegen voor statistieken
- De AI geeft constructieve feedback op alle stappen
- Leerlingen worden gedwongen de correcte methode te gebruiken

## Technische Details

### Database
De app gebruikt Supabase met twee tabellen:

- `exercises` - Opgeslagen opgaven
- `user_attempts` - Alle leerling pogingen met feedback

### API Endpoints
- `/api/generate-exercise` - Genereert nieuwe opgaven
- `/api/check-answer` - Controleert antwoorden en geeft feedback

### Frontend
- Next.js 15 met React
- TypeScript voor type safety
- Tailwind CSS voor styling
- Client-side state management met React hooks
- LocalStorage voor naam en score

## Troubleshooting

### "Error: Fout bij genereren opgave"
- Controleer of je `GEMINI_API_KEY` correct is ingesteld in `.env`
- Zorg dat de key begint met `AIzaSy`
- Herstart de dev server na het wijzigen van `.env`

### "AI gaf geen geldige JSON terug"
- Dit kan gebeuren als de AI een onverwacht formaat teruggeeft
- Klik gewoon op "Start Opgave" opnieuw
- Als het blijft gebeuren, check de console logs

### Database errors
- Controleer of de Supabase credentials correct zijn
- Zorg dat de migratie is uitgevoerd
- Check de RLS policies in Supabase dashboard

## Uitbreidingen

Mogelijke uitbreidingen voor de toekomst:
- Meer formules toevoegen (kinematica, dynamica, etc.)
- Groepsuitdagingen met leaderboards
- Uitgebreide statistieken voor docenten
- Exporteren van resultaten naar CSV
- Verschillende thema's voor de interface
- Gamification elementen

## Licentie

Deze app is gemaakt als voorbeeld voor educatieve doeleinden.
