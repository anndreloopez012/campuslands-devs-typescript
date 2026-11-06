export {};

// 70. Terminal sci-fi
// Tematica: ciencia ficcion
// Enfoque: reducers, state machines, unions discriminadas y reglas de interfaz
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise70Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise70Guide = {
  id: 70,
  title: "Terminal sci-fi",
  difficulty: 'intermedio',
  topic: "ciencia ficcion",
  focus: "reducers, state machines, unions discriminadas y reglas de interfaz",
  concepts: ["discriminated unions","reducers","state machine","eventos"] as const,
  checklist: ["Modela el dominio de ciencia ficcion con tipos e interfaces claras.","Crea datos de prueba realistas para Terminal sci-fi.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa discriminated unions y reducers sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise70Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
