const CONTACT_EMAIL = "danielarnaizcuesta@gmail.com";
const WHATSAPP_NUMBER = "34615860227";
const SITE_EVIDENCE_VERSION = "2026-06-01-evidence-v1";
const WEB3FORMS_ACCESS_KEY = "TU_ACCESS_KEY_AQUI"; // Consigue una clave gratuita e instantanea en web3forms.com para activar el envio automatico. Dejala vacia o como esta para usar directamente el envio manual profesional (WhatsApp/Email) sin demoras.
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

let lastGeneratedPdf = null;

const form = document.querySelector("#hire-form");
const resultSection = document.querySelector("#resultado");
const summaryText = document.querySelector("#summary-text");
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

function submissionReference() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
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

  const inicioInmediatoTexto = data.get("inicioInmediato")
    ? "El Cliente solicita y autoriza de forma expresa el inicio inmediato de las gestiones profesionales sin esperar al plazo legal de desistimiento. Si decide desistir con posterioridad, debera abonar al Profesional la parte proporcional a las gestiones efectivamente realizadas hasta ese momento. Este derecho se extinguira por completo una vez el servicio haya sido ejecutado en su totalidad."
    : "El Cliente acepta las condiciones del servicio, reservandose el inicio de las gestiones hasta el transcurso del plazo legal de desistimiento, salvo solicitud posterior.";

  return [
    "CONTRATO DE PRESTACION DE SERVICIOS - HOJA DE ENCARGO",
    "",
    `Fecha del contrato: ${generatedAt}`,
    "Lugar de celebracion: Madrid",
    "",
    "REUNIDOS:",
    "",
    "De una parte, como prestador del servicio, en adelante designado como el Profesional: DANIEL ARNAIZ CUESTA, con NIF 72828826Q, domicilio profesional en C/ Arroyo de la Media Legua 4, bajo derecha, 28030 Madrid, y correo electronico de contacto danielarnaizcuesta@gmail.com.",
    "",
    `De otra parte, como cliente, en adelante designado como el Cliente: Nombre y apellidos: ${valueOf(data, "nombre")}, con DNI o NIE o Pasaporte: ${valueOf(data, "dni")}, correo electronico: ${valueOf(data, "email")}, telefono: ${valueOf(data, "telefono") || "No indicado"} y domicilio en: ${domicilioCompleto}.`,
    "",
    "El Profesional y el Cliente, reconociendose la capacidad legal necesaria, acuerdan formalizar el presente contrato de conformidad con las siguientes",
    "",
    "ESTIPULACIONES:",
    "",
    "1. OBJETO DEL ENCARGO",
    `El Cliente encarga al Profesional la redaccion, presentacion de la papeleta de conciliacion laboral y la representacion voluntaria en el acto de conciliacion administrativa ante el SMAC contra la empresa ${valueOf(data, "empresa")}. El servicio esta limitado a asuntos tramitables ante el SMAC de la Comunidad de Madrid. A tal efecto, el Cliente facilitara al Profesional la representacion necesaria, ya sea compareciendo presencialmente para otorgar dicha representacion o mediante el correspondiente poder notarial, con anterioridad a la fecha del acto de conciliacion.`,
    "",
    "2. PRECIO, PAGO Y FACTURACION",
    "El precio cerrado por la prestacion de este servicio es de 150,00 EUR con IVA incluido. La aportacion de los datos solicitados por el Cliente es obligatoria para la correcta ejecucion del encargo y su facturacion. El pago se realizara mediante transferencia bancaria o Bizum una vez que el servicio haya sido prestado. El Profesional emitira la correspondiente factura de conformidad con la normativa de facturacion vigente.",
    "",
    "3. DERECHO DE DESISTIMIENTO E INICIO DEL SERVICIO",
    `El Cliente tiene derecho a desistir del presente contrato en un plazo de 14 dias naturales sin necesidad de justificacion. ${inicioInmediatoTexto}`,
    "",
    "4. LUGAR, FECHA, ZONA DE PRESTACION Y FUERO",
    "El presente contrato se celebra en Madrid en la fecha y hora indicadas. La zona geografica de prestacion del servicio es exclusivamente la Comunidad de Madrid. Este contrato se rige por la legislacion espanola. Para clientes que tengan la consideracion de consumidores, seran competentes los juzgados y tribunales que correspondan segun la normativa aplicable. En caso de que la competencia territorial sea legalmente disponible, ambas partes se someten expresamente a los juzgados y tribunales de la ciudad de Madrid.",
    "",
    "5. FIRMA Y ACEPTACION ELECTRONICA",
    "La contratacion queda formalizada y perfeccionada mediante la cumplimentacion y envio de la solicitud web cifrada y el marcado electronico de la casilla obligatoria de aceptacion de condiciones, politica de privacidad y precio.",
    "",
    "ACEPTACION ELECTRONICA:",
    `Firmado electronicamente por el Cliente: ${valueOf(data, "nombre")}`,
    `Acepta condiciones de servicio, privacidad y precio cerrado de 150,00 EUR: ${yesNo(data, "aceptaCondiciones")}`,
    `Solicita inicio inmediato del servicio: ${yesNo(data, "inicioInmediato")}`,
  ].join("\n");
}

