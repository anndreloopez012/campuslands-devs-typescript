export {};

// Intermedio 45: Log avanzado de saltos
// Tematica: paracaidismo
// Resolucion: Dulce Morales
//
// Problema: antes de dejar subir a alguien al avion, la zona de salto revisa sus fechas:
// cuando fue su ultimo salto (si paso mucho tiempo necesita un salto supervisado), cuando se
// empaco su paracaidas de reserva, si su certificado medico sigue vigente y si su dispositivo
// de apertura automatica (AAD) no vencio. Con eso se decide su estado. Ademas se arma un reporte
// mensual de saltos agrupado por paracaidista.

// ===================== TIPOS =====================

type Estado = "habilitado" | "requiere supervision" | "suspendido";
type TipoSalto = "deportivo" | "entrenamiento" | "exhibicion";

interface Salto {
  readonly fecha: Date;
  readonly tipo: TipoSalto;
  readonly alturaPies: number;
}

interface Paracaidista {
  readonly nombre: string;
  readonly empaqueReserva: Date;
  readonly vencimientoMedico: Date;
  readonly vencimientoAAD: Date;
  readonly saltos: readonly Salto[];
}

interface Revision {
  readonly paracaidista: Paracaidista;
  readonly estado: Estado;
  readonly motivos: readonly string[];
  readonly diasDesdeUltimoSalto: number | null;
}

// ===================== REGLAS =====================

const DIAS_RECENCIA: number = 60; // con 60 dias o menos desde el ultimo salto puede saltar solo
const DIAS_EMPAQUE_RESERVA: number = 180; // la reserva se re-empaca cada 180 dias
const DIA_MS: number = 86_400_000;

function f(anio: number, mes: number, dia: number): Date {
  return new Date(anio, mes - 1, dia);
}

function diasEntre(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / DIA_MS);
}

