export {};

// 1. DEFINICIÓN DEL CONTRATO (INTERFAZ)
interface PersonajeRPG {
    nombre: string;          // Obligatoria
    clase: string;           // Obligatoria
    nivel: number;           // Obligatoria
    puntosVida: number;      // Obligatoria
    gremio?: string;         // OPCIONAL (El signo '?' indica que puede no estar)
}

// 2. CREACIÓN DE OBJETOS QUE CUMPLEN EL CONTRATO
// Personaje completo (con todas las propiedades)
const personaje1: PersonajeRPG = {
    nombre: "Arthas",
    clase: "Paladín",
    nivel: 12,
    puntosVida: 150,
    gremio: "Alianza de Plata" // Propiedad opcional presente
};

// Personaje sin gremio (TypeScript lo permite gracias al '?')
const personaje2: PersonajeRPG = {
    nombre: "Sylvanas",
    clase: "Cazadora",
    nivel: 15,
    puntosVida: 110
    // gremio está ausente y es perfectamente válido
};

const personaje3: PersonajeRPG = {
    nombre: "Tiffin",
    clase: "Pícaro",
    nivel: 5,
    puntosVida: 75
    // Tampoco tiene gremio
};

// 3. AGRUPACIÓN EN UNA LISTA (ARRAY DE PERSONAJES)
const listaPersonajes: PersonajeRPG[] = [personaje1, personaje2, personaje3];

// 4. RETO EXTRA: FILTRAR PARA UNA MISIÓN DIFÍCIL (Nivel >= 10)
const personajesMisionDificil = listaPersonajes.filter(personaje => personaje.nivel >= 10);

// ==========================================
// RESULTADO ESPERADO EN CONSOLA
// ==========================================
console.log("=== TODOS LOS PERSONAJES VÁLIDOS ===");
listaPersonajes.forEach(p => {
    // Usamos el operador ?? para dar un texto por defecto si el gremio es undefined
    console.log(`- ${p.nombre} (${p.clase}) | Nivel: ${p.nivel} | Gremio: ${p.gremio ?? "Ninguno"}`);
});

console.log("\n PERSONAJES LISTOS PARA LA MISIÓN DIFÍCIL (NIVEL 10+) ⚔️");
personajesMisionDificil.forEach(p => {
    console.log(`- ¡${p.nombre} el ${p.clase} está listo con nivel ${p.nivel}!`);
});