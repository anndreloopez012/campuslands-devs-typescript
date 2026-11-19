export {};

// Intermedio 58: Mini CRM de taller
// Tematica: motos y mecanica de motos
// Resolucion: Dulce Morales
//
// Problema: un taller de motos lleva un mini CRM: clientes, sus motos y los servicios que se les
// hicieron. Los datos viven en una "base de datos" remota (simulada, con demora). Hay que:
// registrar clientes sin duplicar correo, registrar motos solo de clientes existentes (si falla la
// moto, se deshace el cliente nuevo), y mandar recordatorios de mantenimiento por correo en lote:
// algunos envios fallan y el resto sigue. Errores tipados en cada caso.

// ===================== TIPOS =====================

interface Cliente {
  readonly id: number;
  readonly nombre: string;
  readonly correo: string;
  readonly telefono: string;
}

interface Moto {
  readonly placa: string;
  readonly clienteId: number;
  readonly modelo: string;
}

interface Servicio {
  readonly placa: string;
  readonly fecha: Date;
  readonly descripcion: string;
  readonly costo: number;
}

// ===================== ERRORES TIPADOS =====================

class ErrorDuplicado extends Error {
  constructor(public readonly campo: string, public readonly valor: string) {
    super(`ya existe un registro con ${campo} "${valor}"`);
    this.name = "ErrorDuplicado";
  }
}

class ErrorNoEncontrado extends Error {
  constructor(public readonly entidad: string, public readonly id: string) {
    super(`${entidad} ${id} no existe`);
    this.name = "ErrorNoEncontrado";
  }
}

class ErrorValidacion extends Error {
  constructor(detalle: string) {
    super(detalle);
    this.name = "ErrorValidacion";
  }
}

class ErrorEnvio extends Error {
  constructor(public readonly destino: string, motivo: string) {
    super(`no se pudo enviar a ${destino}: ${motivo}`);
    this.name = "ErrorEnvio";
  }
}

type ErrorCrm = ErrorDuplicado | ErrorNoEncontrado | ErrorValidacion | ErrorEnvio;

function esErrorCrm(e: unknown): e is ErrorCrm {
  return e instanceof ErrorDuplicado || e instanceof ErrorNoEncontrado || e instanceof ErrorValidacion || e instanceof ErrorEnvio;
}

// ===================== BASE DE DATOS SIMULADA =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Tabla generica asincrona: cada operacion tarda un poco, como una base de datos real
class TablaRemota<T, K> {
  private readonly filas: Map<K, T> = new Map();

  constructor(private readonly clave: (fila: T) => K) {}

  async insertar(fila: T): Promise<T> {
    await esperar(3);
    this.filas.set(this.clave(fila), fila);
    return fila;
  }

  async borrar(k: K): Promise<void> {
    await esperar(3);
    this.filas.delete(k);
  }

  async buscar(k: K): Promise<T | undefined> {
    await esperar(2);
    return this.filas.get(k);
  }

  async donde(pred: (f: T) => boolean): Promise<T[]> {
    await esperar(2);
    return [...this.filas.values()].filter(pred);
  }
}

// ===================== SERVICIO CRM =====================

const CORREO_VALIDO: RegExp = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PLACA_VALIDA: RegExp = /^[A-Z]{3}\d{2}[A-Z]$/; // ej. ABC12D

class CrmTaller {
  private siguienteId: number = 1;
  private readonly clientes: TablaRemota<Cliente, number> = new TablaRemota((c) => c.id);
  private readonly motos: TablaRemota<Moto, string> = new TablaRemota((m) => m.placa);
  private readonly servicios: TablaRemota<Servicio, string> = new TablaRemota((s) => `${s.placa}-${s.fecha.getTime()}`);

