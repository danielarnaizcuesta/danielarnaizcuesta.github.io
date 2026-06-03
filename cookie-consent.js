(function () {
  const STORAGE_KEY = "dac_cookie_preferences";
  const VERSION = "2026-06-03";
  const DEFAULT_PREFS = {
    necessary: true,
    analytics: false,
    marketing: false,
  };

  function readPreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && stored.version === VERSION && stored.preferences) {
        return stored.preferences;
      }
    } catch (error) {
      console.warn("No se pudieron leer las preferencias de cookies.", error);
    }
    return null;
  }

function savePreferences(preferences) {
    const payload = {
      version: VERSION,
      savedAt: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(preferences.analytics),
        marketing: Boolean(preferences.marketing),
      },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudieron guardar las preferencias de cookies.", error);
    }
    window.dispatchEvent(new CustomEvent("dac:cookie-preferences", { detail: payload.preferences }));
    return payload.preferences;
  }

  function applyPreferences(preferences) {
    if (!preferences) return;
    document.documentElement.dataset.analyticsCookies = preferences.analytics ? "accepted" : "rejected";
    document.documentElement.dataset.marketingCookies = preferences.marketing ? "accepted" : "rejected";
  }

  function buildBanner() {
    const banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("aria-label", "Preferencias de cookies");
    banner.innerHTML = `
      <div class="cookie-banner__copy">
        <h2>Cookies y privacidad</h2>
        <p>
          Usamos cookies o almacenamiento tecnico para seguridad, pagos y funcionamiento de la web.
          Las cookies de analitica o marketing quedan desactivadas salvo que las aceptes.
        </p>
        <a href="cookies.html">Ver politica de cookies</a>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="secondary" data-cookie-action="settings">Configurar</button>
        <button type="button" class="secondary" data-cookie-action="reject">Rechazar no necesarias</button>
        <button type="button" class="primary" data-cookie-action="accept">Aceptar todas</button>
      </div>
    `;
    return banner;
  }

  function buildPanel() {
    const panel = document.createElement("div");
    panel.className = "cookie-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="cookie-panel__dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-panel-title">
        <div class="cookie-panel__header">
          <h2 id="cookie-panel-title">Configurar cookies</h2>
          <button type="button" class="cookie-panel__close" data-cookie-action="close" aria-label="Cerrar">x</button>
        </div>
        <p>
          Las cookies tecnicas son necesarias para prestar el servicio. Puedes activar o desactivar
          analitica y marketing cuando se incorporen herramientas de medicion o comunicacion comercial.
        </p>
        <label class="cookie-toggle">
          <input type="checkbox" checked disabled />
          <span>
            <strong>Tecnicas necesarias</strong>
            Seguridad, hosting, formulario, preferencia de consentimiento y pagos solicitados por ti.
          </span>
        </label>
        <label class="cookie-toggle">
          <input type="checkbox" data-cookie-setting="analytics" />
          <span>
            <strong>Analitica</strong>
            Medicion agregada de uso de la web. Ahora no se carga ninguna analitica propia.
          </span>
        </label>
        <label class="cookie-toggle">
          <input type="checkbox" data-cookie-setting="marketing" />
          <span>
            <strong>Marketing</strong>
            Seguimiento o publicidad. Ahora no se cargan cookies publicitarias propias.
          </span>
        </label>
        <div class="cookie-panel__actions">
          <button type="button" class="secondary" data-cookie-action="reject">Rechazar no necesarias</button>
          <button type="button" class="primary" data-cookie-action="save">Guardar preferencias</button>
        </div>
      </div>
    `;
    return panel;
  }

  function openPanel(panel, preferences) {
    const current = preferences || readPreferences() || DEFAULT_PREFS;
    panel.querySelector("[data-cookie-setting='analytics']").checked = Boolean(current.analytics);
    panel.querySelector("[data-cookie-setting='marketing']").checked = Boolean(current.marketing);
    panel.hidden = false;
    panel.querySelector("[data-cookie-action='close']").focus();
  }

  function closePanel(panel) {
    panel.hidden = true;
  }

  function hideBanner(banner) {
    banner.hidden = true;
  }

  function init() {
    const stored = readPreferences();
    applyPreferences(stored || DEFAULT_PREFS);

    const banner = buildBanner();
    const panel = buildPanel();
    document.body.appendChild(banner);
    document.body.appendChild(panel);

    if (stored) {
      hideBanner(banner);
    }

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest("[data-cookie-action], [data-open-cookie-settings]");
      if (!trigger) return;

      const action = trigger.dataset.cookieAction || "settings";
      if (action === "accept") {
        applyPreferences(savePreferences({ analytics: true, marketing: true }));
        hideBanner(banner);
        closePanel(panel);
      } else if (action === "reject") {
        applyPreferences(savePreferences({ analytics: false, marketing: false }));
        hideBanner(banner);
        closePanel(panel);
      } else if (action === "settings") {
        openPanel(panel, readPreferences());
      } else if (action === "save") {
        const analytics = panel.querySelector("[data-cookie-setting='analytics']").checked;
        const marketing = panel.querySelector("[data-cookie-setting='marketing']").checked;
        applyPreferences(savePreferences({ analytics, marketing }));
        hideBanner(banner);
        closePanel(panel);
      } else if (action === "close") {
        closePanel(panel);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
