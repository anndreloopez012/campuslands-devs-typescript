// Solución Ejercicio Intermedio 69 - Stefani Sánchez
export {};

type Asiento = string; // Ejemplo: "B3" = fila B, columna 3

interface Estado {
  readonly filas: readonly string[];
  readonly columnas: number;
  readonly ocupados: ReadonlySet<Asiento>;
  readonly seleccion: readonly Asiento[];
  readonly confirmadas: number;
}

type Accion =
  | { readonly tipo: "seleccionar"; readonly asiento: Asiento }
  | { readonly tipo: "deseleccionar"; readonly asiento: Asiento }
  | { readonly tipo: "confirmar" };

type Resultado = { readonly estado: Estado; readonly aviso: string | null };

const MAX_POR_COMPRA = 4;

const inicial: Estado = {
  filas: ["A", "B", "C"],
  columnas: 6,
  ocupados: new Set(["A1", "A2", "B3", "C6"]),
  seleccion: [],
  confirmadas: 0,
};

const existe = (e: Estado, asiento: Asiento): boolean => {
  const partes = /^([A-Z])(\d+)$/.exec(asiento);
  return partes !== null && e.filas.includes(partes[1]) && Number(partes[2]) >= 1 && Number(partes[2]) <= e.columnas;
};

const reducer = (e: Estado, accion: Accion): Resultado => {
  switch (accion.tipo) {
    case "seleccionar":
      if (!existe(e, accion.asiento)) return { estado: e, aviso: `${accion.asiento} no existe` };
      if (e.ocupados.has(accion.asiento)) return { estado: e, aviso: `${accion.asiento} ya esta ocupado` };
      if (e.seleccion.includes(accion.asiento)) return { estado: e, aviso: `${accion.asiento} ya estaba seleccionado` };
      if (e.seleccion.length >= MAX_POR_COMPRA) return { estado: e, aviso: `maximo ${MAX_POR_COMPRA} asientos por compra` };
      return { estado: { ...e, seleccion: [...e.seleccion, accion.asiento] }, aviso: null };
    case "deseleccionar":
      return { estado: { ...e, seleccion: e.seleccion.filter((a) => a !== accion.asiento) }, aviso: null };
    case "confirmar":
      if (e.seleccion.length === 0) return { estado: e, aviso: "no hay asientos seleccionados" };
      return {
        estado: { ...e, ocupados: new Set([...e.ocupados, ...e.seleccion]), seleccion: [], confirmadas: e.confirmadas + e.seleccion.length },
        aviso: null,
      };
  }
};

const dibujar = (e: Estado): string[] =>
  e.filas.map((fila) =>
    Array.from({ length: e.columnas }, (_, i) => {
      const id = `${fila}${i + 1}`;
      return e.ocupados.has(id) ? "[X]" : e.seleccion.includes(id) ? "[*]" : "[ ]";
    }).join(""),
  );

console.log("Ejercicio 69: Reservas de cine");
const guion: readonly Accion[] = [
  { tipo: "seleccionar", asiento: "B4" },
  { tipo: "seleccionar", asiento: "B5" },
  { tipo: "seleccionar", asiento: "A1" },
  { tipo: "seleccionar", asiento: "Z9" },
  { tipo: "seleccionar", asiento: "B4" },
  { tipo: "seleccionar", asiento: "C1" },
  { tipo: "seleccionar", asiento: "C2" },
  { tipo: "seleccionar", asiento: "C3" },
  { tipo: "deseleccionar", asiento: "C3" },
  { tipo: "confirmar" },
  { tipo: "confirmar" },
  { tipo: "seleccionar", asiento: "B4" },
];

let estado = inicial;
guion.forEach((accion) => {
  const { estado: siguiente, aviso } = reducer(estado, accion);
  estado = siguiente;
  const detalle = "asiento" in accion ? ` ${accion.asiento}` : "";
  console.log(`  ${accion.tipo}${detalle}${aviso ? `  ! ${aviso}` : ""}`);
});
console.log("Sala (X ocupado, * seleccionado):");
dibujar(estado).forEach((fila, i) => console.log(`  ${estado.filas[i]} ${fila}`));
console.log(`Entradas confirmadas: ${estado.confirmadas} | libres: ${estado.filas.length * estado.columnas - estado.ocupados.size}`);
