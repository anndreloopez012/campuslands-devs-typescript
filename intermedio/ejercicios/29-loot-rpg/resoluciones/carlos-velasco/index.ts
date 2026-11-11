export {};

// tipos
type RarezaLoot = 'comun' | 'raro' | 'epico' | 'legendario';
type FuenteLoot = 'cofre' | 'jefe' | 'mision' | 'mercader';

interface ObjetoLoot {
  readonly nombre: string;
  rareza: RarezaLoot;
  valorOro: number;
}

interface Recogida {
  readonly objeto: ObjetoLoot;
  readonly fuente: FuenteLoot;
  readonly sala: number;
}

// datos
const tablaLoot: ObjetoLoot[] = [
  { nombre: 'Pocion menor', rareza: 'comun', valorOro: 5 },
  { nombre: 'Espada oxidada', rareza: 'comun', valorOro: 12 },
  { nombre: 'Amuleto lobo', rareza: 'raro', valorOro: 60 },
  { nombre: 'Arco de ceniza', rareza: 'epico', valorOro: 180 },
  { nombre: 'Corona perdida', rareza: 'legendario', valorOro: 500 },
];

const recogidas: Recogida[] = [
  { objeto: tablaLoot[0], fuente: 'cofre', sala: 1 },
  { objeto: tablaLoot[1], fuente: 'mision', sala: 2 },
  { objeto: tablaLoot[2], fuente: 'jefe', sala: 3 },
  { objeto: tablaLoot[0], fuente: 'cofre', sala: 3 },
  { objeto: tablaLoot[4], fuente: 'jefe', sala: 5 },
  { objeto: tablaLoot[3], fuente: 'cofre', sala: -1 },
];

// reglas
const salaMinima = 1;

// validacion
function validarRecogida(recogida: Recogida): string[] {
  const errores: string[] = [];

  if (recogida.sala < salaMinima) errores.push(`Recogida en sala ${recogida.sala}: sala invalida`);
  if (recogida.objeto.valorOro < 0) errores.push(`${recogida.objeto.nombre}: valor de oro invalido`);

  return errores;
}

// calculos
function oroTotal(recogidas: Recogida[]): number {
  return recogidas
    .filter((recogida) => validarRecogida(recogida).length === 0)
    .reduce((total, recogida) => total + recogida.objeto.valorOro, 0);
}

function conteoPorRareza(recogidas: Recogida[]): Record<RarezaLoot, number> {
  return recogidas.reduce<Record<RarezaLoot, number>>((conteo, recogida) => {
    conteo[recogida.objeto.rareza] += 1;
    return conteo;
  }, { comun: 0, raro: 0, epico: 0, legendario: 0 });
}

function mejorFuente(recogidas: Recogida[]): FuenteLoot | null {
  const oroPorFuente = new Map<FuenteLoot, number>();
  recogidas
    .filter((recogida) => validarRecogida(recogida).length === 0)
    .forEach((recogida) => {
      oroPorFuente.set(recogida.fuente, (oroPorFuente.get(recogida.fuente) ?? 0) + recogida.objeto.valorOro);
    });

  let mejor: FuenteLoot | null = null;
  oroPorFuente.forEach((oro, fuente) => {
    if (mejor === null || oro > (oroPorFuente.get(mejor) ?? 0)) mejor = fuente;
  });

  return mejor;
}

// salida
function mostrarResumen(recogidas: Recogida[]): void {
  console.log('=== Sistema de loot RPG ===');
  console.log(`Oro acumulado: ${oroTotal(recogidas)}`);
  console.log('Loot por rareza:', conteoPorRareza(recogidas));
  console.log(`Mejor fuente de oro: ${mejorFuente(recogidas) ?? 'ninguna'}`);

  recogidas.forEach((recogida) => {
    const errores = validarRecogida(recogida);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(recogidas);
