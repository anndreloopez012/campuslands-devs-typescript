export {};

type Categoria = "camisetas" | "pantalones" | "chaquetas" | "accesorios";
type Talla = "S" | "M" | "L" | "XL";

interface Prenda {
  readonly id: number;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly tallas: readonly Talla[];
  readonly precio: number;
  readonly oferta: boolean;
}

interface Filtros {
  readonly texto: string;
  readonly categoria: Categoria | null;
  readonly talla: Talla | null;
  readonly precioMax: number | null;
  readonly soloOfertas: boolean;
}

type Accion =
  | { readonly tipo: "texto"; readonly valor: string }
  | { readonly tipo: "categoria"; readonly valor: Categoria | null }
  | { readonly tipo: "talla"; readonly valor: Talla | null }
  | { readonly tipo: "precio-max"; readonly valor: number | null }
  | { readonly tipo: "ofertas" }
  | { readonly tipo: "limpiar" };

const catalogo: readonly Prenda[] = [
  { id: 1, nombre: "Camiseta Oversize Negra", categoria: "camisetas", tallas: ["M", "L", "XL"], precio: 22, oferta: false },
  { id: 2, nombre: "Camiseta Grafica Retro", categoria: "camisetas", tallas: ["S", "M"], precio: 18, oferta: true },
  { id: 3, nombre: "Jogger Cargo", categoria: "pantalones", tallas: ["M", "L"], precio: 45, oferta: false },
  { id: 4, nombre: "Jeans Rotos", categoria: "pantalones", tallas: ["S", "M", "L"], precio: 52, oferta: true },
  { id: 5, nombre: "Chaqueta Bomber", categoria: "chaquetas", tallas: ["L", "XL"], precio: 85, oferta: false },
  { id: 6, nombre: "Gorra Snapback", categoria: "accesorios", tallas: ["M"], precio: 15, oferta: true },
];

const sinFiltros: Filtros = { texto: "", categoria: null, talla: null, precioMax: null, soloOfertas: false };

const reducer = (f: Filtros, accion: Accion): Filtros => {
  switch (accion.tipo) {
    case "texto": return { ...f, texto: accion.valor.trim().toLowerCase() };
    case "categoria": return { ...f, categoria: accion.valor };
    case "talla": return { ...f, talla: accion.valor };
    case "precio-max": return { ...f, precioMax: accion.valor !== null && accion.valor <= 0 ? null : accion.valor };
    case "ofertas": return { ...f, soloOfertas: !f.soloOfertas };
    case "limpiar": return sinFiltros;
  }
};

const aplicar = (items: readonly Prenda[], f: Filtros): Prenda[] =>
  items.filter(
    (p) =>
      p.nombre.toLowerCase().includes(f.texto) &&
      (f.categoria === null || p.categoria === f.categoria) &&
      (f.talla === null || p.tallas.includes(f.talla)) &&
      (f.precioMax === null || p.precio <= f.precioMax) &&
      (!f.soloOfertas || p.oferta),
  );

const describir = (f: Filtros): string => {
  const partes = [
    f.texto && `texto="${f.texto}"`,
    f.categoria && `categoria=${f.categoria}`,
    f.talla && `talla=${f.talla}`,
    f.precioMax !== null && `precio<=${f.precioMax}`,
    f.soloOfertas && "solo ofertas",
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(", ") : "sin filtros";
};

console.log("Ejercicio 73: Tienda de ropa con filtros");
const guion: readonly Accion[] = [
  { tipo: "categoria", valor: "camisetas" },
  { tipo: "talla", valor: "S" },
  { tipo: "ofertas" },
  { tipo: "categoria", valor: null },
  { tipo: "talla", valor: null },
  { tipo: "ofertas" },
  { tipo: "precio-max", valor: 30 },
  { tipo: "texto", valor: "  CAMISETA " },
  { tipo: "precio-max", valor: 5 },
  { tipo: "limpiar" },
];

let filtros = sinFiltros;
guion.forEach((accion) => {
  filtros = reducer(filtros, accion);
  const resultado = aplicar(catalogo, filtros);
  console.log(`  [${describir(filtros)}] -> ${resultado.length} resultado(s): ${resultado.map((p) => p.nombre).join(" | ") || "ninguno"}`);
});
