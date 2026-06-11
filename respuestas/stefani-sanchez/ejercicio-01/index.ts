export {};

// Las constantes tienen tipos explicitos para que TypeScript valide el contrato del dato.
const nombreJugador: string = "ShadowCampus";
const armaPrincipal: string = "Rifle tactico";
const municionDisponible: number = 90;
const tieneEscudoActivo: boolean = true;
const mapaActual: string = "Distrito Neon";
const modoJuego: string = "Captura por equipos";

// Template literals permiten construir mensajes claros sin concatenaciones fragiles.
const resumenJugador: string =
  `${nombreJugador} juega ${modoJuego} en ${mapaActual} con ${armaPrincipal}, ${municionDisponible} balas y escudo ${tieneEscudoActivo ? "activo" : "inactivo"}.`;

console.log(resumenJugador);