export {};

// Ejercicio 10: Generics
// Contexto: Inventario de videojuegos

// TODO: crea una funcion generica para buscar por id.
console.log("------------Ejercicio 10: Generics------------")

type ConId = { id: number };

function buscarPorId<T extends ConId>(inventario: T[], idBuscado: number): T | undefined {  
  for (let i = 0; i < inventario.length; i++) {
    if (inventario[i].id === idBuscado) {
      return inventario[i];
    }
  }
  return undefined;
}

type Videojuego = { id: number; titulo: string; plataforma: string };
type Periferico = { id: number; nombre: string; precio: number };

const listaJuegos: Videojuego[] = [
  { id: 101, titulo: "Zelda: TotK", plataforma: "Switch" },
  { id: 102, titulo: "Elden Ring", plataforma: "PS5" }
];

const listaPerifericos: Periferico[] = [
  { id: 501, nombre: "Control DualSense", precio: 70 },
  { id: 502, nombre: "Teclado Mecánico", precio: 120 }
];

const juegoEncontrado = buscarPorId(listaJuegos, 102);
if (juegoEncontrado) {
  console.log(`Juego encontrado: ${juegoEncontrado.titulo} para ${juegoEncontrado.plataforma}`);
}

const perifericoEncontrado = buscarPorId(listaPerifericos, 501);
if (perifericoEncontrado) {
  console.log(`Periférico encontrado: ${perifericoEncontrado.nombre} a $${perifericoEncontrado.precio}`);
}