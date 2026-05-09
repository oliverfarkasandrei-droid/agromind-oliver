# Documentație tehnică — AgroMind Premium v3.0

**Autor:** Oliver Farkas Andrei  
**Proiect:** AgroMind Premium (InfoEducație 2026)  
**Versiune:** v3.0.0  
**Data:** Mai 2026

---

## 1. Arhitectură software

### 1.1 Tip aplicație
**SPA (Single Page Application)** client-side, 100% statică. Nu necesită backend, server de aplicații sau bază de date externă.

### 1.2 Module funcționale (`app.js`)

| Modul | Responsabilitate | Pattern | Noutăți v3.0 |
|---|---|---|---|
| `Store` | CRUD date, migrare, import/export, validare | Singleton cu `localStorage` | `updateCrop()`, `exportAll()`, `importAll()`, migrare automată v2→v3 |
| `DashboardPage` | Overview + grafice + recomandări + acțiuni rapide | Clasă cu randare canvas | Pie chart distribuție, butoane acțiuni rapide |
| `CropsPage` | CRUD complet culturi, import/export, paginare, sortare | Clasă cu modal editare | Editare (modal), import CSV/JSON, export CSV, paginare (8/pag), 4 moduri sortare |
| `DiseasesPage` | Diagnostic bazat pe reguli cu scor procentual | Algoritm forward-chaining simplu | Neschimbat (deja solid) |
| `FertilizerCalculator` | Recomandare NPK pe faze de creștere + sugestii auto | Lookup table + formula liniară | Sugestii automate pe cultură×fază, 6 tipuri îngrășăminte |
| `JournalManager` | Note zilnice per cultură, export CSV | Array serializat JSON | Paginare (5/pag), 4 moduri sortare, autocomplete culturi |
| `ChartsPage` | Grafice recolte lunare, statistici | Canvas API + devicePixelRatio | Neschimbat (solid) |
| `WeatherManager` | Fetch meteo Open-Meteo + geolocație + alerte + notificări | `fetch` + `async/await` + Geolocation API | Geolocație GPS, 14+ orașe hardcodate, notificări push pentru alerte critice |
| `Notify` | Sistem notificări agricole | Web Notifications API | **Modul nou** — `request()`, `send()`, `toggle()` |
| `ExportManager` | Export/Import CSV+JSON global | Blob + URL.createObjectURL + FileReader | Import JSON complet, export CSV culturi |
| `Router` | Navigare între pagini cu animații | Event delegation + CSS transitions | Animații slide stânga/dreapta |
| `App` | Inițializare, teme, sidebar, conexiune, keyboard nav | Orchestrator | 3 moduri temă, keyboard nav (Alt+1…7), notificări |

### 1.3 Flux de date

```
[User Input] → [Validare client] → [Modul Manager] → [localStorage] → [DOM Update]
                                                ↓
                                    [WeatherManager] → [Open-Meteo API]
                                    [Geolocation API] → [Coordonate GPS]
                                    [Nominatim API] → [Coordonate oraș]
                                    [Notify] → [Web Notification API]
```

---

## 2. Decizii de proiectare

### 2.1 De ce nu framework (React/Vue/Angular)?
- **Cerință concurs:** Codul trebuie să fie ușor de inspectat de juriu.
- **Dimensiune:** Aplicația are ~74KB JS (v3.0); un framework ar adăuga 40–200KB fără beneficiu real.
- **Independență:** Fără build step (`npm install`, `webpack`, etc.). Rulează direct din `index.html`.
- **Performanță:** DOM API direct + event delegation = zero overhead de virtual DOM.

### 2.2 De ce localStorage și nu IndexedDB?
- **Simplitate:** Structura datelor e tabulară (array de obiecte).
- **Compatibilitate:** localStorage are suport 100% browser vs. IndexedDB cu API complex.
- **Volum:** Un fermier mic are < 50 culturi active; JSON serializat < 100KB.
- **Migrare:** Schema versionată (`agromind_premium_v30`) cu funcție `migrate()` care actualizează automat datele vechi.

### 2.3 De ce Open-Meteo + Nominatim?
- **Open-Meteo:** Gratuit, fără API key, fără rate limit, CC BY 4.0; endpoint simplu cu 7 zile prognoză.
- **Nominatim:** OpenStreetMap, gratuit; folosit doar ca fallback când orașul nu e în lista hardcodată (14+ orașe românești).
- **Geolocation API:** Pentru experiență one-click; utilizatorul nu trebuie să știe coordonatele.

### 2.4 De ce Web Notifications API?
- Standard W3C, suport universal (Chrome, Firefox, Safari, Edge).
- Util pentru agricultori: alerte meteo critice (îngheț, caniculă, furtuni) chiar și când aplicația nu e în prim-plan.
- Permisiunea se cere doar când utilizatorul activează explicit butonul 🔔.

### 2.5 De ce glassmorphism + 3 teme?
- Tendință UI 2024–2026 (Apple, Microsoft, Dribbble).
- Implementabil 100% în CSS pur (`backdrop-filter: blur()`).
- 3 moduri: Light (luminos), Dark (întuneric), Auto (detectează `prefers-color-scheme`).
- CSS variables pentru toate culorile → schimbare instant, fără JavaScript pentru culori.

