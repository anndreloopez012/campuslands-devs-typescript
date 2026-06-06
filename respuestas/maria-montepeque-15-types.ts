// Contratos del dominio
export type ClaseRPG = "Maga" | "Guerrero" | "Arquera" | "Asesino";

export type Rareza = "Comun" | "Raro" | "Epico" | "Legendario";

export interface EntidadConId {
  readonly id: string;
}

export interface Equipo {
  nombre: string;
  rareza: Rareza;
  poderBase: number;
}

export interface PersonajeRPG extends EntidadConId {
  nombre: string;
  clase: ClaseRPG;
  nivel: number;
  puntosVida: number;
  inventario: Equipo[];
}

export type NuevoPersonaje = Omit<PersonajeRPG, "inventario"> & {
  inventario?: Equipo[];
};
