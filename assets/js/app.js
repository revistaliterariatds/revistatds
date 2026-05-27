/**
 * Tramas del Sur — app.js
 * Módulos: Notas Editoriales | Descargas de Ediciones
 */

'use strict';

/* ─────────────────────────────────────────
   Utilidad: verificar existencia de un recurso
   ───────────────────────────────────────── */
async function resourceExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────
   Módulo: Notas Editoriales
   Carga `editorial/index.json` y renderiza
   tarjetas de notas en #notas-grid.
   ───────────────────────────────────────── */
async function initNotasEditoriales() {
  const grid  = document.getElementById('notas-grid');
  const count = document.getElementById('notas-count');

  if (!grid) return;

  try {
    const res = await fetch('editorial/index.json');
    if (!res.ok) throw new Error('No se encontró el índice de notas.');

    const notas = await res.json();

    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = '';

    if (!notas.length) {
      grid.innerHTML = '<p class="downloads-empty">Próximamente.</p>';
      return;
    }

    if (count) {
      count.textContent = notas.length === 1 ? '1 nota' : `${notas.length} notas`;
    }

    notas.forEach((nota, i) => {
      const num    = String(i + 1).padStart(2, '0');
      const imgTag = nota.imagen
        ? `<div class="nota-thumb">
             <img src="editorial/${nota.imagen}" alt="Imagen de la nota: ${nota.titulo}" loading="lazy" />
           </div>`
        : `<div class="nota-thumb nota-thumb--placeholder" aria-hidden="true">
             <span>${num}</span>
           </div>`;

      const card   = document.createElement('a');
      card.href    = `editorial/${nota.archivo}`;
      card.className = 'nota-card';
      card.innerHTML = `
        ${imgTag}
        <div class="nota-body">
          <p class="nota-categoria">${nota.categoria || 'Nota'}</p>
          <h3 class="nota-titulo">${nota.titulo}</h3>
          <p class="nota-desc">${nota.descripcion || ''}</p>
          <div class="nota-meta">
            ${nota.autor ? `<span class="nota-autor">${nota.autor}</span>` : ''}
            ${nota.fecha  ? `<span class="nota-fecha">${nota.fecha}</span>`  : ''}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch {
    if (grid) {
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = '<p class="downloads-empty">No hay notas disponibles aún.</p>';
    }
  }
}

/* ─────────────────────────────────────────
   Módulo: Descargas de Ediciones
   Detecta PDFs disponibles en /assets/docs/
   y renderiza tarjetas de descarga en #downloads-grid.
   ───────────────────────────────────────── */
async function initDescargas() {
  const grid        = document.getElementById('downloads-grid');
  const MAX_EDITIONS = 20;

  if (!grid) return;

  const found = [];

  for (let i = 1; i <= MAX_EDITIONS; i++) {
    const pdf = `assets/docs/rtds${i}.pdf`;
    if (await resourceExists(pdf)) {
      const img    = `assets/docs/rtds${i}.jpeg`;
      const hasImg = await resourceExists(img);
      found.push({ num: i, pdf, img: hasImg ? img : null });
    }
  }

  grid.setAttribute('aria-busy', 'false');
  grid.innerHTML = '';

  if (found.length === 0) {
    grid.innerHTML = '<p class="downloads-empty">Próximamente disponible.</p>';
    return;
  }

  found.forEach(({ num, pdf, img }) => {
    const card = document.createElement('div');
    card.className = 'edition-card';
    card.innerHTML = `
      <div class="edition-cover">
        ${img
          ? `<img src="${img}" alt="Portada Edición N° ${num}" loading="lazy" />`
          : `<div class="edition-cover-placeholder" aria-hidden="true">
               <span>N°${num}</span>
             </div>`
        }
      </div>
      <div class="edition-info">
        <span class="edition-label">Edición</span>
        <span class="edition-num">N° ${num}</span>
        <a
          href="${pdf}"
          download
          class="edition-btn"
          aria-label="Descargar edición N° ${num} en PDF"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 3v12M7 14l5 5 5-5M4 20h16"/>
          </svg>
          Descargar
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   Inicialización
   ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNotasEditoriales();
  initDescargas();
});