  async registrarCliente(nombre: string, correo: string, telefono: string): Promise<Cliente> {
    if (!CORREO_VALIDO.test(correo)) throw new ErrorValidacion(`correo invalido: "${correo}"`);
    if (!/^\d{10}$/.test(telefono)) throw new ErrorValidacion(`telefono invalido: "${telefono}" (deben ser 10 digitos)`);
    const repetido: Cliente[] = await this.clientes.donde((c) => c.correo.toLowerCase() === correo.toLowerCase());
    if (repetido.length > 0) throw new ErrorDuplicado("correo", correo);
    return this.clientes.insertar({ id: this.siguienteId++, nombre, correo, telefono });
  }

  async registrarMoto(clienteId: number, placa: string, modelo: string): Promise<Moto> {
    if (!PLACA_VALIDA.test(placa)) throw new ErrorValidacion(`placa invalida: "${placa}"`);
    if ((await this.clientes.buscar(clienteId)) === undefined) throw new ErrorNoEncontrado("cliente", String(clienteId));
    if ((await this.motos.buscar(placa)) !== undefined) throw new ErrorDuplicado("placa", placa);
    return this.motos.insertar({ placa, clienteId, modelo });
  }

  // Alta de cliente nuevo con su moto: si la moto falla, se deshace el cliente (como una transaccion)
  async altaCompleta(nombre: string, correo: string, telefono: string, placa: string, modelo: string): Promise<{ cliente: Cliente; moto: Moto }> {
    const cliente: Cliente = await this.registrarCliente(nombre, correo, telefono);
    try {
      const moto: Moto = await this.registrarMoto(cliente.id, placa, modelo);
      return { cliente, moto };
    } catch (e: unknown) {
      await this.clientes.borrar(cliente.id);
      throw e;
    }
  }

  async registrarServicio(placa: string, fecha: Date, descripcion: string, costo: number): Promise<Servicio> {
    if ((await this.motos.buscar(placa)) === undefined) throw new ErrorNoEncontrado("moto", placa);
    return this.servicios.insertar({ placa, fecha, descripcion, costo });
  }

  // Motos cuyo ultimo servicio fue hace MAS de "meses" meses (o que nunca tuvieron servicio)
  async sinServicioReciente(hoy: Date, meses: number): Promise<{ cliente: Cliente; moto: Moto; ultimo: Date | null }[]> {
    const limite: Date = new Date(hoy.getFullYear(), hoy.getMonth() - meses, hoy.getDate());
    const motos: Moto[] = await this.motos.donde(() => true);
    const resultado: { cliente: Cliente; moto: Moto; ultimo: Date | null }[] = [];
    for (const moto of motos) {
      const servicios: Servicio[] = await this.servicios.donde((s) => s.placa === moto.placa);
      const ultimo: Date | null = servicios.reduce<Date | null>((max, s) => (max === null || s.fecha > max ? s.fecha : max), null);
      const cliente: Cliente | undefined = await this.clientes.buscar(moto.clienteId);
      if (cliente !== undefined && (ultimo === null || ultimo.getTime() < limite.getTime())) resultado.push({ cliente, moto, ultimo });
    }
    return resultado;
  }

  async contarClientes(): Promise<number> {
    return (await this.clientes.donde(() => true)).length;
  }
}

// Servicio de correo simulado: rechaza dominios que "no existen"
async function enviarCorreo(destino: string, asunto: string): Promise<string> {
  await esperar(5);
  if (destino.endsWith("@correo-viejo.com")) throw new ErrorEnvio(destino, "el dominio ya no existe");
  return `enviado "${asunto}" a ${destino}`;
}

// ===================== SALIDA =====================

function f(anio: number, mes: number, dia: number): Date {
  return new Date(anio, mes - 1, dia);
}

async function intentar<T>(etiqueta: string, accion: () => Promise<T>, mostrar: (r: T) => string): Promise<void> {
  try {
    console.log(`OK ${etiqueta}: ${mostrar(await accion())}`);
  } catch (e: unknown) {
    if (esErrorCrm(e)) console.log(`X  ${etiqueta}: [${e.name}] ${e.message}`);
    else throw e;
  }
}

