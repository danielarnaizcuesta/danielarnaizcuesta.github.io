(function (global) {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const TRANSITION_DATE = "2012-02-12";
  const SMI_2026 = {
    daily: 40.7,
    monthly: 1221,
    annual: 17094
  };
  const EMBARGO_BRACKETS = [
    { label: "Hasta 2.º SMI", width: SMI_2026.monthly, rate: 0.3, reducible: true },
    { label: "Hasta 3.º SMI", width: SMI_2026.monthly, rate: 0.5, reducible: true },
    { label: "Hasta 4.º SMI", width: SMI_2026.monthly, rate: 0.6, reducible: true },
    { label: "Hasta 5.º SMI", width: SMI_2026.monthly, rate: 0.75, reducible: true },
    { label: "Exceso sobre 5 SMI", width: Number.POSITIVE_INFINITY, rate: 0.9, reducible: false }
  ];

  const currencyFormatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  });

  const numberFormatter = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2
  });

  function formatCurrency(value) {
    return currencyFormatter.format(roundMoney(value));
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function formatPercent(value) {
    return `${formatNumber(value * 100, 0)}%`;
  }

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function parseSpanishNumber(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : NaN;
    }

    const raw = String(value || "")
      .trim()
      .replace(/\s/g, "")
      .replace(/[^\d,.-]/g, "");

    if (!raw) {
      return NaN;
    }

    const normalized = raw.includes(",")
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw;

    return Number(normalized);
  }

  function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.valueOf())) {
      return stripTime(value);
    }

    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return stripTime(date);
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function daysBetween(startDate, endDate) {
    return Math.round((stripTime(endDate) - stripTime(startDate)) / MS_PER_DAY);
  }

  function requirePositive(value, label) {
    const parsed = parseSpanishNumber(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(label);
    }
    return parsed;
  }

  function optionalNumber(value) {
    const parsed = parseSpanishNumber(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function requireValidDate(value, label) {
    const date = parseDate(value);
    if (!date) {
      throw new Error(label);
    }
    return date;
  }

  function calculateDismissal(input) {
    const startDate = requireValidDate(input.startDate, "Indica una fecha de inicio válida.");
    const endDate = requireValidDate(input.endDate, "Indica una fecha de fin válida.");
    const annualSalary = requirePositive(input.annualSalary, "Indica un salario bruto anual mayor que cero.");
    const dismissalType = input.dismissalType === "objective" ? "objective" : "unfair";

    if (endDate < startDate) {
      throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
    }

    const serviceDays = Math.max(1, daysBetween(startDate, endDate));
    const serviceYears = serviceDays / 365;
    const dailySalary = annualSalary / 365;

    if (dismissalType === "objective") {
      const rawDays = serviceYears * 20;
      const rawAmount = rawDays * dailySalary;
      const capAmount = annualSalary;
      const amount = Math.min(rawAmount, capAmount);

      return {
        typeLabel: "Despido objetivo procedente",
        amount,
        dailySalary,
        serviceDays,
        serviceYears,
        indemnityDays: amount / dailySalary,
        rawDays,
        capped: amount < rawAmount,
        capLabel: "12 mensualidades",
        breakdown: [
          ["Regla aplicada", "20 días por año trabajado"],
          ["Tope legal", "12 mensualidades"]
        ]
      };
    }

    const transition = parseDate(TRANSITION_DATE);
    let amount;
    let indemnityDays;
    let rawDays;
    let capped = false;
    let capLabel = "24 mensualidades";
    const breakdown = [];

    if (startDate < transition) {
      const preServiceDays = Math.max(0, daysBetween(startDate, endDate < transition ? endDate : transition));
      const postServiceDays = endDate > transition ? Math.max(0, daysBetween(startDate > transition ? startDate : transition, endDate)) : 0;
      const preDays = (preServiceDays / 365) * 45;
      const postDays = (postServiceDays / 365) * 33;

      rawDays = preDays + postDays;
      let capDays = 720;
      if (preDays > 720) {
        capDays = Math.min(preDays, 1260);
        capLabel = "tope transitorio por tramo anterior a 12/02/2012";
      } else {
        capLabel = "720 días de salario";
      }

      indemnityDays = Math.min(rawDays, capDays);
      capped = indemnityDays < rawDays;
      amount = indemnityDays * dailySalary;
      breakdown.push(["Tramo hasta 11/02/2012", `${formatNumber(preDays, 2)} días indemnizatorios`]);
      breakdown.push(["Tramo desde 12/02/2012", `${formatNumber(postDays, 2)} días indemnizatorios`]);
      breakdown.push(["Tope aplicado", capLabel]);
    } else {
      rawDays = serviceYears * 33;
      const rawAmount = rawDays * dailySalary;
      const capAmount = annualSalary * 2;
      amount = Math.min(rawAmount, capAmount);
      indemnityDays = amount / dailySalary;
      capped = amount < rawAmount;
      breakdown.push(["Regla aplicada", "33 días por año trabajado"]);
      breakdown.push(["Tope legal", "24 mensualidades"]);
    }

    return {
      typeLabel: "Despido improcedente",
      amount,
      dailySalary,
      serviceDays,
      serviceYears,
      indemnityDays,
      rawDays,
      capped,
      capLabel,
      breakdown
    };
  }

  function calculateSettlement(input) {
    const annualSalary = requirePositive(input.annualSalary, "Indica un salario bruto anual mayor que cero.");
    const workedDays = optionalNumber(input.workedDays);
    const vacationDays = optionalNumber(input.vacationDays);
    const otherAmount = optionalNumber(input.otherAmount);

    if (workedDays < 0 || vacationDays < 0 || otherAmount < 0) {
      throw new Error("Los días e importes no pueden ser negativos.");
    }

    const dailySalary = annualSalary / 365;
    const workedAmount = dailySalary * workedDays;
    const vacationAmount = dailySalary * vacationDays;
    const total = workedAmount + vacationAmount + otherAmount;

    return {
      total,
      dailySalary,
      workedAmount,
      vacationAmount,
      otherAmount,
      workedDays,
      vacationDays
    };
  }

  function calculateSmi(input) {
    const annualSalary = requirePositive(input.annualSalary, "Indica un salario bruto anual mayor que cero.");
    const workPercent = requirePositive(input.workPercent, "Indica un porcentaje de jornada mayor que cero.");

    if (workPercent > 100) {
      throw new Error("El porcentaje de jornada no debe superar el 100%.");
    }

    const minimumAnnual = SMI_2026.annual * (workPercent / 100);
    const difference = annualSalary - minimumAnnual;

    return {
      annualSalary,
      workPercent,
      minimumAnnual,
      minimumMonthly14: SMI_2026.monthly * (workPercent / 100),
      minimumMonthly12: minimumAnnual / 12,
      difference,
      compliant: difference >= 0
    };
  }

  function calculateMora(input) {
    const owedAmount = requirePositive(input.owedAmount, "Indica una cantidad salarial debida mayor que cero.");
    const dueDate = requireValidDate(input.dueDate, "Indica una fecha de vencimiento válida.");
    const calculationDate = requireValidDate(input.calculationDate, "Indica una fecha de cálculo válida.");

    if (calculationDate < dueDate) {
      throw new Error("La fecha de cálculo no puede ser anterior a la fecha en que debió pagarse.");
    }

    const delayDays = Math.max(0, daysBetween(dueDate, calculationDate));
    const tenPercent = owedAmount * 0.1;
    const proratedInterest = tenPercent * (delayDays / 365);

    return {
      owedAmount,
      delayDays,
      tenPercent,
      proratedInterest,
      proratedTotal: owedAmount + proratedInterest,
      tenPercentTotal: owedAmount + tenPercent
    };
  }

  function calculateEmbargoability(input) {
    const monthlyIncome = requirePositive(input.monthlyIncome, "Indica un ingreso neto mensual mayor que cero.");
    const otherIncome = optionalNumber(input.otherIncome);
    const familyReduction = optionalNumber(input.familyReduction);
    const debtType = input.debtType === "maintenance" ? "maintenance" : "ordinary";

    if (otherIncome < 0) {
      throw new Error("Las otras percepciones acumulables no pueden ser negativas.");
    }

    if (![0, 10, 15].includes(familyReduction)) {
      throw new Error("La rebaja por cargas familiares solo puede ser 0, 10 o 15 puntos.");
    }

    const totalIncome = monthlyIncome + otherIncome;
    const protectedAmount = Math.min(totalIncome, SMI_2026.monthly);
    let remaining = Math.max(0, totalIncome - SMI_2026.monthly);
    const breakdown = [];
    let embargoAmount = 0;

    EMBARGO_BRACKETS.forEach((bracket) => {
      if (remaining <= 0) {
        return;
      }

      const trancheAmount = Math.min(remaining, bracket.width);
      const appliedRate = Math.max(0, bracket.rate - (bracket.reducible ? familyReduction / 100 : 0));
      const withheld = trancheAmount * appliedRate;

      breakdown.push({
        label: bracket.label,
        trancheAmount: roundMoney(trancheAmount),
        appliedRate,
        withheld: roundMoney(withheld)
      });

      embargoAmount += withheld;
      remaining -= trancheAmount;
    });

    return {
      monthlyIncome,
      otherIncome,
      totalIncome: roundMoney(totalIncome),
      protectedAmount: roundMoney(protectedAmount),
      embargoAmount: roundMoney(embargoAmount),
      remainingAfterEmbargo: roundMoney(totalIncome - embargoAmount),
      familyReduction,
      debtType,
      breakdown,
      fullyProtected: embargoAmount === 0
    };
  }

  function metric(label, value) {
    return `
      <div class="calc-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `;
  }

  function renderResult(target, html) {
    target.classList.remove("is-error");
    target.hidden = false;
    target.innerHTML = html;
  }

  function renderError(target, error) {
    target.classList.add("is-error");
    target.hidden = false;
    target.innerHTML = `<p>${error.message}</p>`;
  }

  function hideResult(target) {
    target.hidden = true;
    target.innerHTML = "";
    target.classList.remove("is-error");
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function bindForm(formId, resultId, callback) {
    const form = document.getElementById(formId);
    const result = document.getElementById(resultId);

    if (!form || !result) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        callback(formData(form), result);
      } catch (error) {
        renderError(result, error);
      }
    });

    form.addEventListener("reset", () => {
      setTimeout(() => hideResult(result), 0);
    });
  }

  function renderDismissal(data, result) {
    const calculation = calculateDismissal(data);
    const breakdown = calculation.breakdown
      .map(([label, value]) => metric(label, value))
      .join("");

    renderResult(result, `
      <div class="result-main">
        <span>${calculation.typeLabel}</span>
        <strong>${formatCurrency(calculation.amount)}</strong>
      </div>
      <div class="calc-metric-grid">
        ${metric("Salario diario", formatCurrency(calculation.dailySalary))}
        ${metric("Antigüedad aproximada", `${formatNumber(calculation.serviceYears, 2)} años`)}
        ${metric("Días indemnizatorios", formatNumber(calculation.indemnityDays, 2))}
        ${metric("Tope", calculation.capped ? "Aplicado" : "No aplicado")}
        ${breakdown}
      </div>
      <p class="calc-disclaimer">Resultado bruto orientativo. No incluye nulidad, salarios de tramitación, pactos, convenio, FOGASA ni redondeos que puedan discutirse con documentación completa.</p>
    `);
  }

  function renderSettlement(data, result) {
    const calculation = calculateSettlement(data);

    renderResult(result, `
      <div class="result-main">
        <span>Finiquito bruto orientativo</span>
        <strong>${formatCurrency(calculation.total)}</strong>
      </div>
      <div class="calc-metric-grid">
        ${metric("Salario diario", formatCurrency(calculation.dailySalary))}
        ${metric("Días pendientes", formatCurrency(calculation.workedAmount))}
        ${metric("Vacaciones", formatCurrency(calculation.vacationAmount))}
        ${metric("Otros conceptos", formatCurrency(calculation.otherAmount))}
      </div>
      <p class="calc-disclaimer">No descuenta IRPF, cotización, anticipos, embargos ni ajustes de convenio. Usa importes brutos.</p>
    `);
  }

  function renderSmi(data, result) {
    const calculation = calculateSmi(data);
    const differenceText = calculation.compliant
      ? `${formatCurrency(calculation.difference)} por encima`
      : `${formatCurrency(Math.abs(calculation.difference))} por debajo`;

    renderResult(result, `
      <div class="result-main ${calculation.compliant ? "is-positive" : "is-negative"}">
        <span>${calculation.compliant ? "Por encima del SMI" : "Por debajo del SMI"}</span>
        <strong>${differenceText}</strong>
      </div>
      <div class="calc-metric-grid">
        ${metric("SMI anual proporcional", formatCurrency(calculation.minimumAnnual))}
        ${metric("Equivalente 14 pagas", formatCurrency(calculation.minimumMonthly14))}
        ${metric("Equivalente 12 meses", formatCurrency(calculation.minimumMonthly12))}
        ${metric("Jornada comparada", `${numberFormatter.format(calculation.workPercent)}%`)}
      </div>
      <p class="calc-disclaimer">Comparación en cómputo anual. El salario en especie no puede minorar la cuantía íntegra en dinero del SMI.</p>
    `);
  }

  function renderMora(data, result) {
    const calculation = calculateMora(data);

    renderResult(result, `
      <div class="result-main">
        <span>10% sobre lo adeudado</span>
        <strong>${formatCurrency(calculation.tenPercent)}</strong>
      </div>
      <div class="calc-metric-grid">
        ${metric("Cantidad debida", formatCurrency(calculation.owedAmount))}
        ${metric("Días de retraso", numberFormatter.format(calculation.delayDays))}
        ${metric("Prorrata temporal simple", formatCurrency(calculation.proratedInterest))}
        ${metric("Total con prorrata", formatCurrency(calculation.proratedTotal))}
      </div>
      <p class="calc-disclaimer">El Estatuto fija el 10% por mora salarial. La prorrata temporal es una estimación simple para ordenar una reclamación.</p>
    `);
  }

  function renderEmbargoability(data, result) {
    const calculation = calculateEmbargoability(data);
    const reductionLabel = calculation.familyReduction
      ? `${numberFormatter.format(calculation.familyReduction)} puntos menos en los cuatro primeros tramos`
      : "No aplicada";
    const breakdown = calculation.breakdown.length
      ? calculation.breakdown
          .map((item) =>
            metric(
              item.label,
              `${formatCurrency(item.trancheAmount)} x ${formatPercent(item.appliedRate)} = ${formatCurrency(item.withheld)}`
            )
          )
          .join("")
      : metric("Escala aplicada", "Todo el ingreso queda dentro del tramo inembargable");
    const title = calculation.fullyProtected ? "Ingreso íntegramente protegido" : "Máximo embargable orientativo";
    const maintenanceNote =
      calculation.debtType === "maintenance"
        ? '<p class="calc-warning">Has marcado alimentos o pensión alimenticia. En ese caso el artículo 608 LEC permite apartarse de esta escala y el juzgado puede fijar otra retención.</p>'
        : "";

    renderResult(result, `
      <div class="result-main ${calculation.fullyProtected ? "is-positive" : ""}">
        <span>${title}</span>
        <strong>${formatCurrency(calculation.embargoAmount)}</strong>
      </div>
      ${maintenanceNote}
      <div class="calc-metric-grid">
        ${metric("Ingreso computado", formatCurrency(calculation.totalIncome))}
        ${metric("Tramo inembargable", formatCurrency(calculation.protectedAmount))}
        ${metric("Te quedaría", formatCurrency(calculation.remainingAfterEmbargo))}
        ${metric("Rebaja familiar", reductionLabel)}
        ${breakdown}
      </div>
      <p class="calc-disclaimer">Se usa el SMI mensual de 2026, ${formatCurrency(SMI_2026.monthly)}, y la escala del artículo 607 LEC. Si hay varias percepciones periódicas deben acumularse y solo se descuenta una vez la parte inembargable.</p>
    `);
  }

  function setDefaultDates() {
    const moraDate = document.querySelector('#mora-form input[name="calculationDate"]');
    if (!moraDate || moraDate.value) {
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`;
    moraDate.value = localDate;
  }

  function init() {
    setDefaultDates();
    bindForm("dismissal-form", "dismissal-result", renderDismissal);
    bindForm("settlement-form", "settlement-result", renderSettlement);
    bindForm("smi-form", "smi-result", renderSmi);
    bindForm("embargo-form", "embargo-result", renderEmbargoability);
    bindForm("mora-form", "mora-result", renderMora);
  }

  const api = {
    SMI_2026,
    calculateDismissal,
    calculateSettlement,
    calculateSmi,
    calculateEmbargoability,
    calculateMora,
    parseSpanishNumber,
    formatCurrency
  };

  global.CalculadorasLaborales = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})(typeof window !== "undefined" ? window : globalThis);
