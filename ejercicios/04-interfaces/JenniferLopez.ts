export {};

interface PersonajeRPG {
    nombre: string;
    clase: string;
    nivel: number;
    vida: number;
    mana: number;
    mascota?: string;
}
const personajes: PersonajeRPG[] = [
    {
        nombre: "Tharok",
        clase: "Guerrero",
        nivel: 12,
        vida: 150,
        mana: 30
    },
    {
        nombre: "Eldria",
        clase: "Maga",
        nivel: 9,
        vida: 80,
        mana: 200,
        mascota: "Fenix"
    },
    {
        nombre: "Kaelum",
        clase: "Arquero",
        nivel: 15,
        vida: 100,
        mana: 60
    }
];
const personajesMisionDificil = personajes.filter(
    personaje => personaje.nivel >= 10
);
console.log("Personajes RPG:");
console.log(personajes);
console.log("Listos para una mision dificil:");
console.log(personajesMisionDificil);
