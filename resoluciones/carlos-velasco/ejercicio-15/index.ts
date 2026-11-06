export {};

// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

import personajesJSON from "./datos.json" with { type: "json" };

type Clase = "Guerrero" | "Maga" | "Arquera";

interface Personaje {
    id: string;
    nombre: string;
    clase: Clase;
    nivel: number;
    puntosVida: number;
}

class GestorRPG {
    private personajes: Personaje[] = [];

    async cargarDatos(datos: Personaje[]): Promise<void> {
        return new Promise((resolve) => {
            console.log("Cargando personajes desde JSON...");
            setTimeout(() => {
                this.personajes = datos;
                resolve();
            }, 1000);
        });
    }

    subirNivel(id: string, incremento: number): void {
        const p = this.personajes.find(per => per.id === id);
        if (p) {
            if ((p.nivel + incremento) >= 0) {
                p.nivel += incremento;
                console.log(`${p.nombre} ahora es nivel ${p.nivel}.`);
            } else {
                console.error(`Error: ${p.nombre} no puede tener nivel negativo.`);
            }
        }
    }
    buscarPor<K extends keyof Personaje>(clave: K, valor: Personaje[K]): Personaje[] {
        return this.personajes.filter(p => p[clave] === valor);
    }
    listar(): Personaje[] {
        return this.personajes;
    }
}

async function main() {
    const gestor = new GestorRPG();
    await gestor.cargarDatos(personajesJSON as Personaje[]);
    gestor.subirNivel("P-01", 2);
    console.log("--- Resumen de Personajes ---");
    gestor.listar().forEach(p => {
        console.log(`ID: ${p.id} | Nombre: ${p.nombre} | Clase: ${p.clase} | Nivel: ${p.nivel}`);
    });
    console.log("\n--- Búsqueda de Guerreros ---");
    console.log(gestor.buscarPor("clase", "Guerrero"));
}

main();