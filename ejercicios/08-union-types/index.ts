export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

// TODO: crea una union discriminada para vehiculos.

interface superDeportivo {
    categoria: "superdeportivo";
    fabricante: string;
    linea: number | string;
    fuerzaMotores: number; 
}

interface hiperAuto {
    categoria: "hiperauto";      
    fabricante: string;
    linea: number | string;
    fuerzaMotores: number;
    topeVelocidad: number; 
}
interface hyperEV {
    categoria: "hyper-ev";       
    fabricante: string;
    linea: number | string;
    capacidadBateriaKwh: number; 
    tiempoAceleracion: number;
}

type AutomovilCarreras = superDeportivo | hiperAuto | hyperEV;
function generarFichaDescriptiva(auto: AutomovilCarreras): string {
    switch (auto.categoria) {
        case "hiperauto":
            return `[Hiper-Auto] Vínculo de Ingeniería: ${auto.fabricante} ${auto.linea}. Registra una entrega de ${auto.fuerzaMotores} caballos de fuerza y una velocidad punta de ${auto.topeVelocidad} km/h.`;
            
        case "hyper-ev":
            return `[Ev-perfomance] Innovación Eléctrica: ${auto.fabricante} ${auto.linea}. Propulsado por celdas de ${auto.capacidadBateriaKwh} kWh, completando el 0-100 en un rango de ${auto.tiempoAceleracion} segundos.`;
            
        case "superdeportivo":
            return `[Super-Deportivo] Línea Tradicional: ${auto.fabricante} ${auto.linea}. Despliega una potencia neta de ${auto.fuerzaMotores} caballos de fuerza.`;
            
        default:
            const _exhaustivo: never = auto;
            return _exhaustivo;
    }
}

const cochePrueba: AutomovilCarreras = {
    categoria: "hyper-ev",
    fabricante: "Rimac",
    linea: "Nevera",
    capacidadBateriaKwh: 120,
    tiempoAceleracion: 1.81
};

console.log("===============sistema de analisis automotrizado================");
console.log(generarFichaDescriptiva(cochePrueba));
console.log(generarFichaDescriptiva({
    categoria: "superdeportivo",
    fabricante: "Porsche",
    linea: "911 GT3 RS",
    fuerzaMotores: 525
}));
console.log("=================================================================");