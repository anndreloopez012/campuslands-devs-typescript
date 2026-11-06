export {};

// 25. Revision de renders arquitectura
// Tematica: diseno 3D arquitectura
// Enfoque: union types, Record, Map, Set y reglas de negocio
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise25Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise25Guide = {
  id: 25,
  title: "Revision de renders arquitectura",
  difficulty: 'intermedio',
  topic: "diseno 3D arquitectura",
  focus: "union types, Record, Map, Set y reglas de negocio",
  concepts: ["reduce","Record","Map","agrupacion"] as const,
  checklist: ["Modela el dominio de diseno 3D arquitectura con tipos e interfaces claras.","Crea datos de prueba realistas para Revision de renders arquitectura.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa reduce y Record sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise25Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
