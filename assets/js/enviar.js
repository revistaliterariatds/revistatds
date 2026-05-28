/**
 * Tramas del Sur — enviar.js
 * Formulario de envío de producciones
 */

'use strict';

/* ─────────────────────────────────────────
   CONFIGURACIÓN
   ───────────────────────────────────────── */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwY82tQX4tdB7TwQyDH8fFMLYFpu6jHGrQVZxuvFWsZjXQQE5_ExG32D9QOjbOWJfJB/exec';
const MAX_FILES = 3;
const MAX_MB    = 10;

/* ─────────────────────────────────────────
   Referencias al DOM
   ───────────────────────────────────────── */
const form        = document.getElementById('envioForm');
const fileInput   = document.getElementById('archivoInput');
const dropZone    = document.getElementById('dropZone');
const fileDisplay = document.getElementById('fileNameDisplay');
const btnEnviar   = document.getElementById('btnEnviar');
const formAlert   = document.getElementById('formAlert');
const edadSelect  = document.getElementById('edad');
const adultoGroup = document.getElementById('adultoGroup');
const adultoNombre = document.getElementById('adultoNombre');
const adultoEmail  = document.getElementById('adultoEmail');
const adultoTel    = document.getElementById('adultoTel');
const nombrePublicacionSelect = document.getElementById('nombrePublicacion');
const nombrePublicacionExtraGroup = document.getElementById('nombrePublicacionExtraGroup');
const nombrePublicacionExtra      = document.getElementById('nombrePublicacionExtra');
const nombrePublicacionExtraLabel = document.getElementById('nombrePublicacionExtraLabel');

/* ─────────────────────────────────────────
   Módulo: Adulto Responsable (menores 13-17)
   ───────────────────────────────────────── */
function esMenor() {
  return edadSelect.value === '13 a 17';
}

function toggleAdulto() {
  if (!adultoGroup) return;
  if (esMenor()) {
    adultoGroup.hidden = false;
    [adultoNombre, adultoEmail, adultoTel].forEach(el => {
      if (!el) return;
      el.disabled = false;
      el.setAttribute('aria-required', 'true');
    });
  } else {
    adultoGroup.hidden = true;
    [adultoNombre, adultoEmail, adultoTel].forEach(el => {
      if (!el) return;
      el.disabled = true;
      el.setAttribute('aria-required', 'false');
      el.value = '';
      clearFieldError(el.id);
    });
  }
}

if (edadSelect) {
  edadSelect.addEventListener('change', toggleAdulto);
}

/* ─────────────────────────────────────────
   Módulo: Nombre en publicación (condicional)
   ───────────────────────────────────────── */
function toggleNombreExtra() {
  if (!nombrePublicacionExtraGroup || !nombrePublicacionSelect) return;
  const val = nombrePublicacionSelect.value;
  const necesitaExtra = val === 'Pseudónimo' || val === 'Otro';

  if (necesitaExtra) {
    nombrePublicacionExtraGroup.classList.add('visible');
    if (nombrePublicacionExtra) {
      nombrePublicacionExtra.disabled = false;
      nombrePublicacionExtra.setAttribute('aria-required', 'true');
    }
    if (nombrePublicacionExtraLabel) {
      nombrePublicacionExtraLabel.innerHTML = val === 'Pseudónimo'
        ? 'Indicá tu pseudónimo <span class="required-mark" aria-hidden="true">*</span>'
        : 'Indicá cómo querés figurar <span class="required-mark" aria-hidden="true">*</span>';
    }
    if (nombrePublicacionExtra) {
      nombrePublicacionExtra.placeholder = val === 'Pseudónimo'
        ? 'Ej: El Cuervo del Sur'
        : 'Ej: Sólo mis iniciales';
    }
  } else {
    nombrePublicacionExtraGroup.classList.remove('visible');
    if (nombrePublicacionExtra) {
      nombrePublicacionExtra.disabled = true;
      nombrePublicacionExtra.setAttribute('aria-required', 'false');
      nombrePublicacionExtra.value = '';
      clearFieldError('nombrePublicacionExtra');
    }
  }
}

if (nombrePublicacionSelect) {
  nombrePublicacionSelect.addEventListener('change', toggleNombreExtra);
}

/* ─────────────────────────────────────────
   Utilidades de validación
   ───────────────────────────────────────── */
