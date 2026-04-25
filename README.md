# Data Companion Framework v2

Multi-loket dashboard framework voor Vlaamse gemeenten.

## Wat is nieuw t.o.v. v1

- **Loketten-navigatie**: meerdere thema-pagina's per gemeente in één URL
- **Sjabloon-systeem**: drie sjablonen (geodata, evolutie, hybride) met aparte rendering
- **URL-routing**: `?gemeente=zwevegem&loket=kaart` werkt direct
- **Browser back/forward**: navigatie blijft consistent
- **Schaalbare structuur**: elk loket is onafhankelijk geconfigureerd

## Bestanden

```
datacompanion-v2/
├── index.html              ← framework (1 bestand)
├── configs/
│   ├── zwevegem.json       ← 3 loketten
│   └── avelgem.json        ← 2 loketten
└── README.md
```

## URLs

- `index.html?gemeente=zwevegem` → eerste loket (Geodata)
- `index.html?gemeente=zwevegem&loket=cijfers` → cijfers-loket
- `index.html?gemeente=zwevegem&loket=klimaat` → klimaat-loket
- `index.html?gemeente=avelgem` → eerste loket Avelgem

## Sjabloon-status

| Sjabloon | Status | Beschrijving |
|---|---|---|
| `geodata` | ✓ Werkt | Interactieve kaart met laag-toggles |
| `evolutie` | Placeholder | Komt in Fase D — Stadsmonitor pipeline nodig |
| `hybride` | Placeholder | Komt in Fase F — combineert beide |

De placeholders tonen een nette "in ontwikkeling" boodschap zodat klanten
zien wat er komt zonder dat het er broken uitziet.

## Nieuwe gemeente toevoegen

1. Kopieer `configs/zwevegem.json` naar `configs/anzegem.json`
2. Wijzig naam, niscode, kleuren, lagen
3. Open `?gemeente=anzegem` in browser

## Nieuw loket toevoegen aan een gemeente

In het config-bestand, voeg item toe aan `loketten`:

```json
{
  "id": "milieu",
  "label": "Milieu",
  "icoon": "🌳",
  "sjabloon": "geodata",
  "groepen": [...]
}
```

Refresh de pagina — het loket verschijnt in de navigatiebalk.

## Opzet productie

Identiek aan v1: GitHub-repo + Netlify auto-deploy.
Vervang het hele framework door deze v2 in je bestaande repo.
