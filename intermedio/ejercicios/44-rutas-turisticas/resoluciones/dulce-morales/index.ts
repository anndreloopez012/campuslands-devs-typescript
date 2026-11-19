export {};

// Intermedio 44: Rutas turisticas inteligentes
// Tematica: turismo
// Resolucion: Dulce Morales
//
// Problema: un turista tiene un dia libre en la ciudad y una lista de lugares que quiere visitar.
// Cada lugar tiene horario, tiempo de visita y prioridad. Un planificador arma la ruta caminando
// desde el hotel: en cada paso elige el lugar que conviene mas (prioridad alta y cerca), espera si
// llega antes de que abra, descarta lugares que cierran antes de poder terminar la visita, mete
// una pausa para almorzar y vuelve al hotel antes de la hora limite.

// ===================== TIPOS =====================

type Categoria = "museo" | "mirador" | "mercado" | "parque" | "iglesia";
type Prioridad = 1 | 2 | 3; // 3 = imperdible

interface Punto {
  readonly x: number; // km
  readonly y: number; // km
}

interface Lugar {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly ubicacion: Punto;
  readonly abre: number; // minutos desde medianoche
  readonly cierra: number;
  readonly visitaMin: number;
  readonly prioridad: Prioridad;
}

type Paso =
  | { readonly tipo: "visita"; readonly lugar: Lugar; readonly llegada: Date; readonly inicio: Date; readonly fin: Date; readonly km: number }
  | { readonly tipo: "almuerzo"; readonly inicio: Date; readonly fin: Date }
  | { readonly tipo: "regreso"; readonly llegada: Date; readonly km: number };

// ===================== UTILIDADES =====================

const VELOCIDAD_KMH: number = 4;
const FECHA_BASE: Date = new Date(2026, 6, 15); // 15 de julio de 2026

function hm(h: number, m: number = 0): number {
  return h * 60 + m;
}

function aFecha(minutos: number): Date {
  return new Date(FECHA_BASE.getTime() + minutos * 60_000);
}

function hora(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function distanciaKm(a: Punto, b: Punto): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 100) / 100;
}

function minutosCaminando(km: number): number {
  return Math.round((km / VELOCIDAD_KMH) * 60);
}

// ===================== PLANIFICADOR =====================

interface ConfigDia {
  readonly hotel: Punto;
  readonly salida: number;
  readonly regresoMaximo: number;
  readonly almuerzoDesde: number; // la pausa se toma despues de esta hora
  readonly almuerzoMin: number;
}

class PlanificadorRuta {
  private readonly pendientes: Map<string, Lugar>;
  private readonly descartados: Map<string, string> = new Map();

  constructor(
    lugares: readonly Lugar[],
    private readonly config: ConfigDia,
  ) {
    this.pendientes = new Map(lugares.map((l: Lugar): [string, Lugar] => [l.id, l]));
  }

  // Puntaje: prioridad dividida entre el tiempo de traslado y espera (prefiere lo importante y cercano),
  // mas un bonus de urgencia si el lugar cierra en menos de 3 horas (para no perderlo)
  private puntaje(l: Lugar, desde: Punto, ahora: number): number {
    const llegada: number = ahora + minutosCaminando(distanciaKm(desde, l.ubicacion));
    const espera: number = Math.max(0, l.abre - llegada);
    const cercania: number = (l.prioridad ** 2 * 100) / (llegada - ahora + espera + 10);
    const urgencia: number = l.cierra - llegada < 180 ? l.prioridad * 10 : 0;
    return cercania + urgencia;
  }

  // Revisa si se puede visitar completo y aun volver al hotel a tiempo
  private factible(l: Lugar, desde: Punto, ahora: number): string | null {
    const llegada: number = ahora + minutosCaminando(distanciaKm(desde, l.ubicacion));
    const inicio: number = Math.max(llegada, l.abre);
    const fin: number = inicio + l.visitaMin;
    if (fin > l.cierra) return `cierra a las ${hora(aFecha(l.cierra))} y no da tiempo de terminar la visita`;
    const vuelta: number = fin + minutosCaminando(distanciaKm(l.ubicacion, this.config.hotel));
    if (vuelta > this.config.regresoMaximo) return `no alcanza a volver al hotel antes de las ${hora(aFecha(this.config.regresoMaximo))}`;
    return null;
  }

