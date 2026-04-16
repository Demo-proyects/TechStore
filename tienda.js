/* ═══════════════════════ HERO SLIDER ═══════════════════════ */
(function(){
  let c=0;
  const sl=document.querySelectorAll('.hero-slide'),dt=document.querySelectorAll('.dot');
  function go(n){sl[c].classList.remove('active');dt[c].classList.remove('active');c=(n+sl.length)%sl.length;sl[c].classList.add('active');dt[c].classList.add('active')}
  dt.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
  setInterval(()=>go(c+1),5000);
})();

/* ═══════════════════════ THEME ═══════════════════════ */
function toggleTheme(){
  const t=document.body.getAttribute('data-theme')==='light'?null:'light';
  t?document.body.setAttribute('data-theme','light'):document.body.removeAttribute('data-theme');
  localStorage.setItem('theme',t||'dark');
}
(()=>{if(localStorage.getItem('theme')==='light')document.body.setAttribute('data-theme','light')})();
function toggleMobileMenu(){document.getElementById('mobileMenu').classList.toggle('active')}

/* ═══════════════════════ MOBILE SORT ═══════════════════════ */
let mobileSortVal='default';
function toggleSortPanel(){
  const p=document.getElementById('mobile-sort-panel');
  const b=document.getElementById('mobile-sort-btn');
  p.classList.toggle('open');b.classList.toggle('active');
}
function setSort(val,label){
  mobileSortVal=val;
  document.getElementById('mobile-sort-label').textContent=label;
  document.getElementById('sort-select').value=val;
  document.querySelectorAll('#mobile-sort-panel .sort-opt').forEach(o=>o.classList.toggle('selected',o.dataset.val===val));
  document.getElementById('mobile-sort-panel').classList.remove('open');
  document.getElementById('mobile-sort-btn').classList.remove('active');
  applyFilters();
}
function syncSearch(v){
  document.getElementById('search-input').value=v;
  applyFilters();
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#mobile-sort-btn')&&!e.target.closest('#mobile-sort-panel'))
    document.getElementById('mobile-sort-panel')?.classList.remove('open');
});

