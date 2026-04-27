{
  "$schema": "Data Companion v2 — Gemeente Config",
  "_comment": "Bronverwijzingen (bv. 'geopunt:grb') worden opgelost via sources.json. Nooit rechtstreekse URL's hier invullen.",

  "gemeente": {
    "naam": "Zwevegem",
    "niscode": "34042",
    "fallback_centrum": [50.81, 3.34]
  },

  "dashboard": {
    "titel": "Zwevegem in cijfers",
    "subtitel": "Beleidsdashboard · SDG-monitoring",
    "kleuren": { "primair": "#1a5c3a", "accent": "#e67e22" }
  },

  "bronvermelding": [
    { "naam": "Geopunt / Digitaal Vlaanderen", "url": "https://www.geopunt.be" },
    { "naam": "Basisregisters Vlaanderen", "url": "https://basisregisters.vlaanderen.be" }
  ],

  "loketten": [
    {
      "id": "kaart",
      "label": "Geodata",
      "icoon": "🗺️",
      "sjabloon": "geodata",
      "beschrijving": "Interactieve kaart met Vlaamse open databronnen",
      "groepen": [
        {
          "label": "Basiskaarten",
          "lagen": [
            { "bron": "geopunt:grb", "default_aan": true }
          ]
        },
        {
          "label": "Administratief",
          "lagen": [
            { "bron": "geopunt:gemeentegrenzen", "default_aan": false }
          ]
        }
      ]
    },
    {
      "id": "cijfers",
      "label": "Cijfers & Evoluties",
      "icoon": "📊",
      "badge": "soon",
      "sjabloon": "evolutie",
      "beschrijving": "Bevolkingsmonitor en sociale indicatoren",
      "indicatoren": ["inwoners", "vergrijzing", "kansarmoede"],
      "periode": { "van": 2014, "tot": 2023 },
      "vergelijking": ["avelgem", "anzegem", "harelbeke"]
    },
    {
      "id": "klimaat",
      "label": "Klimaatdashboard",
      "icoon": "🌡️",
      "badge": "soon",
      "sjabloon": "hybride",
      "beschrijving": "Kaart en cijfers gecombineerd voor klimaatadaptatie"
    }
  ]
}
