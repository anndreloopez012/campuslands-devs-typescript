// Solución Ejercicio Intermedio 44 - Stefani Sánchez
export {};

interface Parada {
  readonly nombre: string;
  readonly lat: number;
  readonly lon: number;
  readonly duracionMin: number;
}

const RADIO_TIERRA_KM = 6371;
const VELOCIDAD_KM_H = 4.5;

const paradas: readonly Parada[] = [
  { nombre: "Parque Central", lat: 14.5586, lon: -90.7295, duracionMin: 30 },
  { nombre: "Arco de Santa Catalina", lat: 14.5611, lon: -90.7344, duracionMin: 15 },
  { nombre: "Cerro de la Cruz", lat: 14.5642, lon: -90.7258, duracionMin: 45 },
  { nombre: "Mercado de Artesanias", lat: 14.5573, lon: -90.7339, duracionMin: 60 },
  { nombre: "Iglesia de la Merced", lat: 14.5604, lon: -90.7339, duracionMin: 20 },
  { nombre: "Parada Fantasma", lat: 120, lon: -90.7, duracionMin: 10 },
  { nombre: "Sin Duracion", lat: 14.56, lon: -90.73, duracionMin: 0 },
];

const aRadianes = (grados: number): number => (grados * Math.PI) / 180;

const distanciaKm = (a: Parada, b: Parada): number => {
  const dLat = aRadianes(b.lat - a.lat);
  const dLon = aRadianes(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
};

const esParadaValida = (p: Parada): boolean =>
  p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180 && p.duracionMin > 0 && p.nombre.trim().length > 0;

// Vecino mas cercano: desde la parada actual va siempre a la mas cercana sin visitar.
const armarRuta = (inicio: Parada, restantes: readonly Parada[]): Parada[] => {
  const ruta: Parada[] = [inicio];
  let pendientes = [...restantes];
  while (pendientes.length > 0) {
    const actual = ruta[ruta.length - 1];
    const siguiente = pendientes.reduce((a, b) => (distanciaKm(actual, b) < distanciaKm(actual, a) ? b : a));
    ruta.push(siguiente);
    pendientes = pendientes.filter((p) => p !== siguiente);
  }
  return ruta;
};

const validas = paradas.filter(esParadaValida);
const invalidas = paradas.filter((p) => !esParadaValida(p));
const ruta = armarRuta(validas[0], validas.slice(1));
const tramos = ruta.slice(1).map((p, i) => ({ de: ruta[i].nombre, a: p.nombre, km: distanciaKm(ruta[i], p) }));
const totalKm = tramos.reduce((acc, t) => acc + t.km, 0);
const minCaminando = (totalKm / VELOCIDAD_KM_H) * 60;
const minVisitas = ruta.reduce((acc, p) => acc + p.duracionMin, 0);

console.log("Ejercicio 44: Rutas turisticas inteligentes");
console.log(`Paradas validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((p) => console.log(`  - "${p.nombre}" tiene coordenadas o duracion invalidas`));
tramos.forEach((t, i) => console.log(`  ${i + 1}. ${t.de} -> ${t.a}: ${Math.round(t.km * 1000)} m`));
console.log(`Distancia total: ${Math.round(totalKm * 100) / 100} km`);
console.log(`Tiempo total: ${Math.round(minCaminando + minVisitas)} min (${Math.round(minCaminando)} caminando + ${minVisitas} visitando)`);
