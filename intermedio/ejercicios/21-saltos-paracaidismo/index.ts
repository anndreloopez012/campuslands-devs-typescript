export {};

// 21. Bitacora de paracaidismo
// Tematica: paracaidismo
// Enfoque: union types, Record, Map, Set y reglas de negocio
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise21Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise21Guide = {
  id: 21,
  title: "Bitacora de paracaidismo",
  difficulty: 'intermedio',
  topic: "paracaidismo",
  focus: "union types, Record, Map, Set y reglas de negocio",
  concepts: ["reduce","Record","Map","agrupacion"] as const,
  checklist: ["Modela el dominio de paracaidismo con tipos e interfaces claras.","Crea datos de prueba realistas para Bitacora de paracaidismo.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa reduce y Record sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise21Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