---

## 3. Securitate

### 3.1 Model de amenințări (Threat Model)

| Amenințare | Mitigare |
|---|---|
| XSS (Cross-Site Scripting) | Toate string-uri utilizator sunt inserate prin `textContent`, NU `innerHTML`; `Utils.escapeHTML()` disponibil |
| Data exfiltration | Zero date trimise către server; API extern doar GET meteo și geocodare (fără date personale) |
| localStorage poisoning | Validare tip la citire; `try/catch` la `JSON.parse`; fallback la `defaults()` dacă JSON invalid |
| CSRF | N/A — aplicația nu are endpoint-uri POST/PUT/DELETE pe server |
| Malicious file import | Validare structură în `importAll()` — verifică array-uri, tipuri, migrare forțată; fallback la date existente |

### 3.2 Validare input
- Numere: `parseFloat` + `isFinite` + clamp la min/max rezonabile (ex: suprafață max 1000 ha, randament max 100000 kg/ha).
- String-uri: `trim()` + max length 100 caractere.
- Date: `Date.parse()` + format ISO 8601.
- CSV: parsing robust cu suport pentru ghilimele și virgule în câmpuri.

---

## 4. Performanță

### 4.1 Metrici

| Metrică | Valoare | Tool măsurare |
|---|---|---|
| First Contentful Paint | < 500ms | Lighthouse |
| Time to Interactive | < 1s | Lighthouse |
| Bundle total | ~97KB (HTML+CSS+JS) | `du -b` |
| Transfer meteo | ~3KB per request | DevTools Network |
| localStorage write | < 1ms per operație | DevTools Performance |
| Page transition | 250ms animație | CSS animation |

### 4.2 Optimizări
- **CSS pur** — fără framework CSS (niciun byte nefolosit); variabile CSS pentru culori → zero JS pentru teme.
- **SVG inline / emoji** — iconuri ca emoji-uri Unicode (zero request extern).
- **Lazy weather** — fetch meteo doar când utilizatorul deschide pagina Meteo, nu la load.
- **Service Worker** — cache first pentru assets statice; network fallback pentru API meteo.
- **Paginare** — limitează elemente DOM la 5–8 per pagină; previne degradarea la ferme cu sute de culturi.
- **Debounce** — căutare și filtrare cu debounce 200–250ms; previne re-render-uri excesive.
- **Canvas responsive** — `devicePixelRatio` ≤ 2 pentru a preveni supradimensionarea pe ecrane retina.

---

## 5. Testare

### 5.1 Teste manuale (checklist)

| Scenariu | Pași | Rezultat așteptat |
|---|---|---|
| Adaugă cultură | Completează formular, click Save | Cultura apare în listă + dashboard updates |
| **Editare cultură** | Click "✎", modifică suprafață, Save | Valoare recalculată automat, listă actualizată |
| Ștergere cultură | Click "🗑️", confirmă | Cultura dispare, statistici recalculate |
| **Import CSV** | Click "📥 Import", selectează fișier .csv | Culturile apar în listă cu validare valori |
| **Import JSON** | Click "📤" → "Import JSON complet", selectează .json | Toate datele restaurate, pagină reîncărcată |
| Diagnostic boală | Selectează 3 simptome, Submit | Top 3 boli cu scor procentual |
| **Sugestie automată NPK** | Selectează "Legume" + "Florire" la Calculator | Sugestia apare: "NPK 15-15-15 — Florirea necesită fosfor" |
| Export CSV | Click "Export CSV" în Jurnal | Fișier `.csv` descărcat cu BOM pentru Excel |
| **Export CSV culturi** | Click "📤 Export" în toolbar Culturi | Fișier `.csv` cu toate culturile |
| Toogle temă | Click 🌓 în sidebar | Ciclă: Light → Dark → Auto; notificare toast |
| **Auto dark mode** | Setează tema Auto, schimbă tema sistemului | Aplicația se adaptează automat |
| Meteo live | Deschide pagina Meteo, caută "București" | Afișează prognoză 7 zile |
| **Geolocație GPS** | Click "📍 GPS" în Meteo | Coordonate detectate automat, vreme afișată |
| **Notificări agricole** | Click 🔔 în sidebar → Permite | Notificare de test; alerte meteo livrate când sunt condiții critice |
| Mod offline | Închide Wi-Fi, reîncarcă pagina | Aplicația funcționează, indicator ● devine roșu |
| **Paginare culturi** | Adaugă >8 culturi, navighează cu « » | Paginile se încarcă corect |
| **Sortare jurnal** | Selectează "Cultură A-Z" în sortare | Lista se reordonează alfabetic |
| **Keyboard nav** | Apasă Alt+3 | Navighează la pagina Boli |

### 5.2 Teste cross-browser
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅ (macOS + iOS)
- Edge 120+ ✅

### 5.3 Teste responsive
- Desktop (1920×1080) ✅
- Tabletă (768×1024) ✅
- Telefon (375×812) ✅

