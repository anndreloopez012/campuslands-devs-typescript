export {};

// Ejercicio 9: Enums

enum Genero {
  Rock = "rock",
  Rap = "rap",
  Salsa = "salsa",
  Electronica = "electronica",
  Reggaeton = "reggaeton",
}

type Cancion = { titulo: string; artista: string; genero: Genero };

const playlist: Cancion[] = [
  { titulo: "Ciudad Lunar", artista: "Nova Beat", genero: Genero.Electronica },
  { titulo: "Barrio Alto", artista: "MC Norte", genero: Genero.Rap },
  { titulo: "Rueda de Fuego", artista: "La Clave", genero: Genero.Salsa },
  { titulo: "Trueno", artista: "Zona 5", genero: Genero.Reggaeton },
  { titulo: "Riff Mayor", artista: "Los Cables", genero: Genero.Rock },
];

const filtrar = (g: Genero) => playlist.filter((c) => c.genero === g);

console.table(filtrar(Genero.Rap));