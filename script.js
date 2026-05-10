/* ================================================
   ⚙️  CONFIGURATION — Only edit this section
   ================================================ */

const CONFIG = {

    /* Your professional email address (used in Contact form) */
    email: "husenyzbkp@hotmail.com",

    /* Your Instagram profile URL */
    instagram: "https://www.instagram.com/husenyzbk2",

    /* Font size of "By Hussein Yazbeck" on the hero.
       Examples: "1rem", "1.3rem", "1.6rem", "22px" */
    authorNameSize: "1.1rem",

    /* Path to your full-screen hero (front page) image */
    heroImage: "images/hero.jpg",

    /* Path to the image shown beside your Bio */
    bioImage: "images/bio.jpg",

    /* Your biography text (supports line breaks with \n) */
    bio: `Write your bio here.\n\nTell your story, your passion for photography,\nwhere you're from, and what drives you\nto capture the world through your lens.`,

};

/* ================================================
   📸  ALBUMS — Add your photos here
   ================================================

   Flat album:
     title:     Name shown on the card / page
     thumbnail: Path to the card thumbnail image
     photos:    Array of all photo paths in this album

   Parent album (opens a sub-category page):
     title, thumbnail — same as above
     subAlbums: { key: { title, thumbnail, photos } }

   Sub-album thumbnails fall back to the parent thumbnail
   if left empty ("").
*/

const ALBUMS = {

    animals: {
        title:     "Animals",
        thumbnail: "images/Thumbnails/IMG_4100.png",
        photos: [
            "images/Animals/Lizard.jpg",
            "images/Animals/Fennec.jpg",
            "images/Animals/Eagle.jpg",
            "images/Animals/Lioness.jpg",
            "images/Animals/Spider.jpg",
            "images/Animals/cat.jpg",
            "images/Animals/IMG_4157.JPG",
            "images/Animals/IMG_4314_4.jpg",
            "images/Animals/IMG_4354.jpg",
            "images/Animals/IMG_4807-2.jpg",
            "images/Animals/IMG_5088-2.jpg",
            "images/Animals/IMG_5243-2.png",
            "images/Animals/IMG_5243.png",
            "images/Animals/IMG_5298.png",
            "images/Animals/IMG_5309.png",
            "images/Animals/IMG_5420-edit.png",
            "images/Animals/IMG_5450-edit.png",
            "images/Animals/IMG_6585.JPG",
            "images/Animals/IMG_52032.jpg",
        ]
    },

    people: {
        title:     "People",
        thumbnail: "",
        subAlbums: {
            events: {
                title:     "Events",
                thumbnail: "",   
                photos: [
                
                    "images/People/Events/Fatteh.JPG",
                    "images/People/Events/Hummus.JPG",
                ]
            },
            portraits: {
                title:     "Portraits",
                thumbnail: "",   
                photos: [
                    /* add portrait photos here, e.g.:
                    "images/people/portraits/photo1.jpg",

                    previous people photos (move files into portraits/ first):
                    "images/people/Screenshot 2026-05-03 213616.jpg",
                    "images/people/Screenshot 2026-05-03 213646.jpg",
                    "images/people/Screenshot 2026-05-03 213659.jpg", */
                ]
            }
        }
    },

    outdoors: {
        title:     "Outdoors",
        thumbnail: "images/Thumbnails/TH_Pyramid2.jpg",
        subAlbums: {
            flowers: {
                title:     "Flowers",
                thumbnail: "images/Thumbnails/TH_flower.jpg",
                photos: [
                    
                    "images/Outdoors/Flowers/IMG_4753.jpg",
                    "images/Outdoors/Flowers/IMG_4766-2.jpg",
                    "images/Outdoors/Flowers/IMG_4865.JPG",
                    "images/Outdoors/Flowers/IMG_4889-2.jpg",
                    "images/Outdoors/Flowers/IMG_4908-2.jpg",
                    "images/Outdoors/Flowers/image00005.jpg",
                    "images/Outdoors/Flowers/IMG_4914.JPG",
                    "images/Outdoors/Flowers/IMG_4930-2.jpg",
                    "images/Outdoors/Flowers/IMG_4950-2.jpg",
                ]
            },
            buildings: {
                title:     "Buildings & Shops",
                thumbnail: "images/Thumbnails/TH_Mon creme.jpg",
                photos: [
                  
                    "images/Outdoors/Buildings & Shops/Mon creme.jpg",
                    "images/Outdoors/Buildings & Shops/IMG_4492.jpg",
                    "images/Outdoors/Buildings & Shops/IMG_4595.jpg",
                    "images/Outdoors/Buildings & Shops/IMG_6433.JPG",
                    "images/Outdoors/Buildings & Shops/wall.jpg",
                    "images/Outdoors/Buildings & Shops/IMG_6439.JPG",
                ]
            },
            miscellaneous: {
                title:     "Miscellaneous",
                thumbnail: "images/Thumbnails/TH_Wall art.jpg",
                photos: [

                    "images/Outdoors/Miscellaneous/Boat.JPG",
                    "images/Outdoors/Miscellaneous/Jeep.jpg",
                    "images/Outdoors/Miscellaneous/Eiffel.JPG",
                    "images/Outdoors/Miscellaneous/Pyramid2.jpg",
                    "images/Outdoors/Miscellaneous/Pyramid1.jpg",
                    "images/Outdoors/Miscellaneous/Pyramid3.jpg",
                    "images/Outdoors/Miscellaneous/moon.jpg",
                    "images/Outdoors/Miscellaneous/Mercedes.jpg",
                    "images/Outdoors/Miscellaneous/Wall art.jpg", 
                    "images/Outdoors/Miscellaneous/beach.jpg",
                    "images/Outdoors/Miscellaneous/IMG_4446-2.jpg",
                    "images/Outdoors/Miscellaneous/IMG_4471.JPG",
                    "images/Outdoors/Miscellaneous/Statues.jpg",
                ]
            }
        }
    },

};

