// Ejercicio 15 - Clase que encapsula el gestor de personajes
// Resolucion: Dulce Morales

import type { ClasePersonaje, ItemCrudo, ItemEquipo, Personaje, PersonajeCrudo, Resultado } from "./tipos";
import {
  agruparPor,
  buscarPorId,
  calcularPoderTotal,
  esClaseValida,
  esNivelValido,
  esRarezaValida,
  esperar,
} from "./utilidades";

export class GestorPersonajes {
  // Solo el gestor puede modificar la lista
  private readonly personajes: Personaje[] = [];

  public get total(): number {
    return this.personajes.length;
  }

  // Async: simula la carga inicial desde un servidor y valida cada registro
  public async cargarDatosIniciales(datos: readonly PersonajeCrudo[]): Promise<string[]> {
    await esperar(400);
    const errores: string[] = [];

    for (const crudo of datos) {
      const convertido: Resultado<Personaje> = this.convertirCrudo(crudo);
      if (!convertido.ok) {
        errores.push(convertido.error);
        continue;
      }
      const registro: Resultado<Personaje> = this.registrar(convertido.valor);
      if (!registro.ok) {
        errores.push(registro.error);
      }
    }
    return errores;
  }

  public registrar(personaje: Personaje): Resultado<Personaje> {
    if (buscarPorId(this.personajes, personaje.id) !== undefined) {
      return { ok: false, error: `Ya existe un personaje con id ${personaje.id}` };
    }
    if (!esNivelValido(personaje.nivel)) {
      return { ok: false, error: `${personaje.nombre}: nivel invalido (${personaje.nivel})` };
    }
    this.personajes.push(personaje);
    return { ok: true, valor: personaje };
  }

  public buscar(id: string): Personaje | undefined {
    return buscarPorId(this.personajes, id);
  }

  public listarPorClase(clase: ClasePersonaje): Personaje[] {
    return this.personajes.filter((personaje: Personaje): boolean => personaje.clase === clase);
  }

  public agruparPorClase(): Map<ClasePersonaje, Personaje[]> {
    return agruparPor(this.personajes, (personaje: Personaje): ClasePersonaje => personaje.clase);
  }

  // Valida que el nivel nunca quede negativo ni en cero
  public subirNivel(id: string, niveles: number): Resultado<Personaje> {
    const personaje: Personaje | undefined = this.buscar(id);
    if (personaje === undefined) {
      return { ok: false, error: `No existe el personaje ${id}` };
    }
    if (!Number.isInteger(niveles) || niveles <= 0) {
      return { ok: false, error: `${personaje.nombre}: no se puede subir ${niveles} niveles` };
    }
    personaje.nivel += niveles;
    personaje.puntosVida += niveles * 12;
    return { ok: true, valor: personaje };
  }

  public equipar(id: string, item: ItemEquipo): Resultado<Personaje> {
    const personaje: Personaje | undefined = this.buscar(id);
    if (personaje === undefined) {
      return { ok: false, error: `No existe el personaje ${id}` };
    }
    if (buscarPorId(personaje.inventario, item.id) !== undefined) {
      return { ok: false, error: `${personaje.nombre} ya tiene ${item.nombre}` };
    }
    personaje.inventario.push(item);
    return { ok: true, valor: personaje };
  }

  public ranking(): Personaje[] {
    return [...this.personajes].sort(
      (a: Personaje, b: Personaje): number => calcularPoderTotal(b) - calcularPoderTotal(a),
    );
  }

  private convertirItem(crudo: ItemCrudo): Resultado<ItemEquipo> {
    const rareza: string = crudo.rareza;
    if (!esRarezaValida(rareza)) {
      return { ok: false, error: `Item ${crudo.id}: rareza desconocida "${rareza}"` };
    }
    return { ok: true, valor: { id: crudo.id, nombre: crudo.nombre, rareza: rareza, poderBase: crudo.poderBase } };
  }

  private convertirCrudo(crudo: PersonajeCrudo): Resultado<Personaje> {
    const clase: string = crudo.clase;
    if (!esClaseValida(clase)) {
      return { ok: false, error: `${crudo.nombre}: clase desconocida "${clase}"` };
    }

    const inventario: ItemEquipo[] = [];
    for (const itemCrudo of crudo.inventario) {
      const item: Resultado<ItemEquipo> = this.convertirItem(itemCrudo);
      if (!item.ok) {
        return { ok: false, error: `${crudo.nombre}: ${item.error}` };
      }
      inventario.push(item.valor);
    }

    return {
      ok: true,
      valor: {
        id: crudo.id,
        nombre: crudo.nombre,
        clase: clase,
        nivel: crudo.nivel,
        puntosVida: crudo.puntosVida,
        inventario: inventario,
      },
    };
  }
}
