export {};

type CategoriaComida = 'Hamburguesas Artesanales' | 'Tacos Urbanos' | 'Pizzas al Horno' | 'Bebidas Especiales';
type EstadoPedido = 'Completado' | 'EnPreparacion' | 'Pendiente' | 'Cancelado';

interface ItemPedido {
  readonly itemId: string;
  readonly nombrePlatillo: string;
  readonly precioUnitario: number;
  readonly cantidad: number;
}

interface FichaPedidoFoodTruck {
  readonly pedidoId: string;
  readonly cliente: string;
  readonly categoria: CategoriaComida;
  readonly items: readonly ItemPedido[];
  readonly tiempoEsperaMinutos: number;
  estado: EstadoPedido;
}

interface ResumenPedidoFoodTruck {
  readonly orden: string;
  readonly categoria: CategoriaComida;
  readonly totalPagarUSD: string;
  readonly tiempoEntrega: string;
  readonly clasificacionServicio: string;
}

const colaPedidosCentral: readonly FichaPedidoFoodTruck[] = [
  {
    pedidoId: "FT-701",
    cliente: "Dante Valenzuela",
    categoria: "Hamburguesas Artesanales",
    items: [
      { itemId: "IT-01", nombrePlatillo: "Burger Doble BBQ", precioUnitario: 12.5, cantidad: 2 },
      { itemId: "IT-02", nombrePlatillo: "Papas rústicas con cheddar", precioUnitario: 5.0, cantidad: 1 }
    ],
    tiempoEsperaMinutos: 18,
    estado: "Completado",
  },
  {
    pedidoId: "FT-702",
    cliente: "Valeria Sotomayor",
    categoria: "Tacos Urbanos",
    items: [
      { itemId: "IT-05", nombrePlatillo: "Tacos al Pastor x4", precioUnitario: 9.5, cantidad: 2 },
      { itemId: "IT-06", nombrePlatillo: "Agua de Horchata artesanal", precioUnitario: 3.5, cantidad: 2 }
    ],
    tiempoEsperaMinutos: 12,
    estado: "Completado",
  },
  {
    pedidoId: "FT-703",
    cliente: "Eros Morejón",
    categoria: "Pizzas al Horno",
    items: [
      { itemId: "IT-10", nombrePlatillo: "Pizza Pepperoni Suprema", precioUnitario: 15.0, cantidad: 1 },
      { itemId: "IT-11", nombrePlatillo: "Tequeños de queso x6", precioUnitario: 6.0, cantidad: 2 }
    ],
    tiempoEsperaMinutos: 25,
    estado: "EnPreparacion",
  },
  {
    pedidoId: "FT-704",
    cliente: "Marisol Hincapié",
    categoria: "Bebidas Especiales",
    items: [
      { itemId: "IT-15", nombrePlatillo: "Smoothie Tropical Berry", precioUnitario: 4.5, cantidad: 3 }
    ],
    tiempoEsperaMinutos: 8,
    estado: "Completado",
  },
  {
    pedidoId: "FT-705",
    cliente: "Gaelen Thorne",
    categoria: "Hamburguesas Artesanales",
    items: [
      { itemId: "IT-20", nombrePlatillo: "Burger Vegetariana Portobello", precioUnitario: 11.0, cantidad: 1 }
    ],
    tiempoEsperaMinutos: 35,
    estado: "Cancelado",
  }
];

function validarPedidoActivo(pedido: FichaPedidoFoodTruck): boolean {
  return pedido.estado !== "Cancelado" && pedido.items.length > 0;
}

function calcularTotalPedido(items: readonly ItemPedido[]): number {
  const totalBruto = items.reduce(
    (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
    0
  );
  return Number(totalBruto.toFixed(2));
}

function clasificarVelocidadServicio(minutos: number): string {
  if (minutos <= 15) return "Servicio Exprés de Alta Eficiencia";
  if (minutos <= 25) return "Tiempo Estándar en Cocina";
  return "Demora Prolongada por Alta Demanda";
}

function procesarPedidosFoodTruck(pedidos: readonly FichaPedidoFoodTruck[]): readonly ResumenPedidoFoodTruck[] {
  return pedidos
    .filter(validarPedidoActivo)
    .map(pedido => {
      const totalPagar = calcularTotalPedido(pedido.items);
      return {
        orden: `${pedido.cliente} [${pedido.pedidoId}]`,
        categoria: pedido.categoria,
        totalPagarUSD: `$${totalPagar.toFixed(2)}`,
        tiempoEntrega: `${pedido.tiempoEsperaMinutos} mins`,
        clasificacionServicio: clasificarVelocidadServicio(pedido.tiempoEsperaMinutos),
      };
    })
    .sort((a, b) => parseFloat(b.totalPagarUSD.replace('$', '')) - parseFloat(a.totalPagarUSD.replace('$', '')));
}

function imprimirReporteFoodTruck(titulo: string, resumen: readonly ResumenPedidoFoodTruck[]): void {
  console.log(`=== [PEDIDOS DE FOOD TRUCK] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Cliente: ${item.orden} (${item.categoria}) | Total: ${item.totalPagarUSD} | Tiempo: ${item.tiempoEntrega} | Estado: ${item.clasificacionServicio}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoPedidosOficial = procesarPedidosFoodTruck(colaPedidosCentral);
imprimirReporteFoodTruck("Resumen de Órdenes Activas en Ruta", resultadoPedidosOficial);

// Caso: Pedido masivo de banquete corporativo con múltiples platillos y alta exigencia en cocina
const pedidoCasoMasivo: readonly FichaPedidoFoodTruck[] = [
  {
    pedidoId: "FT-999",
    cliente: "Soren Lindqvist",
    categoria: "Pizzas al Horno",
    items: [
      { itemId: "IT-99", nombrePlatillo: "Banquete Familiar 4 Estaciones", precioUnitario: 45.0, cantidad: 3 },
      { itemId: "IT-98", nombrePlatillo: "Alitas BBQ Gigantes", precioUnitario: 14.0, cantidad: 4 }
    ],
    tiempoEsperaMinutos: 40,
    estado: "EnPreparacion",
  }
];

const resultadoMasivo = procesarPedidosFoodTruck(pedidoCasoMasivo);
imprimirReporteFoodTruck("Caso: Orden Masiva de Banquete Corporativo", resultadoMasivo);