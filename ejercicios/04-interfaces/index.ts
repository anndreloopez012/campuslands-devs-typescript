export {};

// Ejercicio 4: Interfaces
// Contexto: Personajes RPG

// TODO: define la interfaz PersonajeRPG.
// TODO: crea un array de personajes.

interface heroeLeyenda {
    alias: string;
    arquetipo: string;
    rangoNivel: number;
    energiaVital: number;
    armamentoFavorito: string;
    clanAfiliado?: string; // Propiedad opcional requerida
}

const catalogoHeroes: heroeLeyenda[] = [
    {
        alias: "Thorin",
        arquetipo: "Paladín",
        rangoNivel: 14,
        energiaVital: 250,
        armamentoFavorito: "Martillo de Guerra",
        clanAfiliado: "Forjadores de Hierro" // Con propiedad opcional
    },
    {
        alias: "Eldrin",
        arquetipo: "Nigromante",
        rangoNivel: 7,
        energiaVital: 110,
        armamentoFavorito: "Báculo de Hueso" // Sin propiedad opcional
    },
    {
        alias: "Sora",
        arquetipo: "Asesino",
        rangoNivel: 10,
        energiaVital: 165,
        armamentoFavorito: "Dagas de Kusanagi",
        clanAfiliado: "Loto Negro" // Con propiedad opcional
    },
    {
        alias: "Lyra",
        arquetipo: "Clérigo",
        rangoNivel: 5,
        energiaVital: 140,
        armamentoFavorito: "Reliquia Sagrada" // Sin propiedad opcional
    }
];

//filtrado rangoNivel>10
const nivelesRequeridos = 10;
const aptosParaIncursion: heroeLeyenda[] = catalogoHeroes.filter(
    (heroe) => heroe.rangoNivel > nivelesRequeridos
);

console.log("======registro general de héroes======");
console.table(catalogoHeroes);

console.log("\n=====Convicatoria para incursión épica=====");
console.log("Los siguientes guerreros cumplen con el criterio mínimo de nivel:");
console.log("---------------------------------------------------------------------");

aptosParaIncursion.forEach((heroe) => {
    const afiliacion = heroe.clanAfiliado ? `[Clan: ${heroe.clanAfiliado}]` : "[Sin Clan]";
    console.log(`• ${heroe.alias} (${heroe.arquetipo}) - Nivel ${heroe.rangoNivel} ${afiliacion}`);
});
console.log("=====================================================================");