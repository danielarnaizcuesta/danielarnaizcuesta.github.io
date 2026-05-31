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
    `Empresa o empleador: ${valueOf(data, "empresa")}`,
    "Resumen del caso:",
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
    valueOf(data, "nombre"),
    "",
    "El cliente solicita iniciar el encargo de conciliacion y representacion de forma inmediata, aceptando las condiciones generales, la politica de privacidad y autorizando el inicio de gestiones.",
  ].join("\n");
}

function setLinks(summary, data) {
  const subject = `Solicitud contratacion conciliacion - ${valueOf(data, "nombre")}`;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(summary);
  emailLink.href = `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

  // Enviar el resumen completo por WhatsApp para mayor comodidad y reenvío directo
  const waMessage = 
    `*SOLICITUD DE CONTRATACIÓN*\n\n` +
    `Hola Daniel, aquí tienes la solicitud de contratación que acabo de preparar desde la web:\n\n` +
    summary;
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
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

function generatePDF(summary, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Margins & Dimensions (A4 = 210mm x 297mm)
  const marginX = 15;
  const pageHeight = 297;
  const wrapWidth = 180; // 210 - 2 * 15
  
  doc.setFont("helvetica", "normal");
  
  // Split the summary text into lines that fit the page width
  const lines = doc.splitTextToSize(summary, wrapWidth);
  
  let y = 20;
  
  for (let i = 0; i < lines.length; i++) {
    // If we reach the bottom of the page, add a new page
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    
    const line = lines[i].trim();
    
    if (["SOLICITUD DE CONTRATACION", "PRESTADOR", "CLIENTE", "ASUNTO", "SERVICIO SOLICITADO", "PRECIO", "ACEPTACIONES", "FIRMA / CONFIRMACION ESCRITA"].includes(line)) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(47, 102, 83); // Forest Green (#2f6653) matching Daniel's identity
      doc.setFontSize(12);
      y += 4;
      doc.text(line, marginX, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(10);
    } else if (line.startsWith("Fecha de generacion:")) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(110, 110, 110);
      doc.setFontSize(9);
      doc.text(line, marginX, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(10);
    } else {
      doc.text(lines[i], marginX, y); // Maintain indentation for regular lines
      y += 6;
    }
  }
  
  doc.save(filename);
}

downloadButton.addEventListener("click", () => {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `solicitud-conciliacion-${date}.pdf`;
  
  if (window.jspdf && window.jspdf.jsPDF) {
    try {
      generatePDF(summaryText.value, filename);
      return;
    } catch (e) {
      console.error("Failed to generate PDF, falling back to text file:", e);
    }
  }
  
  // Fallback to text file in case of offline/script load failure
  const blob = new Blob([summaryText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `solicitud-conciliacion-${date}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});
