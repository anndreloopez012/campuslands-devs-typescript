export {};

type Franquicia = "cine" | "serie" | "libro";

interface Entrega {
  readonly titulo: string;
  readonly anio: number;
  readonly calificacion: number;
}

interface Saga {
  readonly id: number;
  readonly nombre: string;
  readonly franquicia: Franquicia;
  readonly entregas: readonly Entrega[];
}

interface ResumenSaga {
  readonly nombre: string;
  readonly cantidadEntregas: number;
  readonly calificacionPromedio: number;
  readonly mejorEntrega: string;
}

const sagas: readonly Saga[] = [
  {
    id: 1,
    nombre: "Horizonte Estelar",
    franquicia: "cine",
    entregas: [
      { titulo: "Primer Contacto", anio: 1999, calificacion: 8.2 },
      { titulo: "Marea Solar", anio: 2003, calificacion: 7.4 },
      { titulo: "Ultimo Portal", anio: 2009, calificacion: 8.9 },
    ],
  },
  {
    id: 2,
    nombre: "Colonia Marte",
    franquicia: "serie",
    entregas: [
      { titulo: "Temporada 1", anio: 2016, calificacion: 7.9 },
      { titulo: "Temporada 2", anio: 2018, calificacion: 8.4 },
    ],
  },
  {
    id: 3,
    nombre: "Ciclo Andromeda",
    franquicia: "libro",
    entregas: [{ titulo: "Semilla Cosmica", anio: 1985, calificacion: 9.1 }],
  },
  {
    id: 4,
    nombre: "Saga Vacia",
    franquicia: "cine",
    entregas: [],
  },
  {
    id: 5,
    nombre: "Nebulosa Rota",
    franquicia: "serie",
    entregas: [{ titulo: "Piloto", anio: 2020, calificacion: 14 }],
  },
];

const esEntregaValida = (entrega: Entrega): boolean =>
  entrega.titulo.trim().length > 0 &&
  entrega.anio >= 1900 &&
  entrega.calificacion >= 0 &&
  entrega.calificacion <= 10;

const esSagaValida = (saga: Saga): boolean =>
  saga.nombre.trim().length > 0 &&
  saga.entregas.length > 0 &&
  saga.entregas.every(esEntregaValida);

const resumirSaga = (saga: Saga): ResumenSaga => {
  const suma = saga.entregas.reduce((acc, e) => acc + e.calificacion, 0);
  const mejor = saga.entregas.reduce((a, b) =>
    b.calificacion > a.calificacion ? b : a,
  );

  return {
    nombre: saga.nombre,
    cantidadEntregas: saga.entregas.length,
    calificacionPromedio: Math.round((suma / saga.entregas.length) * 100) / 100,
    mejorEntrega: mejor.titulo,
  };
};

const validas = sagas.filter(esSagaValida);
const invalidas = sagas.filter((saga) => !esSagaValida(saga));
const resumenes = validas
  .map(resumirSaga)
  .sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);

console.log("Ejercicio 15: Analizador de sagas sci-fi");
console.log(`Sagas validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((saga) =>
  console.log(`  - #${saga.id} "${saga.nombre}" tiene datos invalidos`),
);
resumenes.forEach((r, i) =>
  console.log(
    `${i + 1}. ${r.nombre} - ${r.cantidadEntregas} entrega(s) - promedio ${r.calificacionPromedio} - mejor: ${r.mejorEntrega}`,
  ),
);
