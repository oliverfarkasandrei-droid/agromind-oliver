# AgroMind Premium 🌾

**Aplicație web pentru managementul culturilor agricole** — construită pentru concursul [InfoEducație](https://infoeducatie.ro) (secțiunea Aplicații).

> **Autor:** Oliver Farkas Andrei
> **Colegiu/Liceu:** — *se va completa la înscriere*
> **Profesor coordonator:** — *se va completa la înscriere*

---

## 🚀 Live Demo

🔗 **https://oliverfarkasandrei-droid.github.io/agromind-oliver/**

Aplicația funcționează direct în browser, fără instalare, pe orice dispozitiv (desktop, tabletă, telefon).

---

## 📋 Descriere proiect

AgroMind Premium este o aplicație web modernă destinată fermierilor și agricultorilor amatori care doresc să:

- **Înregistreze culturi** — adaugă, editează și șterge culturi cu detalii complete
- **Monitorizeze progresul** — urmărește stadiul de creștere (Răsărire → Vegetație → Florire → Coacere)
- **Primească prognoze meteo** — date live de la Open-Meteo pentru decizii agricole informate
- **Calculeze îngrășămintele** — recomandări NPK personalizate pe faze de creștere
- **Diagnosticzeze boli** — sistem expert cu scor procentual pentru 3 boli potențiale
- **Își țină jurnalul agricol** — note zilnice cu export CSV/JSON
- **Lucreze offline** — Service Worker permite utilizarea fără conexiune la internet

---

## 🛠️ Tehnologii utilizate

| Tehnologie | Rol |
|---|---|
| HTML5 | Structură semantică, PWA manifest |
| CSS3 | Design responsive, glassmorphism, variabile temă light/dark |
| JavaScript (ES6+) | Logică completă client-side, async/await, Fetch API |
| localStorage | Persistență date locale |
| Service Worker | Cache offline, experiență PWA |
| Open-Meteo API | Date meteo gratuite (fără API key) |
| GitHub Pages | Hosting gratuit + CDN global |

---

## ✨ Funcții Premium

- 🌗 **Dark/Light mode** — comutare instant cu CSS variables
- 🌦️ **Meteo live** — prognoză 7 zile + alerte agricole (ger, secetă)
- 📤 **Export date** — CSV (Excel) și JSON pentru backup
- 📴 **Mod offline** — funcționează fără internet după prima încărcare
- 🤖 **Diagnostic AI** — algoritm bazat pe reguli pentru identificarea bolilor
- 📊 **Grafice Canvas** — vizualizare randament, valoare recolte
- 💰 **Calculator valoare** — preț/kg × cantitate = venit estimat

---

## 📂 Structură fișiere

```
agromind-oliver/
├── index.html          # Aplicație single-page
├── style.css           # Stiluri responsive + teme
├── app.js              # Logică completă (~27KB)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline cache)
└── README.md           # Acest fișier
```

---

## 🧪 Cum rulezi local

1. Clonează repo-ul:
   ```bash
   git clone https://github.com/oliverfarkasandrei-droid/agromind-oliver.git
   cd agromind-oliver
   ```

2. Deschide `index.html` în browser (sau folosește un server local):
   ```bash
   python3 -m http.server 8000
   # Accesează http://localhost:8000
   ```

---

## 📝 Licență

Proiect realizat în scop educațional pentru concursul **InfoEducație 2026**.
Codul sursă este open-source (MIT License) — poate fi folosit ca referință pentru alte proiecte educaționale.

---

*„Tehnologia aduce recolte mai bune."* 🌱
