export {};

// Intermedio 70: Terminal sci-fi
// Tematica: ciencia ficcion
// Resolucion: Dulce Morales
//
// Problema: la terminal de mando de una nave. La persona escribe lineas de texto; cada linea se
// interpreta (parser) y se convierte en un evento tipado. Un reducer puro aplica el evento sobre el
// estado de la terminal, que es una maquina de estados: bloqueada -> sesion abierta -> (alerta),
// con bloqueo temporal tras 3 codigos incorrectos.

// ===================== TIPOS =====================

type Nivel = "tripulante" | "oficial" | "capitan";
type Sector = "ALFA" | "BETA" | "GAMMA" | "DELTA";

interface Credencial {
  readonly codigo: string;
  readonly nombre: string;
  readonly nivel: Nivel;
}

interface Nave {
  readonly sector: Sector;
  readonly combustible: number; // porcentaje
  readonly motor: boolean;
  readonly escudos: boolean;
}

type Terminal =
  | { readonly modo: "bloqueada"; readonly intentos: number }
  | { readonly modo: "cerrojo"; readonly hastaTurno: number } // demasiados intentos
  | { readonly modo: "sesion"; readonly usuario: Credencial }
  | { readonly modo: "alerta"; readonly usuario: Credencial; readonly amenaza: Sector };

interface Estado {
  readonly terminal: Terminal;
  readonly nave: Nave;
  readonly turno: number;
}

// Lo que sale del parser: un comando valido o un error de sintaxis
type Comando =
  | { readonly cmd: "login"; readonly codigo: string }
  | { readonly cmd: "logout" }
  | { readonly cmd: "estado" }
  | { readonly cmd: "motor"; readonly encendido: boolean }
  | { readonly cmd: "escudos"; readonly activos: boolean }
  | { readonly cmd: "escanear"; readonly sector: Sector }
  | { readonly cmd: "salto"; readonly sector: Sector }
  | { readonly cmd: "ayuda" };

type Parseo = { readonly ok: true; readonly comando: Comando } | { readonly ok: false; readonly error: string };

// ===================== DATOS =====================

const CREDENCIALES: readonly Credencial[] = [
  { codigo: "7741", nombre: "Ixchel", nivel: "capitan" },
  { codigo: "3020", nombre: "Bruno", nivel: "oficial" },
  { codigo: "1111", nombre: "Tomas", nivel: "tripulante" },
];

const SECTORES: readonly Sector[] = ["ALFA", "BETA", "GAMMA", "DELTA"];
const AMENAZAS: ReadonlySet<Sector> = new Set<Sector>(["GAMMA"]);
const MAX_INTENTOS: number = 3;
const TURNOS_CERROJO: number = 2;
const COSTO_SALTO: number = 30;

// Nivel minimo para cada comando
const PERMISO: Readonly<Record<Comando["cmd"], Nivel | "publico">> = {
  login: "publico",
  ayuda: "publico",
  logout: "tripulante",
  estado: "tripulante",
  escanear: "tripulante",
  escudos: "oficial",
  motor: "oficial",
  salto: "capitan",
};
const RANGO: Readonly<Record<Nivel, number>> = { tripulante: 1, oficial: 2, capitan: 3 };

// ===================== PARSER =====================

function esSector(x: string): x is Sector {
  return SECTORES.some((s) => s === x);
}

function onOff(x: string | undefined): boolean | null {
  if (x === "on") return true;
  if (x === "off") return false;
  return null;
}

