/**
 * Tramas del Sur — editor.js
 * Generador de Notas Editoriales
 * Módulos: Autenticación | Generador HTML | Exportación ZIP
 */

'use strict';

/* ─────────────────────────────────────────
   Módulo: Autenticación con hash SHA-256
   La contraseña nunca se almacena en texto
   plano — solo su huella SHA-256.
   Para cambiarla: generá el nuevo hash en
   https://emn178.github.io/online-tools/sha256.html
   y reemplazá el valor de HASH_CLAVE.
   ───────────────────────────────────────── */
const HASH_CLAVE = '687439509c9cf23dca8d575ae91da7dfa1c8f29131bbed247b48289b061ca95c';

async function hashear(texto) {
  const encoder = new TextEncoder();
  const data     = encoder.encode(texto);
  const buffer   = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verificarClave() {
  const clave    = document.getElementById('passwordField').value;
  const errorDiv = document.getElementById('error-msg');

  errorDiv.style.display = 'none';

  const hashIngresado = await hashear(clave);

  if (hashIngresado === HASH_CLAVE) {
    sessionStorage.setItem('auth_tramas', 'true');
    mostrarGenerador();
  } else {
    errorDiv.style.display = 'block';
  }
}

function mostrarGenerador() {
  document.getElementById('loginBox').style.display     = 'none';
  document.getElementById('mainContainer').style.display = 'block';
}

document.getElementById('loginBtn').addEventListener('click', verificarClave);

document.getElementById('passwordField').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') verificarClave();
});

if (sessionStorage.getItem('auth_tramas') === 'true') {
  mostrarGenerador();
}


/* ─────────────────────────────────────────
   Utilidades
   ───────────────────────────────────────── */
function escapeHtml(text) {
  return text
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function generarSlug(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g,      '-')
    .replace(/[^\w-]+/g,  '')
    .replace(/--+/g,      '-')
    .replace(/^-+/,       '')
    .replace(/-+$/,       '');
}

function obtenerNombreImagen() {
  const fileInput = document.getElementById('imagenInput');
  return (fileInput.files && fileInput.files.length > 0)
    ? fileInput.files[0].name
    : '';
}


/* ─────────────────────────────────────────
   Módulo: Procesador de texto → HTML
   ───────────────────────────────────────── */
function procesarTextoAHtml(texto) {
  texto = escapeHtml(texto);
  texto = texto.replace(/\r\n|\r/g, '\n');

  const bloques      = texto.split('\n\n');
  let   htmlResultado = '';

  bloques.forEach(bloque => {
    bloque = bloque.trim();
    if (!bloque) return;

    if (bloque.startsWith('## ')) {
      htmlResultado += `      <h2>${bloque.substring(3)}</h2>\n`;

    } else if (bloque.startsWith('### ')) {
      htmlResultado += `      <h3>${bloque.substring(4)}</h3>\n`;

    } else if (bloque.startsWith('&gt; ')) {
      htmlResultado += `      <blockquote>\n        "${bloque.substring(5)}"\n      </blockquote>\n`;

    } else if (bloque === '---') {
      htmlResultado += `      <hr />\n`;

    } else if (bloque === '~~~') {
      htmlResultado += `      <div class="thread-divider">\n`
        + `        <div class="thread-line"></div>\n`
        + `        <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">\n`
        + `          <path d="M2 10 C8 4,14 16,20 10 S32 4,40 10 S52 16,60 10 S70 5,78 10" stroke="#d95f1a" stroke-width="1.8" stroke-linecap="round" fill="none"/>\n`
        + `        </svg>\n`
        + `        <div class="thread-line"></div>\n`
        + `      </div>\n`;

    } else {
      const contenido = bloque.replace(/\n/g, '<br />');
      htmlResultado += `      <p>\n        ${contenido}\n      </p>\n`;
    }
  });

  return htmlResultado;
}


/* ─────────────────────────────────────────
   Módulo: Constructor HTML de la nota
   Las notas generadas vivirán en /editorial/
   y referencian assets con rutas relativas ../assets/
   ───────────────────────────────────────── */
