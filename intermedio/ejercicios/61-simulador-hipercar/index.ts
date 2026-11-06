export {};

// 61. Simulador de aceleracion hypercar
// Tematica: autos, autos de lujo y vehiculos hiperdeportivos
// Enfoque: reducers, state machines, unions discriminadas y reglas de interfaz
//
// Archivo base de lectura. No entregues tu solucion modificando este archivo.
// Crea tu respuesta dentro de resoluciones/nombre-apellido/.

type Difficulty = 'intermedio';

type Exercise61Guide = {
  readonly id: number;
  readonly title: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly focus: string;
  readonly concepts: readonly string[];
  readonly checklist: readonly string[];
};

const guide: Exercise61Guide = {
  id: 61,
  title: "Simulador de aceleracion hypercar",
  difficulty: 'intermedio',
  topic: "autos, autos de lujo y vehiculos hiperdeportivos",
  focus: "reducers, state machines, unions discriminadas y reglas de interfaz",
  concepts: ["discriminated unions","reducers","state machine","eventos"] as const,
  checklist: ["Modela el dominio de autos, autos de lujo y vehiculos hiperdeportivos con tipos e interfaces claras.","Crea datos de prueba realistas para Simulador de aceleracion hypercar.","Implementa funciones separadas para validar, transformar y calcular resultados.","Usa discriminated unions y reducers sin recurrir a any.","Muestra un resumen final que permita revisar si la solucion cumple el objetivo."] as const,
};

function printGuide(exercise: Exercise61Guide): void {
  console.log(`Ejercicio ${exercise.id}: ${exercise.title}`);
  console.log(`Tematica: ${exercise.topic}`);
  console.log(`Enfoque: ${exercise.focus}`);
  console.log('Checklist:');

  exercise.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

printGuide(guide);
