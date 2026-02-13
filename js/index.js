// Kalkulator garam (AKG berdasarkan usia)
const AKG_NATRIUM_V5 = {
    laki: [
        { range: "1–3", min: 1, max: 3, mg: 800 },
        { range: "4–6", min: 4, max: 6, mg: 900 },
        { range: "7–9", min: 7, max: 9, mg: 1000 },
        { range: "10–12", min: 10, max: 12, mg: 1300 },
        { range: "13–15", min: 13, max: 15, mg: 1500 },
        { range: "16–18", min: 16, max: 18, mg: 1600 },
        { range: "19–49", min: 19, max: 49, mg: 1500 },
        { range: "50–64", min: 50, max: 64, mg: 1300 },
        { range: "≥65", min: 65, max: 120, mg: 1000 }
    ],
    perempuan: [
        { range: "1–3", min: 1, max: 3, mg: 800 },
        { range: "4–6", min: 4, max: 6, mg: 900 },
        { range: "7–9", min: 7, max: 9, mg: 1000 },
        { range: "10–12", min: 10, max: 12, mg: 1200 },
        { range: "13–15", min: 13, max: 15, mg: 1400 },
        { range: "16–18", min: 16, max: 18, mg: 1500 },
        { range: "19–49", min: 19, max: 49, mg: 1400 },
        { range: "50–64", min: 50, max: 64, mg: 1200 },
        { range: "≥65", min: 65, max: 120, mg: 1000 }
    ]
};
const NATRIUM_KEY = 'kalkulator_natrium_v1'; // Kunci localStorage


// konversi gram garam ke perkiraan ukuran sendok teh (sederhana)
function konversiSendokTeh(gram) {
    if (gram <= 1.25) return "¼ sendok teh";
    if (gram <= 1.67) return "⅓ sendok teh";
    if (gram <= 2.5) return "½ sendok teh";
    if (gram <= 3.75) return "¾ sendok teh";
    if (gram <= 5) return "1 sendok teh";
    if (gram <= 6.3) return "1 ¼ sendok teh";
    return "≈ 1 sendok teh";
}

function hitungAKGv5() {
    const usia = parseInt(document.getElementById("usia").value, 10);
    const jk = document.getElementById("jk").value;
    const hasil = document.getElementById("hasilAKG");
    const wrap = document.getElementById("akgResultWrap");
    const btn = document.getElementById("akgBtn");
    const spinner = document.getElementById("akgSpinner");
    const btnLabel = document.getElementById("akgBtnLabel");
    const tip = document.getElementById('akgTip');

    if (isNaN(usia) || usia <= 0 || !jk) {
        alert("Masukkan usia dan jenis kelamin dengan benar");
        return;
    }

    // simpan data ke localStorage
    const savedData = {
        usia: usia,
        jk: jk
    };
    localStorage.setItem(NATRIUM_KEY, JSON.stringify(savedData));

    // loading UI
    btn.disabled = true; spinner.classList.remove('d-none'); btnLabel.textContent = 'Menghitung...';

    setTimeout(() => {
        const dataAKG = AKG_NATRIUM_V5[jk];
        let rekomendasi = null;
        for (const item of dataAKG) {
            if (usia >= item.min && usia <= item.max) { rekomendasi = item; break; }
        }
        if (!rekomendasi) {
            alert("Usia di luar rentang AKG");
            btn.disabled = false; spinner.classList.add('d-none'); btnLabel.textContent = 'Lihat Rekomendasi AKG';
            return;
        }

        const natrium = rekomendasi.mg;
        // konversi natrium -> garam yang lebih akurat (~400 mg Na per 1 g NaCl)
        const garam = +(natrium / 400).toFixed(2);
        const sendokTeh = konversiSendokTeh(garam);
        const pct = Math.round((natrium / 2300) * 100);

        // tentukan status UI
        let status = '';
        if (natrium <= 1500) status = 'safe';
        else if (natrium <= 2000) status = 'warning';
        else status = 'danger';

        // render hasil (konsisten dengan style .result)
        hasil.className = `result-container res-natrium animate__animated animate__fadeInUp`;
        hasil.innerHTML = `
            <div class="result-header-gradient">
                <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-calculator fs-5"></i>
                    <span>Hasil Rekomendasi AKG</span>
                </div>
                <span class="result-badge-pill">${rekomendasi.range} Thn</span>
            </div>
            
            <div class="result-main-value">
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Kebutuhan Natrium Harian</div>
                <div class="fs-2 fw-bold main-text">${natrium} <small class="fs-6 text-muted">mg</small></div>
            </div>

            <div class="result-info-grid">
                <div class="result-info-item">
                    <div class="result-info-icon"><i class="fa-solid fa-spoon"></i></div>
                    <div>
                        <div class="fw-bold small">Setara Garam</div>
                        <div class="text-muted small">± ${garam} g/hari (${sendokTeh})</div>
                    </div>
                </div>
                
                <div class="result-info-item">
                    <div class="result-info-icon"><i class="fa-solid fa-chart-line"></i></div>
                    <div class="w-100">
                        <div class="fw-bold small">Persentase AKG</div>
                        <div class="progress mt-1" style="height:6px">
                            <div class="progress-bar bg-primary" role="progressbar" style="width:${pct}%"></div>
                        </div>
                        <div class="text-muted mt-1" style="font-size: 0.65rem;">${pct}% dari batas AKG (2300 mg/hari)</div>
                    </div>
                </div>

                <div class="mt-2 pt-2 border-top">
                    <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.65rem;">
                        <i class="fa-solid fa-book-medical"></i>
                        <span>Sumber: AKG — Permenkes RI No.28/2019</span>
                    </div>
                </div>
            </div>
        `;

        // tampilkan wrap & fokus
        wrap.style.display = 'block';
        hasil.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // tip & highlight untuk usia 30-50
        if (usia >= 30 && usia <= 50) {
            hasil.classList.add('highlight');
            if (tip) { tip.classList.remove('d-none'); tip.classList.add('highlight'); tip.setAttribute('aria-hidden', 'false'); }
        } else {
            hasil.classList.remove('highlight');
            if (tip) { tip.classList.add('d-none'); tip.classList.remove('highlight'); tip.setAttribute('aria-hidden', 'true'); }
        }

        // restore button
        btn.disabled = false; spinner.classList.add('d-none'); btnLabel.textContent = 'Lihat Rekomendasi AKG';
    }, 360);
}

