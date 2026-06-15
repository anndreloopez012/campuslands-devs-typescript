export {};

// 79. Visor de assets 3D
// Tematica: pingpong
// Enfoque: mini sistemas integradores, persistencia simulada y arquitectura simple
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise79Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise79Guide = {
  id: 79,
  title: "Visor de assets 3D",
  difficulty: 'intermedio',
  topic: "pingpong",
  focus: "mini sistemas integradores, persistencia simulada y arquitectura simple",
  concepts: ["arquitectura simple","DTO","repositorio en memoria","reportes"] as const,
  checklist: ["Modela el dominio de pingpong con tipos e interfaces claras.","Crea datos de prueba realistas para Visor de assets 3D.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa arquitectura simple y DTO sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise79Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
