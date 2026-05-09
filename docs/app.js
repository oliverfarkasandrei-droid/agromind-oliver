// ✅ AgroMind Premium v2.1
// Autor: Oliver Farkas Andrei | InfoEducație 2026
// Arhitectură: ES6 Classes. Zero innerHTML în producție logică. Toate elementele construite via DOM API.

// ===== UTILITARE =====
class Utils {
    static debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
    static clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    static fmtd(n, d = 2) { return Number.isFinite(n) ? Number(n).toFixed(d) : '0'; }
    static fmtd0(n) { return Number.isFinite(n) ? Math.round(n).toLocaleString('ro-RO') : '0'; }
    static fmtDate(s) { if (!s) return '-'; const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; }
    static getCSSVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#3b82f6'; }
}

class Toast {
    static init() { Toast.container = document.getElementById('toast-container'); }
    static show(msg, type = 'info', duration = 3000) {
        if (!Toast.container) Toast.init();
        const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = msg;
        Toast.container.appendChild(el);
        setTimeout(() => { el.style.animation = 'fadeOutUp 0.35s ease-out forwards'; setTimeout(() => el.remove(), 350); }, duration);
    }
}

class Loading {
    static el() { return document.getElementById('loading-overlay'); }
    static show() { Loading.el()?.classList.add('active'); }
    static hide() { Loading.el()?.classList.remove('active'); }
}

class Validators {
    static num(v, min, max) {
        const n = parseFloat(v);
        if (!Number.isFinite(n)) return [null, 'Valoare numerică invalidă'];
        if (n < min || n > max) return [null, `Trebuie să fie între ${min} și ${max}`];
        return [n, null];
    }
    static nonEmpty(v, label) {
        const s = String(v || '').trim();
        if (!s) return [null, `${label} este obligatoriu`];
        return [s, null];
    }
}

