export {};

// tipos
type Categoria = 'taco' | 'burrito' | 'bebida' | 'postre';

interface Producto {
  readonly nombre: string;
  categoria: Categoria;
  precio: number;
}

interface LineaPedido {
  readonly producto: Producto;
  cantidad: number;
}

interface Pedido {
  readonly id: number;
  readonly cliente: string;
  lineas: LineaPedido[];
  pagado: boolean;
}

// datos
const menu: Producto[] = [
  { nombre: 'Taco al pastor', categoria: 'taco', precio: 2.5 },
  { nombre: 'Burrito de carne', categoria: 'burrito', precio: 5.0 },
  { nombre: 'Agua de jamaica', categoria: 'bebida', precio: 1.5 },
  { nombre: 'Flan', categoria: 'postre', precio: 2.0 },
];

const pedidos: Pedido[] = [
  { id: 1, cliente: 'Ana', pagado: true, lineas: [
    { producto: menu[0], cantidad: 4 },
    { producto: menu[2], cantidad: 2 },
  ] },
  { id: 2, cliente: 'Bruno', pagado: false, lineas: [
    { producto: menu[1], cantidad: 1 },
    { producto: menu[3], cantidad: 2 },
    { producto: menu[2], cantidad: 1 },
  ] },
  { id: 3, cliente: 'Carla', pagado: true, lineas: [
    { producto: menu[0], cantidad: 2 },
    { producto: menu[1], cantidad: 1 },
  ] },
];

// validacion
function validarPedido(pedido: Pedido): string[] {
  const errores: string[] = [];

  if (pedido.lineas.length === 0) errores.push(`Pedido ${pedido.id}: sin lineas`);
  if (!pedido.lineas.every((linea) => linea.cantidad > 0)) errores.push(`Pedido ${pedido.id}: cantidad invalida`);
  if (!pedido.lineas.every((linea) => linea.producto.precio > 0)) errores.push(`Pedido ${pedido.id}: precio invalido`);

  return errores;
}

// calculos
function costoLinea(linea: LineaPedido): number {
  return Number((linea.producto.precio * linea.cantidad).toFixed(2));
}

function totalPedido(pedido: Pedido): number {
  return Number(pedido.lineas.reduce((total, linea) => total + costoLinea(linea), 0).toFixed(2));
}

function unidadesVendidas(pedidos: Pedido[]): Record<string, number> {
  return pedidos
    .filter((pedido) => pedido.pagado)
    .reduce<Record<string, number>>((acumulador, pedido) => {
      pedido.lineas.forEach((linea) => {
        acumulador[linea.producto.nombre] = (acumulador[linea.producto.nombre] ?? 0) + linea.cantidad;
      });
      return acumulador;
    }, {});
}

function productoMasVendido(pedidos: Pedido[]): string | null {
  const conteo = unidadesVendidas(pedidos);
  const entradas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  return entradas.length > 0 ? entradas[0][0] : null;
}

// salida
function mostrarResumen(pedidos: Pedido[]): void {
  console.log('=== Pedidos de food truck ===');
  pedidos.forEach((pedido) => {
    const errores = validarPedido(pedido);
    console.log(`Pedido ${pedido.id} (${pedido.cliente}) | Total: $${totalPedido(pedido)} | Pagado: ${pedido.pagado ? 'si' : 'no'}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
  console.log('Unidades vendidas:', unidadesVendidas(pedidos));
  console.log(`Producto mas vendido: ${productoMasVendido(pedidos) ?? 'ninguno'}`);
}

mostrarResumen(pedidos);