// Load data dari localStorage saat halaman dimuat
function loadNatriumData() {
    const savedData = JSON.parse(localStorage.getItem(NATRIUM_KEY));
    if (savedData) {
        document.getElementById("usia").value = savedData.usia;
        document.getElementById("jk").value = savedData.jk;
        hitungAKGv5(); // Hitung otomatis
    }
}

// Sambungkan tombol & Reset behavior
document.getElementById('akgBtn')?.addEventListener('click', hitungAKGv5);
document.getElementById('akgReset')?.addEventListener('click', function () {
    document.getElementById('usia').value = '';
    document.getElementById('jk').value = '';
    localStorage.removeItem(NATRIUM_KEY); // Hapus data dari localStorage
    const wrap = document.getElementById("akgResultWrap");
    const hasil = document.getElementById("hasilAKG");
    if (wrap) wrap.style.display = 'none';
    if (hasil) { hasil.className = 'result'; hasil.innerHTML = ''; }
    const tip = document.getElementById('akgTip'); if (tip) { tip.classList.add('d-none'); tip.classList.remove('highlight'); tip.setAttribute('aria-hidden', 'true'); }
});
// Panggil fungsi load saat halaman dimuat
window.addEventListener('load', loadNatriumData);


// Show/hide tip while typing age (UX)
(function () {
    const usiaInput = document.getElementById('usia');
    const tip = document.getElementById('akgTip');
    if (!usiaInput || !tip) return;
    usiaInput.addEventListener('input', function () {
        const v = parseInt(this.value, 10);
        if (!isNaN(v) && v >= 30 && v <= 50) { tip.classList.remove('d-none'); tip.classList.add('highlight'); tip.setAttribute('aria-hidden', 'false'); }
        else { tip.classList.add('d-none'); tip.classList.remove('highlight'); tip.setAttribute('aria-hidden', 'true'); }
    });
})();

// Kalkulator Lemak Script
const AKG_LEMAK = {

    L: [
        { umurMin: 10, umurMax: 12, lemak: 65 },
        { umurMin: 13, umurMax: 15, lemak: 80 },
        { umurMin: 16, umurMax: 18, lemak: 85 },
        { umurMin: 19, umurMax: 29, lemak: 75 },
        { umurMin: 30, umurMax: 49, lemak: 70 },
        { umurMin: 50, umurMax: 64, lemak: 60 },
        { umurMin: 65, umurMax: 80, lemak: 50 },
        { umurMin: 80, umurMax: 120, lemak: 50 },
    ],
    P: [
        { umurMin: 10, umurMax: 12, lemak: 65 },
        { umurMin: 13, umurMax: 15, lemak: 70 },
        { umurMin: 16, umurMax: 18, lemak: 70 },
        { umurMin: 19, umurMax: 29, lemak: 65 },
        { umurMin: 30, umurMax: 49, lemak: 60 },
        { umurMin: 50, umurMax: 64, lemak: 55 },
        { umurMin: 65, umurMax: 80, lemak: 45 },
        { umurMin: 80, umurMax: 120, lemak: 45 },
    ]
};
const LEMAK_KEY = 'kalkulator_lemak_v1'; // Kunci localStorage

function hitungLemak() {
    const usia = parseInt(document.getElementById("usiaLemak").value);
    const jk = document.getElementById("jkLemak").value;
    const hasil = document.getElementById("hasilLemak");
    const btn = document.getElementById("lemakBtn");
    const spinner = document.getElementById("lemakSpinner");
    const btnLabel = document.getElementById("lemakBtnLabel");

    if (!usia || usia < 10 || !jk) {
        hasil.className = 'result danger show';
        hasil.innerHTML = '⚠️ Harap isi usia dan jenis kelamin dengan benar.';
        return;
    }

       // simpan data ke localStorage
       const savedData = {
        usia: usia,
        jk: jk
    };
    localStorage.setItem(LEMAK_KEY, JSON.stringify(savedData));
    const data = AKG_LEMAK[jk];
    const lemakData = data.find(item => usia >= item.umurMin && usia <= item.umurMax);

    if (!lemakData) {
        hasil.className = 'result warning show';
        hasil.innerHTML = 'Data AKG tidak ditemukan untuk usia ini.';
        return;
    }

    const lemak = lemakData.lemak;

    // loading UI
    btn.disabled = true; spinner.classList.remove('d-none'); btnLabel.textContent = 'Menghitung...';

    setTimeout(() => {
        // Gunakan fungsi konversiSendokMakan, dengan fallback jika nilai di luar jangkauan fungsi
        let sendokDisplay;
        const konversiHasil = konversiSendokMakan(lemak);
        if (konversiHasil) {
            sendokDisplay = konversiHasil;
        } else {
            // Fallback untuk nilai > 75g, berdasarkan ~15g per sendok makan
            sendokDisplay = `sekitar ${Math.round(lemak / 15)} sendok makan`;
        }

        hasil.className = 'result-container res-lemak animate__animated animate__fadeInUp';
        hasil.innerHTML = `
            <div class="result-header-gradient">
                <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-bacon fs-5"></i>
                    <span>Kebutuhan Lemak Harian</span>
                </div>
                <span class="result-badge-pill">${lemakData.umurMin}–${lemakData.umurMax} Thn</span>
            </div>

            <div class="result-main-value">
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Kebutuhan Lemak</div>
                <div class="fs-2 fw-bold main-text">${lemak} <small class="fs-6 text-muted">gram</small></div>
            </div>

            <div class="result-info-grid">
                <div class="result-info-item">
                    <div class="result-info-icon"><i class="fa-solid fa-droplet"></i></div>
                    <div>
                        <div class="fw-bold small">Setara Minyak/Lemak</div>
                        <div class="text-muted small">± ${sendokDisplay}</div>
                    </div>
                </div>

                <div class="mt-2 pt-2 border-top">
                    <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.65rem;">
                        <i class="fa-solid fa-book-medical"></i>
                        <span>Sumber: AKG — Permenkes RI No.28/2019</span>
                    </div>
                </div>
            </div>
        `;

        // restore button
        btn.disabled = false; spinner.classList.add('d-none'); btnLabel.textContent = 'Hitung Kebutuhan Lemak';
    }, 400);
}

