// Solución Ejercicio Intermedio 76 - Stefani Sánchez
export {};

interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

class AlmacenMemoria implements Almacen {
  private readonly datos = new Map<string, string>();
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
}

type Paso = "identificacion" | "firma-exencion" | "peso" | "equipo" | "briefing";
type EstadoPaso = "pendiente" | "completo";
type Fase = "en-curso" | "listo-para-abordar";

const PASOS: readonly Paso[] = ["identificacion", "firma-exencion", "peso", "equipo", "briefing"];
const PESO_MAXIMO_KG = 100;

interface CheckIn {
  readonly saltador: string;
  readonly pasos: Readonly<Record<Paso, EstadoPaso>>;
  readonly pesoKg: number | null;
}

type Evento =
  | { readonly tipo: "completar"; readonly paso: Exclude<Paso, "peso"> }
  | { readonly tipo: "registrar-peso"; readonly kg: number };

const nuevo = (saltador: string): CheckIn => ({
  saltador,
  pasos: { identificacion: "pendiente", "firma-exencion": "pendiente", peso: "pendiente", equipo: "pendiente", briefing: "pendiente" },
  pesoKg: null,
});

const fase = (c: CheckIn): Fase => (PASOS.every((p) => c.pasos[p] === "completo") ? "listo-para-abordar" : "en-curso");

// Los pasos se hacen en orden: no se puede pasar al briefing sin haber firmado la exencion.
const siguientePendiente = (c: CheckIn): Paso | undefined => PASOS.find((p) => c.pasos[p] === "pendiente");

const aplicar = (c: CheckIn, evento: Evento): { checkIn: CheckIn; aviso: string | null } => {
  const paso: Paso = evento.tipo === "completar" ? evento.paso : "peso";
  const esperado = siguientePendiente(c);
  if (c.pasos[paso] === "completo") return { checkIn: c, aviso: `"${paso}" ya estaba completo` };
  if (esperado !== paso) return { checkIn: c, aviso: `primero falta "${esperado}"` };

  if (evento.tipo === "registrar-peso") {
    if (evento.kg <= 0 || evento.kg > PESO_MAXIMO_KG) return { checkIn: c, aviso: `peso ${evento.kg} kg fuera del limite (${PESO_MAXIMO_KG} kg)` };
    return { checkIn: { ...c, pesoKg: evento.kg, pasos: { ...c.pasos, peso: "completo" } }, aviso: null };
  }
  return { checkIn: { ...c, pasos: { ...c.pasos, [paso]: "completo" } }, aviso: null };
};

const claveDe = (saltador: string): string => `checkin-${saltador}`;

console.log("Ejercicio 76: Check-in de salto");
const almacen = new AlmacenMemoria();
const guardar = (c: CheckIn): void => almacen.setItem(claveDe(c.saltador), JSON.stringify(c));
const cargar = (saltador: string): CheckIn => {
  const crudo = almacen.getItem(claveDe(saltador));
  return crudo ? (JSON.parse(crudo) as CheckIn) : nuevo(saltador);
};

const guion: readonly [string, Evento][] = [
  ["Diana", { tipo: "completar", paso: "briefing" }],
  ["Diana", { tipo: "completar", paso: "identificacion" }],
  ["Diana", { tipo: "completar", paso: "identificacion" }],
  ["Diana", { tipo: "completar", paso: "firma-exencion" }],
  ["Diana", { tipo: "registrar-peso", kg: 140 }],
  ["Diana", { tipo: "registrar-peso", kg: 68 }],
  ["Elias", { tipo: "completar", paso: "identificacion" }],
  ["Diana", { tipo: "completar", paso: "equipo" }],
  ["Diana", { tipo: "completar", paso: "briefing" }],
];

guion.forEach(([saltador, evento]) => {
  const { checkIn, aviso } = aplicar(cargar(saltador), evento);
  guardar(checkIn);
  const detalle = evento.tipo === "completar" ? evento.paso : `peso ${evento.kg}`;
  console.log(`  ${saltador}: ${detalle}${aviso ? `  ! ${aviso}` : "  ok"}`);
});

["Diana", "Elias"].forEach((nombre) => {
  const c = cargar(nombre);
  const hechos = PASOS.filter((p) => c.pasos[p] === "completo").length;
  console.log(`${nombre}: ${hechos}/${PASOS.length} pasos | ${fase(c)}${c.pesoKg ? ` | ${c.pesoKg} kg` : ""}`);
});