function construirHtmlNota(esPreview = false) {
  const categoria  = document.getElementById('categoria').value;
  const titulo     = document.getElementById('titulo').value;
  const bajada     = document.getElementById('bajada').value;
  const autor      = document.getElementById('autor').value;
  const fecha      = document.getElementById('fecha').value;
  const img_alt    = document.getElementById('img_alt').value;
  const cuerpoRaw  = document.getElementById('cuerpo').value;

  const imagen     = obtenerNombreImagen();
  const cuerpoHtml = procesarTextoAHtml(cuerpoRaw);

  // Las notas viven en /editorial/ → los assets están en ../assets/
  // En preview usamos ObjectURL para la imagen local; ruta de assets igual.
  const rutaAssets  = '../assets/';
  const rutaImgLogo = `${rutaAssets}img/logo/logo.jpeg`;
  const rutaFondo   = `${rutaAssets}img/content/fondo.jpeg`;

  // Imagen de portada: ObjectURL en preview, ruta relativa en producción
  let bloqueImagen = '';
  if (imagen.trim() !== '') {
    let srcImagen = `${rutaAssets}img/content/${escapeHtml(imagen)}`;
    if (esPreview) {
      const fileInput = document.getElementById('imagenInput');
      if (fileInput.files && fileInput.files.length > 0) {
        srcImagen = URL.createObjectURL(fileInput.files[0]);
      }
    }
    bloqueImagen = `    <div class="article-cover">\n      <img src="${srcImagen}" alt="${escapeHtml(img_alt)}" />\n    </div>\n`;
  }

  /* ── Plantilla HTML de la nota ── */
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'none'; object-src 'none';" />
  <title>${escapeHtml(titulo)} — Tramas del Sur</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="${rutaAssets}css/nota.css" />
</head>
<body>

  <nav aria-label="Navegación principal">
    <a href="https://tramasdelsur.com.ar" class="nav-logo" aria-label="Tramas del Sur — Inicio">
      <img src="${rutaImgLogo}" alt="Tramas del Sur" />
    </a>
    <a href="https://tramasdelsur.com.ar" class="btn-volver">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Volver al inicio
    </a>
  </nav>

  <main>
    <header class="article-header">
      <p class="article-categoria">${escapeHtml(categoria)}</p>
      <h1 class="article-titulo">${escapeHtml(titulo)}</h1>
      <p class="article-bajada">${escapeHtml(bajada)}</p>
      <div class="article-meta">
        <span>Por ${escapeHtml(autor)}</span>
        <span>${escapeHtml(fecha)}</span>
      </div>
    </header>

${bloqueImagen}
    <article class="article-body">
${cuerpoHtml}    </article>

    <footer class="article-footer">
      <a href="https://tramasdelsur.com.ar" class="article-footer-logo" aria-label="Tramas del Sur — Inicio">
        <img src="${rutaImgLogo}" alt="Tramas del Sur" />
      </a>
      <a href="https://tramasdelsur.com.ar" class="btn-volver-pie">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Volver al inicio
      </a>
      <div class="article-footer-qr">
        <img src="${rutaAssets}img/logo/qr.png" alt="Código QR — tramasdelsur.com.ar" />
        <span>tramasdelsur.com.ar</span>
      </div>
    </footer>
  </main>

</body>
</html>`;
}


/* ─────────────────────────────────────────
   Módulo: Constructor del JSON de la nota
   ───────────────────────────────────────── */
function construirJsonNota() {
  const titulo = document.getElementById('titulo').value;
  const slug   = generarSlug(titulo);
  const imagen = obtenerNombreImagen();

  const objetoJson = {
    archivo:     `${slug}.html`,
    titulo:      titulo,
    descripcion: document.getElementById('bajada').value,
    categoria:   document.getElementById('categoria').value,
    autor:       document.getElementById('autor').value || 'Tramas del Sur',
    fecha:       document.getElementById('fecha').value,
    imagen:      imagen ? imagen : ''
  };

  return JSON.stringify(objetoJson, null, 2);
}


/* ─────────────────────────────────────────
   Evento: Vista Previa
   ───────────────────────────────────────── */
document.getElementById('previewBtn').addEventListener('click', function () {
  if (!document.getElementById('titulo').value || !document.getElementById('cuerpo').value) {
    alert('Por favor, completá al menos el Título y el Cuerpo de la nota para ver la vista previa.');
    return;
  }

  const htmlContenido  = construirHtmlNota(true);
  const ventanaPreview = window.open('', '_blank');

  if (ventanaPreview) {
    ventanaPreview.document.open();
    ventanaPreview.document.write(htmlContenido);
    ventanaPreview.document.close();
  } else {
    alert('El navegador bloqueó la ventana emergente. Por favor, permití los pop-ups para este sitio.');
  }
});


/* ─────────────────────────────────────────
   Evento: Generar y Descargar ZIP
   Estructura del paquete:
     slug.html          → nota lista
     slug.json          → entrada para editorial/index.json
     assets/img/content/  → imagen de portada (si la hay)
   ───────────────────────────────────────── */
document.getElementById('generatorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo    = document.getElementById('titulo').value;
  const slug      = generarSlug(titulo);
  const zip       = new JSZip();  // eslint-disable-line no-undef

  zip.file(`${slug}.html`, construirHtmlNota(false));
  zip.file(`${slug}.json`, construirJsonNota());

  const fileInput = document.getElementById('imagenInput');
  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    // La imagen va donde la nota espera encontrarla: assets/img/content/
    zip.file(`assets/img/content/${file.name}`, file);
  }

  zip.generateAsync({ type: 'blob' })
    .then(function (content) {
      const url    = URL.createObjectURL(content);
      const anchor = document.createElement('a');
      anchor.href     = url;
      anchor.download = `${slug}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    })
    .catch(function (err) {
      alert(`Hubo un error al empaquetar los archivos: ${err}`);
    });
});