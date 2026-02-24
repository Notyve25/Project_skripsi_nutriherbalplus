// Navbar Logic: Active State & Auto Close (Mobile)
const navLinks = document.querySelectorAll('.nav-link');
const navbarCollapse = document.querySelector('.navbar-collapse');
const navbarToggler = document.querySelector('.navbar-toggler');

// Reset data kalkulator + progres perjalanan saat rilis GitHub (sekali per versi)
document.addEventListener('DOMContentLoaded', function () {
    const isGitHubHost = /(^|\.)github\.io$/i.test(window.location.hostname);
    if (!isGitHubHost) return;

    const releaseResetKey = 'nutri_release_fresh_state_v1.0.1';
    const resetPrefixes = ['kalkulator_', 'riwayat_', 'dashboard_', 'nutri_', 'video_'];

    try {
        if (localStorage.getItem(releaseResetKey) === 'done') return;

        Object.keys(localStorage).forEach((key) => {
            if (key === releaseResetKey) return;
            if (resetPrefixes.some((prefix) => key.startsWith(prefix))) {
                localStorage.removeItem(key);
            }
        });

        localStorage.removeItem('nutri_watchlist_v1');
        localStorage.removeItem('nutri_watched_v1');
        localStorage.setItem(releaseResetKey, 'done');
    } catch (error) {
        // Ignore storage access issue.
    }
});

// Intro gate: user baru diarahkan ke halaman pembuka sebelum beranda
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
    if (currentPage !== 'awal.html') return;

    const introKey = 'nutri_intro_seen_v1';
    let hasSeenIntro = false;
    try {
        hasSeenIntro = localStorage.getItem(introKey) === 'seen';
    } catch (error) {
        hasSeenIntro = false;
    }

    if (!hasSeenIntro) {
        window.location.replace('starting.html');
    }
});

// Track visited pages for beranda progress widget
document.addEventListener('DOMContentLoaded', function () {
    const visitKey = 'nutri_visited_pages_v1';
    const trackedPages = ['awal.html', 'index.html', 'kalkulator.html', 'vid.html', 'grafik.html'];
    const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();

    if (!trackedPages.includes(currentPage)) return;

    let visited = [];
    try {
        visited = JSON.parse(localStorage.getItem(visitKey) || '[]');
    } catch (error) {
        visited = [];
    }

    if (!visited.includes(currentPage)) {
        visited.push(currentPage);
        localStorage.setItem(visitKey, JSON.stringify(visited));
    }
});

