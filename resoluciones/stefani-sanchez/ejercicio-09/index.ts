export {};

// Ejercicio 09: Enums
// Contexto: Plataforma de Streaming y Géneros Musicales

enum GeneroMusical {
  ROCK = "Rock Alternativo",
  SYNTHWAVE = "Synthwave / Retrowave",
  ELECTRONICA = "Música Electrónica",
  JAZZ = "Jazz Contemporáneo",
  LOFI = "Lo-Fi Beats"
}

enum NivelEnergia {
  RELAJADO = 1,
  CONCENTRADO = 2,
  INTENSO = 3
}

interface PistaMusical {
  id: string;
  titulo: string;
  artista: string;
  genero: GeneroMusical;
  energia: NivelEnergia;
  duracionSegundos: number;
}

const playlistProgramacion: PistaMusical[] = [
  { id: "TRK-01", titulo: "Resonance", artista: "HOME", genero: GeneroMusical.SYNTHWAVE, energia: NivelEnergia.CONCENTRADO, duracionSegundos: 212 },
  { id: "TRK-02", titulo: "Coffee Morning", artista: "Lofi Dreamer", genero: GeneroMusical.LOFI, energia: NivelEnergia.RELAJADO, duracionSegundos: 165 },
  { id: "TRK-03", titulo: "Strobe", artista: "deadmau5", genero: GeneroMusical.ELECTRONICA, energia: NivelEnergia.INTENSO, duracionSegundos: 634 }
];

function recomendarPistaPorEstado(energiaDeseada: NivelEnergia): PistaMusical[] {
  return playlistProgramacion.filter((p) => p.energia === energiaDeseada);
}

console.log("=== PLAYLIST PARA PROGRAMACIÓN CON TYPESCRIPT ===");
playlistProgramacion.forEach((pista) => {
  console.log(`🎵 "${pista.titulo}" por ${pista.artista} [${pista.genero}] - Energía: Nivel ${pista.energia}`);
});

console.log("\n=== RECOMENDACIÓN PARA CONCENTRACIÓN ===");
const sugerencias = recomendarPistaPorEstado(NivelEnergia.CONCENTRADO);
sugerencias.forEach((s) => console.log(`-> ${s.titulo} - ${s.artista}`));
