/**
 * NARA AVATAR SYSTEM v4
 * ─────────────────────────────────────────────────────────────
 * <script src="avatar.js"></script>  ← sin defer, sin async
 *
 * Cambios v4:
 *  • Colores alineados con el portfolio (--bg-primary #0a0e27 / --accent #00d4ff)
 *  • Avatar ligeramente más pequeño (92 → 80px)
 *  • Doble clic / doble tap funciona en móvil (touchend)
 *  • Click fuera del avatar → vuelve a modo espera
 *  • FAQ rediseñado al estilo del portfolio (detalles animados, bordes accent)
 *  • FAQ items generados desde un array (sin HTML duplicado)
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     CONFIGURACIÓN
  ══════════════════════════════════════════════ */
  var C = {
    speak : 'ava/nara-speak.webp',
    espera: 'ava/nara-espera.webp',
    stat  : 'ava/nara-estatico.png',
    intro : 'ava/intro.mp3',
    ayuda : 'ava/ayuda.mp3',
    wa    : 'https://wa.me/18098786115',
    delay : 2000,
    cool  : 1400,   /* cooldown doble tap/clic en ms */
    SIZE  : 80      /* diámetro del avatar en px      */
  };

  /* ══════════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════════ */
  var S = {
    mode    : 'hidden',
    audio   : null,
    lastDbl : 0,
    lastTap : 0,   /* para doble tap móvil */
    drag    : false,
    moved   : false,
    ox: 0, oy: 0, wx: 0, wy: 0
  };

  var wrap, circle, img, btnFaq, btnClose, btnBack, faqEl, modalEl, mOk;

  /* ══════════════════════════════════════════════
     SESSION STORAGE
  ══════════════════════════════════════════════ */
  function ssGet(k) { try { return sessionStorage.getItem(k); }  catch(e) { return null; } }
  function ssSet(k) { try { sessionStorage.setItem(k, '1'); }    catch(e) {} }

  /* ══════════════════════════════════════════════
     ARRANQUE
  ══════════════════════════════════════════════ */
  function boot() {
    if (document.getElementById('ava-wrap')) return;
    injectCSS();
    buildDOM();
    bindEvents();
    setTimeout(function () {
      popIn();
      setState(ssGet('ava_intro_done') ? 'waiting' : 'intro');
    }, C.delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ══════════════════════════════════════════════
     INJECT CSS
  ══════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('ava-css')) return;
    var s = document.createElement('style');
    s.id = 'ava-css';
    s.textContent = buildCSS();
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════ */
  function buildDOM() {
    var sz = C.SIZE;

    wrap   = mk('div', { id: 'ava-wrap' });
    wrap.className = 'pos-default';

    circle = mk('div', { id: 'ava-c' });
    img    = mk('img', { id: 'ava-img', src: C.espera, alt: 'Nara', draggable: 'false' });
    circle.appendChild(img);

    btnFaq   = mkBtn('ava-b-faq',   '?',        'Preguntas frecuentes');
    btnClose = mkBtn('ava-b-close', '&#x2715;', 'Ocultar asistente');
    btnBack  = mkBtn('ava-b-back',  '&#x21BA;', 'Volver');

    wrap.appendChild(circle);
    wrap.appendChild(btnFaq);
    wrap.appendChild(btnClose);
    wrap.appendChild(btnBack);

    /* FAQ */
    faqEl = mk('div', { id: 'ava-faq' });
    faqEl.innerHTML = buildFAQHTML();

    /* Modal */
    modalEl = mk('div', { id: 'ava-modal' });
    modalEl.innerHTML =
      '<div id="ava-mbox">' +
        '<h3>&#x1F44B; \u00a1Hasta pronto!</h3>' +
        '<p>Puedes volver a llamarme con un <strong>doble clic</strong> ' +
        '(o doble tap en m\u00f3vil) en cualquier parte de la pantalla \u2014 ' +
        'aparecer\u00e9 justo donde lo hagas.</p>' +
        '<p style="margin-top:10px">Tambi\u00e9n puedes <strong>arrastrarme</strong> ' +
        'a donde prefieras mientras estoy visible.</p>' +
        '<button id="ava-mok">Entendido</button>' +
      '</div>';

    document.body.appendChild(wrap);
    document.body.appendChild(faqEl);
    document.body.appendChild(modalEl);

    mOk = document.getElementById('ava-mok');
  }

  /* ══════════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════════ */
  function setState(mode) {
    S.mode = mode;
    hideBtns();
    closeFAQ();

    switch (mode) {

      case 'hidden':
        killAudio();
        wrap.classList.remove('ava-on');
        break;

      case 'intro':
        wrap.classList.add('ava-on');
        img.src = C.speak;
        tryPlay(C.intro, function () {
          ssSet('ava_intro_done');
          setState('waiting');
        });
        break;

      case 'waiting':
        killAudio();
        wrap.classList.add('ava-on');
        setPos('default');
        img.src = C.espera;
        break;

      case 'help':
        wrap.classList.add('ava-on');
        showBtns();
        if (!ssGet('ava_ayuda_done')) {
          img.src = C.speak;
          tryPlay(C.ayuda, function () {
            ssSet('ava_ayuda_done');
            img.src = C.stat;
          });
        } else {
          img.src = C.stat;
        }
        break;

      case 'faq':
        wrap.classList.add('ava-on');
        setPos('center');
        img.src = C.stat;
        openFAQ();
        break;
    }
  }

  /* ══════════════════════════════════════════════
     AUDIO + AUTOPLAY FALLBACK
  ══════════════════════════════════════════════ */
  function tryPlay(src, cb) {
    killAudio();
    var a = new Audio(src);
    S.audio = a;
    function done() { S.audio = null; if (cb) cb(); }
    a.addEventListener('ended', done, { once: true });
    a.addEventListener('error', done, { once: true });
    var p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        var resume = function () { if (S.audio === a) a.play().catch(done); };
        var o = { capture: true, once: true };
        document.addEventListener('click',      resume, o);
        document.addEventListener('keydown',    resume, o);
        document.addEventListener('touchstart', resume, o);
        document.addEventListener('scroll',     resume, o);
      });
    }
  }
  function killAudio() {
    if (S.audio) { try { S.audio.pause(); } catch(e) {} S.audio = null; }
  }

  /* ══════════════════════════════════════════════
     ANIMACIÓN APARICIÓN
  ══════════════════════════════════════════════ */
  function popIn() {
    wrap.classList.add('ava-on');
    circle.classList.remove('ava-pop');
    void circle.offsetWidth;
    circle.classList.add('ava-pop');
  }

  /* ══════════════════════════════════════════════
     POSICIÓN
  ══════════════════════════════════════════════ */
  function setPos(m) {
    wrap.style.left = wrap.style.top = wrap.style.right = wrap.style.transform = '';
    wrap.className = 'ava-on pos-' + m;
  }

  function showBtns() { [btnFaq,btnClose,btnBack].forEach(function(b){b.classList.add('show');}); }
  function hideBtns() { [btnFaq,btnClose,btnBack].forEach(function(b){b.classList.remove('show');}); }
  function openFAQ()  { faqEl.classList.add('open'); }
  function closeFAQ() { faqEl.classList.remove('open'); }

  /* ══════════════════════════════════════════════
     EVENTOS
  ══════════════════════════════════════════════ */
  function bindEvents() {

    /* ── Drag & click ── */
    circle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      S.drag = true; S.moved = false;
      var r = wrap.getBoundingClientRect();
      S.ox = e.clientX; S.oy = e.clientY;
      S.wx = r.left;    S.wy = r.top;
      circle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    circle.addEventListener('pointermove', function (e) {
      if (!S.drag) return;
      var dx = e.clientX - S.ox, dy = e.clientY - S.oy;
      if (!S.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) S.moved = true;
      if (S.moved) {
        var vw = window.innerWidth, vh = window.innerHeight;
        wrap.className       = 'ava-on';
        wrap.style.left      = Math.max(0, Math.min(S.wx + dx, vw - 90)) + 'px';
        wrap.style.top       = Math.max(0, Math.min(S.wy + dy, vh - 110)) + 'px';
        wrap.style.right     = 'auto';
        wrap.style.transform = 'none';
      }
    });

    circle.addEventListener('pointerup', function () {
      var wasDrag = S.moved;
      S.drag = false; S.moved = false;
      if (!wasDrag) onCircleClick();
    });

    function onCircleClick() {
      if (S.mode === 'waiting') { setState('help');    return; }
      if (S.mode === 'help')    { setState('waiting'); return; }
      if (S.mode === 'faq')     { setState('waiting'); return; }
    }

    /* ── Botones ── */
    btnFaq.addEventListener('click',  function(e){ e.stopPropagation(); setState('faq'); });
    btnBack.addEventListener('click', function(e){ e.stopPropagation(); setState('waiting'); });
    btnClose.addEventListener('click', function(e) {
      e.stopPropagation();
      hideBtns();
      killAudio();
      modalEl.classList.add('open');
    });

    /* ── Modal ── */
    mOk.addEventListener('click', function () {
      modalEl.classList.remove('open');
      setState('hidden');
    });
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) { modalEl.classList.remove('open'); setState('hidden'); }
    });

    /* ── FAQ accordion & controles ── */
    faqEl.addEventListener('click', function (e) {
      if (e.target.closest('#ava-fq-back'))  { setState('waiting'); return; }
      if (e.target.closest('#ava-fq-close')) { setState('help');    return; }
      /* accordion: details/summary gestionado nativamente por el browser */
    });

    /* ── Click FUERA del avatar → modo espera ──
       Se activa solo si el avatar está en modo help o faq */
    document.addEventListener('click', function (e) {
      if (S.mode !== 'help' && S.mode !== 'faq') return;
      if (modalEl.classList.contains('open')) return;
      var inside = e.target.closest('#ava-wrap') ||
                   e.target.closest('#ava-faq');
      if (!inside) setState('waiting');
    }, true); /* capture=true para atrapar antes que stopPropagation */

    /* ── Doble clic desktop para reaparición ── */
    document.addEventListener('dblclick', function (e) {
      if (S.mode !== 'hidden') return;
      if (e.target.closest('#ava-wrap, #ava-faq, #ava-modal')) return;
      respawnAt(e.clientX, e.clientY);
    });

    /* ── Doble TAP móvil para reaparición ──
       (dblclick no es fiable en todos los móviles) */
    document.addEventListener('touchend', function (e) {
      if (S.mode !== 'hidden') return;
      if (e.target.closest('#ava-wrap') ||
          e.target.closest('#ava-faq')  ||
          e.target.closest('#ava-modal')) return;

      var now = Date.now();
      if (now - S.lastTap < 350) {           /* 350ms = ventana doble tap */
        var t = e.changedTouches[0];
        respawnAt(t.clientX, t.clientY);
        S.lastTap = 0;
        e.preventDefault();
      } else {
        S.lastTap = now;
      }
    }, { passive: false });
  }

  /* ── Reaparición en coordenadas (desktop + móvil) ── */
  function respawnAt(cx, cy) {
    var now = Date.now();
    if (now - S.lastDbl < C.cool) return;
    S.lastDbl = now;

    var vw = window.innerWidth, vh = window.innerHeight;
    var sz = C.SIZE;
    var x  = Math.max(0, Math.min(cx - sz / 2, vw - sz - 10));
    var y  = Math.max(70, Math.min(cy - sz / 2, vh - sz - 20));

    wrap.className       = 'ava-on';
    wrap.style.left      = x + 'px';
    wrap.style.top       = y + 'px';
    wrap.style.right     = 'auto';
    wrap.style.transform = 'none';

    popIn();
    setState('waiting');
  }

  /* ══════════════════════════════════════════════
     FAQ HTML — generado desde array (sin repetición)
  ══════════════════════════════════════════════ */
  function buildFAQHTML() {
    var items = [
      {
        q: 'c\u00f3mo funciona este asistente?',
        a: '\u00a1Hola! Soy Nara, la gu\u00eda de este portfolio. Aparezco autom\u00e1ticamente para darte la bienvenida y acompa\u00f1arte mientras exploras el sitio. Puedes hacerme <strong>clic</strong> para acceder a preguntas frecuentes, desactivar oh <strong>arrastrarme</strong> donde prefieras, y si me cierras, vuelvo con un <strong>doble clic</strong> en cualquier parte de la pantalla.'
      },
      {
        q: '\u00bfCu\u00e1nto cuesta un sitio web como este?',
        a: 'Un e-commerce profesional similar a este parte desde <strong>$450 USD</strong>, sin incluir el asistente de avatar \u2014 que es un m\u00f3dulo adicional. El precio final var\u00eda seg\u00fan el n\u00famero de secciones, animaciones e integraciones.'
      },
      {
        q: '\u00bfQu\u00e9 incluye exactamente este tipo de sitio?',
        a: 'Incluye una <strong>landing page de primer nivel</strong> con dise\u00f1o avanzado de marca, m\u00faltiples secciones estrat\u00e9gicas y animaciones que generan confianza y proyectan una imagen exclusiva. Adem\u00e1s, incorpora una <strong>tienda e-commerce completa</strong> con todas las funcionalidades profesionales: cat\u00e1logo de productos, carrito de compras, proceso de pago integrado y gesti\u00f3n de inventario. Todo pensado para posicionar tu marca al m\u00e1s alto nivel.'
      },
      {
        q: '\u00bfCu\u00e1nto tarda la entrega y qu\u00e9 soporte incluye?',
        a: 'El tiempo de entrega es de <strong>7 a 14 d\u00edas h\u00e1biles</strong> seg\u00fan la complejidad. Incluye <strong>30 d\u00edas de soporte</strong> post-entrega para ajustes y revisiones sin costo adicional.'
      },
      {
        q: '\u00bfC\u00f3mo puedo tener mi propio sitio web?',
        a: '\u00a1Es muy sencillo! Esc\u00edbeme por WhatsApp, cu\u00e9ntame tu proyecto y te respondo con una propuesta sin compromiso. Estoy listo para ayudarte a construir la presencia digital que te representa.',
        wa: true
      }
    ];

    /* WA icon SVG inline */
    var WA =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">' +
        '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
        '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
        '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
        '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
        '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372' +
        '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2' +
        ' 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118' +
        '.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347' +
        'm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374' +
        'a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898' +
        'a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884' +
        'm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892' +
        'c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005' +
        'c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
      '</svg>';

    /* Cabecera */
    var head =
      '<div class="afq-head">' +
        '<div class="afq-label-row">' +
          '<div class="afq-line"></div>' +
          '<span class="afq-label">FAQ &middot; Nara</span>' +
          '<div class="afq-line"></div>' +
        '</div>' +
        '<h2 class="afq-title">Preguntas <span class="afq-accent">Frecuentes</span></h2>' +
      '</div>' +
      '<div class="afq-ctrls">' +
        '<button class="afq-ctrl" id="ava-fq-back">\u2190 Volver</button>' +
        '<button class="afq-ctrl" id="ava-fq-close">\u2715 Cerrar</button>' +
      '</div>';

    /* Items generados desde el array */
    var body = items.map(function (item) {
      var waBtn = item.wa
        ? '<a class="afq-wa-btn" href="' + C.wa + '" target="_blank" rel="noopener">' +
            WA + ' Escribirme por WhatsApp' +
          '</a>'
        : '';
      return (
        '<div class="afq-item">' +
          /* bordes animados */
          '<div class="afq-bdr afq-bdr-top"></div>' +
          '<div class="afq-bdr afq-bdr-bot"></div>' +
          '<div class="afq-bdr afq-bdr-lft"></div>' +
          '<div class="afq-bdr afq-bdr-rgt"></div>' +
          '<details class="afq-details">' +
            '<summary class="afq-summary">' +
              '<span class="afq-q-text">' + item.q + '</span>' +
              '<span class="afq-arrow">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>' +
              '</span>' +
            '</summary>' +
            '<div class="afq-answer">' +
              '<p>' + item.a + '</p>' +
              waBtn +
            '</div>' +
          '</details>' +
        '</div>'
      );
    }).join('');

    return head + '<div class="afq-list">' + body + '</div>';
  }

  /* ══════════════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════════════ */
  function mk(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function mkBtn(id, html, title) {
    var b = mk('button', { class: 'ava-btn', id: id, title: title });
    b.innerHTML = html;
    return b;
  }

  /* ══════════════════════════════════════════════
     CSS — alineado con el portfolio
     Paleta:
       bg-primary    #0a0e27
       bg-card       #1a1f3a
       accent        #00d4ff
       border        rgba(255,255,255,0.1)
       text-sec      rgba(255,255,255,0.7)
  ══════════════════════════════════════════════ */
  function buildCSS() {
    var AC  = '#00d4ff';       /* accent-primary  */
    var AC2 = '#0066ff';       /* accent-secondary */
    var BGP = '#0a0e27';       /* bg-primary       */
    var BGC = '#1a1f3a';       /* bg-card          */
    var BG2 = '#131729';       /* bg-secondary     */
    var BD  = 'rgba(255,255,255,0.1)';
    var sz  = C.SIZE;
    var half = sz / 2;

    /* semicírculo: radio 52px bajo el centro del avatar
   izquierda(210°) | abajo(270°) | derecha(330°) */
var r  = 52;        /* radio fijo */
var bsz = 30;        /* tamaño botones */
var bh  = bsz / 2;
var half = sz / 2;   /* centro del círculo - ÚNICA DECLARACIÓN */

/* ángulos en radianes */
function bPos(deg) {
  var rad = deg * Math.PI / 180;
  return {
    l: Math.round(half + r * Math.cos(rad) - bh),
    t: Math.round(half + r * Math.sin(rad) - bh)
  };
}

/* posiciones abajo: 210° (izq), 270° (centro), 330° (der) */
var p1 = bPos(210);  /* botón FAQ */
var p2 = bPos(270);  /* botón CLOSE */
var p3 = bPos(330);  /* botón BACK */

    return '' +
      /* WRAP */
      '#ava-wrap{' +
        'display:none;position:fixed;z-index:9100;' +
        'width:' + sz + 'px;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
      '}' +
      '#ava-wrap.ava-on{display:block;}' +
      '#ava-wrap.pos-default{top:74px;right:20px;left:auto;transform:none;}' +
      '#ava-wrap.pos-center{top:74px;left:50%;right:auto;transform:translateX(-50%);}' +

      /* CÍRCULO */
      '#ava-c{' +
        'width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;' +
        'cursor:pointer;user-select:none;-webkit-user-select:none;' +
        'position:relative;overflow:visible;' +
      '}' +
      '#ava-img{' +
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'object-fit:cover;border-radius:50%;' +
        'display:block;pointer-events:none;' +
        'border:2px solid ' + BD + ';' +
        'box-shadow:0 0 0 1px rgba(0,212,255,0.15), 0 6px 28px rgba(0,0,0,0.65);' +
        'transition:box-shadow .3s;' +
      '}' +
      '#ava-c:hover #ava-img{' +
        'box-shadow:0 0 0 1px rgba(0,212,255,0.4), 0 0 18px rgba(0,212,255,0.2), 0 10px 36px rgba(0,0,0,0.8);' +
      '}' +

      /* POP ANIMATION */
      '@keyframes ava-pop{' +
        '0%  {opacity:0;transform:scale(.1) translateY(20px);}' +
        '65% {opacity:1;transform:scale(1.07) translateY(-4px);}' +
        '100%{opacity:1;transform:scale(1)  translateY(0);}' +
      '}' +
      '#ava-c.ava-pop{animation:ava-pop .6s cubic-bezier(.34,1.56,.64,1) both;}' +

      /* BOTONES SEMICÍRCULO */
      '.ava-btn{' +
        'position:absolute;width:34px;height:34px;border-radius:50%;' +
        'background:rgba(10,10,10,.98);' +
        'border:1.5px solid rgba(255,255,255,.09);' +
        'color:#666;font-size:14px;' +
        'cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
        'opacity:0;transform:scale(.2);pointer-events:none;' +
        'transition:opacity .22s,transform .3s cubic-bezier(.34,1.56,.64,1),' +
          'background .15s,color .15s,border-color .15s;' +
        'box-shadow:0 4px 18px rgba(0,0,0,.55);' +
        'font-family:inherit;outline:none;' +
      '}' +
      '.ava-btn.show{opacity:1;transform:scale(1);pointer-events:all;}' +
      '.ava-btn:hover{background:#1c1c1c;color:#ddd;border-color:rgba(255,255,255,.18);}' +
      /* semicírculo a ~58px del centro, ángulos: 210° | 270° | 330° */
      '#ava-b-faq  {left:-15px;top:88px;transition-delay:.06s;}' +
      '#ava-b-close{left:29px ;top:101px;transition-delay:.02s;}' +
      '#ava-b-back {left:73px ;top:88px ;transition-delay:0s;}' +

      /* ══ FAQ PANEL ══ */
      '#ava-faq{' +
        'display:none;position:fixed;' +
        'top:172px;left:50%;transform:translateX(-50%);' +
        'width:min(640px,92vw);' +
        'background:' + BGP + ';' +
        'border:1px solid rgba(255,255,255,0.06);' +
        'padding:28px 24px 28px;' +
        'z-index:9090;' +
        'box-shadow:0 24px 64px rgba(0,0,0,0.78);' +
        'max-height:68vh;overflow-y:auto;' +
        'font-family:inherit;' +
      '}' +
      '#ava-faq.open{display:block;}' +
      '#ava-faq::-webkit-scrollbar{width:3px;}' +
      '#ava-faq::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px;}' +

      /* cabecera FAQ */
      '.afq-head{text-align:center;margin-bottom:20px;}' +
      '.afq-label-row{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;}' +
      '.afq-line{width:36px;height:1px;background:linear-gradient(90deg,transparent,' + AC + '66,transparent);}' +
      '.afq-label{font-size:.58rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:' + AC + ';opacity:.7;}' +
      '.afq-title{font-size:1.1rem;font-weight:700;color:#fff;letter-spacing:.04em;text-transform:uppercase;line-height:1.2;margin:0;}' +
      '.afq-accent{color:' + AC + ';}' +

      /* controles */
      '.afq-ctrls{display:flex;justify-content:flex-end;gap:6px;margin-bottom:18px;}' +
      '.afq-ctrl{padding:4px 12px;border:1px solid rgba(255,255,255,0.08);background:transparent;' +
        'color:rgba(255,255,255,0.3);font-size:.68rem;cursor:pointer;letter-spacing:.06em;' +
        'transition:border-color .2s,color .2s;font-family:inherit;}' +
      '.afq-ctrl:hover{border-color:' + AC + ';color:' + AC + ';}' +

      /* lista */
      '.afq-list{display:flex;flex-direction:column;gap:8px;}' +

      /* item = wrapper relativo con bordes animados */
      '.afq-item{position:relative;background:' + BG2 + ';border:1px solid rgba(255,255,255,0.07);}' +

      /* bordes animados en hover (igual que el portfolio de referencia) */
      '.afq-bdr{position:absolute;background:' + AC + ';transition:all .28s ease;pointer-events:none;}' +
      '.afq-bdr-top{top:0;left:0;width:0;height:1px;}' +
      '.afq-bdr-bot{bottom:0;right:0;width:0;height:1px;}' +
      '.afq-bdr-lft{top:0;left:0;width:1px;height:0;transition-delay:.14s;}' +
      '.afq-bdr-rgt{bottom:0;right:0;width:1px;height:0;transition-delay:.14s;}' +
      '.afq-item:hover .afq-bdr-top{width:100%;}' +
      '.afq-item:hover .afq-bdr-bot{width:100%;}' +
      '.afq-item:hover .afq-bdr-lft{height:100%;}' +
      '.afq-item:hover .afq-bdr-rgt{height:100%;}' +

      /* details/summary nativo */
      '.afq-details{width:100%;}' +
      '.afq-summary{' +
        'padding:14px 18px;cursor:pointer;list-none;' +
        'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
        'outline:none;' +
      '}' +
      '.afq-summary::-webkit-details-marker{display:none;}' +
      '.afq-q-text{font-size:.78rem;font-weight:600;color:rgba(255,255,255,0.82);' +
        'letter-spacing:.03em;text-transform:uppercase;line-height:1.5;}' +
      '.afq-arrow{' +
        'width:26px;height:26px;border-radius:50%;flex-shrink:0;' +
        'border:1px solid rgba(255,255,255,0.15);' +
        'display:flex;align-items:center;justify-content:center;' +
        'color:' + AC + ';transition:border-color .2s,transform .35s;' +
      '}' +
      '.afq-details[open] .afq-arrow{transform:rotate(180deg);}' +
      '.afq-item:hover .afq-arrow{border-color:' + AC + ';}' +
      '.afq-answer{' +
        'padding:0 18px 18px;' +
        'border-top:1px solid rgba(255,255,255,0.06);' +
        'padding-top:12px;' +
      '}' +
      '.afq-answer p{font-size:.76rem;color:rgba(255,255,255,0.42);line-height:1.85;}' +
      '.afq-answer strong{color:rgba(255,255,255,0.72);}' +

      /* botón WhatsApp */
      '.afq-wa-btn{' +
        'display:inline-flex;align-items:center;gap:7px;margin-top:14px;' +
        'padding:8px 16px;' +
        'background:rgba(37,211,102,0.04);' +
        'border:1px solid rgba(37,211,102,0.2);' +
        'color:#4ade80;font-size:.73rem;font-weight:600;' +
        'text-decoration:none;transition:background .18s,border-color .18s;' +
        'font-family:inherit;letter-spacing:.04em;' +
      '}' +
      '.afq-wa-btn:hover{background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.4);}' +

      /* ══ MODAL ══ */
      '#ava-modal{' +
        'display:none;position:fixed;inset:0;' +
        'background:rgba(0,0,0,0.82);z-index:10000;' +
        'align-items:center;justify-content:center;' +
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      '}' +
      '#ava-modal.open{display:flex;}' +
      '#ava-mbox{' +
        'background:' + BGP + ';' +
        'border:1px solid rgba(255,255,255,0.08);' +
        'padding:34px 28px;' +
        'max-width:310px;width:88vw;text-align:center;' +
        'box-shadow:0 28px 68px rgba(0,0,0,0.86);font-family:inherit;' +
        'position:relative;' +
      '}' +
      /* bordes en el modal también */
      '#ava-mbox::before{' +
        'content:"";position:absolute;top:0;left:0;right:0;height:1px;' +
        'background:linear-gradient(90deg,transparent,' + AC + '55,transparent);' +
      '}' +
      '#ava-mbox h3{font-size:.88rem;font-weight:700;color:#fff;margin:0 0 13px;' +
        'text-transform:uppercase;letter-spacing:.08em;}' +
      '#ava-mbox p{font-size:.75rem;color:rgba(255,255,255,0.38);line-height:1.9;margin:0;}' +
      '#ava-mbox strong{color:rgba(255,255,255,0.7);}' +
      '#ava-mok{' +
        'margin-top:22px;padding:8px 24px;' +
        'background:transparent;border:1px solid rgba(255,255,255,0.12);' +
        'color:rgba(255,255,255,0.45);font-size:.73rem;letter-spacing:.08em;' +
        'text-transform:uppercase;cursor:pointer;transition:border-color .2s,color .2s;' +
        'font-family:inherit;' +
      '}' +
      '#ava-mok:hover{border-color:' + AC + ';color:' + AC + ';}';
  }

})();