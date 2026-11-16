export {};

// Intermedio 02: Inventario tactico battle royale
// Tematica: videojuegos battle royale
// Resolucion: Dulce Morales

// ===================== MODELO =====================

type Rareza = "comun" | "poco comun" | "raro" | "epico" | "legendario";
type TipoMunicion = "ligera" | "pesada" | "escopeta" | "francotirador";
type CategoriaArma = "subfusil" | "rifle" | "escopeta" | "francotirador";

interface Arma {
  readonly tipo: "arma";
  readonly id: string;
  readonly nombre: string;
  readonly categoria: CategoriaArma;
  readonly rareza: Rareza;
  readonly danioBase: number;
  readonly disparosPorSegundo: number;
  readonly municion: TipoMunicion;
}

interface Municion {
  readonly tipo: "municion";
  readonly id: string;
  readonly municion: TipoMunicion;
  readonly cantidad: number;
}

interface Curacion {
  readonly tipo: "curacion";
  readonly id: string;
  readonly nombre: string;
  readonly puntos: number;
  readonly cantidad: number;
}

// Union discriminada: un objeto del inventario es exactamente uno de estos
type Objeto = Arma | Municion | Curacion;

interface Inventario {
  readonly jugador: string;
  readonly objetos: readonly Objeto[];
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly error: string };

interface ResumenInventario {
  readonly jugador: string;
  readonly armas: number;
  readonly espaciosUsados: number;
  readonly dpsTotal: number;
  readonly curacionTotal: number;
  readonly armasSinMunicion: readonly string[];
  readonly puntaje: number;
}

// ===================== REGLAS =====================

const MAX_ARMAS: number = 2;
const MAX_ESPACIOS: number = 5; // cada objeto ocupa un espacio
const MAX_MUNICION_POR_ESPACIO: number = 60;

const BONUS_RAREZA: Record<Rareza, number> = {
  comun: 1,
  "poco comun": 1.1,
  raro: 1.2,
  epico: 1.35,
  legendario: 1.5,
};

// ===================== VALIDACION =====================

function validarObjeto(objeto: Objeto): Resultado<Objeto> {
  switch (objeto.tipo) {
    case "arma":
      if (objeto.danioBase <= 0 || objeto.disparosPorSegundo <= 0) {
        return { ok: false, error: `${objeto.nombre}: danio y cadencia deben ser mayores que 0` };
      }
      return { ok: true, valor: objeto };
    case "municion":
      if (!Number.isInteger(objeto.cantidad) || objeto.cantidad <= 0 || objeto.cantidad > MAX_MUNICION_POR_ESPACIO) {
        return { ok: false, error: `municion ${objeto.municion}: cantidad ${objeto.cantidad} fuera de rango (1-${MAX_MUNICION_POR_ESPACIO})` };
      }
      return { ok: true, valor: objeto };
    case "curacion":
      if (objeto.puntos <= 0 || !Number.isInteger(objeto.cantidad) || objeto.cantidad <= 0) {
        return { ok: false, error: `${objeto.nombre}: puntos y cantidad deben ser mayores que 0` };
      }
      return { ok: true, valor: objeto };
  }
}

function contarArmas(objetos: readonly Objeto[]): number {
  return objetos.filter((o: Objeto): boolean => o.tipo === "arma").length;
}

// ===================== TRANSFORMACION (sin mutar) =====================

// Devuelve un inventario NUEVO con el objeto agregado, o un error
function agregarObjeto(inventario: Inventario, objeto: Objeto): Resultado<Inventario> {
  const validacion: Resultado<Objeto> = validarObjeto(objeto);
  if (!validacion.ok) {
    return validacion;
  }
  if (inventario.objetos.length >= MAX_ESPACIOS) {
    return { ok: false, error: `inventario lleno (${MAX_ESPACIOS}/${MAX_ESPACIOS})` };
  }
  if (objeto.tipo === "arma" && contarArmas(inventario.objetos) >= MAX_ARMAS) {
    return { ok: false, error: `ya lleva ${MAX_ARMAS} armas, no puede cargar ${objeto.nombre}` };
  }
  return { ok: true, valor: { ...inventario, objetos: [...inventario.objetos, objeto] } };
}

