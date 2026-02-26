// Kalkulator garam (AKG berdasarkan usia dan jenis kelamin)
// Sumber: AKG Permenkes No.28/2019
const AKG_NATRIUM_V5 = {
    L: [
        { range: "10–12", min: 10, max: 12, mg: 1300 },
        { range: "13–15", min: 13, max: 15, mg: 1500 },
        { range: "16–18", min: 16, max: 18, mg: 1700 },
        { range: "19–29", min: 19, max: 29, mg: 1500 },
        { range: "30–49", min: 30, max: 49, mg: 1500 },
        { range: "50–64", min: 50, max: 64, mg: 1300 },
        { range: "65-80", min: 65, max: 120, mg: 1100 },
        { range: "81-120", min: 65, max: 120, mg: 1000 }
    ],
    P: [
        { range: "10–12", min: 10, max: 12, mg: 1400},
        { range: "13–15", min: 13, max: 15, mg: 1500 },
        { range: "16–18", min: 16, max: 18, mg: 1600 },
        { range: "19–29", min: 19, max: 29, mg: 1500 },
        { range: "30–49", min: 30, max: 49, mg: 1500 },
        { range: "50–64", min: 50, max: 64, mg: 1400 },
        { range: "65-80", min: 65, max: 120, mg: 1200 },
        { range: "81-120", min: 65, max: 120, mg: 1000 },
    ]
};



let currentNatriumGoal = 0;
let userFoodLogNatrium = {}; // Menyimpan jumlah makanan natrium yang dipilih user

