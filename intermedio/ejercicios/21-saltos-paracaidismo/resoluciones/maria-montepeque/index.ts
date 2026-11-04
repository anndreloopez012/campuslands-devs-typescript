export {};

type TipoSalto = "tandem" | "solo" | "formacion";

interface Salto {
  readonly id: number;
  readonly saltador: string;
  readonly tipo: TipoSalto;
  readonly alturaPies: number;
  readonly caidaLibreSegundos: number;
}

const alturaMinimaPorTipo: Record<TipoSalto, number> = {
  tandem: 10000,
  solo: 4000,
  formacion: 12000,
};

const saltos: readonly Salto[] = [
  { id: 1, saltador: "Marta", tipo: "tandem", alturaPies: 13000, caidaLibreSegundos: 55 },
  { id: 2, saltador: "Luis", tipo: "solo", alturaPies: 5000, caidaLibreSegundos: 20 },
  { id: 3, saltador: "Marta", tipo: "formacion", alturaPies: 13500, caidaLibreSegundos: 60 },
  { id: 4, saltador: "Pablo", tipo: "solo", alturaPies: 3000, caidaLibreSegundos: 10 },
  { id: 5, saltador: "Ines", tipo: "tandem", alturaPies: 12000, caidaLibreSegundos: 50 },
  { id: 6, saltador: "", tipo: "solo", alturaPies: 5000, caidaLibreSegundos: 25 },
  { id: 7, saltador: "Luis", tipo: "solo", alturaPies: 6000, caidaLibreSegundos: -3 },
];

const esSaltoValido = (salto: Salto): boolean =>
  salto.saltador.trim().length > 0 &&
  salto.alturaPies >= alturaMinimaPorTipo[salto.tipo] &&
  salto.caidaLibreSegundos >= 0;

const contarPorTipo = (items: readonly Salto[]): Map<TipoSalto, number> =>
  items.reduce((mapa, salto) => {
    mapa.set(salto.tipo, (mapa.get(salto.tipo) ?? 0) + 1);
    return mapa;
  }, new Map<TipoSalto, number>());

const validos = saltos.filter(esSaltoValido);
const invalidos = saltos.filter((salto) => !esSaltoValido(salto));
const saltadores = new Set(validos.map((salto) => salto.saltador));
const segundosTotales = validos.reduce((acc, s) => acc + s.caidaLibreSegundos, 0);

console.log("Ejercicio 21: Bitacora de paracaidismo");
console.log(`Saltos validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((salto) => console.log(`  - #${salto.id} (${salto.tipo}) no cumple las reglas`));
contarPorTipo(validos).forEach((cantidad, tipo) => console.log(`  ${tipo}: ${cantidad} salto(s)`));
console.log(`Saltadores unicos: ${Array.from(saltadores).join(", ")}`);
console.log(`Caida libre acumulada: ${segundosTotales} s`);
