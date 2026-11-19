// Ejercicio 15 - Contratos principales del gestor (tipos e interfaces)
// Resolucion: Dulce Morales

export const CLASES = ["Maga", "Guerrero", "Arquera", "Clerigo"] as const;
export type ClasePersonaje = (typeof CLASES)[number];

// Reto extra: rareza del equipo, con su multiplicador de poder
export enum Rareza {
  Comun = "comun",
  Raro = "raro",
  Epico = "epico",
  Legendario = "legendario",
}

export const MULTIPLICADOR_RAREZA: Record<Rareza, number> = {
  [Rareza.Comun]: 1,
  [Rareza.Raro]: 1.5,
  [Rareza.Epico]: 2,
  [Rareza.Legendario]: 3,
};

export interface ConId {
  readonly id: string;
}

export interface ItemEquipo extends ConId {
  nombre: string;
  rareza: Rareza;
  poderBase: number;
}

export interface Personaje extends ConId {
  nombre: string;
  clase: ClasePersonaje;
  nivel: number;
  puntosVida: number;
  inventario: ItemEquipo[];
}

// Forma en que llegan los datos desde datos.json (texto sin validar)
export interface ItemCrudo {
  id: string;
  nombre: string;
  rareza: string;
  poderBase: number;
}

export interface PersonajeCrudo {
  id: string;
  nombre: string;
  clase: string;
  nivel: number;
  puntosVida: number;
  inventario: ItemCrudo[];
}

// Resultado de una operacion que puede fallar, sin lanzar excepciones
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };
