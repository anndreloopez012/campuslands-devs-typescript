export {};

// Intermedio 08: Catalogo de hiperdeportivos
// Tematica: autos, autos de lujo y vehiculos hiperdeportivos
// Resolucion: Dulce Morales
//
// Problema: un concesionario de lujo quiere un catalogo que se pueda filtrar
// (presupuesto, tipo de motor, potencia minima) y ordenar por distintos criterios,
// clasificando cada auto segun sus prestaciones.

// ===================== MODELO =====================

type Propulsion = "combustion" | "hibrido" | "electrico";
type Categoria = "Deportivo" | "Superdeportivo" | "Hiperdeportivo";
type Disponibilidad = "en stock" | "bajo pedido" | "agotado";

interface Auto {
  readonly id: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
  readonly propulsion: Propulsion;
  readonly potenciaHp: number;
  readonly pesoKg: number;
  readonly ceroACien: number; // segundos
  readonly velocidadMaxKmh: number;
  readonly precioUsd: number;
  readonly disponibilidad: Disponibilidad;
}

// Datos calculados a partir del auto (no se guardan en el auto original)
interface FichaAuto {
  readonly auto: Auto;
  readonly hpPorTonelada: number;
  readonly usdPorHp: number;
  readonly categoria: Categoria;
}

// Todos los filtros son opcionales: si no se indica, no filtra
interface FiltroCatalogo {
  readonly presupuestoMax?: number;
  readonly propulsiones?: readonly Propulsion[];
  readonly potenciaMin?: number;
  readonly soloDisponibles?: boolean;
}

// Criterios de orden: el nombre del campo y si es mayor-primero o menor-primero
type CampoOrden = "hpPorTonelada" | "usdPorHp" | "ceroACien" | "velocidadMaxKmh" | "precioUsd";
type Direccion = "asc" | "desc";

// ===================== VALIDACION =====================

