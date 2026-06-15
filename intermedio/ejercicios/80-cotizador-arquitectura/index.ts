export {};

// 80. Cotizador arquitectura 3D
// Tematica: diseno 3D arquitectura
// Enfoque: mini sistemas integradores, persistencia simulada y arquitectura simple
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise80Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise80Guide = {
  id: 80,
  title: "Cotizador arquitectura 3D",
  difficulty: 'intermedio',
  topic: "diseno 3D arquitectura",
  focus: "mini sistemas integradores, persistencia simulada y arquitectura simple",
  concepts: ["arquitectura simple","DTO","repositorio en memoria","reportes"] as const,
  checklist: ["Modela el dominio de diseno 3D arquitectura con tipos e interfaces claras.","Crea datos de prueba realistas para Cotizador arquitectura 3D.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa arquitectura simple y DTO sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise80Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
