// ✅ AgroMind Premium v3.2
// Autor: Oliver Farkas Andrei | InfoEducație 2026
// Îmbunătățiri Hermes Agent: editare culturi, import CSV/JSON, dashboard grafice,
//   geolocație, sugestii automate, animații, notificări, dark mode auto,
//   export culturi, paginare/sortare, stare conexiune, accesibilitate

// ===== UTILITARE =====
class Utils {
    static debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
    static clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    static fmtd(n, d = 2) { return Number.isFinite(n) ? Number(n).toFixed(d) : '0'; }
    static fmtd0(n) { return Number.isFinite(n) ? Math.round(n).toLocaleString('ro-RO') : '0'; }
    static fmtDate(s) { if (!s) return '-'; const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; }
    static getCSSVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#3b82f6'; }
    static escapeHTML(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
    static nowDate() { return new Date().toISOString().split('T')[0]; }
}

class Toast {
    static init() { Toast.container = document.getElementById('toast-container'); if (!Toast.container) { const c = document.createElement('div'); c.className = 'toast-container'; c.id = 'toast-container'; document.body.appendChild(c); Toast.container = c; } }
    static show(msg, type = 'info', duration = 3000) {
        if (!Toast.container) Toast.init();
        const el = document.createElement('div'); el.className = `toast ${type}`; el.setAttribute('role', 'alert'); el.textContent = msg;
        Toast.container.appendChild(el);
        setTimeout(() => { el.style.animation = 'fadeOutUp 0.35s ease-out forwards'; setTimeout(() => { if (el.parentNode) el.remove(); }, 350); }, duration);
    }
}

class Loading {
    static el() { return document.getElementById('loading-overlay'); }
    static show() { Loading.el()?.classList.add('active'); }
    static hide() { Loading.el()?.classList.remove('active'); }
}

class Validators {
    static num(v, min, max) { const n = parseFloat(v); if (!Number.isFinite(n)) return [null, 'Valoare numerică invalidă']; if (n < min || n > max) return [null, `Trebuie să fie între ${min} și ${max}`]; return [n, null]; }
    static nonEmpty(v, label) { const s = String(v || '').trim(); if (!s) return [null, `${label} este obligatoriu`]; return [s, null]; }
}

// ===== STORE =====
class Store {
    constructor() { this.key = 'agromind_premium_v30'; this.data = this.load(); this.migrate(); }
    load() { try { const raw = localStorage.getItem(this.key); if (raw) return JSON.parse(raw); } catch {} return this.defaults(); }
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch { Toast.show('Eroare la salvare date în localStorage. Spațiu plin?', 'error'); } }
    defaults() {
        return {
            crops: [
                {id:1,name:'Tomate',category:'Legume',family:'Solanacee',area:0.5,phase:'Florire',plantedDate:'2026-03-15',seedYield:30000,pricePerKg:8.5,soil:'Lutos-argilos',water:'Moderat',temp:'18-25°C',notes:''},
                {id:2,name:'Cartofi',category:'Legume',family:'Solanacee',area:1.2,phase:'Vegetație',plantedDate:'2026-04-01',seedYield:20000,pricePerKg:3,soil:'Lutos-nisipos',water:'Moderat',temp:'15-20°C',notes:''},
                {id:3,name:'Grâu',category:'Cereale',family:'Poaceae',area:5,phase:'Răsărire',plantedDate:'2025-10-20',seedYield:4500,pricePerKg:1.8,soil:'Chernozem',water:'Redus',temp:'10-20°C',notes:''},
                {id:4,name:'Măr',category:'Fructe',family:'Rosaceae',area:0.8,phase:'Vegetație',plantedDate:'2020-03-10',seedYield:15000,pricePerKg:5,soil:'Lutos',water:'Moderat',temp:'12-22°C',notes:''},
                {id:5,name:'Busuioc',category:'Plante aromatice',family:'Lamiaceae',area:0.1,phase:'Răsărire',plantedDate:'2026-05-01',seedYield:8000,pricePerKg:25,soil:'Bine drenat',water:'Redus',temp:'20-30°C',notes:''},
                {id:6,name:'Porumb',category:'Cereale',family:'Poaceae',area:3,phase:'Răsărire',plantedDate:'2026-04-15',seedYield:8000,pricePerKg:2.5,soil:'Lutos',water:'Moderat',temp:'18-27°C',notes:''},
            ],
            diseases: [
                {id:1,name:'Mana tomatei',symptoms:['pete maro pe frunze','mucegai gri pe fața inferioară','îngălbenire'],treatment:'Fungicide pe bază de cupru. Eliminare frunze afectate.',affected:['Tomate','Cartofi'],severity:'Mare'},
                {id:2,name:'Rugina grâului',symptoms:['pustule portocalii','îngălbenire frunze','ofilire'],treatment:'Fungicide triazolice. Rotația culturilor.',affected:['Grâu'],severity:'Mare'},
                {id:3,name:'Afide',symptoms:['frunze răsucite','substanță lipicioasă','prezență insecte mici verzi'],treatment:'Săpun insecticid sau extract de urzică.',affected:['Tomate','Cartofi','Măr'],severity:'Medie'},
                {id:4,name:'Putregai cenușiu',symptoms:['pete cenușii pe fructe','mucegai flufos','cădere prematură'],treatment:'Ventilare, evitare umezeală. Fungicide.',affected:['Tomate','Legume'],severity:'Mare'},
                {id:5,name:'Făina mărului',symptoms:['depuneri albe pe frunze','deformare'],treatment:'Fungicide sistemice. Soiuri rezistente.',affected:['Măr','Piersic'],severity:'Medie'},
                {id:6,name:'Fuzarioza',symptoms:['ofilire bruscă','tulpini maro','rădăcini putrezite'],treatment:'Solare, tratament semințe. Evitare exces apă.',affected:['Porumb','Grâu'],severity:'Mare'},
            ],
            journals: [
                {id:1,crop:'Tomate',date:'2026-05-10',qty:85,price:8.5,notes:'Prima recoltă, calitate foarte bună'},
                {id:2,crop:'Tomate',date:'2026-05-25',qty:120,price:9,notes:'Recoltă abundentă'},
                {id:3,crop:'Tomate',date:'2026-06-15',qty:200,price:8,notes:'Vârf de sezon'},
                {id:4,crop:'Tomate',date:'2026-07-05',qty:65,price:10,notes:'Sfârșit sezon, calitate premium'},
                {id:5,crop:'Cartofi',date:'2026-08-10',qty:450,price:3,notes:'Recoltă principală'},
                {id:6,crop:'Cartofi',date:'2026-09-02',qty:180,price:3.5,notes:'Lotul 2, mai mici dar buni'},
                {id:7,crop:'Grâu',date:'2026-06-20',qty:3500,price:1.8,notes:'Recoltat cu combina'},
                {id:8,crop:'Grâu',date:'2026-07-10',qty:1200,price:1.9,notes:'Ultima tranșă, calitate panificație'},
                {id:9,crop:'Porumb',date:'2026-08-25',qty:2800,price:2.5,notes:'Porumb boabe, maturitate optimă'},
                {id:10,crop:'Porumb',date:'2026-09-15',qty:1200,price:2.6,notes:'Recoltă târzie, boabe mari'},
                {id:11,crop:'Măr',date:'2026-09-10',qty:600,price:5,notes:'Soiul Jonathan, excelent'},
                {id:12,crop:'Măr',date:'2026-10-05',qty:300,price:6,notes:'Mere târzii, păstrare iarnă'},
                {id:13,crop:'Busuioc',date:'2026-06-01',qty:15,price:25,notes:'Prima tăiere'},
                {id:14,crop:'Busuioc',date:'2026-07-01',qty:22,price:25,notes:'A doua tăiere, aroma intensă'},
                {id:15,crop:'Busuioc',date:'2026-08-01',qty:12,price:28,notes:'Ultima tăiere, uscat pentru iarnă'},
            ], lastId: {crop:6,disease:6,journal:15},
            settings: {theme:'auto',diagnosesUsed:0,lastWeatherCity:'',notificationsEnabled:false},
            weatherCache: null, weatherCacheTime: 0,
        };
    }
    migrate() {
        const d = this.data; if (!d.journals) d.journals = [];
        if (!d.settings) d.settings = {theme:'auto',diagnosesUsed:0,lastWeatherCity:'',notificationsEnabled:false};
        if (d.settings.theme === undefined) d.settings.theme = 'auto';
        if (d.settings.notificationsEnabled === undefined) d.settings.notificationsEnabled = false;
        for (const c of d.crops) {
            c.value = (c.area || 0) * (c.seedYield || 0) * (c.pricePerKg || 0);
            if (!c.phase) c.phase = 'Răsărire'; if (!c.plantedDate) c.plantedDate = '';
            if (!c.seedYield) c.seedYield = 0; if (!c.pricePerKg) c.pricePerKg = 0; if (!c.area) c.area = 0;
        }
        this.save();
    }
    addCrop(crop) { this.data.lastId.crop++; crop.id = this.data.lastId.crop; crop.value = (crop.area||0)*(crop.seedYield||0)*(crop.pricePerKg||0); this.data.crops.push(crop); this.save(); }
    updateCrop(id, updates) { const c = this.data.crops.find(x => x.id === id); if (c) { Object.assign(c, updates); c.value = (c.area||0)*(c.seedYield||0)*(c.pricePerKg||0); this.save(); return true; } return false; }
    deleteCrop(id) { this.data.crops = this.data.crops.filter(c => c.id !== id); this.save(); }
    addJournal(entry) { this.data.lastId.journal++; entry.id = this.data.lastId.journal; this.data.journals.push(entry); this.save(); }
    deleteJournal(id) { this.data.journals = this.data.journals.filter(j => j.id !== id); this.save(); }
    getTotalValue() { return this.data.crops.reduce((s, c) => s + (c.value || 0), 0); }
    getTotalArea()  { return this.data.crops.reduce((s, c) => s + (c.area || 0), 0); }
    exportAll() { return JSON.parse(JSON.stringify(this.data)); }
    importAll(obj) {
        if (!obj || !obj.crops || !Array.isArray(obj.crops)) return false;
        try {
            this.data.crops = obj.crops.map(c => ({...c, value: (c.area||0)*(c.seedYield||0)*(c.pricePerKg||0)}));
            if (obj.diseases && Array.isArray(obj.diseases)) this.data.diseases = obj.diseases;
            if (obj.journals && Array.isArray(obj.journals)) this.data.journals = obj.journals;
            if (obj.settings) this.data.settings = {...this.data.settings, ...obj.settings};
            if (obj.lastId) this.data.lastId = obj.lastId;
            this.save(); return true;
        } catch(e) { return false; }
    }
}

// ===== PAGE BASE =====
class Page {
    constructor(store) { this.store = store; }
    el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) { if (Array.isArray(cls)) e.classList.add(...cls); else e.classList.add(cls); }
        if (text !== undefined) e.textContent = text;
        return e;
    }
}

