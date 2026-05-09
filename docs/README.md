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

AgroMind Premium este o aplicație web modernă destinată fermierilor mici și agricultorilor amatori care doresc să-și organizeze culturile într-un mod digital, fără costuri sau dependență de software proprietar. Aplicația acoperă ciclul complet al unei culturi: de la înregistrarea semințelor, monitorizarea progresului, diagnosticarea bolilor, până la calculul valorii recoltei și prognoza meteo pentru decizii agricole informate.

---

## 🔍 Analiza pieței (capitol obligatoriu — 10p)

### Soluții existente

| Soluție | Preț | Offline | Platformă | Limba RO | Obs. |
|---|---|---|---|---|---|
| FarmLogs | $299/an | ❌ | Web | EN | SaaS scump, target ferme mari |
| AgriWebb | €12/lună | ❌ | Web+App | EN | Doar Android/iOS, necesită cont |
| AgroGo | Freemium | Parțial | Web | RO | Funcții limitate la free, publicitate |
| AgroMind Premium | **Gratis** | ✅ | **Web (orice dispozitiv)** | **RO** | **Open-source, PWA, fără cont** |

### Elemente distinctive / inovații

1. **100% client-side** — nu necesită server, baze de date externe sau cont de utilizator. Datele rămân private în `localStorage`.
2. **Mod offline complet** — Service Worker permite utilizarea fără internet după prima încărcare (util în câmpuri fără semnal).
3. **Diagnostic agricol integrat** — algoritm bazat pe reguli pentru identificarea a 3 boli probabile cu scor procentual (nu există în soluțiile gratuite românești).
4. **Meteo live gratuit** — Open-Meteo (fără API key, fără limitări) integrat direct în interfață.
5. **Design glassmorphism + teme** — interfață modernă, responsive, dark/light mode.
6. **Export CSV/JSON** — backup portabil, interoperabil cu Excel.

### Public țintă
- Fermieri mici (< 10 ha) din România fără buget pentru software agricol.
- Elevi/studenți în agricultură care doresc să-și organizeze experiențele de laborator.
- Grădinari amatori care vor un jurnal digital al culturilor.

---

## 🛠️ Tehnologii utilizate și justificare

| Tehnologie | Rol | Justificare |
|---|---|---|
| HTML5 | Structură semantică, PWA manifest | Standard universal, zero dependințe |
| CSS3 | Design responsive, glassmorphism, teme light/dark | Niciun framework CSS extern — control total asupra pixelilor |
| JavaScript (ES6+) | Logică completă client-side | Singurul limbaj nativ browser; `fetch`, `async/await`, `Proxy` pentru reactivitate |
| localStorage | Persistență date locale | Fără server, fără GDPR complex, instant |
| Service Worker | Cache offline, experiență PWA | API nativ browser; permite offline după prima vizită |
| Open-Meteo API | Date meteo | Gratuit, fără API key, fără rate limit periculoasă, sursă deschisă |
| Git + GitHub | Versionare, hosting | Cerință regulament; GitHub Pages = CDN global gratuit |

**Toate componentele sunt de autor**, cu excepția:
- **Date meteo** — furnizate de [Open-Meteo](https://open-meteo.com) (licență CC BY 4.0, atribuită în cod).
- **Fonturi** — system-ui stack nativ (niciun font extern descărcat).

---

## ✨ Funcționalități

### Dashboard
- Overview culturi active, suprafață totală, valoare estimată recolte.
- Grafice canvas: randament pe culturi, distribuție tipuri.
- Statistici automate (medie, maxim/lună).

### Management Culturi
- CRUD complet: adaugă, editează, șterge culturi.
- Câmpuri: denumire, tip (cereală, legumă, fruct, plantă industrială), suprafață (ha), dată semănat, fază creștere, randament estimat (kg/ha), preț/kg.
- Calcul automat valoare = suprafață × randament × preț.

### Diagnostic Boli
- Selecție simptome (frunze, tulpină, rădăcină, aspect general).
- Algoritm bazat pe reguli cu scor procentual pentru top 3 boli probabile.
- Recomandări tratament generice.

### Calculator Îngrășăminte
- Faze de creștere: Răsărire, Vegetație, Florire, Coacere.
- Calcul NPK personalizat pe fază și suprafață.
- Cost estimat în RON.

### Meteo Live
- Prognoză 7 zile pentru orice localitate din România.
- Temperatură, precipitații, umiditate, vânt.
- Alerte agricole (ger, secetă, vânt puternic).

### Jurnal Agricol
- Note zilnice asociate culturilor.
- Export CSV și JSON pentru backup.

### Preferințe
- Toggle dark/light mode (persistat).
- Export global al tuturor datelor.

---

## 📂 Structură proiect

```
agromind-oliver/
├── index.html          # Aplicație single-page (SPA)
├── style.css           # Stiluri responsive + teme light/dark (~14KB)
├── app.js              # Logică completă + meteo + export (~27KB)
├── manifest.json       # PWA manifest (icon, theme, display standalone)
├── sw.js               # Service Worker (cache offline)
├── docs/
│   ├── README.md       # Prezentare + analiza pieței (acest fișier)
│   └── TECHNICAL.md    # Documentație tehnică detaliată
└── .git/               # Versionare Git
```

**Arhitectura software:**
- Pattern **SPA (Single Page Application)** — toate paginile într-un singur HTML; navigare via CSS `display` + JS event listeners.
- **Module funcționale** în `app.js`: `CropManager`, `DiseaseManager`, `FertilizerCalculator`, `JournalManager`, `WeatherManager`, `ExportManager`, `ThemeManager`.
- **State management** — centralizat în `localStorage` cu namespace `agromind_*`.

---

## 🧪 Cum rulezi local

```bash
# 1. Clonează repo-ul
git clone https://github.com/oliverfarkasandrei-droid/agromind-oliver.git
cd agromind-oliver

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

- `git tag v1.0.0` — primul release funcțional.
- Commit-uri descriptive (ex: `Add weather forecast widget`, `Fix offline cache invalidation`).
- Branch `master` — cod stabil pentru deploy.

---

## 🔐 Securitate

- **Zero date pe server** — toate datele rămân în browser-ul utilizatorului.
- **Validare input** — toate formularele normalizează și limitează valorile numerice.
- **XSS prevention** — textul utilizatorului este escapat la afișare (`textContent`, nu `innerHTML`).
- **No eval / no inline scripts dinamice**.

---

## 📄 Licență

Proiect realizat în scop educațional pentru concursul **InfoEducație 2026**.
Codul sursă este open-source (MIT License) — poate fi folosit ca referință pentru alte proiecte educaționale.

Componente externe:
- Open-Meteo API — [CC BY 4.0](https://open-meteo.com/en/terms)

---

*„Tehnologia aduce recolte mai bune."* 🌱
