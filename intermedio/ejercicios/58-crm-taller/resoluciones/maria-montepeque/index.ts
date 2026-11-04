export {};

type EstadoOrden = "recibida" | "en-proceso" | "lista" | "entregada";

interface Cliente {
  readonly id: number;
  readonly nombre: string;
  readonly telefono: string;
}

interface Orden {
  readonly id: number;
  readonly clienteId: number;
  readonly moto: string;
  readonly trabajo: string;
  readonly estado: EstadoOrden;
  readonly costo: number;
}

class NoEncontrado extends Error {
  constructor(entidad: string, id: number) {
    super(`${entidad} ${id} no encontrado`);
    this.name = "NoEncontrado";
  }
}

class DatoInvalido extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatoInvalido";
  }
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

class Repositorio<T extends { readonly id: number }> {
  private readonly datos = new Map<number, T>();

  async guardar(item: T): Promise<T> {
    await esperar(2);
    this.datos.set(item.id, item);
    return item;
  }

  async obtener(id: number, entidad: string): Promise<T> {
    await esperar(2);
    const item = this.datos.get(id);
    if (!item) throw new NoEncontrado(entidad, id);
    return item;
  }

  async listar(filtro: (item: T) => boolean = () => true): Promise<T[]> {
    await esperar(2);
    return [...this.datos.values()].filter(filtro);
  }
}

const clientes = new Repositorio<Cliente>();
const ordenes = new Repositorio<Orden>();

const registrarCliente = async (cliente: Cliente): Promise<Cliente> => {
  if (!/^\d{8}$/.test(cliente.telefono)) throw new DatoInvalido(`Telefono invalido para ${cliente.nombre}`);
  return clientes.guardar(cliente);
};

const abrirOrden = async (orden: Orden): Promise<Orden> => {
  await clientes.obtener(orden.clienteId, "Cliente");
  if (orden.costo <= 0) throw new DatoInvalido(`La orden ${orden.id} necesita un costo positivo`);
  return ordenes.guardar(orden);
};

const avanzarOrden = async (id: number): Promise<Orden> => {
  const orden = await ordenes.obtener(id, "Orden");
  const siguiente: Record<EstadoOrden, EstadoOrden> = {
    recibida: "en-proceso",
    "en-proceso": "lista",
    lista: "entregada",
    entregada: "entregada",
  };
  return ordenes.guardar({ ...orden, estado: siguiente[orden.estado] });
};

const intentar = async (descripcion: string, accion: () => Promise<unknown>): Promise<void> => {
  try {
    await accion();
    console.log(`  ok  ${descripcion}`);
  } catch (error) {
    console.log(`  ERR ${descripcion}: ${error instanceof Error ? `${error.name} - ${error.message}` : "desconocido"}`);
  }
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 58: Mini CRM de taller");
  await intentar("registrar Ana", () => registrarCliente({ id: 1, nombre: "Ana", telefono: "55512345" }));
  await intentar("registrar Beto", () => registrarCliente({ id: 2, nombre: "Beto", telefono: "55598765" }));
  await intentar("registrar Cris (telefono malo)", () => registrarCliente({ id: 3, nombre: "Cris", telefono: "123" }));
  await intentar("orden 1 de Ana", () => abrirOrden({ id: 1, clienteId: 1, moto: "Honda CB500", trabajo: "Cambio de aceite", estado: "recibida", costo: 60 }));
  await intentar("orden 2 de Beto", () => abrirOrden({ id: 2, clienteId: 2, moto: "Kawasaki Z650", trabajo: "Frenos", estado: "recibida", costo: 140 }));
  await intentar("orden 3 de cliente 9", () => abrirOrden({ id: 3, clienteId: 9, moto: "Yamaha R3", trabajo: "Revision", estado: "recibida", costo: 30 }));
  await intentar("orden 4 sin costo", () => abrirOrden({ id: 4, clienteId: 1, moto: "Honda CB500", trabajo: "Garantia", estado: "recibida", costo: 0 }));
  await intentar("avanzar orden 1", () => avanzarOrden(1));
  await intentar("avanzar orden 1", () => avanzarOrden(1));
  await intentar("avanzar orden 77", () => avanzarOrden(77));

  const abiertas = await ordenes.listar((o) => o.estado !== "entregada");
  const ingresos = abiertas.reduce((acc, o) => acc + o.costo, 0);
  console.log(`Ordenes abiertas: ${abiertas.map((o) => `#${o.id} ${o.estado}`).join(", ")} | valor $${ingresos}`);
};

void main();