  planear(): { pasos: Paso[]; descartados: [string, string][] } {
    const pasos: Paso[] = [];
    let ahora: number = this.config.salida;
    let posicion: Punto = this.config.hotel;
    let almorzo: boolean = false;

    while (this.pendientes.size > 0) {
      if (!almorzo && ahora >= this.config.almuerzoDesde) {
        pasos.push({ tipo: "almuerzo", inicio: aFecha(ahora), fin: aFecha(ahora + this.config.almuerzoMin) });
        ahora += this.config.almuerzoMin;
        almorzo = true;
      }
      const opciones: Lugar[] = [...this.pendientes.values()].filter((l: Lugar): boolean => this.factible(l, posicion, ahora) === null);
      if (opciones.length === 0) break;
      const elegido: Lugar | undefined = opciones.sort((a, b): number => this.puntaje(b, posicion, ahora) - this.puntaje(a, posicion, ahora))[0];
      if (elegido === undefined) break;

      const km: number = distanciaKm(posicion, elegido.ubicacion);
      const llegada: number = ahora + minutosCaminando(km);
      const inicio: number = Math.max(llegada, elegido.abre);
      const fin: number = inicio + elegido.visitaMin;
      pasos.push({ tipo: "visita", lugar: elegido, llegada: aFecha(llegada), inicio: aFecha(inicio), fin: aFecha(fin), km });
      this.pendientes.delete(elegido.id);
      ahora = fin;
      posicion = elegido.ubicacion;
    }

    // Lo que quedo pendiente se descarta con su motivo
    for (const l of this.pendientes.values()) {
      this.descartados.set(l.nombre, this.factible(l, posicion, ahora) ?? "no hubo tiempo en el dia");
    }
    const kmVuelta: number = distanciaKm(posicion, this.config.hotel);
    pasos.push({ tipo: "regreso", llegada: aFecha(ahora + minutosCaminando(kmVuelta)), km: kmVuelta });
    return { pasos, descartados: [...this.descartados.entries()] };
  }
}

// ===================== DATOS Y SALIDA =====================

const lugares: readonly Lugar[] = [
  { id: "L1", nombre: "Museo de Arte", categoria: "museo", ubicacion: { x: 1.2, y: 0.5 }, abre: hm(10), cierra: hm(18), visitaMin: 120, prioridad: 3 },
  { id: "L2", nombre: "Mercado Central", categoria: "mercado", ubicacion: { x: 0.4, y: -0.6 }, abre: hm(7), cierra: hm(14), visitaMin: 60, prioridad: 2 },
  { id: "L3", nombre: "Mirador del Cerro", categoria: "mirador", ubicacion: { x: 2.8, y: 2.0 }, abre: hm(6), cierra: hm(19), visitaMin: 45, prioridad: 3 },
  { id: "L4", nombre: "Catedral", categoria: "iglesia", ubicacion: { x: 0.2, y: 0.3 }, abre: hm(9), cierra: hm(12), visitaMin: 40, prioridad: 2 },
  { id: "L5", nombre: "Parque Botanico", categoria: "parque", ubicacion: { x: -1.5, y: 1.0 }, abre: hm(8), cierra: hm(17), visitaMin: 90, prioridad: 1 },
  { id: "L6", nombre: "Museo del Oro", categoria: "museo", ubicacion: { x: 1.0, y: -0.2 }, abre: hm(9), cierra: hm(15, 30), visitaMin: 90, prioridad: 3 },
  // Cierra muy temprano: solo abre de 8 a 9
  { id: "L7", nombre: "Feria de Flores", categoria: "mercado", ubicacion: { x: -2.5, y: -2.0 }, abre: hm(8), cierra: hm(9), visitaMin: 45, prioridad: 2 },
  { id: "L8", nombre: "Museo de Ciencias", categoria: "museo", ubicacion: { x: 3.5, y: -1.5 }, abre: hm(10), cierra: hm(16), visitaMin: 150, prioridad: 2 },
];

function main(): void {
  const config: ConfigDia = { hotel: { x: 0, y: 0 }, salida: hm(9), regresoMaximo: hm(19), almuerzoDesde: hm(12, 30), almuerzoMin: 60 };
  const { pasos, descartados } = new PlanificadorRuta(lugares, config).planear();

  console.log(`================ RUTA DEL DIA (sale del hotel ${hora(aFecha(config.salida))}, vuelve antes de ${hora(aFecha(config.regresoMaximo))}) ================`);
  let km: number = 0;
  for (const p of pasos) {
    switch (p.tipo) {
      case "visita": {
        km += p.km;
        const espera: string = p.inicio.getTime() > p.llegada.getTime() ? ` (espera hasta que abra a las ${hora(p.inicio)})` : "";
        console.log(`${hora(p.inicio)}-${hora(p.fin)} ${p.lugar.nombre.padEnd(18)} ${"*".repeat(p.lugar.prioridad).padEnd(3)} camina ${p.km.toFixed(2)} km, llega ${hora(p.llegada)}${espera}`);
        break;
      }
      case "almuerzo":
        console.log(`${hora(p.inicio)}-${hora(p.fin)} Almuerzo`);
        break;
      case "regreso":
        km += p.km;
        console.log(`${hora(p.llegada)}       Regreso al hotel (${p.km.toFixed(2)} km)`);
        break;
    }
  }
  const visitas = pasos.filter((p): p is Extract<Paso, { tipo: "visita" }> => p.tipo === "visita");
  console.log(`\nVisitados: ${visitas.length} de ${lugares.length} | caminado: ${km.toFixed(2)} km | imperdibles vistos: ${visitas.filter((v) => v.lugar.prioridad === 3).length} de ${lugares.filter((l) => l.prioridad === 3).length}`);
  console.log("No entraron:");
  descartados.forEach(([nombre, motivo]): void => console.log(`  - ${nombre}: ${motivo}`));
}

main();