function validarAuto(auto: Auto): string[] {
  const errores: string[] = [];
  const positivos: ReadonlyArray<[string, number]> = [
    ["potencia", auto.potenciaHp],
    ["peso", auto.pesoKg],
    ["0-100", auto.ceroACien],
    ["velocidad maxima", auto.velocidadMaxKmh],
    ["precio", auto.precioUsd],
  ];
  for (const [nombre, valor] of positivos) {
    if (!(valor > 0)) errores.push(`${nombre} debe ser mayor que 0 (es ${valor})`);
  }
  if (auto.anio < 1990 || auto.anio > 2027) errores.push(`anio ${auto.anio} fuera de rango`);
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

function redondear(valor: number, decimales: number = 1): number {
  const factor: number = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function clasificar(auto: Auto): Categoria {
  if (auto.potenciaHp >= 1000 || auto.velocidadMaxKmh >= 400) return "Hiperdeportivo";
  if (auto.potenciaHp >= 600 || auto.ceroACien <= 3) return "Superdeportivo";
  return "Deportivo";
}

function crearFicha(auto: Auto): FichaAuto {
  return {
    auto,
    hpPorTonelada: redondear(auto.potenciaHp / (auto.pesoKg / 1000)),
    usdPorHp: Math.round(auto.precioUsd / auto.potenciaHp),
    categoria: clasificar(auto),
  };
}

function cumpleFiltro(ficha: FichaAuto, filtro: FiltroCatalogo): boolean {
  const a: Auto = ficha.auto;
  if (filtro.presupuestoMax !== undefined && a.precioUsd > filtro.presupuestoMax) return false;
  if (filtro.propulsiones !== undefined && !filtro.propulsiones.includes(a.propulsion)) return false;
  if (filtro.potenciaMin !== undefined && a.potenciaHp < filtro.potenciaMin) return false;
  if (filtro.soloDisponibles === true && a.disponibilidad === "agotado") return false;
  return true;
}

function valorDeCampo(ficha: FichaAuto, campo: CampoOrden): number {
  switch (campo) {
    case "hpPorTonelada":
      return ficha.hpPorTonelada;
    case "usdPorHp":
      return ficha.usdPorHp;
    case "ceroACien":
      return ficha.auto.ceroACien;
    case "velocidadMaxKmh":
      return ficha.auto.velocidadMaxKmh;
    case "precioUsd":
      return ficha.auto.precioUsd;
  }
}

// Ordena una copia; en empate, por nombre para que el resultado sea estable
function ordenar(fichas: readonly FichaAuto[], campo: CampoOrden, direccion: Direccion): FichaAuto[] {
  const signo: number = direccion === "asc" ? 1 : -1;
  return [...fichas].sort(
    (a: FichaAuto, b: FichaAuto): number =>
      signo * (valorDeCampo(a, campo) - valorDeCampo(b, campo)) || nombreCompleto(a.auto).localeCompare(nombreCompleto(b.auto)),
  );
}

function buscar(fichas: readonly FichaAuto[], filtro: FiltroCatalogo, campo: CampoOrden, direccion: Direccion): FichaAuto[] {
  return ordenar(
    fichas.filter((f: FichaAuto): boolean => cumpleFiltro(f, filtro)),
    campo,
    direccion,
  );
}

function contarPorCategoria(fichas: readonly FichaAuto[]): Record<Categoria, number> {
  const conteo: Record<Categoria, number> = { Deportivo: 0, Superdeportivo: 0, Hiperdeportivo: 0 };
  for (const f of fichas) conteo[f.categoria] += 1;
  return conteo;
}

function nombreCompleto(auto: Auto): string {
  return `${auto.marca} ${auto.modelo}`;
}

// ===================== DATOS DE PRUEBA =====================

const autos: readonly Auto[] = [
  { id: "C01", marca: "Bugatti", modelo: "Chiron Super Sport", anio: 2022, propulsion: "combustion", potenciaHp: 1578, pesoKg: 1995, ceroACien: 2.4, velocidadMaxKmh: 440, precioUsd: 3900000, disponibilidad: "bajo pedido" },
  { id: "C02", marca: "Rimac", modelo: "Nevera", anio: 2023, propulsion: "electrico", potenciaHp: 1914, pesoKg: 2300, ceroACien: 1.85, velocidadMaxKmh: 412, precioUsd: 2200000, disponibilidad: "en stock" },
  { id: "C03", marca: "Koenigsegg", modelo: "Regera", anio: 2021, propulsion: "hibrido", potenciaHp: 1500, pesoKg: 1628, ceroACien: 2.8, velocidadMaxKmh: 410, precioUsd: 2000000, disponibilidad: "agotado" },
  { id: "C04", marca: "Ferrari", modelo: "SF90 Stradale", anio: 2024, propulsion: "hibrido", potenciaHp: 986, pesoKg: 1570, ceroACien: 2.5, velocidadMaxKmh: 340, precioUsd: 524000, disponibilidad: "en stock" },
  { id: "C05", marca: "McLaren", modelo: "750S", anio: 2024, propulsion: "combustion", potenciaHp: 740, pesoKg: 1389, ceroACien: 2.8, velocidadMaxKmh: 332, precioUsd: 330000, disponibilidad: "en stock" },
  { id: "C06", marca: "Porsche", modelo: "911 GT3 RS", anio: 2024, propulsion: "combustion", potenciaHp: 518, pesoKg: 1450, ceroACien: 3.2, velocidadMaxKmh: 296, precioUsd: 241000, disponibilidad: "bajo pedido" },
  { id: "C07", marca: "Lotus", modelo: "Evija", anio: 2024, propulsion: "electrico", potenciaHp: 2011, pesoKg: 1887, ceroACien: 2.0, velocidadMaxKmh: 350, precioUsd: 2100000, disponibilidad: "bajo pedido" },
  { id: "C08", marca: "Lamborghini", modelo: "Revuelto", anio: 2024, propulsion: "hibrido", potenciaHp: 1001, pesoKg: 1772, ceroACien: 2.5, velocidadMaxKmh: 350, precioUsd: 608000, disponibilidad: "en stock" },
  // Invalido: peso 0 (dividiria entre 0 al calcular hp por tonelada)
  { id: "C99", marca: "Prototipo", modelo: "Sin datos", anio: 2025, propulsion: "electrico", potenciaHp: 900, pesoKg: 0, ceroACien: 2.2, velocidadMaxKmh: 330, precioUsd: 1000000, disponibilidad: "en stock" },
];

// ===================== SALIDA POR CONSOLA =====================

function dinero(valor: number): string {
  return `$${valor.toLocaleString("en-US")}`;
}

function formatearFicha(i: number, f: FichaAuto): string {
  const a: Auto = f.auto;
  return `${String(i + 1).padStart(2)}. ${nombreCompleto(a).padEnd(29)} ${f.categoria.padEnd(14)} ${String(a.potenciaHp).padStart(4)} hp | ${f.hpPorTonelada.toFixed(1).padStart(6)} hp/t | ${a.ceroACien.toFixed(2)} s | ${dinero(a.precioUsd).padStart(10)} (${dinero(f.usdPorHp)}/hp) | ${a.disponibilidad}`;
}

function imprimirBusqueda(titulo: string, resultados: readonly FichaAuto[]): void {
  console.log(`\n--- ${titulo} (${resultados.length}) ---`);
  if (resultados.length === 0) {
    console.log("Ningun auto cumple los filtros.");
    return;
  }
  resultados.forEach((f: FichaAuto, i: number): void => console.log(formatearFicha(i, f)));
}

function main(): void {
  const fichas: FichaAuto[] = [];
  const rechazados: string[] = [];
  for (const auto of autos) {
    const errores: string[] = validarAuto(auto);
    if (errores.length === 0) {
      fichas.push(crearFicha(auto));
    } else {
      rechazados.push(`${nombreCompleto(auto)}: ${errores.join(", ")}`);
    }
  }

  console.log("================== CATALOGO DE HIPERDEPORTIVOS ==================");
  console.log(`Autos validos: ${fichas.length} | rechazados: ${rechazados.length}`);
  rechazados.forEach((r: string): void => console.log(`  x ${r}`));
  const conteo: Record<Categoria, number> = contarPorCategoria(fichas);
  console.log(`Categorias: ${conteo.Hiperdeportivo} hiperdeportivos, ${conteo.Superdeportivo} superdeportivos, ${conteo.Deportivo} deportivo(s)`);

  imprimirBusqueda("Catalogo completo por relacion potencia/peso", buscar(fichas, {}, "hpPorTonelada", "desc"));

  // Caso limite: el presupuesto es EXACTO al precio del Lamborghini (608,000) -> si entra.
  // Ademas Ferrari y Lamborghini empatan en 2.50 s y se desempatan por nombre.
  imprimirBusqueda(
    "Hibridos o electricos hasta $608,000, disponibles, por aceleracion",
    buscar(fichas, { presupuestoMax: 608000, propulsiones: ["hibrido", "electrico"], soloDisponibles: true }, "ceroACien", "asc"),
  );

  imprimirBusqueda("Mejor relacion precio/potencia (USD por hp), minimo 700 hp", buscar(fichas, { potenciaMin: 700 }, "usdPorHp", "asc"));

  // Caso limite: filtros que no deja pasar a ninguno
  imprimirBusqueda("Electricos por menos de $500,000", buscar(fichas, { presupuestoMax: 500000, propulsiones: ["electrico"] }, "precioUsd", "asc"));

  const [masRapido] = ordenar(fichas, "velocidadMaxKmh", "desc");
  if (masRapido !== undefined) {
    console.log(`\nVelocidad maxima del catalogo: ${nombreCompleto(masRapido.auto)} con ${masRapido.auto.velocidadMaxKmh} km/h`);
  }
}

main();
