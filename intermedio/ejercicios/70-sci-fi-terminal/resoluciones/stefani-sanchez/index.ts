// Solución Ejercicio Intermedio 70 - Stefani Sánchez
export {};

type Estado =
  | { readonly tipo: "bloqueada"; readonly intentos: number }
  | { readonly tipo: "activa"; readonly usuario: string; readonly energia: number; readonly sector: string }
  | { readonly tipo: "apagada" };

type Comando =
  | { readonly nombre: "login"; readonly clave: string }
  | { readonly nombre: "estado" }
  | { readonly nombre: "escanear" }
  | { readonly nombre: "saltar"; readonly sector: string }
  | { readonly nombre: "apagar" }
  | { readonly nombre: "desconocido"; readonly texto: string };

interface Respuesta {
  readonly estado: Estado;
  readonly salida: string;
}

const CLAVE = "andromeda";
const MAX_INTENTOS = 3;
const sectores: Record<string, string> = {
  alfa: "Estacion minera abandonada",
  beta: "Campo de asteroides",
  gamma: "Nebulosa con senal desconocida",
};

const interpretar = (linea: string): Comando => {
  const [nombre, ...resto] = linea.trim().split(/\s+/);
  const argumento = resto.join(" ");
  switch (nombre) {
    case "login": return { nombre: "login", clave: argumento };
    case "estado": return { nombre: "estado" };
    case "escanear": return { nombre: "escanear" };
    case "saltar": return { nombre: "saltar", sector: argumento };
    case "apagar": return { nombre: "apagar" };
    default: return { nombre: "desconocido", texto: linea };
  }
};

const ejecutar = (estado: Estado, comando: Comando): Respuesta => {
  if (estado.tipo === "apagada") return { estado, salida: "Terminal apagada." };

  if (estado.tipo === "bloqueada") {
    if (estado.intentos >= MAX_INTENTOS) return { estado, salida: "ACCESO DENEGADO: terminal bloqueada permanentemente." };
    if (comando.nombre !== "login") return { estado, salida: "Inicie sesion con: login <clave>" };
    if (comando.clave === CLAVE) return { estado: { tipo: "activa", usuario: "capitan", energia: 100, sector: "alfa" }, salida: "Bienvenido, capitan." };
    const intentos = estado.intentos + 1;
    return { estado: { tipo: "bloqueada", intentos }, salida: `Clave incorrecta (${intentos}/${MAX_INTENTOS})` };
  }

  switch (comando.nombre) {
    case "login": return { estado, salida: "Ya hay una sesion activa." };
    case "estado": return { estado, salida: `${estado.usuario} | energia ${estado.energia}% | sector ${estado.sector}` };
    case "escanear": {
      if (estado.energia < 10) return { estado, salida: "Energia insuficiente para escanear." };
      return { estado: { ...estado, energia: estado.energia - 10 }, salida: `Escaneo: ${sectores[estado.sector]}` };
    }
    case "saltar": {
      if (!(comando.sector in sectores)) return { estado, salida: `Sector desconocido: "${comando.sector}"` };
      if (estado.energia < 40) return { estado, salida: "Energia insuficiente para saltar (requiere 40%)." };
      return { estado: { ...estado, energia: estado.energia - 40, sector: comando.sector }, salida: `Salto completado a ${comando.sector}` };
    }
    case "apagar": return { estado: { tipo: "apagada" }, salida: "Apagando sistemas..." };
    case "desconocido": return { estado, salida: `Comando no reconocido: "${comando.texto}"` };
  }
};

console.log("Ejercicio 70: Terminal sci-fi");
const guion = [
  "estado", "login 1234", "login andromeda", "estado", "escanear", "saltar beta", "saltar marte",
  "saltar gamma", "saltar alfa", "escanear", "hackear todo", "apagar", "estado",
];

let estado: Estado = { tipo: "bloqueada", intentos: 0 };
guion.forEach((linea) => {
  const respuesta = ejecutar(estado, interpretar(linea));
  estado = respuesta.estado;
  console.log(`> ${linea}\n  ${respuesta.salida}`);
});
console.log(`Estado final: ${estado.tipo}`);
