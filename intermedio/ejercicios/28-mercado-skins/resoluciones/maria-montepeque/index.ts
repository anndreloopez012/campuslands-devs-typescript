export {};

type Rareza = "comun" | "rara" | "epica" | "legendaria";
type BandaPrecio = readonly [minimo: number, maximo: number];

interface Skin {
  readonly id: number;
  readonly nombre: string;
  readonly arma: string;
  readonly rareza: Rareza;
  readonly precio: number;
  readonly vendedor: string;
}

const bandaPorRareza: Record<Rareza, BandaPrecio> = {
  comun: [1, 10],
  rara: [10, 40],
  epica: [40, 150],
  legendaria: [150, 1000],
};

const skins: readonly Skin[] = [
  { id: 1, nombre: "Neon Rush", arma: "Rifle", rareza: "rara", precio: 25, vendedor: "zeta" },
  { id: 2, nombre: "Dragon Lore", arma: "Francotirador", rareza: "legendaria", precio: 480, vendedor: "alfa" },
  { id: 3, nombre: "Camo Basico", arma: "Pistola", rareza: "comun", precio: 3, vendedor: "zeta" },
  { id: 4, nombre: "Plasma Storm", arma: "Rifle", rareza: "epica", precio: 90, vendedor: "beta" },
  { id: 5, nombre: "Oro Falso", arma: "Pistola", rareza: "legendaria", precio: 20, vendedor: "alfa" },
  { id: 6, nombre: "Regalo", arma: "Escopeta", rareza: "comun", precio: 0, vendedor: "beta" },
  { id: 7, nombre: "Sin Vendedor", arma: "Rifle", rareza: "rara", precio: 30, vendedor: "" },
];

const esSkinValida = (skin: Skin): boolean =>
  skin.nombre.trim().length > 0 && skin.vendedor.trim().length > 0 && skin.precio > 0;

const precioSospechoso = (skin: Skin): boolean => {
  const [minimo, maximo] = bandaPorRareza[skin.rareza];
  return skin.precio < minimo || skin.precio > maximo;
};

const agruparPorVendedor = (items: readonly Skin[]): Map<string, Skin[]> =>
  items.reduce((mapa, skin) => {
    mapa.set(skin.vendedor, [...(mapa.get(skin.vendedor) ?? []), skin]);
    return mapa;
  }, new Map<string, Skin[]>());

const validas = skins.filter(esSkinValida);
const invalidas = skins.filter((skin) => !esSkinValida(skin));
const sospechosas = validas.filter(precioSospechoso);
const rarezasEnVenta = new Set(validas.map((skin) => skin.rareza));

console.log("Ejercicio 28: Mercado de skins");
console.log(`Skins validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((s) => console.log(`  - #${s.id} "${s.nombre}" tiene datos invalidos`));
sospechosas.forEach((s) => {
  const [min, max] = bandaPorRareza[s.rareza];
  console.log(`  ! #${s.id} "${s.nombre}" (${s.rareza}) a $${s.precio}, esperado $${min}-$${max}`);
});
agruparPorVendedor(validas).forEach((items, vendedor) => {
  const total = items.reduce((acc, skin) => acc + skin.precio, 0);
  console.log(`  ${vendedor}: ${items.length} skin(s), valor $${total}`);
});
console.log(`Rarezas en venta: ${Array.from(rarezasEnVenta).join(", ")}`);