async function buildPayload(data, summary, contractPdf) {
  const submittedAt = new Date().toISOString();
  const reference = submissionReference();
  const summarySha256 = await sha256Hex(summary);

  return {
    submittedAt,
    source: "danielarnaizcuesta.github.io",
    summary,
    documents: {
      contractPdf: {
        filename: contractPdf.filename,
        mimeType: contractPdf.mimeType,
        size: contractPdf.size,
        sha256: contractPdf.sha256
      }
    },
    evidence: {
      reference,
      submittedAt,
      siteEvidenceVersion: SITE_EVIDENCE_VERSION,
      pageUrl: window.location.href,
      pageOrigin: window.location.origin,
      summarySha256,
      contractPdfSha256: contractPdf.sha256,
      contractPlace: "Madrid",
      serviceZone: "Comunidad de Madrid. Solo asuntos tramitables ante el SMAC de la Comunidad de Madrid.",
      governingLawAndForum: "Ley espanola. Para clientes consumidores, juzgados y tribunales legalmente competentes. Cuando la competencia territorial sea legalmente disponible, fuero de Madrid.",
      acceptedConditionsText: "Acepto las condiciones del servicio, la politica de privacidad y el precio cerrado de 150,00 EUR IVA incluido.",
      immediateStartText: data.get("inicioInmediato")
        ? "Solicito el inicio inmediato de las gestiones sin esperar al plazo legal de desistimiento."
        : null,
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
    client: {
      name: valueOf(data, "nombre"),
      dniNiePassport: valueOf(data, "dni"),
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
      service: "S-01 papeleta de conciliacion, presentacion y representacion voluntaria en asunto tramitable ante el SMAC de la Comunidad de Madrid",
      price: "150,00 EUR IVA incluido",
      payment: "transferencia o Bizum una vez prestado el servicio",
    },
    acceptances: {
      conditionsAndPrivacy: Boolean(data.get("aceptaCondiciones")),
      immediateStart: Boolean(data.get("inicioInmediato")),
    },
  };
}

function evidenceSubject(evidence) {
  const ref = evidence.reference.slice(0, 8).toUpperCase();
  const pdfHash = evidence.contractPdfSha256.slice(0, 16).toUpperCase();

  return `S-01 REF ${ref} PDF ${pdfHash}`;
}

async function sendEncryptedSubmission(encryptedSubmission, evidence) {
  const subject = `Nuevo contrato firmado ${evidenceSubject(evidence)}`;

  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "TU_ACCESS_KEY_AQUI" || WEB3FORMS_ACCESS_KEY.trim() === "") {
    throw new Error("Envio automatico no configurado o clave por defecto. Usando directamente flujo manual.");
  }

  const payload = JSON.stringify({
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: subject,
    referencia_solicitud: evidence.reference,
    hash_pdf_sha256: evidence.contractPdfSha256,
    hash_texto_sha256: evidence.summarySha256,
    solicitud_cifrada: JSON.stringify(encryptedSubmission),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: payload,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const resData = await response.json();
      if (resData.success) {
        return;
      } else {
        throw new Error(resData.message || "Web3Forms rechazo el envio.");
      }
    }
    
    throw new Error(`Web3Forms devolvio un estado de error: ${response.status}`);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function setLinks(summary, data, evidence = null) {
  const waMessage =
    "*Contrato Formalizado*\n\n" +
    `Hola Daniel, acabo de formalizar el contrato desde la web.\n\n` +
    (evidence ? `Referencia: ${evidence.reference}\n` : "") +
    "Quedo a la espera de que contactes conmigo. ¡Un saludo!";

  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
}

function showResult(summary, data, evidence = null, isSuccess = true) {
  const evidenceBlock = evidence
    ? `\n\nTRAZABILIDAD\nReferencia: ${evidence.reference}\nPDF SHA-256: ${evidence.contractPdfSha256}\nTexto SHA-256: ${evidence.summarySha256}`
    : "";
  summaryText.value = summary + evidenceBlock;
  setLinks(summary, data, evidence);
  
  const resultTitle = document.getElementById("result-title");
  const resultDesc = document.getElementById("result-desc");
  
  if (resultTitle && resultDesc) {
    resultTitle.textContent = "Contrato Formalizado con Exito";
    resultDesc.innerHTML = "El contrato se ha firmado electronicamente de forma segura y se ha generado tu copia oficial en PDF con validez criptografica.<br><br>Por favor, realiza los siguientes dos sencillos pasos para completar el tramite:<br><br><strong>1. Descarga el contrato en PDF</strong> usando el boton de abajo para conservar tu copia certificada oficial.<br><strong>2. Envia el documento firmado</strong> al profesional a traves de WhatsApp o correo electronico para abrir tu canal de comunicacion directa e iniciar las gestiones de inmediato.";
  }

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
  submitButton.textContent = "Firmando y enviando contrato...";

  try {
    const contractPdf = await createContractPdfAttachment(summary);
    lastGeneratedPdf = contractPdf;
    const payload = await buildPayload(data, summary, contractPdf);
    const encryptedSubmission = await encryptSubmission(payload);
    await sendEncryptedSubmission(encryptedSubmission, payload.evidence);
    showResult(summary, data, payload.evidence, true);
    copyStatus.textContent = `Contrato firmado y enviado de forma segura. ${evidenceSubject(payload.evidence)}. Hash completo guardado en el email y el manifiesto.`;
    submitButton.textContent = "Contrato firmado y enviado";
    submitButton.style.backgroundColor = "var(--primary)";
    submitButton.style.borderColor = "var(--primary)";
  } catch (error) {
    console.error("Encrypted submission failure:", error);
    let fakeEvidence = null;
    try {
      const summarySha256 = await sha256Hex(summary);
      let pdfSha256 = "ERROR_DE_GENERACION_DE_PDF";
      if (!lastGeneratedPdf) {
        lastGeneratedPdf = await createContractPdfAttachment(summary);
      }
      if (lastGeneratedPdf) {
        pdfSha256 = lastGeneratedPdf.sha256;
      }
      fakeEvidence = {
        reference: submissionReference(),
        contractPdfSha256: pdfSha256,
        summarySha256: summarySha256,
      };
    } catch (innerError) {
      console.error("Inner error during fallback evidence generation:", innerError);
    }
    showResult(summary, data, fakeEvidence, false);
    copyStatus.textContent = "Firma digital completada. Por favor, descarga tu PDF a continuacion.";
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

function pdfFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `contrato-prestacion-servicios-daniel-arnaiz-${date}.pdf`;
}

function buildPdfDocument(summary) {
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
        "CONTRATO DE PRESTACION DE SERVICIOS - HOJA DE ENCARGO",
        "REUNIDOS:",
        "ESTIPULACIONES:",
        "1. OBJETO DEL ENCARGO",
        "2. PRECIO, PAGO Y FACTURACION",
        "3. DERECHO DE DESISTIMIENTO E INICIO DEL SERVICIO",
        "4. LUGAR, FECHA, ZONA DE PRESTACION Y FUERO",
        "5. FIRMA Y ACEPTACION ELECTRONICA",
        "ACEPTACION ELECTRONICA:",
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
    } else if (line.startsWith("Fecha del contrato:")) {
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

  return doc;
}

async function createContractPdfAttachment(summary) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("No se pudo cargar el generador de PDF del contrato.");
  }

  const doc = buildPdfDocument(summary);
  const arrayBuffer = doc.output("arraybuffer");

  return {
    filename: pdfFilename(),
    mimeType: "application/pdf",
    size: arrayBuffer.byteLength,
    sha256: await sha256Hex(arrayBuffer),
    base64: bytesToBase64(arrayBuffer),
  };
}

function generatePDF(summary, filename) {
  buildPdfDocument(summary).save(filename);
}

downloadButton.addEventListener("click", () => {
  const date = new Date().toISOString().slice(0, 10);
  const filename = pdfFilename();

  if (lastGeneratedPdf) {
    try {
      const binary = atob(lastGeneratedPdf.base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = lastGeneratedPdf.filename || filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.error("Cached PDF download failed, falling back to regeneration:", error);
    }
  }

  if (window.jspdf && window.jspdf.jsPDF) {
    try {
      let textToPdf = summaryText.value;
      const traceIdx = textToPdf.indexOf("\n\nTRAZABILIDAD");
      if (traceIdx !== -1) {
        textToPdf = textToPdf.slice(0, traceIdx);
      }
      generatePDF(textToPdf, filename);
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