async function main(): Promise<void> {
  const crm: CrmTaller = new CrmTaller();
  console.log("================ REGISTROS ================");
  const cli = (c: Cliente): string => `cliente #${c.id} ${c.nombre}`;
  const alta = (r: { cliente: Cliente; moto: Moto }): string => `${r.cliente.nombre} (#${r.cliente.id}) con ${r.moto.modelo} ${r.moto.placa}`;
  await intentar("Alta Laura", () => crm.altaCompleta("Laura Rios", "laura@mail.com", "3001112233", "KMT23A", "Yamaha MT-03"), alta);
  await intentar("Alta Pedro", () => crm.altaCompleta("Pedro Gil", "pedro@correo-viejo.com", "3004445566", "BCD45E", "Honda CB190"), alta);
  await intentar("Alta Sara", () => crm.altaCompleta("Sara Vega", "sara@mail.com", "3007778899", "FGH67J", "Suzuki Gixxer"), alta);
  await intentar("Alta correo repetido", () => crm.registrarCliente("Laura Dos", "LAURA@mail.com", "3000000000"), cli);
  await intentar("Alta correo invalido", () => crm.registrarCliente("Tito", "tito-arroba-mail", "3000000001"), cli);
  await intentar("Alta telefono corto", () => crm.registrarCliente("Tita", "tita@mail.com", "12345"), cli);
  // Si la moto falla, el cliente nuevo NO debe quedar guardado
  await intentar("Alta con placa repetida", () => crm.altaCompleta("Mario Paz", "mario@mail.com", "3002223344", "KMT23A", "KTM Duke"), alta);
  await intentar("Moto de cliente inexistente", () => crm.registrarMoto(99, "XYZ99Z", "Bajaj"), (m) => m.placa);
  await intentar("Segunda moto de Laura", () => crm.registrarMoto(1, "LMN01P", "Kawasaki Z400"), (m) => `${m.modelo} ${m.placa}`);
  console.log(`Clientes guardados: ${await crm.contarClientes()} (Mario no quedo guardado porque su moto fallo)`);

  console.log("\n================ SERVICIOS ================");
  await intentar("Servicio KMT23A", () => crm.registrarServicio("KMT23A", f(2026, 9, 10), "cambio de aceite", 35), (s) => s.descripcion);
  await intentar("Servicio BCD45E", () => crm.registrarServicio("BCD45E", f(2026, 3, 2), "frenos", 60), (s) => s.descripcion);
  await intentar("Servicio FGH67J", () => crm.registrarServicio("FGH67J", f(2026, 5, 16), "afinacion", 80), (s) => s.descripcion); // limite: 6 meses EXACTOS
  await intentar("Servicio a placa inexistente", () => crm.registrarServicio("ZZZ00Z", f(2026, 11, 1), "nada", 0), (s) => s.descripcion);

  const hoy: Date = f(2026, 11, 16);
  console.log("\n================ RECORDATORIOS (sin servicio en mas de 6 meses) ================");
  const pendientes = await crm.sinServicioReciente(hoy, 6);
  pendientes.forEach(({ cliente, moto, ultimo }) => console.log(`- ${cliente.nombre}: ${moto.modelo} ${moto.placa}, ultimo servicio ${ultimo ? ultimo.toLocaleDateString("es") : "nunca"}`));

  const envios = await Promise.allSettled(pendientes.map(({ cliente, moto }) => enviarCorreo(cliente.correo, `Tu ${moto.modelo} necesita mantenimiento`)));
  envios.forEach((r) => {
    if (r.status === "fulfilled") console.log(`  OK ${r.value}`);
    else if (esErrorCrm(r.reason)) console.log(`  X  [${r.reason.name}] ${r.reason.message}`);
  });
  const ok: number = envios.filter((r) => r.status === "fulfilled").length;
  console.log(`Enviados ${ok} de ${envios.length}`);
}

main();
