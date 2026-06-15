export {};

// 33. Plan de mantenimiento moto
// Tematica: motos y mecanica de motos
// Enfoque: clases basicas, generics, scoring y simulaciones
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise33Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise33Guide = {
  id: 33,
  title: "Plan de mantenimiento moto",
  difficulty: 'intermedio',
  topic: "motos y mecanica de motos",
  focus: "clases basicas, generics, scoring y simulaciones",
  concepts: ["union types","literal types","type guards","validacion"] as const,
  checklist: ["Modela el dominio de motos y mecanica de motos con tipos e interfaces claras.","Crea datos de prueba realistas para Plan de mantenimiento moto.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa union types y literal types sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise33Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
