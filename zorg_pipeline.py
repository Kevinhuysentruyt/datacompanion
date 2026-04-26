#!/usr/bin/env python3
"""
Data Companion — Zorgvoorzieningen Pipeline
============================================
Haalt zorgvoorzieningendata op van Geopunt POI API en
converteert naar GeoJSON voor het dashboard.

Databron:
  Zorgvoorzieningen erkend door het Departement Zorg
  https://www.vlaanderen.be/datavindplaats/catalogus/
  zorgvoorzieningen-erkend-door-het-departement-zorg-
  gezondheidszorg-en-woonzorg-via-poi-service

Licentie: Gratis hergebruik (ook commercieel) mits bronvermelding
  Bron: Departement Zorg / Digitaal Vlaanderen

Gebruik:
  python pipelines/zorg_pipeline.py

Output:
  data/zorgvoorzieningen.geojson

Automatisch via GitHub Actions:
  .github/workflows/zorg_pipeline.yml (maandelijks)

Auteur: Kevin Huysentruyt — Data Companion
Versie: 1.0 — april 2026
"""

import json
import os
import sys
import time
from pathlib import Path

# Externe imports — installeer via: pip install requests
try:
    import requests
except ImportError:
    print("FOUT: 'requests' bibliotheek niet gevonden.")
    print("Installeer via: pip install requests")
    sys.exit(1)


# ── CONFIGURATIE ─────────────────────────────────────────────────────────────
# Geopunt POI OGC API Features endpoint
POI_BASE_URL = "https://geo.api.vlaanderen.be/POI/ogc/features/v1/collections/POI/items"

# Badge-grootte: records per API-request (maximum van de API)
BADGE_GROOTTE = 500

# Maximum totaal te laden records
MAX_ITEMS = 5000

# Output bestandspad (relatief aan root van het project)
OUTPUT_PAD = Path("data/zorgvoorzieningen.geojson")

# Wachttijd tussen requests (in seconden) — beleefd voor de API
WACHT_TIJD = 0.5


# ── HOODFUNCTIE ──────────────────────────────────────────────────────────────
def haal_zorgvoorzieningen_op() -> list[dict]:
    """
    Haalt alle zorgvoorzieningen op via badge-gewijze paginering.
    Returnt een lijst van GeoJSON features.
    """
    alle_features = []
    offset = 0

    print(f"Start: ophalen zorgvoorzieningen van Geopunt POI API")
    print(f"Badge-grootte: {BADGE_GROOTTE} | Maximum: {MAX_ITEMS}")
    print("-" * 60)

    while len(alle_features) < MAX_ITEMS:
        deze_badge = min(BADGE_GROOTTE, MAX_ITEMS - len(alle_features))

        params = {
            "f": "application/geo+json",
            "limit": deze_badge,
            "offset": offset,
        }

        try:
            response = requests.get(
                POI_BASE_URL,
                params=params,
                headers={"Accept": "application/geo+json"},
                timeout=30
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"FOUT bij offset {offset}: {e}")
            break

        data = response.json()
        features = data.get("features", [])

        if not features:
            print(f"Geen features meer bij offset {offset} — klaar.")
            break

        alle_features.extend(features)
        print(f"  Badge {offset // BADGE_GROOTTE + 1}: {len(features)} features opgehaald (totaal: {len(alle_features)})")

        # Stoppen als API minder teruggeeft dan gevraagd
        if len(features) < deze_badge:
            print("API heeft alle records teruggegeven.")
            break

        offset += len(features)
        time.sleep(WACHT_TIJD)

    return alle_features


def verwerk_feature(feature: dict) -> dict | None:
    """
    Verwerkt één POI-feature naar een gestandaardiseerd GeoJSON-feature.
    Returnt None als de feature geen coördinaten heeft.
    """
    geometry = feature.get("geometry")
    if not geometry or not geometry.get("coordinates"):
        return None

    props = feature.get("properties", {})

    # Gestandaardiseerde properties — veldnamen zijn consistent over alle features
    verwerkte_props = {
        "name":         props.get("name") or props.get("naam") or "",
        "type":         props.get("theme") or props.get("category") or "",
        "address":      props.get("address") or props.get("adres") or "",
        "municipality": props.get("municipality") or props.get("gemeente") or "",
        "zipcode":      props.get("zipcode") or props.get("postcode") or "",
        "phone":        props.get("phone") or props.get("telefoon") or "",
        "email":        props.get("email") or "",
        "website":      props.get("website") or "",
        "poid":         props.get("POID") or props.get("id") or "",
    }

    return {
        "type": "Feature",
        "geometry": geometry,
        "properties": verwerkte_props
    }


def sla_geojson_op(features: list[dict], pad: Path) -> None:
    """
    Slaat features op als GeoJSON-bestand.
    Maakt de bovenliggende map aan als die niet bestaat.
    """
    pad.parent.mkdir(parents=True, exist_ok=True)

    geojson = {
        "type": "FeatureCollection",
        "features": [f for f in (verwerk_feature(f) for f in features) if f is not None],
        "_metadata": {
            "bron": "Geopunt POI API — Departement Zorg",
            "datum_aanmaak": time.strftime("%Y-%m-%d"),
            "aantal_features": len(features),
            "licentie": "Gratis hergebruik mits bronvermelding — Digitaal Vlaanderen"
        }
    }

    with open(pad, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

    print(f"\nOpgeslagen: {pad}")
    print(f"Aantal features: {len(geojson['features'])}")
    print(f"Bestandsgrootte: {pad.stat().st_size / 1024:.1f} KB")


# ── ENTRY POINT ───────────────────────────────────────────────────────────────
def main():
    # Zorg dat het script werkt vanuit elke werkmap
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)

    print("=" * 60)
    print("Data Companion — Zorgvoorzieningen Pipeline")
    print("=" * 60)

    # Data ophalen
    features = haal_zorgvoorzieningen_op()

    if not features:
        print("\nGEEN DATA OPGEHAALD — pipeline stopt.")
        sys.exit(1)

    # Opslaan als GeoJSON
    sla_geojson_op(features, OUTPUT_PAD)

    print("\nPipeline succesvol afgerond.")
    print(f"Commit '{OUTPUT_PAD}' naar GitHub om het dashboard bij te werken.")


if __name__ == "__main__":
    main()
