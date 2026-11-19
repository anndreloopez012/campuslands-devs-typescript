export {};

// Intermedio 76: Check-in de salto
// Tematica: paracaidismo
// Resolucion: Dulce Morales
//
// Problema: el mostrador de check-in de un centro de paracaidismo. Cada persona llena un formulario
// (DTO de texto); el sistema lo valida, revisa los requisitos segun su tipo de salto (tandem,
// alumno AFF o licenciado), decide si puede saltar con el viento del dia, y arma los "loads"
// (vuelos del avion) respetando cupo y peso maximo. Al final sale el manifiesto y un reporte.

// ===================== MODELO =====================

type TipoSalto = "tandem" | "aff" | "licenciado";
type Licencia = "A" | "B" | "C" | "D";

interface CheckinFormDTO {
  readonly nombre: string;
  readonly edad: string;
  readonly pesoKg: string;
  readonly tipo: string;
  readonly licencia: string;     // solo licenciados
  readonly saltos: string;       // saltos registrados
  readonly diasDesdeUltimo: string;
  readonly firmoDeslinde: boolean;
  readonly certificadoMedico: boolean;
}

// El participante ya validado: la union discriminada obliga a tener los datos de cada tipo
type Participante =
  | { readonly tipo: "tandem"; readonly nombre: string; readonly edad: number; readonly pesoKg: number }
  | { readonly tipo: "aff"; readonly nombre: string; readonly edad: number; readonly pesoKg: number; readonly nivel: number }
  | { readonly tipo: "licenciado"; readonly nombre: string; readonly edad: number; readonly pesoKg: number; readonly licencia: Licencia; readonly saltos: number; readonly diasDesdeUltimo: number };

type Checkin =
  | { readonly estado: "aprobado"; readonly p: Participante; readonly notas: readonly string[] }
  | { readonly estado: "rechazado"; readonly nombre: string; readonly motivos: readonly string[] };

interface Clima {
  readonly vientoKmh: number;
  readonly nubesPies: number; // altura de la base de nubes
}

interface Load {
  readonly numero: number;
  readonly slots: readonly { readonly etiqueta: string; readonly pesoKg: number }[];
}

// ===================== REGLAS =====================

const PESO_MAX: Readonly<Record<TipoSalto, number>> = { tandem: 100, aff: 110, licenciado: 120 };
const EDAD_MIN: number = 18;
const VIENTO_MAX: Readonly<Record<TipoSalto | Licencia, number>> = { tandem: 25, aff: 22, licenciado: 0, A: 25, B: 30, C: 35, D: 40 };
const SALTOS_MIN_LICENCIA: Readonly<Record<Licencia, number>> = { A: 25, B: 50, C: 200, D: 500 };
const DIAS_RECURRENCIA: number = 60; // licenciado con mas de 60 dias sin saltar debe saltar con coach
const NUBES_MIN_PIES: number = 4000;
const CUPO_AVION: number = 10;
const PESO_AVION_KG: number = 750;
const PESO_INSTRUCTOR: number = 85;

const LICENCIAS: readonly Licencia[] = ["A", "B", "C", "D"];
const TIPOS: readonly TipoSalto[] = ["tandem", "aff", "licenciado"];
const esTipo = (x: string): x is TipoSalto => TIPOS.some((t) => t === x);
const esLicencia = (x: string): x is Licencia => LICENCIAS.some((l) => l === x);

// ===================== VALIDACION =====================

function entero(texto: string): number | null {
  const n: number = Number(texto);
  return texto.trim() !== "" && Number.isInteger(n) && n >= 0 ? n : null;
}

