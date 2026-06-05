(function () {
  const STORAGE_KEY = "dac_whatsapp_gate";
  const VERSION = "2026-06-05";

  function readAcceptance() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored && stored.version === VERSION && stored.accepted) {
        return stored;
      }
    } catch (error) {
      console.warn("No se pudo leer la aceptacion de WhatsApp.", error);
    }
    return null;
  }

  function saveAcceptance() {
    const payload = {
      version: VERSION,
      accepted: true,
      acceptedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudo guardar la aceptacion de WhatsApp.", error);
    }
    return payload;
  }

  function hasAccepted() {
    return Boolean(readAcceptance());
  }

  function buildGate() {
    const wrapper = document.createElement("div");
    wrapper.className = "channel-gate";
    wrapper.hidden = true;
    wrapper.innerHTML = `
      <div class="channel-gate__dialog" role="dialog" aria-modal="true" aria-labelledby="whatsapp-gate-title">
        <div class="channel-gate__header">
          <h2 id="whatsapp-gate-title">Continuar por WhatsApp</h2>
          <button type="button" class="channel-gate__close" data-whatsapp-gate="close" aria-label="Cerrar">x</button>
        </div>
        <div class="channel-gate__body">
          <p>
            Responsable: Daniel Arnaiz Cuesta. Tus datos se trataran para atender tu consulta,
            gestionar tu asunto y, en su caso, la relacion profesional.
          </p>
          <p>
            Mas informacion en la
            <a href="privacidad.html" target="_blank" rel="noreferrer">Politica de Privacidad</a>.
          </p>
          <label class="channel-gate__check">
            <input type="checkbox" id="whatsapp-gate-check" />
            <span>He leido la Politica de Privacidad y acepto continuar por WhatsApp.</span>
          </label>
        </div>
        <div class="channel-gate__actions">
          <button type="button" class="secondary" data-whatsapp-gate="close">Cancelar</button>
          <button type="button" class="primary" data-whatsapp-gate="continue" disabled>Continuar por WhatsApp</button>
        </div>
      </div>
    `;
    return wrapper;
  }

  function init() {
    const gate = buildGate();
    document.body.appendChild(gate);

    const checkbox = gate.querySelector("#whatsapp-gate-check");
    const continueButton = gate.querySelector("[data-whatsapp-gate='continue']");
    let pendingLink = null;

    function closeGate() {
      gate.hidden = true;
      pendingLink = null;
      checkbox.checked = false;
      continueButton.disabled = true;
    }

    function openGate(link) {
      pendingLink = link;
      gate.hidden = false;
      checkbox.checked = false;
      continueButton.disabled = true;
      checkbox.focus();
    }

    function continueToWhatsApp(link) {
      if (!link) return;
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");
      if (!href) return;

      if (target === "_blank") {
        window.open(href, "_blank", "noopener");
      } else {
        window.location.href = href;
      }
    }

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;

      const action = event.target.closest("[data-whatsapp-gate]");
      if (action) {
        const mode = action.getAttribute("data-whatsapp-gate");
        if (mode === "close") {
          closeGate();
        } else if (mode === "continue" && pendingLink && checkbox.checked) {
          saveAcceptance();
          const link = pendingLink;
          closeGate();
          continueToWhatsApp(link);
        }
        return;
      }

      const link = event.target.closest("a[href*='wa.me/']");
      if (!link || hasAccepted()) return;

      event.preventDefault();
      openGate(link);
    });

    checkbox.addEventListener("change", () => {
      continueButton.disabled = !checkbox.checked;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !gate.hidden) {
        closeGate();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
