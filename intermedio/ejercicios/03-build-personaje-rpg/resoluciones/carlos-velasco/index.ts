export {};

// tipos
type Clase = 'guerrero' | 'mago' | 'arquero' | 'clerigo';
type Atributo = 'fuerza' | 'inteligencia' | 'agilidad' | 'vitalidad';

interface Personaje {
  readonly nombre: string;
  clase: Clase;
  readonly nivel: number;
  puntosRestantes: number;
  atributos: Record<Atributo, number>;
}

// datos
const limiteAtributo = 15;
const personajes: Personaje[] = [
  { nombre: 'Velas', clase: 'guerrero', nivel: 12, puntosRestantes: 8, atributos: { fuerza: 11, inteligencia: 4, agilidad: 6, vitalidad: 9 } },
  { nombre: 'Liria', clase: 'mago', nivel: 10, puntosRestantes: 5, atributos: { fuerza: 3, inteligencia: 12, agilidad: 7, vitalidad: 5 } },
  { nombre: 'Kan', clase: 'arquero', nivel: 9, puntosRestantes: 0, atributos: { fuerza: 6, inteligencia: 5, agilidad: 12, vitalidad: 6 } },
];

// validacion
function validarPersonaje(personaje: Personaje): string[] {
  const errores: string[] = [];

  (Object.keys(personaje.atributos) as Atributo[]).forEach((atributo) => {
    const valor = personaje.atributos[atributo];
    if (valor < 1) errores.push(`${personaje.nombre}: ${atributo} menor a 1`);
    if (valor > limiteAtributo) errores.push(`${personaje.nombre}: ${atributo} supera el limite de ${limiteAtributo}`);
  });

  if (personaje.puntosRestantes < 0) errores.push(`${personaje.nombre}: puntos negativos`);

  return errores;
}

// acciones
function asignarPunto(personaje: Personaje, atributo: Atributo): boolean {
  const valorActual = personaje.atributos[atributo];

  if (personaje.puntosRestantes === 0 || valorActual >= limiteAtributo) return false;

  personaje.atributos[atributo] = valorActual + 1;
  personaje.puntosRestantes -= 1;
  return true;
}

// calculos
function poderTotal(personaje: Personaje): number {
  const baseClase: Record<Clase, Atributo> = {
    guerrero: 'fuerza',
    mago: 'inteligencia',
    arquero: 'agilidad',
    clerigo: 'vitalidad',
  };

  const atributoClave = baseClase[personaje.clase];
  return Object.values(personaje.atributos).reduce((total, valor) => total + valor, 0) + personaje.atributos[atributoClave];
}

function resumenAtributos(personaje: Personaje): string {
  return Object.entries(personaje.atributos).map(([clave, valor]) => `${clave}: ${valor}`).join(' | ');
}

// salida
function mostrarResumen(personajes: Personaje[]): void {
  console.log('=== Builder de personaje RPG ===');
  personajes.forEach((personaje) => {
    const errores = validarPersonaje(personaje);
    console.log(`${personaje.nombre} (${personaje.clase}, nivel ${personaje.nivel}) | ${resumenAtributos(personaje)} | Poder: ${poderTotal(personaje)}`);
    if (errores.length > 0) console.log(`Errores: ${errores.join('; ')}`);
  });

  const asigno = asignarPunto(personajes[0], 'fuerza');
  console.log(`Asignacion de punto a ${personajes[0].nombre}: ${asigno ? 'aplicada' : 'rechazada'}`);
}

mostrarResumen(personajes);