function validar(dto: CheckinFormDTO, clima: Clima): Checkin {
  const motivos: string[] = [];
  const notas: string[] = [];
  const nombre: string = dto.nombre.trim() || "(sin nombre)";
  const edad: number | null = entero(dto.edad);
  const peso: number | null = entero(dto.pesoKg);
  const tipo: string = dto.tipo.trim().toLowerCase();

  if (!esTipo(tipo)) return { estado: "rechazado", nombre, motivos: [`tipo de salto "${dto.tipo}" desconocido`] };
  if (edad === null) motivos.push("edad invalida");
  else if (edad < EDAD_MIN) motivos.push(`menor de ${EDAD_MIN} anios`);
  if (peso === null) motivos.push("peso invalido");
  else if (peso > PESO_MAX[tipo]) motivos.push(`peso ${peso} kg supera el maximo de ${PESO_MAX[tipo]} kg para ${tipo}`);
  if (!dto.firmoDeslinde) motivos.push("falta firmar el deslinde");
  if (!dto.certificadoMedico && tipo !== "licenciado") motivos.push("falta certificado medico");
  if (clima.nubesPies < NUBES_MIN_PIES) motivos.push(`nubes a ${clima.nubesPies} pies (minimo ${NUBES_MIN_PIES})`);

  let p: Participante | null = null;
  if (edad !== null && peso !== null) {
    if (tipo === "tandem") {
      if (clima.vientoKmh > VIENTO_MAX.tandem) motivos.push(`viento ${clima.vientoKmh} km/h > ${VIENTO_MAX.tandem} para tandem`);
      p = { tipo, nombre, edad, pesoKg: peso };
    } else if (tipo === "aff") {
      const nivel: number | null = entero(dto.saltos);
      if (nivel === null || nivel < 1 || nivel > 7) motivos.push("nivel AFF debe ser 1 a 7");
      if (clima.vientoKmh > VIENTO_MAX.aff) motivos.push(`viento ${clima.vientoKmh} km/h > ${VIENTO_MAX.aff} para alumnos`);
      if (nivel !== null && nivel <= 2) notas.push("niveles 1-2 saltan con 2 instructores");
      p = { tipo, nombre, edad, pesoKg: peso, nivel: nivel ?? 0 };
    } else {
      const lic: string = dto.licencia.trim().toUpperCase();
      const saltos: number | null = entero(dto.saltos);
      const dias: number | null = entero(dto.diasDesdeUltimo);
      if (!esLicencia(lic)) motivos.push(`licencia "${dto.licencia}" invalida`);
      else {
        if (saltos === null || saltos < SALTOS_MIN_LICENCIA[lic]) motivos.push(`licencia ${lic} requiere ${SALTOS_MIN_LICENCIA[lic]} saltos (tiene ${saltos ?? "?"})`);
        if (clima.vientoKmh > VIENTO_MAX[lic]) motivos.push(`viento ${clima.vientoKmh} km/h > ${VIENTO_MAX[lic]} para licencia ${lic}`);
      }
      if (dias === null) motivos.push("dias desde el ultimo salto invalido");
      else if (dias > DIAS_RECURRENCIA) notas.push(`${dias} dias sin saltar: salto de recurrencia con coach`);
      if (esLicencia(lic) && saltos !== null && dias !== null) p = { tipo, nombre, edad, pesoKg: peso, licencia: lic, saltos, diasDesdeUltimo: dias };
    }
  }

  if (motivos.length > 0 || p === null) return { estado: "rechazado", nombre, motivos };
  return { estado: "aprobado", p, notas };
}

// ===================== REPOSITORIO =====================

class RepoCheckins {
  private readonly items: Checkin[] = [];
  guardar(c: Checkin): void { this.items.push(c); }
  aprobados(): readonly Participante[] { return this.items.flatMap((c) => (c.estado === "aprobado" ? [c.p] : [])); }
  rechazados(): readonly Extract<Checkin, { estado: "rechazado" }>[] { return this.items.flatMap((c) => (c.estado === "rechazado" ? [c] : [])); }
  todos(): readonly Checkin[] { return this.items; }
}

// ===================== MANIFIESTO =====================

// Cada participante ocupa uno o mas lugares en el avion (tandem lleva instructor, AFF 1-2 lleva dos)
function slotsDe(p: Participante): { readonly etiqueta: string; readonly pesoKg: number }[] {
  const yo = { etiqueta: `${p.nombre} (${p.tipo === "licenciado" ? `lic ${p.licencia}` : p.tipo === "aff" ? `AFF ${p.nivel}` : "tandem"})`, pesoKg: p.pesoKg };
  switch (p.tipo) {
    case "tandem": return [yo, { etiqueta: `  instructor TI de ${p.nombre}`, pesoKg: PESO_INSTRUCTOR }];
    case "aff": return p.nivel <= 2
      ? [yo, { etiqueta: `  JM1 de ${p.nombre}`, pesoKg: PESO_INSTRUCTOR }, { etiqueta: `  JM2 de ${p.nombre}`, pesoKg: PESO_INSTRUCTOR }]
      : [yo, { etiqueta: `  JM de ${p.nombre}`, pesoKg: PESO_INSTRUCTOR }];
    case "licenciado": return p.diasDesdeUltimo > DIAS_RECURRENCIA ? [yo, { etiqueta: `  coach de ${p.nombre}`, pesoKg: PESO_INSTRUCTOR }] : [yo];
  }
}

// Llenado en orden de llegada (first fit): cada grupo entra completo en el primer load donde quepa
function armarLoads(ps: readonly Participante[]): Load[] {
  const loads: { numero: number; slots: { etiqueta: string; pesoKg: number }[] }[] = [];
  for (const p of ps) {
    const grupo = slotsDe(p);
    const pesoGrupo: number = grupo.reduce((s, x) => s + x.pesoKg, 0);
    let destino = loads.find((l) => l.slots.length + grupo.length <= CUPO_AVION && l.slots.reduce((s, x) => s + x.pesoKg, 0) + pesoGrupo <= PESO_AVION_KG);
    if (destino === undefined) {
      destino = { numero: loads.length + 1, slots: [] };
      loads.push(destino);
    }
    destino.slots.push(...grupo);
  }
  return loads;
}

// ===================== DEMO =====================

