# 📝 Cómo agregar una nueva Nota Editorial

## Estructura de la carpeta /editorial/

```
editorial/
├── index.json       ← índice de todas las notas (editarlo cada vez)
├── template.html    ← plantilla para crear nuevas notas
├── inicios.html     ← ejemplo: nota sobre los inicios
├── inicios.jpeg     ← imagen de portada de esa nota (opcional)
└── README.md        ← este archivo
```

---

## Pasos para publicar una nueva nota

### 1. Crear el archivo HTML
- Duplicar `template.html`
- Renombrarlo con un nombre descriptivo, sin espacios ni tildes
  - ✅ `entrevista-lopez.html`
  - ✅ `cronica-feria-libro.html`
  - ❌ `Entrevista a López.html`
- Completar todos los campos marcados con `CAMBIAR:`

### 2. (Opcional) Agregar una imagen de portada
- Subir una imagen `.jpeg` a esta misma carpeta `/editorial/`
- Usar el mismo nombre base que el HTML
  - Ejemplo: `entrevista-lopez.jpeg`

### 3. Registrar la nota en index.json
Abrir `index.json` y agregar un nuevo objeto al array.
**El orden en el JSON es el orden en que aparecen en la página.**

```json
[
  {
    "archivo":     "inicios.html",
    "titulo":      "Los inicios de la revista",
    "descripcion": "Descripción corta que aparece en la tarjeta.",
    "categoria":   "Editorial",
    "autor":       "Equipo TdS",
    "fecha":       "Mayo 2025",
    "imagen":      "inicios.jpeg"
  },
  {
    "archivo":     "entrevista-lopez.html",
    "titulo":      "Entrevista a Martín López",
    "descripcion": "El escritor habla de su proceso creativo y sus influencias del sur.",
    "categoria":   "Entrevista",
    "autor":       "Tramas del Sur",
    "fecha":       "Junio 2025",
    "imagen":      "entrevista-lopez.jpeg"
  }
]
```

---

## Campos disponibles en index.json

| Campo        | Obligatorio | Descripción                                      |
|--------------|:-----------:|--------------------------------------------------|
| `archivo`    | ✅          | Nombre del .html dentro de /editorial/           |
| `titulo`     | ✅          | Título que aparece en la tarjeta                 |
| `descripcion`|             | Bajada corta (1-2 oraciones)                     |
| `categoria`  |             | Ej: "Entrevista", "Ensayo", "Crónica"            |
| `autor`      |             | Nombre del autor/a                               |
| `fecha`      |             | Ej: "Mayo 2025"                                  |
| `imagen`     |             | Nombre del .jpeg dentro de /editorial/           |

---

## Categorías sugeridas
- Editorial
- Entrevista
- Ensayo
- Crónica
- Reseña
- Opinión
