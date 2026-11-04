export {};

type Genero = "accion" | "drama" | "comedia" | "terror" | "scifi";

interface Contenido {
  readonly id: number;
  readonly titulo: string;
  readonly generos: readonly Genero[];
  readonly calificacion: number;
  readonly anio: number;
}

interface Perfil {
  readonly usuario: string;
  readonly favoritos: ReadonlySet<Genero>;
  readonly vistos: ReadonlySet<number>;
}

interface Sugerencia<T extends Contenido> {
  readonly contenido: T;
  readonly puntaje: number;
}

class Recomendador<T extends Contenido> {
  constructor(private readonly catalogo: readonly T[]) {}

  private puntuar(item: T, perfil: Perfil): number {
    const coincidencias = item.generos.filter((g) => perfil.favoritos.has(g)).length;
    const bonoReciente = item.anio >= 2020 ? 0.5 : 0;
    return Math.round((coincidencias * 3 + item.calificacion + bonoReciente) * 10) / 10;
  }

  recomendar(perfil: Perfil, limite: number): Sugerencia<T>[] {
    return this.catalogo
      .filter((item) => item.calificacion >= 0 && item.calificacion <= 10)
      .filter((item) => !perfil.vistos.has(item.id))
      .map((contenido) => ({ contenido, puntaje: this.puntuar(contenido, perfil) }))
      .filter((s) => s.puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, limite);
  }
}

const catalogo: readonly Contenido[] = [
  { id: 1, titulo: "Orbita Final", generos: ["scifi", "accion"], calificacion: 8.4, anio: 2022 },
  { id: 2, titulo: "Casa de Voces", generos: ["terror"], calificacion: 7.1, anio: 2018 },
  { id: 3, titulo: "Risas en Fila", generos: ["comedia"], calificacion: 6.8, anio: 2021 },
  { id: 4, titulo: "El Ultimo Verano", generos: ["drama"], calificacion: 9.0, anio: 2015 },
  { id: 5, titulo: "Nave Perdida", generos: ["scifi", "terror"], calificacion: 7.9, anio: 2023 },
  { id: 6, titulo: "Persecucion Urbana", generos: ["accion"], calificacion: 6.2, anio: 2019 },
  { id: 7, titulo: "Titulo Roto", generos: ["drama"], calificacion: 25, anio: 2020 },
];

const perfiles: readonly Perfil[] = [
  { usuario: "Mariana", favoritos: new Set<Genero>(["scifi", "terror"]), vistos: new Set([1]) },
  { usuario: "Joaquin", favoritos: new Set<Genero>(["comedia", "drama"]), vistos: new Set([3, 4]) },
];

const recomendador = new Recomendador(catalogo);

console.log("Ejercicio 39: Recomendador de streaming");
perfiles.forEach((perfil) => {
  console.log(`Para ${perfil.usuario} (le gusta: ${Array.from(perfil.favoritos).join(", ")}):`);
  recomendador.recomendar(perfil, 3).forEach((s, i) =>
    console.log(`  ${i + 1}. ${s.contenido.titulo} - puntaje ${s.puntaje}`),
  );
});
