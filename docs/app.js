
// ===================== DATA STORE (localStorage) =====================
const STORAGE_KEY = 'agromind_premium_v2';

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return getDefaultData();
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultData() {
    return {
        crops: [
            {id:1, name:'Tomate', category:'Legume', season:'Primăvară-Vară', soil:'Lutos-argilos, bine drenat', water:'Moderat, 2-3 ori/săptămână', temp:'18-25°C'},
            {id:2, name:'Cartofi', category:'Legume', season:'Primăvară', soil:'Lutos-nisipos, acid', water:'Moderat, 3-4 ori/săptămână', temp:'15-20°C'},
            {id:3, name:'Grâu', category:'Cereale', season:'Toamnă', soil:'Chernozem, fertil', water:'Redus, doar în perioade secetoase', temp:'10-20°C'},
            {id:4, name:'Măr', category:'Fructe', season:'Primăvară', soil:'Lutos, pH 6-7', water:'Moderat, irigare la 7-10 zile', temp:'12-22°C'},
            {id:5, name:'Busuioc', category:'Plante aromatice', season:'Vară', soil:'Uscat, bine drenat', water:'Redus, nu suportă exces', temp:'20-30°C'},
            {id:6, name:'Porumb', category:'Cereale', season:'Primăvară-Vară', soil:'Lutos, bogat', water:'Moderat', temp:'18-27°C'},
        ],
        diseases: [
            {id:1, name:'Mana tomatei', symptoms:['pete maro pe frunze','mucegai gri pe fața inferioară','îngălbenire'], treatment:'Fungicide pe bază de cupru. Eliminare frunze afectate.', affected:['Tomate','Cartofi'], severity:'Mare'},
            {id:2, name:'Rugina grâului', symptoms:['pustule portocalii','îngălbenire frunze','ofilire'], treatment:'Fungicide triazolice. Rotația culturilor.', affected:['Grâu'], severity:'Mare'},
            {id:3, name:'Afide (păduchele plantelor)', symptoms:['frunze răsucite','substanță lipicioasă','prezență insecte mici verzi'], treatment:'Săpun insecticid sau extract de urzică.', affected:['Tomate','Cartofi','Măr'], severity:'Medie'},
            {id:4, name:'Putregaiul cenușiu', symptoms:['pete cenușii pe fructe','mucegai flufos','cădere prematură'], treatment:'Ventilare, evitare umezeală. Fungicide.', affected:['Tomate','Legume'], severity:'Mare'},
            {id:5, name:'Făina mărului', symptoms:['depuneri albe pe frunze','deformare','cădere prematură'], treatment:'Fungicide sistemice. Soiuri rezistente.', affected:['Măr','Piersic'], severity:'Medie'},
            {id:6, name:'Fuzarioza', symptoms:['ofilire bruscă','tulpini maro','rădăcini putrezite'], treatment:'Solare, tratament semințe. Evitare exces apă.', affected:['Porumb','Grâu'], severity:'Mare'},
        ],
        fertilizers: [
            {name:'NPK 20-20-20', n:20, p:20, k:20, price:15},
            {name:'NPK 15-15-15', n:15, p:15, k:15, price:12},
            {name:'Azotat de amoniu', n:34, p:0, k:0, price:8},
            {name:'Superfosfat', n:0, p:20, k:0, price:10},
            {name:'Sulfat de potasiu', n:0, p:0, k:50, price:14},
            {name:'Îngrășământ organic', n:5, p:3, k:4, price:6},
        ],
        journal: [],
        lastId: {crop:6, disease:6},
        settings: { theme: 'light' },
        weatherCache: null,
        weatherCacheTime: 0,
    };
}

let DATA = loadData();

// ===================== THEME =====================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    DATA.settings.theme = theme;
    saveData(DATA);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    const newTheme = DATA.settings.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
});

applyTheme(DATA.settings.theme || 'light');

// ===================== NAVIGATION =====================
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(page + '-page');
    if (el) el.classList.add('active');
    if (page === 'dashboard') renderDashboard();
    if (page === 'crops') renderCrops();
    if (page === 'diseases') renderDiseases();
    if (page === 'journal') renderJournal();
    if (page === 'charts') renderCharts();
    if (page === 'weather') renderWeather();
}

