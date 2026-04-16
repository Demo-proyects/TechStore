// ========== INICIALIZACIÓN GSAP ==========
gsap.registerPlugin(ScrollTrigger);
// ========== TEMA ==========
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
// ========== MENÚ MÓVIL ==========
function toggleMobileMenu() {
    document.querySelector('.mobile-menu').classList.toggle('active');
}
document.addEventListener('click', (e) => {
    const menu = document.querySelector('.mobile-menu');
    const btn = document.getElementById('menuBtn');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
    }
});
// ========== SLIDER ==========
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}
setInterval(nextSlide, 4000);
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        currentSlide = i;
        showSlide(currentSlide);
    });
});
// ========== ANIMACIONES GSAP ==========
window.addEventListener('load', () => {
    gsap.to('.main-hero', { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.2, ease: 'power4.inOut' });
    gsap.to('.card-1', { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1, delay: 0.3, ease: 'power4.inOut' });
    gsap.to('.card-2-fixed', { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1, delay: 0.5, ease: 'power4.inOut' });

    const heroTl = gsap.timeline({ delay: 0.8 });
    heroTl.to('.hero-subtitle', { opacity: 1, x: 0, duration: 0.6 })
        .to('.hero-title', { opacity: 1, rotationX: 0, duration: 0.8, ease: 'back.out(1.2)' }, '-=0.3')
        .to('.hero-description', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to('.hero-btn', { opacity: 1, scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' }, '-=0.3')
        .to('.dot', { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1 }, '-=0.4');

    const card1Tl = gsap.timeline({ delay: 1 });
    card1Tl.to('.card-1-subtitle', { opacity: 1, y: 0, duration: 0.5 })
        .to('.card-1-title', { opacity: 1, x: 0, duration: 0.6 }, '-=0.3')
        .to('.card-1-cta', { opacity: 1, x: 0, duration: 0.4 }, '-=0.2');

    const card2Tl = gsap.timeline({ delay: 1.2 });
    card2Tl.to('.card-2-subtitle', { opacity: 1, y: 0, duration: 0.5 })
        .to('.card-2-title', { opacity: 1, x: 0, duration: 0.6 }, '-=0.3')
        .to('.card-2-cta', { opacity: 1, x: 0, duration: 0.4 }, '-=0.2');

    // Safe scroll-reveal using IntersectionObserver (no GSAP dependency issues)
    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealOnScroll.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.category-card, .service-card, .product-card, .news-card').forEach(el => {
        el.classList.add('reveal-ready');
        revealOnScroll.observe(el);
    });
});
// ========== HOVER ANIMATIONS ==========
['.card-1', '.card-2-fixed'].forEach(selector => {
    const card = document.querySelector(selector);
    if (card) {
        card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.02, duration: 0.3 }));
        card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.3 }));
    }
});

