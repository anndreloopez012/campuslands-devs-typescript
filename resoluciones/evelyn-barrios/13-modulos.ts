export {};

// Simulación de lógica de módulos (separando interfaz y funcionalidad)
interface Destino {
  ciudad: string;
  presupuesto: number;
}

const filtrarDestinos = (lista: Destino[], max: number): Destino[] => {
  return lista.filter((d) => d.presupuesto <= max);
};

const misViajes: Destino[] = [
  { ciudad: "Tokio", presupuesto: 1500 },
  { ciudad: "París", presupuesto: 2500 },
];
const posibles = filtrarDestinos(misViajes, 2000);
console.log("Destinos al alcance:", posibles);
