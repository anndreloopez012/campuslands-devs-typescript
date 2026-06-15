export {};

// 50. Inspeccion visual soldadura
// Tematica: soldadura
// Enfoque: fechas, estados, reportes y agrupacion de datos
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise50Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise50Guide = {
  id: 50,
  title: "Inspeccion visual soldadura",
  difficulty: 'intermedio',
  topic: "soldadura",
  focus: "fechas, estados, reportes y agrupacion de datos",
  concepts: ["clases","generics","encapsulamiento","servicios"] as const,
  checklist: ["Modela el dominio de soldadura con tipos e interfaces claras.","Crea datos de prueba realistas para Inspeccion visual soldadura.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa clases y generics sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise50Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
