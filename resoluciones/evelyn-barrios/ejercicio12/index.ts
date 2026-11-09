export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// TODO: crea clases con herencia.

class PersonajeMOBA {
 constructor(
   public nombre: string,
   public salud: number,
 ) {}


 atacar(): void {
   console.log(`${this.nombre} realiza un ataque básico.`);
 }
}


class Tanque extends PersonajeMOBA {
 atacar(): void {
   console.log(`${this.nombre} usa "Golpe de Escudo".`);
 }
}


class Asesino extends PersonajeMOBA {
 atacar(): void {
   console.log(`${this.nombre} usa "Puñalada Sigilosa".`);
 }
}


const miTanque = new Tanque("Braum", 3000);
miTanque.atacar();