function resetLemak() {
    document.getElementById("usiaLemak").value = "";
    document.getElementById("jkLemak").selectedIndex = 0;
    const hasil = document.getElementById("hasilLemak");
    hasil.className = "result";
    hasil.innerHTML = "";
}

function konversiSendokMakan(gram) {
    if (gram <= 7.5) return "½ sendok makan";
    if (gram <= 11.25) return "¾ sendok makan";
    if (gram <= 15) return "1 sendok makan";
    if (gram <= 22.5) return "1½ sendok makan";
    if (gram <= 30) return "2 sendok makan";
    if (gram <= 37.5) return "2½ sendok makan";
    if (gram <= 45) return "3 sendok makan";
    if (gram <= 52.5) return "3½ sendok makan";
    if (gram <= 60) return "4 sendok makan";
    if (gram <= 75) return "5 sendok makan";
}
//end kalkulator lemak

const IMT_KEY = 'kalkulator_imt_v1'; // Kunci localStorage

// start Kalkulator IMT Script
function hitungIMT() {
    const berat = parseFloat(document.getElementById('beratBadan').value);
    const tinggi = parseFloat(document.getElementById('tinggiBadan').value);
    const hasil = document.getElementById('hasilIMT');
    const btn = document.getElementById("imtBtn");
    const spinner = document.getElementById("imtSpinner");
    const btnLabel = document.getElementById("imtBtnLabel");

    if (!berat || !tinggi || berat <= 0 || tinggi <= 0) {
        hasil.className = 'result danger show';
        hasil.innerHTML = '⚠️ Harap isi berat dan tinggi badan dengan benar.';
        return;
    }

    // simpan data ke localStorage
    const savedData = {
        berat: berat,
        tinggi: tinggi
    };
    localStorage.setItem(IMT_KEY, JSON.stringify(savedData));

    // loading UI
    btn.disabled = true; spinner.classList.remove('d-none'); btnLabel.textContent = 'Menghitung...';

    setTimeout(() => {
        // Konversi tinggi ke meter
        const tinggiMeter = tinggi / 100;
        // Rumus IMT = Berat / (Tinggi * Tinggi)
        const imt = berat / (tinggiMeter * tinggiMeter);
        const imtFixed = imt.toFixed(1);

        // Sumber referensi yang konsisten
        const sourceText = '<div class="mt-2 pt-2 border-top small text-muted">Sumber: Pedoman Gizi Seimbang 2014</div>';

        let status = '';
        let cssClass = '';
        let saran = '';

        if (imt < 17.0) {
            status = 'Sangat Kurus (Kekurangan Berat Badan Tingkat Berat)';
            cssClass = 'danger';
            saran = 'Tingkatkan asupan kalori dan nutrisi bergizi.' + sourceText;
        } else if (imt < 18.5) {
            status = 'Kurus (Kekurangan Berat Badan Tingkat Ringan)';
            cssClass = 'warning';
            saran = 'Perbaiki pola makan dan konsumsi makanan bergizi.' + sourceText;
        } else if (imt <= 25.0) {
            status = 'Normal (Ideal)';
            cssClass = 'safe';
            saran = 'Pertahankan pola makan sehat dan olahraga teratur.' + sourceText;
        } else if (imt <= 27.0) {
            status = 'Gemuk (Kelebihan Berat Badan Tingkat Ringan)';
            cssClass = 'warning';
            saran = 'Kurangi kalori, batasi gula/lemak, dan rutin berolahraga.' + sourceText;
        } else {
            status = 'Obesitas (Kelebihan Berat Badan Tingkat Berat)';
            cssClass = 'danger';
            saran = 'Segera konsultasikan dengan ahli gizi atau dokter untuk penanganan lebih lanjut.' + sourceText;
        }

        hasil.className = `result-container res-imt animate__animated animate__fadeInUp`;
        hasil.innerHTML = `
            <div class="result-header-gradient" style="background: linear-gradient(135deg, ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}, #2c3e50);">
                <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-weight-scale fs-5"></i>
                    <span>Hasil Indeks Massa Tubuh</span>
                </div>
                <span class="result-badge-pill">${status.split(' ')[0]}</span>
            </div>

            <div class="result-main-value">
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Skor IMT Anda</div>
                <div class="fs-2 fw-bold main-text">${imtFixed}</div>
                <div class="badge rounded-pill mt-2" style="background: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}20; color: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}; font-size: 0.75rem;">
                    ${status}
                </div>
            </div>

            <div class="result-info-grid">
                <div class="result-info-item">
                    <div class="result-info-icon" style="background: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}10; color: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'};">
                        <i class="fa-solid fa-lightbulb"></i>
                    </div>
                    <div>
                        <div class="fw-bold small">Saran Kesehatan</div>
                        <div class="text-muted small">${saran.split('<div')[0]}</div>
                    </div>
                </div>

                <div class="mt-2 pt-2 border-top">
                    <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.65rem;">
                        <i class="fa-solid fa-book-medical"></i>
                        <span>Sumber: Pedoman Gizi Seimbang 2014</span>
                    </div>
                </div>
            </div>
        `;

        // restore button
        btn.disabled = false; spinner.classList.add('d-none'); btnLabel.textContent = 'Hitung IMT';
    }, 400);
}