/* ═══════════════════════ PRODUCT DATABASE ═══════════════════════ */
const DB=[
  /* SMARTPHONES */
  {id:101,brand:'Samsung',name:'Galaxy S24 Ultra 256GB',category:'smartphones',subcat:'Android',price:29999,rating:4.9,reviews:312,badge:'NUEVO',
   colors:['Titanium Black','Titanium Gray','Titanium Violet'],
   specs:[['Procesador','Snapdragon 8 Gen 3'],['RAM','12 GB'],['Almacenamiento','256 GB'],['Pantalla','6.8" Dynamic AMOLED']],
   img:'https://images.unsplash.com/photo-1707438095902-cc23b01ac7a2?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNhbXN1bmclMjBwaG9uZXxlbnwwfHwwfHx8MA%3D%3D'},
  {id:102,brand:'Apple',name:'iPhone 15 Pro Max 512GB',category:'smartphones',subcat:'iOS',price:38999,rating:4.9,reviews:418,badge:'BESTSELLER',
   colors:['Natural Titanium','Blue Titanium','White Titanium','Black Titanium'],
   specs:[['Chip','A17 Pro'],['RAM','8 GB'],['Almacenamiento','512 GB'],['Pantalla','6.7" Super Retina XDR']],
   img:'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700&h=600&fit=crop'},
  {id:103,brand:'Xiaomi',name:'Xiaomi 14 Pro 256GB',category:'smartphones',subcat:'Android',price:18499,rating:4.7,reviews:198,
   colors:['White','Black','Green'],
   specs:[['Procesador','Snapdragon 8 Gen 3'],['RAM','12 GB'],['Almacenamiento','256 GB'],['Cámara','50MP Leica']],
   img:'https://imagenes.20minutos.es/files/image_640_auto/uploads/imagenes/2024/04/09/trasera-xiaomi-14.jpeg'},
  {id:104,brand:'OnePlus',name:'OnePlus 12 256GB 5G',category:'smartphones',subcat:'Android',price:16999,rating:4.8,reviews:245,badge:'OFERTA',
   colors:['Silky Black','Flowy Emerald'],
   specs:[['Procesador','Snapdragon 8 Gen 3'],['RAM','12 GB'],['Carga','100W SUPERVOOC'],['Batería','5400 mAh']],
   img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&h=600&fit=crop'},
  {id:105,brand:'Google',name:'Pixel 8 Pro 128GB',category:'smartphones',subcat:'Android',price:22499,rating:4.8,reviews:176,
   colors:['Obsidian','Porcelain','Bay'],
   specs:[['Chip','Google Tensor G3'],['RAM','12 GB'],['Cámara Principal','50 MP'],['IA','Google AI Integrada']],
   img:'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&h=600&fit=crop'},
  /* MACBOOKS/TABLETS */
  {id:201,brand:'Apple',name:'MacBook Pro M3 14"',category:'macbooks',subcat:'MacBook',price:89999,rating:4.9,reviews:287,badge:'M3',
   colors:['Space Black','Silver'],
   specs:[['Chip','Apple M3 Pro'],['RAM','18 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','14.2" Liquid Retina XDR']],
   img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&h=600&fit=crop'},
  {id:202,brand:'Apple',name:'MacBook Air M2 13.6"',category:'macbooks',subcat:'MacBook',price:65999,rating:4.9,reviews:352,badge:'POPULAR',
   colors:['Midnight','Starlight','Space Gray','Silver'],
   specs:[['Chip','Apple M2'],['RAM','8 GB'],['Almacenamiento','256 GB SSD'],['Autonomía','18 horas']],
   img:'img/mackbook-1.avif'},
  {id:203,brand:'Apple',name:'iPad Pro M2 12.9"',category:'macbooks',subcat:'iPad',price:54999,rating:4.8,reviews:203,
   colors:['Silver','Space Gray'],
   specs:[['Chip','Apple M2'],['Pantalla','12.9" Liquid Retina XDR'],['Almacenamiento','128 GB'],['Conectividad','Wi-Fi 6E · 5G']],
   img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=700&h=600&fit=crop'},
  {id:204,brand:'Apple',name:'iPad Air 5ª Gen 10.9"',category:'macbooks',subcat:'iPad',price:38999,rating:4.7,reviews:165,badge:'OFERTA',
   colors:['Blue','Pink','Purple','Starlight','Space Gray'],
   specs:[['Chip','Apple M1'],['Pantalla','10.9" Liquid Retina'],['Almacenamiento','64 GB'],['Peso','461 g']],
   img:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&h=600&fit=crop'},
  {id:205,brand:'Samsung',name:'Galaxy Tab S9 Ultra 256GB',category:'smartphones',subcat:'Android Tab',price:42999,rating:4.7,reviews:142,
   colors:['Beige','Graphite'],
   specs:[['Procesador','Snapdragon 8 Gen 2'],['RAM','12 GB'],['Pantalla','14.6" Dynamic AMOLED'],['S Pen','Incluido']],
   img:'https://images.unsplash.com/photo-1721864428881-dbabb9ea0017?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2Ftc3VuZyUyMHBob25lfGVufDB8fDB8fHww'},
  /* LAPTOPS */
  {id:301,brand:'Dell',name:'XPS 15 9530 Core i9 RTX 4070',category:'laptops',subcat:'Windows',price:78999,rating:4.8,reviews:189,badge:'PRO',
   colors:['Platinum Silver','Graphite'],
   specs:[['Procesador','Core i9-13900H'],['GPU','RTX 4070'],['RAM','32 GB DDR5'],['Pantalla','15.6" OLED 3.5K']],
   img:'https://images.unsplash.com/photo-1578950435899-d1c1bf932ab2?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:302,brand:'Lenovo',name:'ThinkPad X1 Carbon Gen 11',category:'laptops',subcat:'Windows',price:62999,rating:4.8,reviews:211,
   colors:['Deep Black'],
   specs:[['Procesador','Core i7-1365U'],['RAM','16 GB LPDDR5'],['Almacenamiento','512 GB SSD'],['Peso','1.12 kg']],
   img:'https://images.unsplash.com/photo-1575320854760-bfffc3550640?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:303,brand:'ASUS',name:'ROG Zephyrus G14 RTX 4060',category:'laptops',subcat:'Gaming',price:69999,badge:'GAMING',rating:4.9,reviews:334,
   colors:['Eclipse Gray','Moonlight White'],
   specs:[['Procesador','Ryzen 9 7940HS'],['GPU','RTX 4060'],['RAM','16 GB DDR5'],['Pantalla','14" QHD+ 165Hz']],
   img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&h=600&fit=crop'},
  {id:304,brand:'HP',name:'Spectre x360 14 Core i7',category:'laptops',subcat:'Windows',price:55999,rating:4.7,reviews:157,
   colors:['Nightfall Black','Poseidon Blue'],
   specs:[['Procesador','Core i7-1355U'],['RAM','16 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','13.5" 3K2K OLED']],
   img:'https://images.unsplash.com/photo-1637191624218-a757a2456908?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:305,brand:'Microsoft',name:'Surface Laptop Studio 2',category:'laptops',subcat:'Windows',price:59999,rating:4.6,reviews:98,badge:'NUEVO',
   colors:['Platinum','Graphite'],
   specs:[['Procesador','Core i7-13700H'],['GPU','RTX 4060'],['RAM','16 GB'],['Pantalla','14.4" PixelSense Flow']],
   img:'https://images.unsplash.com/photo-1618410320928-25228d811631?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  /* CONSOLAS */
  {id:401,brand:'Sony',name:'PlayStation 5 Disc Edition',category:'consolas',subcat:'Consola',price:32999,rating:4.9,reviews:678,badge:'PS5',
   colors:['White/Black'],
   specs:[['CPU','AMD Zen 2 8 Cores'],['GPU','AMD RDNA 2 10.3 TFLOPS'],['Almacenamiento','825 GB SSD'],['Resolución','Hasta 8K']],
   img:'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=700&h=600&fit=crop'},
  {id:402,brand:'Microsoft',name:'Xbox Series X 1TB',category:'consolas',subcat:'Consola',price:29999,rating:4.8,reviews:523,
   colors:['Carbon Black'],
   specs:[['CPU','AMD Zen 2 8 Cores'],['GPU','12 TFLOPS'],['Almacenamiento','1 TB NVMe SSD'],['Resolución','Hasta 8K']],
   img:'https://images.unsplash.com/photo-1619382581049-c87bedd3b479?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDMwfHx8ZW58MHx8fHx8'},
  {id:403,brand:'Nintendo',name:'Switch OLED Model',category:'consolas',subcat:'Consola',price:19999,rating:4.9,reviews:891,badge:'POPULAR',
   colors:['White','Neon Blue/Neon Red'],
   specs:[['Pantalla','7" OLED 720p'],['Autonomía','4.5–9 horas'],['Almacenamiento','64 GB'],['Modo','TV · Portátil · Sobremesa']],
   img:'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=700&h=600&fit=crop'},
  {id:404,brand:'Valve',name:'Steam Deck 512GB OLED',category:'consolas',subcat:'Consola',price:28999,rating:4.8,reviews:312,badge:'NUEVO',
   colors:['Black'],
   specs:[['CPU','AMD Zen 2 4 Cores'],['Pantalla','7.4" OLED HDR'],['Almacenamiento','512 GB NVMe'],['Autonomía','3–12 horas']],
   img:'https://preview.redd.it/better-pictures-of-the-512gb-glossy-steam-deck-oled-along-v0-ppdid2uj901c1.jpg?width=640&crop=smart&auto=webp&s=4e1740fb51dbdd989e6bed1e6a97be270e5e7d6b'},
  {id:405,brand:'Sony',name:'DualSense PS5 Controller',category:'consolas',subcat:'Maneta',price:4999,rating:4.9,reviews:445,
   colors:['White','Midnight Black','Cosmic Red','Starlight Blue','Nova Pink'],
   specs:[['Gatillos','Adaptativos hápticos'],['Conectividad','Bluetooth 5.1'],['Batería','Li-Ion integrada'],['Compatible','PS5 · PC · Mobile']],
   img:'https://images.unsplash.com/photo-1670535787441-0ab6d150c972?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:406,brand:'Microsoft',name:'Xbox Wireless Controller',category:'consolas',subcat:'Maneta',price:3499,rating:4.8,reviews:387,badge:'OFERTA',
   colors:['Carbon Black','Robot White','Shock Blue','Pulse Red'],
   specs:[['Conectividad','Bluetooth 5.0 · USB-C'],['Autonomía','40 horas'],['Compatible','Xbox · PC · Mobile'],['Textura','Anti-slip grip']],
   img:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=700&h=600&fit=crop'},
  {id:407,brand:'Nintendo',name:'Pro Controller Switch',category:'consolas',subcat:'Maneta',price:3299,rating:4.7,reviews:256,
   colors:['Black'],
   specs:[['Conectividad','Bluetooth · USB-C'],['Autonomía','40 horas'],['Giroscopio','6 ejes'],['Amiibo','NFC integrado']],
   img:'img/Pro-Controller-Switch.jpeg'},
  /* AUDIO */
  {id:501,brand:'Sony',name:'WH-1000XM5 Noise Cancelling',category:'audio',subcat:'Auriculares',price:9799,rating:4.9,reviews:543,badge:'TOP',
   colors:['Black','Midnight Blue','Silver'],
   specs:[['ANC','30 dB reducción'],['Autonomía','30 horas'],['Conectividad','Bluetooth 5.2 · USB-C'],['Códec','LDAC · AAC · SBC']],
   img:'https://images.unsplash.com/photo-1641893978985-a0c233b14f9b?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:502,brand:'Bose',name:'QuietComfort Ultra Headphones',category:'audio',subcat:'Auriculares',price:8999,rating:4.8,reviews:398,
   colors:['Black','White Smoke','Sandstone'],
   specs:[['ANC','World-class CustomTune'],['Autonomía','24 horas'],['Conectividad','Bluetooth 5.3'],['Modo','Immersive Audio 3D']],
   img:'https://images.unsplash.com/photo-1545127398-14699f92334b?w=700&h=600&fit=crop'},
  {id:503,brand:'Apple',name:'AirPods Pro 2ª Gen USB-C',category:'audio',subcat:'AirPods',price:7499,rating:4.9,reviews:712,badge:'BESTSELLER',
   colors:['White'],
   specs:[['Chip','H2'],['ANC','Activo adaptativo'],['Autonomía','6h + 24h estuche'],['Resistencia','IP54 agua y polvo']],
   img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&h=600&fit=crop'},
  {id:504,brand:'Apple',name:'AirPods Max Lightning',category:'audio',subcat:'AirPods',price:18999,rating:4.7,reviews:234,
   colors:['Space Gray','Silver','Sky Blue','Green','Pink'],
   specs:[['Chip','H1 x2'],['ANC','Activo adaptativo'],['Autonomía','20 horas'],['Material','Aluminio anodizado']],
   img:'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=700&h=600&fit=crop'},
  {id:505,brand:'JBL',name:'Charge 5 Portable Speaker',category:'audio',subcat:'Speaker',price:4299,rating:4.8,reviews:456,badge:'OFERTA',
   colors:['Black','Blue','Red','Teal','White'],
   specs:[['Potencia','40W'],['Autonomía','20 horas'],['Resistencia','IP67'],['PartyBoost','Vincula múltiples']],
   img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&h=600&fit=crop'},
  {id:506,brand:'Marshall',name:'Emberton II Portable Black',category:'audio',subcat:'Speaker',price:3850,rating:4.7,reviews:287,
   colors:['Black & Brass','Cream'],
   specs:[['Potencia','20W total'],['Autonomía','30 horas'],['Resistencia','IP67'],['Driver','2x drivers + 1 radiador pasivo']],
   img:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=700&h=600&fit=crop'},
  {id:507,brand:'Bose',name:'SoundLink Flex Waterproof',category:'audio',subcat:'Speaker',price:4999,rating:4.8,reviews:321,
   colors:['Black','White Smoke','Chestnut','Stone Blue'],
   specs:[['Autonomía','12 horas'],['Resistencia','IP67 + flota en agua'],['Modo','Outdoor Mode'],['Peso','590 g']],
   img:'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=700&h=600&fit=crop'},
  {id:508,brand:'Amazon',name:'Echo Studio Smart Speaker',category:'audio',subcat:'Altavoz Inteligente',price:3999,rating:4.6,reviews:189,
   colors:['Charcoal','Glacier White'],
   specs:[['Drivers','5 altavoces integrados'],['Audio','3D Spatial Audio'],['Asistente','Alexa'],['Smart Home','Hub Zigbee integrado']],
   img:'https://images.unsplash.com/photo-1640826808046-6d4d4faa30c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U21hcnQlMjBTcGVha2VyfGVufDB8fDB8fHww'},
  {id:509,brand:'Google',name:'Nest Audio Smart Speaker',category:'audio',subcat:'Altavoz Inteligente',price:2999,rating:4.5,reviews:156,
   colors:['Chalk','Charcoal','Sand','Sky','Sage'],
   specs:[['Driver','Woofer 75mm + tweeter 19mm'],['Asistente','Google Assistant'],['Multi-room','Chromecast integrado'],['Compatible','Google Home']],
   img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&h=600&fit=crop'},
  /* SMARTWATCH */
  {id:601,brand:'Apple',name:'Apple Watch Series 9 GPS 45mm',category:'smartwatch',subcat:'Apple Watch',price:16999,rating:4.9,reviews:623,badge:'S9',
   colors:['Midnight','Starlight','Red','Pink','Silver'],
   specs:[['Chip','S9 SiP'],['Pantalla','Retina always-on LTPO'],['Autonomía','18 horas'],['Resistencia','WR50m · IP6X']],
   img:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&h=600&fit=crop'},
  {id:602,brand:'Samsung',name:'Galaxy Watch 6 Classic 47mm',category:'smartwatch',subcat:'Android Watch',price:12999,rating:4.7,reviews:312,badge:'NUEVO',
   colors:['Black','Silver'],
   specs:[['Pantalla','Super AMOLED 1.5"'],['Autonomía','40–60 horas'],['Resistencia','5ATM · MIL-STD-810H'],['Biométricos','ECG · BioActive']],
   img:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=888&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:603,brand:'Garmin',name:'Fenix 7 Pro Solar',category:'smartwatch',subcat:'Sport Watch',price:24999,rating:4.8,reviews:178,badge:'PRO',
   colors:['Carbon Gray','Sapphire Solar'],
   specs:[['Pantalla','Solar + AMOLED 1.3"'],['Autonomía','22 días GPS · 37 días reloj'],['Resistencia','10 ATM · MIL-STD-810'],['GPS','Multi-GNSS + TopoActivo']],
   img:'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=700&h=600&fit=crop'},
  /* CÁMARAS */
  {id:701,brand:'Sony',name:'Alpha A7 IV Full Frame Mirrorless',category:'camaras',subcat:'Mirrorless',price:89999,rating:4.9,reviews:287,badge:'TOP',
   colors:['Black'],
   specs:[['Sensor','33 MP BSI-CMOS Full Frame'],['ISO','100–51200'],['Video','4K 60fps · S-Log3'],['Estabilización','5 ejes in-body']],
   img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&h=600&fit=crop'},
  {id:702,brand:'Canon',name:'EOS R6 Mark II Mirrorless',category:'camaras',subcat:'Mirrorless',price:75999,rating:4.8,reviews:213,
   colors:['Black'],
   specs:[['Sensor','24.2 MP CMOS Full Frame'],['Ráfaga','40 fps electrónico'],['Video','4K 60fps · RAW'],['AF','1053 puntos Dual Pixel']],
   img:'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=700&h=600&fit=crop'},
  {id:703,brand:'Nikon',name:'Z8 Full Frame Pro Body',category:'camaras',subcat:'Mirrorless',price:119999,rating:4.9,reviews:156,badge:'PRO',
   colors:['Black'],
   specs:[['Sensor','45.7 MP BSI-CMOS Full Frame'],['ISO','64–25600'],['Video','8K 60fps · ProRes RAW'],['Memoria','2x CFexpress + SD']],
   img:'https://images.unsplash.com/photo-1613235577937-9ac3eed992fc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D'},
  /* DRONES */
  {id:801,brand:'DJI',name:'Mavic 3 Pro Cine Premium',category:'drones',subcat:'Profesional',price:89999,rating:4.9,reviews:198,badge:'CINE',
   colors:['Gray'],
   specs:[['Cámaras','Triple Hasselblad 4/3"'],['Video','5.1K 50fps · DLog-M'],['Autonomía','43 minutos'],['Transmisión','O3+ 15km']],
   img:'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  {id:802,brand:'DJI',name:'Mini 4 Pro 4K HDR',category:'drones',subcat:'Compacto',price:35999,rating:4.8,reviews:342,badge:'BESTSELLER',
   colors:['Gray'],
   specs:[['Peso','< 249g (sin registro)'],['Video','4K 60fps HDR'],['Autonomía','34 minutos'],['Transmisión','O4 20km']],
   img:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=700&h=600&fit=crop'},
  {id:803,brand:'DJI',name:'Air 3 Dual Camera Drone',category:'drones',subcat:'Prosumer',price:49999,rating:4.8,reviews:267,
   colors:['Gray'],
   specs:[['Cámaras','Dual — angular + tele 3x'],['Video','4K 60fps · HDR'],['Autonomía','46 minutos'],['Transmisión','O4 20km']],
   img:'https://images.unsplash.com/photo-1506947411487-a56738267384?w=700&h=600&fit=crop'},
  {id:804,brand:'Autel',name:'EVO Lite+ 6K Camera',category:'drones',subcat:'Profesional',price:42999,rating:4.7,reviews:145,badge:'NUEVO',
   colors:['Premium Orange','Midnight Black'],
   specs:[['Cámara','6K CMOS 1"'],['Video','6K 30fps · 4K 60fps'],['Autonomía','40 minutos'],['Apertura','f/2.8–f/11 variable']],
   img:'https://plus.unsplash.com/premium_photo-1714618849685-89cad85746b1?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJvbmV8ZW58MHx8MHx8fDA%3D'},
  {id:805,brand:'Holy Stone',name:'HS720E 4K EIS GPS Drone',category:'drones',subcat:'Recreativo',price:8999,rating:4.5,reviews:423,badge:'OFERTA',
   colors:['Black'],
   specs:[['Cámara','4K EIS Sony'],['GPS','Return-to-Home automático'],['Autonomía','23 minutos'],['Peso','438g']],
   img:'https://images.unsplash.com/photo-1456615913800-c33540eac399?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
];

/* ═══════════════════════ FILTER CONFIG ═══════════════════════ */
const FILTERS=[
  {id:'all',label:'Todos'},
  {id:'smartphones',label:'Smartphones'},
  {id:'macbooks',label:'Macbooks & Tablets'},
  {id:'laptops',label:'Laptops'},
  {id:'consolas',label:'Consolas & Manetas'},
  {id:'audio',label:'Audio & AirPods'},
  {id:'smartwatch',label:'Smartwatch'},
  {id:'camaras',label:'Cámaras'},
  {id:'drones',label:'Drones'}
];
const TITLES={
  all:'TODOS LOS PRODUCTOS',smartphones:'SMARTPHONES',macbooks:'MACBOOKS & TABLETS',
  laptops:'LAPTOPS',consolas:'CONSOLAS & MANETAS',audio:'AUDIO & AIRPODS',
  smartwatch:'SMARTWATCH',camaras:'CÁMARAS',drones:'DRONES'
};

/* ═══════════════════════ STATE ═══════════════════════ */
let activeFilter='all', visibleCount=12;
const PER_PAGE=12;
let cart=JSON.parse(localStorage.getItem('ts_cart')||'[]');
let modalQty=1, modalProductId=null;

/* ═══════════════════════ FILTER PILLS ═══════════════════════ */
function renderFilterPills(){
  document.getElementById('filter-bar').innerHTML=FILTERS.map(f=>`
    <button class="filter-pill${f.id===activeFilter?' active':''}" onclick="setFilter('${f.id}')">${f.label}</button>
  `).join('');
}
function setFilter(id){
  activeFilter=id;visibleCount=PER_PAGE;
  renderFilterPills();
  applyFilters();
  document.getElementById('store-title').textContent=TITLES[id]||'PRODUCTOS';
  // chip
  const chip=document.getElementById('active-filter-chip');
  if(id==='all'){chip.style.display='none'}else{chip.style.display='inline-flex';chip.textContent=TITLES[id]}
  const url=new URL(window.location);
  id==='all'?url.searchParams.delete('filter'):url.searchParams.set('filter',id);
  history.replaceState(null,'',url);
}

/* ═══════════════════════ APPLY FILTERS ═══════════════════════ */
function applyFilters(){
  const search=document.getElementById('search-input').value.toLowerCase().trim();
  const sort=document.getElementById('sort-select').value;
  const maxPrice=parseInt(document.getElementById('price-range').value);
  let items=DB.filter(p=>{
    const mc=activeFilter==='all'||p.category===activeFilter;
    const ms=!search||p.name.toLowerCase().includes(search)||p.brand.toLowerCase().includes(search);
    const mp=p.price<=maxPrice;
    return mc&&ms&&mp;
  });
  if(sort==='price-asc') items.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc')items.sort((a,b)=>b.price-a.price);
  if(sort==='rating')    items.sort((a,b)=>b.rating-a.rating);
  document.getElementById('results-count').textContent=items.length;
  renderGrid(items,visibleCount);
  document.getElementById('load-more-wrap').style.display=items.length>visibleCount?'block':'none';
}

/* ═══════════════════════ CARD TEMPLATE ═══════════════════════ */
let _cardIndex = 0; // contador global para el número decorativo

function productCard(p){
  const inCart = cart.some(c => c.id === p.id);
  const fullStars = Math.floor(p.rating);
  const halfStar  = p.rating % 1 >= .5;
  const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '');
  const badge = p.badge ? `<div class="pcard-badge">${p.badge}</div>` : '';
  _cardIndex++;
  const num = String(_cardIndex).padStart(2, '0');

  return `
  <div class="pcard" onclick="openModal(${p.id})">
    <div class="pcard-img">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      ${badge}
      <div class="pcard-num">${num}</div>
      <button class="pcard-wish" onclick="wishlist(event,${p.id})" title="Guardar">
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
      </button>
    </div>
    <div class="pcard-sep"></div>
    <div class="pcard-body">
      <div class="pcard-meta">
        <span class="pcard-brand">${p.brand}</span>
        <span class="pcard-subcat">${p.subcat}</span>
      </div>
      <h3 class="pcard-name">${p.name}</h3>
      <div class="pcard-footer">
        <div>
          <span class="pcard-price">$${p.price.toLocaleString()}</span>
          <span class="pcard-stars">${stars} <span class="pcard-rcount">(${p.reviews})</span></span>
        </div>
        <button class="pcard-add${inCart?' in-cart':''}" id="pb-${p.id}" onclick="handleAddClick(event,${p.id})">
          ${inCart ? '✓ AÑADIDO' : 'AÑADIR'}
        </button>
      </div>
    </div>
  </div>`;
}

function renderGrid(items,limit){
  const g=document.getElementById('product-grid');
  const s=items.slice(0,limit);
  if(!s.length){
    g.innerHTML='<div class="empty-grid"><p class="orbitron text-sm tracking-widest" style="color:var(--text-secondary);opacity:.3">NO SE ENCONTRARON PRODUCTOS</p></div>';
    return;
  }
  g.innerHTML=s.map(productCard).join('');
}
function loadMore(){visibleCount+=PER_PAGE;applyFilters()}

/* ═══════════════════════ PRICE RANGE ═══════════════════════ */
function updatePriceLabel(){
  const v=parseInt(document.getElementById('price-range').value);
  document.getElementById('price-label').textContent=v>=200000?'Sin límite':'$'+v.toLocaleString();
}

/* ═══════════════════════ CART ═══════════════════════ */
function saveCart(){localStorage.setItem('ts_cart',JSON.stringify(cart));updateCartUI()}

function addToCart(e,id){
  e.stopPropagation();
  const p=DB.find(x=>x.id===id);if(!p)return;
  const ex=cart.find(c=>c.id===id);
  if(ex)ex.qty++;else cart.push({id:p.id,brand:p.brand,name:p.name,price:p.price,img:p.img,qty:1});
  saveCart();
  const btn=document.getElementById('pb-'+id);
  if(btn){btn.textContent='✓ Añadido';btn.classList.add('in-cart')}
  showToast('✓ '+p.brand+' añadido al carrito');
}

function handleAddClick(e,id){
  e.stopPropagation();
  // Si el carrito está vacío, abre el modal del producto
  // Si el carrito tiene items, agrega directamente
  if(cart.length===0){
    openModal(id);
  }else{
    addToCart(e,id);
  }
}

function removeFromCart(id){cart=cart.filter(c=>c.id!==id);saveCart();applyFilters()}
function updateQty(id,delta){
  const it=cart.find(c=>c.id===id);if(!it)return;
  it.qty+=delta;
  if(it.qty<=0)removeFromCart(id);else saveCart();
}
function clearCart(){cart=[];saveCart();applyFilters()}

function updateCartUI(){
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const count=cart.reduce((s,c)=>s+c.qty,0);
  const fab=document.getElementById('cart-count');
  const hcc=document.getElementById('header-cart-count');
  fab.textContent=count;fab.style.display=count>0?'flex':'none';
  if(hcc){hcc.textContent=count;hcc.style.display=count>0?'flex':'none'}
  document.getElementById('cart-total').textContent='$'+total.toLocaleString();
  const container=document.getElementById('cart-items');
  if(!cart.length){
    container.innerHTML='<p class="text-center text-xs py-16 tracking-widest" style="color:var(--text-secondary);opacity:.3">TU CARRITO ESTÁ VACÍO</p>';
    return;
  }
  container.innerHTML=cart.map(item=>`
    <div class="cart-item" style="
      display:flex;align-items:stretch;
      border:1px solid var(--border-color);
      margin-bottom:8px;overflow:hidden;
      transition:border-color .2s;
    " onmouseover="this.style.borderColor='rgba(0,212,255,.3)'" onmouseout="this.style.borderColor='var(--border-color)'">
      <!-- acento izquierdo -->
      <div style="width:3px;background:var(--accent-primary);flex-shrink:0"></div>
      <!-- imagen -->
      <div style="width:72px;flex-shrink:0;overflow:hidden;background:var(--bg-secondary)">
        <img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;display:block">
      </div>
      <!-- contenido -->
      <div style="flex:1;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;min-width:0">
        <!-- fila superior: nombre + botón quitar -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px">
          <div style="min-width:0">
            <p style="font-size:.54rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--accent-primary)">${item.brand}</p>
            <p style="font-size:.7rem;color:var(--text-primary);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px">${item.name}</p>
          </div>
          <button onclick="removeFromCart(${item.id})" style="background:none;border:none;color:var(--text-secondary);font-size:.6rem;cursor:pointer;flex-shrink:0;opacity:.4;transition:all .2s" onmouseover="this.style.opacity=1;this.style.color='#f87171'" onmouseout="this.style.opacity=.4;this.style.color=''">✕</button>
        </div>
        <!-- fila inferior: precio + qty -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <span style="font-family:'Orbitron',sans-serif;font-size:.82rem;font-weight:800;color:var(--accent-primary)">$${item.price.toLocaleString()}</span>
          <div style="display:flex;align-items:center;gap:6px">
            <button onclick="updateQty(${item.id},-1)" style="width:22px;height:22px;background:none;border:1px solid var(--border-color);color:var(--text-secondary);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;transition:all .15s;border-radius:2px" onmouseover="this.style.borderColor='var(--accent-primary)';this.style.color='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.color=''">−</button>
            <span style="font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:700;color:var(--text-primary);min-width:18px;text-align:center">${item.qty}</span>
            <button onclick="updateQty(${item.id},1)" style="width:22px;height:22px;background:none;border:1px solid var(--border-color);color:var(--text-secondary);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;transition:all .15s;border-radius:2px" onmouseover="this.style.borderColor='var(--accent-primary)';this.style.color='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.color=''">+</button>
          </div>
        </div>
      </div>
    </div>`).join('');
}

function openCart(){document.getElementById('cart-drawer').classList.add('open');document.getElementById('cart-overlay').classList.add('open')}
function closeCart(){document.getElementById('cart-drawer').classList.remove('open');document.getElementById('cart-overlay').classList.remove('open')}
function checkout(){showToast('Redirigiendo al pago…');setTimeout(closeCart,1500)}

/* ═══════════════════════ PRODUCT MODAL ═══════════════════════ */
function openModal(id){
  const p=DB.find(x=>x.id===id);if(!p)return;
  modalProductId=id;modalQty=1;

  // top bar
  document.getElementById('pm-brand-tag').textContent=p.brand;
  document.getElementById('pm-subcat-tag').textContent=p.subcat;

  // image
  document.getElementById('pm-main-img').src=p.img;
  document.getElementById('pm-main-img').alt=p.name;

  // rating chip
  document.getElementById('pm-rating-chip').textContent='★ '+p.rating;

  // name
  document.getElementById('pm-name').textContent=p.name;

  // stars
  const stars='★'.repeat(Math.floor(p.rating))+(p.rating%1>=.5?'½':'');
  document.getElementById('pm-stars').textContent=stars;
  document.getElementById('pm-review-txt').textContent=p.rating+' valoración · '+p.reviews.toLocaleString()+' reseñas';

  // price
  document.getElementById('pm-price').textContent='$'+p.price.toLocaleString();
  document.getElementById('pm-old-price').textContent='';

  // qty
  document.getElementById('pm-qty-val').value=1;

  // specs
  document.getElementById('pm-specs').innerHTML=(p.specs||[]).map(([l,v])=>`
    <div class="pm-spec">
      <span class="pm-spec-label">${l}</span>
      <span class="pm-spec-val">${v}</span>
    </div>`).join('');

  // colors
  const colors=p.colors||[];
  if(colors.length){
    document.getElementById('pm-colors-wrap').style.display='block';
    document.getElementById('pm-colors').innerHTML=colors.map((c,i)=>`
      <button class="pm-color-opt${i===0?' sel':''}" onclick="selectColor(this)">${c}</button>
    `).join('');
  }else{
    document.getElementById('pm-colors-wrap').style.display='none';
  }

  // wishlist btn needs product id
  document.getElementById('pm-wish-btn').setAttribute('onclick',`wishlist(event,${id})`);

  updateModalCTA();
  document.getElementById('pm-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeModal(){
  document.getElementById('pm-overlay').classList.remove('open');
  document.body.style.overflow='';
}

function selectColor(btn){
  document.querySelectorAll('.pm-color-opt').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
}

function changeQty(delta){
  modalQty=Math.max(1,Math.min(99,modalQty+delta));
  document.getElementById('pm-qty-val').value=modalQty;
}

function updateModalCTA(){
  const inCart=cart.some(c=>c.id===modalProductId);
  const btn=document.getElementById('pm-add-btn');
  btn.textContent=inCart?'✓ AÑADIDO — AÑADIR MÁS':'AÑADIR AL CARRITO';
  btn.style.opacity=inCart?'.85':'1';
}

function modalAddToCart(){
  if(!modalProductId)return;
  const p=DB.find(x=>x.id===modalProductId);if(!p)return;
  const ex=cart.find(c=>c.id===p.id);
  if(ex)ex.qty+=modalQty;
  else cart.push({id:p.id,brand:p.brand,name:p.name,price:p.price,img:p.img,qty:modalQty});
  saveCart();
  updateModalCTA();
  const btn=document.getElementById('pb-'+p.id);
  if(btn){btn.textContent='✓ Añadido';btn.classList.add('in-cart')}
  showToast('✓ '+(modalQty>1?modalQty+'× ':'')+p.brand+' añadido');

  // ← cierra el modal tras añadir
  setTimeout(()=>closeModal(), 400);
}

function wishlist(e,id){e.stopPropagation();showToast('♡ Guardado en favoritos')}

/* ═══════════════════════ TOAST ═══════════════════════ */
let toastT;
function showToast(msg){
  const t=document.getElementById('ts-toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('show'),2400);
}

/* ═══════════════════════ INIT ═══════════════════════ */
(function init(){
  const param=new URLSearchParams(window.location.search).get('filter');
  if(param&&FILTERS.some(f=>f.id===param)){
    activeFilter=param;
    document.getElementById('store-title').textContent=TITLES[param]||'PRODUCTOS';
    const chip=document.getElementById('active-filter-chip');
    chip.style.display='inline-flex';chip.textContent=TITLES[param];
  }
  renderFilterPills();
  updatePriceLabel();
  applyFilters();
  updateCartUI();
  if(param){
    setTimeout(()=>document.getElementById('store-body').scrollIntoView({behavior:'smooth'}),600);
  }
})();