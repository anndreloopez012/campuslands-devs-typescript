export {};

interface FichaAutoPremium {
  readonly marca: string;
  readonly modelo: string;
  readonly potenciaHp: number;
  readonly velocidadPuntaKmH: number;
  readonly aceleracion0a100: number; // en segundos
  readonly precioBaseUsd: number;
}

interface ComparacionResultado {
  readonly autoA: FichaAutoPremium;
  readonly autoB: FichaAutoPremium;
  readonly masRapidoPunta: string;
  readonly mejorAceleracion: string;
  readonly mayorPotencia: string;
}

async function compararHiperdeportivos(
  auto1: FichaAutoPremium,
  auto2: FichaAutoPremium
): Promise<ComparacionResultado> {
  await new Promise((resolve) => setTimeout(resolve, 15));

  const masRapido = auto1.velocidadPuntaKmH >= auto2.velocidadPuntaKmH ? `${auto1.marca} ${auto1.modelo}` : `${auto2.marca} ${auto2.modelo}`;
  const aceleracion = auto1.aceleracion0a100 <= auto2.aceleracion0a100 ? `${auto1.marca} ${auto1.modelo}` : `${auto2.marca} ${auto2.modelo}`;
  const potencia = auto1.potenciaHp >= auto2.potenciaHp ? `${auto1.marca} ${auto1.modelo}` : `${auto2.marca} ${auto2.modelo}`;

  return {
    autoA: auto1,
    autoB: auto2,
    masRapidoPunta: masRapido,
    mejorAceleracion: aceleracion,
    mayorPotencia: potencia,
  };
}

async function main() {
  console.log("=== COMPARADOR DE AUTOS PREMIUM ASINCRONO ===");

  const porsche: FichaAutoPremium = {
    marca: "Porsche",
    modelo: "911 GT3 RS",
    potenciaHp: 525,
    velocidadPuntaKmH: 296,
    aceleracion0a100: 3.2,
    precioBaseUsd: 241000,
  };

  const ferrari: FichaAutoPremium = {
    marca: "Ferrari",
    modelo: "296 GTB",
    potenciaHp: 830,
    velocidadPuntaKmH: 330,
    aceleracion0a100: 2.9,
    precioBaseUsd: 320000,
  };

  const comp = await compararHiperdeportivos(porsche, ferrari);
  console.log(`Comparativa: ${porsche.marca} ${porsche.modelo} vs ${ferrari.marca} ${ferrari.modelo}`);
  console.log(`- Mayor velocidad punta: ${comp.masRapidoPunta}`);
  console.log(`- Mejor aceleracion 0-100 km/h: ${comp.mejorAceleracion}`);
  console.log(`- Mayor caballaje: ${comp.mayorPotencia}`);
}

main();