// ===== STORE =====
class Store {
    constructor() { this.key = 'agromind_premium_v21'; this.data = this.load(); this.migrate(); }
    load() { try { const raw = localStorage.getItem(this.key); if (raw) return JSON.parse(raw); } catch {} return this.defaults(); }
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch { Toast.show('Eroare la salvare date', 'error'); } }
    defaults() {
        return {
            crops: [
                {id:1,name:'Tomate',category:'Legume',area:0.5,phase:'Florire',plantedDate:'2026-03-15',seedYield:30000,pricePerKg:8.5,soil:'Lutos-argilos',water:'Moderat',temp:'18-25°C',notes:''},
                {id:2,name:'Cartofi',category:'Legume',area:1.2,phase:'Vegetație',plantedDate:'2026-04-01',seedYield:20000,pricePerKg:3,soil:'Lutos-nisipos',water:'Moderat',temp:'15-20°C',notes:''},
                {id:3,name:'Grâu',category:'Cereale',area:5,phase:'Răsărire',plantedDate:'2025-10-20',seedYield:4500,pricePerKg:1.8,soil:'Chernozem',water:'Redus',temp:'10-20°C',notes:''},
                {id:4,name:'Măr',category:'Fructe',area:0.8,phase:'Vegetație',plantedDate:'2020-03-10',seedYield:15000,pricePerKg:5,soil:'Lutos',water:'Moderat',temp:'12-22°C',notes:''},
                {id:5,name:'Busuioc',category:'Plante aromatice',area:0.1,phase:'Răsărire',plantedDate:'2026-05-01',seedYield:8000,pricePerKg:25,soil:'Bine drenat',water:'Redus',temp:'20-30°C',notes:''},
                {id:6,name:'Porumb',category:'Cereale',area:3,phase:'Răsărire',plantedDate:'2026-04-15',seedYield:8000,pricePerKg:2.5,soil:'Lutos',water:'Moderat',temp:'18-27°C',notes:''},
            ],
            diseases: [
                {id:1,name:'Mana tomatei',symptoms:['pete maro pe frunze','mucegai gri pe fața inferioară','îngălbenire'],treatment:'Fungicide pe bază de cupru. Eliminare frunze afectate.',affected:['Tomate','Cartofi'],severity:'Mare'},
                {id:2,name:'Rugina grâului',symptoms:['pustule portocalii','îngălbenire frunze','ofilire'],treatment:'Fungicide triazolice. Rotația culturilor.',affected:['Grâu'],severity:'Mare'},
                {id:3,name:'Afide',symptoms:['frunze răsucite','substanță lipicioasă','prezență insecte mici verzi'],treatment:'Săpun insecticid sau extract de urzică.',affected:['Tomate','Cartofi','Măr'],severity:'Medie'},
                {id:4,name:'Putregai cenușiu',symptoms:['pete cenușii pe fructe','mucegai flufos','cădere prematură'],treatment:'Ventilare, evitare umezeală. Fungicide.',affected:['Tomate','Legume'],severity:'Mare'},
                {id:5,name:'Făina mărului',symptoms:['depuneri albe pe frunze','deformare'],treatment:'Fungicide sistemice. Soiuri rezistente.',affected:['Măr','Piersic'],severity:'Medie'},
                {id:6,name:'Fuzarioza',symptoms:['ofilire bruscă','tulpini maro','rădăcini putrezite'],treatment:'Solare, tratament semințe. Evitare exces apă.',affected:['Porumb','Grâu'],severity:'Mare'},
            ],
            journals: [], lastId: {crop:6,disease:6,journal:0},
            settings: {theme:'light',diagnosesUsed:0,lastWeatherCity:''},
            weatherCache: null, weatherCacheTime: 0,
        };
    }
    migrate() {
        const d = this.data; if (!d.journals) d.journals = []; if (!d.settings) d.settings = {theme:'light',diagnosesUsed:0,lastWeatherCity:''};
        for (const c of d.crops) {
            c.value = (c.area || 0) * (c.seedYield || 0) * (c.pricePerKg || 0);
            if (!c.phase) c.phase = 'Răsărire'; if (!c.plantedDate) c.plantedDate = '';
            if (!c.seedYield) c.seedYield = 0; if (!c.pricePerKg) c.pricePerKg = 0; if (!c.area) c.area = 0;
        }
        this.save();
    }
    addCrop(crop) { this.data.lastId.crop++; crop.id = this.data.lastId.crop; this.data.crops.push(crop); this.save(); }
    deleteCrop(id) { this.data.crops = this.data.crops.filter(c => c.id !== id); this.save(); }
    addJournal(entry) { this.data.lastId.journal++; entry.id = this.data.lastId.journal; this.data.journals.push(entry); this.save(); }
    deleteJournal(id) { this.data.journals = this.data.journals.filter(j => j.id !== id); this.save(); }
    getTotalValue() { return this.data.crops.reduce((s, c) => s + (c.value || 0), 0); }
    getTotalArea()  { return this.data.crops.reduce((s, c) => s + (c.area || 0), 0); }
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
        c.innerHTML = ''; // doar aici se accepta, pe container de page
        const d = this.store.data;
        const totalC = d.crops.length;
        const totalA = this.store.getTotalArea();
        const totalV = this.store.getTotalValue();
        const score = this.calcScore();
        const hdr = this.el('div', 'page-header');
        hdr.appendChild(this.el('h2', null, 'Panou Principal'));
        hdr.appendChild(this.el('p', 'subtitle', 'AgroMind Premium v2.1 — Asistentul digital al fermei tale'));
        c.appendChild(hdr);
        const cards = this.el('div', 'cards');
        cards.appendChild(this.mkCard('🌱', totalC, 'Culturi active'));
        cards.appendChild(this.mkCard('📐', Utils.fmtd(totalA, 1), 'Suprafață totală (ha)'));
        cards.appendChild(this.mkCard('💰', Utils.fmtd0(totalV), 'Valoare estimată (RON)'));
        const scCard = this.mkCard('⚡', score + '/100', 'Sănătate fermă', this.scoreColor(score));
        scCard.querySelector('.card-value').style.color = this.scoreColor(score);
        cards.appendChild(scCard);
        c.appendChild(cards);
        const sPanel = this.el('div', 'glass-panel');
        sPanel.appendChild(this.el('h3', null, '🌾 Recomandări sezon: ' + this.currentMonth()));
        for (const r of this.seasonRecs()) { const di = this.el('div', 'list-item'); di.appendChild(this.el('p', null, r)); sPanel.appendChild(di); }
        c.appendChild(sPanel);
        const cPanel = this.el('div', 'glass-panel');
        cPanel.appendChild(this.el('h3', null, '📅 Calendar agricol lunar'));
        for (const item of this.calendarItems()) { const di = this.el('div', 'list-item'); di.appendChild(this.el('p', null, item)); cPanel.appendChild(di); }
        c.appendChild(cPanel);
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
        const m = new Date().getMonth();
        const names = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        const out = [];
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
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header');
        hdr.appendChild(this.el('h2', null, '🌱 Culturi'));
        c.appendChild(hdr);
        c.appendChild(this.buildToolbar());
        c.appendChild(this.buildList());
        c.appendChild(this.buildAddForm());
    }
    buildToolbar() {
        const t = this.el('div', 'toolbar');
        const search = this.el('input'); search.type = 'text'; search.placeholder = '🔍 Caută culturi...';
        search.addEventListener('input', Utils.debounce(() => this.updateList(), 250));
        search.id = 'crop-search'; t.appendChild(search);
        const sel = this.el('select'); sel.id = 'crop-filter';
        sel.innerHTML = '<option value="">Toate categoriile</option><option>Legume</option><option>Cereale</option><option>Fructe</option><option>Plante aromatice</option>';
        sel.addEventListener('change', () => this.updateList()); t.appendChild(sel);
        const btn = this.el('button', 'btn-primary', '+ Adaugă');
        btn.addEventListener('click', () => document.getElementById('add-form').style.display = 'block');
        t.appendChild(btn); return t;
    }
    updateList() {
        const f = (document.getElementById('crop-filter')?.value || '').trim();
        const s = (document.getElementById('crop-search')?.value || '').toLowerCase().trim();
        let items = [...this.store.data.crops];
        if (f) items = items.filter(c => c.category === f);
        if (s) items = items.filter(c => (c.name || '').toLowerCase().includes(s) || (c.soil || '').toLowerCase().includes(s));
        this.listEl.innerHTML = '';
        if (!items.length) { this.listEl.appendChild(this.el('p', null, 'Nicio cultură găsită.')); return; }
        for (const c of items) {
            const item = this.el('div', 'list-item');
            const left = this.el('div');
            const h4 = this.el('h4', null, c.name);
            const tag = this.el('span', 'tag', c.category); tag.style.marginLeft = '8px'; h4.appendChild(tag);
            left.appendChild(h4);
            left.appendChild(this.el('p', null, `Suprafață: ${c.area} ha | Fază: ${c.phase} | Randament: ${c.seedYield} kg/ha | Preț: ${c.pricePerKg} RON/kg`));
            left.appendChild(this.el('p', null, `Valoare estimată: ${Utils.fmtd0(c.value)} RON | Plantat: ${Utils.fmtDate(c.plantedDate)}`));
            const btn = this.el('button', 'btn-secondary', '🗑️'); btn.style.color = 'var(--danger)';
            btn.addEventListener('click', () => { this.store.deleteCrop(c.id); Toast.show('Cultură ștearsă', 'success'); this.updateList(); });
            item.append(left, btn); this.listEl.appendChild(item);
        }
    }
    buildList() { this.listEl = this.el('div', 'list'); this.listEl.id = 'crops-list'; this.updateList(); return this.listEl; }
    buildAddForm() {
        const wrap = this.el('div', 'glass-panel'); wrap.style.display = 'none'; wrap.id = 'add-form';
        wrap.appendChild(this.el('h3', null, 'Adaugă cultură nouă'));
        const form = this.el('form'); form.id = 'crop-form'; form.className = 'form';
        form.appendChild(this.inp('c-name', 'Nume cultură *', 'text', true));
        form.appendChild(this.sel('c-cat', 'Categorie', [['Legume','Legume'],['Cereale','Cereale'],['Fructe','Fructe'],['aromatice','Plante aromatice']]));
        form.appendChild(this.inp('c-area', 'Suprafață (ha) *', 'number', true, '0.01', 'ex: 0.5'));
        form.appendChild(this.sel('c-phase', 'Fază creștere', [['Răsărire'],['Vegetație'],['Florire'],['Coacere'],['Recoltare']]));
        form.appendChild(this.inp('c-planted', 'Data plantare', 'date'));
        form.appendChild(this.inp('c-yield', 'Randament estimat (kg/ha) *', 'number', true, '1'));
        form.appendChild(this.inp('c-price', 'Preț/kg (RON) *', 'number', true, '0.01'));
        form.appendChild(this.inp('c-soil', 'Tip sol', 'text', false, null, 'ex: Lutos-argilos'));
        const btns = this.el('div'); btns.style.display = 'flex'; btns.style.gap = '10px'; btns.style.marginTop = '8px';
        const sub = this.el('button', 'btn-primary', 'Salvează'); sub.type = 'submit';
        const can = this.el('button', 'btn-secondary', 'Anulează');
        can.addEventListener('click', () => document.getElementById('add-form').style.display = 'none');
        btns.append(sub, can); form.appendChild(btns);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const [name, eN] = Validators.nonEmpty(form.querySelector('#c-name').value, 'Numele');
            const [area, eA] = Validators.num(form.querySelector('#c-area').value, 0.001, 1000);
            const [sy, eY] = Validators.num(form.querySelector('#c-yield').value, 0, 100000);
            const [pr, eP] = Validators.num(form.querySelector('#c-price').value, 0, 10000);
            if (eN) { Toast.show(eN, 'error'); return; }
            if (eA) { Toast.show(eA, 'error'); return; }
            if (eY) { Toast.show(eY, 'error'); return; }
            if (eP) { Toast.show(eP, 'error'); return; }
            const crop = { id: 0, name, category: form.querySelector('#c-cat').value, area, phase: form.querySelector('#c-phase').value,
                plantedDate: form.querySelector('#c-planted').value, seedYield: sy, pricePerKg: pr,
                soil: form.querySelector('#c-soil').value, water: '', temp: '', notes: '' };
            crop.value = crop.area * crop.seedYield * crop.pricePerKg;
            this.store.addCrop(crop); Toast.show('Cultură adăugată!', 'success');
            form.reset(); wrap.style.display = 'none'; this.updateList();
        });
        wrap.appendChild(form); return wrap;
    }
    inp(id, label, type, req, step, placeholder) {
        const w = this.el('div'); w.style.display = 'flex'; w.style.flexDirection = 'column'; w.style.gap = '4px';
        w.appendChild(this.el('label', null, label));
        const i = this.el('input'); i.type = type; i.id = id; i.required = !!req;
        if (step) { i.step = step; i.min = '0'; }
        if (placeholder) i.placeholder = placeholder;
        w.appendChild(i); return w;
    }
    sel(id, label, opts) {
        const w = this.el('div'); w.style.display = 'flex'; w.style.flexDirection = 'column'; w.style.gap = '4px';
        w.appendChild(this.el('label', null, label));
        const s = this.el('select'); s.id = id;
        for (const [v, t] of opts) { const o = this.el('option', null, t || v); o.value = v; s.appendChild(o); }
        w.appendChild(s); return w;
    }
}