const base: CheckinFormDTO = { nombre: "", edad: "30", pesoKg: "70", tipo: "tandem", licencia: "", saltos: "0", diasDesdeUltimo: "0", firmoDeslinde: true, certificadoMedico: true };
const forms: readonly CheckinFormDTO[] = [
  { ...base, nombre: "Lucia", pesoKg: "62" },
  { ...base, nombre: "Ramon", pesoKg: "101" },                                        // pesa 1 kg de mas
  { ...base, nombre: "Sofi", pesoKg: "100" },                                         // limite: 100 kg justos
  { ...base, nombre: "Mateo", edad: "17" },
  { ...base, nombre: "Eva", firmoDeslinde: false, certificadoMedico: false },
  { ...base, nombre: "Diego", tipo: "aff", saltos: "1", pesoKg: "80" },                // viento 24 > 22
  { ...base, nombre: "Karla", tipo: "licenciado", licencia: "A", saltos: "30", diasDesdeUltimo: "10", pesoKg: "58", certificadoMedico: false },
  { ...base, nombre: "Hugo", tipo: "licenciado", licencia: "B", saltos: "40", diasDesdeUltimo: "5", pesoKg: "77" }, // saltos insuficientes
  { ...base, nombre: "Ines", tipo: "licenciado", licencia: "c", saltos: "350", diasDesdeUltimo: "90", pesoKg: "64" },
  { ...base, nombre: "Pablo", tipo: "licenciado", licencia: "D", saltos: "1200", diasDesdeUltimo: "2", pesoKg: "88" },
  { ...base, nombre: "Toni", tipo: "base jump" },
  { ...base, nombre: "Ana", pesoKg: "55" },
  { ...base, nombre: "Beto", pesoKg: "95" },
  { ...base, nombre: "Caro", pesoKg: "68" },
  { ...base, nombre: "Dani", tipo: "licenciado", licencia: "B", saltos: "75", diasDesdeUltimo: "61", pesoKg: "72" }, // limite: 61 dias
  { ...base, nombre: "Fer", tipo: "licenciado", licencia: "C", saltos: "210", diasDesdeUltimo: "60", pesoKg: "70" },  // limite: 60 dias
];

function dia(titulo: string, clima: Clima, lista: readonly CheckinFormDTO[]): void {
  console.log(`\n########## ${titulo}: viento ${clima.vientoKmh} km/h, nubes a ${clima.nubesPies} pies ##########`);
  const repo: RepoCheckins = new RepoCheckins();
  console.log("=== Check-in ===");
  for (const f of lista) {
    const c: Checkin = validar(f, clima);
    repo.guardar(c);
    if (c.estado === "aprobado") console.log(`  OK  ${c.p.nombre.padEnd(7)} ${c.p.tipo}${c.notas.length ? `  (${c.notas.join("; ")})` : ""}`);
    else console.log(`  NO  ${c.nombre.padEnd(7)} ${c.motivos.join("; ")}`);
  }

  console.log(`\n=== Manifiesto (cupo ${CUPO_AVION}, peso max ${PESO_AVION_KG} kg) ===`);
  const loads: Load[] = armarLoads(repo.aprobados());
  if (loads.length === 0) console.log("  (sin vuelos: nadie aprobado)");
  for (const l of loads) {
    const peso: number = l.slots.reduce((s, x) => s + x.pesoKg, 0);
    console.log(`  Load ${l.numero}: ${l.slots.length}/${CUPO_AVION} lugares, ${peso} kg`);
    for (const s of l.slots) console.log(`     ${s.etiqueta.padEnd(28)} ${s.pesoKg} kg`);
  }

  const motivos: Map<string, number> = new Map();
  for (const r of repo.rechazados()) for (const m of r.motivos) {
    const clave: string = m.split(" ").slice(0, 2).join(" ");
    motivos.set(clave, (motivos.get(clave) ?? 0) + 1);
  }
  const porTipo = TIPOS.map((t) => `${t}=${repo.aprobados().filter((p) => p.tipo === t).length}`).join(", ");
  console.log("\n=== Reporte ===");
  console.log(`  Check-ins: ${repo.todos().length} | aprobados: ${repo.aprobados().length} (${porTipo}) | rechazados: ${repo.rechazados().length}`);
  if (motivos.size > 0) console.log(`  Motivos de rechazo: ${[...motivos.entries()].map(([k, v]) => `"${k}..." x${v}`).join(", ")}`);
}

function main(): void {
  dia("Sabado", { vientoKmh: 24, nubesPies: 6500 }, forms);
  dia("Domingo (calma)", { vientoKmh: 12, nubesPies: 7000 }, [
    { ...base, nombre: "Diego", tipo: "aff", saltos: "1", pesoKg: "80" },
    { ...base, nombre: "Mia", tipo: "aff", saltos: "5", pesoKg: "60" },
    { ...base, nombre: "Leo", tipo: "aff", saltos: "9", pesoKg: "75" },
    { ...base, nombre: "Rita", tipo: "aff", saltos: "3", pesoKg: "111" },
  ]);
  dia("Lunes (nublado)", { vientoKmh: 8, nubesPies: 3500 }, [
    { ...base, nombre: "Pablo", tipo: "licenciado", licencia: "D", saltos: "1200", diasDesdeUltimo: "2", pesoKg: "88" },
  ]);
}

main();
