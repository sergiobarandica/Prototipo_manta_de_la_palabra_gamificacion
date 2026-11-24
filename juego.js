/* La manta de la palabra · motor del prototipo 2.2 (versión 1)
   El contenido vive en escenas.js. Este archivo solo sabe mostrar escenas,
   recoger decisiones y guardar el registro de uso en el dispositivo. */
(function () {
  'use strict';
  const M = window.MUNDO;
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, html = '') => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (html) e.innerHTML = html;
    return e;
  };
  const t = (s) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (M.lugar[k] !== undefined ? M.lugar[k] : m));
  const mezclar = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- video de escena ----------
     Reproduce el clip de la escena antes del diálogo. Siempre se puede saltar.
     Si el navegador bloquea la reproducción automática, muestra un botón. */
  let videoVisto = {};
  function reproducirVideo(src) {
    return new Promise((resolver) => {
      callar();
      const capa = el('div', { class: 'video-capa', role: 'dialog', 'aria-label': 'Escena en video' });
      const v = el('video', { class: 'video-pj', src: src, playsinline: '', preload: 'auto' });
      const saltar = el('button', { class: 'bt bt-saltar' }, 'Saltar ⏭');
      const play = el('button', { class: 'bt bt-play oculto' }, '▶ Ver la escena');
      let cerrado = false;
      const cerrar = (motivo) => {
        if (cerrado) return; cerrado = true;
        document.removeEventListener('keydown', tecla);
        try { v.pause(); } catch (e) {}
        capa.remove();
        registrar('video', { valor: src.split('/').pop() + ' ' + motivo });
        resolver();
      };
      const tecla = (ev) => {
        if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); cerrar('saltado'); }
      };
      v.addEventListener('ended', () => cerrar('completo'));
      v.addEventListener('error', () => cerrar('error'));
      saltar.addEventListener('click', () => cerrar('saltado'));
      play.addEventListener('click', () => { play.classList.add('oculto'); v.play().catch(() => cerrar('error')); });
      document.addEventListener('keydown', tecla);
      capa.appendChild(v); capa.appendChild(play); capa.appendChild(saltar);
      $('#juego').appendChild(capa);
      const intento = v.play();
      if (intento && intento.catch) intento.catch(() => play.classList.remove('oculto'));
    });
  }

  /* ---------- almacenamiento seguro ---------- */
  const CLAVE = 'manta_palabra_sesiones_v1';
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; } };
  const escribir = (v) => { try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: el juego sigue */ } };

  /* ---------- estado ---------- */
  let E = null;
  function nuevoEstado(cfg) {
    return {
      id: 'S' + Date.now().toString(36),
      codigo: cfg.codigo || 'sin código',
      prota: cfg.prota, modo: cfg.modo, voz: cfg.voz, texto: true,
      inicio: new Date().toISOString(), t0: Date.now(),
      zas: 1, zasVisto: false, hilos: [], objetos: [], fichas: [], tarjetas: [], banderas: {},
      cuaderno: {}, pistas: {}, registro: [], encuesta: {}, terminado: false
    };
  }
  function registrar(tipo, datos) {
    if (!E) return;
    E.registro.push(Object.assign({ s: Math.round((Date.now() - E.t0) / 1000), escena: E.escena || '', tipo }, datos));
    guardar();
  }
  function guardar() {
    const todas = leer().filter((s) => s.id !== E.id);
    todas.push(E);
    escribir(todas);
  }

  /* ---------- tamaño de la interfaz ---------- */
  function ajustar() {
    const w = $('#escenario').getBoundingClientRect().width;
    /* El piso de 13 px mantiene el texto sobre 18 px y los botones sobre 44 px
       en teléfono acostado, que es lo mínimo cómodo para dedos de niño. */
    document.documentElement.style.fontSize = Math.max(13, w / 64) + 'px';
  }
  window.addEventListener('resize', ajustar);

  /* ---------- voz ---------- */
  const hayVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let vozEs = null;
  let vocesEs = [];
  /* Puntúa las voces en español del dispositivo. Manda la calidad del motor
     por encima del país: una voz mexicana neural suena mucho menos robótica
     que una colombiana de síntesis vieja. Entre voces de igual calidad,
     se prefiere Colombia, luego el español latino neutro. */
  function puntuarVoz(v) {
    const n = (v.name || '').toLowerCase();
    const l = (v.lang || '').replace('_', '-').toLowerCase();
    let p = 0;
    if (/premium|enhanced|neural|natural|mejorad/.test(n)) p += 60;
    if (/google/.test(n)) p += 45;
    if (/luciana|paulina|mónica|monica|jorge|juan|sabina|helena|laura|dalia|elvira/.test(n)) p += 20;
    if (/espeak|compact|pico|festival/.test(n)) p -= 60;
    if (l.startsWith('es-co')) p += 30;
    else if (l.startsWith('es-419') || l.startsWith('es-us')) p += 24;
    else if (/^es-(mx|pe|cl|ar|ve|ec|bo|cr|gt|pa|py|uy|do|hn|ni|sv|pr)/.test(l)) p += 18;
    return p;
  }
  /* El país manda sobre la calidad, y no al revés. Una voz de España
     pronuncia la elle castellana y la zeta interdental: dice "zarigüella"
     y "tharigüeya", y un niño colombiano lo oye como un error. Por buena
     que sea esa voz, va después de cualquier voz latinoamericana. */
  function grupoVoz(v) {
    const l = (v.lang || '').replace('_', '-').toLowerCase();
    if (/^es-(co|419|us|mx|pe|cl|ar|ve|ec|bo|cr|gt|pa|py|uy|do|hn|ni|sv|pr)/.test(l)) return 0;
    if (l.startsWith('es-es')) return 2;
    return 1;
  }
  const esDeEspana = (v) => /^es[-_]es/i.test(v.lang || '');
  /* Lo que se oye, no lo que se lee. La pantalla conserva la ortografía
     correcta; aquí se reescribe solo para que el sintetizador acierte. */
  // Los emoji no tienen lectura: algunos motores los nombran en voz alta ('cara sonriente').
  const SIN_EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
  const DICCION = [
    [/zarigüeya/gi, () => textoZari()],
    [/\bZas\b/g, 'Sas'],
    [/\bPipe\b/g, 'Pípe']           /* si no, el motor lo lee como la palabra inglesa */
  ];
  /* "güe" es la única grafía española para el sonido /gue/. Si el motor del
     dispositivo ignora la diéresis dice "sarigeya", y entonces hay que
     engañarlo. Qué engaño funciona depende del motor, así que el adulto
     escucha las variantes en el panel y deja puesta la que suene bien. */
  const VARIANTES_ZARI = [
    { id: 'tal', txt: 'zarigüeya', nota: 'tal como se escribe' },
    { id: 'ese', txt: 'sarigüeya', nota: 'con ese, evita la zeta de España' },
    { id: 'sep', txt: 'sari güeya', nota: 'separada en dos' },
    { id: 'hue', txt: 'sarig hueya', nota: 'fuerza el sonido de la u' },
    { id: 'gua', txt: 'sariguueya', nota: 'con doble u' }
  ];
  const ZARI_POR_DEFECTO = 'hue';   /* comprobada a oído en el dispositivo de prueba */
  let zariElegida = (() => { try { return localStorage.getItem('manta_zari') || ZARI_POR_DEFECTO; } catch (e) { return ZARI_POR_DEFECTO; } })();
  const textoZari = () => (VARIANTES_ZARI.find((v) => v.id === zariElegida) || VARIANTES_ZARI.find((v) => v.id === ZARI_POR_DEFECTO)).txt;
  const paraDecir = (s) => DICCION.reduce((x, [de, a]) => x.replace(de, typeof a === 'function' ? a() : a), String(s || '').replace(SIN_EMOJI, '')).replace(/\s{2,}/g, ' ').trim();
  function elegirVoz(uri) {
    const v = vocesEs.find((x) => x.voiceURI === uri);
    if (!v) return;
    vozEs = v;
    try { localStorage.setItem('manta_voz', uri); } catch (e) {}
  }
  function cargarVoces() {
    if (!hayVoz) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang));
    vocesEs = vs.slice().sort((a, b) => (grupoVoz(a) - grupoVoz(b)) || (puntuarVoz(b) - puntuarVoz(a)));
    const guardada = (() => { try { return localStorage.getItem('manta_voz'); } catch (e) { return null; } })();
    vozEs = (guardada && vocesEs.find((v) => v.voiceURI === guardada)) || vocesEs[0] || null;
  }
  if (hayVoz) { cargarVoces(); speechSynthesis.onvoiceschanged = cargarVoces; }
  function callar() { if (hayVoz) speechSynthesis.cancel(); }
  /* Tono y velocidad por personaje. La voz del dispositivo es una sola,
     pero variar pitch y rate basta para distinguir quién habla. */
  const VOCES = {
    narrador:  { pitch: 1.00, rate: 0.95 },
    manu:      { pitch: 1.15, rate: 1.00 },
    vale:      { pitch: 1.05, rate: 0.92 },
    salome:    { pitch: 1.10, rate: 0.88 },
    pipe:      { pitch: 1.30, rate: 1.15 },
    efrain:    { pitch: 0.75, rate: 0.80 },
    zas:       { pitch: 1.50, rate: 1.30 },
    companero: { pitch: 1.35, rate: 1.10 },
    nino:      { pitch: 1.35, rate: 1.10 },
    abuela:    { pitch: 0.90, rate: 0.78 }
  };
  function hablar(texto, alTerminar, quien) {
    if (!hayVoz) { if (alTerminar) alTerminar(); return; }
    callar();
    const u = new SpeechSynthesisUtterance(paraDecir(texto.replace(/[«»“”]/g, '')));
    u.lang = vozEs ? vozEs.lang : 'es-CO';
    if (vozEs) u.voice = vozEs;
    const v = VOCES[quien] || VOCES.narrador;
    u.rate = v.rate;
    u.pitch = v.pitch;
    if (alTerminar) { u.onend = alTerminar; u.onerror = alTerminar; }
    speechSynthesis.speak(u);
  }

  /* ---------- HUD ---------- */
  function pintarManta() {
    const cont = $('#manta-svg');
    const orden = ['amarillo', 'magenta', 'verde', 'naranja'];
    // Las bandas se dibujan sobre la foto del telar: posiciones medidas en esa imagen.
    let s = '';
    orden.forEach((h, i) => {
      const y = 14 + i * 18.5;
      if (E.hilos.includes(h)) {
        const c = M.hilos[h].color;
        const trama = `repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 2%, rgba(255,255,255,.14) 2% 4.2%), linear-gradient(180deg, ${c} 0%, ${c} 60%, rgba(0,0,0,.18) 100%)`;
        s += `<i class="lleno" style="top:${y}%;background:${trama};background-blend-mode:overlay,normal"></i>`;
      } else {
        s += `<i class="vacio" style="top:${y}%"></i>`;
      }
    });
    if (E.hilos.includes('dorado')) s += '<i class="oro" style="top:83%"></i>';
    cont.innerHTML = s;
    const n = orden.filter((h) => E.hilos.includes(h)).length;
    $('#manta-txt').textContent = `${n} de 4 hilos` + (E.hilos.includes('dorado') ? ' + dorado' : '');
  }
  function pintarZas() {
    const esc = 0.42 + E.zas * 0.20;
    $('#zas-mini').style.transform = `scale(${esc})`;
    /* Pasos más amplios que antes: con 0.15 el cambio de un nivel no se notaba. */
    document.querySelectorAll('.pj.zas').forEach((p) => {
      const f = parseFloat(p.dataset.escala) || 1;
      p.style.transform = `scale(${(0.58 + E.zas * 0.21) * f})`;
    });
  }
  function cambiarZas(d) {
    if (!d) return;
    E.zas = Math.max(0, Math.min(4, E.zas + d));
    pintarZas();
    registrar('zas', { valor: E.zas });
  }
  function contarMochila() {
    const n = E.objetos.length + E.fichas.length + E.tarjetas.length;
    const b = $('#num-mochila');
    b.textContent = n; b.classList.toggle('oculto', !n);
  }

  /* ---------- escenario ---------- */
  function fondo(f) { $('#fondo').className = 'fondo ' + (f || 'salon'); }
  function imgDe(id) {
    if (id === 'manu') return E.prota === 'nina' ? 'img/manu_nina.webp' : 'img/manu_nino.webp';
    const p = M.personajes[id]; return p && p.img;
  }
  function elenco(lista) {
    const cont = $('#elenco'); cont.innerHTML = '';
    (lista || []).forEach((c) => {
      const src = imgDe(c.id); if (!src) return;
      const d = el('div', { class: `pj ${c.id} ${c.pos || 'izq'} entra`, 'data-id': c.id }, `<img src="${src}" alt="${M.personajes[c.id].nombre}">`);
      if (c.escala) d.dataset.escala = c.escala;
      if (c.id === 'guaya' && E.guayaMuerta) d.classList.add('muerta');
      cont.appendChild(d);
    });
    pintarZas(); pintarGuaya();
  }
  /* Guaya tiene dos imágenes: de pie y haciéndose la muerta. */
  function pintarGuaya() {
    document.querySelectorAll('.pj.guaya').forEach((g) => {
      const i = g.querySelector('img'); if (!i) return;
      const quiere = g.classList.contains('muerta') ? 'img/guaya_muerta.webp' : 'img/guaya.webp';
      if (!i.getAttribute('src').endsWith(quiere.split('/').pop())) i.setAttribute('src', quiere);
      i.setAttribute('alt', g.classList.contains('muerta') ? 'Guaya haciéndose la muerta' : 'Guaya');
    });
  }
  function marcarHablante(id) {
    document.querySelectorAll('.pj').forEach((p) => {
      const es = p.dataset.id === id;
      p.classList.toggle('habla', es);
      p.classList.toggle('calla', !es && id !== 'narrador');
    });
  }
  function aplicarEfecto(ef) {
    if (!ef) return;
    if (ef.mostrar === 'manta') { $('#manta-hud').classList.remove('oculto'); pintarManta(); }
    if (ef.mostrar === 'cuaderno') { /* se muestra en la mochila */ }
    if (ef.zas === 'aparece') {
      if (!E.zasVisto) { E.zasVisto = true; $('#zas-hud').classList.remove('oculto'); }
      if (!document.querySelector('.pj.zas')) {
        const d = el('div', { class: `pj zas ${ef.zasPos || 'der'} entra`, 'data-id': 'zas' }, `<img src="img/zas.webp" alt="Zas">`);
        if (ef.zasEscala) d.dataset.escala = ef.zasEscala;
        $('#elenco').appendChild(d);
      }
      pintarZas();
    }
    if (ef.guaya === 'aparece' && !document.querySelector('.pj.guaya')) {
      $('#elenco').appendChild(el('div', { class: 'pj guaya centro entra', 'data-id': 'guaya' }, `<img src="img/guaya.webp" alt="Guaya">`));
      pintarGuaya();
    }
    if (ef.guaya === 'muerta') { E.guayaMuerta = true; document.querySelectorAll('.pj.guaya').forEach((g) => g.classList.add('muerta')); pintarGuaya(); }
    if (ef.guaya === 'viva') {
      E.guayaMuerta = false;
      document.querySelectorAll('.pj.guaya').forEach((g) => {
        g.classList.remove('muerta');
        g.classList.remove('sacude'); void g.offsetWidth; g.classList.add('sacude');
      });
      pintarGuaya();
    }
    if (ef.sonrie) { const p = document.querySelector(`.pj.${ef.sonrie}`); if (p) { p.classList.remove('sonrie'); void p.offsetWidth; p.classList.add('sonrie'); } }
    if (ef.entra) {
      (Array.isArray(ef.entra) ? ef.entra : [ef.entra]).forEach((c) => {
        if (document.querySelector(`.pj[data-id="${c.id}"]`)) return;
        const src = imgDe(c.id); if (!src) return;
        const d = el('div', { class: `pj ${c.id} ${c.pos || 'der'} entra`, 'data-id': c.id }, `<img src="${src}" alt="${M.personajes[c.id].nombre}">`);
        if (c.escala) d.dataset.escala = c.escala;
        $('#elenco').appendChild(d);
      });
      pintarZas(); pintarGuaya();
    }
    if (ef.fondo) fondo(ef.fondo);
    if (ef.quitar) { const q = document.querySelector(`.pj[data-id="${ef.quitar}"]`); if (q) q.remove(); }
    if (ef.tarjeta && !E.tarjetas.includes(ef.tarjeta)) { E.tarjetas.push(ef.tarjeta); contarMochila(); registrar('tarjeta', { valor: ef.tarjeta }); }
    if (ef.ficha && !E.fichas.includes(ef.ficha)) { E.fichas.push(ef.ficha); contarMochila(); registrar('ficha', { valor: ef.ficha }); }
  }

  /* ---------- tableta (chat y nota de voz) ---------- */
  function mostrarChat(texto, extra) {
    const p = $('#tab-pant');
    p.innerHTML = '<div class="cab">Chat del curso · 5.º</div>';
    p.appendChild(el('div', { class: 'burbuja' }, t(texto)));
    if (extra === 'caras') p.appendChild(el('div', { class: 'burbuja caras' }, '😱😨😰😱😨'));
    $('#tableta').classList.remove('lado'); $('#tableta').classList.remove('oculto');
  }
  function mostrarNota(texto) {
    const p = $('#tab-pant');
    p.innerHTML = '<div class="cab">Tableta de Salomé · Abuela</div>';
    const ondas = Array.from({ length: 28 }, (_, i) => `<i style="height:${30 + Math.round(60 * Math.abs(Math.sin(i * 1.7)))}%;animation-delay:${(i % 7) * 0.1}s"></i>`).join('');
    const nota = el('div', { class: 'nota' }, `<button aria-label="Escuchar la nota de voz">▶</button><div class="ondas">${ondas}</div><small>0:12</small>`);
    nota.querySelector('button').addEventListener('click', () => {
      const o = nota.querySelector('.ondas'); o.classList.add('on');
      registrar('nota_voz', { valor: 'reproducida' });
      hablar(t(texto), () => o.classList.remove('on'), 'abuela');
    });
    p.appendChild(nota);
    p.appendChild(el('small', {}, 'Voz provisional del dispositivo. En el juego final, la nota la graba una persona.'));
    $('#tableta').classList.add('lado');
    $('#tableta').classList.remove('oculto');
  }
  function ocultarTableta() { $('#tableta').classList.add('oculto'); }

  /* ---------- diálogo ---------- */
  function decir(lineas) {
    return new Promise((resolver) => {
      let i = 0;
      let retrocediendo = false;
      /* Al retroceder, el escenario se rehace desde cero: de otro modo los efectos
         entran pero no salen, y queda Zas en pantalla antes de haber aparecido. */
      const rehacerHasta = (hasta) => {
        const s0 = M.escenas[E.escena] || {};
        E.guayaMuerta = false;
        fondo(s0.fondo);
        elenco(s0.elenco || []);
        for (let k = 0; k <= hasta; k++) if (lineas[k] && lineas[k].efecto) aplicarEfecto(lineas[k].efecto);
      };
      const vistas = new Set();   /* líneas ya mostradas: evita contar dos veces las pistas */
      const dlg = $('#dialogo'), sig = $('#bt-sig'), esc = $('#bt-escuchar'), atr = $('#bt-atras');
      $('#panel').classList.add('oculto');
      dlg.classList.remove('oculto');
      const mostrar = () => {
        const L = lineas[i];
        const p = M.personajes[L.quien] || M.personajes.narrador;
        const nombre = L.quien === 'manu' ? 'Manu' : p.nombre;
        $('#quien').textContent = nombre;
        $('#quien').style.background = p.color;
        dlg.style.borderTopColor = p.color;
        const tx = $('#texto');
        tx.innerHTML = (L.pista ? '<span class="pista-tag">Pista</span>' : '') + t(L.texto);
        tx.classList.toggle('sin-texto', !E.texto);
        tx.classList.toggle('baja', L.voz === 'baja');
        marcarHablante(L.quien);
        if (retrocediendo) rehacerHasta(i); else aplicarEfecto(L.efecto);
        if (L.chat) mostrarChat(L.chat, L.caras);
        else if (L.notaVoz) mostrarNota(L.texto);
        else ocultarTableta();
        if (L.pista && !vistas.has(i)) { const k = E.escena; E.pistas[k] = (E.pistas[k] || 0) + 1; registrar('pista', { valor: t(L.texto).slice(0, 60) }); }
        vistas.add(i);
        esc.classList.toggle('oculto', !hayVoz);
        atr.classList.toggle('oculto', i === 0);
        if (E.voz && !L.notaVoz) hablar(t(L.texto), null, L.quien);
        sig.textContent = i < lineas.length - 1 ? 'Seguir ▶' : 'Seguir ▶';
        retrocediendo = false;
      };
      const salir = () => {
        sig.removeEventListener('click', avanzar); esc.removeEventListener('click', oir);
        atr.removeEventListener('click', retroceder);
        document.removeEventListener('keydown', tecla);
        atr.classList.add('oculto');
      };
      const avanzar = () => {
        callar();
        i++;
        if (i >= lineas.length) {
          salir();
          ocultarTableta(); resolver();
        } else mostrar();
      };
      const retroceder = () => {
        if (i === 0) return;
        retrocediendo = true;
        callar();
        i--;
        registrar('atras', { valor: i });
        mostrar();
      };
      const oir = () => { registrar('escuchar', { valor: i }); hablar(t(lineas[i].texto), null, lineas[i].quien); };
      const tecla = (ev) => {
        if (!$('#mochila').classList.contains('oculto')) return;
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); avanzar(); }
        else if (ev.key === 'ArrowLeft' || ev.key === 'Backspace') { ev.preventDefault(); retroceder(); }
      };
      sig.addEventListener('click', avanzar);
      esc.addEventListener('click', oir);
      atr.addEventListener('click', retroceder);
      document.addEventListener('keydown', tecla);
      mostrar();
    });
  }

  /* ---------- panel de opciones ---------- */
  function panel(titulo, instruccion, color) {
    $('#dialogo').classList.add('oculto');
    const p = $('#panel'); p.innerHTML = ''; p.classList.remove('oculto', 'alto');
    p.style.borderTopColor = color || 'var(--magenta)';
    if (titulo) p.appendChild(el('h2', {}, t(titulo)));
    if (instruccion) p.appendChild(el('p', { class: 'ins' }, t(instruccion)));
    if (E.voz && titulo) hablar(t(titulo));
    return p;
  }
  function elegir(titulo, opciones, cfg = {}) {
    return new Promise((resolver) => {
      const p = panel(titulo, cfg.instruccion, cfg.color);
      const ops = el('div', { class: 'ops' });
      const letras = 'ABCDEFG';
      opciones.forEach((o, i) => {
        const b = el('button', { class: 'op' + (cfg.clase ? ' ' + cfg.clase : '') + (o.hecho ? ' hecho' : '') },
          (o.img ? `<img class="mini" src="${o.img}" alt="">` : `<span class="l">${cfg.marca ? cfg.marca(o, i) : letras[i]}</span>`) + `<div class="cuerpo">${t(o.texto)}</div>`);
        b.addEventListener('click', () => { callar(); resolver(o); });
        ops.appendChild(b);
      });
      p.appendChild(ops);
      if (cfg.extra) cfg.extra.forEach((x) => {
        const b = el('button', { class: 'bt ' + (x.clase || 'sec') }, x.texto);
        if (x.deshabilitado) b.disabled = true;
        b.addEventListener('click', () => { callar(); resolver(x); });
        const f = el('div', { class: 'fila' }); f.style.marginTop = '.9rem'; f.appendChild(b); p.appendChild(f);
      });
    });
  }

  /* ---------- tipos de escena ---------- */
  async function escTitulo(s) {
    const tp = $('#titulo-pant'); tp.classList.remove('oculto');
    $('#dialogo').classList.add('oculto'); $('#panel').classList.add('oculto');
    const hilo = s.hilo ? `<div class="hilo-big" style="background:${M.hilos[s.hilo].color}"></div><div class="eta">${M.hilos[s.hilo].competencia}</div>` : '';
    tp.innerHTML = `<div class="eta">${s.etapa}</div><h1>${t(s.titulo)}</h1>${hilo}<p>${t(s.texto)}</p>`;
    const b = el('button', { class: 'bt' }, 'Empezar ▶'); tp.appendChild(b);
    if (E.voz) hablar(`${s.etapa}. ${t(s.titulo)}. ${t(s.texto)}`);
    await new Promise((r) => b.addEventListener('click', r));
    callar(); tp.classList.add('oculto');
  }

  async function escDialogo(s) {
    fondo(s.fondo); elenco(s.elenco);
    await decir(s.lineas);
  }

  const TOPE_INTENTOS = 3;   /* a partir de aquí el juego deja pasar, para que nadie quede atrapado */
  async function escDecision(s) {
    fondo(s.fondo); elenco(s.elenco);
    if (s.intro) await decir(s.intro);
    let intentos = 0;
    for (;;) {
      const extra = s.saltar ? [{ id: '_saltar', texto: s.saltar }] : null;
      const o = await elegir(s.pregunta, s.opciones, { extra, color: 'var(--naranja)' });
      if (o.id === '_saltar') { registrar('decision', { valor: 'saltó el reto' }); return s.siguiente; }
      registrar('decision', { valor: o.id, texto: t(o.texto) });
      if (s.razones) {
        const r = await elegir('¿Por qué?', mezclar(s.razones), { color: 'var(--naranja)' });
        registrar('razon', { valor: r.id, texto: t(r.texto) });
      }
      cambiarZas(o.zas);
      if (o.respuesta) await decir(o.respuesta);
      if (o.gana && !E.hilos.includes(o.gana)) { E.hilos.push(o.gana); pintarManta(); registrar('hilo', { valor: o.gana }); }
      if (o.reintentar) {
        intentos++;
        await elegir('¿Qué quieres hacer?', [{ id: 'otra', texto: 'Volver a decidir' }], { color: 'var(--amarillo)' });
        registrar('reintento', { valor: o.id, intento: intentos });
        /* El escenario vuelve al estado de la pregunta: lo que dejó la rama
           equivocada no debe seguir en pantalla durante el nuevo intento. */
        E.guayaMuerta = false; fondo(s.fondo); elenco(s.elenco || []);
        if (intentos >= TOPE_INTENTOS) {
          /* Algunas escenas no declaran salida propia: la toma de la primera
             opción que sí la tenga, que es siempre la respuesta acertada. */
          /* Una subescena vuelve al hub del que vino; las demás toman su salida. */
          const salida = s.subescena ? '__volver'
            : (s.siguiente || (s.opciones.find((x) => x.siguiente) || {}).siguiente
               || (s.opciones.find((x) => x.volver) ? '__volver' : null));
          if (salida) {
            await decir([{ quien: 'narrador', texto: 'Guaya te mira y mueve el hocico hacia otra respuesta. Seguimos: lo importante no es acertar de una, sino darse cuenta.', pista: true }]);
            registrar('decision', { valor: 'tope de intentos', texto: s.codigo || E.escena });
            return salida;
          }
        }
        continue;
      }
      if (o.volver) return '__volver';
      return o.siguiente || s.siguiente;
    }
  }

  async function escConsulta(s) {
    const hechos = new Set();
    for (;;) {
      fondo(s.fondo); elenco([]);
      const listos = s.requeridos.every((r) => hechos.has(r));
      const p = panel(s.titulo, s.instruccion, 'var(--verde)');
      const hub = el('div', { class: 'hub' });
      const elegido = await new Promise((resolver) => {
        s.items.forEach((it) => {
          const src = imgDe(it.quien);
          const c = el('button', { class: 'carta' + (hechos.has(it.id) ? ' hecho' : '') }, `<img src="${src}" alt="">${it.etiqueta}${it.opcional ? '<span class="tag">Explorar · opcional</span>' : ''}`);
          c.addEventListener('click', () => resolver(it));
          hub.appendChild(c);
        });
        p.appendChild(hub);
        const f = el('div', { class: 'fila' }); f.style.marginTop = '1rem';
        const b = el('button', { class: 'bt' }, listos ? 'Ya tengo las tres miradas ▶' : `Faltan ${s.requeridos.filter((r) => !hechos.has(r)).length} miradas`);
        b.disabled = !listos;
        b.addEventListener('click', () => resolver(null));
        f.appendChild(b); p.appendChild(f);
      });
      if (!elegido) return s.siguiente;
      registrar('consulta', { valor: elegido.id });
      if (elegido.subescena) {
        const r = await correrSub(elegido.subescena);
        if (r) hechos.add(elegido.id);
      } else {
        fondo(s.fondo);
        elenco([{ id: 'manu', pos: 'izq' }, { id: elegido.quien, pos: elegido.quien === 'guaya' ? 'centro' : 'der' }]);
        await decir(elegido.lineas);
        hechos.add(elegido.id);
        if (elegido.extra) E.cuaderno.extra = elegido.extra;
      }
      E.cuaderno[elegido.id] = true;
    }
  }

  async function correrSub(id) {
    const s = M.escenas[id];
    const anterior = E.escena; E.escena = id; registrar('entrada', {});
    const r = await escDecision(s);
    E.escena = anterior;
    return r === '__volver' || !!r;
  }

  async function escDilema(s) {
    fondo(s.fondo); elenco(s.elenco);
    await decir(s.situacion);
    for (;;) {
      // perspectivas opcionales
      const vistas = new Set();
      for (;;) {
        const ops = s.perspectivas.map((pp) => ({ id: pp.id, texto: `Escuchar a ${M.personajes[pp.quien].nombre}`, img: imgDe(pp.quien), hecho: vistas.has(pp.id), pp }));
        const o = await elegir('Antes de decidir, puedes escuchar a:', ops, { color: 'var(--verde)', extra: [{ id: '_decidir', texto: 'Ya quiero decidir ▶', clase: '' }] });
        if (o.id === '_decidir') break;
        vistas.add(o.id); registrar('perspectiva', { valor: o.id });
        await decir([{ quien: o.pp.quien, texto: o.pp.texto }]);
      }
      const a = await elegir('¿Qué haces?', s.alternativas, { color: 'var(--magenta)' });
      registrar('alternativa', { valor: a.id, texto: a.texto, perspectivas: Array.from(vistas).join(' ') });
      const j = await elegir('¿Por qué lo haces?', mezclar(s.justificaciones), { color: 'var(--magenta)', instruccion: 'Elige la razón que más se parece a la tuya.' });
      registrar('justificacion', { valor: j.id, texto: j.texto });
      cambiarZas(a.zas);
      if (a.guaya) aplicarEfecto({ guaya: a.guaya });
      ['salome_callada', 'cuaderno_incompleto', 'idea_circulo'].forEach((b) => delete E.banderas[b]);
      if (a.bandera) E.banderas[a.bandera] = true;
      await decir(a.consecuencia);
      elenco([{ id: 'vale', pos: 'der' }, { id: 'manu', pos: 'izq' }]);
      await decir([{ quien: 'vale', texto: s.retro[j.id] }, { quien: 'vale', texto: s.retro.pregunta }]);
      const sigue = await elegir('¿Qué quieres hacer ahora?', [
        { id: 'seguir', texto: 'Seguir con la misión' },
        { id: 'otra', texto: 'Volver a intentarlo' }
      ], { color: 'var(--amarillo)' });
      registrar('tras_dilema', { valor: sigue.id });
      E.guayaMuerta = false;
      if (sigue.id === 'seguir') return s.siguiente;
      fondo(s.fondo); elenco(s.elenco);
    }
  }

  async function escCuaderno(s) {
    fondo(s.fondo); elenco([]);
    const resp = {};           // {fila: {quiere, porque}}
    const estado = {};         // {fila: 'ok'|'mal'}
    let pistasUsadas = 0, intento = 0;
    const blanco = () => E.banderas.cuaderno_incompleto && !E.banderas.salome_repreguntada;
    for (;;) {
      // completar filas que no están bien
      for (const f of s.filas) {
        if (estado[f.id] === 'ok') continue;
        if (f.id === 'salome' && blanco()) {
          const o = await elegir('La página de Salomé está en blanco.', [{ id: 'preg', texto: 'Volver a preguntarle a Salomé', img: imgDe('salome') }], { color: 'var(--magenta)', instruccion: 'Guaya te trae una hoja del ' + t('{arbol}') + ': es una pista para volver a preguntarle.' });
          registrar('pista', { valor: 'repreguntar a Salomé' });
          elenco([{ id: 'manu', pos: 'izq' }, { id: 'salome', pos: 'der' }]);
          await decir([{ quien: 'salome', texto: 'Quiero que la zona verde se decida en una reunión donde todos hablen. En la comunidad de mi abuela, lo más importante lo decide la asamblea.' }]);
          E.banderas.salome_repreguntada = true; elenco([]);
          void o;
        }
        const nombre = M.personajes[f.quien].nombre;
        const q = await elegir(`¿Qué quiere ${nombre}?`, mezclar(s.filas.map((x) => ({ id: x.id, texto: x.quiere }))), { color: 'var(--magenta)', instruccion: s.titulo });
        const p = await elegir(`¿Por qué lo quiere ${nombre}?`, mezclar(s.filas.map((x) => ({ id: x.id, texto: x.porque }))), { color: 'var(--magenta)', instruccion: s.titulo });
        resp[f.id] = { quiere: q.id, porque: p.id };
      }
      intento++;
      // revisar
      let todoBien = true;
      s.filas.forEach((f) => { const ok = resp[f.id].quiere === f.id && resp[f.id].porque === f.id; estado[f.id] = ok ? 'ok' : 'mal'; if (!ok) todoBien = false; });
      registrar('cuaderno', { valor: s.filas.map((f) => f.id + ':' + estado[f.id]).join(' '), intento });
      await mostrarCuaderno(s, resp, estado, todoBien, pistasUsadas);
      if (todoBien) {
        elenco([{ id: 'salome', pos: 'der' }, { id: 'manu', pos: 'izq' }]);
        await decir(s.acierto);
        return s.siguiente;
      }
      if (pistasUsadas < s.pistas.length) {
        await decir([Object.assign({ pista: true }, s.pistas[pistasUsadas])]);
        pistasUsadas++;
      } else if (intento >= s.pistas.length + 2) {
        /* Agotadas las pistas, el cuaderno se completa y la misión sigue:
           nadie debe quedarse atrapado repitiendo la misma tabla. */
        s.filas.forEach((f) => { resp[f.id] = { quiere: f.id, porque: f.id }; estado[f.id] = 'ok'; });
        registrar('cuaderno', { valor: 'completado tras agotar las pistas', intento });
        await mostrarCuaderno(s, resp, estado, true, pistasUsadas);
        elenco([{ id: 'salome', pos: 'der' }, { id: 'manu', pos: 'izq' }]);
        await decir(s.acierto);
        return s.siguiente;
      }
    }
  }
  function mostrarCuaderno(s, resp, estado, todoBien) {
    return new Promise((resolver) => {
      const p = panel(s.titulo, todoBien ? '¡Tu cuaderno está completo!' : 'Las casillas en rojo no coinciden con lo que te contaron. Vuelve a intentarlo.', 'var(--magenta)');
      const c = el('div', { class: 'cuaderno' });
      c.appendChild(el('div', { class: 'cab-c' }, '<span></span><span>Qué quiere</span><span>Por qué</span>'));
      s.filas.forEach((f) => {
        const r = resp[f.id];
        const txt = (id, k) => (s.filas.find((x) => x.id === id) || {})[k] || '';
        const cls = estado[f.id] === 'ok' ? 'ok' : 'mal';
        c.appendChild(el('div', { class: 'cfila' }, `<img src="${imgDe(f.quien)}" alt="${M.personajes[f.quien].nombre}"><div class="casilla ${r.quiere === f.id ? 'ok' : cls}">${txt(r.quiere, 'quiere')}</div><div class="casilla ${r.porque === f.id ? 'ok' : cls}">${txt(r.porque, 'porque')}</div>`));
      });
      p.appendChild(c);
      const f = el('div', { class: 'fila' }); f.style.marginTop = '1rem';
      const b = el('button', { class: 'bt' }, todoBien ? 'Seguir ▶' : 'Corregir ▶');
      b.addEventListener('click', resolver); f.appendChild(b); p.appendChild(f);
    });
  }

  async function escRecompensa(s) {
    fondo(s.fondo); elenco([]);
    const p = panel(s.titulo, null, 'var(--amarillo)');
    const cont = el('div', { class: 'premios' });
    s.items.forEach((it, i) => {
      let html = '';
      if (it.tipo === 'hilo') {
        const h = M.hilos[it.id];
        if (!E.hilos.includes(it.id)) E.hilos.push(it.id);
        html = `<div class="cab"><b>${h.nombre}</b><div class="hilo" style="background:${h.color}"></div></div><div class="cuerpo">Se teje en la manta del curso: ${h.competencia}.</div>`;
      } else if (it.tipo === 'objeto') {
        const o = M.objetos[it.id];
        if (!E.objetos.includes(it.id)) E.objetos.push(it.id);
        html = `<div class="cab"><b>${o.nombre}</b></div><div class="cuerpo">${t(o.texto)}</div>`;
      } else if (it.tipo === 'ficha') {
        const o = M.fichas[it.id];
        if (!E.fichas.includes(it.id)) E.fichas.push(it.id);
        const tx = t(o.texto);
        html = `<div class="cab"><b>Ficha «${o.titulo}»</b></div><div class="cuerpo ${tx.length > 260 ? 'largo' : ''}">${tx}</div>`;
      }
      const d = el('div', { class: 'premio' }, html); d.style.animationDelay = (i * 0.25) + 's';
      cont.appendChild(d);
    });
    E.tarjetas.forEach((k) => {
      const o = M.tarjetas[k]; if (s.etapa !== 'Misión 2') return;
      const tx = t(o.texto);
      cont.appendChild(el('div', { class: 'premio' }, `<div class="cab"><b>Tarjeta «${o.titulo}»</b></div><div class="cuerpo ${tx.length > 260 ? 'largo' : ''}">${tx}</div>`));
    });
    if (E.hilos.includes('dorado') && s.etapa === 'Misión 2') cont.appendChild(el('div', { class: 'premio' }, `<div class="cab"><b>Hilo dorado</b><div class="hilo" style="background:#D4A017"></div></div><div class="cuerpo">Superaste el reto opcional.</div>`));
    p.appendChild(cont);
    if (s.nota) p.appendChild(el('div', { class: 'nota-proto' }, '🧪 ' + t(s.nota)));
    pintarManta(); contarMochila();
    $('#bt-mochila').classList.remove('oculto');
    registrar('recompensa', { valor: s.items.map((x) => x.id).join(' ') });
    const f = el('div', { class: 'fila' }); f.style.marginTop = '1rem';
    const b = el('button', { class: 'bt' }, 'Seguir ▶'); f.appendChild(b); p.appendChild(f);
    if (E.voz) hablar(t(s.titulo));
    await new Promise((r) => b.addEventListener('click', r));
    callar();
  }

  async function escCierre(s) {
    fondo(s.fondo); elenco([{ id: 'vale', pos: 'der' }, { id: 'manu', pos: 'izq' }]);
    const p = panel(s.titulo, null, 'var(--verde)');
    s.preguntas.forEach((q) => p.appendChild(el('p', { class: 'ins' }, '💬 ' + t(q))));
    if (E.voz) hablar(s.preguntas.map(t).join(' '));
    const f = el('div', { class: 'fila' }); f.style.marginTop = '1rem';
    const b = el('button', { class: 'bt' }, 'Ya lo conversamos ▶'); f.appendChild(b); p.appendChild(f);
    await new Promise((r) => b.addEventListener('click', r));
    registrar('cierre', { valor: 'conversado' });
    callar();
  }

  async function escEncuesta(s) {
    fondo(s.fondo); elenco([]);
    const caras = ['😞', '😐', '😄'];
    await new Promise((resolver) => {
      const p = panel(s.titulo, 'Toca la carita que se parece a lo que sientes. No hay respuestas buenas ni malas.', 'var(--verde)');
      p.classList.add('alto');
      const b = el('button', { class: 'bt' }, 'Enviar ▶');
      const revisar = () => { b.disabled = Object.keys(E.encuesta).length < s.items.length + 1; };
      s.items.forEach((it) => {
        const d = el('div', { class: 'preg' }, `<p>${it.texto}</p>`);
        const fila = el('div', { class: 'caras' });
        it.escala.forEach((lab, i) => {
          const c = el('button', { class: 'cara' }, `${caras[i]}<small>${lab}</small>`);
          c.addEventListener('click', () => { fila.querySelectorAll('.cara').forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); E.encuesta[it.id] = i + 1; if (E.voz) hablar(lab); revisar(); });
          fila.appendChild(c);
        });
        d.appendChild(fila); p.appendChild(d);
      });
      const d = el('div', { class: 'preg' }, `<p>${s.favorito.texto}</p>`);
      const favs = el('div', { class: 'favs' });
      s.favorito.opciones.forEach((id) => {
        const c = el('button', { class: 'fav' }, `<img src="${imgDe(id)}" alt="">${M.personajes[id].nombre}`);
        c.addEventListener('click', () => { favs.querySelectorAll('.fav').forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); E.encuesta.favorito = id; revisar(); });
        favs.appendChild(c);
      });
      d.appendChild(favs); p.appendChild(d);
      const f = el('div', { class: 'fila' }); b.disabled = true; b.addEventListener('click', resolver); f.appendChild(b); p.appendChild(f);
    });
    registrar('encuesta', { valor: JSON.stringify(E.encuesta) });
  }

  async function escFin(s) {
    fondo('salon'); elenco([{ id: 'guaya', pos: 'centro' }]);
    E.terminado = true; registrar('fin', {});
    const tp = $('#titulo-pant'); tp.classList.remove('oculto');
    $('#panel').classList.add('oculto'); $('#dialogo').classList.add('oculto');
    tp.innerHTML = `<h1 style="font-size:2.6rem">${t(s.titulo)}</h1><p>${t(s.texto)}</p>`;
    const svg = $('#manta-svg').cloneNode(true); svg.removeAttribute('id'); svg.style.width = '18rem'; svg.style.height = '12rem'; tp.appendChild(svg);
    const b = el('button', { class: 'bt' }, 'Volver a la portada'); tp.appendChild(b);
    await new Promise((r) => b.addEventListener('click', r));
    location.reload();
  }

  /* ---------- bucle de escenas ---------- */
  async function correr(id) {
    while (id) {
      const s = M.escenas[id];
      if (!s) { console.warn('Escena no encontrada:', id); break; }
      E.escena = id;
      $('#etapa').textContent = s.etapa || '';
      $('#etapa').classList.toggle('oculto', !s.etapa);
      registrar('entrada', {});
      if (s.video && !videoVisto[id]) { videoVisto[id] = true; fondo(s.fondo); elenco([]); await reproducirVideo(s.video); }
      let sig = s.siguiente;
      switch (s.tipo) {
        case 'titulo': await escTitulo(s); break;
        case 'dialogo': await escDialogo(s); break;
        case 'decision': sig = await escDecision(s); break;
        case 'consulta': sig = await escConsulta(s); break;
        case 'dilema': sig = await escDilema(s); break;
        case 'cuaderno': sig = await escCuaderno(s); break;
        case 'recompensa': await escRecompensa(s); break;
        case 'cierre': await escCierre(s); break;
        case 'encuesta': await escEncuesta(s); break;
        case 'fin': await escFin(s); sig = null; break;
        default: console.warn('Tipo desconocido', s.tipo);
      }
      /* videoFinal: el clip se ve al cerrar la escena, no al abrirla. */
      if (s.videoFinal && !videoVisto[id + ':fin']) {
        videoVisto[id + ':fin'] = true;
        $('#texto').classList.add('oculto');
        await reproducirVideo(s.videoFinal);
        $('#texto').classList.remove('oculto');
      }
      id = sig;
    }
  }

  /* ---------- mochila ---------- */
  function abrirMochila() {
    const m = $('#mochila'); m.innerHTML = ''; m.classList.remove('oculto');
    registrar('mochila', {});
    const c = el('button', { class: 'bt sec cerrar' }, 'Cerrar ✕'); c.addEventListener('click', () => m.classList.add('oculto')); m.appendChild(c);
    m.appendChild(el('h2', {}, '🎒 Tu mochila'));
    if (E.objetos.length) { m.appendChild(el('h3', {}, 'Objetos')); E.objetos.forEach((k) => m.appendChild(el('div', { class: 'item c' }, `<b>${M.objetos[k].nombre}.</b> ${t(M.objetos[k].texto)}`))); }
    if (E.objetos.includes('cuaderno') || Object.keys(E.cuaderno).length) {
      m.appendChild(el('h3', {}, 'Cuaderno de miradas'));
      const esc = M.escenas.m2_cuaderno;
      esc.filas.forEach((f) => { if (E.cuaderno[f.id]) m.appendChild(el('div', { class: 'item c' }, `<b>${M.personajes[f.quien].nombre}:</b> ${f.quiere} ${f.porque}`)); });
      if (E.cuaderno.extra) m.appendChild(el('div', { class: 'item c' }, '<b>Guaya:</b> vive con sus crías en el ' + t('{arbol}') + '. No puede ir a la asamblea.'));
    }
    if (E.fichas.length) { m.appendChild(el('h3', {}, 'Fichas')); E.fichas.forEach((k) => m.appendChild(el('div', { class: 'item' }, `<b>${M.fichas[k].titulo}</b><br>` + t(M.fichas[k].texto)))); }
    if (E.tarjetas.length) { m.appendChild(el('h3', {}, 'Tarjetas')); E.tarjetas.forEach((k) => m.appendChild(el('div', { class: 'item t' }, `<b>${M.tarjetas[k].titulo}</b><br>` + t(M.tarjetas[k].texto)))); }
  }

  /* ---------- panel del adulto ---------- */
  function duraciones(s) {
    const ent = s.registro.filter((r) => r.tipo === 'entrada');
    const fin = s.registro.length ? s.registro[s.registro.length - 1].s : 0;
    const d = {};
    ent.forEach((r, i) => { const hasta = i < ent.length - 1 ? ent[i + 1].s : fin; d[r.escena] = (d[r.escena] || 0) + (hasta - r.s); });
    return d;
  }
  function resumen(s) {
    const g = (tipo) => s.registro.filter((r) => r.tipo === tipo);
    const total = s.registro.length ? s.registro[s.registro.length - 1].s : 0;
    const etapa = (pref) => Object.entries(duraciones(s)).filter(([k]) => k.startsWith(pref)).reduce((a, [, v]) => a + v, 0);
    return {
      codigo: s.codigo, fecha: s.inicio.slice(0, 16).replace('T', ' '), prota: s.prota === 'nina' ? 'Manuela' : 'Manuel', modo: s.modo, voz: s.voz ? 'sí' : 'no',
      minutos: (total / 60).toFixed(1), inicio_min: (etapa('i_') / 60).toFixed(1), m2_min: (etapa('m2_') / 60).toFixed(1),
      decisiones: g('decision').map((r) => `${r.escena.replace(/^i_dec_|^m2_/, '')}:${r.valor}`).join(', '),
      reintentos: g('reintento').length,
      alternativa: g('alternativa').map((r) => r.valor).join(' → '),
      justificacion: g('justificacion').map((r) => r.valor).join(' → '),
      perspectivas: g('alternativa').map((r) => r.perspectivas || 'ninguna').join(' | '),
      cuaderno_intentos: g('cuaderno').length,
      pistas: g('pista').length,
      exploro: g('consulta').some((r) => r.valor === 'guaya') ? 'sí' : 'no',
      dorado: s.hilos.includes('dorado') ? 'sí' : 'no',
      zas_final: s.zas, escuchar: g('escuchar').length + g('nota_voz').length,
      encuesta: Object.entries(s.encuesta).map(([k, v]) => `${k}=${v}`).join(' '),
      terminado: s.terminado ? 'sí' : 'no'
    };
  }
  function descargar(nombre, texto, tipo) {
    const a = el('a', { href: URL.createObjectURL(new Blob([texto], { type: tipo })), download: nombre });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const csv = (filas) => filas.map((f) => f.map((v) => `"${String(v === undefined ? '' : v).replace(/"/g, '""')}"`).join(';')).join('\n');
  function abrirAdulto() {
    $('#portada').classList.add('oculto');
    const A = $('#adulto'); A.classList.remove('oculto'); A.innerHTML = '';
    const ses = leer();
    A.appendChild(el('h1', {}, 'Panel del adulto que acompaña'));
    A.appendChild(el('p', {}, 'Aquí se ven las sesiones jugadas en este dispositivo. Los datos se guardan solo en este navegador. No se registra el nombre del niño o la niña: usen un código (P01, P02…).'));
    A.appendChild(el('div', { class: 'aviso' }, 'Al terminar cada prueba, descarguen el archivo CSV y guárdenlo en la carpeta del equipo. Si se borran los datos del navegador, las sesiones se pierden.'));
    const acc = el('div', { class: 'acciones' });
    const b1 = el('button', { class: 'bt' }, '⬇ Resumen (CSV)');
    const b2 = el('button', { class: 'bt' }, '⬇ Registro detallado (CSV)');
    const b3 = el('button', { class: 'bt sec' }, '⬇ Todo (JSON)');
    const b4 = el('button', { class: 'bt sec' }, 'Borrar sesiones');
    const b5 = el('button', { class: 'bt sec' }, '← Volver a la portada');
    b1.addEventListener('click', () => { const r = ses.map(resumen); if (!r.length) return; descargar('manta_resumen.csv', '﻿' + csv([Object.keys(r[0])].concat(r.map(Object.values))), 'text/csv'); });
    b2.addEventListener('click', () => { const filas = [['codigo', 'sesion', 'segundo', 'escena', 'tipo', 'valor', 'texto', 'extra']]; ses.forEach((s) => s.registro.forEach((r) => filas.push([s.codigo, s.id, r.s, r.escena, r.tipo, r.valor, r.texto, r.perspectivas || r.intento || '']))); descargar('manta_registro.csv', '﻿' + csv(filas), 'text/csv'); });
    b3.addEventListener('click', () => descargar('manta_sesiones.json', JSON.stringify(ses, null, 2), 'application/json'));
    let armado = false;
    b4.addEventListener('click', () => { if (!armado) { armado = true; b4.textContent = 'Toca otra vez para borrar todo'; b4.style.background = 'var(--magenta)'; b4.style.color = '#fff'; return; } escribir([]); abrirAdulto(); });
    b5.addEventListener('click', () => { A.classList.add('oculto'); $('#portada').classList.remove('oculto'); });
    [b1, b2, b3, b4, b5].forEach((b) => acc.appendChild(b));
    A.appendChild(acc);
    /* Selector de voz: el catálogo depende del dispositivo, así que el adulto
       escucha y elige la que mejor suene antes de empezar la sesión. */
    if (hayVoz) {
      A.appendChild(el('h2', {}, 'Voz de la lectura en voz alta'));
      if (!vocesEs.length) {
        A.appendChild(el('p', {}, 'Este dispositivo no tiene voces en español instaladas. La lectura en voz alta queda desactivada.'));
      } else {
        A.appendChild(el('p', {}, 'Las voces disponibles dependen del dispositivo. Están ordenadas de la que suele sonar mejor a la que suena peor. Prueben una y dejen puesta la que les parezca más natural.'));
        const fila = el('div', { class: 'acciones' });
        const sel = el('select', { class: 'bt sec', 'aria-label': 'Voz' });
        vocesEs.forEach((v) => {
          const marcas = [v.lang, esDeEspana(v) ? 'acento de España, no recomendada' : null, v.localService ? null : 'necesita internet'].filter(Boolean);
          const o = el('option', { value: v.voiceURI }, `${v.name} · ${marcas.join(' · ')}`);
          if (vozEs && v.voiceURI === vozEs.voiceURI) o.setAttribute('selected', 'selected');
          sel.appendChild(o);
        });
        const bp = el('button', { class: 'bt' }, '🔊 Probar');
        sel.addEventListener('change', () => elegirVoz(sel.value));
        bp.addEventListener('click', () => { elegirVoz(sel.value); hablar('Es una zarigüeya, no una rata. Vive en el guayacán del patio y se llama Guaya.', null, 'vale'); });
        fila.appendChild(sel); fila.appendChild(bp);
        A.appendChild(fila);
        A.appendChild(el('h2', {}, 'Cómo suena «zarigüeya»'));
        A.appendChild(el('p', {}, 'Algunos dispositivos se comen la u y dicen «sarigeya». Escuchen las opciones y dejen marcada la que suene za-ri-gü-e-ya. En pantalla la palabra se sigue escribiendo bien; esto solo cambia lo que oye la voz.'));
        const fz = el('div', { class: 'acciones' });
        VARIANTES_ZARI.forEach((v) => {
          const b = el('button', { class: 'bt sec' }, `🔊 ${v.nota}`);
          if (v.id === zariElegida) { b.classList.remove('sec'); b.textContent = `✓ ${v.nota}`; }
          b.addEventListener('click', () => {
            zariElegida = v.id;
            try { localStorage.setItem('manta_zari', v.id); } catch (e) {}
            hablar('Es una ' + v.txt + ', no una rata.', null, 'vale');
            [...fz.children].forEach((o, k) => {
              o.className = VARIANTES_ZARI[k].id === v.id ? 'bt' : 'bt sec';
              o.textContent = (VARIANTES_ZARI[k].id === v.id ? '✓ ' : '🔊 ') + VARIANTES_ZARI[k].nota;
            });
          });
          fz.appendChild(b);
        });
        A.appendChild(fz);
      }
    }
    A.appendChild(el('h2', {}, `Sesiones (${ses.length})`));
    if (!ses.length) { A.appendChild(el('p', {}, 'Todavía no hay sesiones en este dispositivo.')); return; }
    const r = ses.map(resumen);
    const cols = ['codigo', 'fecha', 'prota', 'modo', 'voz', 'minutos', 'inicio_min', 'm2_min', 'decisiones', 'alternativa', 'justificacion', 'perspectivas', 'cuaderno_intentos', 'pistas', 'exploro', 'dorado', 'zas_final', 'encuesta', 'terminado'];
    const tb = el('table'); tb.innerHTML = '<tr>' + cols.map((c) => `<th>${c.replace(/_/g, ' ')}</th>`).join('') + '</tr>' + r.map((x) => '<tr>' + cols.map((c) => `<td>${x[c]}</td>`).join('') + '</tr>').join('');
    A.appendChild(tb);
    ses.slice().reverse().forEach((s) => {
      const d = el('details'); d.appendChild(el('summary', {}, `${s.codigo} · ${s.inicio.slice(0, 16).replace('T', ' ')} · ${s.registro.length} eventos`));
      const dur = duraciones(s);
      d.appendChild(el('p', {}, '<b>Segundos por escena:</b> ' + Object.entries(dur).map(([k, v]) => `${k} ${v}`).join(' · ')));
      const t2 = el('table'); t2.innerHTML = '<tr><th>s</th><th>escena</th><th>tipo</th><th>valor</th><th>texto</th></tr>' + s.registro.map((x) => `<tr><td>${x.s}</td><td>${x.escena}</td><td>${x.tipo}</td><td>${x.valor === undefined ? '' : x.valor}</td><td>${x.texto || ''}</td></tr>`).join('');
      d.appendChild(t2); A.appendChild(d);
    });
  }

  /* ---------- portada ---------- */
  const cfg = { prota: 'nino', modo: 'solo', voz: false };
  function grupo(sel, clave, fn) {
    document.querySelectorAll(sel).forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll(sel).forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); fn(b.dataset[clave]);
    }));
  }
  grupo('[data-prota]', 'prota', (v) => { cfg.prota = v; });
  /* El código del registro empieza por E si juega una persona sola y por P si es pareja. */
  grupo('[data-modo]', 'modo', (v) => {
    cfg.modo = v;
    const c = $('#codigo');
    const prefijo = v === 'pareja' ? 'P' : 'E';
    c.placeholder = prefijo + '01';
    const puesto = (c.value || '').trim().toUpperCase();
    if (/^[EP]\d*$/.test(puesto)) c.value = prefijo + puesto.slice(1);
  });
  grupo('[data-voz]', 'voz', (v) => { cfg.voz = v === 'si'; if (cfg.voz) hablar('Hola. Voy a leerte la historia.'); });
  if (!hayVoz) document.querySelectorAll('[data-voz]').forEach((b) => { b.closest('.grupo').classList.add('oculto'); });
  $('#version').textContent = 'Prototipo v' + M.version;
  $('#ir-adulto').addEventListener('click', abrirAdulto);
  $('#bt-mochila').addEventListener('click', abrirMochila);
  $('#bt-texto').addEventListener('click', (ev) => {
    E.texto = !E.texto; ev.currentTarget.setAttribute('aria-pressed', String(E.texto));
    $('#texto').classList.toggle('sin-texto', !E.texto); registrar('ajuste', { valor: 'texto=' + E.texto });
  });
  $('#bt-voz').addEventListener('click', (ev) => {
    E.voz = !E.voz; ev.currentTarget.setAttribute('aria-pressed', String(E.voz));
    if (!E.voz) callar(); registrar('ajuste', { valor: 'voz=' + E.voz });
  });
  if (!hayVoz) $('#bt-voz').classList.add('oculto');
  $('#empezar').addEventListener('click', async () => {
    cfg.codigo = ($('#codigo').value || '').trim().toUpperCase();
    E = nuevoEstado(cfg);
    $('#bt-voz').setAttribute('aria-pressed', String(E.voz));
    registrar('inicio', { valor: `${cfg.prota} ${cfg.modo} voz=${cfg.voz}` });
    $('#portada').classList.add('oculto'); $('#juego').classList.remove('oculto');
    ajustar();
    const apertura = [M.intro, M.eleccion && M.eleccion[cfg.prota]].filter(Boolean);
    if (apertura.length) {
      fondo(''); elenco([]); $('#texto').classList.add('oculto');
      for (const v of apertura) await reproducirVideo(v);
      $('#texto').classList.remove('oculto');
    }
    correr(M.inicio);
  });
  ajustar();
  // Para pruebas automáticas
  window.__manta = { estado: () => E };
})();
