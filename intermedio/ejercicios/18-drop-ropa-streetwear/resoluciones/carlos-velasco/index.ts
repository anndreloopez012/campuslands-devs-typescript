export {};

// tipos
type Talla = 's' | 'm' | 'l' | 'xl';

interface Prenda {
  readonly nombre: string;
  readonly marca: string;
  precio: number;
  stock: number;
  tallasDisponibles: Talla[];
}

// datos
const drop: Prenda[] = [
  { nombre: 'Hoodie Asfalto', marca: 'Kuro', precio: 45, stock: 12, tallasDisponibles: ['s', 'm', 'l', 'xl'] },
  { nombre: 'Cargo Gris', marca: 'Nube', precio: 38, stock: 0, tallasDisponibles: ['m', 'l'] },
  { nombre: 'Camiseta Neon', marca: 'Kuro', precio: 22, stock: 30, tallasDisponibles: ['s', 'm'] },
  { nombre: 'Chaqueta Reflejante', marca: 'Vantablack', precio: 60, stock: 5, tallasDisponibles: ['l', 'xl'] },
];

// reglas
const precioMinimoReserva = 20;

// validacion
function validarPrenda(prenda: Prenda): string[] {
  const errores: string[] = [];

  if (prenda.precio < precioMinimoReserva) errores.push(`${prenda.nombre}: precio por debajo de la reserva`);
  if (prenda.stock < 0) errores.push(`${prenda.nombre}: stock negativo`);
  if (prenda.tallasDisponibles.length === 0) errores.push(`${prenda.nombre}: sin tallas`);

  return errores;
}

// acciones
function vender(prenda: Prenda, talla: Talla, cantidad: number): boolean {
  if (cantidad <= 0 || cantidad > prenda.stock) return false;
  if (!prenda.tallasDisponibles.includes(talla)) return false;

  prenda.stock -= cantidad;
  if (prenda.stock === 0) prenda.tallasDisponibles = [];
  return true;
}

// calculos
function valorInventario(drop: Prenda[]): number {
  return Number(drop.reduce((total, prenda) => total + prenda.precio * prenda.stock, 0).toFixed(2));
}

function marcasEnDrop(drop: Prenda[]): string[] {
  return [...new Set(drop.map((prenda) => prenda.marca))];
}

function disponibles(drop: Prenda[]): Prenda[] {
  return drop.filter((prenda) => prenda.stock > 0 && prenda.tallasDisponibles.length > 0);
}

// salida
function mostrarResumen(drop: Prenda[]): void {
  console.log('=== Drop de ropa streetwear ===');
  console.log(`Valor del inventario: $${valorInventario(drop)}`);
  console.log('Marcas en el drop:', marcasEnDrop(drop).join(', '));
  console.log('Disponibles:', disponibles(drop).map((prenda) => `${prenda.nombre} (${prenda.stock})`).join(', '));

  const venta = vender(drop[2], 'm', 2);
  console.log(`Venta de Camiseta Neon talla m: ${venta ? 'confirmada' : 'rechazada'}`);

  drop.forEach((prenda) => {
    const errores = validarPrenda(prenda);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(drop);