function soltarObjeto(inventario: Inventario, id: string): Resultado<Inventario> {
  const existe: boolean = inventario.objetos.some((o: Objeto): boolean => o.id === id);
  if (!existe) {
    return { ok: false, error: `no tiene un objeto con id ${id}` };
  }
  return { ok: true, valor: { ...inventario, objetos: inventario.objetos.filter((o: Objeto): boolean => o.id !== id) } };
}

// ===================== CALCULOS (funciones puras) =====================

function esArma(objeto: Objeto): objeto is Arma {
  return objeto.tipo === "arma";
}

function calcularDps(arma: Arma): number {
  return Math.round(arma.danioBase * arma.disparosPorSegundo * BONUS_RAREZA[arma.rareza]);
}

function municionDisponible(objetos: readonly Objeto[], tipo: TipoMunicion): number {
  return objetos.reduce(
    (total: number, o: Objeto): number => (o.tipo === "municion" && o.municion === tipo ? total + o.cantidad : total),
    0,
  );
}

function curacionTotal(objetos: readonly Objeto[]): number {
  return objetos.reduce(
    (total: number, o: Objeto): number => (o.tipo === "curacion" ? total + o.puntos * o.cantidad : total),
    0,
  );
}

function resumir(inventario: Inventario): ResumenInventario {
  const armas: Arma[] = inventario.objetos.filter(esArma);
  const sinMunicion: string[] = armas
    .filter((a: Arma): boolean => municionDisponible(inventario.objetos, a.municion) === 0)
    .map((a: Arma): string => a.nombre);
  // Un arma sin municion no aporta DPS real
  const dpsTotal: number = armas
    .filter((a: Arma): boolean => !sinMunicion.includes(a.nombre))
    .reduce((total: number, a: Arma): number => total + calcularDps(a), 0);
  const curacion: number = curacionTotal(inventario.objetos);

  return {
    jugador: inventario.jugador,
    armas: armas.length,
    espaciosUsados: inventario.objetos.length,
    dpsTotal,
    curacionTotal: curacion,
    armasSinMunicion: sinMunicion,
    puntaje: dpsTotal + Math.round(curacion / 2),
  };
}

function ranking(resumenes: readonly ResumenInventario[]): ResumenInventario[] {
  return [...resumenes].sort((a: ResumenInventario, b: ResumenInventario): number => b.puntaje - a.puntaje);
}

// ===================== DATOS DE PRUEBA =====================

const scar: Arma = { tipo: "arma", id: "A1", nombre: "SCAR", categoria: "rifle", rareza: "legendario", danioBase: 36, disparosPorSegundo: 5.5, municion: "pesada" };
const mp5: Arma = { tipo: "arma", id: "A2", nombre: "MP5", categoria: "subfusil", rareza: "raro", danioBase: 19, disparosPorSegundo: 12, municion: "ligera" };
const pump: Arma = { tipo: "arma", id: "A3", nombre: "Pump", categoria: "escopeta", rareza: "epico", danioBase: 95, disparosPorSegundo: 0.7, municion: "escopeta" };
const awp: Arma = { tipo: "arma", id: "A4", nombre: "AWP", categoria: "francotirador", rareza: "epico", danioBase: 110, disparosPorSegundo: 0.4, municion: "francotirador" };
const pistolaRota: Arma = { tipo: "arma", id: "A5", nombre: "Pistola rota", categoria: "subfusil", rareza: "comun", danioBase: 0, disparosPorSegundo: 3, municion: "ligera" };

