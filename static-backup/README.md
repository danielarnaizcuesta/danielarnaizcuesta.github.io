# Copia sin framework

Esta carpeta contiene una copia de la web estatica tal como funciona sin Vite,
sin `package.json` y sin proceso de build.

Uso previsto:

- Backup rapido si algun hosting no quiere compilar la version framework.
- Subida manual a `public_html` en Hostinger u otro hosting estatico.
- Comparacion con la version raiz si se toca la estructura de build.
- Conserva tambien la politica de cookies y el gestor de consentimiento.

La version principal del repositorio sigue estando en la raiz. La estructura
framework solo anade deteccion y build para Hostinger, pero no cambia la logica
del contrato ni el funcionamiento de la web estatica.
