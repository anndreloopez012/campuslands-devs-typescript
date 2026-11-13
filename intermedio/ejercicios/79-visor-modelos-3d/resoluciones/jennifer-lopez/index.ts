type ModelId = 'table' | 'paddle' | 'ball';

interface ModelAsset {
  readonly id: ModelId;
  readonly name: string;
  readonly description: string;
}

interface ViewerState {
  rotationX: number;
  rotationY: number;
  zoom: number;
  model: ModelId;
}

const models: readonly ModelAsset[] = [
  { id: 'table', name: 'Mesa de ping-pong', description: 'Mesa azul con red y estructura de soporte.' },
  { id: 'paddle', name: 'Raqueta', description: 'Raqueta de madera con goma roja.' },
  { id: 'ball', name: 'Pelota', description: 'Pelota reglamentaria blanca.' },
];

function createButton(text: string, action: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', action);
  return button;
}

function makePart(className: string, style: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const part = document.createElement('div');
  part.className = className;
  Object.assign(part.style, style);
  return part;
}

function renderModel(modelId: ModelId, stage: HTMLElement): void {
  stage.replaceChildren();
  if (modelId === 'ball') {
    stage.append(makePart('model-ball', {
      width: '130px', height: '130px', borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 25%, #fff, #e2e8f0 70%, #94a3b8)',
      boxShadow: '18px 22px 24px #0f172a44',
    }));
    return;
  }
  if (modelId === 'paddle') {
    const paddle = makePart('model-paddle', {
      width: '155px', height: '155px', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #fb7185, #be123c)',
      border: '10px solid #7f1d1d',
      boxShadow: '14px 18px 18px #0f172a44',
      position: 'relative',
    });
    paddle.append(makePart('paddle-handle', {
      position: 'absolute', width: '40px', height: '105px', top: '125px', left: '48px',
      borderRadius: '0 0 12px 12px', background: 'linear-gradient(90deg, #92400e, #fbbf24, #92400e)',
      transform: 'rotate(8deg)',
    }));
    stage.append(paddle);
    return;
  }

  const table = makePart('model-table', {
    width: '350px', height: '200px', background: '#15803d',
    border: '8px solid #f8fafc', boxShadow: '18px 24px 12px #0f172a55',
    transform: 'rotateX(58deg)', position: 'relative',
  });
  table.append(makePart('table-net', {
    position: 'absolute', left: '50%', top: '0', height: '100%', width: '5px',
    background: '#f8fafc', transform: 'translateX(-50%)',
  }));
  table.append(makePart('table-leg', {
    position: 'absolute', left: '15%', top: '85%', height: '115px', width: '12px',
    background: '#334155', transform: 'rotateX(-58deg)',
  }));
  table.append(makePart('table-leg', {
    position: 'absolute', right: '15%', top: '85%', height: '115px', width: '12px',
    background: '#334155', transform: 'rotateX(-58deg)',
  }));
  stage.append(table);
}

function mountModelViewer(container: HTMLElement): void {
  const app = document.createElement('main');
  app.innerHTML = '<h1>Visor de modelos 3D</h1>';
  const selector = document.createElement('select');
  selector.setAttribute('aria-label', 'Seleccionar modelo');
  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    selector.append(option);
  });
  const controls = document.createElement('div');
  const stage = document.createElement('div');
  stage.setAttribute('aria-label', 'Vista previa del modelo');
  const scene = document.createElement('div');
  Object.assign(scene.style, { perspective: '900px', overflow: 'hidden', borderRadius: '12px' });
  Object.assign(stage.style, {
    minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', background: '#e2e8f0', borderRadius: '12px',
  });
  scene.append(stage);
  const description = document.createElement('p');
  const state: ViewerState = { rotationX: 15, rotationY: -25, zoom: 1, model: 'table' };

  const update = (): void => {
    const selected = models.find((model) => model.id === state.model);
    if (selected) description.textContent = selected.description;
    stage.style.transform = `rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg) scale(${state.zoom})`;
    renderModel(state.model, stage);
  };
  selector.addEventListener('change', () => {
    const selected = models.find((model) => model.id === selector.value);
    if (selected) {
      state.model = selected.id;
      update();
    }
  });
  controls.append(
    createButton('Girar X−', () => { state.rotationX -= 15; update(); }),
    createButton('Girar X+', () => { state.rotationX += 15; update(); }),
    createButton('Girar Y−', () => { state.rotationY -= 15; update(); }),
    createButton('Girar Y+', () => { state.rotationY += 15; update(); }),
    createButton('Acercar', () => { state.zoom = Math.min(1.6, state.zoom + 0.1); update(); }),
    createButton('Alejar', () => { state.zoom = Math.max(0.6, state.zoom - 0.1); update(); }),
    createButton('Restablecer', () => {
      state.rotationX = 15; state.rotationY = -25; state.zoom = 1; update();
    }),
  );
  app.append(selector, controls, description, scene);
  container.append(app);
  update();
}

console.log('Visor 3D: modelos disponibles', models.map((model) => model.name));
if (typeof document !== 'undefined') mountModelViewer(document.body);
