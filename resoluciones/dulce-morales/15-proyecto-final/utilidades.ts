// Ejercicio 15 - Funciones reutilizables (generics, validacion y calculos)
// Resolucion: Dulce Morales

import { CLASES, MULTIPLICADOR_RAREZA, Rareza } from "./tipos";
import type { ClasePersonaje, ConId, ItemEquipo, Personaje } from "./tipos";

// Generic: sirve para buscar personajes, items o cualquier cosa con `id`
export function buscarPorId<T extends ConId>(elementos: readonly T[], id: string): T | undefined {
  return elementos.find((elemento: T): boolean => elemento.id === id);
}

// Generic: agrupa cualquier lista por una clave calculada
export function agruparPor<T, K extends string>(elementos: readonly T[], obtenerClave: (elemento: T) => K): Map<K, T[]> {
  const grupos: Map<K, T[]> = new Map<K, T[]>();
  for (const elemento of elementos) {
    const clave: K = obtenerClave(elemento);
    const grupo: T[] = grupos.get(clave) ?? [];
    grupo.push(elemento);
    grupos.set(clave, grupo);
  }
  return grupos;
}

// Simula latencia (por ejemplo, leer de un servidor)
export function esperar(milisegundos: number): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, milisegundos);
  });
}

// Type guards: convierten texto del JSON en tipos seguros sin usar casteos
export function esClaseValida(valor: string): valor is ClasePersonaje {
  return CLASES.some((clase: ClasePersonaje): boolean => clase === valor);
}

export function esRarezaValida(valor: string): valor is Rareza {
  return Object.values(Rareza).some((rareza: Rareza): boolean => rareza === valor);
}

export function esNivelValido(nivel: number): boolean {
  return Number.isInteger(nivel) && nivel >= 1;
}

// Reto extra: poder de un item segun su rareza
export function poderDeItem(item: ItemEquipo): number {
  return Math.round(item.poderBase * MULTIPLICADOR_RAREZA[item.rareza]);
}

// Reto extra: poder total = nivel + vida + equipo
export function calcularPoderTotal(personaje: Personaje): number {
  const poderEquipo: number = personaje.inventario.reduce(
    (total: number, item: ItemEquipo): number => total + poderDeItem(item),
    0,
  );
  return personaje.nivel * 10 + Math.round(personaje.puntosVida / 2) + poderEquipo;
}