// Load data dari localStorage saat halaman dimuat
function loadIMTData() {
    const savedData = JSON.parse(localStorage.getItem(IMT_KEY));
    if (savedData) {
        document.getElementById("beratBadan").value = savedData.berat;
        document.getElementById("tinggiBadan").value = savedData.tinggi;
        hitungIMT(); // Hitung otomatis
    }
}

function resetIMT() {
    document.getElementById('beratBadan').value = '';
    document.getElementById('tinggiBadan').value = '';
    const hasil = document.getElementById('hasilIMT');
    hasil.className = 'result';
    hasil.innerHTML = '';
    localStorage.removeItem(IMT_KEY); // Hapus data dari localStorage
}


// Panggil fungsi load saat halaman dimuat
window.addEventListener('load', loadIMTData);


//end kalkulator imt

// Riwayat Tekanan Darah Logic
const RIWAYAT_KEY = 'riwayat_tensi_v1';

function saveRiwayat(sbp, dbp, status) {
    const riwayat = JSON.parse(localStorage.getItem(RIWAYAT_KEY) || '[]');
    const newItem = {
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        sbp,
        dbp,
        status
    };
    riwayat.unshift(newItem); // Add to top
    if (riwayat.length > 10) riwayat.pop(); // Limit to 10
    localStorage.setItem(RIWAYAT_KEY, JSON.stringify(riwayat));
    renderRiwayat();
}

