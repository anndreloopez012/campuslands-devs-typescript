export {};

// 17. Pedidos de food truck
// Tematica: comida
// Enfoque: objetos anidados, filtros, reduce y validaciones
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise17Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise17Guide = {
  id: 17,
  title: "Pedidos de food truck",
  difficulty: 'intermedio',
  topic: "comida",
  focus: "objetos anidados, filtros, reduce y validaciones",
  concepts: ["arrays tipados","map","filter","sort"] as const,
  checklist: ["Modela el dominio de comida con tipos e interfaces claras.","Crea datos de prueba realistas para Pedidos de food truck.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa arrays tipados y map sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise17Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
