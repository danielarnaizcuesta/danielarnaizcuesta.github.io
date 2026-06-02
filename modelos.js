(function () {
  "use strict";

  const MODEL_NOTES = {
    sancion: "Para sanciones, amonestaciones escritas o comunicaciones disciplinarias. Ajusta fechas y convenio si lo conoces.",
    msct: "La modificación sustancial puede estar exceptuada de conciliación previa. Si el servicio autonómico no admite papeleta, usa el texto como reclamación extrajudicial base.",
    orden: "Para dejar constancia de una orden empresarial que consideras contraria a la ley, al convenio, a prevención de riesgos o a tus derechos básicos.",
    categoria: "Para reclamar reconocimiento de categoría o grupo profesional cuando las funciones reales no coinciden con lo reconocido en contrato o nómina."
  };

  const TITLES = {
    sancion: "IMPUGNACIÓN DE SANCIÓN O AMONESTACIÓN",
    msct: "RECLAMACIÓN POR MODIFICACIÓN SUSTANCIAL DE CONDICIONES DE TRABAJO",
    orden: "IMPUGNACIÓN DE ORDEN EMPRESARIAL PRESUNTAMENTE ILEGAL",
    categoria: "RECLAMACIÓN DE CATEGORÍA PROFESIONAL"
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

  function partyBlock(data) {
    const worker = clean(data.trabajador, "[NOMBRE Y APELLIDOS]");
    const dni = clean(data.dni, "[DNI/NIE]");
    const workerAddress = clean(data.domicilioTrabajador, "[DOMICILIO]");
    const contact = clean(data.contacto, "[EMAIL O TELÉFONO]");
    const company = clean(data.empresa, "[EMPRESA]");
    const cif = clean(data.cif, "[CIF SI SE CONOCE]");
    const companyAddress = clean(data.domicilioEmpresa, "[DOMICILIO DE LA EMPRESA]");
    const center = clean(data.centro, "[CENTRO DE TRABAJO]");

    return {
      worker,
      company,
      text: [
        `D./Dña. ${worker}, con DNI/NIE ${dni}, domicilio a efectos de notificaciones en ${workerAddress} y contacto ${contact}, comparece y formula papeleta/escrito frente a ${company}, con CIF ${cif}, domicilio en ${companyAddress} y centro de trabajo en ${center}.`
      ].join("\n")
    };
  }

  function baseHeader(data, type) {
    const parties = partyBlock(data);
    return [
      "AL SERVICIO DE MEDIACIÓN, ARBITRAJE Y CONCILIACIÓN QUE CORRESPONDA",
      "",
      TITLES[type],
      "",
      parties.text,
      "",
      "HECHOS",
      ""
    ];
  }

  function commonClosing(data) {
    return [
      "",
      "SOLICITO",
      "",
      clean(data.peticion, "[INDICA AQUÍ LO QUE PIDES]"),
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
      ...commonClosing({
        ...data,
        peticion: clean(data.peticion, "Que se deje sin efecto la sanción o amonestación impugnada, se retire del expediente personal y se restituyan todos los derechos afectados, incluidos salarios, descansos o cualquier consecuencia derivada de la medida.")
      })
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
      ...commonClosing({
        ...data,
        peticion: clean(data.peticion, "Que se deje sin efecto la modificación aplicada, se repongan las condiciones anteriores y se abonen las diferencias salariales o perjuicios que procedan.")
      })
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
      ...commonClosing({
        ...data,
        peticion: clean(data.peticion, "Que se declare la improcedencia de la orden empresarial, se deje sin efecto, se retiren las advertencias o consecuencias asociadas y se garantice que no habrá represalias por la oposición razonada de la persona trabajadora.")
      })
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
      clean(data.hechos, "[DESCRIBE FUNCIONES REALES, RESPONSABILIDADES, autonomía, herramientas, personas a cargo, tareas diarias y comparación con la categoría reclamada.]"),
      "",
      "Cuarto. La categoría, grupo profesional o nivel que se reclama se corresponde con las funciones efectivamente realizadas y con el convenio aplicable.",
      ...commonClosing({
        ...data,
        peticion: clean(data.peticion, "Que se reconozca la categoría, grupo profesional o nivel correspondiente a las funciones efectivamente desempeñadas, con efectos desde la fecha procedente, y se abonen las diferencias salariales que correspondan.")
      })
    ].join("\n");
  }

  const BUILDERS = {
    sancion: sanctionModel,
    msct: msctModel,
    orden: illegalOrderModel,
    categoria: categoryModel
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

    typeSelect.addEventListener("change", updateNote);
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
