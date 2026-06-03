# danielarnaizcuesta.github.io

Web estatica para publicar en GitHub Pages como pagina de usuario de
`danielarnaizcuesta`.

## Contenido

- `index.html`: contratacion digital de servicios.
- `calculadoras.html`: calculadoras laborales.
- `modelos.html`: modelos y enlaces oficiales para trabajadores.
- `privacidad.html`: informacion de proteccion de datos.
- `aviso-legal.html`: titularidad, alcance, precio y hojas de reclamaciones.
- `desistimiento.html`: contratacion a distancia e inicio inmediato.
- `app.js`: logica de contratacion, hoja de encargo, cifrado y PDF.
- `calculadoras.js`: logica de calculadoras laborales.
- `assets/`: favicon, libreria PDF y documentos descargables.

## Publicacion en GitHub Pages

Crear en GitHub un repositorio publico llamado exactamente:

```text
danielarnaizcuesta.github.io
```

Subir el contenido de esta carpeta a la rama principal. GitHub Pages publica la web en:

```text
https://danielarnaizcuesta.github.io/
```

La web no almacena solicitudes ni documentos en claro. El formulario cifra el contrato
en el navegador antes del envio tecnico y genera una copia local para el cliente.

## Estructura framework para Hostinger

El repositorio mantiene dos formas de servir la web:

- Raiz estatica: `index.html`, `styles.css`, `app.js`, `calculadoras.js` y el resto
  de paginas HTML siguen funcionando directamente, como antes.
- Build framework: `package.json` y `vite.config.js` permiten que Hostinger detecte
  el proyecto como Vite y genere una salida en `dist/`.

Configuracion recomendada en Hostinger al importar desde GitHub:

```text
Framework: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
Node version: 22 o superior
```

La carpeta `static-backup/` contiene una copia de la version sin framework para subida
manual a `public_html` si alguna plataforma falla con el build.

Comandos locales:

```powershell
npm install
npm run build
npm run preview
```

## Script rapido

Esta carpeta incluye `publish.ps1`. Tras autenticar GitHub CLI, crea el repositorio si
no existe y sube la rama `main`.