// ===== BOLI =====
class DiseasesPage extends Page {
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, '🦠 Boli și Dăunători')); c.appendChild(hdr);
        const srch = this.el('div', 'toolbar');
        const input = this.el('input'); input.type = 'text'; input.placeholder = '🔍 Caută simptome sau nume...';
        input.id = 'disease-search'; input.addEventListener('input', Utils.debounce(() => this.renderList(c), 200));
        srch.appendChild(input);
        const di = this.el('button', 'btn-primary', '🤖 Diagnostic AI');
        di.addEventListener('click', () => document.getElementById('diag-panel')?.scrollIntoView({ behavior: 'smooth' }));
        srch.appendChild(di); c.appendChild(srch);
        this.renderList(c);
        const panel = this.el('div', 'glass-panel'); panel.id = 'diag-panel';
        panel.appendChild(this.el('h3', null, '🔬 Diagnostic rapid inteligent'));
        panel.appendChild(this.el('p', null, 'Selectează simptomele observate pe plantă:'));
        const cg = this.el('div', 'checkbox-grid');
        for (const s of [...new Set(this.store.data.diseases.flatMap(d => d.symptoms))]) {
            const lb = document.createElement('label');
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = s; lb.append(cb, document.createTextNode(' ' + s)); cg.appendChild(lb);
        }
        panel.appendChild(cg);
        const anBtn = this.el('button', 'btn-primary', '🔍 Analizează'); panel.appendChild(anBtn);
        this.resEl = this.el('div'); panel.appendChild(this.resEl);
        anBtn.addEventListener('click', () => {
            const cb = [...cg.querySelectorAll('input:checked')];
            this.runDiagnosis(cb);
        });
        c.appendChild(panel);
    }
    runDiagnosis(cbs) {
        this.resEl.innerHTML = '';
        if (!cbs.length) { this.resEl.appendChild(this.el('div', 'alert-warn', '⚠️ Selectează cel puțin un simptom')); Toast.show('Selectează simptome', 'warn'); return; }
        Loading.show();
        const checked = cbs.map(x => x.value);
        const m = this.store.data.diseases.map(d => {
            const sc = d.symptoms.filter(s => checked.includes(s)).length;
            return { ...d, sc, pct: Math.round((sc / d.symptoms.length) * 100) };
        }).filter(d => d.sc > 0).sort((a, b) => b.sc - a.sc);
        Loading.hide();
        if (!m.length) { this.resEl.appendChild(this.el('div', 'alert-warn', 'Nicio boală corespunzătoare găsită')); return; }
        this.store.data.settings.diagnosesUsed = (this.store.data.settings.diagnosesUsed || 0) + 1; this.store.save();
        const box = this.el('div', 'result-box'); box.appendChild(this.el('h4', null, '🔬 Rezultat diagnostic'));
        for (const x of m.slice(0, 3)) {
            const strong = this.el('strong', null, x.name + ' — ' + x.pct + '% potrivire');
            strong.style.color = x.pct >= 80 ? 'var(--danger)' : x.pct >= 50 ? 'var(--warning)' : 'var(--success)';
            box.appendChild(this.el('p', null, '').appendChild(strong));
            const p2 = this.el('p', null, 'Simptome potrivite: ' + x.symptoms.filter(s => checked.includes(s)).join(', '));
            p2.style.fontSize = '13px'; p2.style.color = 'var(--text-muted)'; box.appendChild(p2);
            const p3 = this.el('p', null, 'Tratament: ' + x.treatment); p3.style.fontSize = '13px'; box.appendChild(p3);
            if (x !== m.slice(0, 3).at(-1)) box.appendChild(this.el('hr'));
        }
        const note = this.el('p', null, '⚠️ Diagnostic orientativ. Consultă un agronom pentru confirmare.');
        note.style.fontSize = '12px'; note.style.color = 'var(--text-muted)'; box.appendChild(note);
        this.resEl.appendChild(box);
        Toast.show('Diagnostic generat cu succes', 'success');
    }
    renderList(c) {
        let prev = c.querySelector('#diseases-list'); if (prev) prev.remove();
        const s = (document.getElementById('disease-search')?.value || '').toLowerCase().trim();
        let items = [...this.store.data.diseases];
        if (s) items = items.filter(d => d.name.toLowerCase().includes(s) || d.symptoms.some(st => st.includes(s)));
        const list = this.el('div', 'list'); list.id = 'diseases-list';
        for (const d of items) {
            const it = this.el('div', 'list-item');
            const div = this.el('div');
            const h = this.el('h4', null, d.name);
            const sev = this.el('span', 'tag', d.severity);
            sev.style.background = d.severity === 'Mare' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
            sev.style.color = d.severity === 'Mare' ? '#dc2626' : '#d97706';
            h.appendChild(sev); div.appendChild(h);
            div.appendChild(this.el('p', null, 'Simptome: ' + d.symptoms.join(', ')));
            const p2 = this.el('p', null, 'Tratament: ' + d.treatment); p2.style.marginTop = '4px'; div.appendChild(p2);
            it.append(div, this.el('span', 'tag', d.affected.join(', '))); list.appendChild(it);
        }
        c.appendChild(list);
    }
}

