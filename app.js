const CONTACT_EMAIL = "danielarnaizcuesta@gmail.com";
const WHATSAPP_NUMBER = "34615860227";
const ENCRYPTION_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA8c9htGPDxR2ulaLJRRS5
n4xlEfSihcUIkqTxadXlDrawq5W64JwIfzHafODOZNPCBadBrZk72nyXYpd8XXN8
c4+4oabx5rYwMvywk6VxiFWs3Rvw4mMpnQVYsCtjt6HUeq4zrTLEF/FGNLZXGEf1
pF+h21eh8iUOQkJbBTr2IfKXShfIgUlPpkdvR6llWZr+rlf5IJTbQACAvrBfyk5c
kJXQO7T3Ls4HYABi3wjcy4UE9GJu+TShuCdhhB9FJ7+vYVpmdSV2cIgFudbWljWI
jPFNp0Y3oP3DjKZzceocrecJWwMosatKtsnrUfpaOUJg/DmwRzjch0us5Lj9ldNp
svOUCRedmAHEHXBPFNhoTz31c1f3nzAA+3YLuuqhdq5R8T3zEKm3xsbCllJY0yS+
IzF/qIBd1Lib8hGu2oAyrWXzPPfLvDHFYwyas/C7xi1lRu8DgbD6oWUxj2h9JyaH
GAJiKKswhSkdvLvD792Gw7EqVcHkmAnfQ7QVoZHqvKeykJqzWnmoB8Am5S3tFwR4
YjSdxO3pJzdoHEz09e12G+2QZnsHqW5nHZm7w2GxyFH9iDqIzNSZSfDtfYX68Aw3
CyiSWbqj5TdOzbaQqB+j4Ai+gPAFT/rwYXWEJVuFOc1AWPJfx7rBGKVbkAgJY646
F45WvXRbliUcAMO0nuWuUycCAwEAAQ==
-----END PUBLIC KEY-----`;

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

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function bytesToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function publicKeyBytes() {
  const base64 = ENCRYPTION_PUBLIC_KEY_PEM
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  return base64ToBytes(base64);
}

let importedPublicKey;

async function getPublicKey() {
  if (!importedPublicKey) {
    importedPublicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBytes(),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  }

  return importedPublicKey;
}

async function encryptSubmission(payload) {
  if (!crypto.subtle) {
    throw new Error("El navegador no permite cifrado Web Crypto.");
  }

  const publicKey = await getPublicKey();
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload, null, 2));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plaintext
  );
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawKey
  );

  return {
    version: 1,
    algorithm: "RSA-OAEP-4096-SHA256 + AES-256-GCM",
    encryptedKey: bytesToBase64(encryptedKey),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  };
}

function buildSummary(data) {
  const generatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
  const direccion = valueOf(data, "direccion");
  const piso = valueOf(data, "piso");
  const cp = valueOf(data, "cp");
  const localidad = valueOf(data, "localidad");
  const provincia = valueOf(data, "provincia");
  const domicilioCompleto = [
    direccion,
    piso ? `Piso o puerta: ${piso}` : "",
    `CP ${cp}`,
    localidad,
    provincia,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    "SOLICITUD DE CONTRATACION",
    "",
    `Fecha de generacion: ${generatedAt}`,
    "",
    "PRESTADOR",
    "Daniel Arnaiz Cuesta, NIF 72828826Q",
    "Servicio documental laboral. Representacion voluntaria ante el SMAC con poder valido.",
    "",
    "CLIENTE",
    `Nombre: ${valueOf(data, "nombre")}`,
    `DNI/NIE: ${valueOf(data, "dni")}`,
    `Email: ${valueOf(data, "email")}`,
    `Telefono: ${valueOf(data, "telefono") || "No indicado"}`,
    `Domicilio: ${domicilioCompleto}`,
    "",
    "ASUNTO",
    `Empresa o empleador: ${valueOf(data, "empresa")}`,
    "",
    "SERVICIO SOLICITADO",
    "Papeleta de conciliacion, presentacion y representacion voluntaria ante el SMAC con poder valido.",
    "",
    "PRECIO",
    "Precio cerrado del servicio: 90,00 EUR IVA incluido.",
    "Pago por transferencia o Bizum una vez prestado el servicio, salvo acuerdo escrito distinto.",
    "Factura del servicio conforme a la normativa de facturacion.",
    "",
    "ACEPTACIONES",
    `Acepta condiciones del servicio, privacidad y precio cerrado de 90,00 EUR IVA incluido: ${yesNo(data, "aceptaCondiciones")}`,
    `Solicita inicio inmediato si hay despido, caducidad o riesgo de prescripcion: ${yesNo(data, "inicioInmediato")}`,
    "",
    "FIRMA / CONFIRMACION ESCRITA",
    valueOf(data, "nombre"),
    "",
    data.get("inicioInmediato")
      ? "El cliente solicita iniciar el encargo de conciliacion y representacion de forma inmediata por la posible existencia de plazos de despido, caducidad o prescripcion."
      : "El cliente acepta las condiciones generales y la politica de privacidad para el inicio del encargo.",
  ].join("\n");
}

function buildPayload(data, summary) {
  return {
    submittedAt: new Date().toISOString(),
    source: "danielarnaizcuesta.github.io",
    summary,
    client: {
      name: valueOf(data, "nombre"),
      dniNie: valueOf(data, "dni"),
      email: valueOf(data, "email"),
      phone: valueOf(data, "telefono"),
      address: {
        street: valueOf(data, "direccion"),
        floorDoor: valueOf(data, "piso"),
        postalCode: valueOf(data, "cp"),
        city: valueOf(data, "localidad"),
        province: valueOf(data, "provincia"),
      },
    },
    matter: {
      employer: valueOf(data, "empresa"),
      service: "S-01 papeleta de conciliacion, presentacion y representacion voluntaria ante SMAC con poder valido",
      price: "90,00 EUR IVA incluido",
      payment: "transferencia o Bizum una vez prestado el servicio, salvo acuerdo escrito distinto",
    },
    acceptances: {
      conditionsAndPrivacy: Boolean(data.get("aceptaCondiciones")),
      immediateStart: Boolean(data.get("inicioInmediato")),
    },
  };
}

async function sendEncryptedSubmission(encryptedSubmission) {
  const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Nueva solicitud cifrada S-01",
      _captcha: "false",
      solicitud_cifrada: JSON.stringify(encryptedSubmission),
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar la solicitud cifrada.");
  }
}

function setLinks(summary, data) {
  const subject = `Solicitud contratacion conciliacion - ${valueOf(data, "nombre")}`;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(summary);
  const waMessage =
    "*SOLICITUD DE CONTRATACION*\n\n" +
    "Hola Daniel, aqui tienes la solicitud de contratacion que acabo de preparar desde la web:\n\n" +
    summary;

  emailLink.href = `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
}