/* ================================================
   INTERNALS — Do not edit below this line
================================================ */

/*
  Navigation states:
    'home'          — home page is visible
    'subcategories' — sub-album grid for a parent album
    'album'         — flat photo grid
*/
let navigationState   = 'home';
let currentParentKey  = null;   // top-level album key when inside a sub-album
let currentAlbumKey   = null;
let currentPhotos     = [];     // photos array of the currently open album
let currentPhotoIndex = 0;
let currentZoom       = 1;
let currentPan        = { x: 0, y: 0 };
let scrollObserver    = null;
let switchTimeout     = null;

const ZOOM_STEP = 0.25;
const ZOOM_MAX  = 4;
const ZOOM_MIN  = 1;

/* ================================================
   PATH HELPERS
   Derive processed-image paths from the original
   path declared in ALBUMS. The Python script creates:
     images/.../web/filename.jpg    ← fullscreen viewer
     images/.../thumbs/filename.jpg ← photo grid
================================================ */
function toWebPath(p) {
    const parts = p.split('/');
    const file  = parts.pop();
    return [...parts, 'web', file].join('/');
}

function toThumbPath(p) {
    const parts = p.split('/');
    const file  = parts.pop();
    return [...parts, 'thumbs', file].join('/');
}

/* Silently preload the images on either side of the current one */
function preloadAdjacent(index) {
    if (currentPhotos.length <= 1) return;
    const total = currentPhotos.length;
    [currentPhotos[(index + 1) % total], currentPhotos[(index - 1 + total) % total]]
        .forEach(src => { const img = new Image(); img.src = toWebPath(src); });
}

/* ---- Initialise on page load ---- */
document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    buildCategories();
    initScrollReveal();
    initKeyboardControls();
    initScrollWheelZoom();
    initSwipeControls();
    initViewerPan();
    initImageProtection();
    document.getElementById('footer-year').textContent = new Date().getFullYear();
});