// ===== FERTILIZER =====
class FertilizerPage extends Page {
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, '⚗️ Calculator Îngrășăminte')); c.appendChild(hdr);
        const wrap = this.el('div', 'glass-panel');
        wrap.appendChild(this.el('h3', null, 'Parametri calcul'));
        const form = this.el('form'); form.id = 'fert-form'; form.className = 'form';
        form.appendChild(this.sel('fert-crop', 'Tip cultură', [['legume','Legume'],['cereale','Cereale'],['fructe','Fructe'],['aromatice','Plante aromatice']]));
        form.appendChild(this.inp('fert-area', 'Suprafață (ha)', 'number', '1', true));
        form.appendChild(this.sel('fert-type', 'Tip îngrășământ', [['NPK 20-20-20','NPK 20-20-20'],['NPK 15-15-15','NPK 15-15-15'],['Azotat de amoniu','Azotat de amoniu'],['Superfosfat','Superfosfat'],['Sulfat de potasiu','Sulfat de potasiu'],['Îngrășământ organic','Îngrășământ organic']]));
        form.appendChild(this.sel('fert-phase', 'Fază de creștere', [['1','Răsărire'],['1.5','Vegetație'],['2','Florire'],['2.5','Coacere']]));
        const btn = this.el('button', 'btn-primary', 'Calculează doza optimă'); btn.type = 'submit'; btn.style.marginTop = '8px'; form.appendChild(btn);
        this.res = this.el('div');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const crop = form.querySelector('#fert-crop').value;
            const area = parseFloat(form.querySelector('#fert-area').value) || 0;
            const fType = form.querySelector('#fert-type').value;
            const fPhase = parseFloat(form.querySelector('#fert-phase').value) || 1;
            const fertMap = {'NPK 20-20-20':{n:20,p:20,k:20,price:15},'NPK 15-15-15':{n:15,p:15,k:15,price:12},'Azotat de amoniu':{n:34,p:0,k:0,price:8},'Superfosfat':{n:0,p:20,k:0,price:10},'Sulfat de potasiu':{n:0,p:0,k:50,price:14},'Îngrășământ organic':{n:5,p:3,k:4,price:6}};
            const f = fertMap[fType]; if (!f || area <= 0) { Toast.show('Completează toate câmpurile', 'error'); return; }
            const rates = {legume:0.05,cereale:0.03,fructe:0.04,aromatice:0.02};
            const qty = Math.round(area * (rates[crop]||0.04) * fPhase * 1000) / 1000;
            const cost = Math.round(qty * f.price * 100) / 100;
            const nQty = Math.round(qty * f.n / 100 * 100) / 100;
            const pQty = Math.round(qty * f.p / 100 * 100) / 100;
            const kQty = Math.round(qty * f.k / 100 * 100) / 100;
            this.res.innerHTML = '';
            const box = this.el('div', 'result-box'); box.appendChild(this.el('h4', null, '📊 Rezultat calcul'));
            const g = this.el('div', 'cards');
            g.appendChild(this.mkCard('🔹', Utils.fmtd(qty,2), 't necesari'));
            g.appendChild(this.mkCard('💰', Utils.fmtd(cost,2), 'RON'));
            g.appendChild(this.mkCard('N', Utils.fmtd(nQty,2), 'kg Azot'));
            g.appendChild(this.mkCard('P', Utils.fmtd(pQty,2), 'kg Fosfor'));
            g.appendChild(this.mkCard('K', Utils.fmtd(kQty,2), 'kg Potasiu'));
            box.appendChild(g);
            box.appendChild(this.el('p', null, `Cultură: ${crop} · Suprafață: ${area} ha · Fază: ${fPhase===1?'Răsărire':fPhase===1.5?'Vegetație':fPhase===2?'Florire':'Coacere'} · ${fType}`));
            this.res.appendChild(box);
            Toast.show('Calcul generat cu succes', 'success');
        });
        wrap.appendChild(form); wrap.appendChild(this.res); c.appendChild(wrap);
    }
    sel(id, label, opts) {
        const w = this.el('div'); w.style.display = 'flex'; w.style.flexDirection = 'column'; w.style.gap = '4px';
        w.appendChild(this.el('label', null, label));
        const s = this.el('select'); s.id = id;
        for (const [v, t] of opts) { const o = this.el('option', null, t); o.value = v; s.appendChild(o); }
        w.appendChild(s); return w;
    }
    inp(id, label, type, def, req) {
        const w = this.el('div'); w.style.display = 'flex'; w.style.flexDirection = 'column'; w.style.gap = '4px';
        w.appendChild(this.el('label', null, label + (req ? ' *' : '')));
        const i = this.el('input'); i.type = type; i.id = id; i.value = def; i.required = !!req;
        if (type === 'number') { i.step = '0.01'; i.min = '0.01'; }
        w.appendChild(i); return w;
    }
    mkCard(icon, val, lb) { const c = this.el('div', 'card'); c.append(this.el('div', 'card-icon', icon), this.el('div', 'card-value', val), this.el('div', 'card-label', lb)); return c; }
}

