/**
 * Tramas del Sur — enviar.js
 * Formulario de envío de cuentos
 */

'use strict';

/* ─────────────────────────────────────────
   CONFIGURACIÓN
   ───────────────────────────────────────── */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrtnJxyACja92K16fqYsd_8nv7MLfvKcXtywmdUV-fXcCU7HLYbumYI6_BRk4c_9sQ/exec';

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

/* ─────────────────────────────────────────
   Módulo: Adulto Responsable
   Debe declararse antes de validarFormulario
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

edadSelect.addEventListener('change', toggleAdulto);

/* ─────────────────────────────────────────
   Utilidades de validación
   ───────────────────────────────────────── */
function mostrarFieldError(id, mensaje) {
  const errorEl = document.getElementById(`error-${id}`);
  const inputEl = id === 'archivoInput' ? dropZone : document.getElementById(id);
  if (errorEl) {
    errorEl.textContent = mensaje;
    errorEl.classList.add('visible');
  }
  if (inputEl) inputEl.classList.add('invalid');
}

function clearFieldError(id) {
  const errorEl = document.getElementById(`error-${id}`);
  const inputEl = id === 'archivoInput' ? dropZone : document.getElementById(id);
  if (errorEl) errorEl.classList.remove('visible');
  if (inputEl) inputEl.classList.remove('invalid');
}

/* ─────────────────────────────────────────
   Validación del formulario
   ───────────────────────────────────────── */
const TIPOS_VALIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const EXTENSIONES_VALIDAS = /\.(pdf|doc|docx|txt)$/i;
const MAX_MB = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validarFormulario() {
  let valido = true;

  // Campos obligatorios base
  ['nombre', 'edad', 'email', 'genero', 'escuela', 'titulo', 'descripcion'].forEach(id => {
    clearFieldError(id);
    const el = document.getElementById(id);
    if (!el.value.trim()) {
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

  // Campos adulto responsable (solo si es menor)
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
    mostrarFieldError('autoriza', 'Debés autorizar el uso de tus datos para continuar.');
    valido = false;
  }

  // Archivo
  clearFieldError('archivoInput');
  if (!fileInput.files || fileInput.files.length === 0) {
    mostrarFieldError('archivoInput', 'Adjuntá el archivo de tu cuento.');
    valido = false;
  } else {
    const file = fileInput.files[0];
    const esValido = TIPOS_VALIDOS.includes(file.type) || EXTENSIONES_VALIDAS.test(file.name);
    if (!esValido) {
      mostrarFieldError('archivoInput', 'El archivo debe ser PDF, DOC, DOCX o TXT.');
      valido = false;
    } else if (file.size > MAX_MB * 1024 * 1024) {
      mostrarFieldError('archivoInput', `El archivo no puede superar los ${MAX_MB} MB.`);
      valido = false;
    }
  }

  return valido;
}

/* ─────────────────────────────────────────
   Limpiar errores al editar — solo campos que existen
   ───────────────────────────────────────── */
['nombre', 'edad', 'email', 'genero', 'escuela', 'titulo', 'descripcion', 'adultoNombre', 'adultoEmail', 'adultoTel'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input',  () => clearFieldError(id));
  el.addEventListener('change', () => clearFieldError(id));
});

document.getElementById('autoriza').addEventListener('change', () => clearFieldError('autoriza'));

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
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    fileInput.files = dt.files;
    actualizarDropZone(files[0]);
  }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) actualizarDropZone(fileInput.files[0]);
});

function actualizarDropZone(file) {
  fileDisplay.textContent = `✓ ${file.name}`;
  dropZone.classList.add('has-file');
  dropZone.classList.remove('invalid');
  clearFieldError('archivoInput');
}

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
    const file       = fileInput.files[0];
    const base64File = await fileToBase64(file);

    const payload = {
      nombre:      document.getElementById('nombre').value.trim(),
      edad:        edadSelect.value,
      email:       document.getElementById('email').value.trim(),
      genero:      document.getElementById('genero').value,
      escuela:     document.getElementById('escuela').value.trim(),
      titulo:      document.getElementById('titulo').value.trim(),
      descripcion: document.getElementById('descripcion').value.trim(),
      fileName:    file.name,
      fileData:    base64File,
      mimeType:    file.type || 'application/octet-stream',
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
        `¡Gracias, ${payload.nombre}! Tu cuento "${payload.titulo}" fue enviado con éxito. ` +
        `Te enviamos una confirmación a ${payload.email}.`
      );
      form.reset();
      dropZone.classList.remove('has-file');
      fileDisplay.textContent = '';
      toggleAdulto(); // ocultar campos adulto si quedaron visibles
    } else {
      throw new Error(result.message || 'Error desconocido en el servidor.');
    }

  } catch (err) {
    console.error('Error al enviar:', err);
    mostrarAlerta('error',
      'Hubo un problema al enviar tu cuento. Por favor, intentá de nuevo o escribinos a revistaliterariatds@gmail.com.'
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