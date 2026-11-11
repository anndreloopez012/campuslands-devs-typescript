export {};

// tipos
type RarezaSkin = 'normal' | 'rara' | 'legendaria' | 'mitica';
type EstadoVenta = 'listada' | 'vendida' | 'retirada';

interface Skin {
  readonly id: number;
  readonly nombre: string;
  rareza: RarezaSkin;
  precioUsd: number;
  estado: EstadoVenta;
  vendedor: string;
}

// datos
const skins: Skin[] = [
  { id: 1, nombre: 'Dragon de Jade', rareza: 'mitica', precioUsd: 220, estado: 'listada', vendedor: 'Velas' },
  { id: 2, nombre: 'Fantasma Azul', rareza: 'legendaria', precioUsd: 95, estado: 'vendida', vendedor: 'Rios' },
  { id: 3, nombre: 'Mancha Verde', rareza: 'normal', precioUsd: 5, estado: 'listada', vendedor: 'Mena' },
  { id: 4, nombre: 'Sombra Dorada', rareza: 'rara', precioUsd: 25, estado: 'retirada', vendedor: 'Velas' },
  { id: 5, nombre: 'Ojo de Halcon', rareza: 'legendaria', precioUsd: -10, estado: 'listada', vendedor: 'Nux' },
];

// reglas
const comisionMercado = 0.15;

// validacion
function validarSkin(skin: Skin): string[] {
  const errores: string[] = [];

  if (skin.precioUsd <= 0) errores.push(`Skin ${skin.id}: precio invalido`);
  if (skin.estado === 'vendida' && skin.vendedor === '') errores.push(`Skin ${skin.id}: vendida sin vendedor`);

  return errores;
}

// acciones
function comprar(skins: Skin[], id: number, comprador: string): boolean {
  const skin = skins.find((item) => item.id === id && item.estado === 'listada');
  if (!skin || !validarSkin(skin).every((error) => error.length === 0)) return false;

  skin.estado = 'vendida';
  skin.vendedor = comprador;
  return true;
}

// calculos
function valorDeLista(skin: Skin): number {
  return Number((skin.precioUsd * (1 - comisionMercado)).toFixed(2));
}

function valorizacionPorRareza(skins: Skin[]): Record<RarezaSkin, number> {
  return skins
    .filter((skin) => skin.estado === 'listada')
    .reduce<Record<RarezaSkin, number>>((totales, skin) => {
      totales[skin.rareza] += skin.precioUsd;
      return totales;
    }, { normal: 0, rara: 0, legendaria: 0, mitica: 0 });
}

function vendedoresUnicos(skins: Skin[]): Set<string> {
  return new Set(skins.map((skin) => skin.vendedor));
}

// salida
function mostrarResumen(skins: Skin[]): void {
  console.log('=== Mercado de skins ===');
  console.log('Valorizacion listada por rareza:', valorizacionPorRareza(skins));
  console.log(`Vendedores unicos: ${[...vendedoresUnicos(skins)].join(', ')}`);

  const vendio = comprar(skins, 1, 'Nux');
  console.log(`Compra de "Dragon de Jade" por Nux: ${vendio ? 'confirmada' : 'rechazada'}`);
  if (vendio) console.log(`Vendedor recibe (menos comision): $${valorDeLista(skins[0])}`);

  skins.forEach((skin) => {
    const errores = validarSkin(skin);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(skins);
