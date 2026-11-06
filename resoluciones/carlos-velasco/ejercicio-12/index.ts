export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// TODO: crea clases con herencia.

class HeroeMOBA {
    constructor(
        public nombre: string,
        public vida: number,
        protected daño: number
    ) {}

    public atacar(): void {
        console.log(`${this.nombre} realiza un ataque básico de ${this.daño} de daño.`);
    }
    public habilidadEspecial(): void {};
}

class Tanque extends HeroeMOBA {
    constructor(nombre: string, vida: number, daño: number, private escudo: number) {
        super(nombre, vida, daño);
    }
    public habilidadEspecial(): void {
        console.log(`${this.nombre} activa su escudo de ${this.escudo} puntos de daño absorbido.`);
    }
}

class Asesino extends HeroeMOBA {
    public habilidadEspecial(): void {
        console.log(`${this.nombre} se vuelve invisible y realiza un golpe crítico instantáneo.`);
    }
}

class Soporte extends HeroeMOBA {
    constructor(nombre: string, vida: number, daño: number, private curacion: number) {
        super(nombre, vida, daño);
    }

    public habilidadEspecial(): void {
        console.log(`${this.nombre} lanza un hechizo de curación que restaura ${this.curacion} de vida.`);
    }
}


const tanque = new Tanque("Malphite", 2000, 50, 500);
const asesino = new Asesino("Zed", 800, 150);
const soporte = new Soporte("Soraka", 600, 30, 300);

const equipo: HeroeMOBA[] = [tanque, asesino, soporte];

equipo.forEach(heroe => {
    console.log(`--- Héroe: ${heroe.nombre} ---`);
    heroe.atacar();
    heroe.habilidadEspecial();
});