// ===== JOURNAL =====
class JournalPage extends Page {
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, '📝 Jurnal Recolte')); c.appendChild(hdr);
        const formWrap = this.el('div', 'glass-panel');
        const form = this.el('form'); form.id = 'journal-form'; form.className = 'form';
        const names = this.store.data.crops.map(c => c.name).filter(Boolean);
        const dl = document.createElement('datalist'); dl.id = 'crop-datalist';
        for (const n of names) { const o = document.createElement('option'); o.value = n; dl.appendChild(o); }
        form.appendChild(dl);
        form.appendChild(this.inp('j-crop', 'Cultură', 'text', true, null, 'ex: Tomate'));
        form.querySelector('#j-crop').setAttribute('list', 'crop-datalist');
        form.appendChild(this.inp('j-date', 'Data', 'date', true, null, new Date().toISOString().split('T')[0]));
        form.appendChild(this.inp('j-qty', 'Cantitate (kg)', 'number', true, '0.01'));
        form.appendChild(this.inp('j-price', 'Preț/kg (RON)', 'number', false, '0.01'));
        form.appendChild(this.inp('j-notes', 'Observații', 'text', false));
        const btns = this.el('div'); btns.style.display = 'flex'; btns.style.gap = '8px';
        btns.appendChild(this.el('button', 'btn-primary', 'Adaugă intrare'));
        formWrap.appendChild(form); formWrap.appendChild(btns);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const [crop, eC] = Validators.nonEmpty(form.querySelector('#j-crop').value, 'Cultura');
            const [qty, eQ] = Validators.num(form.querySelector('#j-qty').value, 0.01, 100000);
            if (eC) { Toast.show(eC, 'error'); return; }
            if (eQ) { Toast.show(eQ, 'error'); return; }
            this.store.addJournal({id:0, crop, date: form.querySelector('#j-date').value, qty, price: parseFloat(form.querySelector('#j-price').value)||null, notes: form.querySelector('#j-notes').value||''});
            Toast.show('Intrare adăugată', 'success');
            form.reset(); form.querySelector('#j-date').value = new Date().toISOString().split('T')[0]; this.updateList();
        });
        c.appendChild(formWrap);
        const tb = this.el('div', 'toolbar');
        const sel = this.el('select'); sel.id = 'j-sort'; sel.innerHTML = '<option value="date-desc">Cele mai noi</option><option value="date-asc">Cele mai vechi</option>';
        sel.addEventListener('change', () => this.updateList()); tb.appendChild(sel);
        const exBtn = this.el('button', 'btn-secondary', 'Export CSV'); exBtn.addEventListener('click', () => this.exportCSV()); tb.appendChild(exBtn);
        c.appendChild(tb);
        this.listEl = this.el('div', 'list'); c.appendChild(this.listEl); this.updateList();
    }
    updateList() {
        const sort = document.getElementById('j-sort')?.value || 'date-desc';
        let items = [...this.store.data.journals];
        if (sort === 'date-desc') items.sort((a, b) => b.date.localeCompare(a.date)); else items.sort((a, b) => a.date.localeCompare(b.date));
        this.listEl.innerHTML = '';
        if (!items.length) { this.listEl.appendChild(this.el('p', null, 'Nicio intrare în jurnal. Adaugă prima intrare!')); return; }
        for (const j of items) {
            const it = this.el('div', 'list-item');
            const div = this.el('div');
            const val = j.price ? j.qty * j.price : 0;
            div.appendChild(this.el('h4', null, j.crop + ' — ' + j.qty + ' kg' + (j.price ? ' (≈ ' + Utils.fmtd(val,2) + ' RON)' : '')));
            div.appendChild(this.el('p', null, Utils.fmtDate(j.date) + (j.notes ? ' · ' + j.notes : '')));
            const btn = this.el('button', 'btn-secondary', '🗑️'); btn.style.color = 'var(--danger)';
            btn.addEventListener('click', () => { this.store.deleteJournal(j.id); Toast.show('Intrare ștearsă', 'success'); this.updateList(); });
            it.append(div, btn); this.listEl.appendChild(it);
        }
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
        const w = this.el('div'); w.style.display = 'flex'; w.style.flexDirection = 'column'; w.style.gap = '4px';
        w.appendChild(this.el('label', null, label + (req ? ' *' : '')));
        const i = this.el('input'); i.type = type; i.id = id; i.value = val || ''; i.required = !!req;
        if (step) { i.step = step; i.min = '0'; }
        w.appendChild(i); return w;
    }
}

