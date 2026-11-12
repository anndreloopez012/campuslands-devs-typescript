export {};

// tipos
type EstadoAsset = 'cargando' | 'listo' | 'error';

interface Asset3D {
  readonly id: number;
  readonly nombre: string;
  readonly formato: 'gltf' | 'obj' | 'fbx';
  estado: EstadoAsset;
  poligono: number | null;
}

// persistencia simulada
interface AlmacenAssets {
  guardar(assets: Asset3D[]): void;
  leer(): Asset3D[] | null;
}

class AlmacenAssetsMemoria implements AlmacenAssets {
  private assets: Asset3D[] | null = null;

  guardar(assets: Asset3D[]): void {
    this.assets = assets.map((asset) => ({ ...asset }));
  }

  leer(): Asset3D[] | null {
    return this.assets ? this.assets.map((asset) => ({ ...asset })) : null;
  }
}

// datos remotos simulados
async function cargarAsset(asset: Asset3D): Promise<Asset3D> {
  await new Promise((resolver) => setTimeout(resolver, 5));

  const poligonosSimulados: Record<number, number | null> = { 1: 12500, 2: 0, 3: 480000 };
  const poligono = poligonosSimulados[asset.id];

  asset.estado = poligono && poligono > 0 ? 'listo' : 'error';
  asset.poligono = poligono;
  return asset;
}

// clases
class Visor3D {
  private readonly assets = new Map<number, Asset3D>();

  constructor(private readonly almacen: AlmacenAssets) {}

  cargar(assets: Asset3D[]): void {
    assets.forEach((asset) => this.assets.set(asset.id, asset));
  }

  async cargarTodos(): Promise<Asset3D[]> {
    const resultados = await Promise.all([...this.assets.values()].map((asset) => cargarAsset(asset)));
    this.almacen.guardar(resultados);
    return resultados;
  }

  restaurar(): boolean {
    const assets = this.almacen.leer();
    if (!assets) return false;
    assets.forEach((asset) => this.assets.set(asset.id, asset));
    return true;
  }

  porFormato(formato: Asset3D['formato']): Asset3D[] {
    return [...this.assets.values()].filter((asset) => asset.formato === formato);
  }
}

// dom
function renderizarEscena(assets: Asset3D[], contenedorId: string): void {
  if (typeof document === 'undefined') return;

  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  assets.forEach((asset) => {
    const linea = document.createElement('div');
    linea.textContent = `${asset.nombre} | ${asset.formato} | ${asset.estado}${asset.poligono ? ` | ${asset.poligono} poligonos` : ''}`;
    contenedor.appendChild(linea);
  });
}

// datos
const assets: Asset3D[] = [
  { id: 1, nombre: 'Hero mecha', formato: 'gltf', estado: 'cargando', poligono: null },
  { id: 2, nombre: 'Arma danada', formato: 'obj', estado: 'cargando', poligono: null },
  { id: 3, nombre: 'Ciudad fondo', formato: 'fbx', estado: 'cargando', poligono: null },
];

// salida
function mostrarResumen(): void {
  console.log('=== Visor de assets 3D ===');
  const visor = new Visor3D(new AlmacenAssetsMemoria());
  visor.cargar(assets);

  void (async () => {
    const resultados = await visor.cargarTodos();
    resultados.forEach((asset) => {
      console.log(`${asset.nombre}: ${asset.estado}${asset.poligono ? ` (${asset.poligono} poligonos)` : ''}`);
    });

    visor.restaurar();
    console.log(`Assets gltf tras restaurar: ${visor.porFormato('gltf').map((asset) => asset.nombre).join(', ')}`);
    renderizarEscena(resultados, 'visor-3d');
  })();
}

mostrarResumen();
