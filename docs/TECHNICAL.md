# Documentație tehnică — AgroMind Premium

**Autor:** Oliver Farkas Andrei  
**Proiect:** AgroMind Premium (InfoEducație 2026)  
**Versiune:** v1.0.0  
**Data:** Mai 2026

---

## 1. Arhitectură software

### 1.1 Tip aplicație
**SPA (Single Page Application)** client-side, 100% statică. Nu necesită backend, server de aplicații sau bază de date externă.

### 1.2 Module funcționale (`app.js`)

| Modul | Responsabilitate | Pattern |
|---|---|---|
| `CropManager` | CRUD culturi, calcul valoare, statistici | Singleton cu `localStorage` |
| `DiseaseManager` | Diagnostic bazat pe reguli cu scor procentual | Algoritm forward-chaining simplu |
| `FertilizerCalculator` | Recomandare NPK pe faze de creștere | Lookup table + formula liniară |
| `JournalManager` | Note zilnice per cultură | Array serializat JSON |
| `WeatherManager` | Fetch meteo de la Open-Meteo | `fetch` + `async/await` |
| `ExportManager` | Generare CSV/JSON dinamic | Blob + URL.createObjectURL |
| `ThemeManager` | Toggle dark/light mode, persistență | CSS variables + `localStorage` |

### 1.3 Flux de date

```
[User Input] → [Validare client] → [Modul Manager] → [localStorage] → [DOM Update]
                                                ↓
                                         [WeatherManager] → [Open-Meteo API]
```

---

## 2. Decizii de proiectare

### 2.1 De ce nu framework (React/Vue/Angular)?
- **Cerință concurs:** Codul trebuie să fie ușor de inspectat de juriu.
- **Dimensiune:** Aplicația are ~27KB JS; un framework ar adăuga 40–200KB fără beneficiu real.
- **Independență:** Fără build step (`npm install`, `webpack`, etc.). Rulează direct din `index.html`.

### 2.2 De ce localStorage și nu IndexedDB?
- **Simplitate:** Structura datelor e tabulară (array de obiecte).
- **Compatibilitate:** localStorage are suport 100% browser vs. IndexedDB cu API complex.
- **Volum:** Un fermier mic are < 50 culturi active; JSON serializat < 50KB.

### 2.3 De ce Open-Meteo?
- **Gratuit, fără API key**, fără rate limit periculoasă.
- **Sursă deschisă** (CC BY 4.0).
- **Endpoint simplu:** `https://api.open-meteo.com/v1/forecast`.
- **Date suficiente pentru agricultură:** temperatură, precipitații, umiditate, vânt.

### 2.4 De ce glassmorphism?
- Tendință UI 2024–2026 (Apple, Microsoft, Dribbble).
- Implementabil 100% în CSS pur (`backdrop-filter: blur()`).
- Se adaptează automat la ambele teme (light/dark).

---

## 3. Securitate

### 3.1 Model de amenințări (Threat Model)

| Amenințare | Mitigare |
|---|---|
| XSS (Cross-Site Scripting) | Toate string-uri utilizator sunt inserate prin `textContent`, NU `innerHTML` |
| Data exfiltration | Zero date trimise către server; API extern doar GET meteo (fără date personale) |
| localStorage poisoning | Validare tip la citire; fallback la defaults dacă JSON invalid |
| CSRF | N/A — aplicația nu are endpoint-uri POST/PUT/DELETE pe server |

### 3.2 Validare input
- Numere: `parseFloat` + `isFinite` + clamp la min/max rezonabile (ex: suprafață max 1000 ha).
- String-uri: `trim()` + max length 100 caractere.
- Date: `Date.parse()` + range check (anul curent ± 5).

---

## 4. Performanță

### 4.1 Metrici