const balasPesadas: Municion = { tipo: "municion", id: "M1", municion: "pesada", cantidad: 60 };
const balasLigeras: Municion = { tipo: "municion", id: "M2", municion: "ligera", cantidad: 45 };
const cartuchos: Municion = { tipo: "municion", id: "M3", municion: "escopeta", cantidad: 18 };
const balasDeMas: Municion = { tipo: "municion", id: "M4", municion: "pesada", cantidad: 90 };
const botiquin: Curacion = { tipo: "curacion", id: "C1", nombre: "Botiquin", puntos: 100, cantidad: 1 };
const vendas: Curacion = { tipo: "curacion", id: "C2", nombre: "Vendas", puntos: 15, cantidad: 5 };
const escudo: Curacion = { tipo: "curacion", id: "C3", nombre: "Mini escudo", puntos: 25, cantidad: 3 };

// Botin que cada jugador intenta recoger, en orden
const botin: Record<string, readonly Objeto[]> = {
  Nova: [scar, mp5, balasPesadas, balasLigeras, botiquin],
  // Caso limite: intenta una 3ra arma y un 6to objeto; ademas el AWP queda sin municion
  Kai: [pump, awp, cartuchos, mp5, vendas, escudo, botiquin],
  // Datos invalidos: arma con danio 0 y municion por encima del limite
  Zed: [pistolaRota, balasDeMas, scar, balasPesadas, escudo],
};

// ===================== SALIDA POR CONSOLA =====================

function lootear(jugador: string, objetos: readonly Objeto[]): { inventario: Inventario; rechazos: string[] } {
  let inventario: Inventario = { jugador, objetos: [] };
  const rechazos: string[] = [];
  for (const objeto of objetos) {
    const resultado: Resultado<Inventario> = agregarObjeto(inventario, objeto);
    if (resultado.ok) {
      inventario = resultado.valor;
    } else {
      rechazos.push(resultado.error);
    }
  }
  return { inventario, rechazos };
}

function describirObjeto(objeto: Objeto): string {
  switch (objeto.tipo) {
    case "arma":
      return `${objeto.nombre} (${objeto.rareza}, ${calcularDps(objeto)} DPS)`;
    case "municion":
      return `Municion ${objeto.municion} x${objeto.cantidad}`;
    case "curacion":
      return `${objeto.cantidad}x ${objeto.nombre}`;
  }
}

function main(): void {
  const resumenes: ResumenInventario[] = [];

  console.log("============ INVENTARIOS BATTLE ROYALE ============");
  for (const [jugador, objetos] of Object.entries(botin)) {
    const { inventario, rechazos } = lootear(jugador, objetos);
    const resumen: ResumenInventario = resumir(inventario);
    resumenes.push(resumen);

    console.log(`\n${jugador} [${resumen.espaciosUsados}/${MAX_ESPACIOS} espacios, ${resumen.armas}/${MAX_ARMAS} armas]`);
    inventario.objetos.forEach((o: Objeto): void => console.log(`  + ${describirObjeto(o)}`));
    rechazos.forEach((r: string): void => console.log(`  x Rechazado: ${r}`));
    resumen.armasSinMunicion.forEach((a: string): void => console.log(`  ! ${a} no tiene municion compatible`));
  }

  // Soltar un objeto devuelve un inventario nuevo: el original no cambia
  const { inventario: invNova } = lootear("Nova", botin["Nova"] ?? []);
  const soltado: Resultado<Inventario> = soltarObjeto(invNova, "C1");
  console.log("\n--- Prueba de inmutabilidad ---");
  if (soltado.ok) {
    console.log(`Nova suelta el botiquin: original ${invNova.objetos.length} objetos, nuevo ${soltado.valor.objetos.length} objetos`);
  }
  const noExiste: Resultado<Inventario> = soltarObjeto(invNova, "Z9");
  console.log(`Soltar Z9: ${noExiste.ok ? "ok" : noExiste.error}`);

  console.log("\n--- Ranking de preparacion (DPS util + curacion/2) ---");
  ranking(resumenes).forEach((r: ResumenInventario, i: number): void => {
    console.log(`${i + 1}. ${r.jugador.padEnd(5)} | DPS ${String(r.dpsTotal).padStart(4)} | Curacion ${String(r.curacionTotal).padStart(3)} | Puntaje ${r.puntaje}`);
  });
}

main();