// ===================== DASHBOARD =====================
function renderDashboard() {
    document.getElementById('dash-crops').textContent = DATA.crops.length;
    document.getElementById('dash-entries').textContent = DATA.journal.length;
    document.getElementById('dash-diseases').textContent = DATA.diseases.length;

    // AI Score
    const journalCount = DATA.journal.length;
    const cropCount = DATA.crops.length;
    const aiScore = Math.min(100, Math.round((journalCount * 5 + cropCount * 10) / 2));
    document.getElementById('dash-ai-score').textContent = aiScore + '%';
    const aiColor = aiScore >= 80 ? '#10b981' : aiScore >= 50 ? '#f59e0b' : '#ef4444';
    document.getElementById('dash-ai-score').style.color = aiColor;

    // Seasonal recommendations
    const month = new Date().getMonth();
    const monthNames = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
    document.getElementById('current-season').textContent = monthNames[month];

    const recs = [];
    if (month >= 2 && month <= 4) {
        recs.push('🌱 Sezon de semănat: tomate, ardei, vinete, porumb');
        recs.push('💧 Irigare atentă, risc de îngheț nocturn');
    }
    if (month >= 3 && month <= 5) recs.push('🌾 Grâu: monitorizare rugina, primul tratament fungicid');
    if (month >= 5 && month <= 7) recs.push('☀️ Irigare regulată, protecție împotriva secetei');
    if (month >= 7 && month <= 9) recs.push('🍎 Recoltare mere, atenție la făinare');
    if (month >= 8 && month <= 10) recs.push('🥔 Recoltare cartofi, depozitare în condiții uscate');
    if (month === 10 || month === 11) recs.push('🌾 Semănat grâu de toamnă');
    if (month === 11 || month === 0) recs.push('❄️ Protejare culturi sensibile la îngheț');
    if (recs.length === 0) recs.push('📋 Revizuiește planul de îngrășăminte pentru anul următor');

    document.getElementById('seasonal-recommendations').innerHTML = recs.map(r =>
        `<div class="list-item"><p>${r}</p></div>`
    ).join('');

    // Calendar
    const calendar = [];
    const currentMonth = new Date().getMonth();
    DATA.crops.forEach(c => {
        if (c.season.includes(monthNames[currentMonth])) {
            calendar.push(`🌱 <strong>${c.name}</strong>: sezon activ — monitorizează apă și boli`);
        }
    });
    if (calendar.length === 0) calendar.push('📅 Nicio cultură în sezon activ această lună');
    document.getElementById('agri-calendar').innerHTML = calendar.map(e =>
        `<div class="list-item"><p>${e}</p></div>`
    ).join('');
}

// ===================== CROPS =====================
function renderCrops() {
    const filter = document.getElementById('crop-filter').value;
    const search = document.getElementById('crop-search').value.toLowerCase();
    let items = DATA.crops;
    if (filter) items = items.filter(c => c.category === filter);
    if (search) items = items.filter(c => c.name.toLowerCase().includes(search) || c.season.toLowerCase().includes(search));

    document.getElementById('crops-list').innerHTML = items.map(c => `
        <div class="list-item">
            <div>
                <h4>${c.name} <span class="tag">${c.category}</span></h4>
                <p>Sezon: ${c.season} | Sol: ${c.soil} | Apă: ${c.water} | Temp: ${c.temp || 'N/A'}</p>
            </div>
            <button onclick="deleteCrop(${c.id})" class="btn-secondary" style="color:var(--danger)">Șterge</button>
        </div>
    `).join('');
}

document.getElementById('crop-search').addEventListener('input', renderCrops);
document.getElementById('crop-filter').addEventListener('change', renderCrops);

document.getElementById('btn-show-add').addEventListener('click', () => {
    document.getElementById('add-form').style.display = 'block';
});
document.getElementById('btn-cancel-add').addEventListener('click', () => {
    document.getElementById('add-form').style.display = 'none';
});

document.getElementById('crop-form').addEventListener('submit', e => {
    e.preventDefault();
    DATA.lastId.crop++;
    DATA.crops.push({
        id: DATA.lastId.crop,
        name: document.getElementById('c-name').value,
        category: document.getElementById('c-cat').value,
        season: document.getElementById('c-season').value,
        soil: document.getElementById('c-soil').value,
        water: document.getElementById('c-water').value,
        temp: document.getElementById('c-temp').value,
    });
    saveData(DATA);
    renderCrops();
    e.target.reset();
    document.getElementById('add-form').style.display = 'none';
});

