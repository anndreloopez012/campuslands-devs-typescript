class HeroeMOBA {
    nombre: string;
    vida: number;

    constructor(nombre: string, vida: number) {
        this.nombre = nombre;
        this.vida = vida;
    }

    presentarse(): void {
        console.log(`¡Hola! Soy ${this.nombre} y tengo ${this.vida} de vida.`);
    }

    usarHabilidad(): void {
        console.log(`${this.nombre} usa una habilidad básica.`);
    }
}


class Tanque extends HeroeMOBA {
    escudo: number;

    constructor(nombre: string, vida: number, escudo: number) {
        super(nombre, vida);
        this.escudo = 100; 
    }

    usarHabilidad(): void {
        console.log(` ${this.nombre} activa su escudo protector de ${this.escudo} puntos.`);
    }
}

class Asesino extends HeroeMOBA {
    constructor(nombre: string, vida: number) {
        super(nombre, vida); 
    }

    usarHabilidad(): void {
        console.log(` ${this.nombre} se vuelve invisible y da un golpe crítico.`);
    }
}

class Soporte extends HeroeMOBA {
    constructor(nombre: string, vida: number) {
        super(nombre, vida);
    }

    usarHabilidad(): void {
        console.log(` ${this.nombre} lanza un destello de luz y cura a todos sus aliados.`);
    }
}



const miTanque = new Tanque("Spread", 3000, 500);
const miAsesino = new Asesino("Jik", 1200);
const miSoporte = new Soporte("Soraka", 1000);


miTanque.presentarse();
miAsesino.presentarse();
miSoporte.presentarse();

console.log("-----Habilidades-------")
miTanque.usarHabilidad();
miAsesino.usarHabilidad();
miSoporte.usarHabilidad();