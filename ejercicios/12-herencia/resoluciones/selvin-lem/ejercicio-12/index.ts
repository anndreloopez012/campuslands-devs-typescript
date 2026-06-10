export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// TODO: crea clases con herencia.

// sintaxis estándar compatible con Type-Stripping

class CampeonArena {
    public readonly aliasAvatar: string;
    public readonly arquetipoRol: string;
    protected _reservaMana: number;

    constructor(alias: string, rol: string, manaInicial: number) {
        this.aliasAvatar = alias;
        this.arquetipoRol = rol;
        this._reservaMana = manaInicial;
    }

    public ejecutarAtaqueSimple(): void {
        const CONSUMO_ESTÁNDAR = 15;
        if (this._reservaMana >= CONSUMO_ESTÁNDAR) {
            this._reservaMana -= CONSUMO_ESTÁNDAR;
            console.log(`[${this.aliasAvatar}]: Ejecutó un golpe básico. (Maná restante: ${this._reservaMana} MP)`);
        } else {
            console.log(`[${this.aliasAvatar}]: No dispone de suficiente Maná para atacar.`);
        }
    }
}
class Vanguardia extends CampeonArena {
    private _puntosEscudo: number;
    constructor(alias: string, mana: number, proteccion: number) {
        super(alias, "Vanguardia", mana);
        this._puntosEscudo = proteccion; 
    }

    public desplegarBarrera(): void {
        console.log(`HABILIDAD DE MITIGACIÓN: ${this.aliasAvatar} se planta al frente absorbiendo daño con ${this._puntosEscudo} puntos de escudo.`);
    }
}

class Infiltrado extends CampeonArena {
    private _multiplicadorLethal: number;
    constructor(alias: string, mana: number, multiplicador: number) {
        super(alias, "Infiltrado", mana);
        this._multiplicadorLethal = multiplicador;
    }

    public ejecutarEnboscada(): void {
        console.log(` HABILIDAD DE DAÑO: ${this.aliasAvatar} ataca desde el sigilo aplicando un golpe crítico de x${this._multiplicadorLethal}.`);
    }
}

class Sanador extends CampeonArena {
    private _potenciaCurativa: number;
    constructor(alias: string, mana: number, curaBase: number) {
        super(alias, "Soporte", mana);
        this._potenciaCurativa = curaBase;
    }

    public canalizarRestauracion(): void {
        const COSTE_CURA = 30;
        if (this._reservaMana >= COSTE_CURA) {
            this._reservaMana -= COSTE_CURA;
            console.log(`HABILIDAD DE UTILIDAD: ${this.aliasAvatar} lanza un destello místico sanando +${this._potenciaCurativa} de vida. (Maná restante: ${this._reservaMana} MP)`);
        } else {
            console.log(`Operación Fallida: ${this.aliasAvatar} no tiene maná suficiente para curar.`);
        }
    }
}

console.log("====================FASE DE SELECCIÓN DE HÉROES====================");
const heroeTanque = new Vanguardia("Kaelen el Rompeolas", 120, 350);
const heroeAsesino = new Infiltrado("Vesper la Sombra", 90, 2.5);
const heroeSoporte = new Sanador("Elysia de la Aurora", 200, 150);

console.log("\n ACCIONES EN LA LÍNEA DE COMBATE:\n");

heroeTanque.ejecutarAtaqueSimple();
heroeTanque.desplegarBarrera();
console.log("---------------------------------------------------------------------");

heroeAsesino.ejecutarAtaqueSimple();
heroeAsesino.ejecutarEnboscada();
console.log("---------------------------------------------------------------------");

heroeSoporte.canalizarRestauracion();
heroeSoporte.ejecutarAtaqueSimple();

console.log("=====================================================================");