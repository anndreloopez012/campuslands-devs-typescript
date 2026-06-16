export {}; 
interface Personaje {
    id: number;
    nombre: string;
    clase: "Guerrero" | "Mago" | "Arquero";
    nivel: number;
}

function esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


class GestorRPG {
    private listaPersonajes: Personaje[] = [];

  
    async cargarDatos(): Promise<void> {
        console.log("Conectando al juego...");
        await esperar(1000);

        this.registrarPersonaje({ id: 1, nombre: "Aragorn", clase: "Guerrero", nivel: 5 });
        this.registrarPersonaje({ id: 2, nombre: "Gandalf", clase: "Mago", nivel: 10 });
        
        console.log("Datos de personajes ingresados");
    }

    registrarPersonaje(nuevo: Personaje): void {
        this.listaPersonajes.push(nuevo);
        console.log(`Personaje registrado: ${nuevo.nombre} (${nuevo.clase})`);
    }

    listarPorClase(claseFiltro: "Guerrero" | "Mago" | "Arquero"): Personaje[] {
        return this.listaPersonajes.filter(p => p.clase === claseFiltro);
    }


    subirNivel(idBuscar: number, nivelesASubir: number): void {

        if (nivelesASubir <= 0) {
            console.error("No puedes subir niveles negativos o cero.");
            return;
        }

        const encontrado = this.listaPersonajes.find(p => p.id === idBuscar);

        if (encontrado) {
            encontrado.nivel += nivelesASubir; 
            console.log(` ¡${encontrado.nombre} subió de nivel, Ahora es nivel ${encontrado.nivel}.`);
        } else {
            console.error(`No se encontró ningún personaje con ID: ${idBuscar}`);
        }
    }


    buscarCualquierCosa<T extends Personaje>(items: T[], idBuscar: number): T | undefined {
        return items.find(item => item.id === idBuscar);
    }

    get todosLosPersonajes(): Personaje[] {
        return this.listaPersonajes;
    }
}


async function iniciarJuego() {
  
    const miGestor = new GestorRPG();

   
    await miGestor.cargarDatos();
    console.log("-----------------------------------------");

  
    miGestor.registrarPersonaje({ id: 3, nombre: "Legolas", clase: "Arquero", nivel: 1 });
    console.log("-----------------------------------------");

  
    miGestor.subirNivel(1, 3);
    console.log("-----------------------------------------");

  
    console.log("Listando solo Guerreros:");
    const guerreros = miGestor.listarPorClase("Guerrero");
    console.table(guerreros);


   
    console.log("RESUMEN:");
    console.table(miGestor.todosLosPersonajes);
}
iniciarJuego();