// ===== DASHBOARD =====
class DashboardPage extends Page {
    render(c) {
        c.innerHTML = '';
        const d = this.store.data;
        const totalC = d.crops.length, totalA = this.store.getTotalArea(), totalV = this.store.getTotalValue(), score = this.calcScore();
        const hdr = this.el('div', 'page-header');
        hdr.appendChild(this.el('h2', null, 'Panou Principal'));
        hdr.appendChild(this.el('p', 'subtitle', 'AgroMind Premium v3.0 — Asistentul digital al fermei tale'));
        c.appendChild(hdr);
        const cards = this.el('div', 'cards');
        cards.appendChild(this.mkCard('🌱', totalC, 'Culturi active'));
        cards.appendChild(this.mkCard('📐', Utils.fmtd(totalA, 1), 'Suprafață totală (ha)'));
        cards.appendChild(this.mkCard('💰', Utils.fmtd0(totalV), 'Valoare estimată (RON)'));
        const scCard = this.mkCard('⚡', score + '/100', 'Sănătate fermă');
        scCard.querySelector('.card-value').style.color = this.scoreColor(score);
        cards.appendChild(scCard);
        c.appendChild(cards);

        // Grafic dashboard
        const chartPanel = this.el('div', 'glass-panel');
        chartPanel.appendChild(this.el('h3', null, '📊 Distribuție culturi'));
        const chartCanvas = document.createElement('canvas'); chartCanvas.id = 'dashboard-chart';
        chartCanvas.style.width = '100%'; chartCanvas.style.height = '280px';
        chartCanvas.setAttribute('role', 'img'); chartCanvas.setAttribute('aria-label', 'Grafic distribuție culturi pe categorii');
        chartPanel.appendChild(chartCanvas);
        c.appendChild(chartPanel);
        setTimeout(() => {
            // Retry until parent has width (animation may still be running)
            const tryDraw = (attempts) => {
                const canvas = document.getElementById('dashboard-chart');
                if (!canvas) return;
                const parent = canvas.parentElement;
                if (parent.clientWidth > 0 || attempts >= 10) {
                    this.drawDashboardChart();
                } else {
                    setTimeout(() => tryDraw(attempts + 1), 100);
                }
            };
            tryDraw(0);
        }, 50);

        const sPanel = this.el('div', 'glass-panel');
        sPanel.appendChild(this.el('h3', null, '🌾 Recomandări sezon: ' + this.currentMonth()));
        for (const r of this.seasonRecs()) { const di = this.el('div', 'list-item'); di.appendChild(this.el('p', null, r)); sPanel.appendChild(di); }
        c.appendChild(sPanel);

        const cPanel = this.el('div', 'glass-panel');
        cPanel.appendChild(this.el('h3', null, '📅 Calendar agricol lunar'));
        for (const item of this.calendarItems()) { const di = this.el('div', 'list-item'); di.appendChild(this.el('p', null, item)); cPanel.appendChild(di); }
        c.appendChild(cPanel);

        // Sugestii rapide
        const fastPanel = this.el('div', 'glass-panel');
        fastPanel.appendChild(this.el('h3', null, '⚡ Acțiuni rapide'));
        const fastBtns = this.el('div'); fastBtns.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
        const addCropBtn = this.el('button', 'btn-primary', '🌱 Adaugă cultură');
        addCropBtn.addEventListener('click', () => { if (window.router) window.router.goto('crops'); });
        const checkBtn = this.el('button', 'btn-secondary', '🦠 Verifică boli');
        checkBtn.addEventListener('click', () => { if (window.router) window.router.goto('diseases'); });
        const fertBtn = this.el('button', 'btn-secondary', '⚗️ Calculează NPK');
        fertBtn.addEventListener('click', () => { if (window.router) window.router.goto('fertilizer'); });
        const reportBtn = this.el('button', 'btn-secondary', '🖨️ Raport'); 
        reportBtn.addEventListener('click', () => this.printReport());
        fastBtns.append(addCropBtn, checkBtn, fertBtn, reportBtn);
        fastPanel.appendChild(fastBtns);
        c.appendChild(fastPanel);

        // Rotația culturilor
        const rotPanel = this.el('div', 'glass-panel');
        rotPanel.appendChild(this.el('h3', null, '🔄 Rotația culturilor'));
        this.buildRotationTable(rotPanel);
        c.appendChild(rotPanel);
    }

    buildRotationTable(panel) {
        // Group crops by family
        const families = {};
        for (const crop of this.store.data.crops) {
            const fam = crop.family || 'Necunoscută';
            if (!families[fam]) families[fam] = [];
            families[fam].push(crop);
        }

        // Rotation rules: same family shouldn't follow itself
        const warnings = [];
        const fams = Object.keys(families);
        for (const fam of fams) {
            if (families[fam].length > 1) {
                warnings.push(`⚠️ ${fam}: ${families[fam].map(c => c.name).join(', ')} — aceeași familie botanică, risc de boli comune`);
            }
        }

        // Ideal rotation sequences
        const rotationGuide = [
            ['Leguminoase', 'Cereale', 'Legume', 'Rădăcinoase'],
            ['Cereale', 'Leguminoase', 'Legume', 'Plante tehnice'],
            ['Legume', 'Cereale', 'Leguminoase', 'Rădăcinoase'],
        ];

        if (!warnings.length) {
            const ok = this.el('p', 'empty-msg');
            ok.textContent = '✅ Nu există conflict de rotație între culturile actuale.';
            ok.style.padding = '12px 0';
            panel.appendChild(ok);
        } else {
            for (const w of warnings) {
                const al = this.el('div', 'alert-warn', w);
                al.style.marginBottom = '8px';
                panel.appendChild(al);
            }
        }

        // Recomandare secvență ideală
        const rec = this.el('div');
        rec.style.cssText = 'margin-top:12px;font-size:13px;color:var(--text-muted)';
        rec.innerHTML = '<strong>📋 Secvență ideală recomandată:</strong> ' + rotationGuide[0].join(' → ') +
            '<br><small>Plantele din aceeași familie nu ar trebui cultivate pe același teren 2 ani consecutivi.</small>';
        panel.appendChild(rec);
    }

    printReport() {
        const d = this.store.data;
        const now = new Date().toLocaleDateString('ro-RO');
        const totalA = this.store.getTotalArea();
        const totalV = this.store.getTotalValue();
        const score = this.calcScore();

        const cropsRows = d.crops.map(c => 
            `<tr><td>${c.name}</td><td>${c.category}</td><td>${c.area} ha</td><td>${c.phase}</td><td>${(c.value||0).toLocaleString('ro-RO')} RON</td></tr>`
        ).join('');

        const printWin = window.open('', '_blank', 'width=900,height=700');
        printWin.document.write(`
            <!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>Raport AgroMind — ${now}</title>
            <style>
                body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1e293b;background:#fff}
                h1{border-bottom:3px solid #3b82f6;padding-bottom:8px;color:#0f172a}
                h2{color:#334155;margin-top:24px;font-size:18px}
                .summary{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
                .stat{background:#f1f5f9;border-radius:10px;padding:16px 20px;flex:1;min-width:140px}
                .stat .val{font-size:28px;font-weight:700;color:#3b82f6}
                .stat .lbl{font-size:12px;color:#64748b}
                table{width:100%;border-collapse:collapse;margin:12px 0}
                th{background:#3b82f6;color:#fff;padding:10px 12px;text-align:left;font-size:13px}
                td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px}
                .footer{margin-top:32px;color:#94a3b8;font-size:11px;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}
                @media print{body{margin:15mm}}
            </style></head>
            <body>
                <h1>🌾 Raport AgroMind Premium v3.2</h1>
                <p>Generat: ${now} · Autor: Oliver Farkas Andrei</p>
                <div class="summary">
                    <div class="stat"><div class="val">${d.crops.length}</div><div class="lbl">Culturi active</div></div>
                    <div class="stat"><div class="val">${totalA.toFixed(1)} ha</div><div class="lbl">Suprafață totală</div></div>
                    <div class="stat"><div class="val">${totalV.toLocaleString('ro-RO')} RON</div><div class="lbl">Valoare estimată</div></div>
                    <div class="stat"><div class="val">${score}/100</div><div class="lbl">Sănătate fermă</div></div>
                </div>
                <h2>🌱 Culturi</h2>
                <table><thead><tr><th>Nume</th><th>Categorie</th><th>Suprafață</th><th>Fază</th><th>Valoare</th></tr></thead><tbody>${cropsRows}</tbody></table>
                <h2>📝 Jurnal recolte (${d.journals.length} intrări)</h2>
                <table><thead><tr><th>Data</th><th>Cultură</th><th>Cantitate</th><th>Preț/kg</th><th>Valoare</th></tr></thead><tbody>
                ${d.journals.slice(0,20).map(j => `<tr><td>${Utils.fmtDate(j.date)}</td><td>${j.crop}</td><td>${j.qty} kg</td><td>${j.price||'—'} RON</td><td>${j.price ? (j.qty*j.price).toFixed(2)+' RON' : '—'}</td></tr>`).join('')}
                </tbody></table>
                <div class="footer">AgroMind Premium v3.2 — Raport generat pe ${now}</div>
            </body></html>
        `);
        printWin.document.close();
        printWin.focus();
        // Auto-print after a short delay to let rendering finish
        setTimeout(() => { try { printWin.print(); } catch(e) {} }, 800);
    }

