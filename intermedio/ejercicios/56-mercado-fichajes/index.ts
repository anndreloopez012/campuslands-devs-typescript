export {};

// 56. Mercado de fichajes futbol
// Tematica: futbol
// Enfoque: async/await, errores, eventos tipados y datos remotos simulados
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise56Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise56Guide = {
  id: 56,
  title: "Mercado de fichajes futbol",
  difficulty: 'intermedio',
  topic: "futbol",
  focus: "async/await, errores, eventos tipados y datos remotos simulados",
  concepts: ["async/await","Promise","try/catch","errores tipados"] as const,
  checklist: ["Modela el dominio de futbol con tipos e interfaces claras.","Crea datos de prueba realistas para Mercado de fichajes futbol.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa async/await y Promise sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise56Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