function animateNumber(el, to, duration = 600, decimals = 0) {
    if (!el) return;
    const from = parseFloat((el.textContent || '0').replace(',', '.')) || 0;
    const start = performance.now();
    function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        const val = from + (to - from) * p;
        el.textContent = decimals ? Number(val).toFixed(decimals) : Math.round(val);
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function animateProgress(bar, toPercent, duration = 600) {
    if (!bar) return;
    const from = parseFloat((bar.style.width || '0').replace('%', '')) || 0;
    const start = performance.now();
    function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        const val = from + (toPercent - from) * p;
        bar.style.width = `${val}%`;
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function formatMg(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(number);
}

function readStorageJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

function updateFoodCountNatrium(category, item, change) {
    const key = `${category}|${item}`;
    if (userFoodLogNatrium[key] === undefined) userFoodLogNatrium[key] = 0;

    userFoodLogNatrium[key] += change;
    if (userFoodLogNatrium[key] < 0) userFoodLogNatrium[key] = 0;

    // Map kategori DB ke ID kategori di HTML
    const categoryMap = {
        'makanan_pokok': 'pokok',
        'masakan': 'masakan',
        'lauk_pauk': 'lauk',
        'sayuran_sup': 'sayur',
        'camilan': 'camilan',
        'Bumbu_Masak': 'bumbu'
    };
    const htmlCat = categoryMap[category];
    const inputId = `count_${htmlCat}_${item}`;
    const input = document.getElementById(inputId);
    if (input) {
        input.value = userFoodLogNatrium[key];
        
        // Add a small bounce animation to the input on change
        input.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => input.classList.remove('animate__animated', 'animate__pulse'), 500);
    }

    calculateTotalSelectedNatrium();
}

function resetFoodCalcNatrium() {
    userFoodLogNatrium = {};
    // Reset semua input value di UI natrium
    const categories = {
        'makanan_pokok': 'pokok',
        'masakan': 'masakan',
        'lauk_pauk': 'lauk',
        'sayuran_sup': 'sayur',
        'camilan': 'camilan',
        'Bumbu_Masak': 'bumbu'
    };

    Object.keys(NATRIUM_DATABASE).forEach(cat => {
        const htmlCat = categories[cat];
        Object.keys(NATRIUM_DATABASE[cat]).forEach(item => {
            const inputId = `count_${htmlCat}_${item}`;
            const input = document.getElementById(inputId);
            if (input) input.value = 0;
        });
    });
    calculateTotalSelectedNatrium();
}

function toggleCategoryNatrium(categoryId) {
    const content = document.getElementById(`cat_content_${categoryId}`);
    const header = document.getElementById(`cat_header_${categoryId}`);
    if (content && header) {
        const isHidden = content.classList.contains('d-none');
        
        // Tutup semua kategori lain dulu untuk efek accordion yang rapi
        ['pokok', 'masakan', 'lauk', 'sayur', 'camilan', 'bumbu'].forEach(c => {
            const otherContent = document.getElementById(`cat_content_${c}`);
            const otherHeader = document.getElementById(`cat_header_${c}`);
            if (otherContent && otherHeader) {
                if (!otherContent.classList.contains('d-none')) {
                    otherContent.classList.add('animate__animated', 'animate__slideOutUp');
                    setTimeout(() => {
                        otherContent.classList.add('d-none');
                        otherContent.classList.remove('animate__animated', 'animate__slideOutUp');
                    }, 220);
                }
                otherHeader.classList.add('collapsed');
                otherHeader.setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle kategori yang diklik
        if (isHidden) {
            content.classList.remove('d-none');
            content.classList.add('animate__animated', 'animate__slideInDown');
            setTimeout(() => content.classList.remove('animate__animated', 'animate__slideInDown'), 220);
            header.classList.remove('collapsed');
            header.setAttribute('aria-expanded', 'true');
        }
    }
}

function searchFoodNatrium(query) {
    query = query.toLowerCase();
    const items = document.querySelectorAll('#kalkulator-natrium .food-item-row');
    const matchedCategories = new Set();
    const hasQuery = query.length > 0;

    items.forEach(row => {
        const name = row.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            row.classList.remove('d-none');
            // Cari parent category-content
            const content = row.closest('.category-content');
            if (content) {
                const catId = content.id.replace('cat_content_', '');
                matchedCategories.add(catId);
            }
        } else {
            row.classList.add('d-none');
        }
    });

    // Handle visibility kategori
    ['pokok', 'masakan', 'lauk', 'sayur', 'camilan', 'bumbu'].forEach(cat => {
        const content = document.getElementById(`cat_content_${cat}`);
        const header = document.getElementById(`cat_header_${cat}`);
        
        if (hasQuery) {
            if (matchedCategories.has(cat)) {
                content.classList.remove('d-none');
                content.classList.add('animate__animated', 'animate__slideInDown');
                setTimeout(() => content.classList.remove('animate__animated', 'animate__slideInDown'), 220);
                header.classList.remove('collapsed');
                header.setAttribute('aria-expanded', 'true');
            } else {
                if (!content.classList.contains('d-none')) {
                    content.classList.add('animate__animated', 'animate__slideOutUp');
                    setTimeout(() => {
                        content.classList.add('d-none');
                        content.classList.remove('animate__animated', 'animate__slideOutUp');
                    }, 220);
                } else {
                    content.classList.add('d-none');
                }
                header.classList.add('collapsed');
                header.setAttribute('aria-expanded', 'false');
            }
        } else {
            // Jika query kosong, kembalikan ke state awal (semua tertutup/collapsed)
            if (!content.classList.contains('d-none')) {
                content.classList.add('animate__animated', 'animate__slideOutUp');
                setTimeout(() => {
                    content.classList.add('d-none');
                    content.classList.remove('animate__animated', 'animate__slideOutUp');
                }, 220);
            } else {
                content.classList.add('d-none');
            }
            header.classList.add('collapsed');
            header.setAttribute('aria-expanded', 'false');
            // Pastikan semua item di dalam kategori tidak tersembunyi
            const categoryRows = content.querySelectorAll('.food-item-row');
            categoryRows.forEach(row => row.classList.remove('d-none'));
        }
    });
}

function calculateTotalSelectedNatrium() {
    let totalNatrium = 0;
    const summaryContainer = document.getElementById('selectedFoodSummaryNatrium');
    const tkpiDynamicNote = document.getElementById('tkpiDynamicNoteNatrium');
    let summaryHtml = '';

    for (const key in userFoodLogNatrium) {
        if (userFoodLogNatrium[key] <= 0) continue;

        const parts = key.split('|');
        const cat = parts[0];
        const item = parts[1];
        if (NATRIUM_DATABASE[cat] && NATRIUM_DATABASE[cat][item]) {
            const food = NATRIUM_DATABASE[cat][item];
            const itemTotal = userFoodLogNatrium[key] * food.natrium;
            totalNatrium += itemTotal;

            summaryHtml += `
                <div class="summary-item d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-light border-start border-primary border-4 animate__animated animate__fadeIn">
                    <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                        <span class="fw-bold text-truncate" style="font-size: 0.85rem;">${food.nama}</span>
                        <div class="d-flex align-items-center gap-2">
                            <span class="text-muted" style="font-size: 0.7rem;">${userFoodLogNatrium[key]} x ${food.urt}</span>
                            <button class="btn btn-sm btn-link text-danger p-0 text-decoration-none" onclick="updateFoodCountNatrium('${cat}', '${item}', -${userFoodLogNatrium[key]})" style="font-size: 0.65rem;"> 
                                <i class="fa-solid fa-trash-can"></i> Hapus
                            </button>
                        </div>
                    </div>
                    <div class="text-end ms-2" style="flex-shrink: 0;">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 py-1 px-2" style="font-size: 0.8rem;">${itemTotal}mg</span>
                    </div>
                </div>
            `;
        }
    }

    if (summaryContainer) {
        summaryContainer.innerHTML = summaryHtml || '<div class="text-center text-muted small italic py-2">Belum ada menu dipilih</div>';
    }

    const totalDisplay = totalNatrium;
    const persen = currentNatriumGoal > 0 ? Math.round((totalNatrium / currentNatriumGoal) * 100) : 0;

    const natriumDisplay = document.getElementById('displayTotalSelectedNatrium');
    const percentDisplay = document.getElementById('displayTotalSelectedPercentNatrium');
    const progressBar = document.getElementById('natriumProgressBar');

    if (natriumDisplay) animateNumber(natriumDisplay, totalDisplay, 600, 0);
    if (percentDisplay) animateNumber(percentDisplay, persen, 600, 0);

    if (progressBar) {
        const safePersen = Math.min(persen, 100);
        animateProgress(progressBar, safePersen, 600);
        progressBar.classList.remove('pulse-danger', 'pulse-warning');
        if (persen > 100) { progressBar.style.backgroundColor = '#e74c3c'; progressBar.classList.add('pulse-danger'); }
        else if (persen > 80) { progressBar.style.backgroundColor = '#e67e22'; progressBar.classList.add('pulse-warning'); }
        else if (persen > 50) { progressBar.style.backgroundColor = '#f1c40f'; }
        else { progressBar.style.backgroundColor = '#27ae60'; }
    }

    const alertBox = document.getElementById('natriumAlert');
    const insightBox = document.getElementById('dynamicInsightBoxNatrium');

    if (alertBox) {
        if (persen > 100) {
            alertBox.className = 'mt-2 p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small animate__animated animate__shakeX';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> <strong>Over Limit!</strong> Asupan natrium Anda sudah melebihi rekomendasi AKG.';
        } else if (persen > 80) {
            alertBox.className = 'mt-2 p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small';
            alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> <strong>Bahaya!</strong> Asupan natrium sudah mendekati batas (>80%).';
        } else if (persen > 50) {
            alertBox.className = 'mt-2 p-2 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning-emphasis small';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1"></i> <strong>Waspada!</strong> Asupan natrium sudah setengah dari jatah harian Anda.';
        } else if (totalNatrium > 0) {
            alertBox.className = 'mt-2 p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25 text-success small';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> <strong>Bagus!</strong> Asupan natrium Anda masih dalam batas aman.';
        } else {
            alertBox.className = 'mt-2 p-2 rounded bg-light border small text-muted';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-info me-1"></i> Mulai pilih makanan di atas untuk menghitung asupan natrium Anda.';
        }
    }

    // Smart Insight Logic
    if (insightBox) {
        if (totalNatrium > 0) {
            insightBox.classList.remove('d-none');
            let maxNa = 0;
            let maxFood = '';
            for (const key in userFoodLogNatrium) {
                if (userFoodLogNatrium[key] <= 0) continue;
                const parts = key.split('|');
                const food = NATRIUM_DATABASE[parts[0]][parts[1]];
                const itemTotal = userFoodLogNatrium[key] * food.natrium;
                if (itemTotal > maxNa) {
                    maxNa = itemTotal;
                    maxFood = food.nama;
                }
            }

            insightBox.innerHTML = `
                <div class="p-3 rounded-4 insight-box bg-primary bg-opacity-10 border border-primary border-opacity-25">
                    <div class="d-flex gap-2 align-items-start">
                        <i class="fa-solid fa-lightbulb text-primary mt-1"></i>
                        <div class="small text-muted">
                            <strong>Smart Insight:</strong> 
                            Menu <strong>${maxFood}</strong> adalah penyumbang natrium terbesar yaitu <strong>${formatMg(maxNa)} mg</strong>. 
                            ${maxNa > 500 ? 'Pertimbangkan untuk mengurangi porsinya atau pilih alternatif rendah garam.' : 'Pilihan yang cukup baik, tetap pantau asupan lainnya.'}
                        </div>
                    </div>
                </div>
            `;

            if (tkpiDynamicNote) {
                const kontribusiGoal = currentNatriumGoal > 0 ? Math.round((maxNa / currentNatriumGoal) * 100) : 0;
                tkpiDynamicNote.innerHTML = `
                    Berdasarkan <strong>Tabel Komposisi Pangan Indonesia (TKPI)</strong>, menu <strong>${maxFood}</strong>
                    menyumbang sekitar <strong>${formatMg(maxNa)} mg Natrium</strong>${kontribusiGoal > 0 ? ` (±<strong>${kontribusiGoal}%</strong> dari AKG harian Anda)` : ''}.
                    Batasi porsi atau kombinasikan dengan pilihan rendah garam agar asupan tetap seimbang.
                `;
            }
        } else {
            insightBox.classList.add('d-none');
            if (tkpiDynamicNote) {
                tkpiDynamicNote.innerHTML = 'Berdasarkan <strong>Tabel Komposisi Pangan Indonesia (TKPI)</strong>, natrium dapat berasal dari makanan utama, lauk, camilan, dan bumbu. Pilih menu dengan bijak agar asupan harian tetap terkontrol.';
            }
        }
    }

    if (currentNatriumGoal > 0 && totalNatrium > 0) {
        updateDashboardEntry({
            natrium: {
                total: Math.round(totalNatrium),
                percent: persen,
                goal: currentNatriumGoal
            }
        });
    }
}
const NATRIUM_KEY = 'kalkulator_natrium_v1'; // Kunci localStorage

// Data TKPI (Tabel Komposisi Pangan Indonesia) - Analisis Natrium per Porsi/Potong
const NATRIUM_DATABASE = {
    makanan_pokok: {
        nasi_putih: { nama: "Nasi Putih", natrium: 1, urt: "1 porsi (100g)" },
        roti_tawar: { nama: "Roti Tawar", natrium: 150, urt: "1 lembar" },
        kentang_rebus: { nama: "Kentang Rebus", natrium: 3.5, urt: "1 buah sdg" },
        mie_kering: { nama: "Mie Kering (Mentah)", natrium: 40, urt: "1 keping" }
    },
    masakan: {
        nasi_goreng: { nama: "Nasi Goreng", natrium: 850, urt: "1 porsi (200g)" },
        mie_goreng_resto: { nama: "Mie Goreng (Resto/Warung)", natrium: 600, urt: "1 porsi" },
        mie_instan_rebus: { nama: "Mie Instan Rebus", natrium: 1050, urt: "1 bungkus" },
        mie_instan_goreng: { nama: "Mie Instan Goreng", natrium: 950, urt: "1 bungkus" },
        bubur_ayam: { nama: "Bubur Ayam", natrium: 200, urt: "1 mangkuk" },
        lontong_sayur: { nama: "Lontong Sayur", natrium: 190, urt: "1 porsi" },
        gudeg_jogja: { nama: "Gudeg Nangka (Jogja)", natrium: 10, urt: "1 porsi" },
        soto_kadipiro: { nama: "Soto Bening (Kadipiro/Sleman)", natrium: 150, urt: "1 mangkuk" },
        oseng_mercon: { nama: "Oseng Mercon", natrium: 350, urt: "1 porsi" },
        mangut_lele: { nama: "Mangut Lele", natrium: 220, urt: "1 ekor" }
    },
    lauk_pauk: {
        ayam_goreng: { nama: "Ayam Goreng / kalasan", natrium: 60, urt: "1 potong" },
        rendang: { nama: "Rendang Daging", natrium: 50, urt: "1 potong" },
        telur_dadar: { nama: "Telur Dadar", natrium: 10, urt: "1 butir" },
        ikan_asin: { nama: "Ikan Asin Goreng", natrium: 200, urt: "1 potong sdg" },
        telur_asin: { nama: "Telur Asin", natrium: 120, urt: "1 butir" },
        bakso: { nama: "Bakso Sapi", natrium: 150, urt: "1 butir besar" },
        sosis: { nama: "Sosis Sapi/Ayam", natrium: 383, urt: "1 potong" },
        nugget: { nama: "Chicken Nugget", natrium: 120, urt: "1 potong" },
        tempe_goreng: { nama: "Tempe Goreng", natrium: 3.5, urt: "1 potong" },
        tahu_goreng: { nama: "Tahu Goreng", natrium: 3.5, urt: "1 potong" },
        sarden_kaleng: { nama: "Sarden Kaleng", natrium: 266, urt: "1 kaleng (setara)" },
        kornet_sapi: { nama: "Kornet Sapi", natrium: 397, urt: "1 porsi (50g)" },
        abon_sapi: { nama: "Abon Sapi", natrium: 20, urt: "1 sdm" },
        dendeng_sapi: { nama: "Dendeng Sapi", natrium: 25, urt: "1 potong" },
        tuna_kaleng: { nama: "Tuna Kaleng", natrium: 300, urt: "1 kaleng" }
    },
    sayuran_sup: {
        sayur_asem: { nama: "Sayur Asem", natrium: 120, urt: "1 mangkuk" },
        sayur_lodeh: { nama: "Sayur Lodeh", natrium: 150, urt: "1 mangkuk" },
        sop_ayam: { nama: "Sop Ayam", natrium: 150, urt: "1 mangkuk" },
        soto_ayam: { nama: "Soto Ayam", natrium: 200, urt: "1 mangkuk" },
        capcay: { nama: "Capcay", natrium: 220, urt: "1 porsi" }
    },
    camilan: {
        kerupuk_putih: { nama: "Kerupuk Putih", natrium: 150, urt: "1 keping" },
        emping: { nama: "Emping Melinjo", natrium: 50, urt: "5 keping" },
        kentang_goreng_Instan: { nama: "Kentang Goreng", natrium: 350, urt: "1 porsi kecil" },
        kecap_manis: { nama: "Kecap Manis", natrium: 200, urt: "1 sdm" },
        bakpia_pathok: { nama: "Bakpia Pathok", natrium: 40, urt: "1 biji" },
        geblek_sleman: { nama: "Geblek (Sleman)", natrium: 62, urt: "1 biji" },
    },
    Bumbu_Masak: {
        saus_sambal: { nama: "Saus Sambal/Tomat", natrium: 160, urt: "1 sdm" },
        garam_meja: { nama: "Garam Meja", natrium: 400, urt: "1/4 sdt" },
        penyedap_rasa: { nama: "Penyedap (MSG)", natrium: 500, urt: "1/4 sdt" },
        kaldu_bubuk: { nama: "Kaldu Bubuk (Masako/Royco)", natrium: 950, urt: "1 sdt (5g)" },
        kaldu_jamur: { nama: "Kaldu Jamur (Totole/dll)", natrium: 700, urt: "1 sdt (5g)" },
        kecap_asin: { nama: "Kecap Asin", natrium: 200, urt: "1 sdm" },
        saus_tiram: { nama: "Saus Tiram", natrium: 350, urt: "1 sdm" },
        kecap_inggris: { nama: "Kecap Inggris", natrium: 200, urt: "1 sdm" },
        mayones: { nama: "Mayones", natrium: 220, urt: "1 sdm" },
        mustard: { nama: "Mustard", natrium: 350, urt: "1 sdm" },
        saus_pesto: { nama: "Saus Pesto", natrium: 200, urt: "1 sdm" },
        saus_tomat: { nama: "Saus Tomat", natrium: 200, urt: "1 sdm" },
        tauco_instan: { nama: "Tauco Instan", natrium: 200, urt: "1 sdm" }
    }
};

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

const natriumUsiaInput = document.getElementById("usia");
const natriumJkSelect = document.getElementById("jk");
const natriumHasilEl = document.getElementById("hasilAKG");
const natriumWrapEl = document.getElementById("akgResultWrap");
const natriumBtn = document.getElementById("akgBtn");
const natriumSpinner = document.getElementById("akgSpinner");
const natriumBtnLabel = document.getElementById("akgBtnLabel");
const natriumTipEl = document.getElementById('akgTip');
const natriumGoalDisplay = document.getElementById('displayGoalNatrium');


function hitungAKGv5() {
    if (!natriumUsiaInput || !natriumJkSelect || !natriumHasilEl || !natriumBtn || !natriumSpinner || !natriumBtnLabel) return;

    // [REFAKTOR] Menggunakan konstanta yang sudah di-cache.
    const usia = parseInt(natriumUsiaInput.value, 10);
    const jk = natriumJkSelect.value;

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
    natriumBtn.disabled = true; 
    natriumSpinner.classList.remove('d-none'); 
    natriumBtnLabel.textContent = 'Menghitung...';

    setTimeout(() => {
        const dataAKG = AKG_NATRIUM_V5[jk];
        let rekomendasi = null;
        for (const item of dataAKG) {
            if (usia >= item.min && usia <= item.max) { rekomendasi = item; break; }
        }
        if (!rekomendasi) {
            alert("Usia di luar rentang AKG");
            natriumBtn.disabled = false; 
            natriumSpinner.classList.add('d-none'); 
            natriumBtnLabel.textContent = 'Lihat Rekomendasi AKG';
            return;
        }

        const natrium = rekomendasi.mg;
        currentNatriumGoal = natrium; // Simpan ke global variable untuk konsumsi mini-calc
        userFoodLogNatrium = {}; // Reset pilihan makanan setiap kali hitung baru (opsional, agar fresh)
        
        // Update display goal di dashboard konsumsi
        if (natriumGoalDisplay) natriumGoalDisplay.textContent = natrium;
        
        // Render selector makanan dengan badge yang sesuai
        renderFoodSelectorNatrium();
        
        // Reset dashboard UI
        calculateTotalSelectedNatrium();

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
        natriumHasilEl.className = `result-container res-natrium animate__animated animate__fadeInUp`;
        natriumHasilEl.innerHTML = `
            <div class="result-header-gradient">
                <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-calculator fs-5"></i>
                    <span>Hasil Rekomendasi AKG</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="result-badge-pill">${rekomendasi.range} Thn</span>
                </div>
            </div>
            
            <div class="result-main-value">
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Kebutuhan Natrium Harian</div>
                <div class="fs-2 fw-bold main-text"><span id="akgNatriumValue">${natrium}</span> <small class="fs-6 text-muted">mg</small></div>
            </div>

            

            <div class="result-info-grid">
                <div class="result-info-item">
                    <div class="result-info-icon"><i class="fa-solid fa-spoon"></i></div>
                    <div>
                        <div class="fw-bold small">Setara Garam</div>
                        <div class="text-muted small">± ${garam} g/hari (${sendokTeh})</div>
                        <div class="text-muted small fst-italic">Sudah termasuk total asupan natrium harian (semua makanan yang dimakan dalam satu hari) </div>
                    </div>
                </div>
                
                <div class="result-info-item">
                    <div class="result-info-icon"><i class="fa-solid fa-chart-line"></i></div>
                    <div class="w-100">
                        <div class="fw-bold small">Persentase AKG</div>
                        <div class="progress mt-1" style="height:6px" aria-label="Persentase AKG harian">
                            <div id="akgPercentBar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:0%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
                        </div>
                        <div class="text-muted mt-1" style="font-size: 0.65rem;">${pct}% dari batas AKG (2300 mg/hari)</div>
                        <div id="akgInlineTip" class="mt-2 d-none small" style="color:#2563eb"></div>
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

        // Animasi nilai dan progress agar lebih intuitif
        const valueEl = document.getElementById('akgNatriumValue');
        const percentBarEl = document.getElementById('akgPercentBar');
        animateNumber(valueEl, natrium, 700, 0);
        if (percentBarEl) {
            const safePct = Math.min(pct, 100);
            animateProgress(percentBarEl, safePct, 700);
            percentBarEl.classList.remove('pulse-danger', 'pulse-warning');
            percentBarEl.style.backgroundColor = '#3182ce';
            if (pct > 100) { percentBarEl.classList.add('pulse-danger'); }
            else if (pct > 80) { percentBarEl.classList.add('pulse-warning'); }
            percentBarEl.setAttribute('aria-valuenow', String(safePct));
        }
        const inlineTip = document.getElementById('akgInlineTip');
        if (inlineTip) {
            if (pct > 80) {
                inlineTip.className = 'mt-2 small animate__animated animate__fadeInDown';
                inlineTip.innerHTML = '<i class="fa-solid fa-lightbulb me-1"></i> Kurangi pangan tinggi garam dan perbanyak makanan segar untuk menurunkan asupan natrium.';
            } else {
                inlineTip.className = 'd-none';
                inlineTip.innerHTML = '';
            }
        }

        // tampilkan wrap & fokus
        if (natriumWrapEl) natriumWrapEl.style.display = 'block';
        natriumHasilEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // tip & highlight untuk usia 30-50
        if (usia >= 30 && usia <= 50) {
            natriumHasilEl.classList.add('highlight');
            if (natriumTipEl) { natriumTipEl.classList.remove('d-none'); natriumTipEl.classList.add('highlight'); natriumTipEl.setAttribute('aria-hidden', 'false'); }
        } else {
            natriumHasilEl.classList.remove('highlight');
            if (natriumTipEl) { natriumTipEl.classList.add('d-none'); natriumTipEl.classList.remove('highlight'); natriumTipEl.setAttribute('aria-hidden', 'true'); }
        }

        // restore button
        natriumBtn.disabled = false; 
        natriumSpinner.classList.add('d-none'); 
        natriumBtnLabel.textContent = 'Lihat Rekomendasi AKG';
    }, 360);
}

// Load data dari localStorage saat halaman dimuat
function loadNatriumData() {
    if (!natriumUsiaInput || !natriumJkSelect) {
        renderFoodSelectorNatrium();
        return;
    }

    const savedData = readStorageJSON(NATRIUM_KEY, null);
    if (savedData && typeof savedData === 'object') {
        natriumUsiaInput.value = savedData.usia;
        natriumJkSelect.value = savedData.jk;
        hitungAKGv5(); // Hitung otomatis
    } else {
        // Jika belum ada data, render selector default agar UI tidak kosong
        renderFoodSelectorNatrium();
    }
}

// Sambungkan tombol & Reset behavior
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('akgBtn');
    if (btn) {
        btn.addEventListener('click', hitungAKGv5);
    }
    
    const resetBtn = document.getElementById('akgReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            natriumUsiaInput.value = '';
            natriumJkSelect.value = '';
            localStorage.removeItem(NATRIUM_KEY); // Hapus data dari localStorage
            if (natriumWrapEl) natriumWrapEl.style.display = 'none';
            if (natriumHasilEl) { natriumHasilEl.className = 'result'; natriumHasilEl.innerHTML = ''; }
            
            // Reset kalkulator konsumsi natrium
            resetFoodCalcNatrium();
            currentNatriumGoal = 0;
            if (natriumGoalDisplay) natriumGoalDisplay.textContent = '0';
            
            if (natriumTipEl) { natriumTipEl.classList.add('d-none'); natriumTipEl.classList.remove('highlight'); natriumTipEl.setAttribute('aria-hidden', 'true'); }
        });
    }
});

// Keydown handlers untuk natrium calculator
window.addEventListener('DOMContentLoaded', function() {
    if (natriumUsiaInput) {
        natriumUsiaInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') hitungAKGv5();
        });
    }
    if (natriumJkSelect) {
        natriumJkSelect.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') hitungAKGv5();
        });
    }
});

// Panggil fungsi load pada saat halaman dimuat
window.addEventListener('load', loadNatriumData);

// Mode fokus eksklusif Natrium: sembunyikan elemen non-relevan
window.addEventListener('load', () => {
    document.body.classList.remove('natrium-only');
});

// Fungsi untuk merender ulang selector makanan natrium dengan badge dinamis
function renderFoodSelectorNatrium() {
    const categories = {
        'makanan_pokok': 'pokok',
        'masakan': 'masakan',
        'lauk_pauk': 'lauk',
        'sayuran_sup': 'sayur',
        'camilan': 'camilan',
        'Bumbu_Masak': 'bumbu'
    };

    Object.keys(NATRIUM_DATABASE).forEach(cat => {
        const htmlCat = categories[cat];
        const container = document.getElementById(`cat_content_${htmlCat}`);
        if (!container) return;

        let html = '';
        Object.keys(NATRIUM_DATABASE[cat]).forEach(item => {
            const food = NATRIUM_DATABASE[cat][item];

            // Logika penentuan level natrium (Berdasarkan TKPI/BPOM umum)
            // Rendah: < 140mg, Sedang: 140-400mg, Tinggi: > 400mg
            let badgeClass = 'natrium-low';
            let badgeText = 'Rendah';
            if (food.natrium > 400) {
                badgeClass = 'natrium-high';
                badgeText = 'Tinggi';
            } else if (food.natrium >= 140) {
                badgeClass = 'natrium-medium';
                badgeText = 'Sedang';
            }

            html += `
                <div class="food-item-row d-flex align-items-center justify-content-between mb-2 ps-2 gap-2" data-name="${food.nama}">
                    <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="small text-muted fw-bold text-truncate" title="${food.nama}" style="font-size: 0.85rem;">${food.nama}</span>
                            <span class="natrium-badge ${badgeClass}">${badgeText}</span>
                        </div>
                        <span class="text-muted italic" style="font-size: 0.7rem;">URT: ${food.urt} (${food.natrium}mg Na)</span>
                    </div>
                    <div class="input-group input-group-sm no-stack-mobile" style="width: 90px; flex-shrink: 0;">
                        <button class="btn btn-outline-primary py-1 px-2" onclick="updateFoodCountNatrium('${cat}', '${item}', -1)">-</button>
                        <input type="text" id="count_${htmlCat}_${item}" class="form-control text-center py-1 px-1 fw-bold" value="${userFoodLogNatrium[`${cat}|${item}`] || 0}" readonly style="font-size: 0.85rem; background: #fff;">
                        <button class="btn btn-outline-primary py-1 px-2" onclick="updateFoodCountNatrium('${cat}', '${item}', 1)">+</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    });
}

// input Usia (UX)
// input Usia (UX)
(function () {
    const usiaInput = document.getElementById('usia');
    const tip = document.getElementById('akgTip');
    if (!usiaInput || !tip) return;
    usiaInput.addEventListener('input', function () {
        const v = parseInt(this.value, 10);
        if (!isNaN(v) && v >= 30 && v <= 50) {
            tip.classList.remove('d-none');
            tip.classList.add('highlight');
            tip.setAttribute('aria-hidden', 'false');
        } else {
            tip.classList.add('d-none');
            tip.classList.remove('highlight');
            tip.setAttribute('aria-hidden', 'true');
        }
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
        { umurMin: 80, umurMax: 120, lemak: 45 }
    ],
    P: [
        { umurMin: 10, umurMax: 12, lemak: 65 },
        { umurMin: 13, umurMax: 15, lemak: 70 },
        { umurMin: 16, umurMax: 18, lemak: 70 },
        { umurMin: 19, umurMax: 29, lemak: 65 },
        { umurMin: 30, umurMax: 49, lemak: 60 },
        { umurMin: 50, umurMax: 64, lemak: 50 },
        { umurMin: 65, umurMax: 80, lemak: 45 },
        { umurMin: 80, umurMax: 120, lemak: 40 }
    ]
};

const TKPI_DATABASE = {
    gorengan: {
        tempe: { nama: "Tempe Goreng tepung", lemak: 5.4, urt: "1 potong" },
        tahu: { nama: "Tahu Goreng", lemak: 4.25, urt: "1 potong" },
        bakwan: { nama: "Bakwan/Bala-bala", lemak: 5.1, urt: "1 potong" },
        pisang_goreng: { nama: "Pisang Goreng", lemak: 3.6, urt: "1 potong" },
        emping: { nama: "Emping Melinjo Goreng", lemak: 1.1, urt: "1 keping" },
        cireng: { nama: "Cireng Goreng", lemak: 3.5, urt: "1 potong" },
        mendoan: { nama: "Tempe Mendoan", lemak: 6.5, urt: "1 lembar" },
        tahu_susur: { nama: "Tahu Susur (Isi)", lemak: 8.2, urt: "1 potong" },
        Piscok: { nama: "Piscok", lemak: 8.5, urt: "1 potong" },
        Risoles: { nama: "Risoles", lemak: 3.75, urt: "1 potong" },
        onde_onde: { nama: "Onde Onde", lemak: 1.8, urt: "1 potong" },
        Molen_pisang: { nama: "Molen pisang", lemak: 11.6, urt: "1 potong" },
        singkong_goreng: { nama: "singkong goreng", lemak: 1.58, urt: "1 potong" },
        Combro: { nama: "Combro", lemak: 4.58, urt: "1 potong" },
        kerupuk: { nama: "Kerupuk Udang/Ikan", lemak: 2.5, urt: "1 keping" },
        geblek: { nama: "Geblek (Khas Kulon Progo/Sleman)", lemak: 2.5, urt: "1 potong" },
        kerupuk_kaleng: { nama: "Kerupuk Putih/Warung", lemak: 2.1, urt: "1 keping" },
        jadah_goreng: { nama: "Jadah Goreng", lemak: 4.8, urt: "1 potong" }
    },
    lauk_hewani: {
        rendang: { nama: "Rendang Daging", lemak: 5.92, urt: "1 potong" },
        ayam_goreng: { nama: "Ayam Goreng (Kulit)", lemak: 9.15, urt: "1 potong" },
        sosis: { nama: "Sosis Sapi/Ayam", lemak: 10.15, urt: "1 buah" },
        kornet_sapi: { nama: "Kornet Sapi", lemak: 6.5, urt: "1 porsi (50g)" },
        sarden_kaleng: { nama: "Sarden Kaleng", lemak: 12.8, urt: "1 kaleng (setara)" },
        telur_dadar: { nama: "Telur Dadar", lemak: 6.8, urt: "1 butir" },
        ikan_goreng: { nama: "Ikan Goreng", lemak: 4.4, urt: "1 ekor sdg" },
        sate_usus: { nama: "Sate Usus Goreng", lemak: 5.5, urt: "1 tusuk" },
        bakso: { nama: "Bakso Daging Sapi", lemak: 2.1, urt: "1 butir" },
        empal_daging: { nama: "Empal Daging Sapi", lemak: 6.2, urt: "1 potong" },
        perkedel_kentang: { nama: "Perkedel Kentang", lemak: 4.5, urt: "1 biji" },
        ayam_bakar: { nama: "Ayam Bakar", lemak: 3.2, urt: "1 potong" },
        ikan_bakar: { nama: "Ikan Bakar", lemak: 2.5, urt: "1 ekor sdg" },
        lele_goreng: { nama: "Lele Goreng", lemak: 4.2, urt: "1 ekor sdg" },
        telur_ceplok: { nama: "Telur Ceplok", lemak: 4.5, urt: "1 butir" },
        ati_ampela_goreng: { nama: "Ati Ampela Goreng", lemak: 8.8, urt: "1 potong" },
        belut_goreng: { nama: "Belut Goreng (Godean)", lemak: 5.2, urt: "3-5 ekor kecil" }
    },
    masakan: {
        gulai: { nama: "Masakan Santan (Gulai)", lemak: 14.5, urt: "1 mangkuk" },
        mie_goreng: { nama: "Mie Goreng", lemak: 18.5, urt: "1 porsi" },
        nasi_goreng: { nama: "Nasi Goreng", lemak: 14.2, urt: "1 porsi" },
        mie_instan: { nama: "Mie Instan", lemak: 6.0, urt: "1 bungkus" },
        sate_kacang: { nama: "Sate Ayam (Bumbu Kacang)", lemak: 2.2, urt: "1 tusuk" },
        soto_santan: { nama: "Soto Betawi (Santan)", lemak: 12.5, urt: "1 mangkuk" },
        opor_ayam: { nama: "Opor Ayam", lemak: 10.8, urt: "1 potong" },
        sambal_goreng_ati: { nama: "Sambal Goreng Ati", lemak: 11.5, urt: "2 sdm" },
        sambal_terasi_goreng: { nama: "Sambal Terasi Goreng", lemak: 4.8, urt: "1 sdm" },
        gudeg_nangka: { nama: "Gudeg Nangka (Santan)", lemak: 9.2, urt: "1 porsi" },
        krecek: { nama: "Sambal Goreng Krecek", lemak: 12.8, urt: "2 sdm" },
        soto_bening: { nama: "Soto Bening (Soto Kadipiro/Sleman)", lemak: 4.25, urt: "1 mangkuk" },
        lotek: { nama: "Lotek (Bumbu Kacang)", lemak: 9.5, urt: "1 porsi" },
        mangut_lele: { nama: "Mangut Lele", lemak: 7.6, urt: "1/2 ekor" },
        oseng_mercon: { nama: "Oseng Mercon (Tetelan)", lemak: 22.4, urt: "1 porsi" },
        martabak: { nama: "Martabak Manis", lemak: 6.0, urt: "1 potong" },
        seblak: { nama: "Seblak", lemak: 20.0, urt: "1 porsi (200g)" }
    },
    bumbu: {
        margarin: { nama: "Margarin", lemak: 12.5, urt: "1 sdm" },
        santan_kental: { nama: "Santan Kental", lemak: 5.5, urt: "1 sdm" },
        keju: { nama: "Keju", lemak: 6.5, urt: "1 lembar" },
        mayones: { nama: "Mayones", lemak: 11.0, urt: "1 sdm" },
        minyak_goreng: { nama: "Minyak Goreng (Tambahan)", lemak: 10.0, urt: "1 sdm" },
        kacang_goreng: { nama: "Kacang Tanah Goreng", lemak: 5.4, urt: "1 sdm" },
        bakpia_pathok: { nama: "Bakpia Pathok", lemak: 2.68, urt: "1 biji" },
        yangko: { nama: "Yangko", lemak: 1.2, urt: "1 biji" },
        peyek_kacang: { nama: "Peyek Kacang", lemak: 5.8, urt: "1 keping sdg" },
        telur_asin: { nama: "Telur Asin", lemak: 9.4, urt: "1 butir" },
    }
};

const LEMAK_ICONS = {
    gorengan: 'fa-bacon',
    lauk: 'fa-drumstick-bite',
    lauk_hewani: 'fa-drumstick-bite',
    masakan: 'fa-bowl-rice',
    bahan_tambahan: 'fa-cookie',
    bumbu: 'fa-cookie'
};

let currentFatGoal = 0;
let userFoodLog = {}; // Menyimpan jumlah makanan yang dipilih user

function updateFoodCount(category, item, change) {
    const key = `${category}|${item}`; // Gunakan separator pipe agar aman
    if (userFoodLog[key] === undefined) userFoodLog[key] = 0;
    
    userFoodLog[key] += change;
    if (userFoodLog[key] < 0) userFoodLog[key] = 0;

    // Update display angka di input
    const inputId = `lemak_count_${category}_${item}`;
    const input = document.getElementById(inputId);
    if (input) {
        input.value = userFoodLog[key];
    }

    calculateTotalSelectedFat();
}

function resetFoodCalc() {
    userFoodLog = {};
    // Reset semua input value di UI
    Object.keys(TKPI_DATABASE).forEach(cat => {
        Object.keys(TKPI_DATABASE[cat]).forEach(item => {
            const inputId = `lemak_count_${cat}_${item}`;
            const input = document.getElementById(inputId);
            if (input) input.value = 0;
        });
    });
    calculateTotalSelectedFat();
}

function resetFoodSelectionOnlyIfAny() {
    const hasSelectedFood = Object.values(userFoodLog).some((count) => Number(count) > 0);
    if (!hasSelectedFood) return;
    resetFoodCalc();
}

function toggleCategory(categoryId) {
    const content = document.getElementById(`lemak_cat_content_${categoryId}`);
    const header = document.getElementById(`lemak_cat_header_${categoryId}`);
    if (content && header) {
        const isHidden = content.classList.contains('d-none');
        Object.keys(TKPI_DATABASE).forEach(c => {
            const oc = document.getElementById(`lemak_cat_content_${c}`);
            const oh = document.getElementById(`lemak_cat_header_${c}`);
            if (oc && oh) {
                if (!oc.classList.contains('d-none')) {
                    oc.classList.add('animate__animated', 'animate__slideOutUp');
                    setTimeout(() => {
                        oc.classList.add('d-none');
                        oc.classList.remove('animate__animated', 'animate__slideOutUp');
                    }, 220);
                } else {
                    oc.classList.add('d-none');
                }
                oh.classList.add('collapsed');
                oh.setAttribute('aria-expanded', 'false');
            }
        });
        if (isHidden) {
            content.classList.remove('d-none');
            header.classList.remove('collapsed');
            header.setAttribute('aria-expanded', 'true');
            content.classList.add('animate__animated', 'animate__slideInDown');
            setTimeout(() => content.classList.remove('animate__animated', 'animate__slideInDown'), 220);
        }
    }
}

function searchFood(query) {
    query = query.toLowerCase();
    const items = document.querySelectorAll('#hasilLemak .food-item-row');
    const matchedCategories = new Set();
    const hasQuery = query.length > 0;
    
    items.forEach(row => {
        const name = row.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            row.classList.remove('d-none');
            // Lacak kategori yang memiliki item cocok
            const content = row.closest('.category-content');
            if (content) {
                const catId = content.id.replace('lemak_cat_content_', '');
                matchedCategories.add(catId);
            }
        } else {
            row.classList.add('d-none');
        }
    });

    // Handle visibility kategori
    Object.keys(TKPI_DATABASE).forEach(cat => {
        const content = document.getElementById(`lemak_cat_content_${cat}`);
        const header = document.getElementById(`lemak_cat_header_${cat}`);
        
        if (hasQuery) {
            if (matchedCategories.has(cat)) {
                content.classList.remove('d-none');
                header.classList.remove('collapsed');
                header.setAttribute('aria-expanded', 'true');
                content.classList.add('animate__animated', 'animate__slideInDown');
                setTimeout(() => content.classList.remove('animate__animated', 'animate__slideInDown'), 220);
            } else {
                if (!content.classList.contains('d-none')) {
                    content.classList.add('animate__animated', 'animate__slideOutUp');
                    setTimeout(() => {
                        content.classList.add('d-none');
                        content.classList.remove('animate__animated', 'animate__slideOutUp');
                    }, 220);
                } else {
                    content.classList.add('d-none');
                }
                header.classList.add('collapsed');
                header.setAttribute('aria-expanded', 'false');
            }
        } else {
            // Jika query kosong, kembalikan ke state awal (semua tertutup/collapsed)
            if (content && header) {
                if (!content.classList.contains('d-none')) {
                    content.classList.add('animate__animated', 'animate__slideOutUp');
                    setTimeout(() => {
                        content.classList.add('d-none');
                        content.classList.remove('animate__animated', 'animate__slideOutUp');
                    }, 220);
                } else {
                    content.classList.add('d-none');
                }
                header.classList.add('collapsed');
                header.setAttribute('aria-expanded', 'false');
                // Pastikan semua item di dalam kategori tidak tersembunyi
                const categoryRows = content.querySelectorAll('.food-item-row');
                categoryRows.forEach(row => row.classList.remove('d-none'));
            }
        }
    });
}

function calculateTotalSelectedFat() {
    let totalLemak = 0;
    const summaryContainer = document.getElementById('selectedFoodSummary');
    const progressBar = document.getElementById('fatProgressBar');
    const percentDisplay = document.getElementById('displayTotalSelectedPercentText');
    const fatDisplay = document.getElementById('displayTotalSelectedFat');
    const fatDisplayLarge = document.getElementById('displayTotalSelectedFatLarge');
    const fatGoalDisplay = document.getElementById('displayFatGoal');
    const alertBox = document.getElementById('foodAlert');
    const insightBox = document.getElementById('dynamicInsightBox');
    const lemakDynamicEduNote = document.getElementById('lemakDynamicEduNote');
    
    let summaryHtml = '';
    
    for (const key in userFoodLog) {
        if (userFoodLog[key] <= 0) continue;

        const parts = key.split('|');
        const cat = parts[0];
        const item = parts[1];
        if (TKPI_DATABASE[cat] && TKPI_DATABASE[cat][item]) {
            const food = TKPI_DATABASE[cat][item];
            const itemTotal = userFoodLog[key] * food.lemak;
            totalLemak += itemTotal;

            summaryHtml += `
                        <div class="summary-item d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-light border-start border-warning border-4 animate__animated animate__fadeIn">
                            <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                                <span class="fw-bold text-truncate" style="font-size: 0.85rem;">${food.nama}</span>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="text-muted" style="font-size: 0.7rem;">${userFoodLog[key]} x ${food.urt}</span>
                                    <button class="btn btn-sm btn-link text-danger p-0 text-decoration-none" onclick="updateFoodCount('${cat}', '${item}', -${userFoodLog[key]})" style="font-size: 0.65rem;">
                                        <i class="fa-solid fa-trash-can"></i> Hapus
                                    </button>
                                </div>
                            </div>
                            <div class="text-end ms-2" style="flex-shrink: 0;">
                                <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-1 px-2" style="font-size: 0.8rem;">${itemTotal.toFixed(1)}g</span>
                            </div>
                        </div>
                    `;
        }
    }

    if (summaryContainer) {
        summaryContainer.innerHTML = summaryHtml || '<div class="text-center text-muted small italic py-2">Belum ada menu dipilih</div>';
    }

    // Gunakan Math.round untuk menghindari floating point bug yang aneh
    totalLemak = Math.round(totalLemak * 10) / 10;

    let maxFat = 0;
    let maxFood = '';
    if (totalLemak > 0) {
        for (const key in userFoodLog) {
            if (userFoodLog[key] <= 0) continue;
            const parts = key.split('|');
            const food = TKPI_DATABASE[parts[0]][parts[1]];
            const itemTotal = userFoodLog[key] * food.lemak;
            if (itemTotal > maxFat) {
                maxFat = itemTotal;
                maxFood = food.nama;
            }
        }
    }
    
    const totalDisplay = totalLemak.toFixed(1);
    const persen = currentFatGoal > 0 ? Math.round((totalLemak / currentFatGoal) * 100) : 0;

    if (fatDisplay) {
        fatDisplay.textContent = totalDisplay;
        animateNumber(fatDisplay, parseFloat(totalDisplay), 600, 1);
    }
    if (fatDisplayLarge) {
        fatDisplayLarge.textContent = totalDisplay;
        animateNumber(fatDisplayLarge, parseFloat(totalDisplay), 600, 1);
    }
    if (fatGoalDisplay) fatGoalDisplay.textContent = currentFatGoal ? Math.round(currentFatGoal) : 0;
    if (percentDisplay) {
        percentDisplay.textContent = String(persen);
        animateNumber(percentDisplay, persen, 600, 0);
    }
    
    if (progressBar) {
        const safePersen = Math.min(persen, 100);
        animateProgress(progressBar, safePersen, 600);
        progressBar.classList.remove('pulse-danger', 'pulse-warning');
        if (persen > 100) { progressBar.style.backgroundColor = '#e74c3c'; progressBar.classList.add('pulse-danger'); }
        else if (persen > 75) { progressBar.style.backgroundColor = '#e67e22'; progressBar.classList.add('pulse-warning'); }
        else if (persen > 50) { progressBar.style.backgroundColor = '#f1c40f'; }
        else { progressBar.style.backgroundColor = '#27ae60'; }
        progressBar.setAttribute('aria-valuenow', String(safePersen));
    }
    
    if (alertBox) {
        if (persen > 100) {
            alertBox.className = 'mt-2 p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small animate__animated animate__shakeX';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> <strong>Over Limit!</strong> Konsumsi lemak Anda sudah melebihi batas harian.';
        } else if (persen > 75) {
            alertBox.className = 'mt-2 p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger small';
            alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> <strong>Bahaya!</strong> Konsumsi lemak Anda sudah sangat tinggi (>75%).';
        } else if (persen > 50) {
            alertBox.className = 'mt-2 p-2 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning-emphasis small';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1"></i> <strong>Waspada!</strong> Lemak dari menu ini sudah menghabiskan setengah jatah harian.';
        } else {
            alertBox.className = 'd-none';
        }
    }

    if (lemakDynamicEduNote) {
        if (totalLemak > 0) {
            const maxFatFormatted = (Math.round(maxFat * 10) / 10).toFixed(1);
            const goalInfo = currentFatGoal > 0 ? ` (±<strong>${persen}%</strong> dari AKG harian <strong>${Math.round(currentFatGoal)} g</strong>)` : '';
            const tindakLanjut = persen > 100
                ? 'Asupan sudah melewati batas, sebaiknya kurangi porsi menu berlemak pada waktu makan berikutnya.'
                : persen > 75
                    ? 'Asupan sudah tinggi, pertimbangkan menu rebus, kukus, atau panggang untuk sisa waktu makan hari ini.'
                    : 'Asupan masih relatif terkendali, pertahankan komposisi menu rendah lemak jenuh.';

            lemakDynamicEduNote.innerHTML = `
                Berdasarkan <strong>TKPI</strong>, total konsumsi lemak Anda hari ini sekitar <strong>${totalDisplay} g</strong>${goalInfo}.
                Kontributor terbesar berasal dari <strong>${maxFood}</strong> sebesar <strong>${maxFatFormatted} g</strong>. ${tindakLanjut}
            `;
        } else {
            lemakDynamicEduNote.innerHTML = 'Berdasarkan <strong>TKPI</strong>, pantau total lemak harian Anda dan pilih menu dengan kandungan lemak lebih rendah agar konsumsi tetap seimbang.';
        }
    }

    // Dynamic Insight Logic
    if (insightBox) {
        if (totalLemak > 0) {
            insightBox.classList.remove('d-none');
            
            insightBox.innerHTML = `
                <div class="p-3 rounded-4 insight-box bg-warning bg-opacity-10 border border-warning border-opacity-25">
                    <div class="d-flex gap-2 align-items-start">
                        <i class="fa-solid fa-lightbulb text-warning mt-1"></i>
                        <div class="small text-muted">
                            <strong>Smart Insight:</strong> 
                            Menu <strong>${maxFood}</strong> adalah penyumbang lemak terbesar yaitu <strong>${(Math.round(maxFat * 10) / 10).toFixed(1)}g</strong>. 
                            Pertimbangkan untuk membatasi porsinya atau pilih alternatif yang lebih rendah lemak.
                        </div>
                    </div>
                </div>
            `;
        } else {
            insightBox.classList.add('d-none');
        }
    }

    if (currentFatGoal > 0 && totalLemak > 0) {
        updateDashboardEntry({
            lemak: {
                total: totalLemak,
                percent: persen,
                goal: currentFatGoal
            }
        });
    }
}

const LEMAK_KEY = 'kalkulator_lemak_v1'; // Kunci localStorage

// [REFAKTOR] Elemen-elemen DOM untuk Kalkulator Lemak disimpan dalam konstanta.
const lemakUsiaInput = document.getElementById("usiaLemak");
const lemakJkSelect = document.getElementById("jkLemak");
const lemakHasilEl = document.getElementById("hasilLemak");
const lemakBtn = document.getElementById("lemakBtn");
const lemakSpinner = document.getElementById("lemakSpinner");
const lemakBtnLabel = document.getElementById("lemakBtnLabel");

function hitungLemak() {
    if (!lemakUsiaInput || !lemakJkSelect || !lemakHasilEl || !lemakBtn || !lemakSpinner || !lemakBtnLabel) return;

    // [REFAKTOR] Menggunakan konstanta yang sudah di-cache.
    const usia = parseInt(lemakUsiaInput.value);
    const jk = lemakJkSelect.value;

    if (!usia || usia < 10 || !jk) {
        lemakHasilEl.className = 'result danger show';
        lemakHasilEl.innerHTML = '⚠️ Harap isi usia dan jenis kelamin dengan benar.';
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
        lemakHasilEl.className = 'result warning show';
        lemakHasilEl.innerHTML = 'Data AKG tidak ditemukan untuk usia ini.';
        return;
    }

    const lemak = lemakData.lemak;
    currentFatGoal = lemak; // Simpan ke global variable untuk mini-calc
    userFoodLog = {}; // RESET state setiap kali tombol hitung ditekan (Fix Bug)

    // loading UI
    lemakBtn.disabled = true; 
    lemakSpinner.classList.remove('d-none'); 
    lemakBtnLabel.textContent = 'Menghitung...';

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

        // Hitung penyetaraan gorengan berdasarkan TKPI (Setengah jatah lemak)
        const jatahSetengah = lemak / 2;
        const jmlTempe = Math.round(jatahSetengah / TKPI_DATABASE.gorengan.tempe.lemak);

        lemakHasilEl.className = '';
        lemakHasilEl.innerHTML = `
            <div class="result-container res-lemak animate__animated animate__fadeInUp">
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
                            <div class="text-muted" style="font-size: 0.75rem;">± ${sendokDisplay}</div>
                            <div class="text-muted small fst-italic">Sudah termasuk konsumsi lemak total dalam sehari (semua makanan yang dimakan dalam satu hari)</div>
                        </div>
                    </div>
                    <div class="result-info-item">
                        <div class="result-info-icon"><i class="fa-solid fa-spoon"></i></div>
                        <div>
                            <div class="fw-bold small">Batas Aman Minyak Goreng</div>
                            <div class="text-muted" style="font-size: 0.75rem;">Maksimal 5 sendok makan/hari</div>
                            <div class="text-muted italic mt-1" style="font-size: 0.65rem;">*Anjuran Kemenkes RI (G4-G1-L5)</div>
                        </div>
                    </div>
                </div>

                
            </div>

            <div class="result-container res-lemak animate__animated animate__fadeIn">
                <div class="result-header-gradient">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid fa-bacon fs-5"></i>
                        <span>Cek Menu Berlemakmu Hari Ini</span>
                    </div>
                    <button type="button" class="result-badge-pill reset-button" onclick="resetFoodSelectionOnlyIfAny()" title="Reset Pilihan Makanan">
                        <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                </div>

                <div class="section-lemak-calc animate__animated animate__fadeIn">
                    <div class="search-food-wrapper mb-3">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" class="form-control search-food-input" placeholder="Cari makanan (misal: Bakso)..." onkeyup="searchFood(this.value)">
                    </div>
                
                <div class="food-selector-container">
                        ${Object.keys(TKPI_DATABASE).map(cat => `
                            <div class="mb-2 food-category-card">
                                <div class="food-category-header collapsed" id="lemak_cat_header_${cat}" onclick="toggleCategory('${cat}')" role="button" aria-controls="lemak_cat_content_${cat}" aria-expanded="false" aria-label="Kategori ${cat.replace('_',' ')}">
                                    <div class="text-uppercase fw-bold text-muted" style="font-size: 0.65rem; letter-spacing: 1px;">
                                        <i class="fa-solid ${LEMAK_ICONS[cat] || 'fa-folder-open'} me-1"></i>${cat.replace('_', ' ')}
                                    </div>
                                    <i class="fa-solid fa-chevron-down text-muted small"></i>
                                </div>
                                <div id="lemak_cat_content_${cat}" class="category-content d-none">
                                    ${Object.keys(TKPI_DATABASE[cat]).map(item => {
                                        const food = TKPI_DATABASE[cat][item];
                                        let badgeClass = 'fat-low';
                                        let badgeText = 'Rendah';
                                        if (food.lemak > 10) { badgeClass = 'fat-high'; badgeText = 'Tinggi'; }
                                        else if (food.lemak > 5) { badgeClass = 'fat-medium'; badgeText = 'Sedang'; }

                                        return `
                                            <div class="food-item-row d-flex align-items-center justify-content-between mb-2 ps-2 gap-2" data-name="${food.nama}">
                                                <div class="d-flex flex-column flex-grow-1" style="min-width: 0;">
                                                    <div class="d-flex align-items-center gap-2 mb-1">
                                                        <span class="small text-muted fw-bold text-truncate" title="${food.nama}" style="font-size: 0.85rem;">${food.nama}</span>
                                                        <span class="fat-badge ${badgeClass}">${badgeText}</span>
                                                    </div>
                                                    <span class="text-muted italic" style="font-size: 0.7rem;">URT: ${food.urt} (${food.lemak}g lemak)</span>
                                                </div>
                                                <div class="input-group input-group-sm no-stack-mobile" style="width: 90px; flex-shrink: 0;">
                                                    <button class="btn btn-outline-warning py-1 px-2" onclick="updateFoodCount('${cat}', '${item}', -1)">-</button>
                                                    <input type="text" id="lemak_count_${cat}_${item}" class="form-control text-center py-1 px-1 fw-bold" value="0" readonly style="font-size: 0.85rem; background: #fff;">
                                                    <button class="btn btn-outline-warning py-1 px-2" onclick="updateFoodCount('${cat}', '${item}', 1)">+</button>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-3">
                        <div class="text-muted fw-bold mb-1" style="font-size: 0.7rem;">PENGGUNAAN JATAH LEMAK</div>
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="me-3">
                                <div class="d-flex align-items-baseline gap-1">
                                    <span class="fw-bold" style="color:#f5b041; font-size: 1.5rem;"><span id="displayTotalSelectedFatLarge">0</span></span>
                                    <span class="text-muted">/ <span id="displayFatGoal">0</span> g</span>
                                </div>
                                <div class="text-muted" style="font-size: 0.75rem;"><span id="displayTotalSelectedPercentText">0</span>% dari rekomendasi AKG Anda</div>
                            </div>
                            <div class="w-100 ms-3">
                                <div class="progress" style="height: 10px;" aria-label="Persentase jatah lemak">
                                    <div id="fatProgressBar" class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%;" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3">
                        <div class="text-uppercase fw-bold text-muted mb-2" style="font-size: 0.6rem; letter-spacing: 1px;">
                            <i class="fa-solid fa-shopping-basket me-1"></i>Menu yang Anda Pilih
                        </div>
                        <div id="selectedFoodSummary" class="p-2 rounded bg-white bg-opacity-40 border border-warning border-opacity-10" style="max-height: 150px; overflow-y: auto;">
                            <div class="text-center text-muted small italic py-2">Belum ada menu dipilih</div>
                        </div>
                    </div>

                    <div class="p-2 rounded bg-white bg-opacity-50 small border border-primary border-opacity-10 mt-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span>Total Estimasi Lemak:</span>
                            <span class="fw-bold text-primary"><span id="displayTotalSelectedFat">0</span>g</span>
                        </div>
                    </div>
                    <div id="foodAlert" class="d-none"></div>

                    <div id="dynamicInsightBox" class="mt-2 p-2 rounded bg-info bg-opacity-10 border border-info border-opacity-25 d-none animate__animated animate__fadeIn">
                        <div class="d-flex gap-2 align-items-start">
                            <i class="fa-solid fa-lightbulb text-info mt-1"></i>
                            <p id="insightText" class="small mb-0 text-muted"></p>
                        </div>
                    </div>

                    <div class="mt-4 p-3 bg-light rounded-4 border border-light-subtle shadow-sm">
                        <p id="lemakDynamicEduNote" class="text-muted mb-2" style="font-size: 0.75rem; line-height: 1.5;">
                            Berdasarkan <strong>TKPI</strong>, pantau total lemak harian Anda dan pilih menu dengan kandungan lemak lebih rendah agar konsumsi tetap seimbang.
                        </p>
                    </div>
                    
                    <div class="lemak-legend-card mt-3">
                        <div class="lemak-legend-head">
                            <div class="d-flex align-items-center gap-2">
                                <i class="fa-solid fa-droplet text-warning"></i>
                                <strong class="small">Keterangan Kandungan Lemak</strong>
                            </div>
                            <span class="lemak-legend-sub">Panduan cepat memilih menu berdasarkan estimasi lemak per porsi.</span>
                        </div>
                        <div class="lemak-legend-list">
                            <div class="legend-item lemak-legend-item lemak-legend-item-low">
                                <span class="legend-dot legend-low"></span>
                                <div class="legend-copy"><strong>Hijau</strong><span>Rendah (≤ 5 g/porsi)</span></div>
                            </div>
                            <div class="legend-item lemak-legend-item lemak-legend-item-medium">
                                <span class="legend-dot legend-medium"></span>
                                <div class="legend-copy"><strong>Kuning</strong><span>Sedang (>5 sampai 10 g/porsi)</span></div>
                            </div>
                            <div class="legend-item lemak-legend-item lemak-legend-item-high">
                                <span class="legend-dot legend-high"></span>
                                <div class="legend-copy"><strong>Merah</strong><span>Tinggi (> 10 g/porsi)</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="result-container res-lemak animate__animated animate__fadeIn">
                <div class="result-header-gradient">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid fa-book-open fs-5"></i>
                        <span>Edukasi Sumber Lemak</span>
                    </div>
                </div>

                <div class="p-3">
                    <div class="text-muted small fw-bold text-uppercase mb-2" style="letter-spacing: 1px; font-size: 0.65rem;">Sumber Lemak Populer (TKPI)</div>
                    <div class="edu-fat-grid">
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-bacon"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.gorengan.tempe.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.gorengan.tempe.lemak}g • ${TKPI_DATABASE.gorengan.tempe.urt}</div>
                            </div>
                        </div>
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-drumstick-bite"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.lauk_hewani.ayam_goreng.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.lauk_hewani.ayam_goreng.lemak}g • ${TKPI_DATABASE.lauk_hewani.ayam_goreng.urt}</div>
                            </div>
                        </div>
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-bowl-rice"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.masakan.mie_goreng.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.masakan.mie_goreng.lemak}g • ${TKPI_DATABASE.masakan.mie_goreng.urt}</div>
                            </div>
                        </div>
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-droplet"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.bumbu.santan_kental.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.bumbu.santan_kental.lemak}g • ${TKPI_DATABASE.bumbu.santan_kental.urt}</div>
                            </div>
                        </div>
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-bacon"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.lauk_hewani.rendang.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.lauk_hewani.rendang.lemak}g • ${TKPI_DATABASE.lauk_hewani.rendang.urt}</div>
                            </div>
                        </div>
                        <div class="edu-fat-card">
                            <div class="edu-icon"><i class="fa-solid fa-bowl-rice"></i></div>
                            <div>
                                <div class="edu-title">${TKPI_DATABASE.masakan.nasi_goreng.nama}</div>
                                <div class="edu-value">±${TKPI_DATABASE.masakan.nasi_goreng.lemak}g • ${TKPI_DATABASE.masakan.nasi_goreng.urt}</div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3">
                        <div class="text-muted small fw-bold text-uppercase mb-2" style="letter-spacing: 1px; font-size: 0.65rem;">Langkah Cerdas</div>
                        <div class="edu-guidance">
                            <div class="guidance-card avoid">
                                <div class="guidance-header"><i class="fa-solid fa-ban"></i><span>Hindari</span></div>
                                <ul class="guidance-list">
                                    <li><i class="fa-solid fa-triangle-exclamation"></i><span>Minyak jelantah lebih dari 2 kali pakai</span></li>
                                    <li><i class="fa-solid fa-bacon"></i><span>Kebiasaan makan gorengan setiap hari</span></li>
                                </ul>
                            </div>
                            <div class="guidance-card choose">
                                <div class="guidance-header"><i class="fa-solid fa-check"></i><span>Pilih</span></div>
                                <ul class="guidance-list">
                                    <li><i class="fa-solid fa-fire"></i><span>Masak bakar atau ungkep (lebih sedikit minyak)</span></li>
                                    <li><i class="fa-solid fa-droplet"></i><span>Gunakan santan encer</span></li>
                                    <li><i class="fa-solid fa-fish"></i><span>Pilih ikan, panggang/oven</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 edu-tips-grid">
                        <div class="edu-tip">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <i class="fa-solid fa-check text-success"></i>
                                <strong style="font-size: 0.75rem;">Pilih daging tanpa kulit</strong>
                            </div>
                            <div class="small text-muted">Kulit ayam tinggi lemak jenuh</div>
                        </div>
                        <div class="edu-tip">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <i class="fa-solid fa-check text-success"></i>
                                <strong style="font-size: 0.75rem;">Kurangi santan kental</strong>
                            </div>
                            <div class="small text-muted">Campur air agar lebih ringan</div>
                        </div>
                        <div class="edu-tip">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <i class="fa-solid fa-check text-success"></i>
                                <strong style="font-size: 0.75rem;">Ganti teknik memasak</strong>
                            </div>
                            <div class="small text-muted">Bakar, kukus, panggang</div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <details class="edu-details">
                            <summary class="edu-summary">
                                <i class="fa-solid fa-triangle-exclamation text-warning"></i>
                                <span>Waspada Lemak Tersembunyi (Data TKPI)</span>
                            </summary>
                            <div class="p-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25">
                                <p class="small mb-0 text-muted">
                                    Berdasarkan data <strong>TKPI</strong>, 1 potong <strong>Tempe Goreng</strong> mengandung <strong>±${TKPI_DATABASE.gorengan.tempe.lemak}g lemak</strong>.
                                    Makan <strong>${jmlTempe} potong</strong> saja sudah menghabiskan hampir <strong>50%</strong> jatah lemak harian.
                                </p>
                            </div>
                        </details>

                        <details class="edu-details">
                            <summary class="edu-summary">
                                <i class="fa-solid fa-circle-info text-info"></i>
                                <span>Kenapa Harus Dibatasi?</span>
                            </summary>
                            <div class="p-3 rounded bg-info bg-opacity-10 border border-info border-opacity-25">
                                <div class="small text-muted">
                                    <p class="mb-2"><strong>Lemak</strong> adalah cadangan energi, namun jika berlebih dapat menumpuk di pembuluh darah (aterosklerosis) yang memicu <strong>Hipertensi</strong>.</p>
                                    <p class="mb-2"><strong>Lemak Baik vs Jahat:</strong> Utamakan lemak tak jenuh (ikan, alpukat, kacang-kacangan) dan batasi lemak jenuh/trans (gorengan, santan kental, lemak daging).</p>
                                    <p class="mb-0"><strong>Peringatan:</strong> Hindari penggunaan <strong>minyak goreng berulang</strong> (jelantah) lebih dari 2-3 kali karena meningkatkan lemak trans yang berbahaya bagi jantung.</p>
                                </div>
                            </div>
                        </details>

                        <details class="edu-details">
                            <summary class="edu-summary">
                                <i class="fa-solid fa-lightbulb text-success"></i>
                                <span>Tips Cerdas Mengolah Bahan</span>
                            </summary>
                            <div class="p-3 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                                <div class="small text-muted">
                                    <div class="d-flex flex-column gap-2">
                                        <div class="p-2 bg-white bg-opacity-50 rounded">
                                            <div class="fw-bold text-success" style="font-size: 0.7rem;">Santan Kental → Santan Encer</div>
                                            <div style="font-size: 0.65rem;">Memangkas lemak jenuh hingga 70% tanpa menghilangkan rasa gurih.</div>
                                        </div>
                                        <div class="p-2 bg-white bg-opacity-50 rounded">
                                            <div class="fw-bold text-success" style="font-size: 0.7rem;">Daging Berlemak → Daging Murni</div>
                                            <div style="font-size: 0.65rem;">Pilih bagian 'has dalam' untuk mengurangi lemak jenuh dari tetelan/lemak daging.</div>
                                        </div>
                                        <div class="p-2 bg-white bg-opacity-50 rounded">
                                            <div class="fw-bold text-success" style="font-size: 0.7rem;">Ayam Goreng → Ayam Bakar/Ungkep</div>
                                            <div style="font-size: 0.65rem;">Menghindari penyerapan minyak berlebih pada kulit ayam saat digoreng.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <div class="mt-3 pt-2 border-top">
                    <div class="d-flex flex-column gap-1">
                        <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.65rem;">
                            <i class="fa-solid fa-book-medical"></i>
                            <span>Sumber: AKG Permenkes No.28/2019 & TKPI Kemenkes RI</span>
                        </div>
                        <div class="text-muted italic" style="font-size: 0.65rem;">
                            *Penjelasan detail tersedia di kolom informasi aplikasi.
                        </div>
                    </div>
                </div>
            </div>
        `;

        // restore button
        lemakBtn.disabled = false; 
        lemakSpinner.classList.add('d-none'); 
        lemakBtnLabel.textContent = 'Hitung Kebutuhan Lemak';
        calculateTotalSelectedFat();
    }, 400);
}

function resetLemak() {
    // [REFAKTOR] Menggunakan konstanta yang sudah di-cache.
    lemakUsiaInput.value = "";
    lemakJkSelect.selectedIndex = 0;
    lemakHasilEl.className = "result";
    lemakHasilEl.innerHTML = "";
    localStorage.removeItem(LEMAK_KEY);
    // Reset global state
    currentFatGoal = 0;
    userFoodLog = {};
    // Reset food calculator UI jika ada
    resetFoodCalc();
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

function loadLemakData() {
    if (!lemakUsiaInput || !lemakJkSelect) return;

    const savedData = readStorageJSON(LEMAK_KEY, null);
    if (savedData && typeof savedData === 'object') {
        lemakUsiaInput.value = savedData.usia;
        lemakJkSelect.value = savedData.jk;
        hitungLemak();
    }
}
window.addEventListener('load', loadLemakData);
if (lemakUsiaInput) {
    lemakUsiaInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') hitungLemak();
    });
}
if (lemakJkSelect) {
    lemakJkSelect.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') hitungLemak();
    });
}

const IMT_KEY = 'kalkulator_imt_v1'; // Kunci localStorage

// [REFAKTOR] Elemen-elemen DOM untuk Kalkulator IMT disimpan dalam konstanta agar tidak dicari berulang kali.
// Ini meningkatkan performa dan membuat kode lebih rapi.
const imtBeratBadanInput = document.getElementById('beratBadan');
const imtTinggiBadanInput = document.getElementById('tinggiBadan');
const imtHasilEl = document.getElementById('hasilIMT');
const imtBtn = document.getElementById("imtBtn");
const imtSpinner = document.getElementById("imtSpinner");
const imtBtnLabel = document.getElementById("imtBtnLabel");
// start Kalkulator IMT Script

function hitungIMT() {
    if (!imtBeratBadanInput || !imtTinggiBadanInput || !imtHasilEl || !imtBtn || !imtSpinner || !imtBtnLabel) return;

    // [REFAKTOR] Menggunakan konstanta yang sudah di-cache, bukan document.getElementById lagi.
    const berat = parseFloat(imtBeratBadanInput.value);
    const tinggi = parseFloat(imtTinggiBadanInput.value);

    if (!berat || !tinggi || berat <= 0 || tinggi <= 0) {
        imtHasilEl.className = 'result danger show';
        imtHasilEl.innerHTML = '⚠️ Harap isi berat dan tinggi badan dengan benar.';
        return;
    }

    // simpan data ke localStorage
    const savedData = {
        berat: berat,
        tinggi: tinggi
    };
    localStorage.setItem(IMT_KEY, JSON.stringify(savedData));

    // loading UI
    imtBtn.disabled = true; 
    imtSpinner.classList.remove('d-none'); 
    imtBtnLabel.textContent = 'Menghitung...';

    setTimeout(() => {
        // Konversi tinggi ke meter
        const tinggiMeter = tinggi / 100;
        // Rumus IMT = Berat / (Tinggi * Tinggi)
        const imt = berat / (tinggiMeter * tinggiMeter);
        const imtFixed = imt.toFixed(1);

        // Rumus Berat Badan Ideal (Broca modifikasi Indonesia)
        // BBI = (TB - 100) - 10% * (TB - 100)
        let bbi = (tinggi - 100) - (0.1 * (tinggi - 100));
        if (tinggi < 160 && tinggi >= 100) { // Penyesuaian untuk tinggi badan di bawah 160cm (biasanya untuk wanita atau kondisi tertentu)
            // Pada tinggi badan tertentu terkadang menggunakan rumus (TB-100) saja, 
            // namun Broca umum adalah (TB-100) * 0.9
            bbi = (tinggi - 100);
        }
        const bbiFixed = bbi.toFixed(1);

        // Rentang Berat Badan Normal berdasarkan IMT 18.5 - 25.0
        const bbMin = (18.5 * (tinggiMeter * tinggiMeter)).toFixed(1);
        const bbMax = (25.0 * (tinggiMeter * tinggiMeter)).toFixed(1);

        // Sumber referensi yang konsisten
        const sourceText = '<div class="mt-2 pt-2 border-top small text-muted">Sumber: Pedoman Gizi Seimbang 2014</div>';

        let status = '';
        let cssClass = '';
        let saran = '';

        // Definisi kalori yang edukatif
        const defKalori = '<div class="mt-2 p-2 rounded bg-light border-start border-3 border-info" style="font-size: 0.8rem;">' +
            '<strong>Info:</strong> Kalori adalah energi dari makanan & minuman yang digunakan tubuh untuk bernapas, bergerak, dan beraktivitas sehari-hari.' +
            '</div>';

        if (imt < 17.0) {
            status = 'Kekurangan berat badan tingkat berat (Sangat Kurus)';
            cssClass = 'danger';
            saran = 'Tingkatkan asupan kalori dengan makan lebih sering. Lakukan aktivitas fisik ringan seperti jalan kaki santai 30 menit, 3-5 kali seminggu untuk menjaga kebugaran.' + defKalori + sourceText;
        } else if (imt < 18.5) {
            status = 'Kekurangan berat badan tingkat ringan (Kurus)';
            cssClass = 'warning';
            saran = 'Perbaiki pola makan dengan gizi seimbang. Usahakan berolahraga rutin seperti jalan cepat selama 30 menit, minimal 3 kali seminggu untuk membangun massa otot.' + defKalori + sourceText;
        } else if (imt <= 25.0) {
            status = 'Normal';
            cssClass = 'safe';
            saran = 'Pertahankan pola makan sehat. Tetap aktif dengan olahraga teratur seperti jalan santai atau bersepeda 30 menit setiap hari (5 kali seminggu) agar kondisi tubuh tetap prima.' + defKalori + sourceText;
        } else if (imt <= 27.0) {
            status = 'Kelebihan berat badan tingkat ringan (Gemuk)';
            cssClass = 'warning';
            saran = 'Kurangi asupan kalori berlebih dari gorengan dan minuman manis. Lakukan olahraga rutin seperti jalan cepat atau jogging 30 menit, 5 kali seminggu untuk membakar energi.' + defKalori + sourceText;
        } else {
            status = 'Kelebihan berat badan tingkat berat (Obesitas)';
            cssClass = 'danger';
            saran = 'Batasi asupan kalori yang tinggi lemak dan gula. Sangat disarankan berolahraga jalan kaki atau berenang selama 30-45 menit, 5 kali seminggu, serta konsultasikan dengan ahli gizi.' + defKalori + sourceText;
        }

        imtHasilEl.className = `result-container res-imt animate__animated animate__fadeInUp`;
        imtHasilEl.innerHTML = `
            <div class="result-header-gradient" style="background: linear-gradient(135deg, ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}, #2c3e50);">
                <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-weight-scale fs-5"></i>
                    <span>Hasil Analisis Status Gizi</span>
                </div>
                <span class="result-badge-pill">${status.split(' ')[0]}</span>
            </div>

            <div class="result-main-value">
                <div class="text-muted small fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Skor IMT Anda</div>
                <div class="fs-2 fw-bold main-text">${imtFixed}</div>
                <div class="badge rounded-pill mt-2" style="background: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}20; color: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}; font-size: 0.75rem;">
                    ${status}
                </div>
                <div class="mt-3 d-flex align-items-center justify-content-center gap-2">
                    <div class="px-3 py-1 rounded-pill border shadow-sm d-flex align-items-center gap-2" style="background: #f8f9fa; font-size: 0.75rem;">
                        <i class="fa-solid fa-check-double text-success"></i>
                        <span class="text-muted">Rentang IMT Normal:</span>
                        <span class="fw-bold text-dark">18,5 – 25,0</span>
                    </div>
                </div>
            </div>

            <div class="result-info-grid">
                <div class="result-info-item">
                    <div class="result-info-icon" style="background: rgba(13, 202, 240, 0.1); color: #0dcaf0;">
                        <i class="fa-solid fa-bullseye"></i>
                    </div>
                    <div>
                        <div class="fw-bold small">Berat Badan Ideal (BBI)</div>
                        <div class="fs-5 fw-bold text-info">${bbiFixed} <span class="small fw-normal">kg</span></div>
                        <div class="text-muted" style="font-size: 0.7rem;">Target BB sehat Anda berdasarkan rumus Broca</div>
                    </div>
                </div>

                <div class="result-info-item">
                    <div class="result-info-icon" style="background: #2ecc7110; color: #2ecc71;">
                        <i class="fa-solid fa-arrows-left-right"></i>
                    </div>
                    <div>
                        <div class="fw-bold small">Rentang Normal</div>
                        <div class="fw-bold text-success">${bbMin} - ${bbMax} <span class="small fw-normal text-muted">kg</span></div>
                        <div class="text-muted" style="font-size: 0.7rem;">Batas berat badan sehat untuk tinggi Anda</div>
                    </div>
                </div>

                <div class="result-info-item col-12">
                    <div class="result-info-icon" style="background: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'}10; color: ${cssClass === 'safe' ? '#27ae60' : cssClass === 'warning' ? '#f1c40f' : '#e74c3c'};">
                        <i class="fa-solid fa-lightbulb"></i>
                    </div>
                    <div>
                        <div class="fw-bold small">Saran Kesehatan</div>
                        <div class="text-muted small">${saran}</div>
                    </div>
                </div>

                <div class="mt-2 pt-2 border-top col-12">
                    <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.65rem;">
                        <i class="fa-solid fa-book-medical"></i>
                        <span>Sumber: Pedoman Gizi Seimbang 2014 (Kemenkes RI)</span>
                    </div>
                </div>
            </div>
        `;

        updateDashboardEntry({
            imt: {
                value: parseFloat(imtFixed),
                status: status
            }
        });

        // restore button
        imtBtn.disabled = false; 
        imtSpinner.classList.add('d-none'); 
        imtBtnLabel.textContent = 'Hitung IMT';
    }, 400);
}

// Load data dari localStorage saat halaman dimuat
function loadIMTData() {
    if (!imtBeratBadanInput || !imtTinggiBadanInput) return;

    const savedData = readStorageJSON(IMT_KEY, null);
    if (savedData && typeof savedData === 'object') {
        imtBeratBadanInput.value = savedData.berat;
        imtTinggiBadanInput.value = savedData.tinggi;
        hitungIMT(); // Hitung otomatis
    }
}

function resetIMT() {
    if (!imtBeratBadanInput || !imtTinggiBadanInput || !imtHasilEl) return;

    imtBeratBadanInput.value = '';
    imtTinggiBadanInput.value = '';
    imtHasilEl.className = 'result';
    imtHasilEl.innerHTML = '';
    localStorage.removeItem(IMT_KEY); // Hapus data dari localStorage
}


// Panggil fungsi load saat halaman dimuat
window.addEventListener('load', loadIMTData);

if (imtBeratBadanInput) {
    imtBeratBadanInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') hitungIMT();
    });
}
if (imtTinggiBadanInput) {
    imtTinggiBadanInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') hitungIMT();
    });
}



