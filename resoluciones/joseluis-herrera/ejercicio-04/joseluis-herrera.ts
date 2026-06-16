

type Contrato_Personaje = {
    nombre: string;
    poder: string;
    nivel: number;
    descripcion:string;
    Puntos_de_vida: number;
    clan?: string;
    clase?: string;
}

const personaje: Contrato_Personaje[] = [
    {nombre: "Garrek Rompetierra",
    poder: "Furia Sísmica",
    nivel: 42,
    descripcion: "Un veterano de mil batallas capaz de agrietar la tierra con un solo golpe de su martillo.",
    Puntos_de_vida: 2500,
    clan: "Colmillos de Piedra",
    clase: "Guerrero"},

    {nombre: "Aylin la Tejedora de Luz",
    poder: "Destello Prisma",
    nivel: 55,
    descripcion: "Manipula la energía solar para incinerar a las sombras o curar a sus aliados en combate.",
    Puntos_de_vida: 1200,
    clase: "Maga de Luz"},

    {nombre: "Kaelen Vane",
    poder: "Paso Sombrío",
    nivel: 5,
    descripcion: "Se desvanece en la oscuridad de la noche, dejando solo un rastro de niebla antes de atacar.",
    Puntos_de_vida: 950,
    clan: "La Hermandad del Cuervo"},

    {nombre: "Grootok",
    poder: "Raíces Constrictoras",
    nivel: 9,
    descripcion: "Un espíritu del bosque ancestral que despertó para defender su territorio de los leñadores.",
    Puntos_de_vida: 1800}
]

const personajeslistos = personaje.filter(personajes => personajes.nivel > 10);

console.log("Los personajes Listos para la misison son:", personajeslistos.map(personajes => personajes.nombre).join(" , "));