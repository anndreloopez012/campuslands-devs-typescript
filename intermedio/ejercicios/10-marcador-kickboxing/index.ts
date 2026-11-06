export {};

// 10. Marcador de kickboxing
// Tematica: kickboxing
// Enfoque: interfaces, arrays tipados, funciones puras y rankings
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise10Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise10Guide = {
  id: 10,
  title: "Marcador de kickboxing",
  difficulty: 'intermedio',
  topic: "kickboxing",
  focus: "interfaces, arrays tipados, funciones puras y rankings",
  concepts: ["interface","type alias","readonly","funciones tipadas"] as const,
  checklist: ["Modela el dominio de kickboxing con tipos e interfaces claras.","Crea datos de prueba realistas para Marcador de kickboxing.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa interface y type alias sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise10Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
