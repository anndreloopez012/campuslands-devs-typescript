export {};

// Intermedio 20: Comparador de turismo
// Tematica: turismo
// Resolucion: Dulce Morales
//
// Problema: una agencia ofrece paquetes turisticos y cada grupo de viajeros tiene sus propias
// necesidades. Hay que calcular el precio real del paquete para ese grupo (adultos, ninos,
// temporada, descuento de grupo), descartar los que no cumplen lo que piden y ordenar
// los que si cumplen por la mejor relacion precio / valor.

// ===================== MODELO (objetos anidados) =====================

type Temporada = "baja" | "media" | "alta";
type Incluye = "vuelo" | "desayuno" | "traslados" | "seguro";
type Destino = "playa" | "montana" | "ciudad" | "selva";

interface Paquete {
  readonly codigo: string;
  readonly nombre: string;
  readonly destino: { readonly ciudad: string; readonly tipo: Destino };
  readonly hotel: { readonly nombre: string; readonly estrellas: 1 | 2 | 3 | 4 | 5; readonly noches: number };
  readonly tours: readonly { readonly nombre: string; readonly horas: number }[];
  readonly incluye: readonly Incluye[];
  readonly precioAdulto: number; // por persona, temporada baja
  readonly minimoPersonas: number;
  readonly calificacion: number; // 1 a 5 segun opiniones
}

interface Grupo {
  readonly nombre: string;
  readonly adultos: number;
  readonly ninos: number;
  readonly mes: number; // 1 a 12
  readonly presupuesto: number; // total del grupo
  readonly requisitos: {
    readonly incluye: readonly Incluye[];
    readonly estrellasMinimas: number;
    readonly destinos?: readonly Destino[]; // si no se indica, cualquier destino
  };
}

interface Cotizacion {
  readonly paquete: Paquete;
  readonly temporada: Temporada;
  readonly subtotal: number;
  readonly descuentoGrupo: number;
  readonly total: number;
  readonly porPersonaNoche: number;
  readonly puntaje: number;
}

type Evaluacion = { readonly ok: true; readonly cotizacion: Cotizacion } | { readonly ok: false; readonly paquete: Paquete; readonly motivo: string };

// ===================== REGLAS =====================

const RECARGO_TEMPORADA: Readonly<Record<Temporada, number>> = { baja: 0, media: 0.15, alta: 0.35 };
const PRECIO_NINO: number = 0.6; // un nino paga el 60% de un adulto
const DESCUENTO_GRUPO: number = 0.08; // 8% desde 4 personas
const PERSONAS_DESCUENTO: number = 4;

function temporadaDe(mes: number): Temporada {
  if ([12, 1, 7].includes(mes)) return "alta";
  if ([6, 8, 3, 4].includes(mes)) return "media";
  return "baja";
}

// ===================== VALIDACION =====================