/* Apply CONFIG values to the DOM */
function applyConfig() {
    document.getElementById('hero-bg').src                = CONFIG.heroImage;
    document.getElementById('bio-img').src                = CONFIG.bioImage;
    document.getElementById('bio-text').textContent       = CONFIG.bio;
    document.getElementById('author-name').style.fontSize = CONFIG.authorNameSize;
    document.getElementById('instagram-link').href        = CONFIG.instagram;
}

/* ================================================
   CARD FACTORY
================================================ */

/* Build a reusable category card element */
function _makeCard(album, subtitle, action) {
    const card = document.createElement('div');
    card.className = 'category-card reveal';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${album.title}`);

    const thumbSrc = album.thumbnail ? toThumbPath(album.thumbnail) : '';
    card.innerHTML = `
        <img src="${thumbSrc}" alt="${album.title}">
        <div class="category-card-overlay">
            <h3>${album.title}</h3>
            <span>${subtitle}</span>
        </div>
    `;

    card.addEventListener('click', action);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    });

    return card;
}

/* Build home-page category cards from ALBUMS */
function buildCategories() {
    const grid = document.getElementById('categories-grid');

    Object.entries(ALBUMS).forEach(([key, album]) => {
        const subtitle = album.subAlbums
            ? `${Object.keys(album.subAlbums).length} Albums`
            : `${album.photos.length} Photos`;

        const card = _makeCard(album, subtitle, () => openAlbum(key));
        grid.appendChild(card);
        if (scrollObserver) scrollObserver.observe(card);
    });
}

/* ================================================
   PAGE NAVIGATION
================================================ */
let _irisRot = 0;

function _irisPath(fraction, rot) {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const Rmax = Math.hypot(cx, cy) / Math.cos(Math.PI / 6) * 1.05;
    const R = fraction * Rmax;
    const outer = `M0,0 H${W} V${H} H0 Z`;
    const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + rot;
        return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`;
    });
    const inner = `M${pts[0]} ${[5,4,3,2,1].map(i => `L${pts[i]}`).join(' ')} Z`;
    return `path('${outer} ${inner}')`;
}

function _animIris(el, f0, f1, r0, r1, ms, ease, done) {
    const start = performance.now();
    (function tick(now) {
        const t = Math.min((now - start) / ms, 1);
        const e = ease(t);
        el.style.clipPath = _irisPath(f0 + (f1 - f0) * e, r0 + (r1 - r0) * e);
        t < 1 ? requestAnimationFrame(tick) : done && done();
    }(performance.now()));
}

function showPage(pageId, scrollToTop = true) {
    const incoming = document.getElementById(pageId);
    const outgoing = document.querySelector('.page.active');

    if (!outgoing || outgoing === incoming) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        incoming.classList.add('active');
        if (scrollToTop) window.scrollTo({ top: 0 });
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        outgoing.classList.remove('active');
        incoming.classList.add('active');
        if (scrollToTop) window.scrollTo({ top: 0 });
        return;
    }

    const el = document.getElementById('aperture-overlay');
    const r0 = _irisRot, r1 = r0 + Math.PI / 6, r2 = r1 + Math.PI / 6;
    _irisRot = r2;

    el.style.clipPath = _irisPath(1, r0);
    el.style.display  = 'block';

    _animIris(el, 1, 0, r0, r1, 360, t => t * t * t, () => {
        outgoing.classList.remove('active');
        incoming.classList.add('active');
        if (scrollToTop) window.scrollTo({ top: 0 });

        _animIris(el, 0, 1, r1, r2, 420, t => 1 - Math.pow(1 - t, 3), () => {
            el.style.display  = '';
            el.style.clipPath = '';
        });
    });
}

function goHome() {
    navigationState  = 'home';
    currentParentKey = null;
    currentAlbumKey  = null;
    currentPhotos    = [];
    showPage('home-page');
    document.getElementById('back-btn').style.display = 'none';
}

