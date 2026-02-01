// Navbar Active State
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function () {
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// 2. Preloader Logic
window.addEventListener('load', function() {
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

// 3. Scroll Top Logic
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

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
    "Minum air putih yang cukup, minimal 8 gelas sehari."
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
    document.getElementById('btnCloseTip').addEventListener('click', function() {
        sessionStorage.setItem('healthTipClosed', 'true');
        tipWidget.style.transition = 'opacity 0.3s, transform 0.3s';
        tipWidget.style.opacity = '0';
        tipWidget.style.transform = 'translateY(-10px)';
        setTimeout(() => tipWidget.remove(), 300);
    });
}

// 6. Page Transition Logic (Fade In/Out)
window.addEventListener('pageshow', function(event) {
    // Fix untuk tombol back browser (bfcache) agar halaman tidak stuck di opacity 0
    if (event.persisted) {
        document.body.classList.remove('fade-out');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Pastikan halaman muncul (fade in) saat dimuat
    document.body.classList.remove('fade-out');

    // Tambahkan efek fade out saat link navigasi diklik
    const transitionLinks = document.querySelectorAll('.nav-link, .navbar-brand, .cta-button, .back-home-float a');
    
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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
document.addEventListener('DOMContentLoaded', function() {
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
document.addEventListener('DOMContentLoaded', function() {
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
document.addEventListener('DOMContentLoaded', function() {
    // Pilih semua link anchor yang bukan hanya '#'
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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