// Guided tour (first visit per page)
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = (window.location.pathname.split('/').pop() || 'awal.html').toLowerCase();
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const tourPageOrder = ['awal.html', 'index.html', 'kalkulator.html', 'vid.html', 'grafik.html'];
    const tourConfig = {
        'awal.html': [
            { selector: '.overlay', title: 'Selamat datang di Nutri Herbal', text: 'Platform ini dirancang untuk membantu Anda memahami hipertensi, memeriksa kondisi kesehatan, menghitung asupan natrium dan lemak, serta memantau progres kesehatan secara mandiri.' },
            { selector: '.quick-start-card', title: 'Mulai dari sini', text: 'Ikuti alur penggunaan yang disarankan: mulai dari Informasi, lanjut ke Kalkulator, kemudian Video Edukasi agar proses pembelajaran lebih terstruktur.' },
            { selector: '#visitProgressCard', title: 'Pantau progres kunjungan', text: 'Kartu ini menampilkan progres halaman yang telah Anda pelajari untuk membantu memantau aktivitas edukasi Anda' },
            { selector: '.fitur-section .fitur-card', title: 'Akses fitur utama', text: 'Bagian ini menyediakan akses langsung ke fitur utama sesuai kebutuhan pemantauan dan edukasi kesehatan Anda.' },
            { selector: '#accordionFAQ', title: 'Buka FAQ cepat', text: 'Jika masih terdapat hal yang belum dipahami, silakan lihat pertanyaan yang sering diajukan sebelum menggunakan fitur lanjutan.' },
            { selector: '.fitur-card', title: 'Siap mulai?', text: 'Pilih salah satu fitur untuk mulai menggunakan Nutri Herbal sebagai pendukung perjalanan kesehatan Anda.' }
        ],
        'index.html': [
            { selector: '.hero-content', title: 'Halaman Informasi', text: 'Halaman ini menyajikan informasi edukatif mengenai hipertensi sebagai dasar pemahaman sebelum melakukan pemantauan kesehatan.' },
            { selector: '.quick-summary-card', title: 'Mulai dari informasi inti', text: 'Bacalah ringkasan singkat ini untuk memahami poin penting mengenai hipertensi secara cepat dan ringkas.' },
            { selector: '.quick-nav-wrap', title: 'Gunakan navigasi cepat', text: 'Gunakan navigasi ini untuk langsung menuju topik yang ingin Anda pelajari tanpa perlu menggulir halaman terlalu panjang.' },
            { selector: '.references-accordion', title: 'Referensi sumber', text: 'Seluruh materi didukung oleh referensi ilmiah guna memastikan informasi yang disampaikan bersifat akurat dan kredibel.' },
            { selector: '#faq-informasi', title: 'FAQ informasi', text: 'Temukan jawaban atas pertanyaan umum terkait materi hipertensi pada bagian ini.' },
            { selector: '.nav-link[href="kalkulator.html"]', title: 'Lanjut ke Kalkulator', text: 'Setelah memahami materi dasar, lanjutkan ke halaman kalkulator untuk mengevaluasi asupan harian Anda.' }
        ],
        'kalkulator.html': [
            { selector: '.quick-access-bar', title: 'Pakai menu pintas', text: 'Gunakan menu pintas ini untuk mengakses perhitungan Natrium, Lemak, IMT, dan Tekanan Darah dengan lebih cepat.' },
            { selector: '#dashboard-ringkas', title: 'Dashboard ringkas', text: 'Dashboard ini merangkum hasil pemantauan kesehatan Anda selama tujuh hari terakhir secara sederhana dan informatif.' },
            { selector: '#kalkulator-natrium', title: 'Mulai dari Natrium', text: 'Masukkan data konsumsi makanan dalam 24 jam terakhir untuk mengetahui estimasi asupan natrium harian dan tingkat risikonya.' },
            { selector: '#selectedFoodSummaryNatrium', title: 'Ringkasan pilihan makanan', text: 'Bagian ini menampilkan rekap makanan yang telah Anda pilih untuk memudahkan evaluasi konsumsi' },
            { selector: '#kalkulator-lemak', title: 'Lanjut cek Lemak', text: 'Periksa asupan lemak harian Anda dan bandingkan dengan kebutuhan yang dianjurkan.' },
            { selector: '#kalkulator-imt', title: 'Cek IMT', text: 'Hitung Indeks Massa Tubuh (IMT) untuk mengetahui status berat badan Anda saat ini.' },
            { selector: '#cek-tensi', title: 'Cek tekanan darah', text: 'Masukkan nilai sistolik dan diastolik untuk mengetahui klasifikasi tekanan darah Anda.' }
        ],
        'vid.html': [
            { selector: '#videoSearch', title: 'Cari video edukasi', text: 'Gunakan kolom pencarian untuk menemukan video edukasi sesuai topik yang Anda butuhkan.' },
            { selector: '.playlist-quick', title: 'Pilih playlist topik', text: 'Pilih playlist berdasarkan topik agar video yang ditampilkan lebih relevan.”' },
            { selector: '#videosGrid .video-card', title: 'Putar video edukasi', text: 'Klik tampilan video untuk mulai menonton materi edukasi kesehatan.' },
            { selector: '#videosGrid .watchlist-btn', title: 'Simpan ke watchlist', text: 'Simpan video yang dianggap penting agar dapat ditonton kembali di lain waktu.' },
            { selector: '#chipsWrap', title: 'Saring video lebih cepat', text: 'Gunakan filter topik untuk mempermudah pencarian video sesuai kebutuhan Anda.' }
        ],
        'grafik.html': [
            { selector: '.stat-card', title: 'Lihat ringkasan statistik', text: 'Kartu statistik ini menampilkan informasi utama secara ringkas dan mudah dipahami.' },
            { selector: '#chart-keluhan-kesehatan', title: 'Lihat data utama', text: 'Grafik ini menunjukkan perbandingan persentase kasus kesehatan antar wilayah.' },
            { selector: '#grafikInsightBox', title: 'Baca insight otomatis', text: 'Bagian ini menyajikan ringkasan interpretasi data untuk membantu pemahaman tanpa analisis yang kompleks.' },
            { selector: '#downloadInsightBtn', title: 'Unduh insight', text: 'GGunakan tombol ini untuk mengunduh ringkasan insight sebagai bahan catatan atau dokumentasi.' },
            { selector: '.accordion-button', title: 'Buka tabel rinci', text: 'Buka tabel ini untuk melihat data secara lebih detail berdasarkan wilayah.' },
            { selector: '.cta-section', title: 'Lanjut ke tindakan', text: 'Setelah memahami data, lanjutkan ke halaman kalkulator untuk mengevaluasi kondisi kesehatan pribadi Anda.' }
        ]
    };

    const steps = tourConfig[currentPage];
    if (!steps || !steps.length) return;

    const storageKey = `nutri_tour_seen_${currentPage}_v1`;
    try {
        if (localStorage.getItem(storageKey) === 'seen') return;
    } catch (error) {
        // Ignore storage access issue.
    }

    const availableSteps = steps.filter((step) => document.querySelector(step.selector));
    if (!availableSteps.length) return;

    let stepIndex = 0;
    let activeTarget = null;

    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    overlay.innerHTML = `
        <div class="tour-card" role="dialog" aria-live="polite" aria-label="Panduan halaman">
            <div class="tour-progress"></div>
            <h5 class="tour-title mb-2"></h5>
            <p class="tour-text mb-3"></p>
            <div class="tour-actions">
                <button type="button" class="btn btn-outline-secondary btn-sm tour-skip">Lewati</button>
                <button type="button" class="btn btn-success btn-sm tour-next">Lanjut</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const titleEl = overlay.querySelector('.tour-title');
    const textEl = overlay.querySelector('.tour-text');
    const progressEl = overlay.querySelector('.tour-progress');
    const nextBtn = overlay.querySelector('.tour-next');
    const skipBtn = overlay.querySelector('.tour-skip');

    function clearActiveTarget() {
        if (!activeTarget) return;
        activeTarget.classList.remove('tour-target-active');
        activeTarget = null;
    }

    function markSeen() {
        try {
            localStorage.setItem(storageKey, 'seen');
        } catch (error) {
            // Ignore storage access issue.
        }
    }

    function getNextTourPage() {
        const currentIndex = tourPageOrder.indexOf(currentPage);
        if (currentIndex === -1) return '';
        return tourPageOrder[currentIndex + 1] || '';
    }

    function finishTour(shouldNavigateNext) {
        clearActiveTarget();
        markSeen();

        overlay.classList.add('is-hide');
        setTimeout(() => {
            if (overlay.parentElement) overlay.remove();

            if (shouldNavigateNext) {
                const nextPage = getNextTourPage();
                if (nextPage) {
                    window.location.href = nextPage;
                }
            }
        }, 220);
    }

    function renderStep() {
        const step = availableSteps[stepIndex];
        if (!step) {
            finishTour();
            return;
        }

        clearActiveTarget();
        const target = document.querySelector(step.selector);
        if (!target) {
            stepIndex += 1;
            renderStep();
            return;
        }

        activeTarget = target;
        activeTarget.classList.add('tour-target-active');
        activeTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });

        titleEl.textContent = step.title;
        textEl.textContent = step.text;
        progressEl.textContent = `Langkah ${stepIndex + 1} dari ${availableSteps.length}`;
        nextBtn.textContent = stepIndex === availableSteps.length - 1 ? 'Selesai' : 'Lanjut';
    }

    nextBtn.addEventListener('click', function () {
        const isLastStep = stepIndex >= availableSteps.length - 1;
        if (isLastStep) {
            finishTour(true);
            return;
        }

        stepIndex += 1;
        renderStep();
    });

    skipBtn.addEventListener('click', function () {
        finishTour(false);
    });
    document.addEventListener('keydown', function onEsc(event) {
        if (event.key === 'Escape') {
            finishTour(false);
            document.removeEventListener('keydown', onEsc);
        }
    });

    renderStep();
});

// Floating button untuk tour (semua halaman)
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = (window.location.pathname.split('/').pop() || 'awal.html').toLowerCase();
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'tour-replay-fab-global';
    replayBtn.setAttribute('aria-label', 'Tour halaman ini');
    replayBtn.title = 'Tour';
    replayBtn.innerHTML = '<i class="fa-solid fa-route"></i><span>Tour</span>';

    let compactTimer = null;
    let revealTimer = null;

    function setCompact() {
        replayBtn.classList.add('is-compact');
    }

    function setExpandedTemporarily() {
        if (isMobileViewport) {
            setCompact();
            return;
        }
        replayBtn.classList.remove('is-compact');
        if (compactTimer) clearTimeout(compactTimer);
        compactTimer = setTimeout(setCompact, 2200);
    }

    function startAutoCompactCycle() {
        if (isMobileViewport) {
            setCompact();
            return;
        }
        setExpandedTemporarily();
        if (revealTimer) clearInterval(revealTimer);
        revealTimer = setInterval(setExpandedTemporarily, 9000);
    }

    replayBtn.addEventListener('click', function () {
        try {
            localStorage.removeItem(`nutri_tour_seen_${currentPage}_v1`);
        } catch (error) {
            // Ignore storage access issue.
        }
        window.location.reload();
    });

    replayBtn.addEventListener('mouseenter', setExpandedTemporarily);
    replayBtn.addEventListener('focus', setExpandedTemporarily);
    if (!isMobileViewport) {
        replayBtn.addEventListener('touchstart', setExpandedTemporarily, { passive: true });
    }

    document.body.appendChild(replayBtn);
    startAutoCompactCycle();
});

// Fungsi untuk menutup navbar secara instan (reset state)
function resetNavbarState() {
    if (navbarCollapse) navbarCollapse.classList.remove('show');
    if (navbarToggler) {
        navbarToggler.classList.add('collapsed');
        navbarToggler.setAttribute('aria-expanded', 'false');
    }
}

// Fungsi untuk menutup navbar dengan animasi (saat klik)
function closeNavbarSmoothly() {
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
        } else {
            resetNavbarState();
        }
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', function () {
        // Update Active State
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // Auto Close Hamburger Menu on Click (Agar tidak stuck saat pindah halaman)
        closeNavbarSmoothly();
    });
});

// Close Navbar when clicking outside
document.addEventListener('click', function (event) {
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        // Jika klik di luar menu dan bukan di tombol toggler
        if (!navbarCollapse.contains(event.target) && (!navbarToggler || !navbarToggler.contains(event.target))) {
            closeNavbarSmoothly();
        }
    }
});

// 2. Preloader Logic
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hide');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 600); // Delay sedikit agar transisi halus
    }
});

// 3. Scroll Effects (Navbar & Back to Top)
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        // Navbar Glassmorphism
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to Top Visibility
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    });

    // Back to Top Click Action
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optional: stop observing once revealed
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));
    }
});

// 5. Health Tip Widget Logic
const tipsKesehatan = [
    "Kurangi asupan garam hingga kurang dari 5 gram (1 sendok teh) per hari.",
    "Perbanyak makan sayur dan buah-buahan setiap hari.",
    "Lakukan aktivitas fisik minimal 30 menit setiap hari.",
    "Hindari merokok dan paparan asap rokok.",
    "Cek tekanan darah secara rutin di fasilitas kesehatan.",
    "Kelola stres dengan baik melalui relaksasi atau hobi.",
    "Batasi konsumsi makanan olahan dan cepat saji.",
    "Jaga berat badan ideal untuk mengurangi beban kerja jantung.",
    "Kurangi konsumsi kafein jika Anda sensitif terhadapnya.",
    "Tidur yang cukup (7-8 jam) membantu menjaga tekanan darah stabil.",
    "Konsumsi makanan kaya kalium seperti pisang, alpukat, dan bayam.",
    "Baca label nutrisi pada kemasan makanan untuk memantau kadar natrium.",
    "Ganti camilan asin dengan buah segar atau kacang-kacangan tanpa garam.",
    "Minum air putih yang cukup, minimal 8 gelas sehari.",
    "kurangi makan - makanan tinggi lemak karena dapat memperberat kerja jantung"
];
const tipWidget = document.getElementById('dailyHealthTip');

// Cek apakah user sudah menutup widget di sesi ini
if (tipWidget && !sessionStorage.getItem('healthTipClosed')) {
    const randomTip = tipsKesehatan[Math.floor(Math.random() * tipsKesehatan.length)];
    tipWidget.className = 'health-tip-widget d-flex align-items-start';
    tipWidget.innerHTML = `
        <div class="health-tip-icon"><i class="fa-solid fa-lightbulb"></i></div>
        <div class="health-tip-content flex-grow-1 pe-3">
            <h6>Tips Sehat Hari Ini</h6>
            <p>${randomTip}</p>
        </div>
        <button class="health-tip-close" id="btnCloseTip" title="Tutup Permanen (Sesi Ini)"><i class="fa-solid fa-xmark"></i></button>
    `;

    // Event listener untuk menutup dan menyimpan status ke sessionStorage
    document.getElementById('btnCloseTip').addEventListener('click', function () {
        sessionStorage.setItem('healthTipClosed', 'true');
        tipWidget.style.transition = 'opacity 0.3s, transform 0.3s';
        tipWidget.style.opacity = '0';
        tipWidget.style.transform = 'translateY(-10px)';
        setTimeout(() => tipWidget.remove(), 300);
    });
}

// 6. Page Transition Logic (Fade In/Out)
window.addEventListener('pageshow', function (event) {
    // Fix untuk tombol back browser (bfcache) agar halaman tidak stuck di opacity 0
    if (event.persisted) {
        document.body.classList.remove('fade-out');
    }

    // Fix: Pastikan navbar selalu tertutup (reset) saat halaman tampil (load/back/forward)
    resetNavbarState();
});

document.addEventListener('DOMContentLoaded', function () {
    // Pastikan halaman muncul (fade in) saat dimuat
    document.body.classList.remove('fade-out');

    // Tambahkan efek fade out saat link navigasi diklik
    const transitionLinks = document.querySelectorAll('.nav-link, .navbar-brand, .cta-button, .back-home-float a');

    transitionLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            // Abaikan link hash (#), mailto, atau tab baru
            if (!target || target.startsWith('#') || target.startsWith('mailto:') || this.target === '_blank') return;

            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => window.location.href = target, 400); // Sesuaikan dengan durasi CSS (0.4s)
        });
    });
});

// 7. WhatsApp Tooltip Logic
document.addEventListener('DOMContentLoaded', function () {
    const waFloat = document.querySelector('.whatsapp-float');
    // Cek apakah tooltip sudah pernah ditampilkan di sesi ini
    if (waFloat && !sessionStorage.getItem('waTooltipShown')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'whatsapp-tooltip';
        tooltip.textContent = 'Halo, ada yang bisa kami bantu?';
        waFloat.appendChild(tooltip);

        // Tampilkan setelah delay singkat (1.5 detik)
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 1500);

        // Hilangkan otomatis setelah 6 detik
        setTimeout(closeTooltip, 7500);

        // Hilangkan jika user hover ke tombol WA
        waFloat.addEventListener('mouseenter', closeTooltip);

        function closeTooltip() {
            tooltip.classList.remove('show');
            sessionStorage.setItem('waTooltipShown', 'true');
            setTimeout(() => tooltip.remove(), 500); // Hapus dari DOM setelah transisi
        }
    }
});

// 8. WhatsApp Bounce Animation Logic
document.addEventListener('DOMContentLoaded', function () {
    const waBtn = document.querySelector('.whatsapp-float a');
    if (waBtn) {
        setInterval(() => {
            waBtn.classList.add('whatsapp-bounce');
            // Hapus class setelah animasi selesai (1 detik) agar bisa dipicu ulang
            setTimeout(() => {
                waBtn.classList.remove('whatsapp-bounce');
            }, 1000);
        }, 30000); // Setiap 30 detik
    }
});

// 9. Custom Smooth Scroll (Slower & Elegant)
document.addEventListener('DOMContentLoaded', function () {
    // Pilih semua link anchor yang bukan hanya '#'
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault(); // Matikan scroll default browser yang terlalu cepat

                // Hitung posisi target dikurangi tinggi navbar (80px) agar tidak tertutup
                const navbarHeight = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = 1200; // 1.2 detik (lebih lambat & elegan)
                let startTime = null;

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);

                    // Easing function: easeInOutQuart (Sangat halus: pelan di awal & akhir, cepat di tengah)
                    const ease = progress < 0.5 ? 8 * progress * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 4) / 2;

                    window.scrollTo(0, startPosition + (distance * ease));

                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    } else {
                        // Update fokus untuk aksesibilitas setelah scroll selesai
                        targetElement.focus();
                        if (document.activeElement !== targetElement) {
                            targetElement.setAttribute('tabindex', '-1');
                            targetElement.focus();
                        }
                    }
                }

                requestAnimationFrame(animation);
            }
        });
    });
});