function parsear(linea: string): Parseo {
  const [palabra = "", arg] = linea.trim().toLowerCase().split(/\s+/);
  const error = (texto: string): Parseo => ({ ok: false, error: texto });
  const ok = (comando: Comando): Parseo => ({ ok: true, comando });
  switch (palabra) {
    case "login": return arg !== undefined && /^\d{4}$/.test(arg) ? ok({ cmd: "login", codigo: arg }) : error("uso: login <codigo de 4 digitos>");
    case "logout": return ok({ cmd: "logout" });
    case "estado": return ok({ cmd: "estado" });
    case "ayuda": return ok({ cmd: "ayuda" });
    case "motor": case "escudos": {
      const v: boolean | null = onOff(arg);
      if (v === null) return error(`uso: ${palabra} on|off`);
      return ok(palabra === "motor" ? { cmd: "motor", encendido: v } : { cmd: "escudos", activos: v });
    }
    case "escanear": case "salto": {
      const sector: string = (arg ?? "").toUpperCase();
      if (!esSector(sector)) return error(`sector desconocido "${arg ?? ""}" (${SECTORES.join("/")})`);
      return ok(palabra === "salto" ? { cmd: "salto", sector } : { cmd: "escanear", sector });
    }
    default: return error(`comando no reconocido "${palabra}"`);
  }
}

// ===================== REDUCER PURO =====================

interface Resultado {
  readonly estado: Estado;
  readonly salida: string;
}

function usuarioDe(t: Terminal): Credencial | null {
  return t.modo === "sesion" || t.modo === "alerta" ? t.usuario : null;
}

function reducer(s: Estado, c: Comando): Resultado {
  const sig: Estado = { ...s, turno: s.turno + 1 };
  const t: Terminal = s.terminal;
  const r = (estado: Estado, salida: string): Resultado => ({ estado, salida });

  // El cerrojo ignora todo hasta que pasan los turnos
  if (t.modo === "cerrojo") {
    if (s.turno < t.hastaTurno) return r(sig, `TERMINAL BLOQUEADA (${t.hastaTurno - s.turno} turno(s) restantes)`);
    return reducer({ ...s, terminal: { modo: "bloqueada", intentos: 0 } }, c);
  }

  // Permisos
  const usuario: Credencial | null = usuarioDe(t);
  const requerido: Nivel | "publico" = PERMISO[c.cmd];
  if (requerido !== "publico") {
    if (usuario === null) return r(sig, "acceso denegado: inicia sesion");
    if (RANGO[usuario.nivel] < RANGO[requerido]) return r(sig, `acceso denegado: requiere nivel ${requerido}`);
  }

  switch (c.cmd) {
    case "ayuda":
      return r(sig, "comandos: login, logout, estado, escanear, escudos, motor, salto");

    case "login": {
      if (t.modo !== "bloqueada") return r(sig, "ya hay una sesion abierta");
      const cred: Credencial | undefined = CREDENCIALES.find((x) => x.codigo === c.codigo);
      if (cred !== undefined) return r({ ...sig, terminal: { modo: "sesion", usuario: cred } }, `bienvenida/o, ${cred.nombre} [${cred.nivel}]`);
      const intentos: number = t.intentos + 1;
      if (intentos >= MAX_INTENTOS) {
        return r({ ...sig, terminal: { modo: "cerrojo", hastaTurno: sig.turno + TURNOS_CERROJO } }, `codigo incorrecto (${intentos}/${MAX_INTENTOS}). CERROJO ACTIVADO`);
      }
      return r({ ...sig, terminal: { modo: "bloqueada", intentos } }, `codigo incorrecto (${intentos}/${MAX_INTENTOS})`);
    }

    case "logout":
      if (t.modo === "alerta") return r(sig, "no se puede cerrar sesion durante una alerta");
      return r({ ...sig, terminal: { modo: "bloqueada", intentos: 0 } }, "sesion cerrada");

    case "estado": {
      const n: Nave = s.nave;
      return r(sig, `sector ${n.sector} | combustible ${n.combustible}% | motor ${n.motor ? "ON" : "OFF"} | escudos ${n.escudos ? "ON" : "OFF"}${t.modo === "alerta" ? ` | ALERTA en ${t.amenaza}` : ""}`);
    }

    case "escanear": {
      if (!AMENAZAS.has(c.sector)) return r(sig, `escaneo ${c.sector}: despejado`);
      if (usuario === null) return r(sig, "sin sesion");
      return r({ ...sig, terminal: { modo: "alerta", usuario, amenaza: c.sector } }, `escaneo ${c.sector}: FLOTA HOSTIL DETECTADA -> modo alerta`);
    }

    case "escudos": {
      const nave: Nave = { ...s.nave, escudos: c.activos };
      // Subir escudos durante una alerta la resuelve
      if (c.activos && t.modo === "alerta") return r({ ...sig, nave, terminal: { modo: "sesion", usuario: t.usuario } }, "escudos arriba, alerta controlada");
      if (!c.activos && t.modo === "alerta") return r(sig, "no se pueden bajar escudos durante una alerta");
      return r({ ...sig, nave }, `escudos ${c.activos ? "ON" : "OFF"}`);
    }

    case "motor":
      return r({ ...sig, nave: { ...s.nave, motor: c.encendido } }, `motor ${c.encendido ? "ON" : "OFF"}`);

    case "salto": {
      const n: Nave = s.nave;
      if (!n.motor) return r(sig, "salto abortado: motor apagado");
      if (c.sector === n.sector) return r(sig, `ya estamos en ${c.sector}`);
      if (n.combustible < COSTO_SALTO) return r(sig, `salto abortado: combustible ${n.combustible}% (< ${COSTO_SALTO}%)`);
      if (AMENAZAS.has(c.sector) && !n.escudos) return r(sig, `salto abortado: ${c.sector} es hostil y los escudos estan abajo`);
      return r({ ...sig, nave: { ...n, sector: c.sector, combustible: n.combustible - COSTO_SALTO } }, `salto completado a ${c.sector} (-${COSTO_SALTO}% combustible)`);
    }
  }
}