function deleteCrop(id) {
    DATA.crops = DATA.crops.filter(c => c.id !== id);
    saveData(DATA);
    renderCrops();
}

// ===================== DISEASES =====================
function renderDiseases() {
    const search = document.getElementById('disease-search').value.toLowerCase();
    let items = DATA.diseases;
    if (search) items = items.filter(d => d.name.toLowerCase().includes(search) || d.symptoms.some(s => s.includes(search)));

    document.getElementById('diseases-list').innerHTML = items.map(d => `
        <div class="list-item">
            <div>
                <h4>${d.name} <span class="tag" style="background:${d.severity==='Mare'?'rgba(239,68,68,0.12);color:#dc2626':'rgba(245,158,11,0.12);color:#d97706'}">${d.severity}</span></h4>
                <p>Simptome: ${d.symptoms.join(', ')}</p>
                <p style="margin-top:4px;"><strong>Tratament:</strong> ${d.treatment}</p>
            </div>
            <span class="tag">${d.affected.join(', ')}</span>
        </div>
    `).join('');

    const allSymptoms = [...new Set(DATA.diseases.flatMap(d => d.symptoms))];
    document.getElementById('symptoms-check').innerHTML = allSymptoms.map(s =>
        `<label><input type="checkbox" value="${s}"> ${s}</label>`
    ).join('');
}

document.getElementById('disease-search').addEventListener('input', renderDiseases);

document.getElementById('diagnose-btn').addEventListener('click', () => {
    const checked = [...document.querySelectorAll('#symptoms-check input:checked')].map(cb => cb.value);
    if (checked.length === 0) {
        document.getElementById('diagnosis-result').innerHTML = '<div class="alert-warn">⚠️ Selectează cel puțin un simptom</div>';
        return;
    }
    const matches = DATA.diseases.map(d => {
        const score = d.symptoms.filter(s => checked.includes(s)).length;
        return { ...d, score, pct: Math.round((score / d.symptoms.length) * 100) };
    }).filter(d => d.score > 0).sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        document.getElementById('diagnosis-result').innerHTML = '<div class="alert-warn">Nicio boală corespunzătoare găsită</div>';
        return;
    }
    document.getElementById('diagnosis-result').innerHTML = `
        <div class="result-box">
            <h4>🔬 Rezultat diagnostic AI</h4>
            ${matches.slice(0, 3).map(m => `
                <p><strong style="color:var(--${m.pct >= 80 ? 'danger' : m.pct >= 50 ? 'warning' : 'accent'})">${m.name}</strong> — ${m.pct}% potrivire</p>
                <p style="font-size:13px;color:var(--text-muted)">Simptome potrivite: ${m.symptoms.filter(s => checked.includes(s)).join(', ')}</p>
                <p style="font-size:13px">Tratament: ${m.treatment}</p>
                <hr style="border:none;border-top:1px solid var(--border-solid);margin:10px 0">
            `).join('')}
            <p style="font-size:12px;color:var(--text-muted)">⚠️ Acesta este un diagnostic orientativ. Consultă un agronom pentru confirmare.</p>
        </div>
    `;
});