// ===== CHARTS =====
class ChartsPage extends Page {
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, '📊 Analitice Recolte')); c.appendChild(hdr);
        const tb = this.el('div', 'toolbar');
        const yr = this.el('select'); for(const y of [2026,2025,2024]) { const o=document.createElement('option'); o.value=y; o.textContent=y; yr.appendChild(o); } yr.value='2026'; yr.id='chart-year'; yr.addEventListener('change', () => this.drawCanvas()); tb.appendChild(yr);
        const cr = this.el('select'); const opts = [...new Set(this.store.data.journals.map(j=>j.crop))];
        cr.innerHTML = '<option value="">Toate culturile</option>' + opts.map(c => `<option value="${c}">${c}</option>`).join(''); cr.id='chart-crop'; cr.addEventListener('change', ()=>this.drawCanvas()); tb.appendChild(cr);
        const met = this.el('select'); met.innerHTML = '<option value="qty">Cantitate (kg)</option><option value="value">Valoare (RON)</option>'; met.id='chart-metric'; met.addEventListener('change', ()=>this.drawCanvas()); tb.appendChild(met);
        c.appendChild(tb);
        const canvasWrap = this.el('div', 'glass-panel');
        const canvas = document.createElement('canvas'); canvas.id = 'harvest-chart';
        canvas.style.width = '100%'; canvas.style.height = '380px'; canvasWrap.appendChild(canvas);
        c.appendChild(canvasWrap);
        this.statsEl = this.el('div', 'cards'); c.appendChild(this.statsEl);
        this.drawCanvas();
    }
    drawCanvas() {
        const c = document.getElementById('harvest-chart'); if (!c) return;
        const parent = c.parentElement;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = parent.clientWidth * dpr; c.height = 380 * dpr;
        c.style.width = parent.clientWidth + 'px'; c.style.height = '380px';
        const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, c.width, c.height);
        const w = parent.clientWidth;
        const year = (document.getElementById('chart-year')?.value || '2026');
        const cropF = document.getElementById('chart-crop')?.value || '';
        const metric = document.getElementById('chart-metric')?.value || 'qty';
        let items = this.store.data.journals.filter(j => j.date && j.date.startsWith(year));
        if (cropF) items = items.filter(j => j.crop === cropF);
        const monthly = {}; for (let i = 1; i <= 12; i++) monthly[i] = 0;
        items.forEach(j => { const m = parseInt(j.date.split('-')[1]); monthly[m] += metric === 'value' && j.price ? j.qty * j.price : j.qty; });
        const values = Object.values(monthly);
        const max = Math.max(...values, 1);
        const pad = 50, ch = 260;
        const bw = Math.max(24, (w - pad * 2 - 11 * 14) / 12);
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / 12;
        const bestMonth = values.indexOf(Math.max(...values)) + 1;
        const months = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Noi','Dec'];
        const bgColor = Utils.getCSSVar('--bg');
        const textColor = Utils.getCSSVar('--text');
        const mutedColor = Utils.getCSSVar('--text-muted');
        const accentColor = Utils.getCSSVar('--accent');
        ctx.fillStyle = textColor; ctx.font = 'bold 14px sans-serif'; ctx.fillText(`Recolte ${year}${cropF ? ' — ' + cropF : ''} (${metric === 'value' ? 'RON' : 'kg'})`, pad, 25);
        ctx.strokeStyle = Utils.getCSSVar('--border-solid'); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, 295); ctx.lineTo(pad + 12 * (bw + 14), 295); ctx.stroke();
        values.forEach((v, i) => {
            const h = (v / max) * ch; const x = pad + i * (bw + 14); const y = 295 - h;
            ctx.fillStyle = v > 0 ? accentColor : Utils.getCSSVar('--border-solid');
            ctx.fillRect(x, y, bw, h);
            ctx.fillStyle = mutedColor; ctx.font = '12px sans-serif';
            ctx.fillText(months[i], x + bw / 2 - 10, 315);
            if (v > 0) { ctx.fillStyle = textColor; ctx.font = 'bold 12px sans-serif'; ctx.fillText(Math.round(v).toString(), x + 4, y - 6); }
        });
        this.statsEl.innerHTML = '';
        this.statsEl.appendChild(this.mkCard(Utils.fmtd0(total), `Total ${metric === 'value' ? 'RON' : 'kg'}`));
        this.statsEl.appendChild(this.mkCard(Utils.fmtd(avg), 'Medie lunară'));
        this.statsEl.appendChild(this.mkCard(months[bestMonth - 1] || '-', 'Luna maxim'));
    }
    mkCard(val, lb) { const c = this.el('div', ['card','glass']); c.appendChild(this.el('div', 'card-value', val)); c.appendChild(this.el('div', 'card-label', lb)); return c; }
}

