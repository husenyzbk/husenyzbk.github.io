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
        thumbnail: "images/Thumbnails/TH_Lizard.jpg",
        photos: [
            "images/Animals/Lizard.jpg",
            "images/Animals/Fennec.jpg",
            "images/Animals/Eagle.jpg",
            "images/Animals/Lioness.jpg",
            "images/Animals/Spider.jpg",
        ]
    },

    people: {
        title:     "People",
        thumbnail: "images/Thumbnails/TH_Lizard.jpg",
        subAlbums: {
            events: {
                title:     "Events",
                thumbnail: "",   /* set a thumbnail path once you have photos */
                photos: [
                    /* add event photos here, e.g.:
                    "images/people/events/photo1.jpg", */
                ]
            },
            portraits: {
                title:     "Portraits",
                thumbnail: "",   /* set a thumbnail path once you have photos */
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
                thumbnail: "",
                photos: [
                    /* add flower photos here, e.g.:
                    "images/outdoors/flowers/photo1.jpg", */
                ]
            },
            buildings: {
                title:     "Buildings & Shops",
                thumbnail: "images/Thumbnails/TH_Mon creme.jpg",
                photos: [
                  
                    "images/Outdoors/Buildings & Shops/Mon creme.jpg",
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
                    "images/Outdoors/Miscellaneous/Mercedes.jpg",
                    "images/Outdoors/Miscellaneous/Wall art.jpg", 
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
let scrollObserver    = null;
let switchTimeout     = null;

const ZOOM_STEP = 0.25;
const ZOOM_MAX  = 4;
const ZOOM_MIN  = 0.5;

/* ---- Initialise on page load ---- */
document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    buildCategories();
    initScrollReveal();
    initKeyboardControls();
    initScrollWheelZoom();
    initSwipeControls();
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

    card.innerHTML = `
        <img src="${album.thumbnail || ''}" alt="${album.title}">
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
function showPage(pageId, scrollToTop = true) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (scrollToTop) window.scrollTo({ top: 0 });
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
        `url('${parent.thumbnail}')`;

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
    document.getElementById('album-bg-overlay').style.backgroundImage =
        `url('${album.thumbnail || fallbackThumb}')`;

    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';

    album.photos.forEach((photoSrc, index) => {
        const div = document.createElement('div');
        div.className = 'album-photo';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `${album.title} photo ${index + 1}`);

        const img   = document.createElement('img');
        img.src     = photoSrc;
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
    img.style.opacity   = '1';
    img.style.transform = 'scale(1)';
    img.src             = currentPhotos[index];
    img.onerror         = () => { img.style.opacity = '0.3'; };

    updateCounter();
    document.getElementById('fullscreen-viewer').classList.add('active');
    document.getElementById('zoom-level').textContent = '100%';
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    document.getElementById('fullscreen-viewer').classList.remove('active');
    document.body.style.overflow = '';
    currentZoom = 1;
    document.getElementById('viewer-img').style.transform = 'scale(1)';
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
        img.src             = src;
        img.onerror         = () => { img.style.opacity = '0.3'; };
        img.style.opacity   = '1';
        img.style.transform = 'scale(1)';
    }, 270);

    updateCounter();
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

function applyZoom() {
    document.getElementById('viewer-img').style.transform  = `scale(${currentZoom})`;
    document.getElementById('zoom-level').textContent      = `${Math.round(currentZoom * 100)}%`;
}

/* Scroll wheel zooms inside the viewer */
function initScrollWheelZoom() {
    document.getElementById('fullscreen-viewer').addEventListener('wheel', (e) => {
        e.preventDefault();
        e.deltaY < 0 ? zoomIn() : zoomOut();
    }, { passive: false });
}

/* ================================================
   SWIPE / TOUCH CONTROLS
================================================ */
function initSwipeControls() {
    const viewer = document.getElementById('fullscreen-viewer');
    let startX = 0;
    let startY = 0;

    viewer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    viewer.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        /* only trigger on horizontal swipes longer than 50px */
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? nextImage() : prevImage();
        }
    }, { passive: true });
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
