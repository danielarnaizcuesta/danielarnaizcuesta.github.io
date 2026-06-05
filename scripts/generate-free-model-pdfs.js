import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
globalThis.self = globalThis;
await import('../assets/jspdf.umd.min.js');
const { jsPDF } = globalThis.jspdf;

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
    note: 'Modelo documental para solicitar copia de información laboral propia y ordenar la documentación disponible.'
  },
  {
    file: 'modelo-solicitud-copia-expediente.pdf',
    title: 'Modelo gratuito - copia de expediente',
    subtitle: 'Solicitud de copia de expediente ante administración u organismo',
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
  },
  {
    file: 'modelo-solicitud-estado-expediente.pdf',
    title: 'Modelo gratuito - estado de expediente',
    subtitle: 'Solicitud de información sobre estado de tramitación',
    body: [
      'AL ORGANISMO [SEPE/INSS/FOGASA/OTRO]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], comparece y EXPONE:',
      '',
      'Que consta interesado/a en el expediente [NUMERO_EXPEDIENTE], relativo a [MATERIA_DEL_EXPEDIENTE].',
      '',
      'Que desea conocer el estado actual de tramitación del expediente, si existe documentación pendiente, si se ha dictado resolución o si se encuentra pendiente de algún trámite concreto.',
      '',
      'SOLICITA que se informe del estado actualizado del expediente indicado y, en su caso, de los documentos o actuaciones pendientes para continuar su tramitación.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo para conocer el estado del expediente antes de preparar, si procede, alegaciones, recurso o reclamación.'
  },
  {
    file: 'modelo-aportacion-documentacion-expediente.pdf',
    title: 'Modelo gratuito - aportación documental',
    subtitle: 'Aportación de documentos a un expediente ya abierto',
    body: [
      'AL ORGANISMO [SEPE/INSS/FOGASA/OTRO]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], comparece y EXPONE:',
      '',
      'Que tiene interés en el expediente [NUMERO_EXPEDIENTE], relativo a [MATERIA_DEL_EXPEDIENTE].',
      '',
      'Que mediante este escrito aporta la siguiente documentación para su incorporación al expediente:',
      '',
      '[LISTA_DE_DOCUMENTOS_APORTADOS]',
      '',
      'SOLICITA que se tenga por presentada la documentación indicada, se incorpore al expediente y se continúe la tramitación que proceda.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Para aportar documentos al expediente. Si existe plazo de recurso o resolución desfavorable, conviene revisar el siguiente paso.'
  },
  {
    file: 'modelo-solicitud-registro-horario.pdf',
    title: 'Modelo gratuito - registro horario',
    subtitle: 'Solicitud de copia del registro horario propio',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, EXPONE:',
      '',
      'Que necesita disponer de copia del registro horario correspondiente a su prestación de servicios durante el periodo [PERIODO_SOLICITADO].',
      '',
      'SOLICITA que se le facilite copia del registro diario de jornada correspondiente al periodo indicado, así como cualquier sistema equivalente de fichajes, partes de trabajo o control horario que conste respecto de su persona.',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por escrito.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo para pedir copia de datos horarios propios y reunir documentación antes de valorar horas o cantidades.'
  },
  {
    file: 'modelo-solicitud-cuadrantes-calendario-turnos.pdf',
    title: 'Modelo gratuito - cuadrantes y turnos',
    subtitle: 'Solicitud de calendario laboral, cuadrantes o turnos propios',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, EXPONE:',
      '',
      'Que necesita copia de la organización de jornada que le ha sido aplicada o comunicada durante el periodo [PERIODO_SOLICITADO].',
      '',
      'SOLICITA que se le facilite copia de los cuadrantes, calendario laboral, turnos, cambios de turno o comunicaciones equivalentes referidas a su puesto o centro de trabajo durante el periodo indicado.',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por escrito.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Sirve para ordenar prueba documental de jornada y turnos antes de decidir el siguiente paso.'
  },
  {
    file: 'modelo-solicitud-informe-funciones-comite.pdf',
    title: 'Modelo gratuito - funciones y puesto',
    subtitle: 'Solicitud de informe o constancia al comité de empresa',
    body: [
      'AL COMITÉ DE EMPRESA / REPRESENTACIÓN LEGAL DE LAS PERSONAS TRABAJADORAS DE [EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, EXPONE:',
      '',
      'Que necesita dejar constancia documental de las funciones y puesto efectivamente desempeñados en [CENTRO_DE_TRABAJO] durante el periodo [PERIODO].',
      '',
      'Que solicita la colaboración de la representación legal de las personas trabajadoras, en el ámbito de sus funciones de información, consulta y vigilancia de las condiciones de trabajo.',
      '',
      'SOLICITA que, si el comité tiene conocimiento o puede contrastarlo, emita informe o constancia sobre los siguientes extremos:',
      '',
      '- Puesto o área de trabajo efectiva: [PUESTO_O_AREA].',
      '- Funciones realizadas habitualmente: [FUNCIONES].',
      '- Jornada, turnos o centro de trabajo relacionados con esas funciones: [DETALLE].',
      '- Periodo aproximado en que se han venido realizando: [PERIODO].',
      '- Observaciones del comité o representación legal: [OBSERVACIONES].',
      '',
      'Esta solicitud se orienta a obtener informe o constancia representativa sobre funciones y puesto, desde el conocimiento del comité o representación legal.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Este modelo pide informe o constancia sobre funciones y puesto desde las competencias de representación del comité o delegados.'
  },
  {
    file: 'modelo-solicitud-copia-informes-mutua.pdf',
    title: 'Modelo gratuito - informes de mutua',
    subtitle: 'Solicitud de copia de informes, pruebas o justificantes',
    body: [
      'A LA MUTUA [NOMBRE_MUTUA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], número de afiliación [NUMERO_AFILIACION] y datos de contacto [TELEFONO_EMAIL], EXPONE:',
      '',
      'Que ha sido atendido/a por la mutua en relación con [CONTINGENCIA_O_PROCESO], con fechas aproximadas de asistencia [FECHAS].',
      '',
      'SOLICITA que se le facilite copia de la documentación que conste relativa a su asistencia o seguimiento, incluyendo informes médicos, justificantes de asistencia, resultados de pruebas, partes, citaciones y comunicaciones emitidas.',
      '',
      'La documentación puede remitirse a [EMAIL] o facilitarse por el canal que corresponda.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo para reunir copia documental de la mutua antes de valorar el siguiente paso.'
  },
  {
    file: 'modelo-comunicacion-cambio-datos-expediente.pdf',
    title: 'Modelo gratuito - cambio de datos',
    subtitle: 'Comunicación de domicilio, email, teléfono o cuenta bancaria',
    body: [
      'AL ORGANISMO [SEPE/INSS/FOGASA/OTRO]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], comparece y EXPONE:',
      '',
      'Que consta como interesado/a en el expediente, prestación o solicitud [NUMERO_EXPEDIENTE_O_REFERENCIA].',
      '',
      'Que a efectos de notificaciones, contacto o pago comunica los siguientes datos actualizados:',
      '',
      '- Domicilio: [NUEVO_DOMICILIO].',
      '- Correo electrónico: [NUEVO_EMAIL].',
      '- Teléfono: [NUEVO_TELEFONO].',
      '- Cuenta bancaria IBAN: [NUEVO_IBAN].',
      '- Otros datos: [OTROS_DATOS].',
      '',
      'SOLICITA que se tengan por comunicados los datos indicados y se actualicen en el expediente o prestación correspondiente.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo administrativo simple para actualizar datos. Si se cambia una cuenta bancaria, conviene adjuntar justificante de titularidad.'
  },
  {
    file: 'modelo-solicitud-desglose-finiquito.pdf',
    title: 'Modelo gratuito - desglose de finiquito',
    subtitle: 'Solicitud de detalle documental de liquidación o finiquito',
    body: [
      'A LA EMPRESA [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], trabajador/a o extrabajador/a de la empresa, EXPONE:',
      '',
      'Que ha recibido o tiene pendiente de recibir liquidación, finiquito o documento de cierre de la relación laboral.',
      '',
      'SOLICITA que se le facilite desglose documental de los conceptos incluidos en dicha liquidación, indicando separadamente salario pendiente, vacaciones, pagas extraordinarias, indemnización si procede, descuentos, retenciones y cualquier otro concepto aplicado.',
      '',
      'Esta solicitud se realiza a efectos de información y comprobación documental.',
      '',
      'La documentación puede remitirse a [EMAIL] o entregarse por escrito.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Pide detalle del finiquito para comprobar conceptos, descuentos y retenciones antes de valorar una reclamación de cantidad.'
  },
  {
    file: 'modelo-derecho-acceso-datos-laborales.pdf',
    title: 'Modelo gratuito - acceso a datos laborales',
    subtitle: 'Ejercicio del derecho de acceso a datos personales en contexto laboral',
    body: [
      'A LA EMPRESA O RESPONSABLE DEL TRATAMIENTO [NOMBRE_EMPRESA]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO] y correo electrónico [EMAIL], EXPONE:',
      '',
      'Que ejercita su derecho de acceso a los datos personales que puedan estar siendo tratados por la empresa o responsable en relación con su vinculación laboral, profesional o de selección.',
      '',
      'SOLICITA que se le informe sobre si se están tratando datos personales suyos y, en caso afirmativo, se le facilite acceso y copia de los datos personales, categorías de datos, fines del tratamiento, destinatarios, plazo de conservación y demás información legalmente exigible.',
      '',
      'La respuesta puede remitirse a [EMAIL] o al domicilio indicado.',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Modelo de acceso a datos personales. La AEPD publica modelos oficiales para el ejercicio de derechos de protección de datos.'
  },
  {
    file: 'modelo-impugnacion-embargo-juzgado.pdf',
    title: 'Modelo gratuito - embargo judicial',
    subtitle: 'Impugnación de embargo ilegal por inembargabilidad',
    body: [
      'AL JUZGADO DE [ORGANO JUDICIAL] N.º [NUMERO] DE [LOCALIDAD]',
      '',
      'Procedimiento de ejecución: [NUMERO_PROCEDIMIENTO]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], en calidad de [EJECUTADO/A O PERSONA AFECTADA], comparece y DICE:',
      '',
      'Que formula impugnación del embargo practicado mediante [DECRETO/DILIGENCIA/OFICIO] de fecha [FECHA_ACTO], notificado en fecha [FECHA_NOTIFICACION], por vulneración de los límites legales de inembargabilidad.',
      '',
      'PRIMERO. El embargo recae sobre [SALARIO/PENSION/CUENTA], en la que se abona habitualmente [DESCRIPCION_DE_LA_PERCEPCION].',
      '',
      'SEGUNDO. La percepción neta mensual asciende a [IMPORTE_NETO_MENSUAL] euros. Si existen otras percepciones periódicas acumulables conforme al artículo 607 de la Ley de Enjuiciamiento Civil, su importe mensual total es [OTRAS_PERCEPCIONES_O_CERO].',
      '',
      'TERCERO. La cantidad retenida o bloqueada asciende a [IMPORTE_EMBARGADO] euros, superando el tramo legalmente embargable y afectando a cuantías inembargables o embargadas en exceso.',
      '',
      'CUARTO. En su caso, constan cargas familiares o circunstancias relevantes para modular el embargo: [CARGAS_FAMILIARES_Y_CIRCUNSTANCIAS].',
      '',
      'Conforme a los artículos 562, 607, 609 y 612 de la Ley de Enjuiciamiento Civil, el embargo debe ajustarse a los límites de inembargabilidad y alzarse o reducirse cuando se haya trabado sobre cantidades legalmente protegidas.',
      '',
      'SOLICITA que se deje sin efecto o se reduzca el embargo en lo necesario para respetar la parte inembargable, que se libre de inmediato oficio a [BANCO/EMPRESA/PAGADOR] para rectificar la retención y, si ya se hubiera transferido exceso, se acuerde su devolución o regularización.',
      '',
      'OTROSI DIGO que acompaña nóminas, pensión, extractos u otros documentos justificativos: [DOCUMENTOS_APORTADOS].',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Si existe resolución expresa, la vía suele pasar por reposición; si no la hay, el artículo 562 LEC permite escrito directo al juzgado para corregir la infracción.'
  },
  {
    file: 'modelo-impugnacion-embargo-seguridad-social.pdf',
    title: 'Modelo gratuito - embargo TGSS',
    subtitle: 'Impugnación de diligencia de embargo de Seguridad Social',
    body: [
      'A LA DIRECCIÓN PROVINCIAL DE LA TESORERÍA GENERAL DE LA SEGURIDAD SOCIAL / UNIDAD DE RECAUDACIÓN EJECUTIVA DE [LOCALIDAD]',
      '',
      '[NOMBRE Y APELLIDOS], con DNI/NIE [DNI_NIE], NAF [NUMERO_AFILIACION], domicilio a efectos de notificaciones en [DOMICILIO], teléfono [TELEFONO] y correo electrónico [EMAIL], comparece y FORMULA IMPUGNACIÓN frente a la diligencia de embargo [REFERENCIA_DILIGENCIA], notificada en fecha [FECHA_NOTIFICACION].',
      '',
      'PRIMERO. La diligencia recae sobre [SALARIO/PENSION/CUENTA], en la que se abona habitualmente [DESCRIPCION_DE_LA_PERCEPCION].',
      '',
      'SEGUNDO. La percepción neta mensual asciende a [IMPORTE_NETO_MENSUAL] euros. Si existen otras percepciones periódicas acumulables, su importe mensual total es [OTRAS_PERCEPCIONES_O_CERO].',
      '',
      'TERCERO. La cantidad retenida o bloqueada asciende a [IMPORTE_EMBARGADO] euros, excediendo de la cuantía legalmente embargable o afectando a cantidades inembargables.',
      '',
      'CUARTO. En su caso, constan cargas familiares o circunstancias relevantes: [CARGAS_FAMILIARES_Y_CIRCUNSTANCIAS].',
      '',
      'El artículo 92.2 del Reglamento General de Recaudación de la Seguridad Social remite al artículo 607 de la Ley de Enjuiciamiento Civil para el embargo de salarios, sueldos, pensiones y prestaciones equivalentes. El artículo 46 del mismo reglamento contempla la impugnación administrativa de los actos de gestión recaudatoria y el propio reglamento permite el levantamiento del embargo practicado cuando se acredita su improcedencia.',
      '',
      'SOLICITA que se deje sin efecto o se reduzca el embargo en lo necesario para respetar la parte inembargable, se rectifique la orden dada a [BANCO/EMPRESA/PAGADOR] y, si ya se hubiera ingresado exceso, se acuerde su devolución o compensación.',
      '',
      'OTROSI DIGO que acompaña la siguiente documentación justificativa: [DOCUMENTOS_APORTADOS].',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'Revisa la notificación para respetar la vía y el plazo indicados. Este modelo está pensado para discutir embargos de TGSS que no respetan la inembargabilidad.'
  },
  {
    file: 'modelo-impugnacion-embargo-hacienda.pdf',
    title: 'Modelo gratuito - embargo Hacienda',
    subtitle: 'Impugnación de diligencia de embargo de AEAT',
    body: [
      'A LA AGENCIA ESTATAL DE ADMINISTRACIÓN TRIBUTARIA / DEPENDENCIA DE RECAUDACIÓN DE [LOCALIDAD]',
      '',
      '[NOMBRE Y APELLIDOS], con NIF/NIE [DNI_NIE], domicilio fiscal en [DOMICILIO] y correo electrónico [EMAIL], comparece y formula [ELEGIR UNA SOLA VIA: RECURSO DE REPOSICION O RECLAMACION ECONOMICO-ADMINISTRATIVA] frente a la diligencia de embargo [REFERENCIA_DILIGENCIA], notificada en fecha [FECHA_NOTIFICACION].',
      '',
      'PRIMERO. El embargo recae sobre [SALARIO/PENSION/CUENTA], en la que se abona habitualmente [DESCRIPCION_DE_LA_PERCEPCION].',
      '',
      'SEGUNDO. La percepción neta mensual asciende a [IMPORTE_NETO_MENSUAL] euros. Si existen otras percepciones periódicas acumulables, su importe mensual total es [OTRAS_PERCEPCIONES_O_CERO].',
      '',
      'TERCERO. La cantidad retenida o bloqueada asciende a [IMPORTE_EMBARGADO] euros, excediendo de la cuantía legalmente embargable o afectando a cantidades inembargables.',
      '',
      'CUARTO. El artículo 170.3.c) de la Ley General Tributaria admite oposición por incumplimiento de las normas reguladoras del embargo, y el artículo 171.3 obliga a respetar en cuentas con abono habitual de salarios, sueldos o pensiones las limitaciones establecidas en la Ley de Enjuiciamiento Civil.',
      '',
      'Por ello, SOLICITA que se estime la presente impugnación, se deje sin efecto o se reduzca el embargo en lo necesario para respetar la parte inembargable, se rectifique la traba comunicada a [BANCO/PAGADOR] y, si ya se hubiera detraído exceso, se acuerde su devolución o regularización.',
      '',
      'OTROSI DIGO que acompaña la siguiente documentación justificativa: [DOCUMENTOS_APORTADOS].',
      '',
      'En [LOCALIDAD], a [FECHA].',
      '',
      'Firma: [NOMBRE Y APELLIDOS]'
    ],
    note: 'No presentes a la vez reposición y reclamación económico-administrativa contra el mismo acto. Elige una sola vía y respeta el plazo de la notificación.'
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