function validarGrupo(g: Grupo): string[] {
  const errores: string[] = [];
  if (!Number.isInteger(g.adultos) || g.adultos < 1) errores.push("debe viajar al menos 1 adulto");
  if (!Number.isInteger(g.ninos) || g.ninos < 0) errores.push("cantidad de ninos invalida");
  if (!Number.isInteger(g.mes) || g.mes < 1 || g.mes > 12) errores.push(`mes ${g.mes} invalido`);
  if (g.presupuesto <= 0) errores.push("presupuesto invalido");
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

function cotizar(p: Paquete, g: Grupo): Cotizacion {
  const temporada: Temporada = temporadaDe(g.mes);
  const precioBase: number = p.precioAdulto * (1 + RECARGO_TEMPORADA[temporada]);
  const subtotal: number = precioBase * g.adultos + precioBase * PRECIO_NINO * g.ninos;
  const personas: number = g.adultos + g.ninos;
  const descuentoGrupo: number = personas >= PERSONAS_DESCUENTO ? subtotal * DESCUENTO_GRUPO : 0;
  const total: number = subtotal - descuentoGrupo;
  const porPersonaNoche: number = total / personas / p.hotel.noches;

  // Valor: calificacion, estrellas, horas de tours y cosas incluidas; se divide entre el costo por persona-noche
  const valor: number = p.calificacion * 2 + p.hotel.estrellas + p.tours.reduce((t, x): number => t + x.horas, 0) / 4 + p.incluye.length;
  return {
    paquete: p,
    temporada,
    subtotal: redondear(subtotal),
    descuentoGrupo: redondear(descuentoGrupo),
    total: redondear(total),
    porPersonaNoche: redondear(porPersonaNoche),
    puntaje: redondear((valor / porPersonaNoche) * 100),
  };
}

function evaluar(p: Paquete, g: Grupo): Evaluacion {
  const req = g.requisitos;
  const personas: number = g.adultos + g.ninos;
  if (personas < p.minimoPersonas) return { ok: false, paquete: p, motivo: `minimo ${p.minimoPersonas} personas (son ${personas})` };
  if (req.destinos !== undefined && !req.destinos.includes(p.destino.tipo)) return { ok: false, paquete: p, motivo: `destino ${p.destino.tipo} no buscado` };
  if (p.hotel.estrellas < req.estrellasMinimas) return { ok: false, paquete: p, motivo: `hotel de ${p.hotel.estrellas} estrellas (pide ${req.estrellasMinimas}+)` };
  const faltan: Incluye[] = req.incluye.filter((i: Incluye): boolean => !p.incluye.includes(i));
  if (faltan.length > 0) return { ok: false, paquete: p, motivo: `no incluye ${faltan.join(", ")}` };

  const c: Cotizacion = cotizar(p, g);
  if (c.total > g.presupuesto) return { ok: false, paquete: p, motivo: `cuesta ${dinero(c.total)} y el presupuesto es ${dinero(g.presupuesto)}` };
  return { ok: true, cotizacion: c };
}

function comparar(paquetes: readonly Paquete[], g: Grupo): { opciones: Cotizacion[]; descartes: { paquete: Paquete; motivo: string }[] } {
  const evaluaciones: Evaluacion[] = paquetes.map((p: Paquete): Evaluacion => evaluar(p, g));
  const opciones: Cotizacion[] = evaluaciones
    .flatMap((e: Evaluacion): Cotizacion[] => (e.ok ? [e.cotizacion] : []))
    .sort((a: Cotizacion, b: Cotizacion): number => b.puntaje - a.puntaje || a.total - b.total);
  const descartes = evaluaciones.flatMap((e: Evaluacion) => (e.ok ? [] : [{ paquete: e.paquete, motivo: e.motivo }]));
  return { opciones, descartes };
}

// ===================== DATOS DE PRUEBA =====================

const paquetes: readonly Paquete[] = [
  {
    codigo: "CAR-5", nombre: "Caribe Total", destino: { ciudad: "Cartagena", tipo: "playa" },
    hotel: { nombre: "Hotel Brisa Marina", estrellas: 4, noches: 5 },
    tours: [{ nombre: "Islas del Rosario", horas: 8 }, { nombre: "Ciudad amurallada", horas: 3 }],
    incluye: ["vuelo", "desayuno", "traslados"], precioAdulto: 780, minimoPersonas: 1, calificacion: 4.6,
  },
  {
    codigo: "SMA-4", nombre: "Santa Marta Express", destino: { ciudad: "Santa Marta", tipo: "playa" },
    hotel: { nombre: "Hostal Sierra", estrellas: 3, noches: 4 },
    tours: [{ nombre: "Parque Tayrona", horas: 7 }],
    incluye: ["desayuno"], precioAdulto: 390, minimoPersonas: 1, calificacion: 4.2,
  },
  {
    codigo: "EJE-6", nombre: "Eje Cafetero Familiar", destino: { ciudad: "Salento", tipo: "montana" },
    hotel: { nombre: "Finca El Mirador", estrellas: 4, noches: 6 },
    tours: [{ nombre: "Valle de Cocora", horas: 5 }, { nombre: "Ruta del cafe", horas: 4 }, { nombre: "Termales", horas: 4 }],
    incluye: ["vuelo", "desayuno", "traslados", "seguro"], precioAdulto: 690, minimoPersonas: 2, calificacion: 4.8,
  },
  {
    codigo: "AMZ-5", nombre: "Amazonas Aventura", destino: { ciudad: "Leticia", tipo: "selva" },
    hotel: { nombre: "Eco Lodge Rio", estrellas: 3, noches: 5 },
    tours: [{ nombre: "Selva nocturna", horas: 4 }, { nombre: "Delfines rosados", horas: 6 }],
    incluye: ["vuelo", "traslados", "seguro"], precioAdulto: 950, minimoPersonas: 4, calificacion: 4.5,
  },
  {
    codigo: "BOG-3", nombre: "Bogota Cultural", destino: { ciudad: "Bogota", tipo: "ciudad" },
    hotel: { nombre: "Hotel Candelaria", estrellas: 4, noches: 3 },
    tours: [{ nombre: "Museos del centro", horas: 4 }],
    incluye: ["desayuno", "traslados"], precioAdulto: 310, minimoPersonas: 1, calificacion: 4.0,
  },
  {
    codigo: "SAN-7", nombre: "San Andres Premium", destino: { ciudad: "San Andres", tipo: "playa" },
    hotel: { nombre: "Resort Coral", estrellas: 5, noches: 7 },
    tours: [{ nombre: "Johnny Cay", horas: 6 }, { nombre: "Buceo", horas: 4 }],
    incluye: ["vuelo", "desayuno", "traslados", "seguro"], precioAdulto: 1450, minimoPersonas: 1, calificacion: 4.7,
  },
];

const grupos: readonly Grupo[] = [
  // Familia de 4 en julio (temporada alta): descuento de grupo, ninos al 60%
  { nombre: "Familia Ortiz", adultos: 2, ninos: 2, mes: 7, presupuesto: 6000, requisitos: { incluye: ["vuelo", "desayuno"], estrellasMinimas: 4 } },
  // Pareja en temporada baja, solo playa. Limite: el presupuesto es EXACTO al precio de Caribe Total
  { nombre: "Pareja Diaz", adultos: 2, ninos: 0, mes: 10, presupuesto: 1560, requisitos: { incluye: ["desayuno"], estrellasMinimas: 3, destinos: ["playa"] } },
  // Viajera sola, requisitos estrictos -> ningun paquete cumple
  { nombre: "Sol Ramirez", adultos: 1, ninos: 0, mes: 12, presupuesto: 900, requisitos: { incluye: ["vuelo", "seguro"], estrellasMinimas: 4 } },
  // Invalido
  { nombre: "Grupo sin adultos", adultos: 0, ninos: 3, mes: 13, presupuesto: 2000, requisitos: { incluye: [], estrellasMinimas: 1 } },
];

// ===================== SALIDA POR CONSOLA =====================

function dinero(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function main(): void {
  console.log("====================== COMPARADOR DE TURISMO ======================");
  for (const g of grupos) {
    const personas: string = `${g.adultos} adulto(s)${g.ninos > 0 ? ` + ${g.ninos} nino(s)` : ""}`;
    console.log(`\n### ${g.nombre}: ${personas}, mes ${g.mes}, presupuesto ${dinero(g.presupuesto)}`);

    const errores: string[] = validarGrupo(g);
    if (errores.length > 0) {
      errores.forEach((e: string): void => console.log(`  X ${e}`));
      continue;
    }

    const { opciones, descartes } = comparar(paquetes, g);
    console.log(`  Temporada: ${temporadaDe(g.mes)} (+${RECARGO_TEMPORADA[temporadaDe(g.mes)] * 100}%)`);
    if (opciones.length === 0) {
      console.log("  Ningun paquete cumple los requisitos.");
    }
    opciones.forEach((c: Cotizacion, i: number): void => {
      const p: Paquete = c.paquete;
      const desc: string = c.descuentoGrupo > 0 ? ` - grupo ${dinero(c.descuentoGrupo)}` : "";
      console.log(`  ${i + 1}. ${p.nombre.padEnd(22)} ${p.hotel.estrellas}* ${p.hotel.noches}n | ${dinero(c.subtotal)}${desc} = ${dinero(c.total)} | ${dinero(c.porPersonaNoche)}/persona-noche | puntaje ${c.puntaje.toFixed(1)}`);
    });
    descartes.forEach((d): void => console.log(`  - ${d.paquete.nombre}: ${d.motivo}`));

    const [mejor] = opciones;
    if (mejor !== undefined) {
      console.log(`  Recomendado: ${mejor.paquete.nombre} (${mejor.paquete.destino.ciudad}); sobran ${dinero(g.presupuesto - mejor.total)}`);
    }
  }
}

main();