function goBack() {
    /* if fullscreen is open, close it — don't navigate away from the album */
    if (document.getElementById('fullscreen-viewer').classList.contains('active')) {
        closeFullscreen();
        return;
    }

    if (navigationState === 'album' && currentParentKey !== null) {
        /* sub-album → go back to parent's sub-category page */
        openSubcategoryPage(currentParentKey);
    } else {
        /* flat album or sub-category page → go home, scroll to grid */
        goHome();
        setTimeout(() => {
            document.getElementById('categories-section')
                .scrollIntoView({ behavior: 'smooth' });
        }, 150);
    }
}

/* ================================================
   ALBUM OPENING
================================================ */
function openAlbum(albumKey) {
    const album = ALBUMS[albumKey];
    if (album.subAlbums) {
        openSubcategoryPage(albumKey);
    } else {
        _openFlatAlbum(albumKey, album, null);
    }
}

/* Show the sub-category grid for a parent album */
function openSubcategoryPage(parentKey) {
    navigationState  = 'subcategories';
    currentParentKey = parentKey;
    const parent     = ALBUMS[parentKey];

    document.getElementById('subcategories-title').textContent = parent.title;
    document.getElementById('subcategories-bg-overlay').style.backgroundImage =
        `url('${toThumbPath(parent.thumbnail)}')`;

    const grid = document.getElementById('subcategories-grid');
    grid.innerHTML = '';

    Object.entries(parent.subAlbums).forEach(([subKey, sub]) => {
        const effective = { ...sub, thumbnail: sub.thumbnail || parent.thumbnail };
        const subtitle  = `${sub.photos.length} Photos`;
        const card      = _makeCard(effective, subtitle, () =>
            _openFlatAlbum(subKey, sub, parentKey)
        );
        grid.appendChild(card);
        if (scrollObserver) scrollObserver.observe(card);
    });

    showPage('subcategories-page');
    document.getElementById('back-btn').style.display = 'flex';
}

/* Open a flat photo grid (no sub-albums) */
function _openFlatAlbum(albumKey, album, parentKey) {
    navigationState  = 'album';
    currentParentKey = parentKey;
    currentAlbumKey  = albumKey;
    currentPhotos    = album.photos;

    const fallbackThumb = parentKey ? ALBUMS[parentKey].thumbnail : '';
    document.getElementById('album-title').textContent = album.title;
    const bgThumb = album.thumbnail || fallbackThumb;
    document.getElementById('album-bg-overlay').style.backgroundImage =
        `url('${bgThumb ? toThumbPath(bgThumb) : ''}')`;

    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';

    album.photos.forEach((photoSrc, index) => {
        const div = document.createElement('div');
        div.className = 'album-photo';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `${album.title} photo ${index + 1}`);

        const img   = document.createElement('img');
        img.src     = toThumbPath(photoSrc);
        img.alt     = `${album.title} ${index + 1}`;
        img.loading = 'lazy';
        img.onerror = () => img.classList.add('img-error');
        div.appendChild(img);

        div.addEventListener('click', () => openFullscreen(index));
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFullscreen(index); }
        });

        grid.appendChild(div);
        setTimeout(() => div.classList.add('visible'), 80 + index * 55);
    });

    showPage('album-page');
    document.getElementById('back-btn').style.display = 'flex';
}

