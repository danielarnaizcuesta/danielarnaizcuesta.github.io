window.addEventListener("error", (event) => {
  alert(`ERROR DETECTADO: ${event.message} en ${event.filename}:${event.lineno}`);
});
window.addEventListener("unhandledrejection", (event) => {
  alert(`ERROR EN PROMESA: ${event.reason}`);
});

const CONTACT_EMAIL = "danielarnaizcuesta@gmail.com";
const WHATSAPP_NUMBER = "34615860227";
const SITE_EVIDENCE_VERSION = "2026-06-01-evidence-v1";
const WEB3FORMS_ACCESS_KEY = "477dfd54-4a9e-43e8-8cb9-2a547b6e789c"; // Consigue una clave gratuita e instantanea en web3forms.com para activar el envio automatico. Dejala vacia o como esta para usar directamente el envio manual profesional (WhatsApp/Email) sin demoras.
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

const PAYPAL_CLIENT_ID = "AW943n1n0DVeXHskL98fTOQ7jVenLW57Lo5krItrxk-tiP2Ax0uAg8xUeRGhoJCTN9HtuFyExcd5hYNw";

let paypalSdkLoaded = false;
let paypalButtonsRendered = false;

function loadPayPalSDK(clientId, callback) {
  if (window.paypal) {
    paypalSdkLoaded = true;
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&locale=es_ES`;
  script.onload = () => {
    paypalSdkLoaded = true;
    callback();
  };
  script.onerror = () => {
    console.error("No se pudo cargar el SDK de PayPal.");
    alert("Error al cargar la pasarela de PayPal. Por favor, selecciona Bizum o intentalo mas tarde.");
  };
  document.head.appendChild(script);
}

let lastGeneratedPdf = null;

const REPRESENTATION_REGIONS = {
  general: {
    label: "España",
    serviceZone: "España. Tramitación ante el órgano administrativo de conciliación competente.",
    previewZone: "España. Papeleta de conciliación laboral para su tramitación ante el órgano competente.",
    organ: "el organo administrativo de conciliacion competente"
  },
  madrid: {
    label: "Comunidad de Madrid",
    serviceZone: "Comunidad de Madrid. Solo asuntos tramitables ante el SMAC de la Comunidad de Madrid.",
    previewZone: "Comunidad de Madrid. Solo asuntos tramitables ante el SMAC de la Comunidad de Madrid.",
    organ: "SMAC de la Comunidad de Madrid"
  }
};

const SERVICES = {
  papeleta: {
    title: "Redaccion de papeleta de conciliacion laboral",
    titleHtml: "Papeleta de conciliacion laboral",
    previewHeading: "SOLICITUD DE ENCARGO - REDACCION DE PAPELETA",
    previewServiceLine(employer, region = REPRESENTATION_REGIONS.madrid, wantsRepresentation = false) {
      if (region.label === "Comunidad de Madrid" && wantsRepresentation) {
        return `Papeleta de conciliacion laboral frente a la empresa ${employer}, con tramitacion adaptada al ${region.organ} y solicitud de representacion voluntaria presencial.`;
      }
      return `Papeleta de conciliacion laboral frente a la empresa ${employer}.`;
    },
    price: "120,00 EUR IVA incluido",
    priceHtml: "120,00 € IVA incluido",
    priceShort: "120",
    paypalAmount: "120.00",
    buttonText: "Contratar redaccion de papeleta por 120 €",
    priceDescription: "Pago anticipado por Bizum o PayPal/tarjeta antes de iniciar la redaccion.",
    filenameSlug: "papeleta-conciliacion",
    serviceZone: "Espana. Servicio de preparacion de papeleta de conciliacion laboral para su tramitacion ante el organo administrativo competente, con posible representacion presencial en la Comunidad de Madrid.",
    previewZone: "Espana. Papeleta de conciliacion laboral. En la Comunidad de Madrid puede incluir representacion voluntaria presencial sin cambiar el precio.",
    matterService: "Preparacion de papeleta de conciliacion laboral para su tramitacion ante el organo administrativo competente, con posible representacion voluntaria en la Comunidad de Madrid",
    objectClause(employer, region = REPRESENTATION_REGIONS.madrid, wantsRepresentation = false) {
      if (region.label === "Comunidad de Madrid" && wantsRepresentation) {
        return `El Cliente encarga al Profesional la redaccion de una papeleta de conciliacion laboral frente a la empresa ${employer}, con base en la informacion y documentacion facilitada por el Cliente, para su tramitacion ante ${region.organ}. El alcance comprende analisis documental inicial, ordenacion de hechos, cuantificacion orientativa cuando proceda, redaccion del escrito y, cuando resulte viable, presentacion y representacion voluntaria presencial en el acto de conciliacion dentro de la Comunidad de Madrid sin variacion del precio cerrado. La intervencion judicial posterior corresponde al profesional elegido o designado.`;
      }
      return `El Cliente encarga al Profesional la redaccion de una papeleta de conciliacion laboral frente a la empresa ${employer}, con base en la informacion y documentacion facilitada por el Cliente. El alcance comprende analisis documental inicial, ordenacion de hechos, cuantificacion orientativa cuando proceda y redaccion del escrito para su presentacion por el Cliente ante el organo administrativo de conciliacion competente. La intervencion judicial posterior corresponde al profesional elegido o designado.`;
    },
    previewObject(employer, region = REPRESENTATION_REGIONS.madrid, wantsRepresentation = false) {
      if (region.label === "Comunidad de Madrid" && wantsRepresentation) {
        return `El Cliente encarga al profesional la redaccion de una papeleta de conciliacion laboral frente a la empresa ${employer}. La solicitud incluye presentacion y representacion voluntaria presencial en la Comunidad de Madrid sin cambiar el precio cerrado, cuando resulte viable.`;
      }
      return `El Cliente encarga al profesional la redaccion de una papeleta de conciliacion laboral frente a la empresa ${employer}. El servicio es valido para asuntos de trabajadores en Espana y se centra en la preparacion de la papeleta para su presentacion ante el organo competente.`;
    },
  },
  inspeccion: {
    title: "Denuncia ante Inspeccion de Trabajo y Seguridad Social",
    titleHtml: "Denuncia ante Inspeccion de Trabajo",
    previewHeading: "SOLICITUD DE ENCARGO - DENUNCIA A INSPECCION DE TRABAJO",
    price: "30,00 EUR IVA incluido",
    priceHtml: "30,00 € IVA incluido",
    priceShort: "30",
    paypalAmount: "30.00",
    buttonText: "Contratar denuncia a Inspeccion por 30 €",
    priceDescription: "Pago anticipado por Bizum o PayPal/tarjeta antes de preparar la denuncia.",
    filenameSlug: "denuncia-inspeccion-trabajo",
    serviceZone: "Espana. Servicio documental de preparacion de denuncia ante la Inspeccion de Trabajo y Seguridad Social.",
    previewZone: "Espana. Preparacion documental de denuncia ante la Inspeccion de Trabajo y Seguridad Social.",
    matterService: "Preparacion documental de denuncia ante la Inspeccion de Trabajo y Seguridad Social",
    previewServiceLine(employer) {
      return `Denuncia ante Inspeccion de Trabajo y Seguridad Social frente a la empresa ${employer}.`;
    },
    objectClause(employer) {
      return `El Cliente encarga al Profesional la preparacion documental de una denuncia ante la Inspeccion de Trabajo y Seguridad Social en relacion con hechos laborales imputables a la empresa ${employer}. El alcance comprende analisis documental inicial, ordenacion de hechos, redaccion de la denuncia y orientacion sobre la documentacion necesaria para su presentacion por el Cliente. Seguimiento posterior del expediente e intervencion en actuaciones inspectoras posteriores podran requerir un encargo expreso. La actuacion posterior corresponde a la Inspeccion de Trabajo y Seguridad Social y, si el asunto pasa a via judicial, al profesional elegido o designado.`;
    },
    previewObject(employer) {
      return `El Cliente encarga al profesional la preparacion documental de una denuncia ante la Inspeccion de Trabajo y Seguridad Social frente a la empresa ${employer}. El servicio incluye ordenar hechos, documentos y redactar la denuncia para su presentacion por el Cliente. La actuacion posterior corresponde a la Inspeccion de Trabajo y Seguridad Social.`;
    },
  },
};

const form = document.querySelector("#hire-form");
const resultSection = document.querySelector("#resultado");
const whatsappLink = document.querySelector("#whatsapp-link");
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

function serviceFromKey(key) {
  return SERVICES[key] || SERVICES.papeleta;
}

function selectedServiceFromData(data) {
  return serviceFromKey(valueOf(data, "servicio") || "papeleta");
}

function selectedServiceFromForm() {
  const selected = form.querySelector("input[name='servicio']:checked");
  return serviceFromKey(selected ? selected.value : "papeleta");
}

function representationRegionFromValue(value) {
  return REPRESENTATION_REGIONS[value] || REPRESENTATION_REGIONS.general;
}

function representationRegionFromData(data) {
  return representationRegionFromValue(valueOf(data, "comunidadAutonoma") || "general");
}

function selectedRepresentationRegionFromForm() {
  const selectedCommunity = form.querySelector("select[name='comunidadAutonoma']");
  return representationRegionFromValue(selectedCommunity?.value || "general");
}

function wantsMadridRepresentationFromData(data) {
  return valueOf(data, "quiereRepresentacionMadrid") === "si";
}

function wantsMadridRepresentationFromForm() {
  const selected = form.querySelector("select[name='quiereRepresentacionMadrid']");
  return selected?.value === "si";
}

function serviceRequiresRepresentationRegion(service) {
  return Boolean(service.requiresRepresentationRegion);
}

function zoneForService(service, region = REPRESENTATION_REGIONS.madrid) {
  return serviceRequiresRepresentationRegion(service) ? region.serviceZone : service.serviceZone;
}

function previewZoneForService(service, region = REPRESENTATION_REGIONS.madrid) {
  return serviceRequiresRepresentationRegion(service) ? region.previewZone : service.previewZone;
}

function submissionReference() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sha256PureJS(asciiOrBytes) {
  let bytes = asciiOrBytes;
  if (typeof asciiOrBytes === "string") {
    const encoder = new TextEncoder();
    bytes = encoder.encode(asciiOrBytes);
  } else if (asciiOrBytes instanceof ArrayBuffer) {
    bytes = new Uint8Array(asciiOrBytes);
  } else if (ArrayBuffer.isView(asciiOrBytes)) {
    bytes = new Uint8Array(asciiOrBytes.buffer, asciiOrBytes.byteOffset, asciiOrBytes.byteLength);
  }
  
  const len = bytes.length;
  const wordCount = ((len + 8) >> 6) * 16 + 16;
  const words = new Int32Array(wordCount);
  
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  
  const bits = len * 8;
  words[bits >> 5] |= 0x80 << (24 - (bits % 32));
  words[words.length - 1] = bits;
  
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const w = new Int32Array(64);
  for (let i = 0; i < words.length; i += 16) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    
    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j];
      } else {
        const s0 = (rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3)) | 0;
        const s1 = (rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10)) | 0;
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      
      const t1 = (h + sigma1 + ch + k[j] + w[j]) | 0;
      const t2 = (sigma0 + maj) | 0;
      
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }
  
  const hex = [];
  const finalWords = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    const val = finalWords[i];
    hex.push(((val >>> 24) & 0xff).toString(16).padStart(2, "0"));
    hex.push(((val >>> 16) & 0xff).toString(16).padStart(2, "0"));
    hex.push(((val >>> 8) & 0xff).toString(16).padStart(2, "0"));
    hex.push((val & 0xff).toString(16).padStart(2, "0"));
  }
  return hex.join("");
}

async function sha256Hex(value) {
  if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
    try {
      const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.warn("Error con crypto.subtle.digest, usando fallback pure JS:", e);
    }
  }
  return sha256PureJS(value);
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

function buildSummary(data, paymentInfo = null) {
  const service = selectedServiceFromData(data);
  const representationRegion = representationRegionFromData(data);
  const wantsRepresentation = wantsMadridRepresentationFromData(data);
  const serviceZone = zoneForService(service, representationRegion);
  const representationRegionLine = wantsRepresentation
    ? [`Comunidad autonoma para la representacion solicitada: ${representationRegion.label}`, ""]
    : [];
  const generatedAt = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
  const direccion = valueOf(data, "direccion");
  const piso = valueOf(data, "piso");
  const cp = valueOf(data, "cp");
  const localidad = valueOf(data, "localidad");
  const comunidadAutonoma = valueOf(data, "comunidadAutonoma");
  const provincia = valueOf(data, "provincia");
  const domicilioCompleto = [
    direccion,
    piso ? `Piso o puerta: ${piso}` : "",
    `CP ${cp}`,
    localidad,
    comunidadAutonoma,
    provincia,
  ]
    .filter(Boolean)
    .join(", ");

  const inicioInmediatoTexto = data.get("inicioInmediato")
    ? "El Cliente solicita y autoriza de forma expresa el inicio inmediato de la preparacion del servicio sin esperar al plazo legal de desistimiento. Si decide desistir con posterioridad, debera abonar al Prestador la parte proporcional a las actuaciones efectivamente realizadas hasta ese momento. Este derecho se extinguira por completo una vez el servicio haya sido ejecutado en su totalidad en los terminos legalmente previstos."
    : "El Cliente acepta las condiciones del servicio, quedando el inicio material de la preparacion supeditado a la aceptacion expresa del encargo y al regimen legal de desistimiento aplicable.";

  let pagoTexto = "";
  if (paymentInfo && paymentInfo.method === "paypal") {
    pagoTexto = `El precio cerrado por la prestacion de este servicio es de ${service.price}, el cual ha sido abonado integramente en este acto mediante PayPal (ID de transaccion: ${paymentInfo.transactionId}). Salvo pacto expreso distinto, el precio cubre el estudio inicial del material remitido y la redaccion del documento contratado. Las actuaciones adicionales, nuevas versiones por cambio sustancial del asunto o servicios distintos requeriran presupuesto aparte. El Prestador emitira la correspondiente factura o justificante de pago de conformidad con la normativa de facturacion vigente.`;
  } else if (paymentInfo && paymentInfo.method === "bizum") {
    pagoTexto = `El precio cerrado por la prestacion de este servicio es de ${service.price}, el cual ha sido abonado en este acto mediante Bizum inmediato desde el telefono ${paymentInfo.telefono} con el concepto "${paymentInfo.concepto}". Salvo pacto expreso distinto, el precio cubre el estudio inicial del material remitido y la redaccion del documento contratado. Las actuaciones adicionales, nuevas versiones por cambio sustancial del asunto o servicios distintos requeriran presupuesto aparte. El Prestador emitira la correspondiente factura o justificante de pago de conformidad con la normativa de facturacion vigente.`;
  } else {
    pagoTexto = `El precio cerrado por la prestacion de este servicio es de ${service.price}. La aportacion de los datos solicitados por el Cliente es obligatoria para la correcta ejecucion del encargo y su facturacion. Salvo pacto expreso distinto, el precio cubre el estudio inicial del material remitido y la redaccion del documento contratado. Las actuaciones adicionales, nuevas versiones por cambio sustancial del asunto o servicios distintos requeriran presupuesto aparte. El servicio solo se iniciara una vez confirmado el pago anticipado por Bizum o PayPal/Tarjeta. El Prestador emitira la correspondiente factura o justificante de pago de conformidad con la normativa de facturacion vigente.`;
  }

  return [
    "SOLICITUD DE ENCARGO DE SERVICIO DOCUMENTAL",
    `Servicio contratado: ${service.title}`,
    ...representationRegionLine,
    "",
    `Fecha de la solicitud: ${generatedAt}`,
    "Lugar de emision: Madrid",
    "",
    "REUNIDOS:",
    "",
    "De una parte, como prestador del servicio, en adelante designado como el Prestador: DANIEL ARNAIZ CUESTA, con NIF 72828826Q, domicilio profesional en C/ Arroyo de la Media Legua 4, bajo derecha, 28030 Madrid, y correo electronico de contacto danielarnaizcuesta@gmail.com.",
    "",
    `De otra parte, como cliente, en adelante designado como el Cliente: Nombre y apellidos: ${valueOf(data, "nombre")}, con DNI o NIE o Pasaporte: ${valueOf(data, "dni")}, correo electronico: ${valueOf(data, "email")}, telefono: ${valueOf(data, "telefono") || "No indicado"} y domicilio en: ${domicilioCompleto}.`,
    "",
    "El Cliente formula la presente solicitud de encargo, que solo quedara aceptada por el Prestador cuando este la confirme expresamente tras revisar la viabilidad del asunto y la suficiencia documental, de conformidad con las siguientes",
    "",
    "ESTIPULACIONES:",
    "",
    "1. OBJETO, ALCANCE Y NATURALEZA DEL SERVICIO",
    `${service.objectClause(valueOf(data, "empresa"), representationRegion, wantsRepresentation)} El servicio se presta exclusivamente sobre base documental y constituye una obligacion de medios, no de resultado. No incluye negociacion, defensa judicial ni actuaciones distintas de las expresamente contratadas.`,
    "",
    "2. DOCUMENTACION Y DECLARACIONES DEL CLIENTE",
    "El Cliente declara que los datos y documentos facilitados son veraces, completos, legibles y actualizados, y que existe al menos un plazo razonable de tres dias habiles para el estudio del asunto y la preparacion del documento, sin prescripcion o caducidad inminente. El Cliente se compromete a remitir la documentacion necesaria dentro de plazo. Si omite datos relevantes, facilita versiones contradictorias o modifica sustancialmente el encargo, el Prestador podra rechazarlo, suspenderlo o exigir un nuevo presupuesto.",
    "",
    "3. PRECIO, PAGO Y FACTURACION",
    pagoTexto,
    "",
    "4. SOLICITUD, ACEPTACION Y POSIBLE RECHAZO",
    "La cumplimentacion y envio de la solicitud web cifrada, junto con el pago anticipado cuando proceda, constituye una solicitud de encargo del Cliente. El encargo solo quedara perfeccionado cuando el Prestador confirme expresamente su aceptacion tras revisar la documentacion, la viabilidad temporal, la claridad del objeto y la posibilidad material de prestar el servicio. Si la solicitud no se acepta, no se iniciara trabajo alguno y cualquier importe abonado por anticipado se devolvera integramente por el mismo canal o por otro acordado.",
    "",
    "5. DERECHO DE DESISTIMIENTO E INICIO ANTICIPADO",
    `Si el Prestador acepta la solicitud y el Cliente tiene la condicion legal de consumidor, este tendra derecho a desistir del contrato en el plazo legal aplicable. ${inicioInmediatoTexto}`,
    "",
    "6. COMUNICACIONES, CONFIDENCIALIDAD Y CONSERVACION",
    "Las comunicaciones del encargo podran realizarse por correo electronico, telefono o WhatsApp. La documentacion remitida sera tratada con confidencialidad y exclusivamente para gestionar la solicitud y, en su caso, el servicio aceptado, conforme a la politica de privacidad. El PDF descargable generado al finalizar la formalizacion constituye la copia en soporte duradero de la solicitud remitida. El Cliente es responsable de conservar copia de la documentacion remitida y de dicho PDF.",
    "",
    "7. LUGAR, FECHA, ZONA DE PRESTACION Y FUERO",
    `La solicitud se emite en Madrid en la fecha y hora indicadas. La zona geografica de prestacion del servicio es: ${serviceZone} Si el encargo es aceptado, se regira por la legislacion espanola. Para clientes que tengan la consideracion de consumidores, seran competentes los juzgados y tribunales que correspondan segun la normativa aplicable. En caso de que la competencia territorial sea legalmente disponible, ambas partes se someten expresamente a los juzgados y tribunales de la ciudad de Madrid.`,
    "",
    "DECLARACIONES ELECTRONICAS DEL CLIENTE:",
    `Firmado electronicamente por el Cliente: ${valueOf(data, "nombre")}`,
    `Servicio contratado: ${service.title}`,
    `Confirma haber leido la informacion precontractual: ${yesNo(data, "leeInfoPrecontractual")}`,
    `Acepta condiciones de servicio, privacidad y precio cerrado de ${service.price}: ${yesNo(data, "aceptaCondiciones")}`,
    service.title === SERVICES.papeleta.title && representationRegion.label === "Comunidad de Madrid"
      ? `Solicita representacion presencial en conciliacion en Madrid: ${wantsRepresentation ? "SI" : "NO"}`
      : null,
    `Solicita inicio inmediato de la preparacion del servicio: ${yesNo(data, "inicioInmediato")}`,
    paymentInfo ? `Metodo de Pago: Pagado mediante ${paymentInfo.method.toUpperCase()} (${paymentInfo.method === "paypal" ? "ID de Transaccion: " + paymentInfo.transactionId : "Telefono emisor: " + paymentInfo.telefono + ", Concepto: " + paymentInfo.concepto})` : "Metodo de Pago: Pago anticipado pendiente de confirmacion"
  ].filter(Boolean).join("\n");
}

async function buildPayload(data, summary, contractPdf) {
  const service = selectedServiceFromData(data);
  const representationRegion = representationRegionFromData(data);
  const wantsRepresentation = wantsMadridRepresentationFromData(data);
  const serviceZone = zoneForService(service, representationRegion);
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
      serviceTitle: service.title,
      contractPlace: "Madrid",
      serviceZone,
      representationRegion: wantsRepresentation ? representationRegion.label : null,
      governingLawAndForum: "Ley espanola. Para clientes consumidores, juzgados y tribunales legalmente competentes. Cuando la competencia territorial sea legalmente disponible, fuero de Madrid.",
      precontractualReadText: "Confirmo que he leido la informacion precontractual.",
      acceptedConditionsText: `Acepto las condiciones del servicio, la politica de privacidad, el precio cerrado de ${service.price}, la posible revision documental previa y el pago anticipado necesario para tramitar el servicio.`,
      reasonableTimeDeclarationText: "La solicitud incorpora la declaracion de que existe al menos un plazo razonable de tres dias habiles para el estudio del caso, sin prescripcion o caducidad inminente.",
      madridRepresentationText: wantsRepresentation ? "La solicitud incluye representacion voluntaria presencial en conciliacion para asunto tramitable en la Comunidad de Madrid." : null,
      immediateStartText: data.get("inicioInmediato")
        ? "Solicito el inicio inmediato de la preparacion del servicio sin esperar al plazo legal de desistimiento."
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
        region: valueOf(data, "comunidadAutonoma"),
        province: valueOf(data, "provincia"),
      },
    },
    matter: {
      employer: valueOf(data, "empresa"),
      service: service.matterService,
      representationRegion: wantsRepresentation ? representationRegion.label : null,
      price: service.price,
      payment: "pago anticipado pendiente de confirmacion por Bizum o PayPal/Tarjeta",
    },
    acceptances: {
      precontractualRead: Boolean(data.get("leeInfoPrecontractual")),
      conditionsAndPrivacy: Boolean(data.get("aceptaCondiciones")),
      madridRepresentationRequested: wantsRepresentation,
      immediateStart: Boolean(data.get("inicioInmediato")),
    },
  };
}

function evidenceSubject(evidence) {
  const ref = evidence.reference.slice(0, 8).toUpperCase();
  const pdfHash = evidence.contractPdfSha256.slice(0, 16).toUpperCase();

  return `REF ${ref} PDF ${pdfHash}`;
}

async function sendEncryptedSubmission(encryptedSubmission, evidence) {
  const subject = `Nueva solicitud firmada ${evidenceSubject(evidence)}`;

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
  const service = selectedServiceFromData(data);
  const waMessage =
    "*Solicitud de contratacion enviada*\n\n" +
    `Hola Daniel, acabo de formalizar el contrato desde la web.\n\n` +
    `Servicio: ${service.title}\n` +
    (evidence ? `Referencia: ${evidence.reference}\n` : "") +
    "Quedo a la espera de que contactes conmigo. ¡Un saludo!";

  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}`;
}

function showResult(summary, data, evidence = null) {
  setLinks(summary, data, evidence);
  
  const resultTitle = document.getElementById("result-title");
  const resultDesc = document.getElementById("result-desc");
  
  if (resultTitle && resultDesc) {
    resultTitle.textContent = "Solicitud enviada con Exito";
    resultDesc.innerHTML = "La solicitud se ha firmado electronicamente de forma segura y el pago anticipado ha quedado registrado o preparado segun el metodo elegido.<br><br>Por favor, <strong>descarga tu copia en PDF</strong> para conservarla. El encargo solo quedara aceptado cuando Daniel confirme expresamente su aceptacion.";
  }

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function processContractSubmission(paymentInfo = null) {
  copyStatus.textContent = "";

  const data = new FormData(form);
  const service = selectedServiceFromData(data);
  const summary = buildSummary(data, paymentInfo);
  const submitButton = form.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Firmando y enviando solicitud...";

  // Si se paga por PayPal o Bizum, mostramos estados e indicadores de carga
  const paypalContainer = document.getElementById("paypal-button-container");
  const bizumPanel = document.getElementById("bizum-payment-panel");
  if (paymentInfo) {
    if (paypalContainer) {
      paypalContainer.style.pointerEvents = "none";
      paypalContainer.style.opacity = "0.5";
    }
    if (bizumPanel) {
      bizumPanel.style.pointerEvents = "none";
      bizumPanel.style.opacity = "0.7";
    }
    if (paymentInfo.method === "paypal") {
      copyStatus.innerHTML = `<span style='color: var(--primary); font-weight: bold;'>⏳ Pago de ${service.price} autorizado (Transaccion: ${paymentInfo.transactionId}). Firmando y registrando solicitud...</span>`;
    } else if (paymentInfo.method === "bizum") {
      copyStatus.innerHTML = `<span style='color: var(--primary); font-weight: bold;'>⏳ Bizum registrado (Movil: ${paymentInfo.telefono}). Firmando y registrando solicitud...</span>`;
    }
  }

  try {
    const contractPdf = await createContractPdfAttachment(summary, service);
    lastGeneratedPdf = contractPdf;
    const payload = await buildPayload(data, summary, contractPdf);
    
    // Inyectar información de pago en el payload si existe
    if (paymentInfo) {
      if (paymentInfo.method === "paypal") {
        payload.matter.payment = `abonado mediante PayPal en fecha de formalización. ID de transacción: ${paymentInfo.transactionId}`;
      } else if (paymentInfo.method === "bizum") {
        payload.matter.payment = `abonado mediante Bizum en fecha de formalización. Teléfono emisor: ${paymentInfo.telefono}, Concepto: ${paymentInfo.concepto}`;
      }
      payload.evidence.paymentInfo = paymentInfo;
    }

    const encryptedSubmission = await encryptSubmission(payload);
    await sendEncryptedSubmission(encryptedSubmission, payload.evidence);
    showResult(summary, data, payload.evidence);
    downloadCachedPdf();
    
    let successMsg = `Solicitud firmada y enviada de forma segura. ${evidenceSubject(payload.evidence)}. Hash completo guardado en el email y el manifiesto.`;
    if (paymentInfo) {
      if (paymentInfo.method === "paypal") {
        successMsg += ` Pago anticipado por PayPal registrado.`;
      } else if (paymentInfo.method === "bizum") {
        successMsg += ` Pago anticipado por Bizum registrado para verificacion de Daniel.`;
      }
    }
    copyStatus.textContent = successMsg;
    
    submitButton.textContent = "Solicitud firmada y enviada";
    submitButton.style.backgroundColor = "var(--primary)";
    submitButton.style.borderColor = "var(--primary)";
  } catch (error) {
    console.error("Encrypted submission failure:", error);
    
    const errMsg = error ? (error.message || String(error)) : "Error desconocido";
    const errStack = (error && error.stack) ? error.stack : "";
    
    alert("FALLO DURANTE LA TRANSMISION:\n" + errMsg + "\n\nStack: " + errStack);
    
    let fakeEvidence = null;
    try {
      const summarySha256 = await sha256Hex(summary);
      let pdfSha256 = "ERROR_DE_GENERACION_DE_PDF";
      if (!lastGeneratedPdf) {
        lastGeneratedPdf = await createContractPdfAttachment(summary, service);
      }
      if (lastGeneratedPdf) {
        pdfSha256 = lastGeneratedPdf.sha256;
      }
      fakeEvidence = {
        reference: submissionReference(),
        contractPdfSha256: pdfSha256,
        summarySha256: summarySha256,
      };
      if (paymentInfo) {
        fakeEvidence.paymentInfo = paymentInfo;
      }
    } catch (innerError) {
      console.error("Inner error during fallback evidence generation:", innerError);
    }
    
    showResult(summary, data, fakeEvidence);
    copyStatus.textContent = "Firma digital completada. Por favor, descarga tu PDF a continuación.";
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  } finally {
    if (paypalContainer) {
      paypalContainer.style.pointerEvents = "auto";
      paypalContainer.style.opacity = "1";
    }
    if (bizumPanel) {
      bizumPanel.style.pointerEvents = "auto";
      bizumPanel.style.opacity = "1";
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  copyStatus.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    
    const fieldNames = {
      servicio: "Servicio contratado",
      nombre: "Nombre y apellidos",
      dni: "DNI/NIE/Pasaporte",
      email: "Correo electronico",
      direccion: "Direccion",
      piso: "Piso o puerta",
      cp: "Codigo Postal",
      localidad: "Localidad o Ciudad",
      comunidadAutonoma: "Comunidad autonoma",
      provincia: "Provincia",
      empresa: "Empresa a reclamar",
      leeInfoPrecontractual: "Leer informacion precontractual",
      aceptaCondiciones: "Aceptar condiciones del servicio y privacidad"
    };

    const invalidFields = [];
    const elements = form.elements;
    for (let i = 0; i < elements.length; i += 1) {
      const el = elements[i];
      if (el.hasAttribute("required") && !el.checkValidity()) {
        const friendlyName = fieldNames[el.name] || el.placeholder || el.name;
        invalidFields.push(friendlyName);
      }
    }

    if (invalidFields.length > 0) {
      copyStatus.innerHTML = `<span style='color: #d9534f; font-weight: bold;'>Falta completar: ${invalidFields.join(", ")}.</span>`;
    }
    return;
  }

  const selectedInput = paymentInputs.find((input) => input.checked);
  const selectedMethod = selectedInput ? selectedInput.value : "bizum";

  if (selectedMethod === "bizum") {
    const bizumTel = form.querySelector("input[name='bizumTelefono']");
    const bizumCon = form.querySelector("input[name='bizumConcepto']");
    if (!bizumTel.value.trim() || !bizumCon.value.trim()) {
      copyStatus.innerHTML = `<span style='color: #d9534f; font-weight: bold;'>Falta completar: movil y concepto del Bizum para verificar el ingreso.</span>`;
      if (!bizumTel.value.trim()) {
        bizumTel.focus();
      } else {
        bizumCon.focus();
      }
      return;
    }

    await processContractSubmission({
      method: "bizum",
      telefono: bizumTel.value.trim(),
      concepto: bizumCon.value.trim()
    });
    return;
  }

  if (selectedMethod === "paypal") {
    copyStatus.innerHTML = `<span style='color: var(--primary); font-weight: bold;'>Completa el pago anticipado con el boton de PayPal o tarjeta para iniciar el servicio.</span>`;
    const paypalContainer = document.getElementById("paypal-button-container");
    if (paypalContainer) {
      paypalContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  copyStatus.innerHTML = `<span style='color: #d9534f; font-weight: bold;'>Completa el pago anticipado antes de iniciar el servicio.</span>`;
});

// Obtener elementos de los tabs de pago
const paymentTabs = Array.from(document.querySelectorAll("[data-payment-tab]"));
const paymentInputs = Array.from(form.querySelectorAll("input[name='metodoPago']"));
const standardSubmitActions = document.getElementById("standard-submit-actions");
const paypalSubmitActions = document.getElementById("paypal-submit-actions");
const bizumSubmitActions = document.getElementById("bizum-submit-actions");
const bizumPaymentPanel = document.getElementById("bizum-payment-panel");
const paymentMethodNote = document.getElementById("payment-method-note");

function updatePaymentMethod() {
  const selectedInput = paymentInputs.find((input) => input.checked);
  const selectedMethod = selectedInput ? selectedInput.value : "bizum";

  paymentTabs.forEach((tab) => {
    const active = tab.dataset.paymentTab === selectedMethod;
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  if (selectedMethod === "paypal") {
    if (standardSubmitActions) standardSubmitActions.style.display = "none";
    if (bizumSubmitActions) bizumSubmitActions.style.display = "none";
    if (paypalSubmitActions) paypalSubmitActions.style.display = "flex";
    if (bizumPaymentPanel) bizumPaymentPanel.style.display = "none";
    if (paymentMethodNote) {
      paymentMethodNote.textContent = "El pago anticipado se abona ahora de forma segura mediante PayPal o tarjeta.";
    }

    loadPayPalSDK(PAYPAL_CLIENT_ID, () => {
      initPayPalButtons();
    });
  } else {
    if (standardSubmitActions) standardSubmitActions.style.display = "none";
    if (paypalSubmitActions) paypalSubmitActions.style.display = "none";
    if (bizumSubmitActions) bizumSubmitActions.style.display = "flex";
    if (bizumPaymentPanel) bizumPaymentPanel.style.display = "flex";
    if (paymentMethodNote) {
      paymentMethodNote.textContent = "El pago anticipado se abona ahora por Bizum. El servicio se inicia cuando Daniel confirme el ingreso.";
    }
  }
}

function initPayPalButtons() {
  if (paypalButtonsRendered) return;
  if (!window.paypal) return;

  paypalButtonsRendered = true;
  window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color:  'gold',
      shape:  'rect',
      label:  'paypal'
    },
    onClick: function(data, actions) {
      copyStatus.textContent = "";
      if (!form.checkValidity()) {
        form.reportValidity();

        const fieldNames = {
          nombre: "Nombre y apellidos",
          dni: "DNI/NIE/Pasaporte",
          email: "Correo electrónico",
          direccion: "Dirección",
          piso: "Piso o puerta",
          cp: "Código Postal",
          localidad: "Localidad o Ciudad",
          comunidadAutonoma: "Comunidad autónoma",
          provincia: "Provincia",
          empresa: "Empresa a reclamar",
          leeInfoPrecontractual: "Leer informaciÃ³n precontractual",
          aceptaCondiciones: "Aceptar condiciones del servicio y privacidad"
        };

        const invalidFields = [];
        const elements = form.elements;
        for (let i = 0; i < elements.length; i += 1) {
          const el = elements[i];
          if (el.hasAttribute("required") && !el.checkValidity()) {
            const friendlyName = fieldNames[el.name] || el.placeholder || el.name;
            invalidFields.push(friendlyName);
          }
        }

        if (invalidFields.length > 0) {
          copyStatus.innerHTML = `<span style='color: #d9534f; font-weight: bold;'>⚠️ Falta completar: ${invalidFields.join(", ")}.</span>`;
        }
        return actions.reject();
      } else {
        return actions.resolve();
      }
    },
    createOrder: function(data, actions) {
      const service = selectedServiceFromForm();
      const amountValue = service.paypalAmount;
      return actions.order.create({
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: amountValue
          },
          description: `Servicio Documental Laboral - ${service.title}`
        }]
      });
    },
    onApprove: async function(data, actions) {
      const details = await actions.order.capture();
      const transactionId = details.id;
      
      // Proceder con el envío
      await processContractSubmission({
        method: "paypal",
        transactionId: transactionId
      });
    },
    onError: function(err) {
      console.error("PayPal Smart Buttons Error:", err);
      alert("Se produjo un error al procesar el pago. Por favor, vuelve a intentarlo o usa Bizum.");
    }
  }).render('#paypal-button-container');
}



