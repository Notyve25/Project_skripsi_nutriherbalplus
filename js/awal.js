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
    
    if (!typeWriterElement) return;

    const textSegments = [
        { text: "Selamat Datang di ", color: "#ffffff" },
        { text: "Nutri Herbal PLus+", color: "#ffd700" }
    ];
    const subtitleText = "Mari cegah hipertensi sedari dini, karena sehat mulai dari diri sendiri.";

    if (cursorElement) cursorElement.style.display = 'none';

    typeWriterElement.innerHTML = '';
    if (subtitleElement) subtitleElement.textContent = '';

    let segmentIndex = 0;
    let charIndex = 0;

    function showButtons() {
        ctaButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('show');
            }, index * 140);
        });
    }

    function typeSubtitle() {
        if (!subtitleElement) {
            showButtons();
            return;
        }

        let subtitleIndex = 0;
        function tickSubtitle() {
            if (subtitleIndex < subtitleText.length) {
                subtitleElement.textContent += subtitleText.charAt(subtitleIndex);
                subtitleIndex++;
                setTimeout(tickSubtitle, 38);
            } else {
                showButtons();
            }
        }

        tickSubtitle();
    }

    function typeTitle() {
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

            setTimeout(typeTitle, 85);
        } else {
            setTimeout(typeSubtitle, 250);
        }
    }

    typeTitle();

});
