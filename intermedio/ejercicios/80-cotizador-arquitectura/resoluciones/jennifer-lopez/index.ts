type DetailLevel = 'basic' | 'standard' | 'premium';

interface ArchitectureProject {
  readonly clientName: string;
  readonly projectName: string;
  readonly areaSquareMeters: number;
  readonly detailLevel: DetailLevel;
  readonly includesInterior: boolean;
  readonly deadlineDays: number;
}

interface Quote {
  readonly projectName: string;
  readonly clientName: string;
  readonly modeling: number;
  readonly interiorDesign: number;
  readonly rushFee: number;
  readonly total: number;
  readonly estimatedDeliveryDays: number;
}

type QuoteResult =
  | { readonly valid: true; readonly quote: Quote }
  | { readonly valid: false; readonly message: string };

const ratePerSquareMeter: Readonly<Record<DetailLevel, number>> = {
  basic: 18_000,
  standard: 28_000,
  premium: 42_000,
};

function createQuote(project: ArchitectureProject): QuoteResult {
  if (!project.clientName.trim() || !project.projectName.trim()) {
    return { valid: false, message: 'Completa el nombre del cliente y del proyecto.' };
  }
  if (!Number.isFinite(project.areaSquareMeters) || project.areaSquareMeters <= 0) {
    return { valid: false, message: 'El área debe ser mayor que cero.' };
  }
  if (!Number.isInteger(project.deadlineDays) || project.deadlineDays < 1) {
    return { valid: false, message: 'El plazo debe ser de al menos un día.' };
  }

  const modeling = Math.round(project.areaSquareMeters * ratePerSquareMeter[project.detailLevel]);
  const interiorDesign = project.includesInterior ? Math.round(modeling * 0.35) : 0;
  const rushFee = project.deadlineDays < 7 ? Math.round(modeling * 0.2) : 0;
  return {
    valid: true,
    quote: {
      projectName: project.projectName.trim(),
      clientName: project.clientName.trim(),
      modeling,
      interiorDesign,
      rushFee,
      total: modeling + interiorDesign + rushFee,
      estimatedDeliveryDays: project.deadlineDays,
    },
  };
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}

function mountQuoteCalculator(container: HTMLElement): void {
  const app = document.createElement('main');
  app.innerHTML = '<h1>Cotizador de visualización arquitectónica 3D</h1><form id="quote-form"></form><section id="quote-result" aria-live="polite"></section>';
  container.append(app);
  const form = app.querySelector('form');
  const resultElement = app.querySelector('section');
  if (!form || !resultElement) return;

  const addField = (
    labelText: string,
    name: string,
    type: string,
    value: string,
  ): HTMLInputElement => {
    const label = document.createElement('label');
    label.textContent = labelText;
    const input = document.createElement('input');
    input.name = name;
    input.type = type;
    input.value = value;
    input.required = true;
    label.append(input);
    form.append(label);
    return input;
  };
  const client = addField('Cliente', 'clientName', 'text', 'Juan Pérez');
  const project = addField('Proyecto', 'projectName', 'text', 'Casa campestre');
  const area = addField('Área (m²)', 'areaSquareMeters', 'number', '120');
  area.min = '0.1';
  area.step = '0.1';
  const deadline = addField('Plazo (días)', 'deadlineDays', 'number', '14');
  deadline.min = '1';
  const detailLabel = document.createElement('label');
  detailLabel.textContent = 'Nivel de detalle';
  const detail = document.createElement('select');
  detail.name = 'detailLevel';
  const options: readonly { readonly value: DetailLevel; readonly text: string }[] = [
    { value: 'basic', text: 'Básico' },
    { value: 'standard', text: 'Estándar' },
    { value: 'premium', text: 'Premium' },
  ];
  options.forEach(({ value, text }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    detail.append(option);
  });
  detail.value = 'standard';
  detailLabel.append(detail);
  const interiorLabel = document.createElement('label');
  const interior = document.createElement('input');
  interior.type = 'checkbox';
  interior.name = 'includesInterior';
  interiorLabel.append(interior, document.createTextNode(' Incluir diseño interior (+35%)'));
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Calcular cotización';
  form.append(detailLabel, interiorLabel, submit);

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    const selectedLevel = options.find((option) => option.value === detail.value)?.value ?? 'standard';
    const quoteResult = createQuote({
      clientName: client.value,
      projectName: project.value,
      areaSquareMeters: Number(area.value),
      detailLevel: selectedLevel,
      includesInterior: interior.checked,
      deadlineDays: Number(deadline.value),
    });
    resultElement.replaceChildren();
    if (!quoteResult.valid) {
      resultElement.textContent = quoteResult.message;
      return;
    }
    const quote = quoteResult.quote;
    const breakdown = document.createElement('p');
    breakdown.textContent = `Modelado: ${formatCurrency(quote.modeling)} · Interior: ${formatCurrency(quote.interiorDesign)} · Entrega urgente: ${formatCurrency(quote.rushFee)}`;
    const total = document.createElement('strong');
    total.textContent = `Total para ${quote.clientName} — ${quote.projectName}: ${formatCurrency(quote.total)}. Entrega estimada: ${quote.estimatedDeliveryDays} días.`;
    resultElement.append(breakdown, total);
  });
}

const example = createQuote({
  clientName: 'Juan Pérez',
  projectName: 'Casa campestre',
  areaSquareMeters: 120,
  detailLevel: 'standard',
  includesInterior: true,
  deadlineDays: 14,
});
const edgeCase = createQuote({
  clientName: 'Ana Torres',
  projectName: 'Plano vacío',
  areaSquareMeters: 0,
  detailLevel: 'basic',
  includesInterior: false,
  deadlineDays: 5,
});
console.log('Cotizador arquitectura:', {
  cotizacionEjemplo: example.valid ? formatCurrency(example.quote.total) : example.message,
  casoLimite: edgeCase.valid ? formatCurrency(edgeCase.quote.total) : edgeCase.message,
});

if (typeof document !== 'undefined') mountQuoteCalculator(document.body);