function pdfFilename(service = SERVICES.papeleta) {
  const date = new Date().toISOString().slice(0, 10);
  return `contrato-${service.filenameSlug}-daniel-arnaiz-${date}.pdf`;
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

async function createContractPdfAttachment(summary, service = SERVICES.papeleta) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("No se pudo cargar el generador de PDF del contrato.");
  }

  const doc = buildPdfDocument(summary);
  const arrayBuffer = doc.output("arraybuffer");

  return {
    filename: pdfFilename(service),
    mimeType: "application/pdf",
    size: arrayBuffer.byteLength,
    sha256: await sha256Hex(arrayBuffer),
    base64: bytesToBase64(arrayBuffer),
  };
}

function generatePDF(summary, filename) {
  buildPdfDocument(summary).save(filename);
}

function downloadCachedPdf() {
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
      anchor.download = lastGeneratedPdf.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Cached PDF download failed:", error);
    }
  }
}

downloadButton.addEventListener("click", downloadCachedPdf);

const inputNombre = form.querySelector("input[name='nombre']");
const inputDni = form.querySelector("input[name='dni']");
const inputDireccion = form.querySelector("input[name='direccion']");
const inputPiso = form.querySelector("input[name='piso']");
const inputCp = form.querySelector("input[name='cp']");
const inputLocalidad = form.querySelector("input[name='localidad']");
const inputComunidadAutonoma = form.querySelector("select[name='comunidadAutonoma']");
const inputProvincia = form.querySelector("input[name='provincia']");
const inputEmpresa = form.querySelector("input[name='empresa']");
const inputQuiereRepresentacionMadrid = form.querySelector("select[name='quiereRepresentacionMadrid']");
const representationChoiceField = document.getElementById("representation-choice-field");
const serviceInputs = Array.from(form.querySelectorAll("input[name='servicio']"));