// Riwayat Tekanan Darah Logic
const RIWAYAT_KEY = 'riwayat_tensi_v1';
const DASHBOARD_KEY = 'dashboard_ringkas_v1';

function saveRiwayat(sbp, dbp, status) {
    const riwayat = readStorageJSON(RIWAYAT_KEY, []);
    const newItem = {
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        sbp,
        dbp,
        status
    };
    riwayat.unshift(newItem); // Add to top
    if (riwayat.length > 10) riwayat.pop(); // Limit to 10
    localStorage.setItem(RIWAYAT_KEY, JSON.stringify(riwayat));
    updateDashboardEntry({
        tensi: {
            sbp: sbp,
            dbp: dbp,
            status: normalizeStatusText(status)
        }
    });
    renderRiwayat();
}

function renderRiwayat() {
    const listEl = document.getElementById('listRiwayat');
    const container = document.getElementById('riwayatTekanan');
    if (!listEl || !container) return;

    const riwayat = readStorageJSON(RIWAYAT_KEY, []);
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

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDateLabel(date = new Date()) {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function normalizeStatusText(text) {
    if (!text) return '';
    return String(text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function loadDashboardEntries() {
    return readStorageJSON(DASHBOARD_KEY, {});
}

function saveDashboardEntries(entries) {
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(entries));
}

function updateDashboardEntry(partial, date = new Date()) {
    const key = getDateKey(date);
    const entries = loadDashboardEntries();
    const existing = entries[key] || { dateKey: key, dateLabel: getDateLabel(date) };
    entries[key] = {
        ...existing,
        ...partial,
        dateKey: key,
        dateLabel: existing.dateLabel || getDateLabel(date)
    };
    saveDashboardEntries(entries);
    renderDashboard();
}

function renderDashboard() {
    const summaryEl = document.getElementById('dashboardSummary');
    const chartEl = document.getElementById('dashboardChart');
    const listEl = document.getElementById('dashboardList');
    if (!summaryEl || !listEl || !chartEl) return;

    const todayKey = getDateKey();
    const yesterdayKey = getDateKey(new Date(Date.now() - 86400000));

    const entries = Object.values(loadDashboardEntries())
        .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
        .slice(0, 7);

    if (entries.length === 0) {
        summaryEl.innerHTML = '';
        chartEl.innerHTML = '';
        listEl.innerHTML = `
            <div class="dashboard-empty">
                <div class="dashboard-empty-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                <div class="dashboard-empty-title">Belum ada data 7 hari terakhir</div>
                <div class="dashboard-empty-sub">Mulai isi kalkulator Natrium, Lemak, IMT, atau Tensi untuk melihat ringkasan harian.</div>
            </div>
        `;
        return;
    }

    const natriumVals = entries.filter(e => e.natrium && typeof e.natrium.total === 'number').map(e => e.natrium.total);
    const lemakVals = entries.filter(e => e.lemak && typeof e.lemak.total === 'number').map(e => e.lemak.total);
    const imtVals = entries.filter(e => e.imt && typeof e.imt.value === 'number').map(e => e.imt.value);
    const sbpVals = entries.filter(e => e.tensi && typeof e.tensi.sbp === 'number').map(e => e.tensi.sbp);
    const dbpVals = entries.filter(e => e.tensi && typeof e.tensi.dbp === 'number').map(e => e.tensi.dbp);
    const natriumPercents = entries.filter(e => e.natrium && typeof e.natrium.percent === 'number').map(e => e.natrium.percent);
    const lemakPercents = entries.filter(e => e.lemak && typeof e.lemak.percent === 'number').map(e => e.lemak.percent);

    const avg = (arr, decimals = 0) => {
        if (!arr.length) return null;
        const sum = arr.reduce((a, b) => a + b, 0) / arr.length;
        return decimals > 0 ? Number(sum.toFixed(decimals)) : Math.round(sum);
    };

    const avgNatrium = avg(natriumVals, 0);
    const avgLemak = avg(lemakVals, 1);
    const avgImt = avg(imtVals, 1);
    const avgSbp = avg(sbpVals, 0);
    const avgDbp = avg(dbpVals, 0);

    const avgNatriumPct = avg(natriumPercents, 0);
    const avgLemakPct = avg(lemakPercents, 0);

    const bestNatrium = entries
        .filter(e => e.natrium && typeof e.natrium.percent === 'number')
        .sort((a, b) => a.natrium.percent - b.natrium.percent)[0];

    const bestLemak = entries
        .filter(e => e.lemak && typeof e.lemak.percent === 'number')
        .sort((a, b) => a.lemak.percent - b.lemak.percent)[0];

    const insightParts = [];
    if (bestNatrium) {
        insightParts.push(`Natrium terendah ada pada <strong>${bestNatrium.dateLabel}</strong> (${bestNatrium.natrium.percent}%).`);
    }
    if (bestLemak) {
        insightParts.push(`Lemak terendah ada pada <strong>${bestLemak.dateLabel}</strong> (${bestLemak.lemak.percent}%).`);
    }
    if (!insightParts.length) {
        insightParts.push('Lengkapi data natrium dan lemak untuk melihat insight terbaik minggu ini.');
    }

    summaryEl.innerHTML = `
        <div class="dashboard-summary-card dashboard-summary-primary summary-natrium">
            <div class="dashboard-summary-icon"><i class="fa-solid fa-spoon"></i></div>
            <div class="dashboard-summary-title">Rata-rata Natrium</div>
            <div class="dashboard-summary-value">${avgNatrium !== null ? `${avgNatrium} mg` : '-'}</div>
            <div class="dashboard-summary-sub">${avgNatriumPct !== null ? `${avgNatriumPct}% dari AKG` : '7 hari terakhir'}</div>
        </div>
        <div class="dashboard-summary-card dashboard-summary-primary summary-lemak">
            <div class="dashboard-summary-icon"><i class="fa-solid fa-droplet"></i></div>
            <div class="dashboard-summary-title">Rata-rata Lemak</div>
            <div class="dashboard-summary-value">${avgLemak !== null ? `${avgLemak} g` : '-'}</div>
            <div class="dashboard-summary-sub">${avgLemakPct !== null ? `${avgLemakPct}% dari AKG` : '7 hari terakhir'}</div>
        </div>
        <div class="dashboard-summary-card summary-imt">
            <div class="dashboard-summary-icon"><i class="fa-solid fa-weight-scale"></i></div>
            <div class="dashboard-summary-title">Rata-rata IMT</div>
            <div class="dashboard-summary-value">${avgImt !== null ? avgImt : '-'}</div>
            <div class="dashboard-summary-sub">7 hari terakhir</div>
        </div>
        <div class="dashboard-summary-card summary-tensi">
            <div class="dashboard-summary-icon"><i class="fa-solid fa-heart-pulse"></i></div>
            <div class="dashboard-summary-title">Rata-rata Tensi</div>
            <div class="dashboard-summary-value">${avgSbp !== null && avgDbp !== null ? `${avgSbp}/${avgDbp} mmHg` : '-'}</div>
            <div class="dashboard-summary-sub">7 hari terakhir</div>
        </div>
        <div class="dashboard-insight">
            <div class="dashboard-insight-icon"><i class="fa-solid fa-lightbulb"></i></div>
            <div>
                <div class="dashboard-insight-title">Insight Mingguan</div>
                <div class="dashboard-insight-text">${insightParts.join(' ')}</div>
            </div>
        </div>
    `;

    const safePercent = (value) => {
        if (value === null || value === undefined) return 0;
        return Math.max(0, Math.min(120, value));
    };

    chartEl.innerHTML = `
        <div class="dashboard-chart-title">Grafik Progres Natrium & Lemak (7 Hari)</div>
        ${entries.map(entry => {
            const natriumPct = entry.natrium && typeof entry.natrium.percent === 'number' ? entry.natrium.percent : null;
            const lemakPct = entry.lemak && typeof entry.lemak.percent === 'number' ? entry.lemak.percent : null;
            const label = entry.dateKey === todayKey
                ? 'Hari ini'
                : entry.dateKey === yesterdayKey
                    ? 'Kemarin'
                    : (entry.dateLabel || entry.dateKey);

            const natriumWidth = safePercent(natriumPct);
            const lemakWidth = safePercent(lemakPct);

            return `
                <div class="chart-row">
                    <div class="chart-label">${label}</div>
                    <div class="chart-bars">
                        <div style="display: flex; align-items: center;">
                            <div class="chart-bar" title="Natrium ${natriumPct !== null ? natriumPct : 0}%">
                                <div class="chart-fill natrium" style="width: ${natriumWidth}%;"></div>
                            </div>
                            <div class="chart-bar-label">${natriumPct !== null ? natriumPct + '%' : '-'}</div>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="chart-bar" title="Lemak ${lemakPct !== null ? lemakPct : 0}%">
                                <div class="chart-fill lemak" style="width: ${lemakWidth}%;"></div>
                            </div>
                            <div class="chart-bar-label">${lemakPct !== null ? lemakPct + '%' : '-'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
        <div class="chart-legend">
            <span><span class="chart-dot natrium"></span> Natrium (% AKG)</span>
            <span><span class="chart-dot lemak"></span> Lemak (% AKG)</span>
        </div>
    `;

    const toStatus = (percent) => {
        if (percent === null || percent === undefined) return 'safe';
        if (percent > 100) return 'danger';
        if (percent > 75) return 'warn';
        return 'safe';
    };

    const toBadgeClass = (status) => (status === 'danger' ? 'badge-danger' : status === 'warn' ? 'badge-warn' : status === 'safe' ? 'badge-safe' : 'badge-neutral');
    const toTimelineStatus = (status) => (status === 'danger' ? 'dashboard-status-danger' : status === 'warn' ? 'dashboard-status-warn' : 'dashboard-status-safe');

    const getImtTone = (text) => {
        const t = (text || '').toLowerCase();
        if (!t) return 'neutral';
        if (t.includes('obesitas') || t.includes('tingkat berat')) return 'danger';
        if (t.includes('gemuk') || t.includes('kelebihan') || t.includes('kurus')) return 'warn';
        if (t.includes('normal')) return 'safe';
        return 'neutral';
    };

    const getTensiTone = (text) => {
        const t = (text || '').toLowerCase();
        if (!t) return 'neutral';
        if (t.includes('hipertensi') || t.includes('krisis') || t.includes('derajat 3')) return 'danger';
        if (t.includes('normal tinggi') || t.includes('tinggi') || t.includes('derajat 2') || t.includes('derajat 1')) return 'warn';
        if (t.includes('hipotensi')) return 'warn';
        if (t.includes('normal') || t.includes('optimal')) return 'safe';
        return 'neutral';
    };

    const getShortStatus = (tone) => {
        if (tone === 'danger') return 'Bahaya';
        if (tone === 'warn') return 'Waspada';
        if (tone === 'safe') return 'Normal';
        return 'Info';
    };

    const getStatusIcon = (tone) => {
        if (tone === 'danger') return '<i class="fa-solid fa-triangle-exclamation"></i>';
        if (tone === 'warn') return '<i class="fa-solid fa-circle-exclamation"></i>';
        if (tone === 'safe') return '<i class="fa-solid fa-circle-check"></i>';
        return '<i class="fa-solid fa-circle-info"></i>';
    };

    listEl.innerHTML = entries.map(entry => {
        const hasNatrium = entry.natrium && typeof entry.natrium.total === 'number';
        const hasLemak = entry.lemak && typeof entry.lemak.total === 'number';
        const hasImt = entry.imt && typeof entry.imt.value === 'number';
        const hasTensi = entry.tensi && typeof entry.tensi.sbp === 'number' && typeof entry.tensi.dbp === 'number';

        const natriumPct = hasNatrium ? entry.natrium.percent || 0 : null;
        const lemakPct = hasLemak ? entry.lemak.percent || 0 : null;
        const natriumStatus = toStatus(natriumPct);
        const lemakStatus = toStatus(lemakPct);
        const overallStatus = natriumStatus === 'danger' || lemakStatus === 'danger'
            ? 'danger'
            : natriumStatus === 'warn' || lemakStatus === 'warn'
                ? 'warn'
                : 'safe';

        const natriumText = hasNatrium ? `${Math.round(entry.natrium.total)} mg (${natriumPct}%)` : '-';
        const lemakText = hasLemak ? `${entry.lemak.total.toFixed(1)} g (${lemakPct}%)` : '-';
        const imtStatusText = hasImt ? entry.imt.status || '' : '';
        const tensiStatusText = hasTensi ? entry.tensi.status || '' : '';
        const imtText = hasImt ? `${entry.imt.value}` : '-';
        const tensiText = hasTensi ? `${entry.tensi.sbp}/${entry.tensi.dbp} mmHg` : '-';

        const imtTone = getImtTone(imtStatusText);
        const tensiTone = getTensiTone(tensiStatusText);

        const dayLabel = entry.dateKey === todayKey
            ? 'Hari ini'
            : entry.dateKey === yesterdayKey
                ? 'Kemarin'
                : '';

        return `
            <div class="dashboard-timeline-item ${toTimelineStatus(overallStatus)}">
                <span class="dashboard-dot"></span>
                <div class="dashboard-item">
                    <div class="dashboard-date">
                        ${entry.dateLabel || entry.dateKey}
                        ${dayLabel ? `<span class="dashboard-day-tag">${dayLabel}</span>` : ''}
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <span class="dashboard-badge ${toBadgeClass(natriumStatus)}"><i class="fa-solid fa-salt-shaker"></i> Natrium: ${natriumText}</span>
                        <span class="dashboard-badge ${toBadgeClass(lemakStatus)}"><i class="fa-solid fa-droplet"></i> Lemak: ${lemakText}</span>
                    </div>
                    <div class="dashboard-detail">
                        <div class="dashboard-detail-row">
                            <span class="dashboard-badge ${toBadgeClass(imtTone)}"><i class="fa-solid fa-weight-scale"></i> IMT: ${imtText} (${getShortStatus(imtTone)}) ${getStatusIcon(imtTone)}</span>
                            <span class="dashboard-badge ${toBadgeClass(tensiTone)}"><i class="fa-solid fa-heart-pulse"></i> Tensi: ${tensiText} (${getShortStatus(tensiTone)}) ${getStatusIcon(tensiTone)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.addEventListener('load', function () {
    renderDashboard();
    const clearBtn = document.getElementById('dashboardClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirm('Hapus semua ringkasan dashboard?')) {
                localStorage.removeItem(DASHBOARD_KEY);
                renderDashboard();
            }
        });
    }
});

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
    // [REFAKTOR] Elemen DOM untuk Pengecek Tekanan Darah di-cache di sini.
    const sbpInput = document.getElementById('sbp');
    const dbpInput = document.getElementById('dbp');
    const hasilWrapperEl = document.getElementById('hasilWrapper');
    const hasilMessageEl = document.getElementById('hasilMessage');
    const cekBtn = document.getElementById('cekTekananBtn');
    const resetBtn = document.getElementById('resetTekananBtn');
    const spinner = document.getElementById('cekSpinner');
    const cekLabel = document.getElementById('cekLabel');
    const rfCheckboxes = document.querySelectorAll('.rf-check');
    const medConditionSelect = document.getElementById('medCondition');

    if (!sbpInput || !dbpInput || !cekBtn || !resetBtn || !spinner || !cekLabel || !medConditionSelect) return;

    function setLoading(loading) {
        cekBtn.disabled = loading;
        if (loading) {
            spinner.classList.remove('d-none');
            cekLabel.textContent = 'Mengecek...';
        } else {
            spinner.classList.add('d-none');
            cekLabel.textContent = 'Cek Hasil';
        }
    }

    function clearTensiInputState() {
        sbpInput.value = '';
        dbpInput.value = '';
        if (sbpValidation_v2) sbpValidation_v2.classList.add('d-none');
        if (dbpValidation_v2) dbpValidation_v2.classList.add('d-none');
        sbpInput.classList.remove('is-invalid');
        dbpInput.classList.remove('is-invalid');
    }

    function showResult(type, html) {
        if (!hasilWrapperEl || !hasilMessageEl) return;

        hasilWrapperEl.classList.remove('d-none');
        hasilMessageEl.classList.remove('d-none');
        hasilMessageEl.innerHTML = `<div class="alert alert-${type === 'error' ? 'danger' : 'info'} animate__animated animate__fadeIn">${html}</div>`;
        hasilWrapperEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    cekBtn.addEventListener('click', function () {
        const sbpVal = sbpInput.value;
        const dbpVal = dbpInput.value;
        const sbp = parseInt(sbpVal);
        const dbp = parseInt(dbpVal);

        // Reset UI state
        if (hasilWrapperEl) hasilWrapperEl.classList.add('d-none');
        if (hasilMessageEl) {
            hasilMessageEl.innerHTML = '';
            hasilMessageEl.classList.add('d-none');
        }
        ['hasilKategori', 'hasilRisiko', 'hasilInterpretasi', 'hasilDisclaimer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('d-none');
        });

        if (isNaN(sbp) || isNaN(dbp) || sbp < 30 || dbp < 30) {
            [sbpInput, dbpInput].forEach(el => {
                if (el) {
                    el.classList.add('shake');
                    setTimeout(() => el.classList.remove('shake'), 500);
                }
            });
            showResult('error', '⚠️ Harap isi SBP dan DBP dengan nilai valid (minimal 30 mmHg).');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            const sourceText = '<div class="mt-2 pt-2 border-top small text-muted">Sumber: Guidelines for the management of arterial hypertension 2018</div>';
            let kategoriTD = '';
            let teksStatus = '';

            if (sbp < 50 || dbp < 30 || sbp > 300 || dbp > 200) {
                showResult('error', '❌ <b>Data tidak valid</b><br>Nilai tekanan darah ekstrem terdeteksi. Periksa kembali alat ukur.' + sourceText);
                return;
            }

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

            const rfSelected = Array.from(document.querySelectorAll('.rf-check:checked'))
                .map(cb => cb.nextElementSibling?.querySelector('span')?.textContent?.trim())
                .filter(Boolean);
            const medCondText = medConditionSelect.options[medConditionSelect.selectedIndex]?.text || 'Tanpa kondisi penyerta';
            const medCondVal = medConditionSelect.value || 'none';
            const statusKesehatan = {
                hasHMOD: medCondVal === 'hmod',
                hasDM_NoOrganDamage: medCondVal === 'dm_no_organ',
                hasDM_OrganDamage: medCondVal === 'dm_organ',
                ckdStage: medCondVal === 'ckd_3' ? 3 : (medCondVal === 'ckd_4' ? 4 : 1),
                hasCVD: medCondVal === 'cvd'
            };
            const kategoriRisiko = klasifikasiRisikoESC2018(sbp, dbp, rfSelected.length, statusKesehatan);
            
            renderStructuredBPResult(kategoriTD, sbp, dbp, kategoriRisiko, rfSelected, medCondText);
            if (teksStatus) saveRiwayat(sbp, dbp, teksStatus);
        }, 400);
    });

    sbpInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') cekBtn.click();
    });
    dbpInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') cekBtn.click();
    });

    resetBtn.addEventListener('click', function () {
        clearTensiInputState();
        if (hasilWrapperEl) hasilWrapperEl.classList.add('d-none');
        if (hasilMessageEl) {
            hasilMessageEl.innerHTML = '';
            hasilMessageEl.classList.add('d-none');
        }
        sbpInput.focus();
        rfCheckboxes.forEach(cb => cb.checked = false);
        if (medConditionSelect) medConditionSelect.value = 'none';
    });

    window.addEventListener('pageshow', function () {
        clearTensiInputState();
    });

    // Inisialisasi
    clearTensiInputState();
    if (hasilWrapperEl) hasilWrapperEl.classList.add('d-none');
    renderRiwayat();
})();

