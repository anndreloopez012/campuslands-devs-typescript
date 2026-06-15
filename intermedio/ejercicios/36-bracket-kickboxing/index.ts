export {};

// 36. Bracket de kickboxing
// Tematica: kickboxing
// Enfoque: clases basicas, generics, scoring y simulaciones
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise36Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise36Guide = {
  id: 36,
  title: "Bracket de kickboxing",
  difficulty: 'intermedio',
  topic: "kickboxing",
  focus: "clases basicas, generics, scoring y simulaciones",
  concepts: ["union types","literal types","type guards","validacion"] as const,
  checklist: ["Modela el dominio de kickboxing con tipos e interfaces claras.","Crea datos de prueba realistas para Bracket de kickboxing.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa union types y literal types sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise36Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