const previewNombre = document.getElementById("preview-nombre");
const previewDni = document.getElementById("preview-dni");
const previewDomicilio = document.getElementById("preview-domicilio");
const previewEmpresa = document.getElementById("preview-empresa");
const previewServiceTitle = document.getElementById("preview-service-title");
const previewServiceLine = document.getElementById("preview-service-line");
const previewContractHeading = document.getElementById("preview-contract-heading");
const previewObject = document.getElementById("preview-object");
const previewPrice = document.getElementById("preview-price");
const previewPriceContract = document.getElementById("preview-price-contract");
const previewPriceConditions = document.getElementById("preview-price-conditions");
const previewZone = document.getElementById("preview-zone");
const priceBoxTitle = document.getElementById("price-box-title");
const priceBoxDescription = document.getElementById("price-box-description");
const serviceTabs = Array.from(document.querySelectorAll("[data-service-tab]"));
const servicePanels = Array.from(document.querySelectorAll("[data-service-panel]"));
const submitButtonPreview = form.querySelector("button[type='submit']");

function selectedServiceKeyFromForm() {
  return serviceInputs.find((input) => input.checked)?.value || "papeleta";
}

function updateMadridRepresentationField() {
  const serviceKey = selectedServiceKeyFromForm();
  const isMadrid = inputComunidadAutonoma?.value === "madrid";
  const shouldEnable = serviceKey === "papeleta" && isMadrid;

  if (representationChoiceField) {
    representationChoiceField.style.opacity = shouldEnable ? "1" : "0.55";
  }

  if (inputQuiereRepresentacionMadrid) {
    inputQuiereRepresentacionMadrid.disabled = !shouldEnable;
  }

  if (inputQuiereRepresentacionMadrid && !shouldEnable) {
    inputQuiereRepresentacionMadrid.value = "no";
  }
}