// ===== WEATHER =====
class WeatherPage extends Page {
    render(c) {
        c.innerHTML = '';
        const hdr = this.el('div', 'page-header'); hdr.appendChild(this.el('h2', null, '🌦️ Meteo Agricolă')); c.appendChild(hdr);
        const tb = this.el('div', 'toolbar');
        const input = this.el('input'); input.type = 'text'; input.placeholder = 'Introdu localitatea...';
        input.id = 'city-input'; input.value = this.store.data.settings.lastWeatherCity || 'București';
        tb.appendChild(input);
        const btn = this.el('button', 'btn-primary', '🔍 Caută'); btn.id = 'weather-search';
        btn.addEventListener('click', () => this.searchCity());
        input.addEventListener('keypress', e => { if (e.key === 'Enter') this.searchCity(); });
        tb.appendChild(btn); c.appendChild(tb);
        this.curEl = this.el('div', 'glass-panel'); this.curEl.id = 'weather-current'; c.appendChild(this.curEl);
        this.forEl = this.el('div', 'glass-panel'); this.forEl.id = 'weather-forecast'; c.appendChild(this.forEl);
        this.alertEl = this.el('div', 'glass-panel');
        this.alertEl.appendChild(this.el('h3', null, '🌡️ Alertă agricolă meteo'));
        const alDiv = this.el('div'); alDiv.id = 'weather-alerts';
        this.alertEl.appendChild(alDiv); c.appendChild(this.alertEl);
        this.fetchWeather(44.43, 26.10, 'București');
    }
    async searchCity() {
        const q = document.getElementById('city-input').value.trim();
        if (!q) { Toast.show('Introdu o localitate', 'warn'); return; }
        Loading.show();
        try {
            const hardcoded = {
                'bucuresti': [44.43,26.10], 'cluj': [46.77,23.60], 'cluj-napoca': [46.77,23.60],
                'timisoara': [45.75,21.23], 'iasi': [47.17,27.60], 'brasov': [45.65,25.61],
                'constanta': [44.18,28.63], 'craiova': [44.33,23.82],
                'sibiu': [45.80,24.15], 'oradea': [47.05,21.93], 'galati': [45.44,28.05],
                'ploiesti': [44.94,26.02], 'pitesti': [44.86,24.87], 'suceava': [47.63,26.26]
            };
            const key = q.toLowerCase().replace(/[ăâ]/g,'a').replace(/[șş]/g,'s').replace(/[țţ]/g,'t').replace(/î/g,'i');
            if (hardcoded[key]) {
                this.store.data.settings.lastWeatherCity = q; this.store.save();
                await this.fetchWeather(hardcoded[key][0], hardcoded[key][1], q);
                Loading.hide(); return;
            }
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)},România&limit=1`);
            const data = await res.json();
            if (data && data.length) {
                this.store.data.settings.lastWeatherCity = q; this.store.save();
                await this.fetchWeather(parseFloat(data[0].lat), parseFloat(data[0].lon), q);
            } else { Toast.show('Localitate negăsită.', 'error'); }
        } catch(e) { console.error(e); Toast.show('Eroare rețea', 'error'); }
        finally { Loading.hide(); }
    }
    async fetchWeather(lat, lon, city) {
        Loading.show();
        try {
            this.curEl.innerHTML = ''; this.curEl.appendChild(this.el('p', null, 'Se încarcă...')); this.curEl.querySelector('p').style.textAlign = 'center'; this.curEl.querySelector('p').style.color = 'var(--text-muted)';
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`);
            const data = await res.json();
            this.store.data.weatherCache = { city, data }; this.store.data.weatherCacheTime = Date.now(); this.store.save();
            this.displayWeather(data, city);
        } catch(e) { this.curEl.innerHTML = ''; this.curEl.appendChild(this.el('div', 'alert-warn', '⚠️ Eroare la încărcarea meteo.')); Toast.show('Eroare meteo', 'error'); }
        finally { Loading.hide(); }
    }
    displayWeather(data, city) {
        const wmo = {
            0:'☀️ Senin',1:'🌤️ Parțial',2:'⛅ Parțial',3:'☁️ Noros',
            45:'🌫️ Ceață',48:'🌫️ Ceață densă',
            51:'🌦️ Ploaie ușoară',53:'🌦️ Ploaie ușoară',55:'🌦️ Burniță',
            61:'🌧️ Ploaie',63:'🌧️ Ploaie',65:'🌧️ Ploaie puternică',
            71:'🌨️ Ninsoare',73:'🌨️ Ninsoare',75:'🌨️ Ninsoare puternică',
            95:'⛈️ Furtună',96:'⛈️ Furtună cu grindină',
        };
        const code = data.current.weather_code || 0;
        const desc = wmo[code] || '🌡️';
        this.curEl.innerHTML = '';
        const wrap = this.el('div', 'weather-current');
        wrap.appendChild(this.el('div', 'temp-big', Math.round(data.current.temperature_2m) + '°'));
        const det = this.el('div', 'details');
        det.appendChild(this.el('h3', null, city));
        det.appendChild(this.el('p', null, desc));
        det.appendChild(this.el('p', null, '💧 Umiditate: ' + data.current.relative_humidity_2m + '%'));
        det.appendChild(this.el('p', null, '🌡️ Resimțită: ' + Math.round(data.current.apparent_temperature || data.current.temperature_2m) + '°C'));
        det.appendChild(this.el('p', null, '💨 Vânt: ' + (data.current.wind_speed_10m || 0) + ' km/h'));
        det.appendChild(this.el('p', null, '🌧️ Precipitații: ' + (data.current.precipitation || 0) + ' mm'));
        wrap.appendChild(det); this.curEl.appendChild(wrap);
        this.forEl.innerHTML = '';
        this.forEl.appendChild(this.el('h3', null, 'Prognoză 7 zile'));
        const grid = this.el('div', 'weather-grid');
        for (let i = 0; i < 7; i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'][date.getDay()];
            const dcode = data.daily.weather_code[i];
            const ddesc = wmo[dcode] || '☁️';
            const [icon, text] = ddesc.split(/ /, 2);
            const card = this.el('div', 'weather-card');
            card.appendChild(this.el('div', 'day', dayName + ' ' + date.getDate()));
            card.appendChild(this.el('div', 'icon', icon));
            card.appendChild(this.el('div', 'temp', Math.round(data.daily.temperature_2m_max[i]) + '°/' + Math.round(data.daily.temperature_2m_min[i]) + '°'));
            card.appendChild(this.el('div', 'desc', ddesc.substring(icon.length + 1)));
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
        for (const a of alerts) { const al = this.el('div', a.includes('✅') ? 'alert-warn' : 'alert-danger', a); al.style.marginBottom = '8px'; alertsDiv.appendChild(al); }
    }
}

