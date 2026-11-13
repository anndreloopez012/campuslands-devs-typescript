type DrawingTool = 'pen' | 'eraser';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface DrawingSettings {
  readonly color: string;
  readonly lineWidth: number;
  readonly tool: DrawingTool;
}

function mountDrawingCanvas(container: HTMLElement): void {
  const app = document.createElement('section');
  app.innerHTML = '<h1>Mi lienzo</h1>';
  const toolbar = document.createElement('div');
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = '#2563eb';
  colorInput.setAttribute('aria-label', 'Color del trazo');

  const widthInput = document.createElement('input');
  widthInput.type = 'range';
  widthInput.min = '1';
  widthInput.max = '40';
  widthInput.value = '6';
  widthInput.setAttribute('aria-label', 'Grosor del trazo');

  const eraserButton = document.createElement('button');
  eraserButton.type = 'button';
  eraserButton.textContent = 'Borrador';
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.textContent = 'Limpiar';
  toolbar.append(colorInput, widthInput, eraserButton, clearButton);

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 520;
  canvas.setAttribute('aria-label', 'Lienzo de dibujo');
  canvas.style.width = '100%';
  canvas.style.maxWidth = '900px';
  canvas.style.border = '1px solid #cbd5e1';
  canvas.style.touchAction = 'none';
  const context = canvas.getContext('2d');
  app.append(toolbar, canvas);
  container.append(app);
  if (!context) return;

  let settings: DrawingSettings = {
    color: colorInput.value,
    lineWidth: Number(widthInput.value),
    tool: 'pen',
  };
  let drawing = false;
  let previous: Point | null = null;

  const getPoint = (event: PointerEvent): Point => {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };
  const startStroke = (event: PointerEvent): void => {
    drawing = true;
    previous = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.arc(previous.x, previous.y, settings.lineWidth / 2, 0, Math.PI * 2);
    context.fillStyle = settings.tool === 'eraser' ? '#ffffff' : settings.color;
    context.fill();
  };
  const continueStroke = (event: PointerEvent): void => {
    if (!drawing || !previous) return;
    const next = getPoint(event);
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(next.x, next.y);
    context.lineWidth = settings.lineWidth;
    context.lineCap = 'round';
    context.strokeStyle = settings.tool === 'eraser' ? '#ffffff' : settings.color;
    context.stroke();
    previous = next;
  };
  const endStroke = (): void => {
    drawing = false;
    previous = null;
  };

  canvas.addEventListener('pointerdown', startStroke);
  canvas.addEventListener('pointermove', continueStroke);
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  colorInput.addEventListener('input', () => {
    settings = { ...settings, color: colorInput.value, tool: 'pen' };
  });
  widthInput.addEventListener('input', () => {
    settings = { ...settings, lineWidth: Number(widthInput.value) };
  });
  eraserButton.addEventListener('click', () => {
    settings = { ...settings, tool: 'eraser' };
  });
  clearButton.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
}

if (typeof document !== 'undefined') mountDrawingCanvas(document.body);