    drawDashboardChart() {
        const canvas = document.getElementById('dashboard-chart'); if (!canvas) return;
        const parent = canvas.parentElement;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = parent.clientWidth * dpr; canvas.height = 280 * dpr;
        canvas.style.width = parent.clientWidth + 'px'; canvas.style.height = '280px';
        const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = parent.clientWidth, cats = {};
        for (const c of this.store.data.crops) { cats[c.category] = (cats[c.category] || 0) + 1; }
        const entries = Object.entries(cats);
        if (!entries.length) { ctx.fillStyle = Utils.getCSSVar('--text-muted'); ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Nicio cultură adăugată', w/2, 140); return; }
        const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];
        const total = entries.reduce((s, [,v]) => s + v, 0);
        const cx = w * 0.38, cy = 140, r = 100;
        let angle = -Math.PI / 2;
        entries.forEach(([label, val], i) => {
            const slice = (val / total) * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice);
            ctx.fillStyle = colors[i % colors.length]; ctx.fill();
            const mid = angle + slice / 2;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
            ctx.fillText(label, cx + Math.cos(mid) * (r + 20), cy + Math.sin(mid) * (r + 20));
            angle += slice;
        });
        // Legendă
        const lx = cx + r + 40;
        entries.forEach(([label, val], i) => {
            const y = 40 + i * 30;
            ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(lx, y - 8, 16, 16);
            ctx.fillStyle = Utils.getCSSVar('--text'); ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(`${label} (${val})`, lx + 24, y + 4);
        });
    }
    mkCard(icon, val, label) {
        const c = this.el('div', ['card','glass']);
        c.appendChild(this.el('div', 'card-icon', icon));
        c.appendChild(this.el('div', 'card-value', val));
        c.appendChild(this.el('div', 'card-label', label));
        return c;
    }
    currentMonth() { return ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Noi','Dec'][new Date().getMonth()]; }
    seasonRecs() {
        const m = new Date().getMonth(), r = [];
        if (m >= 2 && m <= 4) { r.push('🌱 Sezon de semănat: tomate, ardei, porumb'); r.push('💧 Irigare atentă, risc de îngheț nocturn'); }
        if (m >= 3 && m <= 5) r.push('🌾 Grâu: monitorizare rugină, tratament fungicid');
        if (m >= 5 && m <= 7) r.push('☀️ Irigare regulată, protecție contra secetei');
        if (m >= 7 && m <= 9) r.push('🍎 Recoltare mere, atenție la făinare');
        if (m >= 8 && m <= 10) r.push('🥔 Recoltare cartofi, depozitare uscată');
        if (m === 10 || m === 11) r.push('🌾 Semănat grâu de toamnă');
        if (m === 11 || m === 0) r.push('❄️ Protejare culturi sensibile la îngheț');
        if (!r.length) r.push('📋 Revizuiește planul de îngrășăminte');
        return r;
    }
    calendarItems() {
        const m = new Date().getMonth(), names = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'], out = [];
        for (const c of this.store.data.crops) { if (c.plantedDate) { const pm = parseInt(c.plantedDate.split('-')[1]) - 1; if (pm === m) out.push(`🌱 ${c.name}: plantată în ${names[m]} — monitorizează apă/boli`); } }
        if (!out.length) out.push('📅 Nicio cultură plantată în luna curentă');
        return out;
    }
    calcScore() {
        const d = this.store.data;
        const cats = Math.min(25, new Set(d.crops.map(c => c.category)).size * 5);
        const area = Math.min(25, this.store.getTotalArea() / 4);
        const act = Math.min(25, d.journals.length * 1.25);
        const doc = Math.min(15, d.diseases.length * 2.5);
        const weather = d.weatherCache ? 7 : 0;
        const diag = Math.min(8, (d.settings.diagnosesUsed || 0) * 2);
        const crops = Math.min(20, d.crops.length * 2);
        return Utils.clamp(Math.round(cats + area + act + doc + weather + diag + crops), 0, 100);
    }
    scoreColor(s) { return s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444'; }
}

// ===== CULTURI =====
class CropsPage extends Page {
    constructor(store) { super(store); this.pageSize = 8; this.currentPage = 0; }
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('🌱 Culturi'));
        c.appendChild(this.buildToolbar());
        this.listEl = this.el('div', 'list'); this.listEl.id = 'crops-list';
        c.appendChild(this.listEl);
        c.appendChild(this.buildPagination());
        this.updateList();
        c.appendChild(this.buildForm());
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    buildToolbar() {
        const t = this.el('div', 'toolbar'); t.setAttribute('role', 'toolbar'); t.setAttribute('aria-label', 'Instrumente culturi');
        const search = this.el('input'); search.type = 'text'; search.placeholder = '🔍 Caută culturi...'; search.setAttribute('aria-label', 'Caută culturi');
        search.addEventListener('input', Utils.debounce(() => { this.currentPage = 0; this.updateList(); }, 250));
        search.id = 'crop-search'; t.appendChild(search);
        const sel = this.el('select'); sel.id = 'crop-filter'; sel.setAttribute('aria-label', 'Filtrează categorie');
        sel.innerHTML = '<option value="">Toate categoriile</option><option>Legume</option><option>Cereale</option><option>Fructe</option><option>Plante aromatice</option>';
        sel.addEventListener('change', () => { this.currentPage = 0; this.updateList(); }); t.appendChild(sel);
        const sortSel = this.el('select'); sortSel.id = 'crop-sort'; sortSel.setAttribute('aria-label', 'Sortează culturi');
        sortSel.innerHTML = '<option value="name">Nume A-Z</option><option value="value-desc">Valoare ↓</option><option value="value-asc">Valoare ↑</option><option value="date-desc">Cele mai noi</option>';
        sortSel.addEventListener('change', () => { this.currentPage = 0; this.updateList(); }); t.appendChild(sortSel);
        const impBtn = this.el('button', 'btn-secondary', '📥 Import');
        impBtn.addEventListener('click', () => this.showImportModal()); t.appendChild(impBtn);
        const expBtn = this.el('button', 'btn-secondary', '📤 Export');
        expBtn.addEventListener('click', () => this.exportCrops()); t.appendChild(expBtn);
        const btn = this.el('button', 'btn-primary', '+ Adaugă'); btn.setAttribute('aria-label', 'Adaugă cultură nouă');
        btn.addEventListener('click', () => { const f = document.getElementById('add-form'); const visible = f.style.display !== 'none'; f.style.display = visible ? 'none' : 'block'; if (!visible) f.scrollIntoView({behavior:'smooth',block:'center'}); }); t.appendChild(btn);
        return t;
    }
    updateList() {
        const f = (document.getElementById('crop-filter')?.value || '').trim();
        const s = (document.getElementById('crop-search')?.value || '').toLowerCase().trim();
        const sort = document.getElementById('crop-sort')?.value || 'name';
        let items = [...this.store.data.crops];
        if (f) items = items.filter(c => c.category === f);
        if (s) items = items.filter(c => (c.name || '').toLowerCase().includes(s) || (c.soil || '').toLowerCase().includes(s));
        if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
        else if (sort === 'value-desc') items.sort((a, b) => (b.value||0) - (a.value||0));
        else if (sort === 'value-asc') items.sort((a, b) => (a.value||0) - (b.value||0));
        else if (sort === 'date-desc') items.sort((a, b) => (b.plantedDate||'').localeCompare(a.plantedDate||''));
        const total = items.length, pages = Math.ceil(total / this.pageSize);
        this.currentPage = Math.min(this.currentPage, Math.max(0, pages - 1));
        items = items.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
        this.listEl.innerHTML = '';
        if (!items.length) { this.listEl.appendChild(this.el('p', 'empty-msg', 'Nicio cultură găsită.')); this.updatePagination(0, 0); return; }
        for (const c of items) {
            const it = this.el('div', 'list-item'); it.setAttribute('tabindex', '0'); it.setAttribute('role', 'listitem');
            const left = this.el('div');
            const h4 = this.el('h4', null, c.name);
            const tag = this.el('span', 'tag', c.category); tag.style.marginLeft = '8px'; h4.appendChild(tag);
            left.appendChild(h4);
            left.appendChild(this.el('p', null, `Suprafață: ${c.area} ha | Fază: ${c.phase} | Randament: ${c.seedYield} kg/ha | Preț: ${c.pricePerKg} RON/kg`));
            left.appendChild(this.el('p', null, `Valoare estimată: ${Utils.fmtd0(c.value)} RON | Plantat: ${Utils.fmtDate(c.plantedDate)}`));
            const actions = this.el('div'); actions.style.cssText = 'display:flex;gap:6px;flex-shrink:0';
            const editBtn = this.el('button', 'btn-secondary', '✎'); editBtn.setAttribute('aria-label', `Editează ${c.name}`);
            editBtn.addEventListener('click', () => this.showEditModal(c));
            const delBtn = this.el('button', 'btn-secondary', '🗑️'); delBtn.style.color = 'var(--danger)'; delBtn.setAttribute('aria-label', `Șterge ${c.name}`);
            delBtn.addEventListener('click', () => { if (confirm(`Șterge cultura "${c.name}"?`)) { this.store.deleteCrop(c.id); Toast.show('Cultură ștearsă', 'success'); this.updateList(); } });
            actions.append(editBtn, delBtn); it.append(left, actions); this.listEl.appendChild(it);
        }
        this.updatePagination(this.currentPage, pages);
    }
    buildPagination() { const p = this.el('div', 'pagination'); p.id = 'crop-pagination'; return p; }
    updatePagination(cur, total) {
        const el = document.getElementById('crop-pagination'); if (!el) return;
        el.innerHTML = '';
        if (total <= 1) return;
        el.appendChild(this.pgBtn('«', 0, cur === 0));
        for (let i = Math.max(0, cur - 1); i < Math.min(total, cur + 3); i++) {
            el.appendChild(this.pgBtn(String(i + 1), i, i === cur));
        }
        el.appendChild(this.pgBtn('»', total - 1, cur === total - 1));
    }
    pgBtn(label, page, disabled) {
        const b = this.el('button'); b.textContent = label; b.className = disabled ? 'pg-btn active' : 'pg-btn';
        if (!disabled) b.addEventListener('click', () => { this.currentPage = page; this.updateList(); });
        else b.disabled = true;
        return b;
    }
    showEditModal(crop) {
        let modal = document.getElementById('edit-modal');
        if (!modal) { modal = document.createElement('div'); modal.id = 'edit-modal'; modal.className = 'modal'; modal.innerHTML = '<div class="modal-content" id="edit-modal-content"></div>'; document.body.appendChild(modal); }
        const mc = document.getElementById('edit-modal-content');
        mc.innerHTML = ''; mc.appendChild(this.el('h3', null, '✎ Editează cultură'));
        const form = this.el('form'); form.className = 'form';
        form.appendChild(this.inp('e-name', 'Nume cultură *', 'text', true, null, crop.name));
        form.appendChild(this.sel('e-cat', 'Categorie', [['Legume'],['Cereale'],['Fructe'],['aromatice','Plante aromatice']], crop.category));
        form.appendChild(this.inp('e-area', 'Suprafață (ha) *', 'number', true, '0.01', String(crop.area)));
        form.appendChild(this.sel('e-phase', 'Fază creștere', [['Răsărire'],['Vegetație'],['Florire'],['Coacere'],['Recoltare']], crop.phase));
        form.appendChild(this.inp('e-planted', 'Data plantare', 'date', false, null, crop.plantedDate));
        form.appendChild(this.inp('e-yield', 'Randament estimat (kg/ha) *', 'number', true, '1', String(crop.seedYield)));
        form.appendChild(this.inp('e-price', 'Preț/kg (RON) *', 'number', true, '0.01', String(crop.pricePerKg)));
        form.appendChild(this.inp('e-soil', 'Tip sol', 'text', false, null, crop.soil));
        const btns = this.el('div'); btns.style.cssText = 'display:flex;gap:10px;margin-top:8px';
        const sub = this.el('button', 'btn-primary', 'Salvează'); sub.type = 'submit';
        const can = this.el('button', 'btn-secondary', 'Anulează'); can.type = 'button'; can.addEventListener('click', () => modal.classList.remove('open'));
        btns.append(sub, can); form.appendChild(btns);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const [name, eN] = Validators.nonEmpty(form.querySelector('#e-name').value, 'Numele');
            const [area, eA] = Validators.num(form.querySelector('#e-area').value, 0.001, 1000);
            const [sy, eY] = Validators.num(form.querySelector('#e-yield').value, 0, 100000);
            const [pr, eP] = Validators.num(form.querySelector('#e-price').value, 0, 10000);
            if (eN || eA || eY || eP) { Toast.show([eN, eA, eY, eP].find(Boolean), 'error'); return; }
            this.store.updateCrop(crop.id, {name, category: form.querySelector('#e-cat').value, area, phase: form.querySelector('#e-phase').value, plantedDate: form.querySelector('#e-planted').value, seedYield: sy, pricePerKg: pr, soil: form.querySelector('#e-soil').value});
            Toast.show('Cultură actualizată!', 'success'); modal.classList.remove('open'); this.updateList();
        });
        mc.appendChild(form);
        modal.addEventListener('click', ev => { if (ev.target === modal) modal.classList.remove('open'); });
        modal.classList.add('open');
    }
    buildForm() {
        const wrap = this.el('div', 'glass-panel'); wrap.style.display = 'none'; wrap.id = 'add-form';
        wrap.appendChild(this.el('h3', null, 'Adaugă cultură nouă'));
        const form = this.el('form'); form.id = 'crop-form'; form.className = 'form';
        form.appendChild(this.inp('c-name', 'Nume cultură *', 'text', true));
        form.appendChild(this.sel('c-cat', 'Categorie', [['Legume'],['Cereale'],['Fructe'],['aromatice','Plante aromatice']]));
        form.appendChild(this.inp('c-area', 'Suprafață (ha) *', 'number', true, '0.01'));
        form.appendChild(this.sel('c-phase', 'Fază creștere', [['Răsărire'],['Vegetație'],['Florire'],['Coacere'],['Recoltare']]));
        form.appendChild(this.inp('c-planted', 'Data plantare', 'date', false, null, Utils.nowDate()));
        form.appendChild(this.inp('c-yield', 'Randament estimat (kg/ha) *', 'number', true, '1'));
        form.appendChild(this.inp('c-price', 'Preț/kg (RON) *', 'number', true, '0.01'));
        form.appendChild(this.inp('c-soil', 'Tip sol', 'text', false));
        const btns = this.el('div'); btns.style.cssText = 'display:flex;gap:10px;margin-top:8px';
        const sub = this.el('button', 'btn-primary', 'Salvează'); sub.type = 'submit';
        const can = this.el('button', 'btn-secondary', 'Anulează'); can.type = 'button';
        can.addEventListener('click', () => { form.reset(); wrap.style.display = 'none'; });
        btns.append(sub, can); form.appendChild(btns);
        form.addEventListener('submit', ev => {
            ev.preventDefault();
            const [name, eN] = Validators.nonEmpty(form.querySelector('#c-name').value, 'Numele');
            const [area, eA] = Validators.num(form.querySelector('#c-area').value, 0.001, 1000);
            const [sy, eY] = Validators.num(form.querySelector('#c-yield').value, 0, 100000);
            const [pr, eP] = Validators.num(form.querySelector('#c-price').value, 0, 10000);
            if (eN || eA || eY || eP) { Toast.show([eN, eA, eY, eP].find(Boolean), 'error'); return; }
            this.store.addCrop({name, category: form.querySelector('#c-cat').value, area, phase: form.querySelector('#c-phase').value, plantedDate: form.querySelector('#c-planted').value, seedYield: sy, pricePerKg: pr, soil: form.querySelector('#c-soil').value, water: '', temp: '', notes: ''});
            Toast.show('Cultură adăugată!', 'success'); form.reset(); wrap.style.display = 'none'; this.updateList();
        });
        wrap.appendChild(form); return wrap;
    }
    showImportModal() {
        let modal = document.getElementById('import-modal');
        if (!modal) { modal = document.createElement('div'); modal.id = 'import-modal'; modal.className = 'modal'; modal.innerHTML = '<div class="modal-content" id="import-modal-content"></div>'; document.body.appendChild(modal); }
        const mc = document.getElementById('import-modal-content');
        mc.innerHTML = ''; mc.appendChild(this.el('h3', null, '📥 Import date'));
        mc.appendChild(this.el('p', null, 'Selectează formatul și fișierul:'));
        const fileInp = this.el('input'); fileInp.type = 'file'; fileInp.accept = '.csv,.json'; fileInp.style.cssText = 'margin:12px 0;display:block';
        mc.appendChild(fileInp);
        const btns = this.el('div'); btns.style.cssText = 'display:flex;gap:10px;margin-top:8px';
        const impBtn = this.el('button', 'btn-primary', 'Importă');
        impBtn.addEventListener('click', () => {
            const file = fileInp.files[0]; if (!file) { Toast.show('Selectează un fișier', 'warn'); return; }
            const reader = new FileReader();
            reader.onload = () => {
                const ext = file.name.split('.').pop().toLowerCase();
                if (ext === 'json') { try { const obj = JSON.parse(reader.result); if (this.store.importAll(obj)) { Toast.show('Import JSON reușit!', 'success'); this.updateList(); modal.classList.remove('open'); } else Toast.show('Format JSON invalid', 'error'); } catch { Toast.show('JSON corupt', 'error'); } }
                else if (ext === 'csv') { this.parseCSV(reader.result, modal); }
                else { Toast.show('Format necunoscut', 'error'); }
            };
            reader.readAsText(file);
        });
        const canBtn = this.el('button', 'btn-secondary', 'Anulează'); canBtn.addEventListener('click', () => modal.classList.remove('open'));
        btns.append(impBtn, canBtn); mc.appendChild(btns);
        modal.addEventListener('click', ev => { if (ev.target === modal) modal.classList.remove('open'); });
        modal.classList.add('open');
    }
    parseCSV(content, modal) {
        const lines = content.trim().split(/\r?\n/);
        if (lines.length < 2) { Toast.show('CSV gol', 'error'); return; }
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const crops = [];
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            const row = {};
            headers.forEach((h, idx) => row[h] = String(vals[idx] || '').replace(/^"|"$/g, ''));
            if (row['Nume']) {
                crops.push({name: row['Nume']||row['name']||'', category: row['Categorie']||row['category']||'Legume', area: parseFloat(row['Suprafață_ha']||row['area'])||0, phase: row['Fază']||row['phase']||'Răsărire', plantedDate: row['Data_plantare']||row['plantedDate']||'', seedYield: parseFloat(row['Randament_kg_ha']||row['seedYield'])||0, pricePerKg: parseFloat(row['Preț_kg']||row['pricePerKg'])||0, soil: row['Sol']||row['soil']||'', water:'', temp:'', notes:''});
            }
        }
        if (!crops.length) { Toast.show('Nicio cultură validă în CSV', 'error'); return; }
        this.store.data.crops = [...this.store.data.crops, ...crops];
        this.store.data.lastId.crop += crops.length;
        this.store.save();
        Toast.show(`${crops.length} culturi importate!`, 'success'); this.updateList(); modal.classList.remove('open');
    }
    exportCrops() {
        const rows = this.store.data.crops.map(c => [c.name, c.category, c.area, c.phase, c.plantedDate, c.seedYield, c.pricePerKg, c.value, c.soil]);
        const csv = [['Nume','Categorie','Suprafață_ha','Fază','Data_plantare','Randament_kg_ha','Preț_kg','Valoare_RON','Sol'], ...rows]
            .map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-culturi.csv'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('Culturi exportate CSV!', 'success');
    }
    inp(id, label, type, req, step, val) {
        const w = this.el('div'); w.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        const lbl = this.el('label', null, label + (req ? ' *' : '')); lbl.setAttribute('for', id); w.appendChild(lbl);
        const i = this.el('input'); i.type = type; i.id = id; i.required = !!req; i.value = val || '';
        if (step) { i.step = step; i.min = '0'; }
        w.appendChild(i); return w;
    }
    sel(id, label, opts, selVal) {
        const w = this.el('div'); w.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        const lbl = this.el('label', null, label); lbl.setAttribute('for', id); w.appendChild(lbl);
        const s = this.el('select'); s.id = id;
        for (const [v, t] of opts) { const o = this.el('option', null, t || v); o.value = v; if (v === selVal) o.selected = true; s.appendChild(o); }
        w.appendChild(s); return w;
    }
}