// ===================== FERTILIZER =====================
document.getElementById('calc-fert').addEventListener('click', () => {
    const cropType = document.getElementById('fert-crop').value;
    const area = parseFloat(document.getElementById('fert-area').value) || 0;
    const fertName = document.getElementById('fert-type').value;
    const phase = parseFloat(document.getElementById('fert-phase').value) || 1;
    const fert = DATA.fertilizers.find(f => f.name === fertName);
    if (!fert || area <= 0) return;

    const rates = { legume: 0.05, cereale: 0.03, fructe: 0.04 };
    const baseRate = rates[cropType] || 0.04;
    const adjustedRate = baseRate * phase;
    const qty = Math.round(area * adjustedRate * 10) / 10;
    const cost = Math.round(qty * fert.price * 100) / 100;

    // Nutrient calculation
    const nQty = Math.round(qty * fert.n / 100 * 100) / 100;
    const pQty = Math.round(qty * fert.p / 100 * 100) / 100;
    const kQty = Math.round(qty * fert.k / 100 * 100) / 100;

    document.getElementById('fert-result').innerHTML = `
        <h4>📊 Rezultat calcul</h4>
        <div class="cards" style="margin-top:12px">
            <div class="card"><div class="card-value">${qty}</div><div class="card-label">kg necesari</div></div>
            <div class="card"><div class="card-value">${cost}</div><div class="card-label">RON cost estimat</div></div>
            <div class="card"><div class="card-value">${nQty}</div><div class="card-label">kg Azot (N)</div></div>
            <div class="card"><div class="card-value">${pQty}</div><div class="card-label">kg Fosfor (P)</div></div>
            <div class="card"><div class="card-value">${kQty}</div><div class="card-label">kg Potasiu (K)</div></div>
        </div>
        <p style="margin-top:12px"><strong>Detalii:</strong> Cultură ${cropType}, suprafață ${area}m², fază ${phase === 1 ? 'Răsărire' : phase === 1.5 ? 'Vegetație' : 'Florire'}, îngrășământ ${fertName} (N${fert.n}% P${fert.p}% K${fert.k}%)</p>
    `;
});

// ===================== JOURNAL =====================
function renderJournal() {
    const sort = document.getElementById('j-sort').value;
    let items = [...DATA.journal];
    if (sort === 'date-desc') items.sort((a, b) => b.date.localeCompare(a.date));
    else items.sort((a, b) => a.date.localeCompare(b.date));

    const list = document.getElementById('journal-list');
    if (items.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Nicio intrare în jurnal. Adaugă prima recoltă!</p>';
        return;
    }
    list.innerHTML = items.map((j, i) => {
        const value = j.price ? Math.round(j.qty * j.price * 100) / 100 : 0;
        return `
        <div class="list-item">
            <div>
                <h4>${j.crop} — ${j.qty} kg ${j.price ? `(@ ${j.price} RON/kg = ${value} RON)` : ''}</h4>
                <p>${j.date} | ${j.notes || 'Fără observații'}</p>
            </div>
            <button onclick="deleteJournal(${DATA.journal.indexOf(j)})" class="btn-secondary" style="color:var(--danger)">Șterge</button>
        </div>
        `;
    }).join('');
}

document.getElementById('journal-form').addEventListener('submit', e => {
    e.preventDefault();
    DATA.journal.push({
        crop: document.getElementById('j-crop').value,
        date: document.getElementById('j-date').value,
        qty: parseFloat(document.getElementById('j-qty').value),
        price: parseFloat(document.getElementById('j-price').value) || null,
        notes: document.getElementById('j-notes').value
    });
    saveData(DATA);
    renderJournal();
    e.target.reset();
});

document.getElementById('j-sort').addEventListener('change', renderJournal);

function deleteJournal(idx) {
    DATA.journal.splice(idx, 1);
    saveData(DATA);
    renderJournal();
}

