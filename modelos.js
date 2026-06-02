(function () {
  "use strict";

  const LABOR_TYPES = new Set(["sancion", "msct", "orden", "categoria"]);

  const MODEL_NOTES = {
    sancion: "Para sanciones, amonestaciones escritas o comunicaciones disciplinarias. Ajusta fechas y convenio si lo conoces.",
    msct: "La modificación sustancial puede estar exceptuada de conciliación previa. Si el servicio autonómico no admite papeleta, usa el texto como reclamación extrajudicial base.",
    orden: "Para dejar constancia de una orden empresarial que consideras contraria a la ley, al convenio, a prevención de riesgos o a tus derechos básicos.",
    categoria: "Para reclamar reconocimiento de categoría o grupo profesional cuando las funciones reales no coinciden con lo reconocido en contrato o nómina.",
    sepe: "Para alegaciones o reclamación previa frente al SEPE sobre prestación, subsidio, sanción, cobro indebido, denegación, suspensión o importes.",
    inss: "Para reclamaciones o escritos al INSS sobre incapacidad temporal, incapacidad permanente, alta médica, prestación denegada, revisión o expediente.",
    mutua: "Para reclamar actuaciones de una mutua: asistencia sanitaria, contingencia, alta, baja, pruebas, rehabilitación o pago vinculado a la baja."
  };

  const TITLES = {
    sancion: "IMPUGNACIÓN DE SANCIÓN O AMONESTACIÓN",
    msct: "RECLAMACIÓN POR MODIFICACIÓN SUSTANCIAL DE CONDICIONES DE TRABAJO",
    orden: "IMPUGNACIÓN DE ORDEN EMPRESARIAL PRESUNTAMENTE ILEGAL",
    categoria: "RECLAMACIÓN DE CATEGORÍA PROFESIONAL",
    sepe: "RECLAMACIÓN PREVIA / ESCRITO ANTE EL SEPE",
    inss: "RECLAMACIÓN PREVIA / ESCRITO ANTE EL INSS",
    mutua: "RECLAMACIÓN ANTE MUTUA COLABORADORA CON LA SEGURIDAD SOCIAL"
  };

  const DESTINATIONS = {
    sancion: "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN QUE CORRESPONDA",
    msct: "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN QUE CORRESPONDA",
    orden: "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN QUE CORRESPONDA",
    categoria: "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN QUE CORRESPONDA",
    sepe: "AL SERVICIO PÚBLICO DE EMPLEO ESTATAL (SEPE)",
    inss: "AL INSTITUTO NACIONAL DE LA SEGURIDAD SOCIAL (INSS)",
    mutua: "A LA MUTUA COLABORADORA CON LA SEGURIDAD SOCIAL / ÓRGANO COMPETENTE"
  };

  const ENTITY_FALLBACKS = {
    sancion: "[EMPRESA]",
    msct: "[EMPRESA]",
    orden: "[EMPRESA]",
    categoria: "[EMPRESA]",
    sepe: "[SEPE / DIRECCIÓN PROVINCIAL]",
    inss: "[INSS / DIRECCIÓN PROVINCIAL]",
    mutua: "[MUTUA]"
  };

  function clean(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function formatDate(value) {
    if (!value) return "[FECHA]";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.valueOf())) return value;
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function partyBlock(data, type) {
    const worker = clean(data.trabajador, "[NOMBRE Y APELLIDOS]");
    const dni = clean(data.dni, "[DNI/NIE]");
    const workerAddress = clean(data.domicilioTrabajador, "[DOMICILIO]");
    const contact = clean(data.contacto, "[EMAIL O TELÉFONO]");
    const entity = clean(data.empresa, ENTITY_FALLBACKS[type] || "[EMPRESA, ORGANISMO O MUTUA]");
    const cif = clean(data.cif, "[CIF/NIF SI SE CONOCE]");
    const entityAddress = clean(data.domicilioEmpresa, "[DOMICILIO O SEDE]");
    const reference = clean(data.centro, LABOR_TYPES.has(type) ? "[CENTRO DE TRABAJO]" : "[OFICINA, EXPEDIENTE O REFERENCIA]");

    if (LABOR_TYPES.has(type)) {
      return {
        worker,
        entity,
        text: `D./Dña. ${worker}, con DNI/NIE ${dni}, domicilio a efectos de notificaciones en ${workerAddress} y contacto ${contact}, comparece y formula papeleta/escrito frente a ${entity}, con CIF ${cif}, domicilio en ${entityAddress} y centro de trabajo en ${reference}.`
      };
    }

    return {
      worker,
      entity,
      text: `D./Dña. ${worker}, con DNI/NIE ${dni}, domicilio a efectos de notificaciones en ${workerAddress} y contacto ${contact}, comparece y formula escrito/reclamación frente a ${entity}, con CIF/NIF ${cif}, sede u oficina en ${entityAddress} y expediente, oficina o referencia ${reference}.`
    };
  }

  function baseHeader(data, type) {
    const parties = partyBlock(data, type);
    return [
      DESTINATIONS[type],
      "",
      TITLES[type],
      "",
      parties.text,
      "",
      "HECHOS",
      ""
    ];
  }

  function closing(data, type, defaultRequest) {
    const request = clean(data.peticion, defaultRequest);

    if (LABOR_TYPES.has(type)) {
      return [
        "",
        "SOLICITO",
        "",
        request,
        "",
        "Que se tenga por presentado este escrito, se admita y se cite a las partes al acto de conciliación o trámite que corresponda, con los efectos legales oportunos.",
        "",
        "OTROSÍ DIGO",
        "",
        "Que la persona trabajadora se reserva expresamente cuantas acciones laborales, salariales, indemnizatorias y de tutela pudieran corresponderle, sin renuncia de derechos.",
        "",
        "En [LOCALIDAD], a [FECHA DE PRESENTACIÓN].",
        "",
        "Firma: ______________________________"
      ];
    }

    return [
      "",
      "SOLICITO",
      "",
      request,
      "",
      "Que se tenga por presentado este escrito/reclamación, se incorpore al expediente y se dicte resolución expresa o respuesta motivada, con los efectos administrativos y judiciales que procedan.",
      "",
      "OTROSÍ DIGO",
      "",
      "Que la persona interesada se reserva expresamente cuantas acciones, recursos, reclamaciones previas y demandas pudieran corresponderle, sin renuncia de derechos.",
      "",
      "En [LOCALIDAD], a [FECHA DE PRESENTACIÓN].",
      "",
      "Firma: ______________________________"
    ];
  }

  function sanctionModel(data) {
    return [
      ...baseHeader(data, "sancion"),
      `Primero. La persona trabajadora presta servicios para la empresa indicada, con puesto o categoría de ${clean(data.puesto, "[PUESTO O CATEGORÍA]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, la empresa comunicó una sanción, amonestación o medida disciplinaria que la persona trabajadora impugna.`,
      "",
      "Tercero. La persona trabajadora no está conforme con la medida por los siguientes motivos:",
      clean(data.hechos, "[EXPLICA POR QUÉ LA SANCIÓN O AMONESTACIÓN NO ES CORRECTA: hechos no ciertos, falta de proporcionalidad, defectos de forma, prescripción, falta de prueba, trato desigual, represalia u otros.]"),
      "",
      "Cuarto. La medida causa perjuicio profesional y deja antecedentes disciplinarios que la persona trabajadora rechaza.",
      ...closing(data, "sancion", "Que se deje sin efecto la sanción o amonestación impugnada, se retire del expediente personal y se restituyan todos los derechos afectados, incluidos salarios, descansos o cualquier consecuencia derivada de la medida.")
    ].join("\n");
  }

  function msctModel(data) {
    return [
      ...baseHeader(data, "msct"),
      "Nota de uso: este tipo de proceso puede estar exceptuado de conciliación previa. Si el servicio administrativo no admite papeleta, este texto puede usarse como reclamación extrajudicial base.",
      "",
      `Primero. La persona trabajadora presta servicios para la empresa indicada, con puesto o categoría de ${clean(data.puesto, "[PUESTO O CATEGORÍA]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, la empresa comunicó o aplicó una modificación de condiciones de trabajo.`,
      "",
      "Tercero. La modificación afecta a jornada, horario, turnos, salario, funciones, sistema de trabajo, rendimiento, centro, teletrabajo u otra condición sustancial en los siguientes términos:",
      clean(data.hechos, "[DESCRIBE LA CONDICIÓN ANTERIOR, LA NUEVA CONDICIÓN, FECHA DE EFECTOS Y CÓMO TE PERJUDICA.]"),
      "",
      "Cuarto. La persona trabajadora no acepta la modificación por no estar justificada, no haberse tramitado correctamente o causar perjuicio laboral y personal.",
      ...closing(data, "msct", "Que se deje sin efecto la modificación aplicada, se repongan las condiciones anteriores y se abonen las diferencias salariales o perjuicios que procedan.")
    ].join("\n");
  }

  function illegalOrderModel(data) {
    return [
      ...baseHeader(data, "orden"),
      `Primero. La persona trabajadora presta servicios para la empresa indicada, con puesto o categoría de ${clean(data.puesto, "[PUESTO O CATEGORÍA]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, la empresa dio una orden o instrucción que la persona trabajadora considera contraria a la ley, al convenio, a la prevención de riesgos, a la dignidad profesional o a sus derechos laborales.`,
      "",
      "Tercero. La orden consistió en lo siguiente:",
      clean(data.hechos, "[DESCRIBE LA ORDEN, QUIÉN LA DIO, CÓMO SE COMUNICÓ, POR QUÉ LA CONSIDERAS ILEGAL O ABUSIVA Y QUÉ RIESGO O PERJUICIO PRODUCE.]"),
      "",
      "Cuarto. La persona trabajadora solicita que la empresa deje sin efecto dicha orden y se abstenga de adoptar represalias o medidas disciplinarias por oponerse a su ejecución en esos términos.",
      ...closing(data, "orden", "Que se declare la improcedencia de la orden empresarial, se deje sin efecto, se retiren las advertencias o consecuencias asociadas y se garantice que no habrá represalias por la oposición razonada de la persona trabajadora.")
    ].join("\n");
  }

  function categoryModel(data) {
    return [
      ...baseHeader(data, "categoria"),
      `Primero. La persona trabajadora presta servicios para la empresa indicada y figura reconocida como ${clean(data.puesto, "[CATEGORÍA ACTUAL]")}.`,
      "",
      `Segundo. Desde fecha aproximada ${formatDate(data.fechaClave)}, la persona trabajadora realiza funciones superiores o distintas a las reconocidas formalmente.`,
      "",
      "Tercero. Las funciones reales desempeñadas son:",
      clean(data.hechos, "[DESCRIBE FUNCIONES REALES, RESPONSABILIDADES, AUTONOMÍA, HERRAMIENTAS, PERSONAS A CARGO, TAREAS DIARIAS Y COMPARACIÓN CON LA CATEGORÍA RECLAMADA.]"),
      "",
      "Cuarto. La categoría, grupo profesional o nivel que se reclama se corresponde con las funciones efectivamente realizadas y con el convenio aplicable.",
      ...closing(data, "categoria", "Que se reconozca la categoría, grupo profesional o nivel correspondiente a las funciones efectivamente desempeñadas, con efectos desde la fecha procedente, y se abonen las diferencias salariales que correspondan.")
    ].join("\n");
  }

  function sepeModel(data) {
    return [
      ...baseHeader(data, "sepe"),
      `Primero. La persona interesada tiene o ha solicitado prestación, subsidio o trámite de desempleo relacionado con ${clean(data.puesto, "[PRESTACIÓN, SUBSIDIO O EXPEDIENTE]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, el SEPE notificó una resolución, comunicación, sanción, cobro indebido, suspensión, denegación o incidencia que se reclama, o bien se produjo falta de respuesta o error en el expediente.`,
      "",
      "Tercero. La persona interesada no está conforme por los siguientes motivos:",
      clean(data.hechos, "[DESCRIBE RESOLUCIÓN, EXPEDIENTE, MESES AFECTADOS, IMPORTES, COMUNICACIONES, DOCUMENTOS APORTADOS Y POR QUÉ LA DECISIÓN O EL ERROR DEL SEPE NO ES CORRECTO.]"),
      "",
      "Cuarto. Se aportan o se solicitarán, según proceda, resolución del SEPE, vida laboral, certificado de prestaciones, recibos, nóminas, certificado de empresa, comunicaciones y cualquier otro documento que acredite la situación.",
      ...closing(data, "sepe", "Que se revise el expediente, se deje sin efecto la resolución o actuación impugnada si procede, se reconozca el derecho reclamado, se regularicen los importes y se abonen las prestaciones o cantidades pendientes.")
    ].join("\n");
  }

  function inssModel(data) {
    return [
      ...baseHeader(data, "inss"),
      `Primero. La persona interesada tiene abierto o pretende promover expediente ante el INSS relacionado con ${clean(data.puesto, "[INCAPACIDAD, ALTA MÉDICA, PRESTACIÓN O EXPEDIENTE]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, el INSS notificó resolución, alta médica, denegación, revisión, requerimiento o incidencia que se impugna o debe corregirse.`,
      "",
      "Tercero. La persona interesada no está conforme por los siguientes motivos:",
      clean(data.hechos, "[DESCRIBE RESOLUCIÓN, DIAGNÓSTICO O SITUACIÓN MÉDICA, FECHAS DE BAJA/ALTA, INFORMES, LIMITACIONES, COTIZACIONES, PRESTACIÓN SOLICITADA Y POR QUÉ PROCEDE LA REVISIÓN.]"),
      "",
      "Cuarto. Se aportan o se solicitarán, según proceda, informes médicos, vida laboral, bases de cotización, resoluciones, partes de baja/alta y documentación económica o laboral relevante.",
      ...closing(data, "inss", "Que se revise la resolución o actuación indicada, se reconozca la prestación o situación solicitada, se deje sin efecto el alta o denegación si procede y se abonen las cantidades que correspondan.")
    ].join("\n");
  }

  function mutuaModel(data) {
    return [
      ...baseHeader(data, "mutua"),
      `Primero. La persona trabajadora se encuentra afectada por una actuación de la mutua relacionada con ${clean(data.puesto, "[BAJA MÉDICA, ACCIDENTE, ENFERMEDAD PROFESIONAL, CONTINGENCIA O PRESTACIÓN]")}.`,
      "",
      `Segundo. En fecha ${formatDate(data.fechaClave)}, la mutua comunicó, aplicó u omitió una actuación relativa a asistencia sanitaria, baja, alta, contingencia, pruebas, rehabilitación, seguimiento o pago.`,
      "",
      "Tercero. La persona trabajadora no está conforme por los siguientes motivos:",
      clean(data.hechos, "[DESCRIBE LA ACTUACIÓN DE LA MUTUA, FECHAS, PROFESIONALES O CENTROS, INFORMES, SÍNTOMAS, LIMITACIONES, PRUEBAS PENDIENTES, PAGOS Y PERJUICIO CAUSADO.]"),
      "",
      "Cuarto. La reclamación se formula para que quede constancia, se revise la actuación y, si procede, se remita la cuestión al INSS u órgano competente.",
      ...closing(data, "mutua", "Que se tramite la reclamación, se revise la actuación de la mutua, se preste la asistencia o cobertura procedente, se corrijan altas, pagos o decisiones indebidas y se remita el expediente al órgano competente si procede.")
    ].join("\n");
  }

  const BUILDERS = {
    sancion: sanctionModel,
    msct: msctModel,
    orden: illegalOrderModel,
    categoria: categoryModel,
    sepe: sepeModel,
    inss: inssModel,
    mutua: mutuaModel
  };

  function slug(value) {
    return String(value || "modelo")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  function init() {
    const form = document.getElementById("model-form");
    const typeSelect = document.getElementById("tipo-modelo");
    const note = document.getElementById("model-note");
    const output = document.getElementById("model-output");
    const copyButton = document.getElementById("copy-model");
    const downloadButton = document.getElementById("download-model");
    const status = document.getElementById("model-status");

    if (!form || !typeSelect || !output) return;

    function updateNote() {
      note.textContent = MODEL_NOTES[typeSelect.value] || "";
    }

    function generate() {
      const data = formData(form);
      const builder = BUILDERS[data.tipoModelo] || sanctionModel;
      const text = builder(data);
      output.value = text;
      status.textContent = "Modelo generado.";
      return text;
    }

    typeSelect.addEventListener("change", () => {
      updateNote();
      generate();
    });
    updateNote();
    generate();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      generate();
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        updateNote();
        generate();
        status.textContent = "Formulario limpio.";
      }, 0);
    });

    copyButton.addEventListener("click", async () => {
      const text = output.value || generate();
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Modelo copiado.";
      } catch (error) {
        output.focus();
        output.select();
        document.execCommand("copy");
        status.textContent = "Modelo copiado.";
      }
    });

    downloadButton.addEventListener("click", () => {
      const text = output.value || generate();
      const filename = `${slug(typeSelect.options[typeSelect.selectedIndex].text)}.txt`;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      status.textContent = "Modelo descargado.";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