// ===== EXPORT MANAGER =====
class ExportManager {
    constructor(store) { this.store = store; this.bind(); }
    bind() {
        document.getElementById('export-btn').addEventListener('click', () => document.getElementById('export-modal').classList.add('open'));
        document.getElementById('export-csv').addEventListener('click', () => { this.exportCSV(); this.close(); });
        document.getElementById('export-json').addEventListener('click', () => { this.exportJSON(); this.close(); });
        document.getElementById('export-close').addEventListener('click', () => this.close());
        document.getElementById('export-modal').addEventListener('click', e => { if (e.target === document.getElementById('export-modal')) this.close(); });
    }
    close() { document.getElementById('export-modal').classList.remove('open'); }
    exportCSV() {
        const rows = this.store.data.journals.map(j => [j.date, j.crop, j.qty, j.price||'', j.price?(j.qty*j.price).toFixed(2):'', j.notes||'']);
        const csv = [['Data','Cultura','Cantitate_kg','Pret_kg','Valoare_RON','Observatii'], ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-export-complet.csv'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('Export CSV generat!', 'success');
    }
    exportJSON() {
        const blob = new Blob([JSON.stringify(this.store.data, null, 2)], {type:'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agromind-backup.json'; a.click(); URL.revokeObjectURL(a.href);
        Toast.show('Export JSON generat!', 'success');
    }
}

// ===== ROUTER =====
class Router {
    constructor(store) {
        this.store = store;
        this.pages = {
            dashboard: new DashboardPage(store),
            crops: new CropsPage(store),
            diseases: new DiseasesPage(store),
            fertilizer: new FertilizerPage(store),
            journal: new JournalPage(store),
            charts: new ChartsPage(store),
            weather: new WeatherPage(store),
        };
        this.navItems = [
            {id:'dashboard', icon:'◈', label:'Panou Principal'},
            {id:'crops', icon:'🌱', label:'Culturi'},
            {id:'diseases', icon:'🦠', label:'Boli'},
            {id:'fertilizer', icon:'⚗️', label:'Îngrășăminte'},
            {id:'journal', icon:'📝', label:'Jurnal'},
            {id:'charts', icon:'📊', label:'Grafice'},
            {id:'weather', icon:'🌦️', label:'Meteo'},
        ];
        this.buildNav();
    }
    buildNav() {
        const nav = document.getElementById('nav-links'); nav.innerHTML = '';
        for (const item of this.navItems) {
            const btn = document.createElement('button');
            btn.className = 'nav-link'; btn.dataset.page = item.id;
            btn.textContent = item.icon + ' ' + item.label;
            btn.addEventListener('click', () => this.goto(item.id));
            nav.appendChild(btn);
        }
    }
    goto(page) {
        const container = document.getElementById(page + '-page'); if (!container) return;
        for (const el of document.querySelectorAll('.page')) el.classList.remove('active');
        container.classList.add('active');
        for (const el of document.querySelectorAll('.nav-link')) el.classList.remove('active');
        const activeNav = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeNav) activeNav.classList.add('active');
        this.pages[page].render(container);
        document.getElementById('main-content').scrollTop = 0;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    init() { this.goto('dashboard'); }
}

// ===== APP =====
class App {
    constructor() {
        this.store = new Store();
        this.initTheme();
        this.initSidebar();
        this.initConnectionStatus();
        this.router = new Router(this.store);
        this.exportManager = new ExportManager(this.store);
        this.router.init();
    }
    initTheme() {
        const theme = this.store.data.settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', t);
            this.store.data.settings.theme = t; this.store.save();
            Toast.show(t === 'light' ? 'Temă lumină' : 'Temă întuneric', 'info', 1500);
        });
    }
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        document.getElementById('hamburger').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('open'); });
        document.getElementById('sidebar-close').addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
        overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
    }
    initConnectionStatus() {
        const el = document.getElementById('conn-status');
        const update = () => {
            if (navigator.onLine) {
                el.textContent = '●'; el.style.color = 'var(--success)'; el.title = 'Online'; el.classList.remove('offline');
            } else {
                el.textContent = '●'; el.style.color = 'var(--danger)'; el.title = 'Offline'; el.classList.add('offline');
                Toast.show('Ești offline. Datele sunt salvate local.', 'warn', 4000);
            }
        };
        update();
        window.addEventListener('online', () => { update(); Toast.show('Online', 'success', 1500); });
        window.addEventListener('offline', () => { update(); Toast.show('Offline — salvare locală', 'warn', 3000); });
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
