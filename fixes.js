/* ============================================================
   fixes.js – Corrección centralizada de UX, navegación y carrito
   Versión definitiva – No interfiere con tienda.html
   ============================================================ */

(function() {
  'use strict';

  /* ---------- DETECCIÓN DE PÁGINA ---------- */
  const isIndex = window.location.pathname.endsWith('index.html') || 
                  window.location.pathname === '/' || 
                  window.location.pathname.endsWith('/');
  const isTienda = window.location.pathname.includes('tienda.html');

  /* ---------- INYECCIÓN DE CSS (z-index, modo claro, etc.) ---------- */
  function injectCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // 1. Elevar z-index del menú móvil sobre los filtros (sticky)
  injectCSS(`
    .mobile-menu {
      z-index: 60 !important;
    }
    /* Mejora contraste modo claro en textos críticos */
    [data-theme="light"] .text-secondary,
    [data-theme="light"] .pcard-rcount,
    [data-theme="light"] .review-card p,
    [data-theme="light"] .service-card p,
    [data-theme="light"] .footer-link,
    [data-theme="light"] .category-item p {
      color: #2c3e66 !important;
      opacity: 1 !important;
    }
    [data-theme="light"] .pcard-brand,
    [data-theme="light"] .pcard-subcat {
      color: #1e3a8a !important;
    }
    [data-theme="light"] .hero-description,
    [data-theme="light"] .hero-subtitle {
      text-shadow: none !important;
    }
  `);

  /* ---------- TOAST SIMPLE (si no existe) ---------- */
  function showToast(msg) {
    let toast = document.getElementById('ts-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ts-toast';
      toast.style.cssText = 'position:fixed;bottom:100px;right:28px;z-index:9999;background:var(--bg-card);border:1px solid var(--accent-primary);color:var(--text-primary);padding:10px 18px;border-radius:4px;font-size:0.8rem;transition:opacity 0.3s;opacity:0;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2400);
  }

  /* ---------- LIMPIEZA DE CARRITO CORRUPTO (NaN) ---------- */
  function sanitizeCart() {
    let cart = JSON.parse(localStorage.getItem('ts_cart') || '[]');
    let changed = false;
    cart = cart.filter(item => {
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
        changed = true;
        return false;
      }
      if (typeof item.qty !== 'number' || isNaN(item.qty) || item.qty <= 0) {
        changed = true;
        return false;
      }
      return true;
    });
    if (changed) {
      localStorage.setItem('ts_cart', JSON.stringify(cart));
      if (isTienda && typeof updateCartUI === 'function') updateCartUI();
    }
    return cart;
  }
  sanitizeCart();

  /* ---------- LOGO: REDIRIGIR A INDEX.HTML (en ambas páginas) ---------- */
  function fixLogoRedirection() {
    const logo = document.querySelector('header .flex.items-center.space-x-2');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
      });
    }
  }

  /* ---------- SISTEMA DE CARRITO EXCLUSIVO PARA INDEX ---------- */
  let cart = [];
  let cartInitialized = false;

  function saveCart() {
    localStorage.setItem('ts_cart', JSON.stringify(cart));
    if (typeof updateCartUI === 'function') updateCartUI();
    // También refrescar el UI del carrito en index (si existe)
    renderIndexCartUI();
  }

  function renderIndexCartUI() {
    if (!isIndex) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const counter = document.getElementById('cart-count');
    if (counter) {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'flex' : 'none';
    }
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
    const container = document.getElementById('cart-items');
    if (!container) return;
    if (!cart.length) {
      container.innerHTML = '<p class="text-center text-xs py-16" style="color:var(--text-secondary);opacity:0.3">TU CARRITO ESTÁ VACÍO</p>';
      return;
    }
    container.innerHTML = cart.map(item => `
      <div class="cart-item" style="display:flex;border:1px solid var(--border-color);margin-bottom:8px;">
        <div style="width:3px;background:var(--accent-primary);"></div>
        <img src="${item.img}" style="width:60px;height:60px;object-fit:cover;">
        <div style="flex:1;padding:8px;">
          <p style="font-size:0.7rem;">${item.brand} ${item.name}</p>
          <div style="display:flex;justify-content:space-between;">
            <span>$${item.price.toLocaleString()}</span>
            <div>
              <button class="qty-dec" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button class="qty-inc" data-id="${item.id}">+</button>
              <button class="remove-item" data-id="${item.id}">✕</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    // Eventos dinámicos
    container.querySelectorAll('.qty-dec').forEach(btn => {
      btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.id), -1));
    });
    container.querySelectorAll('.qty-inc').forEach(btn => {
      btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.id), 1));
    });
    container.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });
  }

  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty += (product.qty || 1);
    else cart.push({ ...product, qty: product.qty || 1 });
    saveCart();
    showToast(`✓ ${product.brand} añadido al carrito`);
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) removeFromCart(id);
      else saveCart();
    }
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // Exponer funciones para el index
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.clearCart = clearCart;
  window.addToCartGlobal = addToCart;  // para botones de index

  // Inyectar drawer y FAB solo en index
  function ensureCartDrawerIndex() {
    if (!isIndex) return;
    if (document.getElementById('cart-drawer')) return;
    const drawerHTML = `
      <div id="cart-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);z-index:599;opacity:0;pointer-events:none;transition:opacity 0.3s;" onclick="closeCart()"></div>
      <div id="cart-drawer" style="position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);z-index:600;background:var(--bg-primary);border-left:1px solid var(--border-color);transform:translateX(100%);transition:transform 0.35s;display:flex;flex-direction:column;">
        <div style="padding:18px 22px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;">
          <h3>CARRITO</h3>
          <button onclick="closeCart()">✕</button>
        </div>
        <div id="cart-items" style="flex:1;overflow-y:auto;padding:14px;"></div>
        <div style="padding:18px;border-top:1px solid var(--border-color);">
          <div style="display:flex;justify-content:space-between;">
            <span>Total</span>
            <span id="cart-total">$0</span>
          </div>
          <button onclick="checkout()" style="width:100%;padding:12px;background:var(--accent-primary);color:#000;font-weight:bold;margin-top:12px;">FINALIZAR COMPRA</button>
          <button onclick="clearCart()" style="width:100%;padding:8px;background:transparent;border:1px solid var(--border-color);margin-top:6px;">VACIAR CARRITO</button>
        </div>
      </div>
      <button id="cart-fab" style="position:fixed;bottom:28px;right:28px;z-index:500;width:56px;height:56px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:0;display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="openCart()">
        🛒
        <span id="cart-count" style="position:absolute;top:-6px;right:-6px;background:var(--accent-primary);color:#000;min-width:20px;height:20px;border-radius:0;display:none;align-items:center;justify-content:center;font-size:0.7rem;">0</span>
      </button>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }

  // Hookear botones de "Añadir" en index (productos destacados)
  function hookIndexAddButtons() {
    if (!isIndex) return;
    // Los productos en index tienen atributo data-id (ver index.html)
    document.querySelectorAll('.product-card, [data-id]').forEach(card => {
      const btn = card.querySelector('button, .pcard-add');
      if (btn && !btn.hasAttribute('data-hooked')) {
        btn.setAttribute('data-hooked', 'true');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(card.getAttribute('data-id'));
          if (id && typeof DB !== 'undefined') {
            const product = DB.find(p => p.id === id);
            if (product) addToCart(product);
          }
        });
      }
    });
  }

  // Cargar carrito desde localStorage al inicio (solo index)
  function loadCartForIndex() {
    if (!isIndex) return;
    const stored = localStorage.getItem('ts_cart');
    if (stored) {
      try {
        cart = JSON.parse(stored);
        if (!Array.isArray(cart)) cart = [];
        cart = cart.filter(item => item.price && typeof item.price === 'number');
      } catch(e) { cart = []; }
      saveCart();
    }
  }

  /* ---------- FUNCIONES DE NAVEGACIÓN SUAVE (index) ---------- */
  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function fixNavigationLinks() {
    if (!isIndex) return;
    // Enlaces internos del header y menú móvil
    const links = document.querySelectorAll('header nav a, .mobile-menu nav a');
    links.forEach(link => {
      const text = link.textContent.trim().toUpperCase();
      if (text === 'INICIO') {
        link.addEventListener('click', (e) => { e.preventDefault(); scrollToSection('#hero'); });
      } else if (text === 'COLECCIONES') {
        link.addEventListener('click', (e) => { e.preventDefault(); scrollToSection('#ofertas-section'); });
      } else if (text === 'PRODUCTOS') {
        link.addEventListener('click', (e) => { e.preventDefault(); scrollToSection('#product-section'); });
      } else if (text === 'CONTACTO') {
        link.addEventListener('click', (e) => { e.preventDefault(); window.open('https://wa.me/18098786115', '_blank'); });
      }
    });
    // Botón EXPLORAR AHORA
    const exploreBtn = document.querySelector('.hero-btn');
    if (exploreBtn) exploreBtn.addEventListener('click', () => scrollToSection('#product-section'));
  }

  /* ---------- INICIALIZACIÓN GENERAL ---------- */
  function init() {
    fixLogoRedirection();          // funciona en index y tienda
    if (isIndex) {
      ensureCartDrawerIndex();
      loadCartForIndex();
      hookIndexAddButtons();
      fixNavigationLinks();
      // Pequeño retraso para que GSAP cargue bien
      setTimeout(() => {
        if (typeof gsap !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }
      }, 100);
    }
    // En tienda, no hacemos nada del carrito, dejamos que tienda.js maneje todo.
    // Pero aseguramos que el logo ya está arreglado y el CSS inyectado.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();