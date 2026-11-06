type ID = {
    id: string; 
}

type videojuegos = ID & {
    juego: string;
    consola: string; 
}

function buscarjuego<T extends ID>(juego: T[], id: string): T | undefined{
    return juego.find(juegos  => juegos.id === id);
}

const juegos: videojuegos[] = [
  { id: "JUEGO-01", juego: "Cuphead", consola: "Nintendo Switch" },
    { id: "JUEGO-02", juego: "Minecraft", consola: "PC" }
];


console.log(buscarjuego(juegos,"JUEGO-01"));