function texto(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ===================== SERVICIO =====================

class ControlZonaSalto {
  constructor(private readonly hoy: Date) {}

  revisar(p: Paracaidista): Revision {
    const motivos: string[] = [];
    let suspendido: boolean = false;
    let supervision: boolean = false;

    // Vencimientos que suspenden (el mismo dia del vencimiento todavia es valido)
    if (p.vencimientoMedico.getTime() < this.hoy.getTime()) {
      suspendido = true;
      motivos.push(`certificado medico vencido el ${texto(p.vencimientoMedico)}`);
    }
    if (p.vencimientoAAD.getTime() < this.hoy.getTime()) {
      suspendido = true;
      motivos.push(`AAD vencido el ${texto(p.vencimientoAAD)}`);
    }
    const diasEmpaque: number = diasEntre(p.empaqueReserva, this.hoy);
    if (diasEmpaque > DIAS_EMPAQUE_RESERVA) {
      suspendido = true;
      motivos.push(`reserva empacada hace ${diasEmpaque} dias (maximo ${DIAS_EMPAQUE_RESERVA})`);
    }

    // Recencia: si paso mucho tiempo desde el ultimo salto, debe saltar con supervision
    const ultimo: Salto | undefined = [...p.saltos].sort((a, b): number => b.fecha.getTime() - a.fecha.getTime())[0];
    const dias: number | null = ultimo === undefined ? null : diasEntre(ultimo.fecha, this.hoy);
    if (dias === null) {
      supervision = true;
      motivos.push("no tiene saltos registrados");
    } else if (dias > DIAS_RECENCIA) {
      supervision = true;
      motivos.push(`su ultimo salto fue hace ${dias} dias (maximo ${DIAS_RECENCIA})`);
    }

    // Avisos de vencimientos proximos (en 15 dias o menos), sin cambiar el estado
    const proximo = (nombre: string, d: Date): void => {
      const faltan: number = diasEntre(this.hoy, d);
      if (faltan >= 0 && faltan <= 15) motivos.push(`aviso: ${nombre} vence en ${faltan} dia(s)`);
    };
    proximo("certificado medico", p.vencimientoMedico);
    proximo("AAD", p.vencimientoAAD);

    const estado: Estado = suspendido ? "suspendido" : supervision ? "requiere supervision" : "habilitado";
    return { paracaidista: p, estado, motivos, diasDesdeUltimoSalto: dias };
  }

  // Reporte: "AAAA-MM" -> paracaidista -> cantidad de saltos
  reporteMensual(lista: readonly Paracaidista[]): Map<string, Map<string, number>> {
    const reporte: Map<string, Map<string, number>> = new Map();
    for (const p of lista) {
      for (const s of p.saltos) {
        const mes: string = `${s.fecha.getFullYear()}-${String(s.fecha.getMonth() + 1).padStart(2, "0")}`;
        const porPersona: Map<string, number> = reporte.get(mes) ?? new Map();
        porPersona.set(p.nombre, (porPersona.get(p.nombre) ?? 0) + 1);
        reporte.set(mes, porPersona);
      }
    }
    return new Map([...reporte.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }
}

// ===================== DATOS Y SALIDA =====================

const salto = (anio: number, mes: number, dia: number, tipo: TipoSalto = "deportivo", alturaPies: number = 13000): Salto => ({ fecha: f(anio, mes, dia), tipo, alturaPies });

const paracaidistas: readonly Paracaidista[] = [
  {
    nombre: "Andrea", empaqueReserva: f(2026, 7, 1), vencimientoMedico: f(2027, 3, 1), vencimientoAAD: f(2029, 1, 1),
    saltos: [salto(2026, 9, 5), salto(2026, 9, 6), salto(2026, 10, 12, "entrenamiento"), salto(2026, 11, 8)],
  },
  {
    // Limite: su ultimo salto fue hace EXACTAMENTE 60 dias -> todavia puede saltar sola
    nombre: "Bruno", empaqueReserva: f(2026, 8, 20), vencimientoMedico: f(2026, 12, 1), vencimientoAAD: f(2028, 6, 1),
    saltos: [salto(2026, 8, 30), salto(2026, 9, 17, "exhibicion", 5000)],
  },
  {
    // Paso mucho tiempo sin saltar
    nombre: "Carla", empaqueReserva: f(2026, 10, 1), vencimientoMedico: f(2027, 5, 1), vencimientoAAD: f(2027, 9, 1),
    saltos: [salto(2026, 6, 2), salto(2026, 6, 3)],
  },
  {
    // Reserva sin re-empacar y medico vencido
    nombre: "Dario", empaqueReserva: f(2026, 4, 10), vencimientoMedico: f(2026, 11, 10), vencimientoAAD: f(2030, 1, 1),
    saltos: [salto(2026, 10, 30), salto(2026, 11, 1)],
  },
  {
    // Limite: el certificado vence HOY -> todavia es valido (con aviso)
    nombre: "Elena", empaqueReserva: f(2026, 9, 1), vencimientoMedico: f(2026, 11, 16), vencimientoAAD: f(2028, 1, 1),
    saltos: [salto(2026, 10, 25), salto(2026, 11, 2), salto(2026, 11, 9, "entrenamiento")],
  },
  // Alumna nueva sin saltos
  { nombre: "Flor", empaqueReserva: f(2026, 11, 1), vencimientoMedico: f(2027, 11, 1), vencimientoAAD: f(2031, 1, 1), saltos: [] },
];

function main(): void {
  const hoy: Date = f(2026, 11, 16);
  const control: ControlZonaSalto = new ControlZonaSalto(hoy);

  console.log(`================ CONTROL DE LA ZONA DE SALTO - ${texto(hoy)} ================`);
  const revisiones: Revision[] = paracaidistas.map((p: Paracaidista): Revision => control.revisar(p));
  revisiones.forEach((r: Revision): void => {
    const ultimo: string = r.diasDesdeUltimoSalto === null ? "sin saltos" : `ultimo salto hace ${r.diasDesdeUltimoSalto} dias`;
    console.log(`\n${r.paracaidista.nombre.padEnd(7)} [${r.estado.toUpperCase()}] ${ultimo}`);
    r.motivos.forEach((m: string): void => console.log(`   - ${m}`));
  });

  const conteo: Record<Estado, number> = { habilitado: 0, "requiere supervision": 0, suspendido: 0 };
  revisiones.forEach((r: Revision): void => {
    conteo[r.estado] += 1;
  });
  console.log(`\nResumen: ${conteo.habilitado} habilitado(s), ${conteo["requiere supervision"]} con supervision, ${conteo.suspendido} suspendido(s)`);

  console.log("\n================ SALTOS POR MES ================");
  for (const [mes, porPersona] of control.reporteMensual(paracaidistas)) {
    const total: number = [...porPersona.values()].reduce((a, b): number => a + b, 0);
    console.log(`${mes}: ${total} salto(s) | ${[...porPersona.entries()].map(([n, c]) => `${n} ${c}`).join(", ")}`);
  }
}

main();