// ===== BOLI =====
class DiseasesPage extends Page {
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('🦠 Boli și Dăunători'));
        const srch = this.el('div', 'toolbar');
        const input = this.el('input'); input.type = 'text'; input.placeholder = '🔍 Caută simptome sau nume...'; input.id = 'disease-search';
        input.setAttribute('aria-label', 'Caută boli');
        input.addEventListener('input', Utils.debounce(() => this.renderList(c), 200));
        srch.appendChild(input);
        const di = this.el('button', 'btn-primary', '🤖 Diagnostic AI');
        di.addEventListener('click', () => document.getElementById('diag-panel')?.scrollIntoView({behavior:'smooth'}));
        srch.appendChild(di); c.appendChild(srch);
        this.renderList(c);
        const panel = this.el('div', 'glass-panel'); panel.id = 'diag-panel';
        panel.appendChild(this.el('h3', null, '🔬 Diagnostic rapid inteligent'));
        panel.appendChild(this.el('p', null, 'Selectează simptomele observate pe plantă:'));
        const cg = this.el('div', 'checkbox-grid');
        for (const s of [...new Set(this.store.data.diseases.flatMap(d => d.symptoms))]) {
            const lb = document.createElement('label'); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = s; cb.setAttribute('aria-label', s); lb.append(cb, document.createTextNode(' ' + s)); cg.appendChild(lb);
        }
        panel.appendChild(cg);
        const anBtn = this.el('button', 'btn-primary', '🔍 Analizează'); panel.appendChild(anBtn);
        this.resEl = this.el('div'); panel.appendChild(this.resEl);
        anBtn.addEventListener('click', () => { const cb = [...cg.querySelectorAll('input:checked')]; this.runDiagnosis(cb); });
        c.appendChild(panel);
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    runDiagnosis(cbs) {
        this.resEl.innerHTML = '';
        if (!cbs.length) { this.resEl.appendChild(this.el('div', 'alert-warn', '⚠️ Selectează cel puțin un simptom')); return; }
        Loading.show();
        const checked = cbs.map(x => x.value);
        const m = this.store.data.diseases.map(d => { const sc = d.symptoms.filter(s => checked.includes(s)).length; return {...d, sc, pct: Math.round((sc / d.symptoms.length)*100)}; }).filter(d => d.sc > 0).sort((a, b) => b.sc - a.sc);
        Loading.hide();
        if (!m.length) { this.resEl.appendChild(this.el('div', 'alert-warn', 'Nicio boală corespunzătoare găsită')); return; }
        this.store.data.settings.diagnosesUsed++; this.store.save();
        const box = this.el('div', 'result-box'); box.appendChild(this.el('h4', null, '🔬 Rezultat diagnostic'));
        for (const x of m.slice(0, 3)) {
            const strong = this.el('strong', null, x.name + ' — ' + x.pct + '% potrivire');
            strong.style.color = x.pct >= 80 ? 'var(--danger)' : x.pct >= 50 ? 'var(--warning)' : 'var(--success)';
            box.appendChild(this.el('p', null, '').appendChild(strong));
            const p2 = this.el('p', null, 'Simptome potrivite: ' + x.symptoms.filter(s => checked.includes(s)).join(', '));
            p2.style.cssText = 'font-size:13px;color:var(--text-muted)'; box.appendChild(p2);
            const p3 = this.el('p', null, 'Tratament: ' + x.treatment); p3.style.cssText = 'font-size:13px'; box.appendChild(p3);
            if (x !== m.slice(0, 3).at(-1)) box.appendChild(this.el('hr'));
        }
        box.appendChild(this.el('p', null, '⚠️ Diagnostic orientativ. Consultă un agronom pentru confirmare.'));
        this.resEl.appendChild(box);
        Toast.show('Diagnostic generat', 'success');
    }
    renderList(c) {
        let prev = c.querySelector('#diseases-list'); if (prev) prev.remove();
        const s = (document.getElementById('disease-search')?.value || '').toLowerCase().trim();
        let items = [...this.store.data.diseases];
        if (s) items = items.filter(d => d.name.toLowerCase().includes(s) || d.symptoms.some(st => st.includes(s)));
        const list = this.el('div', 'list'); list.id = 'diseases-list';
        for (const d of items) {
            const it = this.el('div', 'list-item'); it.setAttribute('tabindex', '0');
            const div = this.el('div');
            const h = this.el('h4', null, d.name);
            const sev = this.el('span', 'tag', d.severity);
            sev.style.cssText = 'background:rgba(239,68,68,0.12);color:#dc2626';
            if (d.severity === 'Medie') sev.style.cssText = 'background:rgba(245,158,11,0.12);color:#d97706';
            h.appendChild(sev); div.appendChild(h);
            div.appendChild(this.el('p', null, 'Simptome: ' + d.symptoms.join(', ')));
            div.appendChild(this.el('p', null, 'Tratament: ' + d.treatment));
            it.append(div, this.el('span', 'tag', d.affected.join(', '))); list.appendChild(it);
        }
        c.appendChild(list);
    }
}

