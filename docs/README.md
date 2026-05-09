# AgroMind Premium 🌾

**Aplicație web pentru managementul culturilor agricole** — construită pentru concursul [InfoEducație](https://infoeducatie.ro) (secțiunea Web / Software Utilitar).

> **Autor:** Oliver Farkas Andrei  
> **An școlar:** 2025–2026  
> **Colegiu/Liceu:** — *se va completa la înscriere*  
> **Profesor coordonator:** — *se va completa la înscriere*

---

## 🚀 Live Demo

🔗 **https://oliverfarkasandrei-droid.github.io/agromind-oliver/**

Aplicația rulează direct în browser, fără instalare, pe orice dispozitiv (desktop, tabletă, telefon).

---

## 📋 Descriere proiect

AgroMind Premium v3.0 este o aplicație web modernă destinată fermierilor mici și agricultorilor amatori care doresc să-și organizeze culturile într-un mod digital, fără costuri sau dependență de software proprietar. Aplicația acoperă ciclul complet al unei culturi: de la înregistrarea semințelor, monitorizarea progresului, diagnosticarea bolilor, până la calculul valorii recoltei și prognoza meteo pentru decizii agricole informate.

Versiunea 3.0 aduce 12 îmbunătățiri majore față de v2.1: editare culturi, import CSV/JSON, dashboard cu grafice, geolocație automată, sugestii inteligente pentru îngrășăminte, animații între pagini, notificări agricole, mod automat de temă, export culturi, paginare și sortare avansată, stare conexiune funcțională și accesibilitate completă.

---

## 🔍 Analiza pieței (capitol obligatoriu — 10p)

### Soluții existente

| Soluție | Preț | Offline | Platformă | Limba RO | Notificări | Import/Export | Obs. |
|---|---|---|---|---|---|---|---|
| FarmLogs | $299/an | ❌ | Web | EN | ❌ | Parțial | SaaS scump, target ferme mari |
| AgriWebb | €12/lună | ❌ | Web+App | EN | ✅ | Parțial | Doar Android/iOS, necesită cont |
| AgroGo | Freemium | Parțial | Web | RO | ❌ | Export doar | Funcții limitate la free, publicitate |
| AgroMind Premium v3.0 | **Gratis** | ✅ | **Web (orice dispozitiv)** | **RO** | ✅ | ✅ Import+Export | **Open-source, PWA, fără cont, 7 module** |

### Elemente distinctive / inovații

1. **100% client-side** — nu necesită server, baze de date externe sau cont de utilizator. Datele rămân private în `localStorage`.
2. **Mod offline complet** — Service Worker permite utilizarea fără internet după prima încărcare (util în câmpuri fără semnal).
3. **Diagnostic agricol integrat** — algoritm bazat pe reguli pentru identificarea a 3 boli probabile cu scor procentual (nu există în soluțiile gratuite românești).
4. **Meteo live gratuit** — Open-Meteo (fără API key, fără limitări) + geolocație automată prin GPS browser.
5. **Sugestii inteligente îngrășăminte** — recomandări automate NPK pe baza tipului de cultură și fazei de creștere.
6. **Notificări agricole** — Web Notifications API pentru alerte meteo critice (îngheț, caniculă, furtuni).
7. **Import/Export complet** — suport CSV și JSON bidirecțional; interoperabil cu Excel și orice software agricol.
8. **Design glassmorphism + 3 teme** — interfață modernă, responsive, dark/light/auto (detectează preferința sistemului).
9. **Accesibilitate** — ARIA labels, navigare keyboard (Alt+1–7), focus-visible, suport screen reader.
10. **Paginare + sortare** — navigare eficientă pentru ferme cu multe culturi și intrări în jurnal.

### Public țintă
- Fermieri mici (< 10 ha) din România fără buget pentru software agricol.
- Elevi/studenți în agricultură care doresc să-și organizeze experiențele de laborator.
- Grădinari amatori care vor un jurnal digital al culturilor.

---

## 🛠️ Tehnologii utilizate și justificare

| Tehnologie | Rol | Justificare |
|---|---|---|
| HTML5 | Structură semantică, PWA manifest, ARIA | Standard universal, zero dependințe, accesibilitate nativă |
| CSS3 | Design responsive, glassmorphism, 3 teme, animații | Niciun framework CSS extern — control total asupra pixelilor; `prefers-color-scheme` pentru auto |
| JavaScript (ES6+) | Logică completă client-side, 7 module | Singurul limbaj nativ browser; `fetch`, `async/await`, `Notification API`, `Geolocation API` |
| localStorage | Persistență date locale | Fără server, fără GDPR complex, instant; migrare automată între versiuni |
| Service Worker | Cache offline, experiență PWA | API nativ browser; permite offline după prima vizită |
| Open-Meteo API | Date meteo | Gratuit, fără API key, fără rate limit periculoasă, sursă deschisă |
| Nominatim API | Geocodare localități | OpenStreetMap, gratuit, fără API key |
| Web Notifications API | Notificări agricole | Standard W3C, suport universal în browsere moderne |
| Canvas API | Grafice dashboard și analitice | Randare nativă, fără biblioteci externe, responsive cu devicePixelRatio |
| Git + GitHub | Versionare, hosting | Cerință regulament; GitHub Pages = CDN global gratuit |

**Toate componentele sunt de autor**, cu excepția:
- **Date meteo** — furnizate de [Open-Meteo](https://open-meteo.com) (licență CC BY 4.0, atribuită în cod).
- **Geocodare** — [Nominatim](https://nominatim.org) / OpenStreetMap (ODbL, atribuită).
- **Fonturi** — system-ui stack nativ (niciun font extern descărcat).

---

## ✨ Funcționalități

### Dashboard
- Overview culturi active, suprafață totală, valoare estimată recolte.
- **Grafic pie chart** — distribuție culturi pe categorii (canvas).
- Scor sănătate fermă (0–100) cu factori multipli.
- Recomandări sezoniere adaptive pe lună.
- Calendar agricol lunar cu culturile plantate în luna curentă.
- Butoane acțiuni rapide (Adaugă cultură, Verifică boli, Calculează NPK).

### Management Culturi
- CRUD complet: adaugă, **editează** (modal dedicat), șterge culturi.
- Câmpuri: denumire, tip (cereală, legumă, fruct, plantă aromatică), suprafață (ha), dată semănat, fază creștere, randament estimat (kg/ha), preț/kg, tip sol.
- Calcul automat valoare = suprafață × randament × preț.
- **Paginare** (8 culturi/pagină) + **sortare** (nume, valoare, dată).
- **Filtrare** după categorie și căutare text.
- **Import CSV/JSON** și **Export CSV** dedicat.

### Diagnostic Boli
- Selecție simptome (frunze, tulpină, rădăcină, aspect general).
- Algoritm bazat pe reguli cu scor procentual pentru top 3 boli probabile.
- Recomandări tratament + severitate.
- 6 boli predefinite cu simptome și tratamente detaliate.

### Calculator Îngrășăminte
- Faze de creștere: Răsărire, Vegetație, Florire, Coacere.
- **Sugestii automate** — recomandă tipul optim de îngrășământ pe baza culturii și fazei.
- Calcul NPK personalizat (Azot, Fosfor, Potasiu) + cost estimat în RON.
- 6 tipuri de îngrășăminte: NPK 20-20-20, NPK 15-15-15, Azotat de amoniu, Superfosfat, Sulfat de potasiu, Organic.

### Meteo Live
- Prognoză 7 zile pentru orice localitate din România (14 orașe hardcodate + căutare Nominatim).
- **Geolocație automată** prin buton GPS (browser Geolocation API).
- Temperatură, precipitații, umiditate, vânt, temperatură resimțită.
- Alerte agricole (ger, secetă, vânt puternic, umiditate ridicată).
- **Notificări push** pentru alerte critice când notificările sunt activate.

### Jurnal Agricol
- Note zilnice asociate culturilor cu cantitate, preț, observații.
- **Paginare** (5 intrări/pagină) + **sortare multiplă** (dată, cultură, cantitate).
- Autocomplete culturi din lista existentă.
- Export CSV dedicat jurnalului.

### Grafice Analitice
- Grafic bare recolte lunare pe an, cultură și metrică (cantitate/valoare).
- Statistici: total anual, medie lunară, luna maximă.
- Randare canvas responsive cu suport devicePixelRatio.

### Preferințe
- **3 moduri temă**: Light, Dark, Auto (detectează `prefers-color-scheme`).
- **Notificări agricole** — toggle cu cerere permisiune.
- Export/Import global (CSV culturi, JSON complet).
- Persistență completă în localStorage cu migrare automată între versiuni.

---

## 📂 Structură proiect

```
agromind-oliver/
├── docs/
│   ├── index.html          # Aplicație single-page (SPA) cu ARIA + markup semantic
│   ├── style.css           # Stiluri responsive + 3 teme + animații (~18KB)
│   ├── app.js              # Logică completă, 7 module + utilitare (~74KB)
│   ├── manifest.json       # PWA manifest (icon, theme, display standalone)
│   ├── sw.js               # Service Worker (cache offline)
│   ├── README.md           # Prezentare + analiza pieței (acest fișier)
│   └── TECHNICAL.md        # Documentație tehnică detaliată
└── .git/                   # Versionare Git
```

**Arhitectura software:**
- Pattern **SPA (Single Page Application)** — toate paginile într-un singur HTML; navigare via CSS `display` + JS event listeners.
- **Module funcționale** în `app.js`: `Store`, `DashboardPage`, `CropsPage`, `DiseasesPage`, `FertilizerPage`, `JournalPage`, `ChartsPage`, `WeatherPage`, `Notify`, `ExportManager`, `Router`, `App`.
- **State management** — centralizat în `localStorage` cu namespace `agromind_premium_v30` și migrare automată.
- **Sistem de notificări** — `Notify` class cu integrare Web Notifications API și alerte agricole contextuale.

---

## 🧪 Cum rulezi local

```bash
# 1. Clonează repo-ul
git clone https://github.com/oliverfarkasandrei-droid/agromind-oliver.git
cd agromind-oliver/docs

# 2. Deschide index.html în browser
# (sau folosește un server local pentru CORS complet):
python3 -m http.server 8000
# Accesează http://localhost:8000
```

---

## 📦 Instalare / Deploy

Nu necesită build, bundler sau server. Pur și simplu:
1. Copiază fișierele pe orice hosting static (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
2. Asigură-te că `sw.js` și `manifest.json` sunt în același director cu `index.html`.

---

## 📝 Versionare

- `git tag v1.0.0` — primul release funcțional (mai 2026).
- `git tag v3.0.0` — 12 îmbunătățiri majore (mai 2026).
- Commit-uri descriptive (ex: `feat: AgroMind Premium v3.0 — 12 improvements`).
- Branch `master` — cod stabil pentru deploy.

---

## 🔐 Securitate

- **Zero date pe server** — toate datele rămân în browser-ul utilizatorului.
- **Validare input** — toate formularele normalizează și limitează valorile numerice.
- **XSS prevention** — textul utilizatorului este escapat la afișare (`textContent`, nu `innerHTML`).
- **No eval / no inline scripts dinamice**.
- **Content Security Policy** compatibil — fără script-uri inline, fără `unsafe-eval`.

---

## ♿ Accesibilitate

- **ARIA labels** pe toate elementele interactive (butoane, input-uri, navigation).
- **Roluri semantice**: `navigation`, `toolbar`, `tabpanel`, `dialog`, `status`, `alert`, `listitem`.
- **Navigare keyboard**: `Alt+1` până la `Alt+7` pentru secțiuni; `Tab` și `Enter` pentru formulare.
- **Focus-visible** — toate elementele interactive au outline vizibil la focus.
- **Screen reader** — `aria-live` pe toasts și loading; `aria-modal` pe dialoguri.
- **Contrast** — variabile CSS tematice asigură contrast adecvat în ambele teme.

---

## 📄 Licență

Proiect realizat în scop educațional pentru concursul **InfoEducație 2026**.
Codul sursă este open-source (MIT License) — poate fi folosit ca referință pentru alte proiecte educaționale.

Componente externe:
- Open-Meteo API — [CC BY 4.0](https://open-meteo.com/en/terms)
- Nominatim / OpenStreetMap — [ODbL](https://www.openstreetmap.org/copyright)

---

*„Tehnologia aduce recolte mai bune."* 🌱
