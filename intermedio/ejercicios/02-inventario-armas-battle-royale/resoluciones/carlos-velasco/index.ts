export {};

// tipos
type Rareza = 'comun' | 'raro' | 'epico' | 'legendario';

interface Arma {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: string;
  rareza: Rareza;
  dano: number;
  cargador: number;
  pesoKg: number;
}

interface InventarioSlot {
  readonly arma: Arma;
  cantidad: number;
}

// datos
const armas: Arma[] = [
  { id: 1, nombre: 'Vendaval XR', tipo: 'rifle', rareza: 'epico', dano: 42, cargador: 30, pesoKg: 4.2 },
  { id: 2, nombre: 'Avispa SMG', tipo: 'subfusil', rareza: 'comun', dano: 24, cargador: 40, pesoKg: 2.8 },
  { id: 3, nombre: 'Titán .50', tipo: 'francotirador', rareza: 'legendario', dano: 95, cargador: 5, pesoKg: 7.5 },
  { id: 4, nombre: 'Ardilla 9mm', tipo: 'pistola', rareza: 'comun', dano: 15, cargador: 12, pesoKg: 1.1 },
  { id: 5, nombre: 'Coloso Escopeta', tipo: 'escopeta', rareza: 'raro', dano: 60, cargador: 8, pesoKg: 3.9 },
];

const inventario: InventarioSlot[] = [
  { arma: armas[0], cantidad: 1 },
  { arma: armas[1], cantidad: 2 },
  { arma: armas[2], cantidad: 1 },
  { arma: armas[4], cantidad: 3 },
];

// validacion
function validarArma(arma: Arma): boolean {
  return arma.dano > 0 && arma.cargador > 0 && arma.pesoKg > 0;
}

// calculos
function pesoTotal(inventario: InventarioSlot[]): number {
  return Number(inventario.reduce((total, slot) => total + slot.arma.pesoKg * slot.cantidad, 0).toFixed(2));
}

function danoPromedio(inventario: InventarioSlot[]): number {
  if (inventario.length === 0) return 0;
  const suma = inventario.reduce((total, slot) => total + slot.arma.dano * slot.cantidad, 0);
  const unidades = inventario.reduce((total, slot) => total + slot.cantidad, 0);
  return Number((suma / unidades).toFixed(1));
}

function ordenarPorDano(inventario: InventarioSlot[]): Arma[] {
  return [...inventario]
    .sort((a, b) => b.arma.dano - a.arma.dano)
    .map((slot) => slot.arma);
}

function filtrarPorRareza(inventario: InventarioSlot[], rareza: Rareza): InventarioSlot[] {
  return inventario.filter((slot) => slot.arma.rareza === rareza);
}

// salida
function mostrarResumen(inventario: InventarioSlot[], rarezaBuscada: Rareza): void {
  console.log('=== Inventario tactico battle royale ===');
  console.log(`Peso total: ${pesoTotal(inventario)} kg`);
  console.log(`Daño promedio por unidad: ${danoPromedio(inventario)}`);
  console.log('Orden por daño:');
  ordenarPorDano(inventario).forEach((arma) => {
    console.log(`- ${arma.nombre} (${arma.rareza}) | Daño: ${arma.dano}`);
  });
  console.log(`Slots con rareza ${rarezaBuscada}: ${filtrarPorRareza(inventario, rarezaBuscada).length}`);
}

mostrarResumen(inventario, 'raro');
