export {};

// 1. CLASE BASE (PADRE)
class HeroeMOBA {
    // Propiedades comunes que heredarán todos los héroes
    public nombre: string;
    public vidaMaxima: number;
    public mana: number;

    constructor(nombre: string, vidaMaxima: number, mana: number) {
        this.nombre = nombre;
        this.vidaMaxima = vidaMaxima;
        this.mana = mana;
    }

    // Método común con tipado explícito
    public mostrarFicha(): void {
        console.log(`🦸 [HÉROE] ${this.nombre} | HP: ${this.vidaMaxima} | MANÁ: ${this.mana}`);
    }

    // Método que será sobrescrito por las clases hijas
    public usarHabilidadEspecial(): void {
        console.log(`${this.nombre} realiza un ataque básico.`);
    }
}

// 2. CLASES ESPECIALIZADAS (HIJAS)

// --- CLASE HIJA 1: TANQUE ---
class Tanque extends HeroeMOBA {
    // Propiedad específica de esta clase
    public escudoAdicional: number;

    constructor(nombre: string, vidaMaxima: number, mana: number, escudoAdicional: number) {
        // super() invoca obligatoriamente al constructor de HeroeMOBA
        super(nombre, vidaMaxima, mana);
        this.escudoAdicional = escudoAdicional;
    }

    // Sobrescritura del método para adaptarlo al rol de Tanque
    public override usarHabilidadEspecial(): void {
        console.log(`🛡️  [Habilidad Tanque] ${this.nombre} activa "Fortaleza de Hierro". ¡Gana +${this.escudoAdicional} de escudo y provoca a los enemigos cercanos!`);
    }
}

// --- CLASE HIJA 2: ASESINO ---
class Asesino extends HeroeMOBA {
    public dañoCriticoMultiplicador: number;

    constructor(nombre: string, vidaMaxima: number, mana: number, dañoCriticoMultiplicador: number) {
        super(nombre, vidaMaxima, mana);
        this.dañoCriticoMultiplicador = dañoCriticoMultiplicador;
    }

    // Sobrescritura del método para el rol de Asesino
    public override usarHabilidadEspecial(): void {
        console.log(`🗡️  [Habilidad Asesino] ${this.nombre} ejecuta "Asalto Sombrío". Se vuelve invisible e inflige un golpe crítico de x${this.dañoCriticoMultiplicador}.`);
    }
}

// --- RETO EXTRA: CLASE HIJA 3 (SOPORTE CON CURACIÓN) ---
class Soporte extends HeroeMOBA {
    public poderCuracion: number;

    constructor(nombre: string, vidaMaxima: number, mana: number, poderCuracion: number) {
        super(nombre, vidaMaxima, mana);
        this.poderCuracion = poderCuracion;
    }

    // Sobrescritura del método para el rol de Soporte
    public override usarHabilidadEspecial(): void {
        console.log(`✨ [Habilidad Soporte] ${this.nombre} canaliza "Plegaria Celestial". Restaura ${this.poderCuracion} HP a todos los aliados heridos.`);
    }
}

//3. CREACION DE OBJETOS Y EJECUCION

console.log("========================================");
console.log("       SELECCIÓN DE CAMPEONES           ");
console.log("========================================");

// Instanciamos cada clase especializada 
const heroeTanque = new Tanque("Malphite", 4500, 300, 500);
const heroeAsesino = new Asesino("Zed", 1800, 200, 2.5);
const heroeSoporte = new Soporte("Soraka", 2200, 600, 350);

// Guardamos a todos los heroes en un array tipado con la clase base
const partida: HeroeMOBA[] = [heroeTanque, heroeAsesino, heroeSoporte];

// Recorremos la lista. Gracias al polimorfismo, cada uno sabe como actuar
partida.forEach((heroe) => {
    heroe.mostrarFicha();
    heroe.usarHabilidadEspecial();
    console.log("----------------------------------------");
});