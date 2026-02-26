(function () {
    const modalContainer = document.getElementById('videoContainer');
    const videoModalEl = document.getElementById('videoModal');
    if (!modalContainer || !videoModalEl || typeof bootstrap === 'undefined') return;

    const modal = new bootstrap.Modal(videoModalEl);
    const watchlistKey = 'nutri_watchlist_v1';
    const watchedKey = 'nutri_watched_history_v1';

    /* open player modal with iframe */
    function openVideo(id) {
        modalContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="Video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        modal.show();
        
        // Handler saat modal ditutup
        videoModalEl.addEventListener('hidden.bs.modal', () => {
            modalContainer.innerHTML = '';
            // Reset orientasi layar (unlock)
            if (screen.orientation && screen.orientation.unlock) {
                try { screen.orientation.unlock(); } catch (e) {}
            }
            // Keluar dari fullscreen jika masih aktif
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                try {
                    if (document.exitFullscreen) document.exitFullscreen();
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                } catch (e) {}
            }
        }, { once: true });

        // Auto Fullscreen & Landscape (Coba segera agar dianggap User Gesture)
        const requestFS = videoModalEl.requestFullscreen || 
                        videoModalEl.webkitRequestFullscreen || 
                        videoModalEl.mozRequestFullScreen || 
                        videoModalEl.msRequestFullscreen;

        if (requestFS) {
            const enterFS = () => {
                Promise.resolve(requestFS.call(videoModalEl)).then(() => {
                    // Jika sukses fullscreen, kunci orientasi (Android/Mobile)
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => {});
                    }
                }).catch(() => {});
            };

            // Coba 1: Langsung (User Gesture aktif)
            enterFS();

            // Coba 2: Fallback saat modal tampil (jika Coba 1 gagal karena elemen belum siap)
            videoModalEl.addEventListener('shown.bs.modal', () => {
                if (!document.fullscreenElement && !document.webkitFullscreenElement) enterFS();
            }, { once: true });
        }

        // Tandai sebagai sudah ditonton
        markAsWatched(id);
    }

    /* delegated interactions (play, share, save) */
    document.body.addEventListener('click', function (e) {
        // play
        const poster = e.target.closest('.video-poster');
        if (poster) {
            const id = poster.getAttribute('data-video-id');
            if (id) openVideo(id);
            return;
        }
        // share
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            const id = shareBtn.getAttribute('data-video-id');
            const url = `https://www.youtube.com/watch?v=${id}`;
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url
                }).catch(() => { /* ignore */ });
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    const prev = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fa-solid fa-check"></i> Disalin';
                    setTimeout(() => shareBtn.innerHTML = prev, 1400);
                }).catch(() => { /* ignore */ });
            } else {
                window.prompt('Salin tautan video ini:', url);
            }
            return;
        }
        // watchlist toggle
        const saveBtn = e.target.closest('.watchlist-btn');
        if (saveBtn) {
            const id = saveBtn.getAttribute('data-video-id');
            toggleWatchlist(id, saveBtn);
            return;
        }
        // tag chip click
        const chip = e.target.closest('.tag');
        if (chip) {
            const text = chip.textContent.trim();
            clearPlaylistActive();
            filterByTag(text);
            return;
        }
        // quick playlist topic button
        const playlistBtn = e.target.closest('.playlist-btn');
        if (playlistBtn) {
            const topic = playlistBtn.getAttribute('data-topic');
            setPlaylistActive(playlistBtn);
            filterByTopic(topic);
        }
    });

    /* search (title + tags) */
    const videoSearchInput = document.getElementById('videoSearch');
    if (videoSearchInput) videoSearchInput.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        document.querySelectorAll('#videosGrid > .col').forEach(col => {
            const title = (col.getAttribute('data-title') || '').toLowerCase();
            const tags = (col.getAttribute('data-tags') || '').toLowerCase();
            col.style.display = q && !(title.includes(q) || tags.includes(q)) ? 'none' : '';
        });
    });

    /* tag chips (collect unique tags) */
    function initChips() {
        const chipsWrap = document.getElementById('chipsWrap');
        if (!chipsWrap) return;
        const tags = new Set();
        document.querySelectorAll('#videosGrid > .col').forEach(col => {
            const t = (col.getAttribute('data-tags') || '').split(',').map(x => x.trim()).filter(Boolean);
            t.forEach(x => tags.add(x));
        });
        chipsWrap.innerHTML = '';
        ['Semua', 'Belum Ditonton', ...Array.from(tags)].forEach(t => {
            const el = document.createElement('button');
            el.className = 'chip';
            el.type = 'button';
            el.textContent = t === 'Semua' ? 'Semua' : capitalize(t);
            if (t === 'Semua') el.classList.add('active');
            el.addEventListener('click', () => {
                chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                el.classList.add('active');
                clearPlaylistActive();
                if (t === 'Semua') showAll();
                else if (t === 'Belum Ditonton') filterUnwatched();
                else filterByTag(t);
            });
            chipsWrap.appendChild(el);
        });
    }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function showAll() {
        document.querySelectorAll('#videosGrid > .col').forEach(c => c.style.display = '');
        if (videoSearchInput) videoSearchInput.value = '';
    }

    function filterByTag(tag) {
        const q = tag.toLowerCase();
        document.querySelectorAll('#videosGrid > .col').forEach(col => {
            const tags = (col.getAttribute('data-tags') || '').toLowerCase();
            col.style.display = tags.includes(q) ? '' : 'none';
        });
        // highlight chip if present
        document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.textContent.toLowerCase() === tag.toLowerCase()));
    }

    function filterUnwatched() {
        const watched = loadWatched();
        document.querySelectorAll('#videosGrid > .col').forEach(col => {
            const poster = col.querySelector('.video-poster');
            const id = poster ? poster.getAttribute('data-video-id') : '';
            col.style.display = !watched.includes(id) ? '' : 'none';
        });
        if (videoSearchInput) videoSearchInput.value = '';
    }

    function filterByTopic(topic) {
        const q = (topic || '').toLowerCase();
        const topicMap = {
            garam: ['garam', 'lemak', 'gula']
        };
        const relatedTags = topicMap[q] || [q];

        document.querySelectorAll('#videosGrid > .col').forEach(col => {
            const tags = (col.getAttribute('data-tags') || '').toLowerCase();
            const isMatch = relatedTags.some(tag => tags.includes(tag));
            col.style.display = isMatch ? '' : 'none';
        });

        if (videoSearchInput) videoSearchInput.value = '';
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    }

    function setPlaylistActive(activeButton) {
        document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
        if (activeButton) activeButton.classList.add('active');
    }

    function clearPlaylistActive() {
        document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
    }

    /* watchlist localStorage */
    function loadWatchlist() { try { return JSON.parse(localStorage.getItem(watchlistKey) || '[]'); } catch { return []; } }
    function saveWatchlist(list) { localStorage.setItem(watchlistKey, JSON.stringify(list)); renderWatchlist(); }
    function toggleWatchlist(id, btn) {
        const list = loadWatchlist();
        const idx = list.indexOf(id);
        if (idx >= 0) {
            list.splice(idx, 1);
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa-regular fa-bookmark me-1"></i> Simpan';
        } else {
            list.unshift(id);
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-bookmark me-1"></i> Tersimpan';
        }
        saveWatchlist(list);
    }

    /* Watched History Logic */
    function loadWatched() { try { return JSON.parse(localStorage.getItem(watchedKey) || '[]'); } catch { return []; } }

    function markAsWatched(id) {
        const list = loadWatched();
        if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem(watchedKey, JSON.stringify(list));
            updateWatchedUI();
        }
    }

    function updateWatchedUI() {
        const list = loadWatched();
        document.querySelectorAll('.video-card').forEach(card => {
            const poster = card.querySelector('.video-poster');
            if (!poster) return;
            const id = poster.getAttribute('data-video-id');

            if (list.includes(id)) {
                card.classList.add('is-watched');
                // Tambahkan badge jika belum ada
                if (!poster.querySelector('.watched-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'watched-badge';
                    badge.innerHTML = '<i class="fa-solid fa-check"></i>';
                    badge.title = 'Sudah ditonton';
                    poster.appendChild(badge);
                }
            }
        });
    }

    function renderWatchlist() {
        const list = loadWatchlist();
        const wrap = document.getElementById('watchlistList');
        const empty = document.getElementById('watchlistEmpty');
        if (!wrap || !empty) return;
        wrap.innerHTML = '';
        if (!list.length) {
            empty.style.display = '';
            return;
        } else empty.style.display = 'none';
        list.forEach(id => {
            const li = document.createElement('div');
            li.className = 'list-group-item d-flex align-items-center justify-content-between';
            li.innerHTML = `<div class="d-flex align-items-center"><img src="https://img.youtube.com/vi/${id}/default.jpg" width="96" height="56" style="object-fit:cover;border-radius:6px" class="me-2"> <strong>${id}</strong></div>
    <div><button class="btn btn-sm btn-primary play-watchlist" data-id="${id}">Putar</button>
    <button class="btn btn-sm btn-outline-danger remove-watchlist ms-1" data-id="${id}"><i class="fa-solid fa-trash"></i></button></div>`;
            wrap.appendChild(li);
        });
    }

    /* offcanvas play & removal actions */
    document.body.addEventListener('click', function (e) {
        const play = e.target.closest('.play-watchlist');
        if (play) {
            openVideo(play.getAttribute('data-id'));
            bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('watchlistOffcanvas')).hide();
        }
        const rem = e.target.closest('.remove-watchlist');
        if (rem) {
            const id = rem.getAttribute('data-id');
            const list = loadWatchlist().filter(x => x !== id);
            saveWatchlist(list);
        }
    });

    /* initialize: chips, watchlist states */
    initChips();
    renderWatchlist();
    updateWatchedUI(); // Load status watched
    const saved = loadWatchlist();
    document.querySelectorAll('.watchlist-btn').forEach(b => {
        if (saved.includes(b.getAttribute('data-video-id'))) {
            b.classList.add('active');
            b.innerHTML = '<i class="fa-solid fa-bookmark me-1"></i> Tersimpan';
        }
    });

    // accessibility: keyboard: Enter on focused poster opens
    document.querySelectorAll('.video-poster').forEach(p => {
        p.tabIndex = 0;
        p.addEventListener('keydown', (e) => { if (e.key === 'Enter') p.click(); });
    });

})();