// ===== FERTILIZER =====
class FertilizerPage extends Page {
    constructor(store) { super(store); this.suggestionTimer = null; }
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('⚗️ Calculator Îngrășăminte'));
        const wrap = this.el('div', 'glass-panel');
        wrap.appendChild(this.el('h3', null, 'Parametri calcul'));
        const form = this.el('form'); form.id = 'fert-form'; form.className = 'form';
        form.appendChild(this.sel('fert-crop', 'Tip cultură', [['legume','Legume'],['cereale','Cereale'],['fructe','Fructe'],['aromatice','Plante aromatice']]));
        form.appendChild(this.inp('fert-area', 'Suprafață (ha)', 'number', '1', true));
        form.appendChild(this.sel('fert-type', 'Tip îngrășământ', [['NPK 20-20-20','NPK 20-20-20'],['NPK 15-15-15','NPK 15-15-15'],['Azotat de amoniu','Azotat de amoniu'],['Superfosfat','Superfosfat'],['Sulfat de potasiu','Sulfat de potasiu'],['Îngrășământ organic','Îngrășământ organic']]));
        form.appendChild(this.sel('fert-phase', 'Fază de creștere', [['1','Răsărire'],['1.5','Vegetație'],['2','Florire'],['2.5','Coacere']]));
        this.sugEl = this.el('div', 'alert-success'); this.sugEl.style.display = 'none'; this.sugEl.id = 'fert-suggestion';
        form.appendChild(this.sugEl);
        const btn = this.el('button', 'btn-primary', 'Calculează doza optimă'); btn.type = 'submit'; btn.style.marginTop = '8px'; form.appendChild(btn);
        this.res = this.el('div');

        // Auto-sugestie
        form.querySelector('#fert-crop').addEventListener('change', () => this.autoSuggest(form));
        form.querySelector('#fert-phase').addEventListener('change', () => this.autoSuggest(form));

        form.addEventListener('submit', e => {
            e.preventDefault();
            const crop = form.querySelector('#fert-crop').value, area = parseFloat(form.querySelector('#fert-area').value) || 0;
            const fType = form.querySelector('#fert-type').value, fPhase = parseFloat(form.querySelector('#fert-phase').value) || 1;
            const fertMap = {'NPK 20-20-20':{n:20,p:20,k:20,price:15},'NPK 15-15-15':{n:15,p:15,k:15,price:12},'Azotat de amoniu':{n:34,p:0,k:0,price:8},'Superfosfat':{n:0,p:20,k:0,price:10},'Sulfat de potasiu':{n:0,p:0,k:50,price:14},'Îngrășământ organic':{n:5,p:3,k:4,price:6}};
            const f = fertMap[fType]; if (!f || area <= 0) { Toast.show('Completează toate câmpurile', 'error'); return; }
            const rates = {legume:0.05,cereale:0.03,fructe:0.04,aromatice:0.02};
            const qty = Math.round(area * (rates[crop]||0.04) * fPhase * 1000) / 1000, cost = Math.round(qty * f.price * 100) / 100;
            const nQty = Math.round(qty * f.n / 100 * 100) / 100, pQty = Math.round(qty * f.p / 100 * 100) / 100, kQty = Math.round(qty * f.k / 100 * 100) / 100;
            this.res.innerHTML = '';
            const box = this.el('div', 'result-box'); box.appendChild(this.el('h4', null, '📊 Rezultat calcul'));
            const g = this.el('div', 'cards');
            g.appendChild(this.mkCard('🔹', Utils.fmtd(qty,2), 't necesari'));
            g.appendChild(this.mkCard('💰', Utils.fmtd(cost,2), 'RON'));
            g.appendChild(this.mkCard('N', Utils.fmtd(nQty,2), 'kg Azot'));
            g.appendChild(this.mkCard('P', Utils.fmtd(pQty,2), 'kg Fosfor'));
            g.appendChild(this.mkCard('K', Utils.fmtd(kQty,2), 'kg Potasiu'));
            box.appendChild(g);
            const phaseLabels = {'1':'Răsărire','1.5':'Vegetație','2':'Florire','2.5':'Coacere'};
            box.appendChild(this.el('p', null, `Cultură: ${crop} · Suprafață: ${area} ha · Fază: ${phaseLabels[fPhase]||fPhase} · ${fType}`));
            this.res.appendChild(box);
            Toast.show('Calcul generat', 'success');
        });
        wrap.appendChild(form); wrap.appendChild(this.res); c.appendChild(wrap);
        setTimeout(() => this.autoSuggest(form), 100);
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    autoSuggest(form) {
        const crop = form.querySelector('#fert-crop').value, phase = parseFloat(form.querySelector('#fert-phase').value) || 1;
        const suggestions = {legumes: {1:{type:'NPK 20-20-20',reason:'Răsădirea are nevoie de azot echilibrat'},1.5:{type:'NPK 20-20-20',reason:'Vegetația consumă mult azot'},2:{type:'NPK 15-15-15',reason:'Florirea necesită fosfor'},2.5:{type:'Sulfat de potasiu',reason:'Coacerea are nevoie de potasiu'}},
            cereales: {1:{type:'Azotat de amoniu',reason:'Cerealele au nevoie de azot la răsărire'},1.5:{type:'NPK 20-20-20',reason:'Vegetație echilibrată pentru cereale'},2:{type:'NPK 15-15-15',reason:'Suport pentru formarea spicului'},2.5:{type:'Sulfat de potasiu',reason:'Potasiu pentru boabe mari'}},
            fructes: {1:{type:'NPK 20-20-20',reason:'Pomii fructiferi — start echilibrat'},1.5:{type:'NPK 15-15-15',reason:'Vegetație susținută'},2:{type:'NPK 15-15-15',reason:'Fosfor pentru înflorire'},2.5:{type:'Sulfat de potasiu',reason:'Potasiu pentru fructe dulci'}},
            aromatices: {1:{type:'Îngrășământ organic',reason:'Plantele aromatice preferă organic'},1.5:{type:'Îngrășământ organic',reason:'Organic pentru aromă intensă'},2:{type:'NPK 15-15-15',reason:'Suport ușor pentru înflorire'},2.5:{type:'Îngrășământ organic',reason:'Organic până la recoltare'}}};
        const s = suggestions[crop]?.[phase];
        if (s) { this.sugEl.style.display = 'block'; this.sugEl.textContent = `💡 Sugestie: ${s.type} — ${s.reason}`; form.querySelector('#fert-type').value = s.type; }
        else { this.sugEl.style.display = 'none'; }
    }
    sel(id, label, opts) {
        const w = this.el('div'); w.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        w.appendChild(this.el('label', null, label));
        const s = this.el('select'); s.id = id;
        for (const [v, t] of opts) { const o = this.el('option', null, t); o.value = v; s.appendChild(o); }
        w.appendChild(s); return w;
    }
    inp(id, label, type, def, req) {
        const w = this.el('div'); w.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        w.appendChild(this.el('label', null, label + (req?' *':'')));
        const i = this.el('input'); i.type = type; i.id = id; i.value = def; i.required = !!req;
        if (type === 'number') { i.step = '0.01'; i.min = '0.01'; }
        w.appendChild(i); return w;
    }
    mkCard(icon, val, lb) { const c = this.el('div', 'card'); c.append(this.el('div', 'card-icon', icon), this.el('div', 'card-value', val), this.el('div', 'card-label', lb)); return c; }
}

// ===== JOURNAL =====
class JournalPage extends Page {
    constructor(store) { super(store); this.pageSize = 5; this.currentPage = 0; }
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('📝 Jurnal Recolte'));
        const formWrap = this.el('div', 'glass-panel');
        const form = this.el('form'); form.id = 'journal-form'; form.className = 'form';
        const names = this.store.data.crops.map(c => c.name).filter(Boolean);
        const dl = document.createElement('datalist'); dl.id = 'crop-datalist';
        for (const n of names) { const o = document.createElement('option'); o.value = n; dl.appendChild(o); }
        form.appendChild(dl);
        form.appendChild(this.inp('j-crop', 'Cultură', 'text', true, null, 'ex: Tomate'));
        form.querySelector('#j-crop').setAttribute('list', 'crop-datalist');
        form.appendChild(this.inp('j-date', 'Data', 'date', true, null, Utils.nowDate()));
        form.appendChild(this.inp('j-qty', 'Cantitate (kg)', 'number', true, '0.01'));
        form.appendChild(this.inp('j-price', 'Preț/kg (RON)', 'number', false, '0.01'));
        form.appendChild(this.inp('j-notes', 'Observații', 'text', false));
        const btnSubmit = this.el('button', 'btn-primary', 'Adaugă intrare'); btnSubmit.type = 'submit';
        form.appendChild(btnSubmit);
        formWrap.appendChild(form);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const [crop, eC] = Validators.nonEmpty(form.querySelector('#j-crop').value, 'Cultura');
            const [qty, eQ] = Validators.num(form.querySelector('#j-qty').value, 0.01, 100000);
            if (eC || eQ) { Toast.show([eC, eQ].find(Boolean), 'error'); return; }
            this.store.addJournal({crop, date: form.querySelector('#j-date').value, qty, price: parseFloat(form.querySelector('#j-price').value)||null, notes: form.querySelector('#j-notes').value||''});
            Toast.show('Intrare adăugată', 'success'); form.reset(); form.querySelector('#j-date').value = Utils.nowDate(); this.updateList();
        });
        c.appendChild(formWrap);
        const tb = this.el('div', 'toolbar');
        const sel = this.el('select'); sel.id = 'j-sort'; sel.setAttribute('aria-label', 'Sortează jurnal');
        sel.innerHTML = '<option value="date-desc">Cele mai noi</option><option value="date-asc">Cele mai vechi</option><option value="crop">Cultură A-Z</option><option value="qty-desc">Cantitate ↓</option>';
        sel.addEventListener('change', () => { this.currentPage = 0; this.updateList(); }); tb.appendChild(sel);
        const exBtn = this.el('button', 'btn-secondary', '📤 Export CSV'); exBtn.addEventListener('click', () => this.exportCSV()); tb.appendChild(exBtn);
        c.appendChild(tb);
        this.listEl = this.el('div', 'list'); c.appendChild(this.listEl);
        c.appendChild(this.buildPagination());
        this.updateList();
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    updateList() {
        const sort = document.getElementById('j-sort')?.value || 'date-desc';
        let items = [...this.store.data.journals];
        if (sort === 'date-desc') items.sort((a, b) => b.date.localeCompare(a.date));
        else if (sort === 'date-asc') items.sort((a, b) => a.date.localeCompare(b.date));
        else if (sort === 'crop') items.sort((a, b) => a.crop.localeCompare(b.crop));
        else if (sort === 'qty-desc') items.sort((a, b) => b.qty - a.qty);
        const total = items.length, pages = Math.ceil(total / this.pageSize);
        this.currentPage = Math.min(this.currentPage, Math.max(0, pages - 1));
        items = items.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
        this.listEl.innerHTML = '';
        if (!items.length) { this.listEl.appendChild(this.el('p', 'empty-msg', 'Nicio intrare. Adaugă prima intrare!')); this.updatePagination(0, 0); return; }
        for (const j of items) {
            const it = this.el('div', 'list-item'); it.setAttribute('tabindex', '0');
            const div = this.el('div'), val = j.price ? j.qty * j.price : 0;
            div.appendChild(this.el('h4', null, j.crop + ' — ' + j.qty + ' kg' + (j.price ? ' (≈ ' + Utils.fmtd(val,2) + ' RON)' : '')));
            div.appendChild(this.el('p', null, Utils.fmtDate(j.date) + (j.notes ? ' · ' + j.notes : '')));
            const delBtn = this.el('button', 'btn-secondary', '🗑️'); delBtn.style.color = 'var(--danger)';
            delBtn.addEventListener('click', () => { this.store.deleteJournal(j.id); Toast.show('Intrare ștearsă', 'success'); this.updateList(); });
            it.append(div, delBtn); this.listEl.appendChild(it);
        }
        this.updatePagination(this.currentPage, pages);
    }
    buildPagination() { const p = this.el('div', 'pagination'); p.id = 'journal-pagination'; return p; }
    updatePagination(cur, total) {
        const el = document.getElementById('journal-pagination'); if (!el) return;
        el.innerHTML = '';
        if (total <= 1) return;
        el.appendChild(this.pgBtn('«', 0, cur === 0));
        for (let i = Math.max(0, cur - 1); i < Math.min(total, cur + 3); i++) el.appendChild(this.pgBtn(String(i + 1), i, i === cur));
        el.appendChild(this.pgBtn('»', total - 1, cur === total - 1));
    }
    pgBtn(label, page, disabled) {
        const b = this.el('button'); b.textContent = label; b.className = disabled ? 'pg-btn active' : 'pg-btn';
        if (!disabled) b.addEventListener('click', () => { this.currentPage = page; this.updateList(); });
        else b.disabled = true;
        return b;
    }
    exportCSV() {
        const rows = this.store.data.journals.map(j => [j.date, j.crop, j.qty, j.price||'', j.price?(j.qty*j.price).toFixed(2):'', j.notes||'']);
        const csv = [['Data','Cultura','Cantitate_kg','Pret_kg','Valoare_RON','Observatii'], ...rows]
            .map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-jurnal.csv'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('CSV exportat!', 'success');
    }
    inp(id, label, type, req, step, val) {
        const w = this.el('div'); w.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        w.appendChild(this.el('label', null, label + (req?' *':'')));
        const i = this.el('input'); i.type = type; i.id = id; i.value = val || ''; i.required = !!req;
        if (step) { i.step = step; i.min = '0'; }
        w.appendChild(i); return w;
    }
}

