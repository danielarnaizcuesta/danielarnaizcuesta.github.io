# danielarnaizcuesta.github.io

Web estática para publicar en GitHub Pages como página de usuario de
`danielarnaizcuesta`.

## Contenido

- `index.html`: contratación digital de conciliación.
- `privacidad.html`: información de protección de datos.
- `aviso-legal.html`: titularidad, alcance, precio y hojas de reclamaciones.
- `desistimiento.html`: contratación a distancia e inicio inmediato.
- `app.js`: genera solicitud por correo, WhatsApp, copia y descarga local.
- `assets/`: imagen de cabecera y favicon.

## Publicación

Crear en GitHub un repositorio público llamado exactamente:

```text
danielarnaizcuesta.github.io
```

Subir el contenido de esta carpeta a la rama principal. GitHub Pages publicará la web
en:

```text
https://danielarnaizcuesta.github.io/
```

La web no almacena solicitudes ni documentos. El formulario prepara el texto en el
navegador del cliente y lo envía mediante su cliente de correo o WhatsApp.

## Script rápido

Esta carpeta incluye `publish.ps1`. Tras autenticar GitHub CLI, crea el repositorio si
no existe y sube la rama `main`.
