export {};

// Ejercicio 6: Funciones tipadas
// Contexto: Sistema de puntuacion deportiva

// TODO: crea funciones para calcular puntos.

export {};


const sumarPuntos = (base: number, bonus: number = 0): number => {
 return base + bonus;
};


function registrarMarcador(usuario: string, puntos: number): void {
 console.log(`[PUNTAJE] ${usuario} ha registrado ${puntos} puntos.`);
}


const puntosEvelyn = sumarPuntos(120, 30);
const puntosInvitado = sumarPuntos(80);


registrarMarcador("Evelyn", puntosEvelyn);
registrarMarcador("Invitado", puntosInvitado);