// Export CSV
document.getElementById('j-export').addEventListener('click', () => {
    const headers = ['Data','Cultura','Cantitate_kg','Pret_kg','Valoare_RON','Observatii'];
    const rows = DATA.journal.map(j => [
        j.date, j.crop, j.qty, j.price || '', j.price ? j.qty * j.price : '', j.notes || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agromind-jurnal.csv'; a.click();
    URL.revokeObjectURL(url);
});

// ===================== CHARTS =====================
function renderCharts() {
    const year = document.getElementById('chart-year').value;
    const cropFilter = document.getElementById('chart-crop').value;
    const metric = document.getElementById('chart-metric').value;

    const cropSelect = document.getElementById('chart-crop');
    const crops = [...new Set(DATA.journal.map(j => j.crop))];
    cropSelect.innerHTML = '<option value="">Toate culturile</option>' + crops.map(c => `<option value="${c}">${c}</option>`).join('');
    if (cropFilter && crops.includes(cropFilter)) cropSelect.value = cropFilter;

    let entries = DATA.journal.filter(j => j.date.startsWith(year));
    if (cropFilter) entries = entries.filter(j => j.crop === cropFilter);

    const monthly = {};
    for (let i = 1; i <= 12; i++) monthly[i] = 0;
    entries.forEach(j => {
        const m = parseInt(j.date.split('-')[1]);
        monthly[m] += metric === 'value' && j.price ? j.qty * j.price : j.qty;
    });

    const canvas = document.getElementById('harvest-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const months = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Noi','Dec'];
    const values = Object.values(monthly);
    const max = Math.max(...values, 1);
    const bw = 55, gap = 18, sx = 50, sy = 320, ch = 260;

    ctx.strokeStyle = 'var(--border-solid)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 12 * (bw + gap), sy); ctx.stroke();
    values.forEach((v, i) => {
        const h = (v / max) * ch, x = sx + i * (bw + gap), y = sy - h;
        ctx.fillStyle = v > 0 ? '#3b82f6' : '#e2e8f0';
        ctx.fillRect(x, y, bw, h);
        ctx.fillStyle = 'var(--text-muted)'; ctx.font = '12px sans-serif'; ctx.fillText(months[i], x + 12, sy + 20);
        if (v > 0) { ctx.fillStyle = 'var(--text)'; ctx.fillText(v.toFixed(0), x + 5, y - 5); }
    });
    ctx.fillStyle = 'var(--text)'; ctx.font = 'bold 14px sans-serif'; ctx.fillText(`Recolte ${year}${cropFilter ? ' — ' + cropFilter : ''} (${metric === 'value' ? 'RON' : 'kg'})`, sx, 30);

    // Stats cards
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / 12;
    const bestMonth = values.indexOf(Math.max(...values)) + 1;
    document.getElementById('chart-stats').innerHTML = `
        <div class="card glass"><div class="card-value">${total.toFixed(1)}</div><div class="card-label">Total ${metric === 'value' ? 'RON' : 'kg'}</div></div>
        <div class="card glass"><div class="card-value">${avg.toFixed(1)}</div><div class="card-label">Medie lunară</div></div>
        <div class="card glass"><div class="card-value">${months[bestMonth - 1]}</div><div class="card-label">Luna cu maxim</div></div>
    `;
}
document.getElementById('chart-year').addEventListener('change', renderCharts);
document.getElementById('chart-crop').addEventListener('change', renderCharts);
document.getElementById('chart-metric').addEventListener('change', renderCharts);

// ===================== WEATHER (Open-Meteo) =====================
let weatherCity = 'București';
let weatherLat = 44.43, weatherLon = 26.10;

const cityCoords = {
    'București': [44.43, 26.10],
    'Cluj': [46.77, 23.60],
    'Timișoara': [45.75, 21.23],
    'Iași': [47.17, 27.60],
    'Brașov': [45.65, 25.61],
    'Constanța': [44.18, 28.63],
    'Craiova': [44.33, 23.82],
};

async function renderWeather() {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityCoords[cityInput]) {
        weatherLat = cityCoords[cityInput][0];
        weatherLon = cityCoords[cityInput][1];
        weatherCity = cityInput;
    }

    // Check cache (5 minutes)
    const now = Date.now();
    if (DATA.weatherCache && DATA.weatherCacheTime > now - 5 * 60 * 1000 && DATA.weatherCache.city === weatherCity) {
        displayWeather(DATA.weatherCache.data);
        return;
    }

    try {
        document.getElementById('weather-current').innerHTML = '<p style="text-align:center;color:var(--text-muted)">Se încarcă meteo...</p>';
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${weatherLat}&longitude=${weatherLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
        const data = await res.json();
        DATA.weatherCache = { city: weatherCity, data };
        DATA.weatherCacheTime = now;
        saveData(DATA);
        displayWeather(data);
    } catch (e) {
        document.getElementById('weather-current').innerHTML = '<div class="alert-warn">⚠️ Eroare la încărcarea datelor meteo. Încearcă din nou.</div>';
    }
}

function displayWeather(data) {
    const wmo = {
        0: '☀️ Senin', 1: '🌤️ Parțial înnorat', 2: '⛅ Parțial înnorat', 3: '☁️ Înnorat',
        45: '🌫️ Ceață', 48: '🌫️ Ceață',
        51: '🌦️ Burniță ușoară', 53: '🌦️ Burniță', 55: '🌦️ Burniță densă',
        61: '🌧️ Ploaie ușoară', 63: '🌧️ Ploaie', 65: '🌧️ Ploaie puternică',
        71: '🌨️ Ninsoare ușoară', 73: '🌨️ Ninsoare', 75: '🌨️ Ninsoare puternică',
        95: '⛈️ Furtună', 96: '⛈️ Furtună cu grindină',
    };
    const code = data.current.weather_code;
    const desc = wmo[code] || '🌡️';

    document.getElementById('weather-current').innerHTML = `
        <div class="weather-current">
            <div class="temp-big">${Math.round(data.current.temperature_2m)}°</div>
            <div class="details">
                <h3>${weatherCity}</h3>
                <p><span style="font-size:28px">${desc}</span></p>
                <p>💧 Umiditate: ${data.current.relative_humidity_2m}%</p>
                <p>🌡️ Resimțită: ${Math.round(data.current.apparent_temperature)}°C</p>
                <p>💨 Vânt: ${data.current.wind_speed_10m} km/h</p>
                <p>🌧️ Precipitații: ${data.current.precipitation} mm</p>
            </div>
        </div>
    `;

    const daily = data.daily;
    let forecastHTML = '<h3>Prognoză 7 zile</h3><div class="weather-grid">';
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'][date.getDay()];
        const dcode = daily.weather_code[i];
        const ddesc = wmo[dcode] || '☁️';
        forecastHTML += `
            <div class="weather-card">
                <div class="day">${dayName} ${date.getDate()}</div>
                <div class="icon">${ddesc.split(' ')[0]}</div>
                <div class="temp">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</div>
                <div class="desc">${ddesc.split(' ').slice(1).join(' ')}</div>
            </div>
        `;
    }
    forecastHTML += '</div>';
    document.getElementById('weather-forecast').innerHTML = forecastHTML;

    // Alerts
    const alerts = [];
    const temp = data.current.temperature_2m;
    if (temp < 0) alerts.push('❄️ Îngheț — protejează culturile sensibile!');
    if (temp > 35) alerts.push('🔥 Caniculă — crește irigarea!');
    if (data.current.precipitation > 20) alerts.push('🌧️ Ploi abundente — risc de boli fungice!');
    if (data.current.wind_speed_10m > 40) alerts.push('💨 Vânt puternic — protejează plantele înalte!');
    if (data.current.relative_humidity_2m > 85 && temp > 20) alerts.push('💧 Umiditate ridicată — risc de mană!');
    if (alerts.length === 0) alerts.push('✅ Condiții favorabile pentru agricultură');
    document.getElementById('weather-alerts').innerHTML = alerts.map(a =>
        `<div class="${a.includes('✅') ? 'alert-warn' : 'alert-danger'}" style="margin-bottom:8px">${a}</div>`
    ).join('');
}

document.getElementById('weather-search').addEventListener('click', renderWeather);
document.getElementById('city-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') renderWeather();
});

