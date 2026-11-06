export {};

// 15. Analizador de sagas sci-fi
// Tematica: ciencia ficcion
// Enfoque: objetos anidados, filtros, reduce y validaciones
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise15Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise15Guide = {
  id: 15,
  title: "Analizador de sagas sci-fi",
  difficulty: 'intermedio',
  topic: "ciencia ficcion",
  focus: "objetos anidados, filtros, reduce y validaciones",
  concepts: ["arrays tipados","map","filter","sort"] as const,
  checklist: ["Modela el dominio de ciencia ficcion con tipos e interfaces claras.","Crea datos de prueba realistas para Analizador de sagas sci-fi.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa arrays tipados y map sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise15Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
