// Simula la carga inicial de datos desde una fuente externa 

import type { PersonajeRPG } from "./maria-montepeque-15-types.js";

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function cargarPersonajesIniciales(): Promise<PersonajeRPG[]> {
  await esperar(120);

  return [
    {
      id: "P-01",
      nombre: "Lyra",
      clase: "Maga",
      nivel: 8,
      puntosVida: 90,
      inventario: [{ nombre: "Bastón arcano", rareza: "Epico", poderBase: 40 }],
    },
    {
      id: "P-02",
      nombre: "Roth",
      clase: "Guerrero",
      nivel: 11,
      puntosVida: 145,
      inventario: [
        { nombre: "Espada pesada", rareza: "Raro", poderBase: 35 },
        { nombre: "Escudo", rareza: "Comun", poderBase: 15 },
      ],
    },
    {
      id: "P-03",
      nombre: "Sena",
      clase: "Arquera",
      nivel: 7,
      puntosVida: 95,
      inventario: [{ nombre: "Arco compuesto", rareza: "Raro", poderBase: 30 }],
    },
  ];
}
