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
    if (gram <= 2) return "⅓ sendok teh";
    if (gram <= 3) return "½ sendok teh";
    if (gram <= 4) return "¾ sendok teh";
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
        // konversi natrium -> garam yang lebih akurat (~393.4 mg Na per 1 g NaCl)
        const garam = +(natrium / 393.4).toFixed(2);
        const sendokTeh = konversiSendokTeh(garam);
        const pct = Math.round((natrium / 2300) * 100);

        // tentukan status UI
        let status = '';
        if (natrium <= 1500) status = 'safe';
        else if (natrium <= 2000) status = 'warning';
        else status = 'danger';

        // render hasil (konsisten dengan style .result)
        hasil.className = `result ${status} show`;
        hasil.innerHTML = `
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;">
                <div><strong>Kelompok Usia:</strong> ${rekomendasi.range} &nbsp; <small class="text-muted">(${jk === 'laki' ? 'Laki-laki' : 'Perempuan'})</small></div>
                <div><small class="text-muted">Sumber: AKG — Permenkes RI No.28/2019</small></div>
            </div>
            <hr style="margin:.5rem 0;">
            <div><strong>Kebutuhan Natrium Harian:</strong> <span style="color:#28a745">${natrium} mg</span></div>
            <div><strong>Setara Garam:</strong> ± ${garam} g/hari <small class="text-muted">(${sendokTeh})</small></div>
            <div class="mt-2">
                <div class="progress" style="height:10px">
                    <div class="progress-bar" role="progressbar" style="width:${pct}%"></div>
                </div>
                <small class="small-muted">${pct}% dari batas WHO (2300 mg/hari)</small>
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

        hasil.className = 'result safe show';
        hasil.innerHTML = `
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;">
                <div><strong>Kelompok Usia:</strong> ${lemakData.umurMin}–${lemakData.umurMax} thn &nbsp; <small class="text-muted">(${jk === 'L' ? 'Laki-laki' : 'Perempuan'})</small></div>
                <div><small class="text-muted">Sumber: AKG — Permenkes RI No.28/2019</small></div>
            </div>
            <hr style="margin:.5rem 0;">
            <div><strong>Kebutuhan Lemak Harian:</strong> <span style="color:#28a745">${lemak} gram</span></div>
            <div><strong>Setara Minyak/Lemak:</strong> ± ${sendokDisplay}</div>
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

        hasil.className = `result ${cssClass} show`;
        hasil.innerHTML = `
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;">
                <div><strong>IMT Anda:</strong> <span style="font-size:1.2rem">${imtFixed}</span></div>
                <div><small class="text-muted">Kategori: ${status}</small></div>
            </div>
            <hr style="margin:.5rem 0;">
            <div><strong>Saran:</strong> ${saran}</div>
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
        renderRiwayat();
    }
}
// Expose to global scope for button onclick
window.hapusRiwayat = hapusRiwayat;

// Cek Tekanan Darah
(function () {
    const sbpEl = () => document.getElementById('sbp');
    const dbpEl = () => document.getElementById('dbp');
    const hasilEl = () => document.getElementById('hasil');
    const cekBtn = document.getElementById('cekTekananBtn');
    const resetBtn = document.getElementById('resetTekananBtn');
    const spinner = document.getElementById('cekSpinner');
    const cekLabel = document.getElementById('cekLabel');

    function setLoading(loading) {
        cekBtn.disabled = loading;
        if (loading) { spinner.classList.remove('d-none'); cekLabel.textContent = 'Mengecek...'; }
        else { spinner.classList.add('d-none'); cekLabel.textContent = 'Cek Hasil'; }
    }

    function showResult(type, html) {
        const r = hasilEl();
        r.className = 'result ' + type + ' show';
        r.innerHTML = html;
        r.focus?.();
    }

    cekBtn.addEventListener('click', function () {
        const sbp = parseInt(sbpEl().value);
        const dbp = parseInt(dbpEl().value);
        const r = hasilEl();
        r.className = 'result';
        r.innerHTML = '';

        if (isNaN(sbp) || isNaN(dbp) || sbp < 30 || dbp < 30) {
            [sbpEl(), dbpEl()].forEach(el => { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); });
            showResult('', '⚠️ Harap isi SBP dan DBP dengan nilai valid.');
            return;
        }

        let statusText = '';
        let bpCategory = '';
        setLoading(true);

        // simulasi proses singkat untuk UX
        setTimeout(() => {
            setLoading(false);

            // Sumber referensi yang konsisten
            const sourceText = '<div class="mt-2 pt-2 border-top small text-muted">Sumber: Guidelines for the management of arterial hypertension 2018</div>';

    let kategoriTD = '';
    let teksStatus = '';
            let cssClass = '';

            // 1. VALIDASI DATA
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
            // Urutan prioritas: Derajat 3 -> ISH -> Derajat 2 -> Derajat 1 -> Normal Tinggi -> Normal -> Hipotensi -> Optimal
            
            if (sbp >= 180 || dbp >= 110) {
                kategoriTD = 'grade3';
                cssClass = 'stage2'; // Map ke CSS stage2 (merah)
                teksStatus = '🔴 <b>Hipertensi Derajat 3</b>';
            } else if (sbp >= 140 && dbp < 90) {
                // Hipertensi Sistolik Terisolasi (ISH)
                kategoriTD = 'ish';
                // Warna indikator menyesuaikan tingkat keparahan SBP
                if (sbp >= 160) {
                    cssClass = 'stage2';
                    teksStatus = '🔴 <b>Hipertensi Sistolik Terisolasi</b>';
                } else {
                    cssClass = 'stage1';
                    teksStatus = '🟠 <b>Hipertensi Sistolik Terisolasi</b>';
                }
            } else if ((sbp >= 160 && sbp <= 179) || (dbp >= 100 && dbp <= 109)) {
                kategoriTD = 'grade2';
                cssClass = 'stage2';
                teksStatus = '🔴 <b>Hipertensi Derajat 2</b>';
            } else if ((sbp >= 140 && sbp <= 159) || (dbp >= 90 && dbp <= 99)) {
                kategoriTD = 'grade1';
                cssClass = 'stage1';
                teksStatus = '🟠 <b>Hipertensi Derajat 1</b>';
            } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 85 && dbp <= 89)) {
                kategoriTD = 'high-normal';
                cssClass = 'elevated';
                teksStatus = '⚠️ <b>Tekanan Darah Normal Tinggi</b>';
            } else if ((sbp >= 120 && sbp <= 129) || (dbp >= 80 && dbp <= 84)) {
                kategoriTD = 'normal';
                cssClass = 'normal';
                teksStatus = '🟡 <b>Tekanan Darah Normal</b>';
            } else if (sbp < 90 || dbp < 60) {
                kategoriTD = 'hipotensi';
                cssClass = 'normal';
                teksStatus = '🔵 <b>Hipotensi</b>';
            } else {
                kategoriTD = 'optimal';
                cssClass = 'safe';
                teksStatus = '✅ <b>Tekanan Darah Optimal</b>';
            }

            // 3. ESTIMASI RISIKO HIPERTENSI (ESC/ESH 2018)
            // Input default karena UI saat ini hanya memiliki input tekanan darah
            // (Asumsi: 0 faktor risiko, tidak ada komorbiditas)
            const statusKesehatan = {
                hasHMOD: false,             // HMOD (Hypertension-Mediated Organ Damage)
                hasDM_NoOrganDamage: false, // Diabetes tanpa kerusakan organ
                hasDM_OrganDamage: false,   // Diabetes dengan kerusakan organ
                ckdStage: 1,                // Derajat PGK (1-5)
                hasCVD: false               // Penyakit Kardiovaskular (CVD)
            };
            
            const kategoriRisiko = klasifikasiRisikoESC2018(sbp, dbp, 0, statusKesehatan);

            // Format warna ikon berdasarkan hasil teks kategori
            let iconRisiko = '🟢';
            if (kategoriRisiko.includes('sangat tinggi') || kategoriRisiko === 'Risiko tinggi') iconRisiko = '🔴';
            else if (kategoriRisiko.includes('sedang-tinggi')) iconRisiko = '🟠';
            else if (kategoriRisiko.includes('sedang')) iconRisiko = '🟡';

            // 4. TAMPILKAN HASIL
            showResult(
                cssClass,
                teksStatus +
                '<br>' + saranTekananDarah(kategoriTD) +
                '<hr><b>Estimasi Risiko Kardiovaskular:</b><br>' +
                `${iconRisiko} <b>${kategoriRisiko}</b>` +
                '<br><small>*Berdasarkan ESC/ESH Guidelines 2018*</small>' +
                sourceText
            );

            if (teksStatus) saveRiwayat(sbp, dbp, teksStatus);
        }, 400);
    });

    // Helper Functions
    /**
     * Fungsi Klasifikasi Risiko Hipertensi berdasarkan ESC/ESH Guidelines 2018
     * Referensi: Williams B, et al. European Heart Journal. 2018;39:3021–3104.
     * Tabel 5: Classification of hypertension stages and CAD risk.
     * 
     * @param {number} sbp - Tekanan Darah Sistolik
     * @param {number} dbp - Tekanan Darah Diastolik
     * @param {number} jumlahFaktorRisiko - Jumlah faktor risiko (0, 1-2, atau >=3)
     * @param {Object} status - Status kesehatan { hasHMOD, hasDM_NoOrganDamage, hasDM_OrganDamage, ckdStage, hasCVD }
     * @returns {string} Kategori risiko (Risiko rendah, sedang, sedang-tinggi, tinggi, sangat tinggi)
     */
    function klasifikasiRisikoESC2018(sbp, dbp, jumlahFaktorRisiko, status) {
        const {
            hasHMOD,
            hasDM_NoOrganDamage,
            hasDM_OrganDamage,
            ckdStage,
            hasCVD
        } = status;

        // 1. Tentukan Derajat Tekanan Darah (Kolom Tabel)
        // Prioritas pengecekan dari yang tertinggi (Grade 3) ke terendah
        let derajatTD = '';
        if (sbp >= 180 || dbp >= 110) {
            derajatTD = 'grade3';
        } else if ((sbp >= 160 && sbp <= 179) || (dbp >= 100 && dbp <= 109)) {
            derajatTD = 'grade2';
        } else if ((sbp >= 140 && sbp <= 159) || (dbp >= 90 && dbp <= 99)) {
            derajatTD = 'grade1';
        } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 85 && dbp <= 89)) {
            derajatTD = 'high_normal';
        } else {
            derajatTD = 'normal_optimal'; // < 130/85
        }

        // 2. Tentukan Tahapan Penyakit (Baris Tabel)
        // Pengecekan dilakukan dari Tahap 3 (terberat) ke bawah.

        // TAHAP 3: Penyakit Terdokumentasi (Established Disease)
        // Kriteria: CVD, CKD grade >= 4, atau DM dengan kerusakan organ
        if (hasCVD || ckdStage >= 4 || hasDM_OrganDamage) {
            // Baris Tahap 3: Semua kategori TD (High Normal ke atas) adalah Very High Risk
            if (derajatTD === 'normal_optimal') return 'Risiko sedang-tinggi'; // Estimasi konservatif
            return 'Risiko sangat tinggi';
        }

        // TAHAP 2: Penyakit Asimtomatik
        // Kriteria: HMOD, CKD grade 3, atau DM tanpa kerusakan organ
        if (hasHMOD || ckdStage === 3 || hasDM_NoOrganDamage) {
            if (derajatTD === 'grade3') return 'Risiko tinggi';
            if (derajatTD === 'grade2') return 'Risiko tinggi';
            if (derajatTD === 'grade1') return 'Risiko tinggi'; // Tabel: Moderate to High -> Ambil High (tertinggi)
            if (derajatTD === 'high_normal') return 'Risiko sedang-tinggi'; // Tabel: Moderate to High
            return 'Risiko sedang';
        }

        // TAHAP 1: Tidak berkomplikasi (Hanya faktor risiko)
        
        // KONDISI: >= 3 Faktor Risiko
        if (jumlahFaktorRisiko >= 3) {
            if (derajatTD === 'grade3') return 'Risiko tinggi';
            if (derajatTD === 'grade2') return 'Risiko tinggi';
            if (derajatTD === 'grade1') return 'Risiko sedang-tinggi'; // Tabel: Moderate-High
            if (derajatTD === 'high_normal') return 'Risiko sedang'; // Tabel: Low-Moderate -> Ambil Sedang
            return 'Risiko rendah';
        }

        // KONDISI: 1-2 Faktor Risiko
        if (jumlahFaktorRisiko >= 1) {
            if (derajatTD === 'grade3') return 'Risiko tinggi';
            if (derajatTD === 'grade2') return 'Risiko sedang-tinggi'; // Tabel: Moderate-High
            if (derajatTD === 'grade1') return 'Risiko sedang'; // Tabel: Moderate
            if (derajatTD === 'high_normal') return 'Risiko rendah'; // Tabel: Low
            return 'Risiko rendah';
        }

        // KONDISI: 0 Faktor Risiko (No other risk factors)
        if (derajatTD === 'grade3') return 'Risiko tinggi';
        if (derajatTD === 'grade2') return 'Risiko sedang'; // Tabel: Moderate
        if (derajatTD === 'grade1') return 'Risiko rendah'; // Tabel: Low
        if (derajatTD === 'high_normal') return 'Risiko rendah'; // Tabel: Low
        
        return 'Risiko rendah'; // Normal/Optimal
    }

    function saranTekananDarah(kategoriTD) {
        const tips = {
            'optimal': {
                saran: "Kondisi optimal! Pertahankan gaya hidup sehat ini.",
                diet: "Lanjutkan pola makan gizi seimbang.",
                aktivitas: "Pertahankan rutinitas olahraga Anda."
            },
            'normal': {
                saran: "Tekanan darah normal. Cek rutin setidaknya 1 tahun sekali.",
                diet: "Jaga asupan garam dan lemak agar tidak berlebih.",
                aktivitas: "Rutin berolahraga minimal 30 menit sehari."
            },
            'high-normal': {
                saran: "Waspada! Anda berisiko mengalami hipertensi. Perlu perubahan gaya hidup.",
                diet: "Kurangi garam (< 5g/hari) dan batasi kafein.",
                aktivitas: "Tingkatkan aktivitas fisik dan jaga berat badan ideal."
            },
            'grade1': {
                saran: "Hipertensi Derajat 1. Konsultasikan dengan dokter untuk evaluasi risiko.",
                diet: "Terapkan diet DASH (perbanyak sayur/buah, rendah garam).",
                aktivitas: "Olahraga teratur (jalan cepat, bersepeda) sangat dianjurkan."
            },
            'grade2': {
                saran: "Hipertensi Derajat 2. Segera hubungi dokter, obat-obatan mungkin diperlukan.",
                diet: "Batasi ketat garam, lemak jenuh, dan makanan olahan.",
                aktivitas: "Hindari aktivitas fisik berat sebelum tekanan darah terkontrol."
            },
            'grade3': {
                saran: "BAHAYA! Hipertensi Derajat 3. Segera ke fasilitas kesehatan terdekat.",
                diet: "Hentikan konsumsi garam sementara waktu.",
                aktivitas: "Istirahat total, hindari stres, dan jangan melakukan aktivitas fisik berat."
            },
            'ish': {
                saran: "Hipertensi Sistolik Terisolasi. Umum pada lansia, berisiko kaku pembuluh darah.",
                diet: "Kurangi asupan natrium (garam) dan cukupi kebutuhan kalsium & kalium.",
                aktivitas: "Latihan aerobik ringan seperti jalan kaki atau berenang."
            },
            'hipotensi': {
                saran: "Tekanan darah rendah. Jika merasa pusing atau lemas, segera duduk/berbaring.",
                diet: "Cukupi kebutuhan cairan (minum air putih) dan jangan terlambat makan.",
                aktivitas: "Bangun dari posisi duduk/tidur secara perlahan untuk menghindari pusing."
            }
        };

        const t = tips[kategoriTD] || tips['normal'];
        return `<div class="mt-2 text-start small border-top pt-2">
            <div class="mb-1">💡 <strong>Saran:</strong> ${t.saran}</div>
            <div class="mb-1">🥗 <strong>Diet:</strong> ${t.diet}</div>
            <div>🏃 <strong>Aktivitas:</strong> ${t.aktivitas}</div>
        </div>`;
    }

resetBtn.addEventListener('click', function () {
    sbpEl().value = '';
    dbpEl().value = '';
    const r = hasilEl();
    r.className = 'result';
    r.innerHTML = '';
    sbpEl().focus();
});

// inisialisasi: bersihkan saat load
document.addEventListener('DOMContentLoaded', function () {
    if (sbpEl()) sbpEl().value = '';
    if (dbpEl()) dbpEl().value = '';
    const r = hasilEl();
    if (r) { r.className = 'result'; r.innerHTML = ''; }
    renderRiwayat(); // Load history on start
});

}) (); 