// ===================== EXPORT MODAL =====================
const modal = document.getElementById('export-modal');
document.getElementById('export-btn').addEventListener('click', () => {
    modal.classList.add('active');
});
document.getElementById('export-close').addEventListener('click', () => {
    modal.classList.remove('active');
});
document.getElementById('export-csv').addEventListener('click', () => {
    const headers = ['id','nume','categorie','sezon','sol','apa','temperatura'];
    const rows = DATA.crops.map(c => [c.id, c.name, c.category, c.season, c.soil, c.water, c.temp || '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    downloadBlob(csv, 'agromind-culturi.csv', 'text/csv');
    modal.classList.remove('active');
});
document.getElementById('export-json').addEventListener('click', () => {
    const json = JSON.stringify({crops: DATA.crops, journal: DATA.journal, diseases: DATA.diseases}, null, 2);
    downloadBlob(json, 'agromind-backup.json', 'application/json');
    modal.classList.remove('active');
});

function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type: type + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// ===================== SERVICE WORKER (Offline) =====================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ===================== CONNECTION STATUS =====================
function updateConnection() {
    const status = document.getElementById('conn-status');
    if (navigator.onLine) {
        status.style.color = 'var(--success)';
        status.textContent = '● Online';
    } else {
        status.style.color = 'var(--warning)';
        status.textContent = '● Offline';
    }
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

// ===================== INIT =====================
renderDashboard();
