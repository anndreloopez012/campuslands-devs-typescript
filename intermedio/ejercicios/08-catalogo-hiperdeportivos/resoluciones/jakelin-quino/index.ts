export { };

interface Item {
  name: string;
  value: number;
  active: boolean;
}

const items: readonly Item[] = [
  { name: "Principal", value: 80, active: true },
  { name: "Secundario", value: 45, active: true },
  { name: "Prueba limite", value: 0, active: false },
];

const total = (data: readonly Item[]): number =>
  data.filter(item => item.active)
      .reduce((sum, item) => sum + item.value, 0);

const best = [...items].filter(item => item.active)
  .sort((a, b) => b.value - a.value)[0];

console.log("Catalogo de hiperdeportivos");
console.log("interfaces, arrays tipados, funciones puras y rankings");
console.log(`Total activo: ${total(items)} | Mejor: ${best?.name ?? "N/A"}`);
console.log(`Caso limite: ${items.at(-1)?.value}`);
