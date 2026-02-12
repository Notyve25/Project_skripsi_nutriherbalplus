// Slider Script dengan Dots
(function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".hero-slider .slide");
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
    const ctaButtons = document.querySelectorAll('.cta-button');
    
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
        cursorElement.style.display = 'none';
        ctaButtons.forEach(btn => btn.classList.add('show'));
        return;
    }

    let segmentIndex = 0;
    let charIndex = 0;
    
    function type() {
        if (segmentIndex < textSegments.length) {
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
            
            // Variasikan kecepatan mengetik agar terasa lebih natural (antara 50ms - 150ms)
            const randomSpeed = Math.floor(Math.random() * 100) + 50;
            setTimeout(type, randomSpeed);
        } else if (subtitleElement) {
            setTimeout(typeSubtitle, 500);
        }
    }

    let subIndex = 0;
    function typeSubtitle() {
        if (subIndex < subtitleText.length) {
            subtitleElement.textContent += subtitleText.charAt(subIndex);
            subIndex++;
            
            // Subtitle diketik sedikit lebih cepat dan tetap natural
            const randomSubSpeed = Math.floor(Math.random() * 40) + 20;
            setTimeout(typeSubtitle, randomSubSpeed);
        } else {
            showButtons();
        }
    }

    function showButtons() {
        ctaButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('show');
            }, index * 200); // Muncul bergantian
        });

        // Tandai selesai
        sessionStorage.setItem('typingAnimationDone', 'true');
        
        // Sembunyikan kursor setelah jeda singkat
        setTimeout(() => {
            if (cursorElement) cursorElement.style.opacity = '0';
        }, 1500);
    }

    // Reset teks dan kursor sebelum memulai
    typeWriterElement.innerHTML = '';
    if (subtitleElement) subtitleElement.textContent = '';
    cursorElement.style.display = ''; // Pastikan kursor terlihat

    // Mulai mengetik
    type();
});