// ===================== SESION =====================

function prompt(t: Terminal): string {
  switch (t.modo) {
    case "bloqueada": return "[----]>";
    case "cerrojo": return "[LOCK]>";
    case "sesion": return `[${t.usuario.nombre}]>`;
    case "alerta": return `[!${t.usuario.nombre}!]>`;
  }
}

function main(): void {
  let s: Estado = { terminal: { modo: "bloqueada", intentos: 0 }, nave: { sector: "ALFA", combustible: 70, motor: false, escudos: false }, turno: 0 };
  const lineas: readonly string[] = [
    "estado",               // sin sesion
    "login 12",             // error de sintaxis
    "login 0000",
    "login 9999",
    "login 5555",           // 3er fallo: cerrojo
    "login 7741",           // codigo correcto, pero el cerrojo manda
    "ayuda",
    "login 1111",           // cerrojo vencido: entra un tripulante
    "motor on",             // requiere oficial
    "escanear beta",
    "logout",
    "login 3020",           // oficial
    "motor on",
    "salto beta",           // requiere capitan
    "escanear gamma",       // entra en alerta
    "logout",
    "hiperespacio",
    "escudos off",
    "escudos on",           // resuelve la alerta
    "logout",
    "login 7741",           // capitan
    "escudos off",
    "salto gamma",          // hostil sin escudos
    "escudos on",
    "salto gamma",
    "salto gamma",
    "motor off",
    "salto delta",
    "motor on",
    "salto delta",          // limite: queda 10%
    "salto beta",
    "estado",
  ];


  for (const linea of lineas) {
    const p: Parseo = parsear(linea);
    const antes: string = prompt(s.terminal).padEnd(12);
    if (!p.ok) {
      s = { ...s, turno: s.turno + 1 };
      console.log(`${antes}${linea.padEnd(16)} ERROR: ${p.error}`);
      continue;
    }
    const res: Resultado = reducer(s, p.comando);
    s = res.estado;
    console.log(`${antes}${linea.padEnd(16)} ${res.salida}`);
  }
}

main();