| Metrică | Valoare | Tool măsurare |
|---|---|---|
| First Contentful Paint | < 500ms | Lighthouse |
| Time to Interactive | < 1s | Lighthouse |
| Bundle total | ~42KB (HTML+CSS+JS) | `du -b` |
| Transfer meteo | ~3KB per request | DevTools Network |
| localStorage write | < 1ms per operație | DevTools Performance |

### 4.2 Optimizări
- **CSS pur** — fără framework CSS (niciun byte nefolosit).
- **SVG inline** — iconuri ca emoji-uri Unicode sau SVG-uri minuscule inline (fără request extern).
- **Lazy weather** — fetch meteo doar când utilizatorul deschide pagina Meteo, nu la load.
- **Service Worker** — cache first pentru assets statice; network fallback pentru API meteo.

---

## 5. Testare

### 5.1 Teste manuale (checklist)

| Scenariu | Pași | Rezultat așteptat |
|---|---|---|
| Adaugă cultură | Completează formular, click Save | Cultura apare în listă + dashboard updates |
| Editare cultură | Click "✎", modifică suprafață, Save | Valoare recalculată automat |
| Ștergere cultură | Click "🗑️", confirmă | Cultura dispare, statistici recalculate |
| Diagnostic boală | Selectează 3 simptome, Submit | Top 3 boli cu scor procentual |
| Export CSV | Click "Export CSV" în Jurnal | Fișier `.csv` descărcat, deschis în Excel |
| Toggle temă | Click 🌓 în header | Toate elementele schimbă culoare instant |
| Meteo live | Deschide pagina Meteo, caută "București" | Afișează prognoză 7 zile |
| Mod offline | Închide Wi-Fi, reîncarcă pagina | Aplicația funcționează (fără meteo nou) |

### 5.2 Teste cross-browser
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅ (macOS + iOS)
- Edge 120+ ✅

### 5.3 Teste responsive
- Desktop (1920×1080) ✅
- Tabletă (768×1024) ✅
- Telefon (375×812) ✅

---

## 6. API externe

### Open-Meteo Forecast API

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Parametri folosiți:**
```
latitude={lat}&longitude={lon}
&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max
&timezone=auto
&forecast_days=7
```

**Răspuns tipic (JSON):**
```json
{
  "daily": {
    "time": ["2026-05-09", "2026-05-10", ...],
    "temperature_2m_max": [24.5, 26.1, ...],
    "precipitation_sum": [0.0, 2.3, ...]
  }
}
```

**Licență:** CC BY 4.0 — atribuire în cod (`// Data: Open-Meteo CC BY 4.0`).

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

### Migrare la alt hosting
Fișierele sunt 100% statice. Pur și simplu copiază pe orice server web (Apache, Nginx, Netlify, Vercel, Cloudflare Pages).

---

## 9. Extensibilitate

### 9.1 Funcții planificate (v1.1.0)
- [ ] Import CSV/JSON (simetric cu export).
- [ ] Notificări locale (Web Notifications) pentru momente cheie (fertilizare, recoltare).
- [ ] Harta parcelelor (Leaflet.js + OpenStreetMap).
- [ ] Sincronizare cloud opțională (backend minim pentru backup).

### 9.2 Plugin system (arhitectură pregătită)
`app.js` expune `window.AgroMindAPI` cu metode:
- `addModule(name, managerClass)` — înregistrează modul nou.
- `getStorage(key)` / `setStorage(key, value)` — abstractizare localStorage.
- `notify(message)` — toast notification centralizat.

---

## 10. Concluzii

AgroMind Premium demonstrează că o aplicație agricolă utilă, modernă și performantă poate fi construită exclusiv cu tehnologii web native, fără costuri de infrastructură sau dependențe de platforme proprietare. Arhitectura modulară și pattern-ul SPA permit extinderea ușoară cu noi funcții, iar modelul offline-first asigură accesibilitate în zone cu conectivitate limitată — un criteriu esențial pentru publicul țintă din mediul rural românesc.

---

*Documentație tehnică realizată pentru concursul InfoEducație 2026.*
