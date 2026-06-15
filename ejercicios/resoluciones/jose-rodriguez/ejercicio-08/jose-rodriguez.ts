export {};

// 1. DEFINICION DE VARIANTES (INTERFACES)

interface VehiculoDeportivo {
    tipo: "deportivo"; // Propiedad discriminante
    marca: string;
    modelo: string;
    caballosFuerza: number;
    traccion: "trasera" | "integral";
}

interface VehiculoHiperdeportivo {
    tipo: "hiperdeportivo"; // propiedad discriminante
    marca: string;
    modelo: string;
    velocidadMaxima: number;
    materialChasis: "fibra de carbono" | "titanio";
}

// Variente para vehiculo electrico de alto rendimiento
interface VehiculoElectricoAltoRendimiento {
    tipo: "electrico_top"; // Propiedad discriminante
    marca: string;
    modelo: string;
    capacidadBateriaKwh: number;
    tiempoDeCeroACien: number; //en segundos
}

//2. UNION TYPE (Evita estados invalidos combinando las variantes)
type SuperVehiculo = VehiculoDeportivo | VehiculoHiperdeportivo | VehiculoElectricoAltoRendimiento;

//3. FUNCION CON DISCRIMINACION DE TIPOS 

// Describe un vehiculo adaptando el mensaje de forma segura segun su tipo
function describirVehiculo(vehiculo: SuperVehiculo): string {
    // Al evaluar 'vehiculo.tipo', TypeScript estrecha de forma segura las propiedades disponibles
    switch (vehiculo.tipo){
        case "deportivo":
            // Aqui Typescripte sabe con certeza que existe 'traccion' y 'caballos de fuerza'
            return ` [Deportivo] ${vehiculo.marca}. ${vehiculo.modelo} con ${vehiculo.caballosFuerza} CV y traccion ${vehiculo.traccion}.`;

            case "hiperdeportivo":
                // Aqui Typescript sabe que existe 'velocidadMaxima' y 'materialChasis'
                return ` [Hiperdeportivo] ${vehiculo.marca} ${vehiculo.modelo}, construido en ${vehiculo.materialChasis}, alcanza los ${vehiculo.velocidadMaxima} km/h.`;

                case "electrico_top":
                    // Aqui TypeScript habilitra 'tiempoDeCeroACien' y 'capacidadBateriaKwh'
                    return ` [Electrico Alto Rendimiento] ${vehiculo.marca} ${vehiculo.modelo} con bateria de ${vehiculo.capacidadBateriaKwh} kWh. o a 100 km/h en solo ${vehiculo.tiempoDeCeroACien}s!`;

                    default:
                        // Salvaguardda en caso de que en el futuro se anada otra variante y no se controle
                        const _exhaustivo: never = vehiculo;
                        return _exhaustivo;
    }
}

//4. CREACION DE OBJETOS Y EJECUCION 

const auto1: SuperVehiculo = {
    tipo: "deportivo",
    marca: "Porsche",
    modelo: "911 GT3 RS",
    caballosFuerza: 525,
    traccion: "trasera"
};

const auto2: SuperVehiculo = {
    tipo: 'hiperdeportivo',
    marca: "Bugatti",
    modelo: "Chiron Super Sport",
    velocidadMaxima: 440,
    materialChasis: "fibra de carbono"
};

const auto3: SuperVehiculo = {
    tipo: "electrico_top",
    marca: "Rimac",
    modelo: "Nevera",
    capacidadBateriaKwh: 120,
    tiempoDeCeroACien: 1.81
};

// 5. RESULTADO ESPERADO EN CONSOLA 

console.log("=================================================================");
console.log("              GARAJE DE ALTO RENDIMIENTO                     ");
console.log("=================================================================");
console.log(describirVehiculo(auto1));
console.log(describirVehiculo(auto2));
console.log(describirVehiculo(auto3));
console.log("=================================================================");