function mostrarFieldError(id, mensaje) {
  const errorEl = document.getElementById(`error-${id}`);
  const inputEl = id === 'archivoInput' ? dropZone : document.getElementById(id);
  if (errorEl) { errorEl.textContent = mensaje; errorEl.classList.add('visible'); }
  if (inputEl) inputEl.classList.add('invalid');
}

function clearFieldError(id) {
  const errorEl = document.getElementById(`error-${id}`);
  const inputEl = id === 'archivoInput' ? dropZone : document.getElementById(id);
  if (errorEl) errorEl.classList.remove('visible');
  if (inputEl) inputEl.classList.remove('invalid');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ─────────────────────────────────────────
   Validación del formulario
   ───────────────────────────────────────── */
function validarFormulario() {
  let valido = true;

  // Campos obligatorios base
  ['nombre', 'edad', 'email', 'genero', 'escuela', 'titulo', 'descripcion', 'nombrePublicacion'].forEach(id => {
    clearFieldError(id);
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      mostrarFieldError(id, 'Este campo es obligatorio.');
      valido = false;
    }
  });

  // Email del autor
  const emailEl = document.getElementById('email');
  if (emailEl.value.trim() && !EMAIL_RE.test(emailEl.value.trim())) {
    mostrarFieldError('email', 'Ingresá un correo electrónico válido.');
    valido = false;
  }

  // Campo extra de nombre en publicación
  const valNombrePub = nombrePublicacionSelect.value;
  if (valNombrePub === 'Pseudónimo' || valNombrePub === 'Otro') {
    clearFieldError('nombrePublicacionExtra');
    if (!nombrePublicacionExtra.value.trim()) {
      mostrarFieldError('nombrePublicacionExtra',
        valNombrePub === 'Pseudónimo'
          ? 'Ingresá tu pseudónimo.'
          : 'Indicá cómo querés figurar.');
      valido = false;
    }
  }

  // Adulto responsable (solo si es menor)
  if (esMenor()) {
    ['adultoNombre', 'adultoEmail', 'adultoTel'].forEach(id => {
      clearFieldError(id);
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        mostrarFieldError(id, 'Este campo es obligatorio para menores de 18 años.');
        valido = false;
      }
    });
    if (adultoEmail && adultoEmail.value.trim() && !EMAIL_RE.test(adultoEmail.value.trim())) {
      mostrarFieldError('adultoEmail', 'Ingresá un correo electrónico válido.');
      valido = false;
    }
  }

  // Autorización
  clearFieldError('autoriza');
  if (!document.getElementById('autoriza').checked) {
    mostrarFieldError('autoriza', 'Debés aceptar las Bases y Condiciones para continuar.');
    valido = false;
  }

  // Archivos (al menos 1, máximo MAX_FILES, sin límite de tipo)
  clearFieldError('archivoInput');
  const archivos = obtenerArchivos();
  if (archivos.length === 0) {
    mostrarFieldError('archivoInput', 'Adjuntá al menos un archivo.');
    valido = false;
  } else if (archivos.length > MAX_FILES) {
    mostrarFieldError('archivoInput', `Podés subir hasta ${MAX_FILES} archivos por envío.`);
    valido = false;
  } else {
    for (const file of archivos) {
      if (file.size > MAX_MB * 1024 * 1024) {
        mostrarFieldError('archivoInput', `"${file.name}" supera los ${MAX_MB} MB permitidos.`);
        valido = false;
        break;
      }
    }
  }

  return valido;
}

/* ─────────────────────────────────────────
   Manejo de múltiples archivos
   ───────────────────────────────────────── */
let archivosSeleccionados = [];

function obtenerArchivos() {
  return archivosSeleccionados;
}

function actualizarDropZone() {
  if (archivosSeleccionados.length === 0) {
    dropZone.classList.remove('has-file');
    fileDisplay.innerHTML = '';
    fileDisplay.classList.remove('visible');
    return;
  }

  dropZone.classList.add('has-file');
  dropZone.classList.remove('invalid');
  clearFieldError('archivoInput');

  fileDisplay.innerHTML = archivosSeleccionados
    .map(f => `<li>${f.name} <span style="color:var(--ink-muted);font-size:0.72rem;">(${(f.size / 1024 / 1024).toFixed(2)} MB)</span></li>`)
    .join('');
  fileDisplay.classList.add('visible');
}

