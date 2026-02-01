// Slider Script dengan Dots
(function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.querySelector('.slider-dots');

    if (!slides.length || !dotsContainer) return;

    // Buat dots
    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showSlide(idx));
        dotsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll('.slider-dot');

    function showSlide(idx) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = idx;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Fitur Swipe untuk Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderContainer = document.querySelector('.hero-slider');

    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) showSlide((currentSlide + 1) % slides.length); // Next
        if (touchEndX > touchStartX + 50) showSlide((currentSlide - 1 + slides.length) % slides.length); // Prev
    }

    // Auto slide
    setInterval(() => {
        let nextSlide = (currentSlide + 1) % slides.length;
        showSlide(nextSlide);
    }, 5000);
})();

// Typing Effect untuk Judul Hero
document.addEventListener('DOMContentLoaded', function() {
    const typeWriterElement = document.getElementById('typewriter');
    const subtitleElement = document.getElementById('typewriter-subtitle');
    const cursorElement = document.querySelector('.typing-cursor');
    if (!typeWriterElement || !cursorElement) return;

    const textSegments = [
        { text: "Selamat Datang di ", color: "#ffffff" },
        { text: "Nutri Herbal PLus+", color: "#1effec" }
    ];
    const subtitleText = "Mari cegah hipertensi sedari dini, karena sehat mulai dari diri sendiri.";

    // Cek jika animasi sudah berjalan di sesi ini
    if (sessionStorage.getItem('typingAnimationDone')) {
        typeWriterElement.innerHTML = `<span style="color:${textSegments[0].color}">${textSegments[0].text}</span><span style="color:${textSegments[1].color}">${textSegments[1].text}</span>`;
        if (subtitleElement) subtitleElement.textContent = subtitleText;
        cursorElement.style.display = 'none'; // Sembunyikan kursor jika tidak ada animasi
        return;
    }

    let segmentIndex = 0;
    let charIndex = 0;
    const typingSpeed = 100; // ms per karakter

    function type() {
        if (segmentIndex < textSegments.length) {
            // Buat span baru jika baru mulai segmen (untuk handle warna berbeda)
            if (charIndex === 0) {
                const span = document.createElement('span');
                span.style.color = textSegments[segmentIndex].color;
                typeWriterElement.appendChild(span);
            }

            const currentSpan = typeWriterElement.children[segmentIndex];
            currentSpan.textContent += textSegments[segmentIndex].text.charAt(charIndex);
            charIndex++;

            if (charIndex >= textSegments[segmentIndex].text.length) {
                segmentIndex++;
                charIndex = 0;
            }
            setTimeout(type, typingSpeed);
        } else if (subtitleElement) {
            // Mulai mengetik subtitle setelah judul selesai
            setTimeout(typeSubtitle, 300);
        }
    }

    let subIndex = 0;
    function typeSubtitle() {
        if (subIndex < subtitleText.length) {
            subtitleElement.textContent += subtitleText.charAt(subIndex);
            subIndex++;
            setTimeout(typeSubtitle, 40); // Kecepatan mengetik subtitle sedikit lebih cepat
        } else {
            // Tandai bahwa animasi sudah selesai untuk sesi ini
            sessionStorage.setItem('typingAnimationDone', 'true');
        }
    }

    // Mulai mengetik setelah delay singkat (1 detik) agar animasi masuk selesai dulu
    setTimeout(type, 1000);
});
