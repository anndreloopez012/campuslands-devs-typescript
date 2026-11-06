// Solución Ejercicio Intermedio 45 - Stefani Sánchez
export {};

type EstadoSalto = "completado" | "abortado";

interface RegistroSalto {
  readonly numero: number;
  readonly fecha: string;
  readonly alturaPies: number;
  readonly caidaLibreSeg: number;
  readonly estado: EstadoSalto;
}

const SALTOS_PARA_LICENCIA_A = 25;

const log: readonly RegistroSalto[] = [
  { numero: 1, fecha: "2026-01-12", alturaPies: 10000, caidaLibreSeg: 45, estado: "completado" },
  { numero: 2, fecha: "2026-01-12", alturaPies: 9500, caidaLibreSeg: 40, estado: "completado" },
  { numero: 3, fecha: "2026-01-26", alturaPies: 12500, caidaLibreSeg: 0, estado: "abortado" },
  { numero: 4, fecha: "2026-02-09", alturaPies: 12500, caidaLibreSeg: 55, estado: "completado" },
  { numero: 5, fecha: "2026-02-09", alturaPies: 13000, caidaLibreSeg: 58, estado: "completado" },
  { numero: 6, fecha: "2026-02-23", alturaPies: 13000, caidaLibreSeg: 60, estado: "completado" },
  { numero: 7, fecha: "2026-03-08", alturaPies: 14000, caidaLibreSeg: 62, estado: "completado" },
  { numero: 8, fecha: "2026-03-40", alturaPies: 14000, caidaLibreSeg: 60, estado: "completado" },
  { numero: 9, fecha: "2026-03-15", alturaPies: -100, caidaLibreSeg: 30, estado: "completado" },
];

const esRegistroValido = (r: RegistroSalto): boolean => {
  const d = new Date(`${r.fecha}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && r.alturaPies > 0 && r.caidaLibreSeg >= 0;
};

interface ResumenMes {
  saltos: number;
  completados: number;
  segundos: number;
}

const resumirPorMes = (items: readonly RegistroSalto[]): Map<string, ResumenMes> =>
  items.reduce((mapa, r) => {
    const mes = r.fecha.slice(0, 7);
    const previo = mapa.get(mes) ?? { saltos: 0, completados: 0, segundos: 0 };
    mapa.set(mes, {
      saltos: previo.saltos + 1,
      completados: previo.completados + (r.estado === "completado" ? 1 : 0),
      segundos: previo.segundos + r.caidaLibreSeg,
    });
    return mapa;
  }, new Map<string, ResumenMes>());

const validos = log.filter(esRegistroValido);
const invalidos = log.filter((r) => !esRegistroValido(r));
const completados = validos.filter((r) => r.estado === "completado");
const segundosTotales = completados.reduce((acc, r) => acc + r.caidaLibreSeg, 0);
const alturaMaxima = Math.max(...completados.map((r) => r.alturaPies));

console.log("Ejercicio 45: Log avanzado de saltos");
console.log(`Registros validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((r) => console.log(`  - Salto #${r.numero} (${r.fecha}) tiene datos invalidos`));
resumirPorMes(validos).forEach((m, mes) =>
  console.log(`  ${mes}: ${m.saltos} salto(s), ${m.completados} completado(s), ${m.segundos} s de caida libre`),
);
console.log(`Saltos completados: ${completados.length} | caida libre total: ${segundosTotales} s | altura maxima: ${alturaMaxima} ft`);
console.log(`Progreso a licencia A: ${completados.length}/${SALTOS_PARA_LICENCIA_A} (${Math.round((completados.length / SALTOS_PARA_LICENCIA_A) * 100)}%)`);
