export {};

// Ejercicio 08: Union Types y Discriminated Unions
// Contexto: Vehículos Deportivos e Hiperdeportivos

type AutoCombustion = {
  tipoPropulsion: "combustion";
  marca: string;
  modelo: string;
  potenciaHp: number;
  cilindradaLitros: number;
  capacidadTanqueLitros: number;
};

type AutoElectrico = {
  tipoPropulsion: "electrico";
  marca: string;
  modelo: string;
  potenciaHp: number;
  capacidadBateriaKwh: number;
  autonomiaKm: number;
};

type AutoHibrido = {
  tipoPropulsion: "hibrido";
  marca: string;
  modelo: string;
  potenciaHp: number;
  capacidadBateriaKwh: number;
  capacidadTanqueLitros: number;
};

type Hiperdeportivo = AutoCombustion | AutoElectrico | AutoHibrido;

function describirVehiculo(vehiculo: Hiperdeportivo): string {
  switch (vehiculo.tipoPropulsion) {
    case "combustion":
      return `[Combustión] ${vehiculo.marca} ${vehiculo.modelo} | ${vehiculo.potenciaHp} HP | Motor V${vehiculo.cilindradaLitros}L | Tanque: ${vehiculo.capacidadTanqueLitros}L`;
    case "electrico":
      return `[Eléctrico Puro] ${vehiculo.marca} ${vehiculo.modelo} | ${vehiculo.potenciaHp} HP | Batería: ${vehiculo.capacidadBateriaKwh} kWh | Autonomía: ${vehiculo.autonomiaKm} km`;
    case "hibrido":
      return `[Híbrido] ${vehiculo.marca} ${vehiculo.modelo} | ${vehiculo.potenciaHp} HP | Tanque: ${vehiculo.capacidadTanqueLitros}L + Batería ${vehiculo.capacidadBateriaKwh} kWh`;
  }
}

const garajeStefani: Hiperdeportivo[] = [
  { tipoPropulsion: "combustion", marca: "Porsche", modelo: "911 GT3 RS", potenciaHp: 525, cilindradaLitros: 4.0, capacidadTanqueLitros: 64 },
  { tipoPropulsion: "electrico", marca: "Rimac", modelo: "Nevera", potenciaHp: 1914, capacidadBateriaKwh: 120, autonomiaKm: 490 },
  { tipoPropulsion: "hibrido", marca: "Ferrari", modelo: "SF90 Stradale", potenciaHp: 1000, capacidadBateriaKwh: 7.9, capacidadTanqueLitros: 68 }
];

console.log("=== GARAJE DE HIPERDEPORTIVOS ===");
garajeStefani.forEach((v) => console.log(describirVehiculo(v)));