/**
 * Mengklasifikasikan risiko kardiovaskular berdasarkan panduan ESC/ESH 2018.
 * FUNGSI: Menerima nilai tekanan darah (SBP, DBP), jumlah faktor risiko (rf), dan status komplikasi
 * untuk menentukan tingkat risiko (Rendah, Sedang, Tinggi, Sangat Tinggi).
 * ALASAN: Ini adalah implementasi langsung dari Tabel 5 dalam panduan medis tersebut,
 * penting untuk justifikasi akademis dari hasil analisis risiko.
 * @param {number} sbp - Tekanan Darah Sistolik
 * @param {number} dbp - Tekanan Darah Diastolik
 * @param {number} rf - Jumlah faktor risiko
 * @param {object} status - Objek berisi status komplikasi (HMOD, DM, CKD, CVD)
 * @returns {string} - Kategori risiko (e.g., "Risiko Tinggi")
 */
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
            <span style="font-size: 0.8rem"><strong>Catatan:</strong> Hasil ini merupakan saran medis. Silakan konsultasi ke fasilitas kesehatan untuk diagnosis medis resmi.</span>
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
        recommendations.push('<strong>Segera pergi ke Unit Gawat Darurat (UGD) atau konsultasikan ke dokter sekarang juga!</strong>');
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
