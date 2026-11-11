export {};

// tipos
interface PaqueteTuristico {
  readonly nombre: string;
  readonly destino: string;
  dias: number;
  precioUsd: number;
  incluyeHotel: boolean;
  calificaciones: number[];
}

// datos
const paquetes: PaqueteTuristico[] = [
  { nombre: 'Caribe relax', destino: 'Isla San Andres', dias: 7, precioUsd: 1200, incluyeHotel: true, calificaciones: [4.5, 4.8, 4.2] },
  { nombre: 'Montana activa', destino: 'Volcan Acatenango', dias: 3, precioUsd: 350, incluyeHotel: false, calificaciones: [4.9, 4.7] },
  { nombre: 'Ciudad colonial', destino: 'Antigua', dias: 4, precioUsd: 500, incluyeHotel: true, calificaciones: [4.0, 3.8, 4.1] },
  { nombre: 'Aventura rapida', destino: 'Volcan Acatenango', dias: 0, precioUsd: 250, incluyeHotel: false, calificaciones: [] },
];

// validacion
function validarPaquete(paquete: PaqueteTuristico): string[] {
  const errores: string[] = [];

  if (paquete.dias <= 0) errores.push(`${paquete.nombre}: duracion invalida`);
  if (paquete.precioUsd <= 0) errores.push(`${paquete.nombre}: precio invalido`);
  if (paquete.calificaciones.some((calificacion) => calificacion < 0 || calificacion > 5)) errores.push(`${paquete.nombre}: calificacion fuera de rango`);

  return errores;
}

// calculos
function calificacionPromedio(paquete: PaqueteTuristico): number {
  if (paquete.calificaciones.length === 0) return 0;
  const suma = paquete.calificaciones.reduce((total, calificacion) => total + calificacion, 0);
  return Number((suma / paquete.calificaciones.length).toFixed(2));
}

function costoPorDia(paquete: PaqueteTuristico): number {
  if (paquete.dias === 0) return 0;
  return Number((paquete.precioUsd / paquete.dias).toFixed(1));
}

function valoracion(paquete: PaqueteTuristico): number {
  let valor = calificacionPromedio(paquete) * 2 - costoPorDia(paquete) * 0.05;
  if (paquete.incluyeHotel) valor += 1;
  return Number(valor.toFixed(2));
}

function comparar(paquetes: PaqueteTuristico[]): PaqueteTuristico[] {
  return [...paquetes].sort((a, b) => valoracion(b) - valoracion(a));
}

function filtrarPorDestino(paquetes: PaqueteTuristico[], destino: string): PaqueteTuristico[] {
  return paquetes.filter((paquete) => paquete.destino === destino);
}

// salida
function mostrarResumen(paquetes: PaqueteTuristico[]): void {
  console.log('=== Comparador de turismo ===');
  console.log('Paquetes por valoracion:');
  comparar(paquetes).forEach((paquete, indice) => {
    const errores = validarPaquete(paquete);
    console.log(`${indice + 1}. ${paquete.nombre} | Nota: ${calificacionPromedio(paquete)} | $${costoPorDia(paquete)}/dia | Valoracion: ${valoracion(paquete)}${errores.length > 0 ? ` | ${errores.join('; ')}` : ''}`);
  });
  console.log(`Paquetes a Volcan Acatenango: ${filtrarPorDestino(paquetes, 'Volcan Acatenango').length}`);
}

mostrarResumen(paquetes);