/* ================================================
   FULLSCREEN VIEWER
================================================ */
function openFullscreen(index) {
    currentPhotoIndex = index;
    currentZoom       = 1;

    const img = document.getElementById('viewer-img');
    currentPan          = { x: 0, y: 0 };
    img.style.opacity   = '1';
    img.style.transform = 'translate(0px, 0px) scale(1)';
    img.src             = toWebPath(currentPhotos[index]);
    img.onerror         = () => { img.style.opacity = '0.3'; };

    updateCounter();
    preloadAdjacent(index);
    document.getElementById('fullscreen-viewer').classList.add('active');
    document.body.classList.add('viewer-open');
    showDoubleTapHint();
    document.getElementById('zoom-level').textContent = '100%';
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    document.getElementById('fullscreen-viewer').classList.remove('active');
    document.body.classList.remove('viewer-open');
    document.body.style.overflow = '';
    currentZoom = 1;
    currentPan = { x: 0, y: 0 };
    document.getElementById('viewer-img').style.transform = 'translate(0px, 0px) scale(1)';
    document.getElementById('fullscreen-viewer').style.cursor = 'default';
    document.getElementById('zoom-level').textContent = '100%';
}

function prevImage() {
    currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
    switchImage(currentPhotos[currentPhotoIndex]);
}

function nextImage() {
    currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
    switchImage(currentPhotos[currentPhotoIndex]);
}

/* Smooth cross-fade; clears any in-flight timeout to prevent stacking */
function switchImage(src) {
    const img = document.getElementById('viewer-img');
    currentZoom = 1;

    img.style.opacity   = '0';
    img.style.transform = 'scale(0.95)';

    clearTimeout(switchTimeout);
    switchTimeout = setTimeout(() => {
        img.src             = toWebPath(src);
        img.onerror         = () => { img.style.opacity = '0.3'; };
        currentPan          = { x: 0, y: 0 };
        img.style.opacity   = '1';
        img.style.transform = 'translate(0px, 0px) scale(1)';
    }, 270);

    updateCounter();
    preloadAdjacent(currentPhotoIndex);
    document.getElementById('zoom-level').textContent = '100%';
}

