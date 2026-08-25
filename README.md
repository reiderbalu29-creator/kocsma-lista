# 🍺 KocsmaLista

Egyszerű, mobilbarát webapp kocsmák/sörözők nyilvántartására.

## Jelenlegi funkciók

- kocsmák hozzáadása
- szerkesztés és törlés
- térkép OpenStreetMap + Leaflet alapon
- cím és GPS-koordináta
- sörár
- értékelés
- menü/árak
- megjegyzés
- kép URL
- keresés
- rendezés név, távolság, sörár vagy értékelés szerint
- telefon GPS-ének használata
- távolság automatikus számítása
- mobilbarát felület
- adatok mentése LocalStorage-ba

## Fontos

Ez az első, működő prototípus. Jelenleg az adatok a böngésző LocalStorage-ában vannak, tehát ugyanazon az eszközön/böngészőben maradnak.

### Következő lépés: ingyenes online adatbázis

A következő verzióba érdemes bekötni a Supabase-t:

- online adatbázis
- képek feltöltése
- több eszközről ugyanaz az adat
- opcionális bejelentkezés

Ehhez egy ingyenes Supabase projekt és néhány adatbázis-beállítás szükséges.

## Ingyenes publikálás

A projekt statikus HTML/CSS/JS, ezért GitHub Pages-re egyszerűen feltölthető.

A `index.html`, `style.css` és `app.js` legyen ugyanabban a repository-ban.

## Térkép

A térképet Leaflet és OpenStreetMap adatok szolgálják ki. Az alkalmazásban az OpenStreetMap attribúciója megjelenik a térképen.

## Futtatás

A legegyszerűbb:

1. nyisd meg az `index.html` fájlt böngészőben;
2. vagy töltsd fel GitHub Pages-re.

A helymeghatározás és bizonyos böngészőfunkciók miatt a későbbi online verzió HTTPS-en működjön.