### 5.4 Teste accesibilitate
- Screen reader (VoiceOver / NVDA) ✅ — ARIA labels și roluri semantice
- Keyboard-only navigation ✅ — Tab, Enter, Alt+1…7
- Focus-visible ✅ — outline pe toate elementele interactive

---

## 6. API externe

### 6.1 Open-Meteo Forecast API

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Parametri folosiți:**
```
latitude={lat}&longitude={lon}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m
&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum
&timezone=auto
&forecast_days=7
```

**Răspuns tipic (JSON):**
```json
{
  "current": {
    "temperature_2m": 24.5,
    "relative_humidity_2m": 55,
    "weather_code": 1
  },
  "daily": {
    "time": ["2026-05-09", "2026-05-10", ...],
    "temperature_2m_max": [24.5, 26.1, ...],
    "precipitation_sum": [0.0, 2.3, ...]
  }
}
```

**Licență:** CC BY 4.0 — atribuire în cod (`// Data: Open-Meteo CC BY 4.0`).

### 6.2 Nominatim Geocoding API

**Endpoint:** `https://nominatim.openstreetmap.org/search`

**Parametri:**
```
format=json&q={localitate},România&limit=1
```

**Folosit doar ca fallback** când localitatea nu e în lista hardcodată de 14+ orașe românești.

**Licență:** ODbL (OpenStreetMap) — atribuire în documentație.

### 6.3 Web Notifications API

**Specificație:** [W3C Notifications API](https://www.w3.org/TR/notifications/)

**Utilizare:**
- `Notification.requestPermission()` — cerut doar la click pe butonul 🔔
- `new Notification(title, {body, icon})` — trimis pentru alerte meteo critice

**Fallback:** Dacă API-ul nu e suportat sau permisiunea e refuzată, notificările sunt silențios ignorate.

### 6.4 Geolocation API

**Specificație:** [W3C Geolocation API](https://www.w3.org/TR/geolocation/)

**Utilizare:**
- `navigator.geolocation.getCurrentPosition()` — la click pe butonul 📍 GPS
- `enableHighAccuracy: false` + `timeout: 10000` — eficient energetic, tolerant la erori

---

## 7. Service Worker (`sw.js`)

### 7.1 Strategie caching
```
Assets statice (index.html, style.css, app.js, manifest.json):
  → Install: pre-cache în caches.open(CACHE_NAME)
  → Fetch: cache-first (returnează din cache, nu rețea)

API meteo:
  → Fetch: network-only (nu cache-ui date dinamice)
```

### 7.2 Lifecycle
1. `install` → cache-ui assets statice.
2. `activate` → șterge cache-uri vechi.
3. `fetch` → răspunde din cache sau rețea.

---

## 8. Deployment

### GitHub Pages
- Source: branch `master`, folder `/docs`.
- URL: `https://oliverfarkasandrei-droid.github.io/agromind-oliver/`
- CDN: Cloudflare (inclus în GitHub Pages).
- HTTPS: automat.
- Deploy automat la fiecare push pe master.

### Migrare la alt hosting
Fișierele sunt 100% statice. Pur și simplu copiază pe orice server web (Apache, Nginx, Netlify, Vercel, Cloudflare Pages).

---

## 9. Extensibilitate

### 9.1 Funcții planificate (v4.0)
- [ ] Sincronizare cloud opțională (backend minim pentru backup între dispozitive).
- [ ] Harta parcelelor (Leaflet.js + OpenStreetMap).
- [ ] Sistem de irigații inteligent (calcul automat necesar apă pe baza meteo).
- [ ] Marketplace — prețuri live la cereale și legume.
- [ ] Multi-limbă (EN, FR, DE) cu i18n.

### 9.2 Plugin system (arhitectură pregătită)
`app.js` expune `window.router` cu metode:
- `goto(page)` — navigare programatică între pagini
- `pages[page].render(container)` — randare individuală a oricărei pagini

Adăugarea unui modul nou necesită:
1. Clasă nouă ce extinde `Page` cu metoda `render(container)`.
2. Înregistrare în `Router.navItems` și `Router.pages`.
3. Container HTML cu id `{nume}-page` în `index.html`.

---

## 10. Concluzii

AgroMind Premium v3.0 demonstrează că o aplicație agricolă completă, modernă și performantă poate fi construită exclusiv cu tehnologii web native (HTML5, CSS3, JavaScript ES6+), fără framework-uri, fără server și fără costuri de infrastructură. Cele 12 îmbunătățiri majore aduse față de v2.1 — editare, import/export, grafice dashboard, geolocație, sugestii inteligente, animații, notificări, teme adaptive, paginare, sortare și accesibilitate — transformă aplicația dintr-un prototip funcțional într-un produs matur, gata de utilizare în producție.

Arhitectura modulară cu 12 clase independente, pattern-ul SPA și modelul offline-first asigură atât performanță cât și extensibilitate, iar atenția la securitate (zero date pe server, validare input, XSS prevention) și accesibilitate (ARIA, keyboard nav, screen reader) demonstrează o abordare inginerească completă.

---

*Documentație tehnică realizată pentru concursul InfoEducație 2026.*