function renderRiwayat() {
    const listEl = document.getElementById('listRiwayat');
    const container = document.getElementById('riwayatTekanan');
    if (!listEl || !container) return;

    const riwayat = JSON.parse(localStorage.getItem(RIWAYAT_KEY) || '[]');
    if (riwayat.length === 0) {
        container.classList.add('d-none');
        return;
    }
    container.classList.remove('d-none');
    listEl.innerHTML = riwayat.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${item.sbp}/${item.dbp} mmHg</strong>
                <div class="small-muted" style="font-size:0.8rem">${item.date}</div>
            </div>
            <span class="badge ${item.status.includes('Normal') ? 'text-bg-success' : item.status.includes('Hipertensi') ? 'text-bg-danger' : 'text-bg-warning'}">${item.status.split('</b>')[0].replace(/<[^>]*>/g, '')}</span>
        </li>
    `).join('');
}

function hapusRiwayat() {
    if (confirm('Hapus semua riwayat pengecekan?')) {
        localStorage.removeItem(RIWAYAT_KEY);
        // Render Riwayat saat inisialisasi
        renderRiwayat();
    }
}
// Expose to global scope for button onclick
window.hapusRiwayat = hapusRiwayat;

// Real-time validation
const sbpInput_v2 = document.getElementById('sbp');
const dbpInput_v2 = document.getElementById('dbp');
const sbpValidation_v2 = document.getElementById('sbpValidation');
const dbpValidation_v2 = document.getElementById('dbpValidation');

function validateSBP_v2() {
    if (!sbpInput_v2 || !sbpValidation_v2) return;
    const value = parseInt(sbpInput_v2.value);
    if (sbpInput_v2.value === '') {
        sbpValidation_v2.classList.add('d-none');
        sbpInput_v2.classList.remove('is-invalid');
    } else if (isNaN(value) || value < 30 || value > 250) {
        sbpValidation_v2.classList.remove('d-none');
        sbpValidation_v2.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Nilai sistolik harus antara 30–250 mmHg';
        sbpInput_v2.classList.add('is-invalid');
    } else {
        sbpValidation_v2.classList.add('d-none');
        sbpInput_v2.classList.remove('is-invalid');
    }
}

function validateDBP_v2() {
    if (!dbpInput_v2 || !dbpValidation_v2) return;
    const value = parseInt(dbpInput_v2.value);
    if (dbpInput_v2.value === '') {
        dbpValidation_v2.classList.add('d-none');
        dbpInput_v2.classList.remove('is-invalid');
    } else if (isNaN(value) || value < 30 || value > 200) {
        dbpValidation_v2.classList.remove('d-none');
        dbpValidation_v2.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Nilai diastolik harus antara 30–200 mmHg';
        dbpInput_v2.classList.add('is-invalid');
    } else {
        dbpValidation_v2.classList.add('d-none');
        dbpInput_v2.classList.remove('is-invalid');
    }
}

if (sbpInput_v2) sbpInput_v2.addEventListener('input', validateSBP_v2);
if (dbpInput_v2) dbpInput_v2.addEventListener('input', validateDBP_v2);

    // Cek Tekanan Darah
    (function () {
        const sbpEl = () => document.getElementById('sbp');
        const dbpEl = () => document.getElementById('dbp');
        const hasilEl = () => document.getElementById('hasilWrapper');
        const cekBtn = document.getElementById('cekTekananBtn');
        const resetBtn = document.getElementById('resetTekananBtn');
        const spinner = document.getElementById('cekSpinner');
        const cekLabel = document.getElementById('cekLabel');

        if (!cekBtn) return; // Prevent errors if element not found

        function setLoading(loading) {
            if (!cekBtn) return;
            cekBtn.disabled = loading;
            if (loading) {
                if (spinner) spinner.classList.remove('d-none');
                if (cekLabel) cekLabel.textContent = 'Mengecek...';
            } else {
                if (spinner) spinner.classList.add('d-none');
                if (cekLabel) cekLabel.textContent = 'Cek Hasil';
            }
        }

        function showResult(type, html) {
            const r = hasilEl();
            const msgEl = document.getElementById('hasilMessage');
            if (!r || !msgEl) return;
            
            r.classList.remove('d-none');
            msgEl.classList.remove('d-none');
            msgEl.innerHTML = `<div class="alert alert-${type === 'error' ? 'danger' : 'info'} animate__animated animate__fadeIn">${html}</div>`;
            r.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        cekBtn.addEventListener('click', function () {
            const sbpVal = sbpEl().value;
            const dbpVal = dbpEl().value;
            const sbp = parseInt(sbpVal);
            const dbp = parseInt(dbpVal);
            const r = hasilEl();
            const msgEl = document.getElementById('hasilMessage');

            // Reset UI state
            if (r) r.classList.add('d-none');
            if (msgEl) {
                msgEl.innerHTML = '';
                msgEl.classList.add('d-none');
            }
            ['hasilKategori', 'hasilRisiko', 'hasilInterpretasi', 'hasilDisclaimer'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('d-none');
            });

            if (isNaN(sbp) || isNaN(dbp) || sbp < 30 || dbp < 30) {
                [sbpEl(), dbpEl()].forEach(el => {
                    if (el) {
                        el.classList.add('shake');
                        setTimeout(() => el.classList.remove('shake'), 500);
                    }
                });
                showResult('error', '⚠️ Harap isi SBP dan DBP dengan nilai valid (minimal 30 mmHg).');
                return;
            }

            setLoading(true);

            // simulasi proses singkat untuk UX
            setTimeout(() => {
                setLoading(false);

                // Sumber referensi yang konsisten
                const sourceText = '<div class="mt-2 pt-2 border-top small text-muted">Sumber: Guidelines for the management of arterial hypertension 2018</div>';

                let kategoriTD = '';
                let teksStatus = '';

                // 1. VALIDASI DATA EKSTREM
                if (sbp < 50 || dbp < 30 || sbp > 300 || dbp > 200) {
                    showResult(
                        'error',
                        '❌ <b>Data tidak valid</b><br>' +
                        'Nilai tekanan darah ekstrem terdeteksi. Periksa kembali alat ukur.' +
                        sourceText
                    );
                    return;
                }

                // 2. KLASIFIKASI TEKANAN DARAH
        if (sbp >= 180 || dbp >= 110) {
                    kategoriTD = 'grade3';
                    teksStatus = '🔴 <b>Hipertensi Derajat 3</b>';
                } else if (sbp >= 140 && dbp < 90) {
                    kategoriTD = 'ish';
                    teksStatus = (sbp >= 160) ? '🔴 <b>Hipertensi Sistolik Terisolasi</b>' : '🟠 <b>Hipertensi Sistolik Terisolasi</b>';
                } else if ((sbp >= 160 && sbp <= 179) || (dbp >= 100 && dbp <= 109)) {
                    kategoriTD = 'grade2';
                    teksStatus = '🔴 <b>Hipertensi Derajat 2</b>';
                } else if ((sbp >= 140 && sbp <= 159) || (dbp >= 90 && dbp <= 99)) {
                    kategoriTD = 'grade1';
                    teksStatus = '🟠 <b>Hipertensi Derajat 1</b>';
                } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 85 && dbp <= 89)) {
                    kategoriTD = 'high-normal';
                    teksStatus = '⚠️ <b>Tekanan Darah Normal Tinggi</b>';
                } else if ((sbp >= 120 && sbp <= 129) || (dbp >= 80 && dbp <= 84)) {
                    kategoriTD = 'normal';
                    teksStatus = '🟡 <b>Tekanan Darah Normal</b>';
                } else if (sbp < 90 || dbp < 60) {
                    kategoriTD = 'hipotensi';
                    teksStatus = '🔵 <b>Hipotensi</b>';
                } else {
                    kategoriTD = 'optimal';
                    teksStatus = '✅ <b>Tekanan Darah Optimal</b>';
                }

                // 3. Estimasi Risiko
                const rfCheckboxes = document.querySelectorAll('.rf-check:checked');
                const rfSelected = Array.from(rfCheckboxes).map(cb => {
                    const label = cb.nextElementSibling;
                    const span = label ? label.querySelector('span') : null;
                    return span ? span.textContent : cb.value;
                });
                
                const medCondEl = document.getElementById('medCondition');
                const medCondText = medCondEl ? medCondEl.options[medCondEl.selectedIndex].text : 'Tidak Ada';
                const medCondVal = medCondEl ? medCondEl.value : 'none';
                
                const statusKesehatan = {
                    hasHMOD: medCondVal === 'hmod',
                    hasDM_NoOrganDamage: medCondVal === 'dm_no_organ',
                    hasDM_OrganDamage: medCondVal === 'dm_organ',
                    ckdStage: medCondVal === 'ckd_3' ? 3 : (medCondVal === 'ckd_4' ? 4 : 1),
                    hasCVD: medCondVal === 'cvd'
                };
                const kategoriRisiko = klasifikasiRisikoESC2018(sbp, dbp, rfSelected.length, statusKesehatan);

                // 4. Render Hasil
                renderStructuredBPResult(kategoriTD, sbp, dbp, kategoriRisiko, rfSelected, medCondText);

                // 5. Simpan Riwayat
                if (teksStatus) saveRiwayat(sbp, dbp, teksStatus);
            }, 400);
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                if (sbpEl()) sbpEl().value = '';
                if (dbpEl()) dbpEl().value = '';
                const r = hasilEl();
                const msgEl = document.getElementById('hasilMessage');
                if (r) {
                    r.classList.add('d-none');
                }
                if (msgEl) {
                    msgEl.innerHTML = '';
                    msgEl.classList.add('d-none');
                }
                // Reset validasi
                if (sbpValidation_v2) sbpValidation_v2.classList.add('d-none');
                if (dbpValidation_v2) dbpValidation_v2.classList.add('d-none');
                if (sbpEl()) {
                    sbpEl().classList.remove('is-invalid');
                    sbpEl().focus();
                }
                if (dbpEl()) dbpEl().classList.remove('is-invalid');

                // Reset faktor risiko tambahan
                document.querySelectorAll('.rf-check').forEach(cb => cb.checked = false);
                const medCondEl = document.getElementById('medCondition');
                if (medCondEl) medCondEl.value = 'none';
            });
        }

        // Inisialisasi: bersihkan saat load
        if (sbpEl()) sbpEl().value = '';
        if (dbpEl()) dbpEl().value = '';
        const wrapper = document.getElementById('hasilWrapper');
        if (wrapper) {
            wrapper.classList.add('d-none');
        }
        renderRiwayat();

    })();

// Fungsi Klasifikasi Risiko Berdasarkan Tabel 5 ESC/ESH 2018
function klasifikasiRisikoESC2018(sbp, dbp, rf, status) {
    // 1. Tentukan Derajat Tekanan Darah (Tabel 2)
    let grade = 0; // 0: Optimal/Normal, 4: High-Normal, 1: Grade 1, 2: Grade 2, 3: Grade 3
    if (sbp >= 180 || dbp >= 110) grade = 3;
    else if ((sbp >= 160 && sbp <= 179) || (dbp >= 100 && dbp <= 109)) grade = 2;
    else if ((sbp >= 140 && sbp <= 159) || (dbp >= 90 && dbp <= 99)) grade = 1;
    else if ((sbp >= 130 && sbp <= 139) || (dbp >= 85 && dbp <= 89)) grade = 4; // High Normal
    else grade = 0; // Normal / Optimal

    // 2. Tentukan Tahapan Penyakit (Tahap 1, 2, atau 3)
    let stage = 1;
    if (status.hasCVD || status.ckdStage >= 4 || status.hasDM_OrganDamage) stage = 3;
    else if (status.hasHMOD || status.ckdStage === 3 || status.hasDM_NoOrganDamage) stage = 2;
    else stage = 1;

    // 3. Matriks Risiko (Tabel 5)
    // TAHAP 3
    if (stage === 3) return "Risiko Sangat Tinggi";

    // TAHAP 2
    if (stage === 2) {
        if (grade === 3) return "Risiko Sangat Tinggi";
        if (grade === 1 || grade === 2) return "Risiko Tinggi";
        if (grade === 4) return "Risiko Sedang - Tinggi";
        return "Risiko Rendah"; // Optimal/Normal
    }

    // TAHAP 1
    if (stage === 1) {
        if (grade === 3) return "Risiko Tinggi";
        
        if (grade === 2) {
            if (rf >= 3) return "Risiko Tinggi";
            if (rf >= 1) return "Risiko Sedang - Tinggi";
            return "Risiko Sedang";
        }
        
        if (grade === 1) {
            if (rf >= 3) return "Risiko Sedang - Tinggi";
            if (rf >= 1) return "Risiko Sedang";
            return "Risiko Rendah";
        }
        
        if (grade === 4) {
            if (rf >= 3) return "Risiko Rendah - Sedang";
            return "Risiko Rendah";
        }
    }

    return "Risiko Rendah";
}

// Fungsi Pembantu Warna Risiko
function getRiskColor(risiko) {
    if (!risiko) return '#27ae60';
    const r = risiko.toLowerCase();
    if (r.includes('sangat tinggi')) return '#c0392b';
    if (r.includes('tinggi')) return '#e74c3c';
    if (r.includes('sedang - tinggi')) return '#e67e22';
    if (r.includes('sedang')) return '#f1c40f';
    if (r.includes('rendah')) return '#27ae60';
    return '#27ae60';
}

// Fungsi Render Hasil Terstruktur
function renderStructuredBPResult(kategoriTD, sbp, dbp, kategoriRisiko, rfSelected, medCondText) {
    const hasilWrapper = document.getElementById('hasilWrapper');
    const msgEl = document.getElementById('hasilMessage');
    const hasilKategoriEl = document.getElementById('hasilKategori');
    const hasilRisikoEl = document.getElementById('hasilRisiko');
    const hasilInterpretasiEl = document.getElementById('hasilInterpretasi');
    const hasilDisclaimerEl = document.getElementById('hasilDisclaimer');

    if (!hasilWrapper || !hasilKategoriEl || !hasilRisikoEl || !hasilInterpretasiEl || !hasilDisclaimerEl) return;

    // Bersihkan pesan error/info jika ada
    if (msgEl) {
        msgEl.innerHTML = '';
        msgEl.classList.add('d-none');
    }

    // 1. Tentukan Tema Warna & Ikon
    let config = {
        teks: 'Optimal',
        icon: 'fa-circle-check',
        colorClass: 'safe',
        statusColor: '#27ae60'
    };

    if (kategoriTD === 'grade3') {
        config = { teks: 'Hipertensi Derajat 3 (Berat)', icon: 'fa-circle-xmark', colorClass: 'danger', statusColor: '#e74c3c' };
    } else if (kategoriTD === 'grade2') {
        config = { teks: 'Hipertensi Derajat 2 (Sedang)', icon: 'fa-circle-exclamation', colorClass: 'danger', statusColor: '#e67e22' };
    } else if (kategoriTD === 'grade1') {
        config = { teks: 'Hipertensi Derajat 1 (Ringan)', icon: 'fa-triangle-exclamation', colorClass: 'warning', statusColor: '#f1c40f' };
    } else if (kategoriTD === 'ish') {
        config = { teks: 'Hipertensi Sistolik Terisolasi', icon: 'fa-circle-exclamation', colorClass: (sbp >= 160 ? 'danger' : 'warning'), statusColor: '#e67e22' };
    } else if (kategoriTD === 'high-normal') {
        config = { teks: 'Normal Tinggi', icon: 'fa-circle-info', colorClass: 'warning', statusColor: '#f1c40f' };
    } else if (kategoriTD === 'normal') {
        config = { teks: 'Normal', icon: 'fa-circle-check', colorClass: 'safe', statusColor: '#2ecc71' };
    } else if (kategoriTD === 'hipotensi') {
        config = { teks: 'Hipotensi (Rendah)', icon: 'fa-circle-down', colorClass: 'warning', statusColor: '#3498db' };
    }

    // 2. Render Kartu Ringkasan Utama
    hasilKategoriEl.classList.remove('d-none');
    hasilKategoriEl.className = `result ${config.colorClass} show animate__animated animate__fadeInDown p-0 overflow-hidden border-0 shadow-sm`;
    hasilKategoriEl.style.borderRadius = '16px';
    hasilKategoriEl.innerHTML = `
        <div class="p-3 text-white d-flex align-items-center justify-content-between" style="background: linear-gradient(135deg, ${config.statusColor}, #2c3e50);">
            <div class="d-flex align-items-center gap-2">
                <i class="fa-solid ${config.icon} fs-4"></i>
                <span class="fw-bold">Status Kesehatan</span>
            </div>
            <span class="badge bg-white text-dark rounded-pill px-3 py-2" style="font-size: 0.75rem;">${config.teks}</span>
        </div>
        <div class="p-4 bg-white text-dark">
            <div class="row align-items-center text-center mb-4">
                <div class="col-6 border-end">
                    <div class="text-muted small text-uppercase fw-bold" style="font-size: 0.7rem;">Sistolik</div>
                    <div class="fs-2 fw-bold text-primary">${sbp} <small class="fs-6 text-muted">mmHg</small></div>
                </div>
                <div class="col-6">
                    <div class="text-muted small text-uppercase fw-bold" style="font-size: 0.7rem;">Diastolik</div>
                    <div class="fs-2 fw-bold text-primary">${dbp} <small class="fs-6 text-muted">mmHg</small></div>
                </div>
            </div>

            <!-- Ringkasan Profil & Risiko -->
            <div class="p-3 rounded-4 bg-light border mb-3">
                <div class="row g-3">
                    <div class="col-md-6 border-md-end">
                        <div class="text-muted small fw-bold text-uppercase mb-2" style="font-size: 0.65rem;">Faktor Risiko Terdeteksi</div>
                        <div class="d-flex flex-wrap gap-1">
                            ${rfSelected.length > 0 ? rfSelected.map(rf => `<span class="badge bg-white text-danger border border-danger-subtle rounded-pill small">${rf}</span>`).join('') : '<span class="text-muted small italic">Tidak ada faktor risiko terpilih</span>'}
                        </div>
                    </div>
                    <div class="col-md-6 ps-md-4">
                        <div class="text-muted small fw-bold text-uppercase mb-2" style="font-size: 0.65rem;">Kondisi Medis Utama</div>
                        <div class="fw-bold text-dark small">${medCondText || 'Tidak Ada'}</div>
                    </div>
                </div>
            </div>

            <div class="p-3 rounded-4 d-flex align-items-center justify-content-between shadow-sm border" style="background: ${getRiskColor(kategoriRisiko)}10;">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" 
                         style="width: 45px; height: 45px; background: ${getRiskColor(kategoriRisiko)};">
                        <i class="fa-solid fa-shield-heart fs-5"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-bold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.5px;">Estimasi Risiko Kardiovaskular</div>
                        <div class="fw-bold fs-5" style="color: ${getRiskColor(kategoriRisiko)}; line-height: 1.2;">${kategoriRisiko}</div>
                    </div>
                </div>
                <div class="d-none d-md-block text-end">
                    <span class="badge rounded-pill px-3 py-2" style="background: ${getRiskColor(kategoriRisiko)}20; color: ${getRiskColor(kategoriRisiko)}; font-size: 0.7rem; border: 1px solid ${getRiskColor(kategoriRisiko)}40;">
                        ESC/ESH 2018
                    </span>
                </div>
            </div>
        </div>
    `;

    // 3. Render Interpretasi & Saran
    const interpretasi = getInterpretasiSederhana(kategoriTD, sbp, dbp, rfSelected, medCondText);
    hasilInterpretasiEl.classList.remove('d-none');
    hasilInterpretasiEl.className = `result bg-light show animate__animated animate__fadeInUp mt-3 p-4 border-0 shadow-sm`;
    hasilInterpretasiEl.style.borderRadius = '16px';
    hasilInterpretasiEl.style.animationDelay = '0.2s';
    hasilInterpretasiEl.innerHTML = `
        <div class="d-flex gap-3">
            <div class="flex-shrink-0 d-none d-sm-block">
                <div class="rounded-circle p-3 bg-white shadow-sm" style="color: ${config.statusColor}">
                    <i class="fa-solid fa-lightbulb fs-4"></i>
                </div>
            </div>
            <div>
                <h6 class="fw-bold mb-1">Analisis & Saran Kesehatan</h6>
                <p class="mb-0 text-secondary" style="font-size: 0.9rem; line-height: 1.6;">${interpretasi}</p>
                <div class="mt-3 pt-3 border-top d-flex align-items-center gap-2 text-muted small" style="font-size: 0.75rem;">
                    <i class="fa-solid fa-book-medical"></i>
                    <span>Sumber: ESC/ESH Guidelines 2018</span>
                </div>
            </div>
        </div>
    `;

    // Sembunyikan elemen lama
    hasilRisikoEl.classList.add('d-none');

    // 4. Render Disclaimer
    hasilDisclaimerEl.classList.remove('d-none');
    hasilDisclaimerEl.className = 'alert alert-sm alert-secondary animate__animated animate__fadeIn mt-4 border-0 shadow-sm';
    hasilDisclaimerEl.style.borderRadius = '12px';
    hasilDisclaimerEl.style.animationDelay = '0.4s';
    hasilDisclaimerEl.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-user-shield text-primary"></i>
            <span style="font-size: 0.8rem"><strong>Catatan:</strong> Hasil ini merupakan sarana edukasi. Silakan konsultasi ke fasilitas kesehatan untuk diagnosis medis resmi.</span>
        </div>
    `;

    // Tampilkan wrapper
    hasilWrapper.classList.remove('d-none');
    setTimeout(() => {
        hasilWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function getInterpretasiSederhana(kategoriTD, sbp, dbp, rfSelected, medCondText) {
    let baseText = '';
    let recommendations = [];

    const interpretations = {
        'optimal': '<strong>Kabar Baik!</strong> Tekanan darah Anda berada pada kondisi terbaik (Optimal).',
        'normal': 'Tekanan darah Anda berada dalam rentang <strong>Normal</strong>.',
        'high-normal': 'Tekanan darah Anda masuk kategori <strong>Normal Tinggi</strong>. Ini adalah tanda untuk mulai waspada.',
        'grade1': 'Anda terdeteksi memiliki <strong>Hipertensi Derajat 1</strong> (Ringan).',
        'grade2': 'Tekanan darah Anda masuk kategori <strong>Hipertensi Derajat 2</strong> (Sedang).',
        'grade3': '<strong>PERINGATAN!</strong> Tekanan darah Anda sangat tinggi (≥180/110). Ini adalah kondisi krisis hipertensi.',
        'ish': 'Anda memiliki <strong>Hipertensi Sistolik Terisolasi</strong>. Kondisi ini sering terkait dengan kekakuan pembuluh darah.',
        'hipotensi': 'Tekanan darah Anda <strong>Rendah (Hipotensi)</strong>.'
    };

    baseText = interpretations[kategoriTD] || interpretations['normal'];

    // Rekomendasi berdasarkan Kategori TD
    if (kategoriTD === 'optimal' || kategoriTD === 'normal') {
        recommendations.push('Pertahankan gaya hidup sehat dan konsumsi makanan bergizi.');
        recommendations.push('Lakukan pemeriksaan rutin minimal 1 tahun sekali.');
    } else if (kategoriTD === 'high-normal') {
        recommendations.push('Kurangi asupan garam dan lemak jenuh.');
        recommendations.push('Tingkatkan aktivitas fisik secara rutin.');
    } else if (kategoriTD === 'grade1' || kategoriTD === 'ish') {
        recommendations.push('Sangat disarankan berkonsultasi dengan dokter.');
        recommendations.push('Mulai modifikasi gaya hidup secara disiplin.');
    } else if (kategoriTD === 'grade2') {
        recommendations.push('Segera hubungi dokter atau layanan kesehatan.');
        recommendations.push('Batasi aktivitas fisik berat sementara waktu.');
    } else if (kategoriTD === 'grade3') {
        recommendations.push('<strong>Segera pergi ke Unit Gawat Darurat (UGD) sekarang juga!</strong>');
    }

    // Rekomendasi tambahan berdasarkan Faktor Risiko (Dinamis)
    if (rfSelected && rfSelected.length > 0) {
        rfSelected.forEach(rf => {
            const rfLower = rf.toLowerCase();
            if (rfLower.includes('merokok')) recommendations.push('Berhenti merokok untuk menurunkan risiko serangan jantung dan stroke secara signifikan.');
            if (rfLower.includes('obesitas')) recommendations.push('Targetkan penurunan berat badan melalui diet seimbang dan olahraga.');
            if (rfLower.includes('kolesterol')) recommendations.push('Batasi makanan tinggi lemak jenuh dan konsumsi lebih banyak serat.');
            if (rfLower.includes('keluarga')) recommendations.push('Karena ada riwayat keluarga, monitoring tekanan darah secara mandiri lebih penting bagi Anda.');
        });
    }

    // Rekomendasi berdasarkan Kondisi Medis
    if (medCondText && !medCondText.includes('Tidak Ada')) {
        recommendations.push(`Manajemen <strong>${medCondText}</strong> sangat krusial bersamaan dengan kontrol tekanan darah.`);
    }

    // Gabungkan hasil
    let resultHtml = `${baseText}<br><br><strong>Rekomendasi Medis:</strong><ul class="ps-3 mb-0">`;
    recommendations.forEach(rec => {
        resultHtml += `<li class="mb-1">${rec}</li>`;
    });
    resultHtml += `</ul>`;

    return resultHtml;
} 
