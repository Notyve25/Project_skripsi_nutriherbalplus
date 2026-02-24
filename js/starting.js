(function () {
    const introKey = 'nutri_intro_seen_v1';
    const continueBtn = document.getElementById('btnStartContinue');
    const loadingMask = document.getElementById('startingLoading');
    const loadingDelayMs = 900;

    function markIntroSeen() {
        try {
            localStorage.setItem(introKey, 'seen');
        } catch (error) {
            // ignore
        }
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', function () {
            continueBtn.disabled = true;
            continueBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Memuat...</span>';
            document.body.classList.add('is-loading');
            if (loadingMask) {
                loadingMask.setAttribute('aria-hidden', 'false');
            }
            markIntroSeen();
            window.setTimeout(function () {
                window.location.href = 'awal.html';
            }, loadingDelayMs);
        });
    }
})();
