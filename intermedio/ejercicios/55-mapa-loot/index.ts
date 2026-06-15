export {};

// 55. Mapa de loot battle royale
// Tematica: videojuegos battle royale
// Enfoque: async/await, errores, eventos tipados y datos remotos simulados
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise55Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise55Guide = {
  id: 55,
  title: "Mapa de loot battle royale",
  difficulty: 'intermedio',
  topic: "videojuegos battle royale",
  focus: "async/await, errores, eventos tipados y datos remotos simulados",
  concepts: ["async/await","Promise","try/catch","errores tipados"] as const,
  checklist: ["Modela el dominio de videojuegos battle royale con tipos e interfaces claras.","Crea datos de prueba realistas para Mapa de loot battle royale.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa async/await y Promise sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise55Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
