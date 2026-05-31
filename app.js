const CONTACT_EMAIL = "danielarnaizcuesta@gmail.com";
const WHATSAPP_NUMBER = "34615860227";

const form = document.querySelector("#hire-form");
const resultSection = document.querySelector("#resultado");
const summaryText = document.querySelector("#summary-text");
const emailLink = document.querySelector("#email-link");
const whatsappLink = document.querySelector("#whatsapp-link");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const copyStatus = document.querySelector("#copy-status");

function clean(value) {
  return String(value || "").trim();
}

function valueOf(data, name) {
  return clean(data.get(name));
}

function yesNo(data, name) {
  return data.get(name) ? "SI" : "NO";
}

function buildSummary(data) {
  const generatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const amount = valueOf(data, "importe");
  const amountLine = amount ? `${amount} EUR` : "No indicado";

  return [
    "SOLICITUD DE CONTRATACION",
    "",
    `Fecha de generacion: ${generatedAt}`,
    "",
    "PRESTADOR",
    "Daniel Arnaiz Cuesta, NIF 72828826Q",
    "Servicio documental laboral. Representacion ante el SMAC presencial o delegada con firma.",
    "",
    "CLIENTE",
    `Nombre: ${valueOf(data, "nombre")}`,
    `DNI/NIE: ${valueOf(data, "dni")}`,
    `Email: ${valueOf(data, "email")}`,
    `Telefono: ${valueOf(data, "telefono")}`,
    `Domicilio: ${valueOf(data, "domicilio")}`,
    "",
    "ASUNTO",
    `Tipo: ${valueOf(data, "tipo")}`,
    `Fecha del acto o comunicacion: ${valueOf(data, "fechaActo")}`,
    `Empresa/empleador: ${valueOf(data, "empresa") || "No indicado"}`,
    `Importe aproximado reclamado: ${amountLine}`,
    "Resumen:",
    valueOf(data, "resumen"),
    "",
    "SERVICIO SOLICITADO",
    "Papeleta de conciliacion, presentacion y representacion ante el SMAC presencial o delegada con firma.",
    "",
    "PRECIO",
    "Precio cerrado del servicio: 90,00 EUR IVA incluido.",
    "Factura del servicio conforme a la normativa de facturacion.",
    "ACEPTACIONES",
    `Acepta condiciones del servicio y solicita inicio inmediato: ${yesNo(data, "aceptaCondiciones")}`,
    "",
    "FIRMA / CONFIRMACION ESCRITA",
    valueOf(data, "firma"),
    "",
    "El cliente solicita iniciar el encargo de conciliacion y representacion de forma inmediata, aceptando las condiciones generales, la politica de privacidad y autorizando el inicio de gestiones.",
  ].join("\n");
}

function setLinks(summary, data) {
  const subject = `Solicitud contratacion conciliacion - ${valueOf(data, "nombre")}`;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(summary);
  emailLink.href = `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

  const shortMessage =
    `Hola Daniel, acabo de preparar una solicitud de contratacion. ` +
    `Soy ${valueOf(data, "nombre")} y mi asunto es: ${valueOf(data, "tipo")}.`;
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(shortMessage)}`;
}

function showResult(summary, data) {
  summaryText.value = summary;
  setLinks(summary, data);
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  copyStatus.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const summary = buildSummary(data);
  showResult(summary, data);
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(summaryText.value);
    copyStatus.textContent = "Texto copiado.";
  } catch (error) {
    summaryText.select();
    document.execCommand("copy");
    copyStatus.textContent = "Texto seleccionado y copiado.";
  }
});

downloadButton.addEventListener("click", () => {
  const blob = new Blob([summaryText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `solicitud-conciliacion-${date}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});
