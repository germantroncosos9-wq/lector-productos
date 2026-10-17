# Lector de Productos

Aplicación web (PWA) para **escanear códigos de barras y consultar productos** de una
base alojada en Google Sheets. Funciona también **sin conexión** una vez cargada la
base local.

- **App en producción:** <https://germantroncosos9-wq.github.io/lector-productos/>
- **Tecnología:** HTML, CSS y JavaScript "vanilla" (sin frameworks ni paso de compilación).

---

## ¿Qué hace?

- 📷 **Escanear** un producto con la cámara del dispositivo.
- ⌨️ **Buscar manualmente** por código de barras o por **código interno**.
- 💲 Mostrar **precio**, **precio OAI** y **SUPER OAI** (con etiqueta y resaltado propios).
- 📋 **Listas personalizadas**: crear listas, agregar productos por escáner o por código
  y ajustar cantidades.
- 🎨 **Tres temas**: clásico, nocturno y rosa.
- ⚙️ **Ajustes** de sonido, vibración y animación (se recuerdan entre sesiones).
- 📴 **Funciona sin conexión** (service worker) e **instalable** como app en el móvil.
- 📄 Copiar el **código interno** con un toque.

## Cómo se usa

1. Abre la app.
2. **La primera vez**, pulsa **↻ Actualizar productos** y espera a que termine
   (la primera descarga tarda un poco; verás una barra de progreso).
3. Escanea un código o escríbelo en el buscador.

---

## Estructura del proyecto

| Archivo | Descripción |
|---|---|
| `index.html` | Estructura de la interfaz (incluye los modales de Ayuda, diálogos y listas). |
| `css/styles.css` | Estilos y definición de los tres temas. |
| `js/app.js` | Toda la lógica de la aplicación (script clásico). |
| `sw.js` | Service worker: soporte sin conexión y precarga de recursos. **Debe permanecer en la raíz**: si se mueve a una subcarpeta, su alcance dejaría de cubrir toda la app. |
| `manifest.json` | Metadatos de la PWA (nombre, iconos, colores). |
| `img/icon-*.png`, `img/apple-touch-icon.png`, `img/banner-cruz-verde.png` | Iconos e imagen de marca. |
| `vendor/zxing-browser.min.js` | Librería ZXing (lectura de códigos) alojada localmente, con `integrity` (SRI). |
| `vendor/LICENSE-zxing-browser.txt` | Licencia de ZXing (MIT). |
| `package.json`, `eslint.config.mjs`, `stylelint.config.mjs` | Herramientas de calidad de código (solo desarrollo). |

---

## Cómo funciona

### Origen de los datos

Los datos viven en una **hoja de Google Sheets** publicada mediante una **Web App de
Google Apps Script**. Su URL está en `js/app.js` (`const API_URL`). La app la consulta con
`fetch` y un `AbortController` que aplica un **tiempo máximo de 25 s** (el listado pesa
unos 8 MB, por eso el margen es amplio).

La respuesta tiene esta forma:

```json
{
  "productos": [
    {
      "CODIGO INTERNO": 3,
      "DESCRIPTOR": "…",
      "PRECIO": 1190,
      "BARRAS": "7802001234567",
      "PRECIOOAI": "990",
      "SUPER OAI": "SUPER OAI"
    }
  ],
  "mensaje": "Texto del aviso (opcional)"
}
```

> **Nota:** la Web App ignora el parámetro `?accion=…` y responde siempre con el mismo
> listado completo. No incluye campo de fecha; la app usa la fecha del dispositivo como
> respaldo.

### Almacenamiento local

| Dónde | Qué guarda |
|---|---|
| **IndexedDB** (`LectorProductosDB` → store `productos`, registro `id: "base"`) | El listado completo de productos tras cada actualización. |
| **localStorage** | Listas personalizadas, preferencias (sonido/vibración/animación), tema activo y el último aviso. |

Al abrir la app se carga el listado desde IndexedDB, de modo que **se puede usar sin
conexión** sin volver a descargar nada.

El registro "base" lleva un campo `esquema` con la versión de su formato. Al cargarlo,
`migrarRegistroBase()` aplica las migraciones necesarias e **ignora** los registros
guardados por una versión más nueva de la app o ilegibles (en ese caso se pide volver a
actualizar la base). Las migraciones de la estructura de la base se aplican en
`onupgradeneeded`, según `oldVersion`.

### Búsqueda

`buscarProducto(codigo)` intenta, en este orden: código de barras exacto → coincidencia
por `CÓDIGO INTERNO` → variante **sin ceros iniciales** (`codigoCanonico`). Todo se
resuelve con índices construidos en memoria al cargar la base (`indice` para los códigos
de barras e `indiceInterno` para los códigos internos), sin recorridos lineales.

### Service worker

`sw.js` precarga los archivos propios en su caché (`CACHE_NAME`). La página principal usa
estrategia *network-first* (y cae a la caché sin conexión); el resto de recursos, *cache-first*.
La API de Google y cualquier analítica se excluyen de la caché.

---

## Desarrollo local

No hay compilación: son archivos estáticos. Para probarlos, **sírvelos por HTTP** (abrirlos
como `file://` rompe el service worker, la cámara y las peticiones CORS):

```bash
# Opción A
python3 -m http.server 8088

# Opción B
npx serve
```

Luego abre <http://localhost:8088>. La cámara y el service worker requieren un
**contexto seguro** (`https://` o `localhost`).

---

## Calidad de código

Se usan **ESLint** (JS) y **Stylelint** (CSS). Solo son herramientas de desarrollo: no
forman parte del sitio desplegado.

```bash
npm install      # instala las devDependencies
npm run lint     # ESLint + Stylelint
npm run lint:js  # solo JavaScript
npm run lint:css # solo CSS
```

Comprobación rápida de sintaxis sin dependencias: `node --check js/app.js`.

> **Nota:** `npm audit` reporta una vulnerabilidad de severidad alta en una
> dependencia **transitiva de desarrollo** de Stylelint (`braces`, vía
> `globby`). No afecta al sitio publicado ni al código que se ejecuta en el
> navegador, y `npm audit fix --force` la "resolvería" degradando Stylelint a
> una versión muy antigua, por lo que se deja como está.

---

## Despliegue

El sitio se publica con **GitHub Pages** sirviendo la rama **`main`** desde la raíz del
repositorio. Por tanto, **lo que esté en `main` es lo que se ve en producción**.

```bash
git checkout main
git merge mejoras
git push origin main
```

> Al cambiar `index.html`, `css/styles.css` o `js/app.js`, conviene **subir `CACHE_NAME`
> en `sw.js`** (por ejemplo `lector-productos-v8` → `v9`) para forzar que los usuarios
> reciban la versión nueva.

### Actualizar los datos

Los datos se editan en la hoja de cálculo de Google; no hace falta tocar el código. Los
usuarios reciben los cambios al pulsar **↻ Actualizar productos**. No hay que reconstruir
nada ni volver a desplegar.

---

## Permisos y privacidad

- La app pide acceso a la **cámara** solo al escanear.
- **No** incluye analítica ni carga recursos de terceros: la librería de escaneo (ZXing)
  está alojada en el propio repositorio.

---

## Licencia

Proyecto **propietario**: todos los derechos reservados. Consulta [`LICENSE`](LICENSE).

Incluye la librería **ZXing** (`@zxing/browser`, 0.1.5) bajo licencia **MIT**, cuyo texto
está en [`vendor/LICENSE-zxing-browser.txt`](vendor/LICENSE-zxing-browser.txt).

---

## Autor

Germán · CV11 — contacto: `GermanTroncosoS9@Gmail.Com`
