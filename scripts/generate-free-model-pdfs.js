const fs = require('fs');
const path = require('path');
const { jsPDF } = require('../assets/jspdf.umd.min.js');

const outputDir = path.join(__dirname, '..', 'assets', 'modelos');

const models = [
  {
    file: 'modelo-fogasa-reclamacion-subsanacion.pdf',
    title: 'Modelo gratuito - FOGASA',
    subtitle: 'Reclamación, aportación o subsanación documental',
    body: [
      'AL FONDO DE GARANTÍA SALARIAL',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], comparece y EXPONE:',
      '',
      'PRIMERO. Que tiene interés en el expediente o solicitud relacionada con [EMPRESA], CIF/NIF [CIF_EMPRESA], por salarios e indemnizaciones derivados de la relación laboral mantenida entre las partes.',
      '',
      'SEGUNDO. Que el expediente de referencia es [NUMERO_EXPEDIENTE], si ya consta asignado, y que el trámite se encuentra en la siguiente situación: [SITUACION_DEL_EXPEDIENTE].',
      '',
      'TERCERO. Que mediante este escrito aporta, aclara o solicita la incorporación de la siguiente documentación: [DOCUMENTOS_QUE_SE_APORTAN_O_SE_SOLICITAN].',
      '',
      'Por todo ello, SOLICITA que se tenga por presentado este escrito, se incorpore al expediente indicado y se tramite conforme proceda, practicando las notificaciones en los datos facilitados.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Pensado para trámites documentales ante FOGASA. Si hay despido, cantidades discutidas o resolución contradictoria, conviene revisar el caso antes.'
  },
  {
    file: 'modelo-solicitud-certificado-empresa.pdf',
    title: 'Modelo gratuito - certificado de empresa',
    subtitle: 'Solicitud de certificado de empresa y documentación para prestaciones',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], que ha prestado servicios en la empresa con fecha de inicio [FECHA_INICIO] y fecha de fin o situación actual [FECHA_FIN_O_SITUACION], EXPONE:',
      '',
      'Que necesita disponer del certificado de empresa y de la documentación laboral necesaria para tramitar o comprobar prestaciones, cotizaciones y situación laboral.',
      '',
      'Por ello, SOLICITA:',
      '',
      '1. Que se comunique el certificado de empresa al SEPE, si todavía no se ha realizado.',
      '2. Que se facilite copia del certificado o justificante de comunicación, si existe.',
      '3. Que se entregue o remita la documentación laboral pendiente: [DOCUMENTACION_SOLICITADA].',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por el medio habitual de comunicación entre las partes.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Útil para pedir documentación necesaria para desempleo, subsidios o comprobaciones básicas.'
  },
  {
    file: 'modelo-solicitud-documentacion-laboral.pdf',
    title: 'Modelo gratuito - documentación laboral',
    subtitle: 'Solicitud de contrato, nóminas, finiquito, cuadrantes o registro horario',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, con domicilio de notificaciones en [DOMICILIO] y correo electrónico [EMAIL], EXPONE:',
      '',
      'Que necesita disponer de copia de documentación laboral propia para comprobar su situación, ordenar sus datos y conservar justificantes.',
      '',
      'SOLICITA que se le facilite copia de la siguiente documentación:',
      '',
      '- Contrato de trabajo y anexos: [SI/NO/DETALLE].',
      '- Nóminas pendientes o histórico de nóminas: [PERIODO].',
      '- Finiquito, liquidación o justificante de pago: [SI/NO/DETALLE].',
      '- Cuadrantes, calendario, registro horario o partes de trabajo: [PERIODO].',
      '- Otros documentos: [OTROS_DOCUMENTOS].',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por escrito.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo documental. No reclama cantidades ni impugna decisiones; solo pide copia de información laboral propia.'
  },
  {
    file: 'modelo-solicitud-copia-expediente.pdf',
    title: 'Modelo gratuito - copia de expediente',
    subtitle: 'Solicitud de copia de expediente ante administracion u organismo',
    body: [
      'AL ORGANISMO [SEPE/INSS/FOGASA/OTRO]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], comparece y EXPONE:',
      '',
      'Que es persona interesada en el expediente [NUMERO_EXPEDIENTE], relativo a [MATERIA_DEL_EXPEDIENTE].',
      '',
      'Que necesita acceder a la información del expediente para conocer su estado, comprobar la documentación incorporada y conservar copia de las actuaciones.',
      '',
      'SOLICITA que se le facilite copia, acceso o relación de documentos del expediente indicado, incluyendo resoluciones, comunicaciones, informes, requerimientos y documentos aportados, por el medio legalmente disponible.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Adecuado para pedir información del expediente antes de decidir si procede reclamar o completar documentos.'
  },
  {
    file: 'modelo-solicitud-certificado-retenciones.pdf',
    title: 'Modelo gratuito - certificado de retenciones',
    subtitle: 'Solicitud de certificado de retenciones e ingresos a cuenta',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, EXPONE:',
      '',
      'Que necesita disponer del certificado de retenciones e ingresos a cuenta correspondiente al ejercicio [ANIO] para comprobar sus datos fiscales y cumplir sus obligaciones tributarias.',
      '',
      'SOLICITA que se le facilite el certificado de retenciones e ingresos a cuenta del IRPF correspondiente al ejercicio indicado, así como cualquier documento fiscal equivalente que conste emitido por la empresa.',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por escrito.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Documento simple para pedir información fiscal propia al pagador.'
  }
];

function addWrapped(doc, text, x, y, options = {}) {
  const maxWidth = options.maxWidth || 170;
  const lineHeight = options.lineHeight || 6;
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (y > 276) {
      doc.addPage();
      y = 22;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function generate(model) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setProperties({
    title: model.title,
    subject: model.subtitle,
    author: 'Daniel Arnaiz Cuesta'
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(model.title, 20, 22);
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(model.subtitle, 20, 30);

  doc.setDrawColor(47, 102, 83);
  doc.line(20, 36, 190, 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(28, 35, 31);
  doc.setFontSize(10.5);

  let y = 48;
  model.body.forEach((paragraph) => {
    if (!paragraph) {
      y += 4;
      return;
    }
    y = addWrapped(doc, paragraph, 20, y);
    y += 2;
  });

  if (y > 244) {
    doc.addPage();
    y = 22;
  } else {
    y += 8;
  }

  doc.setFillColor(247, 250, 248);
  doc.setDrawColor(216, 225, 219);
  doc.roundedRect(20, y, 170, 28, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Nota de uso', 26, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 75);
  addWrapped(doc, model.note, 26, y + 15, { maxWidth: 158, lineHeight: 5 });

  doc.setFontSize(8);
  doc.setTextColor(110, 120, 115);
  doc.text('Modelo gratuito - Daniel Arnaiz Cuesta - danielarnaizcuesta.github.io', 20, 288);

  const out = path.join(outputDir, model.file);
  fs.writeFileSync(out, Buffer.from(doc.output('arraybuffer')));
}

fs.mkdirSync(outputDir, { recursive: true });
models.forEach(generate);
console.log(`Generated ${models.length} free model PDFs in ${outputDir}`);