// ===== CHARTS =====
class ChartsPage extends Page {
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('📊 Analitice Recolte'));
        const tb = this.el('div', 'toolbar');
        const yr = this.el('select'); for (const y of [2026,2025,2024]) { const o = document.createElement('option'); o.value = y; o.textContent = y; yr.appendChild(o); } yr.value = '2026'; yr.id = 'chart-year';
        yr.addEventListener('change', () => this.drawCanvas()); tb.appendChild(yr);
        const cr = this.el('select'); const opts = [...new Set(this.store.data.crops.map(j => j.name))];
        cr.innerHTML = '<option value="">Toate culturile</option>' + opts.map(c => `<option value="${c}">${c}</option>`).join(''); cr.id = 'chart-crop';
        cr.addEventListener('change', () => this.drawCanvas()); tb.appendChild(cr);
        const met = this.el('select'); met.innerHTML = '<option value="qty">Cantitate (kg)</option><option value="value">Valoare (RON)</option>'; met.id = 'chart-metric';
        met.addEventListener('change', () => this.drawCanvas()); tb.appendChild(met);
        c.appendChild(tb);
        const canvasWrap = this.el('div', 'glass-panel');
        const canvas = document.createElement('canvas'); canvas.id = 'harvest-chart';
        canvas.style.cssText = 'width:100%;height:380px'; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Grafic recolte');
        canvasWrap.appendChild(canvas); c.appendChild(canvasWrap);
        this.statsEl = this.el('div', 'cards'); c.appendChild(this.statsEl);
        setTimeout(() => {
            const tryDraw = (attempts) => {
                const canvas = document.getElementById('harvest-chart');
                if (!canvas) return;
                const parent = canvas.parentElement;
                if (parent.clientWidth > 0 || attempts >= 10) {
                    this.drawCanvas();
                } else {
                    setTimeout(() => tryDraw(attempts + 1), 100);
                }
            };
            tryDraw(0);
        }, 50);
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    drawCanvas() {
        const canvas = document.getElementById('harvest-chart'); if (!canvas) return;
        const parent = canvas.parentElement, dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = parent.clientWidth * dpr; canvas.height = 380 * dpr;
        canvas.style.width = parent.clientWidth + 'px'; canvas.style.height = '380px';
        const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = parent.clientWidth, year = document.getElementById('chart-year')?.value || '2026';
        const cropF = document.getElementById('chart-crop')?.value || '', metric = document.getElementById('chart-metric')?.value || 'qty';
        let items = this.store.data.journals.filter(j => j.date && j.date.startsWith(year));
        if (cropF) items = items.filter(j => j.crop === cropF);

        if (!items.length) {
            // Fallback: show crop-based chart when no journal entries
            this.drawFallbackChart(ctx, w, cropF, metric);
            return;
        }

        const monthly = {}; for(let i=1;i<=12;i++) monthly[i]=0;
        items.forEach(j => { const m = parseInt(j.date.split('-')[1]); monthly[m] += metric==='value'&&j.price ? j.qty*j.price : j.qty; });
        const values = Object.values(monthly), max = Math.max(...values, 1);
        const pad=50,ch=260,bw=Math.max(24,(w-pad*2-11*14)/12);
        const total = values.reduce((a,b)=>a+b,0),avg=total/12,bestMonth=values.indexOf(Math.max(...values))+1;
        const months=['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Noi','Dec'];
        ctx.fillStyle=Utils.getCSSVar('--text');ctx.font='bold 14px sans-serif';
        ctx.fillText(`Recolte ${year}${cropF?' — '+cropF:''} (${metric==='value'?'RON':'kg'})`,pad,25);
        ctx.strokeStyle=Utils.getCSSVar('--border-solid');ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(pad,295);ctx.lineTo(pad+12*(bw+14),295);ctx.stroke();
        values.forEach((v,i)=>{
            const h=(v/max)*ch,x=pad+i*(bw+14),y=295-h;
            ctx.fillStyle=v>0?Utils.getCSSVar('--accent'):Utils.getCSSVar('--border-solid');
            ctx.fillRect(x,y,bw,h);
            ctx.fillStyle=Utils.getCSSVar('--text-muted');ctx.font='12px sans-serif';
            ctx.fillText(months[i],x+bw/2-10,315);
            if(v>0){ctx.fillStyle=Utils.getCSSVar('--text');ctx.font='bold 12px sans-serif';ctx.fillText(Math.round(v).toString(),x+4,y-6);}
        });
        this.statsEl.innerHTML='';
        this.statsEl.appendChild(this.mkCard(Utils.fmtd0(total),`Total ${metric==='value'?'RON':'kg'}`));
        this.statsEl.appendChild(this.mkCard(Utils.fmtd(avg),'Medie lunară'));
        this.statsEl.appendChild(this.mkCard(months[bestMonth-1]||'-','Luna maxim'));
    }

    drawFallbackChart(ctx, w, cropF, metric) {
        // Bar chart: value or qty per crop depending on metric
        let crops = [...this.store.data.crops];
        if (cropF) crops = crops.filter(c => c.name === cropF);

        const isValue = metric === 'value';
        const getMetric = c => isValue ? (c.value || 0) : Math.round((c.area || 0) * (c.seedYield || 0));
        crops.sort((a, b) => getMetric(b) - getMetric(a));

        // Draw title + hint
        ctx.fillStyle = Utils.getCSSVar('--text');
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(isValue ? '📊 Valoare estimată per cultură' : '📊 Producție estimată per cultură', 50, 25);

        ctx.fillStyle = Utils.getCSSVar('--text-muted');
        ctx.font = '12px sans-serif';
        ctx.fillText('💡 Adaugă recolte în Jurnal pentru grafice lunare detaliate', 50, 45);

        if (!crops.length) {
            ctx.fillStyle = Utils.getCSSVar('--text-muted');
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Nicio cultură disponibilă', w / 2, 200);
            ctx.textAlign = 'start';
            this.statsEl.innerHTML = '';
            return;
        }

        // Bar chart
        const pad = 50, ch = 240, topY = 100;
        const maxVal = Math.max(...crops.map(c => getMetric(c)), 1);
        const bw = Math.min(50, Math.max(20, (w - pad * 2) / crops.length - 14));
        const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#14b8a6'];
        const baseline = topY + ch;

        // Axis line
        ctx.strokeStyle = Utils.getCSSVar('--border-solid');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, baseline);
        ctx.lineTo(pad + crops.length * (bw + 14), baseline);
        ctx.stroke();

        let totalV = 0;
        crops.forEach((c, i) => {
            const v = getMetric(c);
            totalV += v;
            const h = (v / maxVal) * ch;
            const x = pad + i * (bw + 14);
            const y = baseline - h;

            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, bw, h);

            // Value on top
            ctx.fillStyle = Utils.getCSSVar('--text');
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(Utils.fmtd0(v) + (isValue ? ' RON' : ' kg'), x + 2, y - 6);

            // Crop name below
            ctx.fillStyle = Utils.getCSSVar('--text-muted');
            ctx.font = '10px sans-serif';
            ctx.save();
            ctx.translate(x + bw / 2, baseline + 18);
            ctx.rotate(-0.5);
            ctx.textAlign = 'right';
            ctx.fillText(c.name.length > 10 ? c.name.substring(0, 10) + '…' : c.name, 0, 0);
            ctx.restore();
        });

        this.statsEl.innerHTML = '';
        this.statsEl.appendChild(this.mkCard(Utils.fmtd0(totalV), isValue ? 'Valoare totală (RON)' : 'Producție totală (kg)'));
        this.statsEl.appendChild(this.mkCard(String(crops.length), 'Culturi'));
        this.statsEl.appendChild(this.mkCard(Utils.fmtd(totalV / Math.max(crops.length, 1)), isValue ? 'Medie/cultură (RON)' : 'Medie/cultură (kg)'));
    }
    mkCard(val,lb){const c=this.el('div',['card','glass']);c.appendChild(this.el('div','card-value',val));c.appendChild(this.el('div','card-label',lb));return c;}
}

// ===== PREDICTOR RECOLTĂ =====
class HarvestPredictor {
    constructor(store) { this.store = store; }
    predict(crop) {
        const area = crop.area || 0, seedYield = crop.seedYield || 0, phase = crop.phase || 'Răsărire';
        const phaseMultiplier = {'Răsărire':0.6,'Vegetație':0.75,'Florire':1.0,'Coacere':1.3,'Recoltare':1.5};
        const multiplier = phaseMultiplier[phase] || 1.0;
        const predicted = Math.round(area * seedYield * multiplier);
        const revenue = Math.round(predicted * (crop.pricePerKg || 0));
        const now = new Date();
        const planted = crop.plantedDate ? new Date(crop.plantedDate) : null;
        let harvestDate = '—';
        if (planted) {
            const daysToHarvest = phase === 'Recoltare' ? 0 : phase === 'Coacere' ? 14 : phase === 'Florire' ? 45 : 75;
            const hDate = new Date(planted.getTime() + daysToHarvest * 86400000);
            harvestDate = hDate.toLocaleDateString('ro-RO');
        }
        return { predicted, revenue, harvestDate, multiplier };
    }
    render(container) {
        container.innerHTML = '';
        const hdr = document.createElement('div'); hdr.className = 'page-header';
        const h2 = document.createElement('h2'); h2.textContent = '📈 Predictor Recoltă'; hdr.appendChild(h2);
        const sub = document.createElement('p'); sub.className = 'subtitle'; sub.textContent = 'Estimează producția și veniturile pe baza datelor curente'; hdr.appendChild(sub);
        container.appendChild(hdr);
        const items = [...this.store.data.crops];
        if (!items.length) {
            const empty = document.createElement('p'); empty.className = 'empty-msg'; empty.textContent = 'Adaugă culturi pentru predicții.'; container.appendChild(empty);
            return;
        }
        const grid = document.createElement('div'); grid.className = 'cards';
        let totalRevenue = 0, totalYield = 0;
        for (const c of items) {
            const p = this.predict(c);
            totalRevenue += p.revenue; totalYield += p.predicted;
            const card = document.createElement('div'); card.className = 'card glass';
            card.style.cssText = 'animation:scaleIn 0.4s ease-out';
            card.innerHTML = `<div class="card-icon">🌱</div>
                <div class="card-value">${p.predicted.toLocaleString('ro-RO')} kg</div>
                <div class="card-label">${c.name} · ${c.area} ha · ${c.phase}</div>
                <div class="card-trend">💰 ${p.revenue.toLocaleString('ro-RO')} RON estimat</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">📅 Recoltare: ${p.harvestDate} · ×${p.multiplier}</div>`;
            grid.appendChild(card);
            // Animate cards sequentially
            card.style.animationDelay = `${items.indexOf(c) * 0.05}s`;
        }
        container.appendChild(grid);
        const summary = document.createElement('div'); summary.className = 'glass-panel';
        summary.innerHTML = `<h3>📊 Sumar fermă</h3>
            <div class="cards" style="margin-top:12px">
                <div class="card glass"><div class="card-value">${totalYield.toLocaleString('ro-RO')}</div><div class="card-label">Producție totală (kg)</div></div>
                <div class="card glass"><div class="card-value">${totalRevenue.toLocaleString('ro-RO')}</div><div class="card-label">Venituri estimate (RON)</div></div>
                <div class="card glass"><div class="card-value">${items.length}</div><div class="card-label">Culturi analizate</div></div>
            </div>`;
        container.appendChild(summary);
    }
}

