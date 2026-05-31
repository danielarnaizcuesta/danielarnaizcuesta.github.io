const CONTACT_EMAIL = "danielarnaizcuesta@gmail.com";
const WHATSAPP_NUMBER = "34615860227";
const BASE_PRICE = 90;
const MAX_TOTAL = 150;

const form = document.querySelector("#hire-form");
const resultSection = document.querySelector("#resultado");
const summaryText = document.querySelector("#summary-text");
const emailLink = document.querySelector("#email-link");
const whatsappLink = document.querySelector("#whatsapp-link");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const copyStatus = document.querySelector("#copy-status");
const estimateOutput = document.querySelector("#estimate-output");

function euro(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function clean(value) {
  return String(value || "").trim();
}

function valueOf(data, name) {
  return clean(data.get(name));
}

function yesNo(data, name) {
  return data.get(name) ? "SI" : "NO";
}

function calculateEstimate() {
  const amountField = form.elements.importe;
  const amount = Number(amountField.value || 0);

  if (!amount || amount < 0) {
    estimateOutput.textContent =
      "Introduce un importe aproximado para ver el posible máximo orientativo.";
    return;
  }

  const variableTotal = Math.min(amount * 0.1, MAX_TOTAL);
  const total = Math.max(BASE_PRICE, variableTotal);
  const complement = Math.max(0, total - BASE_PRICE);

  estimateOutput.textContent =
    `Orientativo si se cobraran ${euro(amount)} por avenencia: total máximo ${euro(total)}; ` +
    `complemento posterior ${euro(complement)}.`;
}

function buildSummary(data) {
  const generatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const amount = valueOf(data, "importe");
  const amountLine = amount ? `${amount} EUR` : "No indicado";

  return [
    "SOLICITUD DE CONTRATACION S-01",
    "",
    `Fecha de generacion: ${generatedAt}`,
    "",
    "PRESTADOR",
    "Daniel Arnaiz Cuesta, NIF 72828826Q",
    "Servicio documental laboral. Representacion voluntaria ante SMAC con poder valido.",
    "No abogado ni graduado social. No asistencia letrada ni representacion judicial.",
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
    "S-01: redaccion y presentacion de papeleta de conciliacion, una representacion ante SMAC con poder valido y borrador posterior incluido cuando proceda y pueda entregarse en plazo.",
    "",
    "PRECIO",
    "Precio del servicio: 90,00 EUR IVA incluido.",
    "El pago se realiza tras la emision de la factura, salvo pacto distinto por escrito.",
    "Complemento solo si existe avenencia dineraria ante SMAC y cobro efectivo: hasta completar el menor entre el 10% de lo cobrado y 150,00 EUR de precio total. Los 90,00 EUR iniciales se descuentan siempre.",
    "",
    "ACEPTACIONES",
    `Solicita contratar S-01: ${yesNo(data, "aceptaServicio")}`,
    `Conoce limites profesionales y judiciales: ${yesNo(data, "aceptaLimites")}`,
    `Ha leido proteccion de datos: ${yesNo(data, "aceptaPrivacidad")}`,
    `Ha leido desistimiento: ${yesNo(data, "aceptaDesistimiento")}`,
    `Solicita inicio urgente si procede: ${yesNo(data, "inicioUrgente")}`,
    `Autoriza indicar canal de documentacion por correo o WhatsApp: ${yesNo(data, "sinAdjuntos")}`,
    "",
    "FIRMA / CONFIRMACION ESCRITA",
    valueOf(data, "firma"),
    "",
    "El cliente solicita iniciar el encargo S-01. Daniel Arnaiz Cuesta respondera con el inicio, la factura y el canal de documentacion. En asuntos de despido o con riesgo de caducidad o prescripcion, el cliente solicita inicio inmediato durante el plazo de desistimiento si ha marcado esa opcion.",
  ].join("\n");
}

function setLinks(summary, data) {
  const subject = `Solicitud contratacion S-01 - ${valueOf(data, "nombre")}`;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(summary);
  emailLink.href = `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

  const shortMessage =
    `Hola Daniel, acabo de preparar una solicitud de contratacion S-01. ` +
    `Soy ${valueOf(data, "nombre")} y mi asunto es: ${valueOf(data, "tipo")}.`;
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(shortMessage)}`;
}

function showResult(summary, data) {
  summaryText.value = summary;
  setLinks(summary, data);
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("input", calculateEstimate);

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
  anchor.download = `solicitud-s01-${date}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

calculateEstimate();
