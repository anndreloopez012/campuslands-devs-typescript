export {};

// Ejercicio 15: Proyecto Final Integrador
// Contexto: Gestor de personajes RPG con TypeScript

// TODO: integra interfaces, clases, generics y async/await.


type EscalaRareza = "Común" | "Raro" | "Épico" | "Legendario";

interface ItemEquipamiento {
    nombreArticulo: string;
    rareza: EscalaRareza;
    bonoPoder: number;
}

interface EntidadIdentificable {
    readonly idUnico: string;
}

interface PerfilPersonaje extends EntidadIdentificable {
    nombreAvatar: string;
    claseRol: string;
    nivelRango: number;
    saludBase: number;
    inventarioEquipo: ItemEquipamiento[]; // Reto Extra
}

class AdministradorRPG {
    private _coleccionPersonajes: PerfilPersonaje[];

    constructor() {
        this._coleccionPersonajes = [];
    }
    public async cargarDatosServidor(): Promise<void> {
        // Retraso de red simulado (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const datosIniciales: PerfilPersonaje[] = [
            { 
                idUnico: "P-01", 
                nombreAvatar: "Lyra Frost", 
                claseRol: "Maga", 
                nivelRango: 8, 
                saludBase: 90,
                inventarioEquipo: [
                    {
                        nombreArticulo: "Bastón Astral", 
                        rareza: "Épico", bonoPoder: 45 
                        },
                    { 
                        nombreArticulo: "Anillo de Maná", 
                        rareza: "Común", bonoPoder: 10 
                    }
                ]
            },
            { 
                idUnico: "P-02", 
                nombreAvatar: "Roth el Feroz", 
                claseRol: "Guerrero", 
                nivelRango: 11, 
                saludBase: 145,
                inventarioEquipo: [
                    { 
                        nombreArticulo: "Espada Rúnica", 
                        rareza: "Legendario", 
                        bonoPoder: 120 
                    }
                ]
            },
            { 
                idUnico: "P-03", 
                nombreAvatar: "Sena Viento", 
                claseRol: "Arquera", 
                nivelRango: 7, 
                saludBase: 95,
                inventarioEquipo: []
            }
        ];

        this._coleccionPersonajes = datosIniciales;
        console.log(" [Sistema]: Datos de personajes sincronizados desde el servidor central.");
    }

    public registrarNuevoPersonaje(heroe: PerfilPersonaje): void {
        if (heroe.nivelRango < 0) {
            console.log(` Error de Validación: El personaje "${heroe.nombreAvatar}" posee un nivel negativo inválido.`);
            return;
        }
        this._coleccionPersonajes.push(heroe);
        console.log(` [Registro]: "${heroe.nombreAvatar}" se ha unido a la cuadrilla.`);
    }

    public promocionarNivel(id: string, nivelesAumentar: number): void {
        const personaje = this.buscarPorIdGenérico(this._coleccionPersonajes, id);

        if (!personaje) {
            console.log(` Operación Fallida: No se encontró ningún personaje con el ID [${id}].`);
            return;
        }

        if (nivelesAumentar <= 0) {
            console.log(` Validación: La cantidad de niveles a subir debe ser mayor a cero.`);
            return;
        }

        personaje.nivelRango += nivelesAumentar;
        console.log(` [Subida de Nivel]: ¡${personaje.nombreAvatar} ascendió a Nivel ${personaje.nivelRango}!`);
    }

    public listarPorClase(claseBuscada: string): PerfilPersonaje[] {
        return this._coleccionPersonajes.filter(
            (p) => p.claseRol.toLowerCase() === claseBuscada.toLowerCase()
        );
    }

    public calcularPoderTotal(personaje: PerfilPersonaje): number {
        const poderDeNivel = personaje.nivelRango * 20;
        
        const poderDeEquipamiento = personaje.inventarioEquipo.reduce(
            (acumulado, item) => acumulado + item.bonoPoder, 0
        );

        return poderDeNivel + poderDeEquipamiento;
    }

    //funcion gnerica integrada
    private buscarPorIdGenérico<T extends EntidadIdentificable>(coleccion: T[], idObjetivo: string): T | undefined {
        for (let i = 0; i < coleccion.length; i++) {
            if (coleccion[i].idUnico === idObjetivo) {
                return coleccion[i];
            }
        }
        return undefined;
    }

    // Método de Reporte Final
    public desplegarPanelControl(): void {
        console.log("\n==================PANEL DE CONTROL GENERAL RPG==================");
        
        this._coleccionPersonajes.forEach((p) => {
            const poderCalculado = this.calcularPoderTotal(p);
            const cantidadItems = p.inventarioEquipo.length;
            
            console.log(`• ID: ${p.idUnico} | ${p.nombreAvatar.padEnd(15)} | Rol: ${p.claseRol.padEnd(10)} | Nivel: ${p.nivelRango.toString().padEnd(3)} | Items: ${cantidadItems} | PODER TOTAL:  ${poderCalculado} pts`);
        });
        console.log("=====================================================================\n");
    }
}

async function ejecucionPrincipal(): Promise<void> {
    const gestorGremio = new AdministradorRPG();
    await gestorGremio.cargarDatosServidor();
    gestorGremio.desplegarPanelControl();
    gestorGremio.registrarNuevoPersonaje({
        idUnico: "P-04",
        nombreAvatar: "Doran Escudo",
        claseRol: "Guerrero",
        nivelRango: 5,
        saludBase: 160,
        inventarioEquipo: [
            { 
                nombreArticulo: "Peto de Hierro", 
                rareza: "Raro", 
                bonoPoder: 30 
            }
        ]
    });

    gestorGremio.promocionarNivel("P-01", 4);
    gestorGremio.promocionarNivel("P-03", 2); 
    console.log("\n [Consulta]: Filtrando exclusivamente guerreros activos:");
    const listaGuerreros = gestorGremio.listarPorClase("Guerrero");
    console.table(listaGuerreros);
    gestorGremio.desplegarPanelControl();
}

ejecucionPrincipal().catch((error) => {
    console.error(" Error imprevisto en la ejecución del motor RPG:", error);
});