export {};

// tipos
type Traccion = 'rwd' | 'awd';

interface Hiperdeportivo {
  readonly id: number;
  readonly modelo: string;
  readonly marca: string;
  anio: number;
  caballos: number;
  velocidadMaximaKmh: number;
  precioUsd: number;
  traccion: Traccion;
}

// datos
const catalogo: Hiperdeportivo[] = [
  { id: 1, modelo: 'Solaris GT', marca: 'Aurelia', anio: 2024, caballos: 1500, velocidadMaximaKmh: 412, precioUsd: 2_900_000, traccion: 'awd' },
  { id: 2, modelo: 'Vendetta R', marca: 'Falcone', anio: 2023, caballos: 1100, velocidadMaximaKmh: 385, precioUsd: 1_400_000, traccion: 'rwd' },
  { id: 3, modelo: 'Nube Evo', marca: 'Aurelia', anio: 2025, caballos: 1350, velocidadMaximaKmh: 400, precioUsd: 2_200_000, traccion: 'awd' },
  { id: 4, modelo: 'Relampago S', marca: 'Corvus', anio: 2022, caballos: 900, velocidadMaximaKmh: 350, precioUsd: 850_000, traccion: 'rwd' },
];

// reglas
const anioActual = 2026;
const antiguedadMaxima = 4;

// validacion
function validarHiperdeportivo(auto: Hiperdeportivo): string[] {
  const errores: string[] = [];

  if (auto.caballos < 800) errores.push(`${auto.modelo}: caballos insuficientes para hiperdeportivo`);
  if (auto.velocidadMaximaKmh <= 0) errores.push(`${auto.modelo}: velocidad invalida`);
  if (anioActual - auto.anio > antiguedadMaxima) errores.push(`${auto.modelo}: modelo fuera de rango`);
  if (auto.precioUsd <= 0) errores.push(`${auto.modelo}: precio invalido`);

  return errores;
}

// calculos
function relacionPrecioRendimiento(auto: Hiperdeportivo): number {
  return Number(((auto.caballos / auto.precioUsd) * 1_000_000).toFixed(1));
}

function filtrarPorTraccion(catalogo: Hiperdeportivo[], traccion: Traccion): Hiperdeportivo[] {
  return catalogo.filter((auto) => auto.traccion === traccion);
}

function masRapidos(catalogo: Hiperdeportivo[], limite: number): string[] {
  return [...catalogo]
    .sort((a, b) => b.velocidadMaximaKmh - a.velocidadMaximaKmh)
    .slice(0, limite)
    .map((auto) => `${auto.modelo} (${auto.velocidadMaximaKmh} km/h)`);
}

function precioPromedio(catalogo: Hiperdeportivo[]): number {
  if (catalogo.length === 0) return 0;
  const suma = catalogo.reduce((total, auto) => total + auto.precioUsd, 0);
  return Number((suma / catalogo.length).toFixed(0));
}

// salida
function mostrarResumen(catalogo: Hiperdeportivo[]): void {
  console.log('=== Catalogo de hiperdeportivos ===');
  console.log('Mas rapidos:', masRapidos(catalogo, 3).join(', '));
  console.log('Por traccion awd:', filtrarPorTraccion(catalogo, 'awd').length);
  console.log(`Precio promedio: $${precioPromedio(catalogo)}`);

  catalogo.forEach((auto) => {
    const errores = validarHiperdeportivo(auto);
    console.log(`${auto.marca} ${auto.modelo} | Caballos por millon USD: ${relacionPrecioRendimiento(auto)}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
}

mostrarResumen(catalogo);
