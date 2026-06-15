export {};

// 46. Catalogo de estilos tattoo
// Tematica: tatuajes
// Enfoque: fechas, estados, reportes y agrupacion de datos
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise46Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise46Guide = {
  id: 46,
  title: "Catalogo de estilos tattoo",
  difficulty: 'intermedio',
  topic: "tatuajes",
  focus: "fechas, estados, reportes y agrupacion de datos",
  concepts: ["clases","generics","encapsulamiento","servicios"] as const,
  checklist: ["Modela el dominio de tatuajes con tipos e interfaces claras.","Crea datos de prueba realistas para Catalogo de estilos tattoo.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa clases y generics sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise46Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
