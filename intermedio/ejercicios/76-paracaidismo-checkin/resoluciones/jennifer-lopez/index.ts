export {};

type CheckInStatus = 'pending' | 'checked-in' | 'blocked';

interface Jumper {
  readonly id: number;
  readonly name: string;
  readonly age: number;
  readonly weightKg: number;
  readonly paymentReceived: boolean;
  readonly waiverSigned: boolean;
  readonly status: CheckInStatus;
  readonly note: string;
}

interface JumperDraft {
  readonly name: string;
  readonly age: number;
  readonly weightKg: number;
  readonly paymentReceived: boolean;
  readonly waiverSigned: boolean;
}

interface ManifestSummaryDTO {
  readonly totalJumpers: number;
  readonly checkedIn: number;
  readonly pending: number;
  readonly blocked: number;
}

type CheckInValidation =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

class InMemoryManifestRepository {
  private jumpers: Jumper[];

  constructor(initialJumpers: readonly Jumper[]) {
    this.jumpers = [...initialJumpers];
  }

  list(): readonly Jumper[] {
    return this.jumpers;
  }

  add(jumper: Jumper): void {
    this.jumpers = [...this.jumpers, jumper];
  }

  update(updated: Jumper): void {
    this.jumpers = this.jumpers.map((jumper) => jumper.id === updated.id ? updated : jumper);
  }
}

const initialJumpers: readonly Jumper[] = [
  { id: 1, name: 'Juan Pérez', age: 28, weightKg: 76, paymentReceived: true, waiverSigned: true, status: 'pending', note: '' },
  { id: 2, name: 'María Gómez', age: 34, weightKg: 62, paymentReceived: true, waiverSigned: true, status: 'pending', note: '' },
  { id: 3, name: 'Carlos Ruiz', age: 17, weightKg: 68, paymentReceived: false, waiverSigned: false, status: 'pending', note: '' },
];

function validateCheckIn(jumper: JumperDraft): CheckInValidation {
  if (!jumper.name.trim()) return { allowed: false, reason: 'Falta el nombre del participante.' };
  if (!Number.isInteger(jumper.age) || jumper.age < 18) {
    return { allowed: false, reason: 'El participante debe tener al menos 18 años.' };
  }
  if (!Number.isFinite(jumper.weightKg) || jumper.weightKg <= 0 || jumper.weightKg > 100) {
    return { allowed: false, reason: 'El peso debe estar entre 1 y 100 kg.' };
  }
  if (!jumper.paymentReceived) return { allowed: false, reason: 'El pago aún no está registrado.' };
  if (!jumper.waiverSigned) return { allowed: false, reason: 'La exención de responsabilidad debe estar firmada.' };
  return { allowed: true };
}

function summarizeManifest(jumpers: readonly Jumper[]): ManifestSummaryDTO {
  return {
    totalJumpers: jumpers.length,
    checkedIn: jumpers.filter((jumper) => jumper.status === 'checked-in').length,
    pending: jumpers.filter((jumper) => jumper.status === 'pending').length,
    blocked: jumpers.filter((jumper) => jumper.status === 'blocked').length,
  };
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}