// ===== TASK-URI AGRICOLE =====
class TasksPage extends Page {
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('✅ Task-uri Agricole'));
        const addWrap = document.createElement('div'); addWrap.className = 'glass-panel';
        const form = document.createElement('form'); form.className = 'form';
        form.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:4px"><label for="task-crop">Cultură *</label>
                <input type="text" id="task-crop" required placeholder="Selectează sau scrie..." list="task-crop-list">
                <datalist id="task-crop-list">${this.store.data.crops.map(c => `<option value="${c.name}">`).join('')}</datalist></div>
            <div style="display:flex;flex-direction:column;gap:4px"><label for="task-text">Task *</label><input type="text" id="task-text" required placeholder="Ex: Irigare, Fertilizare..."></div>
            <div style="display:flex;flex-direction:column;gap:4px"><label for="task-date">Dată scadentă</label><input type="date" id="task-date" value="${Utils.nowDate()}"></div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn-primary" type="submit">➕ Adaugă Task</button>
                <button class="btn-secondary" type="button" id="clear-done">🗑️ Șterge finalizate</button>
            </div>`;
        form.addEventListener('submit', e => {
            e.preventDefault();
            const cropVal = document.getElementById('task-crop').value.trim();
            const textVal = document.getElementById('task-text').value.trim();
            if (!cropVal || !textVal) { Toast.show('Completează toate câmpurile', 'error'); return; }
            this.store.data.tasks = this.store.data.tasks || [];
            this.store.data.tasks.push({
                id: Date.now(), crop: cropVal, text: textVal,
                date: document.getElementById('task-date').value, done: false, created: new Date().toISOString()
            });
            this.store.save();
            Toast.show('Task adăugat!', 'success');
            form.reset();
            document.getElementById('task-date').value = Utils.nowDate();
            this.renderList(c);
        });
        addWrap.appendChild(form);
        c.appendChild(addWrap);
        this.listEl = document.createElement('div'); this.listEl.id = 'tasks-list'; this.listEl.className = 'list';
        c.appendChild(this.listEl);
        document.getElementById('clear-done').addEventListener('click', () => {
            this.store.data.tasks = (this.store.data.tasks || []).filter(t => !t.done);
            this.store.save();
            Toast.show('Task-uri finalizate șterse', 'success');
            this.renderList(c);
        });
        this.renderList(c);
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    renderList(c) {
        this.listEl.innerHTML = '';
        this.store.data.tasks = this.store.data.tasks || [];
        const items = [...this.store.data.tasks].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1) || new Date(b.created) - new Date(a.created));
        if (!items.length) { this.listEl.appendChild(this.el('p', 'empty-msg', 'Niciun task. Adaugă task-uri agricole!')); return; }
        for (const t of items) {
            const it = this.el('div', 'list-item');
            it.style.opacity = t.done ? '0.5' : '1';
            it.style.textDecoration = t.done ? 'line-through' : 'none';
            const div = this.el('div');
            div.innerHTML = `<h4>${Utils.escapeHTML(t.crop)}: ${Utils.escapeHTML(t.text)}</h4>
                <p>📅 ${Utils.fmtDate(t.date)} · ${t.done ? '✅ Finalizat' : '⏳ În așteptare'}</p>`;
            const actions = this.el('div'); actions.style.cssText = 'display:flex;gap:6px;flex-shrink:0';
            const doneBtn = this.el('button', 'btn-secondary', t.done ? '↩️' : '✅');
            doneBtn.addEventListener('click', () => {
                t.done = !t.done;
                this.store.save();
                this.renderList(c);
            });
            const delBtn = this.el('button', 'btn-secondary', '🗑️');
            delBtn.style.color = 'var(--danger)';
            delBtn.addEventListener('click', () => {
                this.store.data.tasks = this.store.data.tasks.filter(x => x.id !== t.id);
                this.store.save();
                this.renderList(c);
                Toast.show('Task șters', 'info');
            });
            actions.append(doneBtn, delBtn);
            it.append(div, actions);
            this.listEl.appendChild(it);
        }
    }
}

// ===== EXPORT RAPORT COMPLET =====
class ReportExporter {
    constructor(store) { this.store = store; }
    generateHTML() {
        const d = this.store.data;
        const now = new Date().toLocaleDateString('ro-RO');
        const totalV = d.crops.reduce((s, c) => s + ((c.area||0)*(c.seedYield||0)*(c.pricePerKg||0)), 0);
        const predictor = new HarvestPredictor(this.store);
        const preds = d.crops.map(c => predictor.predict(c));
        const totalPred = preds.reduce((s, p) => s + p.predicted, 0);
        const totalRev = preds.reduce((s, p) => s + p.revenue, 0);
        const cropsRows = d.crops.map(c => `<tr><td>${c.name}</td><td>${c.category}</td><td>${c.area} ha</td><td>${c.phase}</td><td>${c.seedYield} kg/ha</td><td>${c.pricePerKg} RON</td><td>${((c.area||0)*(c.seedYield||0)*(c.pricePerKg||0)).toLocaleString('ro-RO')} RON</td></tr>`).join('');
        const tasksCount = (d.tasks || []).length;
        const tasksDone = (d.tasks || []).filter(t => t.done).length;
        const tasksRows = (d.tasks || []).sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 10).map(t =>
            `<tr><td>${t.crop}</td><td>${t.text}</td><td>${Utils.fmtDate(t.date)}</td><td>${t.done ? '✅ Da' : '⏳ Nu'}</td></tr>`).join('');
        return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>Raport AgroMind — ${now}</title>
            <style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#1e293b;background:#f8fafc}
            h1{color:#0f172a;border-bottom:3px solid #3b82f6;padding-bottom:8px}h2{color:#334155;margin-top:28px}
            .summary{display:flex;gap:16px;flex-wrap:wrap}.card{background:white;border-radius:12px;padding:20px;flex:1;min-width:180px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
            .card .val{font-size:28px;font-weight:700;color:#3b82f6}.card .lbl{font-size:13px;color:#64748b}
            table{width:100%;border-collapse:collapse;margin:12px 0;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
            th{background:#3b82f6;color:white;padding:10px 12px;text-align:left;font-size:13px}td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px}
            tr:last-child td{border-bottom:none}.footer{margin-top:32px;color:#94a3b8;font-size:12px;text-align:center}</style></head>
            <body><h1>🌾 Raport AgroMind Premium v3.1</h1><p>Generat: ${now} · Autor: Oliver Farkas Andrei</p>
            <h2>📊 Sumar</h2><div class="summary">
                <div class="card"><div class="val">${d.crops.length}</div><div class="lbl">Culturi active</div></div>
                <div class="card"><div class="val">${d.crops.reduce((s,c)=>s+(c.area||0),0).toFixed(1)} ha</div><div class="lbl">Suprafață totală</div></div>
                <div class="card"><div class="val">${totalV.toLocaleString('ro-RO')} RON</div><div class="lbl">Valoare estimată</div></div>
                <div class="card"><div class="val">${totalPred.toLocaleString('ro-RO')} kg</div><div class="lbl">Producție estimată</div></div>
                <div class="card"><div class="val">${totalRev.toLocaleString('ro-RO')} RON</div><div class="lbl">Venituri estimate</div></div>
                <div class="card"><div class="val">${tasksDone}/${tasksCount}</div><div class="lbl">Task-uri finalizate</div></div>
            </div>
            <h2>🌱 Culturi</h2><table><thead><tr><th>Nume</th><th>Categorie</th><th>Suprafață</th><th>Fază</th><th>Randament</th><th>Preț/kg</th><th>Valoare</th></tr></thead><tbody>${cropsRows}</tbody></table>
            <h2>✅ Task-uri</h2><table><thead><tr><th>Cultură</th><th>Task</th><th>Dată</th><th>Finalizat</th></tr></thead><tbody>${tasksRows || '<tr><td colspan="4">Niciun task</td></tr>'}</tbody></table>
            <div class="footer">AgroMind Premium v3.1 · Oliver Farkas Andrei · ${now}</div></body></html>`;
    }
    export() {
        const html = this.generateHTML();
        const blob = new Blob([html], {type:'text/html;charset=utf-8'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `raport-agromind-${new Date().toISOString().slice(0,10)}.html`; a.click();
        URL.revokeObjectURL(a.href);
        Toast.show('Raport generat!', 'success');
    }
}

// ===== WEATHER =====
class WeatherPage extends Page {
    render(c) {
        c.innerHTML = '';
        c.appendChild(this.header('🌦️ Meteo Agricolă'));
        const tb = this.el('div', 'toolbar');
        const input = this.el('input'); input.type = 'text'; input.placeholder = 'Introdu localitatea...';
        input.id = 'city-input'; input.value = this.store.data.settings.lastWeatherCity || 'București';
        input.setAttribute('aria-label', 'Caută localitate');
        tb.appendChild(input);
        const gpsBtn = this.el('button', 'btn-secondary', '📍 GPS'); gpsBtn.setAttribute('aria-label', 'Folosește locația curentă');
        gpsBtn.addEventListener('click', () => this.useGeolocation()); tb.appendChild(gpsBtn);
        const btn = this.el('button', 'btn-primary', '🔍 Caută'); btn.addEventListener('click', () => this.searchCity());
        input.addEventListener('keypress', e => { if (e.key === 'Enter') this.searchCity(); });
        tb.appendChild(btn); c.appendChild(tb);
        this.curEl = this.el('div', 'glass-panel'); this.curEl.id = 'weather-current'; c.appendChild(this.curEl);
        this.forEl = this.el('div', 'glass-panel'); this.forEl.id = 'weather-forecast'; c.appendChild(this.forEl);
        this.alertEl = this.el('div', 'glass-panel');
        this.alertEl.appendChild(this.el('h3', null, '🌡️ Alertă agricolă meteo'));
        const alDiv = this.el('div'); alDiv.id = 'weather-alerts'; this.alertEl.appendChild(alDiv); c.appendChild(this.alertEl);
        this.fetchWeather(44.43, 26.10, 'București');
    }
    header(title) { const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, title)); return hdr; }
    useGeolocation() {
        if (!navigator.geolocation) { Toast.show('Geolocația nu e suportată de browser', 'error'); return; }
        Loading.show();
        navigator.geolocation.getCurrentPosition(
            pos => { document.getElementById('city-input').value = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`; this.fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Locația ta'); },
            err => { Toast.show('Nu s-a putut obține locația. Permite accesul GPS.', 'error'); Loading.hide(); },
            {enableHighAccuracy: false, timeout: 10000}
        );
    }
    async searchCity() {
        const q = document.getElementById('city-input').value.trim();
        if (!q) { Toast.show('Introdu o localitate', 'warn'); return; }
        Loading.show();
        try {
            const hardcoded = {'bucuresti':[44.43,26.10],'cluj':[46.77,23.60],'cluj-napoca':[46.77,23.60],'timisoara':[45.75,21.23],'iasi':[47.17,27.60],'brasov':[45.65,25.61],'constanta':[44.18,28.63],'craiova':[44.33,23.82],'sibiu':[45.80,24.15],'oradea':[47.05,21.93],'galati':[45.44,28.05],'ploiesti':[44.94,26.02],'pitesti':[44.86,24.87],'suceava':[47.63,26.26],'bacau':[46.57,26.91],'arad':[46.18,21.32],'baia mare':[47.66,23.58],'buzau':[45.15,26.82],'botosani':[47.75,26.67],'satu mare':[47.79,22.89],'ramnicu valcea':[45.10,24.37],'drobeta':[44.63,22.66],'targu mures':[46.55,24.56]};
            const key = q.toLowerCase().replace(/[ăâ]/g,'a').replace(/[șş]/g,'s').replace(/[țţ]/g,'t').replace(/î/g,'i');
            if (hardcoded[key]) { this.store.data.settings.lastWeatherCity = q; this.store.save(); await this.fetchWeather(hardcoded[key][0], hardcoded[key][1], q); Loading.hide(); return; }
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)},România&limit=1`);
            const data = await res.json();
            if (data && data.length) { this.store.data.settings.lastWeatherCity = q; this.store.save(); await this.fetchWeather(parseFloat(data[0].lat), parseFloat(data[0].lon), q); }
            else { Toast.show('Localitate negăsită', 'error'); }
        } catch(e) { Toast.show('Eroare rețea', 'error'); }
        finally { Loading.hide(); }
    }
    async fetchWeather(lat, lon, city) {
        Loading.show();
        try {
            this.curEl.innerHTML = ''; const pl = this.el('p', null, 'Se încarcă...'); pl.style.cssText = 'text-align:center;color:var(--text-muted)'; this.curEl.appendChild(pl);
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`);
            const data = await res.json();
            this.store.data.weatherCache = {city, data}; this.store.data.weatherCacheTime = Date.now(); this.store.save();
            this.displayWeather(data, city);
        } catch(e) { this.curEl.innerHTML = ''; this.curEl.appendChild(this.el('div', 'alert-warn', '⚠️ Eroare la încărcarea meteo.')); }
        finally { Loading.hide(); }
    }
    displayWeather(data, city) {
        const wmo = {0:'☀️ Senin',1:'🌤️ Parțial',2:'⛅ Parțial',3:'☁️ Noros',45:'🌫️ Ceață',48:'🌫️ Ceață densă',51:'🌦️ Ploaie ușoară',53:'🌦️ Ploaie ușoară',55:'🌦️ Burniță',61:'🌧️ Ploaie',63:'🌧️ Ploaie',65:'🌧️ Ploaie puternică',71:'🌨️ Ninsoare',73:'🌨️ Ninsoare',75:'🌨️ Ninsoare puternică',95:'⛈️ Furtună',96:'⛈️ Furtună cu grindină'};
        const code = data.current.weather_code || 0, desc = wmo[code] || '🌡️';
        this.curEl.innerHTML = '';
        const wrap = this.el('div', 'weather-current');
        wrap.appendChild(this.el('div', 'temp-big', Math.round(data.current.temperature_2m) + '°'));
        const det = this.el('div', 'details');
        det.appendChild(this.el('h3', null, city));
        det.appendChild(this.el('p', null, desc));
        det.appendChild(this.el('p', null, '💧 Umiditate: ' + data.current.relative_humidity_2m + '%'));
        det.appendChild(this.el('p', null, '🌡️ Resimțită: ' + Math.round(data.current.apparent_temperature||data.current.temperature_2m) + '°C'));
        det.appendChild(this.el('p', null, '💨 Vânt: ' + (data.current.wind_speed_10m||0) + ' km/h'));
        det.appendChild(this.el('p', null, '🌧️ Precipitații: ' + (data.current.precipitation||0) + ' mm'));
        wrap.appendChild(det); this.curEl.appendChild(wrap);
        this.forEl.innerHTML = '';
        this.forEl.appendChild(this.el('h3', null, 'Prognoză 7 zile'));
        const grid = this.el('div', 'weather-grid');
        for (let i = 0; i < 7; i++) {
            const date = new Date(data.daily.time[i]), dayName = ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'][date.getDay()];
            const dcode = data.daily.weather_code[i];
            const [icon, ...rest] = (wmo[dcode] || '☁️').split(' ');
            const card = this.el('div', 'weather-card');
            card.appendChild(this.el('div', 'day', dayName + ' ' + date.getDate()));
            card.appendChild(this.el('div', 'icon', icon));
            card.appendChild(this.el('div', 'temp', Math.round(data.daily.temperature_2m_max[i]) + '°/' + Math.round(data.daily.temperature_2m_min[i]) + '°'));
            card.appendChild(this.el('div', 'desc', rest.join(' ')));
            grid.appendChild(card);
        }
        this.forEl.appendChild(grid);
        const alerts = [];
        const temp = data.current.temperature_2m;
        if (temp < 0) alerts.push('❄️ Îngheț — protejează culturile sensibile');
        if (temp > 35) alerts.push('🔥 Caniculă — crește irigarea');
        if (data.current.precipitation > 20) alerts.push('🌧️ Ploi abundente — risc de boli fungice');
        if (data.current.wind_speed_10m > 40) alerts.push('💨 Vânt puternic — protejează plantele înalte');
        if (data.current.relative_humidity_2m > 85 && temp > 20) alerts.push('💧 Umiditate ridicată — risc de mană');
        if (!alerts.length) alerts.push('✅ Condiții favorabile pentru agricultură');
        const alertsDiv = document.getElementById('weather-alerts'); alertsDiv.innerHTML = '';
        for (const a of alerts) { const al = this.el('div', a.includes('✅')?'alert-success':'alert-danger', a); al.style.marginBottom = '8px'; alertsDiv.appendChild(al); }
        // Trigger notification for severe alerts
        if (this.store.data.settings.notificationsEnabled && alerts.some(a => a.includes('❄️') || a.includes('🔥') || a.includes('⛈️'))) {
            Notify.send('AgroMind Alertă', alerts.find(a => a.includes('❄️')||a.includes('🔥')||a.includes('⛈️')) || alerts[0]);
        }
    }
}

// ===== NOTIFICATIONS =====
class Notify {
    static async request() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        const p = await Notification.requestPermission();
        return p === 'granted';
    }
    static send(title, body) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        new Notification(title, {body, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌾</text></svg>'});
    }
    static async toggle(store) {
        const enabled = await Notify.request();
        store.data.settings.notificationsEnabled = enabled;
        store.save();
        if (enabled) Toast.show('Notificări activate! Vei primi alerte agricole.', 'success');
        else Toast.show('Notificări dezactivate. Poți permite din setările browserului.', 'info');
    }
}

// ===== EXPORT MANAGER =====
class ExportManager {
    constructor(store) { this.store = store; this.bind(); }
    bind() {
        document.getElementById('export-btn').addEventListener('click', () => document.getElementById('export-modal').classList.add('open'));
        document.getElementById('export-csv').addEventListener('click', () => { this.exportCSV(); this.close(); });
        document.getElementById('export-json').addEventListener('click', () => { this.exportJSON(); this.close(); });
        document.getElementById('import-full').addEventListener('click', () => { this.importFull(); this.close(); });
        document.getElementById('export-close').addEventListener('click', () => this.close());
        document.getElementById('export-modal').addEventListener('click', e => { if (e.target === document.getElementById('export-modal')) this.close(); });
    }
    close() { document.getElementById('export-modal').classList.remove('open'); }
    exportCSV() {
        const all = this.store.exportAll();
        const rows = all.crops.map(c => [c.name, c.category, c.area, c.phase, c.plantedDate, c.seedYield, c.pricePerKg, c.value||0, c.soil]);
        const csv = [['Nume','Categorie','Suprafață_ha','Fază','Data_plantare','Randament_kg_ha','Preț_kg','Valoare_RON','Sol'], ...rows]
            .map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-export-complet.csv'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('Export CSV complet!', 'success');
    }
    exportJSON() {
        const all = this.store.exportAll();
        const blob = new Blob([JSON.stringify(all, null, 2)], {type:'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-backup.json'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('Export JSON complet!', 'success');
    }
    importFull() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
        input.onchange = () => {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try { const obj = JSON.parse(reader.result); if (this.store.importAll(obj)) { Toast.show('Import complet reușit! Reîmprospătează pagina.', 'success'); setTimeout(() => location.reload(), 1500); } else Toast.show('Format invalid', 'error'); }
                catch { Toast.show('JSON corupt', 'error'); }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}

// ===== ROUTER =====
class Router {
    constructor(store) {
        this.store = store;
        this.pages = {
            dashboard: new DashboardPage(store), crops: new CropsPage(store), diseases: new DiseasesPage(store),
            fertilizer: new FertilizerPage(store), journal: new JournalPage(store), charts: new ChartsPage(store),
            tasks: new TasksPage(store), weather: new WeatherPage(store),
        };
        this.navItems = [
            {id:'dashboard',icon:'◈',label:'Panou Principal'},
            {id:'crops',icon:'🌱',label:'Culturi'},
            {id:'diseases',icon:'🦠',label:'Boli'},
            {id:'fertilizer',icon:'⚗️',label:'Îngrășăminte'},
            {id:'journal',icon:'📝',label:'Jurnal'},
            {id:'charts',icon:'📊',label:'Grafice'},
            {id:'tasks',icon:'✅',label:'Task-uri'},
            {id:'weather',icon:'🌦️',label:'Meteo'},
        ];
        this.buildNav();
    }
    buildNav() {
        const nav = document.getElementById('nav-links'); nav.innerHTML = '';
        nav.setAttribute('role', 'navigation'); nav.setAttribute('aria-label', 'Navigare principală');
        for (const item of this.navItems) {
            const btn = document.createElement('button'); btn.className = 'nav-link'; btn.dataset.page = item.id;
            btn.textContent = item.icon + ' ' + item.label;
            btn.setAttribute('aria-label', item.label);
            btn.addEventListener('click', () => this.goto(item.id));
            nav.appendChild(btn);
        }
    }
    goto(page, direction) {
        const container = document.getElementById(page + '-page'); if (!container) return;
        const old = document.querySelector('.page.active');
        if (old && old !== container) {
            old.style.animation = direction === 'back' ? 'slideOutRight 0.25s ease-out forwards' : 'slideOutLeft 0.25s ease-out forwards';
            setTimeout(() => { old.classList.remove('active'); old.style.animation = ''; }, 240);
        }
        setTimeout(() => {
            container.style.animation = direction === 'back' ? 'slideInLeft 0.25s ease-out forwards' : 'slideInRight 0.25s ease-out forwards';
            container.classList.add('active');
            setTimeout(() => { container.style.animation = ''; }, 260);
        }, old ? 250 : 10);
        for (const el of document.querySelectorAll('.nav-link')) el.classList.remove('active');
        const activeNav = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        this.pages[page].render(container);
        document.getElementById('main-content').scrollTop = 0;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    init() { this.goto('dashboard'); }

    initScrollTop() {
        const btn = document.getElementById('scroll-top');
        if (!btn) return;
        const main = document.getElementById('main-content');
        const toggle = () => {
            if (main && main.scrollTop > 400) btn.classList.add('visible');
            else btn.classList.remove('visible');
        };
        main?.addEventListener('scroll', toggle, {passive:true});
        btn.addEventListener('click', () => main?.scrollTo({top:0,behavior:'smooth'}));
    }

    initRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-primary,.btn-secondary,.pg-btn');
            if (!btn) return;
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }
}

// ===== APP =====
class App {
    constructor() {
        this.store = new Store();
        this.initTheme();
        this.initSidebar();
        this.initConnectionStatus();
        this.initKeyboardNav();
        this.router = new Router(this.store);
        this.exportManager = new ExportManager(this.store);
        window.router = this.router;
        this.router.init();
        this.router.initScrollTop();
        this.router.initRipples();
        // Register service worker for PWA + offline caching
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
        // Request notifications after user interaction
        document.addEventListener('click', () => { if (this.store.data.settings.notificationsEnabled) Notify.request(); }, {once: true});
    }
    initTheme() {
        const apply = (theme) => {
            let actualTheme = theme;
            if (theme === 'auto') { actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
            document.documentElement.setAttribute('data-theme', actualTheme);
        };
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.store.data.settings.theme === 'auto') apply('auto');
        });
        const saved = this.store.data.settings.theme || 'auto';
        apply(saved);
        const toggle = document.getElementById('theme-toggle');
        toggle.setAttribute('aria-label', 'Schimbă tema');
        toggle.addEventListener('click', () => {
            const cycle = {light:'dark',dark:'auto',auto:'light'};
            const next = cycle[this.store.data.settings.theme] || 'light';
            this.store.data.settings.theme = next; this.store.save();
            apply(next);
            const labels = {light:'🌞 Temă lumină',dark:'🌙 Temă întuneric',auto:'🔄 Temă automată'};
            Toast.show(labels[next], 'info', 1500);
        });
        // Notification toggle in sidebar
        const notifBtn = document.getElementById('notif-toggle');
        if (notifBtn) {
            notifBtn.setAttribute('aria-label', 'Activează notificări');
            notifBtn.addEventListener('click', () => Notify.toggle(this.store));
        }
    }
    initSidebar() {
        const sidebar = document.getElementById('sidebar'), overlay = document.getElementById('overlay');
        document.getElementById('hamburger').setAttribute('aria-label', 'Deschide meniu');
        document.getElementById('hamburger').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('open'); });
        document.getElementById('sidebar-close').setAttribute('aria-label', 'Închide meniu');
        document.getElementById('sidebar-close').addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
        overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
    }
    initConnectionStatus() {
        const el = document.getElementById('conn-status');
        const update = () => {
            if (navigator.onLine) { el.textContent = '●'; el.style.color = 'var(--success)'; el.title = 'Online'; el.classList.remove('offline'); el.setAttribute('aria-label', 'Online'); }
            else { el.textContent = '●'; el.style.color = 'var(--danger)'; el.title = 'Offline'; el.classList.add('offline'); el.setAttribute('aria-label', 'Offline'); Toast.show('Ești offline. Datele sunt salvate local.', 'warn', 4000); }
        };
        update();
        window.addEventListener('online', () => { update(); Toast.show('Online', 'success', 1500); });
        window.addEventListener('offline', () => { update(); Toast.show('Offline — salvare locală', 'warn', 3000); });
    }
    initKeyboardNav() {
        document.addEventListener('keydown', e => {
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                const idx = parseInt(e.key) - 1;
                if (idx < this.router.navItems.length) { e.preventDefault(); this.router.goto(this.router.navItems[idx].id); }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