function showResult(summary, data) {
  summaryText.value = summary;
  setLinks(summary, data);
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  copyStatus.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const summary = buildSummary(data);
  const submitButton = form.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Enviando solicitud segura...";

  try {
    const payload = buildPayload(data, summary);
    const encryptedSubmission = await encryptSubmission(payload);
    await sendEncryptedSubmission(encryptedSubmission);
    showResult(summary, data);
    copyStatus.textContent = "Solicitud cifrada enviada. Conserva copia si quieres.";
    submitButton.textContent = "Solicitud enviada";
    submitButton.style.backgroundColor = "var(--primary)";
    submitButton.style.borderColor = "var(--primary)";
  } catch (error) {
    console.error("Encrypted submission failure:", error);
    showResult(summary, data);
    copyStatus.textContent = "No se pudo enviar automaticamente. Usa correo, WhatsApp, copia o PDF.";
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
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
    format: "a4",
  });
  const marginX = 15;
  const pageHeight = 297;
  const wrapWidth = 180;
  const lines = doc.splitTextToSize(summary, wrapWidth);
  let y = 20;

  doc.setFont("helvetica", "normal");

  for (let i = 0; i < lines.length; i += 1) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    const line = lines[i].trim();

    if (
      [
        "SOLICITUD DE CONTRATACION",
        "PRESTADOR",
        "CLIENTE",
        "ASUNTO",
        "SERVICIO SOLICITADO",
        "PRECIO",
        "ACEPTACIONES",
        "FIRMA / CONFIRMACION ESCRITA",
      ].includes(line)
    ) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(47, 102, 83);
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
      doc.text(lines[i], marginX, y);
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
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  }

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

const inputNombre = form.querySelector("input[name='nombre']");
const inputDni = form.querySelector("input[name='dni']");
const inputDireccion = form.querySelector("input[name='direccion']");
const inputPiso = form.querySelector("input[name='piso']");
const inputCp = form.querySelector("input[name='cp']");
const inputLocalidad = form.querySelector("input[name='localidad']");
const inputProvincia = form.querySelector("input[name='provincia']");
const inputEmpresa = form.querySelector("input[name='empresa']");

const previewNombre = document.getElementById("preview-nombre");
const previewDni = document.getElementById("preview-dni");
const previewDomicilio = document.getElementById("preview-domicilio");
const previewEmpresa = document.getElementById("preview-empresa");

function updatePreview() {
  if (previewNombre) {
    previewNombre.textContent = inputNombre.value.trim() || "____________________";
  }

  if (previewDni) {
    previewDni.textContent = inputDni.value.trim() || "____________________";
  }

  if (previewEmpresa) {
    previewEmpresa.textContent = inputEmpresa.value.trim() || "____________________";
  }

  if (previewDomicilio) {
    const parts = [
      inputDireccion.value.trim(),
      inputPiso.value.trim() ? `Piso o puerta: ${inputPiso.value.trim()}` : "",
      inputCp.value.trim() ? `CP ${inputCp.value.trim()}` : "",
      inputLocalidad.value.trim(),
      inputProvincia.value.trim(),
    ].filter(Boolean);

    previewDomicilio.textContent = parts.join(", ") || "________________________________________";
  }
}

[
  inputNombre,
  inputDni,
  inputDireccion,
  inputPiso,
  inputCp,
  inputLocalidad,
  inputProvincia,
  inputEmpresa,
].forEach((input) => {
  if (input) {
    input.addEventListener("input", updatePreview);
  }
});