function mountCheckIn(root: HTMLElement): void {
  const repository = new InMemoryManifestRepository(initialJumpers);
  const state = { message: '' };
  let nextId = Math.max(...initialJumpers.map((jumper) => jumper.id)) + 1;

  const style = createElement('style');
  style.textContent = `
    .checkin-app { max-width: 900px; margin: 2rem auto; padding: 1.5rem; color: #312e81; font: 16px/1.5 system-ui, sans-serif; }
    .checkin-app h1 { margin-bottom: .25rem; }
    .manifest-summary { display: flex; flex-wrap: wrap; gap: 1rem; padding: 1rem; margin: 1rem 0; border-radius: 12px; background: #eef2ff; }
    .checkin-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .75rem; border: 1px solid #c7d2fe; border-radius: 12px; padding: 1rem; }
    .checkin-form label { display: grid; gap: .25rem; }
    .checkin-form input, .checkin-app button { font: inherit; padding: .5rem; }
    .checkin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .checkin-table th, .checkin-table td { border-bottom: 1px solid #c7d2fe; padding: .65rem; text-align: left; }
    .status-checked-in { color: #166534; } .status-blocked { color: #b91c1c; }
    .checkin-message { min-height: 1.5rem; }
    @media (max-width: 650px) { .checkin-table th:nth-child(3), .checkin-table td:nth-child(3) { display: none; } }
  `;
  root.append(style);

  const render = (): void => {
    const app = createElement('section');
    app.className = 'checkin-app';
    app.append(
      createElement('h1', 'Check-in de salto'),
      createElement('p', 'Confirma la documentación y los requisitos antes de abordar.'),
    );

    const jumpers = repository.list();
    const summary = summarizeManifest(jumpers);
    const summaryPanel = createElement('section');
    summaryPanel.className = 'manifest-summary';
    summaryPanel.setAttribute('aria-label', 'Resumen del manifiesto');
    summaryPanel.append(
      createElement('span', `Participantes: ${summary.totalJumpers}`),
      createElement('span', `Registrados: ${summary.checkedIn}`),
      createElement('span', `Pendientes: ${summary.pending}`),
      createElement('span', `Con bloqueo: ${summary.blocked}`),
    );
    app.append(summaryPanel);

    const form = createElement('form');
    form.className = 'checkin-form';
    const name = createElement('input');
    name.required = true;
    name.placeholder = 'Nombre completo';
    name.setAttribute('aria-label', 'Nombre completo');
    const age = createElement('input');
    age.type = 'number';
    age.min = '1';
    age.max = '120';
    age.required = true;
    age.placeholder = 'Edad';
    age.setAttribute('aria-label', 'Edad');
    const weight = createElement('input');
    weight.type = 'number';
    weight.min = '1';
    weight.max = '150';
    weight.step = '0.1';
    weight.required = true;
    weight.placeholder = 'Peso en kg';
    weight.setAttribute('aria-label', 'Peso en kilogramos');
    const paidLabel = createElement('label');
    const paid = createElement('input');
    paid.type = 'checkbox';
    paidLabel.append(paid, createElement('span', 'Pago recibido'));
    const waiverLabel = createElement('label');
    const waiver = createElement('input');
    waiver.type = 'checkbox';
    waiverLabel.append(waiver, createElement('span', 'Exención firmada'));
    const submit = createElement('button', 'Agregar participante');
    submit.type = 'submit';
    form.append(
      labeledControl('Nombre', name),
      labeledControl('Edad', age),
      labeledControl('Peso (kg)', weight),
      paidLabel,
      waiverLabel,
      submit,
    );
    const message = createElement('p', state.message);
    message.className = 'checkin-message';
    message.setAttribute('role', 'status');
    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      const draft: JumperDraft = {
        name: name.value.trim(),
        age: Number(age.value),
        weightKg: Number(weight.value),
        paymentReceived: paid.checked,
        waiverSigned: waiver.checked,
      };
      if (!draft.name || !Number.isFinite(draft.age) || !Number.isFinite(draft.weightKg)) {
        state.message = 'Completa el nombre, la edad y el peso.';
      } else {
        repository.add({
          id: nextId++,
          ...draft,
          status: 'pending',
          note: '',
        });
        state.message = `${draft.name} quedó en la lista de check-in.`;
      }
      render();
    });
    app.append(form, message);

    const table = createElement('table');
    table.className = 'checkin-table';
    const header = createElement('thead');
    const headingRow = createElement('tr');
    ['Participante', 'Estado', 'Requisitos', 'Acción'].forEach((label) => {
      headingRow.append(createElement('th', label));
    });
    header.append(headingRow);
    const body = createElement('tbody');
    jumpers.forEach((jumper) => {
      const row = createElement('tr');
      const participant = createElement('td');
      participant.append(
        createElement('strong', jumper.name),
        createElement('br'),
        createElement('span', `${jumper.age} años · ${jumper.weightKg} kg`),
      );
      const status = createElement('td', statusLabel(jumper.status));
      status.className = `status-${jumper.status}`;
      const requirements = createElement(
        'td',
        `${jumper.paymentReceived ? 'Pago ✓' : 'Pago pendiente'} · ${jumper.waiverSigned ? 'Exención ✓' : 'Exención pendiente'}${jumper.note ? ` · ${jumper.note}` : ''}`,
      );
      const action = createElement('td');
      if (jumper.status === 'pending') {
        const checkInButton = createElement('button', 'Confirmar check-in');
        checkInButton.type = 'button';
        checkInButton.addEventListener('click', () => {
          const validation = validateCheckIn(jumper);
          repository.update({
            ...jumper,
            status: validation.allowed ? 'checked-in' : 'blocked',
            note: validation.allowed ? '' : validation.reason,
          });
          state.message = validation.allowed
            ? `Check-in confirmado para ${jumper.name}.`
            : `${jumper.name}: ${validation.reason}`;
          render();
        });
        action.append(checkInButton);
      }
      row.append(participant, status, requirements, action);
      body.append(row);
    });
    table.append(header, body);
    app.append(table);
    root.replaceChildren(style, app);
  };

  render();
}

function labeledControl(label: string, control: HTMLElement): HTMLLabelElement {
  const wrapper = createElement('label');
  wrapper.append(createElement('span', label), control);
  return wrapper;
}

function statusLabel(status: CheckInStatus): string {
  const labels: Readonly<Record<CheckInStatus, string>> = {
    pending: 'Pendiente',
    'checked-in': 'Confirmado',
    blocked: 'Bloqueado',
  };
  return labels[status];
}

const normalCase = validateCheckIn({
  name: 'Juan Pérez',
  age: 28,
  weightKg: 76,
  paymentReceived: true,
  waiverSigned: true,
});
const edgeCase = validateCheckIn({
  name: 'Carlos Ruiz',
  age: 17,
  weightKg: 68,
  paymentReceived: false,
  waiverSigned: false,
});
console.log('Check-in de salto — caso normal:', normalCase);
console.log('Caso límite (menor de edad y requisitos pendientes):', edgeCase);
console.log('Manifiesto inicial:', summarizeManifest(initialJumpers));

if (typeof document !== 'undefined') {
  const start = (): void => {
    let root = document.getElementById('skydiving-checkin');
    if (!root) {
      root = createElement('main');
      root.id = 'skydiving-checkin';
      document.body.append(root);
    }
    mountCheckIn(root);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
