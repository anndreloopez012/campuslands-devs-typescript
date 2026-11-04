export {};

type EstiloTatuaje = "realismo" | "tradicional" | "minimalista" | "acuarela";
type EstadoSesion = "reservada" | "completada" | "cancelada";

interface Sesion {
  readonly id: number;
  readonly cliente: string;
  readonly artista: string;
  readonly fecha: string;
  readonly estilo: EstiloTatuaje;
  readonly horas: number;
  readonly estado: EstadoSesion;
}

const tarifaPorHora: Record<EstiloTatuaje, number> = {
  realismo: 90,
  tradicional: 70,
  minimalista: 50,
  acuarela: 80,
};

const sesiones: readonly Sesion[] = [
  { id: 1, cliente: "Andrea", artista: "Kiko", fecha: "2026-03-10", estilo: "realismo", horas: 4, estado: "completada" },
  { id: 2, cliente: "Bruno", artista: "Kiko", fecha: "2026-03-11", estilo: "tradicional", horas: 3, estado: "reservada" },
  { id: 3, cliente: "Carla", artista: "Mara", fecha: "2026-03-11", estilo: "minimalista", horas: 1, estado: "completada" },
  { id: 4, cliente: "Andrea", artista: "Mara", fecha: "2026-03-12", estilo: "acuarela", horas: 2, estado: "cancelada" },
  { id: 5, cliente: "Dario", artista: "Kiko", fecha: "2026-03-11", estilo: "minimalista", horas: 2, estado: "reservada" },
  { id: 6, cliente: "Elena", artista: "Mara", fecha: "2026-03-13", estilo: "realismo", horas: 12, estado: "reservada" },
];

const esSesionValida = (sesion: Sesion): boolean =>
  sesion.cliente.trim().length > 0 && sesion.horas >= 1 && sesion.horas <= 8;

const detectarChoques = (items: readonly Sesion[]): Sesion[] => {
  const vistos = new Set<string>();
  return items.filter((sesion) => {
    if (sesion.estado === "cancelada") return false;
    const clave = `${sesion.artista}|${sesion.fecha}`;
    if (vistos.has(clave)) return true;
    vistos.add(clave);
    return false;
  });
};

const costoSesion = (sesion: Sesion): number => tarifaPorHora[sesion.estilo] * sesion.horas;

const validas = sesiones.filter(esSesionValida);
const invalidas = sesiones.filter((sesion) => !esSesionValida(sesion));
const choques = detectarChoques(validas);
const ingresos = validas
  .filter((sesion) => sesion.estado === "completada")
  .reduce((acc, sesion) => acc + costoSesion(sesion), 0);
const porEstado = validas.reduce((mapa, s) => mapa.set(s.estado, (mapa.get(s.estado) ?? 0) + 1), new Map<EstadoSesion, number>());

console.log("Ejercicio 22: Agenda de tatuajes");
console.log(`Sesiones validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((s) => console.log(`  - #${s.id} con ${s.horas} hora(s) fuera de rango`));
choques.forEach((s) => console.log(`  ! #${s.id} choca con otra sesion de ${s.artista} el ${s.fecha}`));
porEstado.forEach((cantidad, estado) => console.log(`  ${estado}: ${cantidad}`));
console.log(`Ingresos de sesiones completadas: $${ingresos}`);
