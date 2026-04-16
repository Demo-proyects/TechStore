📄 Documentación completa del proyecto
1. Estructura general
El proyecto es una tienda online de tecnología (TechStore) compuesta por dos páginas principales:

index.html – Página de inicio con hero slider, categorías, productos destacados, sección de audio, smartwatch, historia, ubicación y footer.

tienda.html – Catálogo completo con filtros por categoría, búsqueda, ordenación, rango de precio, cuadrícula de productos, carrito lateral y modal de producto.

Archivos JS:

scripts.js – Animaciones GSAP, tema oscuro/claro, menú móvil, slider del hero.

tienda.js – Lógica completa de la tienda: productos (DB), filtros, renderizado, carrito (localStorage), modal, etc.

fixes.js – Correcciones centralizadas (logo, z-index, modo claro, carrito para index, limpieza de NaN).

avatar.js – (no se usa directamente, pero está referenciado; puede eliminarse si no se necesita).

Archivo CSS:

styles.css – Variables de tema, estilos globales, componentes, responsive.

2. Funcionalidades clave
Tema oscuro/claro
Controlado por data-theme en el elemento <html>.

Botón de toggle en el header.

Variables CSS que se adaptan automáticamente.

Menú móvil
Se activa con el botón hamburguesa.

Clase .mobile-menu con transform: translateX(-100%) y .active para mostrarlo.

Se cierra al hacer clic fuera.

Slider del hero (index y tienda)
4 imágenes que rotan cada 4 segundos.

Dots indicadores y navegación manual.

Catálogo (tienda.html)
Filtros por categoría (píldoras).

Búsqueda por nombre/marca.

Ordenación por precio (asc/desc) y valoración.

Rango de precio dinámico (máximo se ajusta al producto más caro).

Carga progresiva (botón "CARGAR MÁS").

Tarjetas de producto con efecto hover, badge, botón de añadir al carrito y corazón de favoritos (solo visual).

Carrito de compras
Almacenamiento en localStorage con clave ts_cart.

En tienda.html lo gestiona tienda.js (funciones addToCart, removeFromCart, updateQty, etc.).

En index.html lo gestiona fixes.js (carrito independiente pero compatible con el mismo localStorage).

Drawer lateral que se abre desde el FAB o el icono del header.

Muestra total, cantidad, permite eliminar y vaciar.

Modal de producto (solo tienda)
Al hacer clic en una tarjeta se abre un panel lateral con detalles ampliados: especificaciones, colores, selector de cantidad, botón de añadir.

Navegación
El logo (TECH STORE) redirige siempre a index.html.

Enlaces internos de index.html hacen scroll suave a las secciones.

Enlaces a tienda.html con filtro predefinido (?filter=smartphones, etc.) funcionan correctamente.

3. Problemas resueltos en esta entrega
Problema	Causa	Solución aplicada
Botones "añadir al carrito" no funcionaban en tienda	fixes.js sobrescribía las funciones de tienda.js	En fixes.js se detecta si es tienda.html y no redefine el carrito.
Carrito mostraba NaN	Precios almacenados como string (con $) o datos corruptos	Se añadió función sanitizeCart() que limpia el localStorage y convierte a número.
Logo no redirige a index.html	Faltaba el evento click en ambas páginas	fixLogoRedirection() añade evento al logo desde fixes.js universal.
Menú móvil debajo de los filtros	z-index insuficiente (40 vs 40)	Se inyecta CSS con z-index: 60 !important para el menú móvil.
Texto poco legible en modo claro	Opacidades y colores heredados	Se inyectan estilos específicos para aumentar contraste en textos secundarios.
4. Posibles mejoras futuras (recomendaciones)
Unificar el carrito en un solo archivo
Actualmente tienda.js y fixes.js tienen su propia lógica. Lo óptimo sería exportar un módulo común o utilizar una única fuente de verdad (por ejemplo, mover todo el carrito a fixes.js y que tienda.js lo consuma).

Sistema de favoritos (wishlist) real
Ahora solo muestra un toast. Se podría guardar en localStorage y mostrar un icono relleno.

Paginación en lugar de "Cargar más"
Para catálogos grandes, conviene una paginación clásica o infinite scroll.

Mejorar el rendimiento de imágenes
Usar lazy loading nativo (loading="lazy") y formatos modernos (WebP).

Añadir filtro por rango de precio también en móvil
Actualmente solo visible en escritorio.

Internacionalización
Los textos están en español, pero se podría preparar para multi-idioma.

Mejorar accesibilidad
Añadir atributos aria a los elementos interactivos, manejo de foco, etc.

Sistema de reseñas real
Conectar a una API o backend para que los usuarios dejen reseñas.

Proceso de checkout
Actualmente solo muestra un mensaje. Se podría integrar con pasarelas de pago (PayPal, Stripe, etc.).

Registro de usuarios
Para guardar el carrito entre sesiones y ver pedidos anteriores.