function updatePreview() {
  const service = selectedServiceFromForm();
  const representationRegion = selectedRepresentationRegionFromForm();
  const wantsRepresentation = wantsMadridRepresentationFromForm();
  const employer = inputEmpresa.value.trim() || "____________________";
  const serviceKey = selectedServiceKeyFromForm();

  updateMadridRepresentationField();

  serviceTabs.forEach((tab) => {
    const active = tab.dataset.serviceTab === serviceKey;
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  servicePanels.forEach((panel) => {
    panel.hidden = panel.dataset.servicePanel !== serviceKey;
  });

  if (previewServiceTitle) {
    previewServiceTitle.textContent = service.titleHtml;
  }

  if (previewServiceLine && typeof service.previewServiceLine === "function") {
    previewServiceLine.textContent = service.previewServiceLine(employer, representationRegion, wantsRepresentation);
  }

  if (previewContractHeading) {
    previewContractHeading.textContent = service.previewHeading;
  }

  if (previewObject) {
    previewObject.textContent = service.previewObject(employer, representationRegion, wantsRepresentation);
  }

  if (previewPrice) {
    previewPrice.textContent = service.priceHtml;
  }

  if (previewPriceContract) {
    previewPriceContract.textContent = service.priceHtml;
  }

  if (previewPriceConditions) {
    previewPriceConditions.textContent = service.priceHtml;
  }

  if (previewZone) {
    previewZone.textContent = previewZoneForService(service, representationRegion);
  }

  if (priceBoxTitle) {
    priceBoxTitle.textContent = `Precio cerrado: ${service.priceHtml}`;
  }

  if (priceBoxDescription) {
    priceBoxDescription.textContent = service.priceDescription;
  }

  if (submitButtonPreview) {
    submitButtonPreview.textContent = service.buttonText;
  }

  const bizumAmountText = document.getElementById("bizum-amount-text");
  const bizumSubmitButton = document.getElementById("bizum-submit-button");
  if (bizumAmountText) {
    bizumAmountText.textContent = service.priceHtml;
  }
  if (bizumSubmitButton) {
    bizumSubmitButton.textContent = `Confirmar Bizum y formalizar por ${service.priceShort} €`;
  }

  if (previewNombre) {
    previewNombre.textContent = inputNombre.value.trim() || "____________________";
  }

  if (previewDni) {
    previewDni.textContent = inputDni.value.trim() || "____________________";
  }

  if (previewEmpresa) {
    previewEmpresa.textContent = employer;
  }

  if (previewDomicilio) {
    const parts = [
      inputDireccion.value.trim(),
      inputPiso.value.trim() ? `Piso o puerta: ${inputPiso.value.trim()}` : "",
      inputCp.value.trim() ? `CP ${inputCp.value.trim()}` : "",
      inputLocalidad.value.trim(),
      inputComunidadAutonoma?.selectedOptions?.[0]?.textContent && inputComunidadAutonoma.value
        ? inputComunidadAutonoma.selectedOptions[0].textContent
        : "",
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
  inputComunidadAutonoma,
  inputProvincia,
  inputEmpresa,
  inputQuiereRepresentacionMadrid,
].forEach((input) => {
  if (input) {
    input.addEventListener("input", updatePreview);
  }
});

serviceInputs.forEach((input) => {
  input.addEventListener("change", updatePreview);
});

paymentInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updatePaymentMethod();
    updatePreview();
  });
});

updatePreview();
updatePaymentMethod();