function updateCounter() {
    document.getElementById('viewer-counter-text').textContent =
        `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
}

/* ================================================
   ZOOM
================================================ */
function zoomIn() {
    if (currentZoom < ZOOM_MAX) {
        currentZoom = parseFloat((currentZoom + ZOOM_STEP).toFixed(2));
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > ZOOM_MIN) {
        currentZoom = parseFloat((currentZoom - ZOOM_STEP).toFixed(2));
        applyZoom();
    }
}

function clampPan() {
    const img    = document.getElementById('viewer-img');
    const baseW  = img.offsetWidth;   // layout size, unaffected by CSS transform
    const baseH  = img.offsetHeight;

    const maxPanX = Math.max(0, (baseW  * currentZoom - window.innerWidth)  / 2);
    const maxPanY = Math.max(0, (baseH  * currentZoom - window.innerHeight) / 2);

    currentPan.x = Math.max(-maxPanX, Math.min(maxPanX, currentPan.x));
    currentPan.y = Math.max(-maxPanY, Math.min(maxPanY, currentPan.y));
}

function applyTransform() {
    clampPan();
    document.getElementById('viewer-img').style.transform =
        `translate(${currentPan.x}px, ${currentPan.y}px) scale(${currentZoom})`;
}

function applyZoom() {
    applyTransform();
    const viewer = document.getElementById('fullscreen-viewer');
    viewer.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    document.getElementById('zoom-level').textContent = `${Math.round(currentZoom * 100)}%`;
}

/* Scroll wheel zooms inside the viewer */
function initScrollWheelZoom() {
    document.getElementById('fullscreen-viewer').addEventListener('wheel', (e) => {
        e.preventDefault();
        e.deltaY < 0 ? zoomIn() : zoomOut();
    }, { passive: false });
}

/* ================================================
   PAN (DRAG TO MOVE WHEN ZOOMED)
================================================ */
function initViewerPan() {
    const viewer = document.getElementById('fullscreen-viewer');
    let dragging = false;
    let lastX = 0, lastY = 0;

    viewer.addEventListener('mousedown', (e) => {
        if (currentZoom <= 1) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        viewer.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        currentPan.x += e.clientX - lastX;
        currentPan.y += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        viewer.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    });
}

/* ================================================
   SWIPE / DOUBLE-TAP TOUCH CONTROLS
================================================ */
function initSwipeControls() {
    const viewer = document.getElementById('fullscreen-viewer');

    let startX = 0, startY = 0;
    let lastTouchX = 0, lastTouchY = 0;
    let touchPanning = false;

    let lastTapTime = 0;
    let lastTapX    = 0;
    let lastTapY    = 0;

    viewer.addEventListener('touchstart', (e) => {
        startX       = e.touches[0].clientX;
        startY       = e.touches[0].clientY;
        lastTouchX   = startX;
        lastTouchY   = startY;
        touchPanning = currentZoom > 1;
    }, { passive: true });

    viewer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!touchPanning) return;
        currentPan.x += e.touches[0].clientX - lastTouchX;
        currentPan.y += e.touches[0].clientY - lastTouchY;
        lastTouchX    = e.touches[0].clientX;
        lastTouchY    = e.touches[0].clientY;
        applyTransform();
    }, { passive: false });

    viewer.addEventListener('touchend', (e) => {
        if (e.touches.length > 0) return;

        const touch = e.changedTouches[0];
        const now   = Date.now();

        /* double-tap: zoom in to tapped spot, or reset */
        if (now - lastTapTime < 300 &&
            Math.abs(touch.clientX - lastTapX) < 40 &&
            Math.abs(touch.clientY - lastTapY) < 40) {

            if (currentZoom > 1) {
                currentZoom = 1;
                currentPan  = { x: 0, y: 0 };
            } else {
                currentZoom  = 2.5;
                const offX   = touch.clientX - window.innerWidth  / 2;
                const offY   = touch.clientY - window.innerHeight / 2;
                currentPan.x = offX * (1 - currentZoom);
                currentPan.y = offY * (1 - currentZoom);
            }
            applyZoom();
            lastTapTime = 0;
            return;
        }

        lastTapTime = now;
        lastTapX    = touch.clientX;
        lastTapY    = touch.clientY;

        /* swipe to navigate — only at 1:1 zoom */
        if (touchPanning) return;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? nextImage() : prevImage();
        }
    }, { passive: true });
}

/* ================================================
   DOUBLE TAP HINT
================================================ */
function showDoubleTapHint() {
    if (!('ontouchstart' in window)) return;
    if (localStorage.getItem('dthint')) return;

    const hint = document.getElementById('doubletap-hint');
    hint.classList.add('active');
    setTimeout(() => {
        hint.classList.remove('active');
        localStorage.setItem('dthint', '1');
    }, 3000);
}

/* ================================================
   IMAGE PROTECTION
   Stops right-click saving and drag-to-desktop.
   Does not block OS screenshots — nothing can.
================================================ */
function initImageProtection() {
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
}

/* ================================================
   KEYBOARD CONTROLS
================================================ */
function initKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const viewer = document.getElementById('fullscreen-viewer');
        if (!viewer.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':     closeFullscreen(); break;
            case 'ArrowLeft':  prevImage();        break;
            case 'ArrowRight': nextImage();        break;
            case '+':
            case '=':          zoomIn();           break;
            case '-':          zoomOut();          break;
        }
    });
}

/* ================================================
   CONTACT FORM
================================================ */
function sendEmail() {
    const name    = document.getElementById('contact-name').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const errorEl = document.getElementById('form-error');

    if (!name || !message) {
        errorEl.textContent = 'Please fill in both fields before sending.';
        errorEl.classList.add('visible');
        return;
    }

    errorEl.textContent = '';
    errorEl.classList.remove('visible');

    const subject = encodeURIComponent(`Photography Inquiry from ${name}`);
    const body    = encodeURIComponent(message);
    const a       = document.createElement('a');
    a.href        = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    a.click();
}

/* ================================================
   SCROLL REVEAL (IntersectionObserver)
================================================ */
function initScrollReveal() {
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));
}
