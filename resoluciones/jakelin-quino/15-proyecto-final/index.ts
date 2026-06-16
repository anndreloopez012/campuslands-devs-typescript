export {};

// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

// TODO: integra interfaces, clases, generics y async/await.

console.log("--------------Ejercicio 15: Proyecto Final Integrador--------------")
interface Personaje {
    id: string;
    nombre: string;
    clase: string;
    nivel: number;
    puntosVida: number;
}

const datosIniciales: Personaje[] = [
    { "id": "P-01", "nombre": "Lyra", "clase": "Maga", "nivel": 8, "puntosVida": 90 },
    { "id": "P-02", "nombre": "Roth", "clase": "Guerrero", "nivel": 11, "puntosVida": 145 },
    { "id": "P-03", "nombre": "Sena", "clase": "Arquera", "nivel": 7, "puntosVida": 95 }
];

class GestorPersonajes {
    private personajes: Personaje[] = [];
    async cargarDatosIniciales(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.personajes = [...datosIniciales];
                console.log("Datos iniciales cargados con éxito.");
                resolve();
            }, 1000);
        });
    }
    registrarPersonaje(nuevoPersonaje: Personaje): void {
        if (nuevoPersonaje.nivel < 0) {
            console.error(`Error: El nivel de ${nuevoPersonaje.nombre} no puede ser negativo.`);
            return;
        }
        this.personajes.push(nuevoPersonaje);
        console.log(`Personaje ${nuevoPersonaje.nombre} registrado con éxito.`);
    }
    listarPersonajes(): void {
        console.log("\nLista Actual de Personajes:");
        console.table(this.personajes);
    }
    subirNivel(id: string, nivelesASubir: number): void {
        if (nivelesASubir < 0) {
            console.error("Error: No puedes añadir una cantidad negativa de niveles.");
            return;
        }
        const personaje = this.personajes.find(p => p.id === id);
        if (personaje) {
            personaje.nivel += nivelesASubir;
            console.log(`${personaje.nombre} ha subido de nivel! Nuevo nivel: ${personaje.nivel}.`);
        } else {
            console.error(`Error: Personaje con ID ${id} no encontrado.`);
        }
    }
    buscarPorPropiedad<K extends keyof Personaje>(propiedad: K, valor: Personaje[K]): Personaje[] {
        return this.personajes.filter(p => p[propiedad] === valor);
    }
}

async function iniciarGestor() {  
    const gestor = new GestorPersonajes();
    await gestor.cargarDatosIniciales();
    gestor.listarPersonajes();
    gestor.registrarPersonaje({
        id: "P-04",
        nombre: "Kael",
        clase: "Paladín",
        nivel: 5,
        puntosVida: 120
    });
    gestor.subirNivel("P-01", 3);
    gestor.listarPersonajes();
    console.log("\nBuscando personajes de la clase 'Guerrero':");
    const guerreros = gestor.buscarPorPropiedad("clase", "Guerrero");
    console.log(guerreros);
}

iniciarGestor();