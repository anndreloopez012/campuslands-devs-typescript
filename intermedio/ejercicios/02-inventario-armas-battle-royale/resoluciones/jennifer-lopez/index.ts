export {};

type RarezaArma = 'Común' | 'Rara' | 'Épica' | 'Legendaria';
type CategoriaItem = 'Fusil de Asalto' | 'Subfusil' | 'Francotirador' | 'Escudo' | 'Curación';

interface ItemInventario {
  readonly idItem: string;
  readonly nombre: string;
  readonly categoria: CategoriaItem;
  readonly rareza: RarezaArma;
  readonly espacioOcupado: number;
  readonly danioBase: number;
  readonly municionActual: number;
  readonly esEquipado: boolean;
}

interface ResumenInventario {
  readonly totalEspacioUtilizado: number;
  readonly capacidadMaxima: number;
  readonly danioTotalPotencial: number;
  readonly itemsDestacados: readonly string[];
}

const inventarioZonaCero: readonly ItemInventario[] = [
  {
    idItem: "INV-771",
    nombre: "Phantom-X Assault",
    categoria: "Fusil de Asalto",
    rareza: "Legendaria",
    espacioOcupado: 4,
    danioBase: 42,
    municionActual: 120,
    esEquipado: true,
  },
  {
    idItem: "INV-882",
    nombre: "Vortex SMG",
    categoria: "Subfusil",
    rareza: "Épica",
    espacioOcupado: 3,
    danioBase: 28,
    municionActual: 90,
    esEquipado: true,
  },
  {
    idItem: "INV-993",
    nombre: "Echo Bolt-Action",
    categoria: "Francotirador",
    rareza: "Legendaria",
    espacioOcupado: 5,
    danioBase: 95,
    municionActual: 15,
    esEquipado: false,
  },
  {
    idItem: "INV-104",
    nombre: "Placa Baliza T4",
    categoria: "Escudo",
    rareza: "Rara",
    espacioOcupado: 2,
    danioBase: 0,
    municionActual: 0,
    esEquipado: true,
  },
  {
    idItem: "INV-556",
    nombre: "Nano-Stim Inyectable",
    categoria: "Curación",
    rareza: "Común",
    espacioOcupado: 1,
    danioBase: 0,
    municionActual: 2,
    esEquipado: false,
  }
];

const CAPACIDAD_MOCHILA_MAXIMA: number = 15;

function validarEspacioInventario(inventario: readonly ItemInventario[], capacidadMax: number): boolean {
  const espacioTotal = inventario.reduce((acumulador, item) => acumulador + item.espacioOcupado, 0);
  return espacioTotal <= capacidadMax;
}

function procesarInventarioTactico(inventario: readonly ItemInventario[], capacidadMax: number): ResumenInventario {
  const espacioUsado = inventario.reduce((acc, item) => acc + item.espacioOcupado, 0);
  
  if (espacioUsado > capacidadMax) {
    console.warn("¡ALERTA TÁCTICA! Capacidad de inventario excedida. Sobrepeso en mochila.");
  }

  const danioTotal = inventario
    .filter(item => item.esEquipado)
    .reduce((acc, item) => acc + item.danioBase, 0);

  const destacados = inventario
    .filter(item => item.rareza === "Legendaria" || item.rareza === "Épica")
    .map(item => `${item.nombre} [${item.rareza}]`);

  return {
    totalEspacioUtilizado: espacioUsado,
    capacidadMaxima: capacidadMax,
    danioTotalPotencial: danioTotal,
    itemsDestacados: destacados
  };
}

function generarReporteInventario(titulo: string, resumen: ResumenInventario): void {
  console.log(`=== [INVENTARIO BATTLE ROYALE] ${titulo} ===`);
  console.log(`Espacio Ocupado: ${resumen.totalEspacioUtilizado} / ${resumen.capacidadMaxima} slots`);
  console.log(`Daño Total Equipado: ${resumen.danioTotalPotencial} PTS`);
  console.log("Arsenal de Alta Gama Detectado:");
  resumen.itemsDestacados.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item}`);
  });
  console.log("==================================================\n");
}

const resultadoNormal = procesarInventarioTactico(inventarioZonaCero, CAPACIDAD_MOCHILA_MAXIMA);
generarReporteInventario("Escuadrón Delta - Configuración Estándar", resultadoNormal);

// Caso Límite: Mochila sobrecargada superando la capacidad máxima permitida
const inventarioCasoLimite: readonly ItemInventario[] = [
  ...inventarioZonaCero,
  {
    idItem: "INV-777",
    nombre: "Titanium Heavy Minigun",
    categoria: "Fusil de Asalto",
    rareza: "Legendaria",
    espacioOcupado: 8,
    danioBase: 110,
    municionActual: 500,
    esEquipado: false,
  }
];

const resultadoLimite = procesarInventarioTactico(inventarioCasoLimite, CAPACIDAD_MOCHILA_MAXIMA);
generarReporteInventario("Caso Límite (Sobrecarga Crítica de Peso)", resultadoLimite);