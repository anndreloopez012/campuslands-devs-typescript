export {};

// 35. Estrategia de pit stop
// Tematica: carreras
// Enfoque: clases basicas, generics, scoring y simulaciones
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise35Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise35Guide = {
  id: 35,
  title: "Estrategia de pit stop",
  difficulty: 'intermedio',
  topic: "carreras",
  focus: "clases basicas, generics, scoring y simulaciones",
  concepts: ["union types","literal types","type guards","validacion"] as const,
  checklist: ["Modela el dominio de carreras con tipos e interfaces claras.","Crea datos de prueba realistas para Estrategia de pit stop.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa union types y literal types sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise35Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