function agregarArchivos(nuevos) {
  const combinados = [...archivosSeleccionados];
  for (const file of nuevos) {
    // Evitar duplicados por nombre
    if (!combinados.find(f => f.name === file.name)) {
      combinados.push(file);
    }
  }
  // Respetar máximo
  archivosSeleccionados = combinados.slice(0, MAX_FILES);
  actualizarDropZone();
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) agregarArchivos(Array.from(fileInput.files));
  fileInput.value = ''; // resetear para permitir volver a seleccionar
});

/* ─────────────────────────────────────────
   Drag & Drop
   ───────────────────────────────────────── */
['dragenter', 'dragover'].forEach(evt => {
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
});

['dragleave', 'drop'].forEach(evt => {
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
});

dropZone.addEventListener('drop', e => {
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) agregarArchivos(files);
});

/* ─────────────────────────────────────────
   Limpiar errores al editar
   ───────────────────────────────────────── */
['nombre', 'edad', 'email', 'genero', 'escuela', 'titulo', 'descripcion',
 'nombrePublicacion', 'nombrePublicacionExtra',
 'adultoNombre', 'adultoEmail', 'adultoTel'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input',  () => clearFieldError(id));
  el.addEventListener('change', () => clearFieldError(id));
});

document.getElementById('autoriza').addEventListener('change', () => clearFieldError('autoriza'));

/* ─────────────────────────────────────────
   UI: estado del botón
   ───────────────────────────────────────── */
function setLoading(isLoading) {
  btnEnviar.disabled = isLoading;
  btnEnviar.classList.toggle('loading', isLoading);
}

function mostrarAlerta(tipo, mensaje) {
  formAlert.className = `form-alert ${tipo}`;
  formAlert.textContent = mensaje;
  formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─────────────────────────────────────────
   Envío al Apps Script
   ───────────────────────────────────────── */
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  formAlert.className = 'form-alert';

  if (!validarFormulario()) {
    const primerError = form.querySelector('.invalid');
    if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setLoading(true);

  try {
    // Convertir todos los archivos a base64
    const archivosB64 = await Promise.all(
      archivosSeleccionados.map(async file => ({
        fileName: file.name,
        fileData: await fileToBase64(file),
        mimeType: file.type || 'application/octet-stream',
      }))
    );

    // Armar nombre a publicar
    const valPub = nombrePublicacionSelect.value;
    const nombreAPubilicar = (valPub === 'Pseudónimo' || valPub === 'Otro')
      ? `${valPub}: ${nombrePublicacionExtra.value.trim()}`
      : valPub;

    const payload = {
      nombre:            document.getElementById('nombre').value.trim(),
      edad:              edadSelect.value,
      email:             document.getElementById('email').value.trim(),
      genero:            document.getElementById('genero').value,
      escuela:           document.getElementById('escuela').value.trim(),
      nombrePublicacion: nombreAPubilicar,
      titulo:            document.getElementById('titulo').value.trim(),
      descripcion:       document.getElementById('descripcion').value.trim(),
      archivos:          archivosB64,
      ...(esMenor() && {
        adultoNombre: adultoNombre.value.trim(),
        adultoEmail:  adultoEmail.value.trim(),
        adultoTel:    adultoTel.value.trim(),
      }),
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 'ok') {
      mostrarAlerta('success',
        `¡Gracias, ${payload.nombre}! Tu envío fue recibido con éxito. ` +
        `Te mandamos una confirmación a ${payload.email}.`
      );
      form.reset();
      archivosSeleccionados = [];
      actualizarDropZone();
      if (edadSelect) { edadSelect.value = ''; toggleAdulto(); }
      if (nombrePublicacionSelect) { nombrePublicacionSelect.value = ''; toggleNombreExtra(); }
    } else {
      throw new Error(result.message || 'Error desconocido en el servidor.');
    }

  } catch (err) {
    console.error('Error al enviar:', err);
    mostrarAlerta('error',
      'Hubo un problema al enviar. Por favor, intentá de nuevo o escribinos a revistaliterariatds@gmail.com.'
    );
  } finally {
    setLoading(false);
  }
});

/* ─────────────────────────────────────────
   Utilidad: archivo → base64
   ───────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}