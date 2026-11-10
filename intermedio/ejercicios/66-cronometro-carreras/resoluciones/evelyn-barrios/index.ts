export {};

interface VueltaCarrera {
  readonly numeroVuelta: number;
  readonly tiempoSegundos: number;
  readonly sector1Seg: number;
  readonly sector2Seg: number;
  readonly sector3Seg: number;
}

type AccionCronometro =
  | { readonly tipo: "REGISTRAR_VUELTA"; readonly vuelta: VueltaCarrera }
  | { readonly tipo: "APLICAR_PENALIZACION"; readonly segundosPenalidad: number }
  | { readonly tipo: "BANDERA_A_CUADROS" };

interface EstadoCronometroCarrera {
  readonly vueltas: readonly VueltaCarrera[];
  readonly tiempoTotalSegundos: number;
  readonly mejorVuelta?: VueltaCarrera;
  readonly enPista: boolean;
}

function reductorCronometro(
  estado: EstadoCronometroCarrera,
  accion: AccionCronometro
): EstadoCronometroCarrera {
  switch (accion.tipo) {
    case "REGISTRAR_VUELTA": {
      const v = accion.vuelta;
      const nuevoTotal = estado.tiempoTotalSegundos + v.tiempoSegundos;
      const esMejor = !estado.mejorVuelta || v.tiempoSegundos < estado.mejorVuelta.tiempoSegundos;
      return {
        ...estado,
        vueltas: [...estado.vueltas, v],
        tiempoTotalSegundos: nuevoTotal,
        mejorVuelta: esMejor ? v : estado.mejorVuelta,
      };
    }
    case "APLICAR_PENALIZACION":
      return {
        ...estado,
        tiempoTotalSegundos: estado.tiempoTotalSegundos + accion.segundosPenalidad,
      };
    case "BANDERA_A_CUADROS":
      return {
        ...estado,
        enPista: false,
      };
  }
}

function main() {
  console.log("=== CRONOMETRO DE VUELTAS DE CARRERA (REDUCER) ===");
  let crono: EstadoCronometroCarrera = {
    vueltas: [],
    tiempoTotalSegundos: 0,
    enPista: true,
  };

  const acciones: AccionCronometro[] = [
    { tipo: "REGISTRAR_VUELTA", vuelta: { numeroVuelta: 1, tiempoSegundos: 88.4, sector1Seg: 28.1, sector2Seg: 30.2, sector3Seg: 30.1 } },
    { tipo: "REGISTRAR_VUELTA", vuelta: { numeroVuelta: 2, tiempoSegundos: 86.9, sector1Seg: 27.8, sector2Seg: 29.6, sector3Seg: 29.5 } },
    { tipo: "REGISTRAR_VUELTA", vuelta: { numeroVuelta: 3, tiempoSegundos: 87.2, sector1Seg: 28.0, sector2Seg: 29.7, sector3Seg: 29.5 } },
    { tipo: "APLICAR_PENALIZACION", segundosPenalidad: 5.0 },
    { tipo: "BANDERA_A_CUADROS" },
  ];

  for (const acc of acciones) {
    crono = reductorCronometro(crono, acc);
  }

  console.log(`Vueltas completadas: ${crono.vueltas.length}`);
  console.log(`Tiempo total acumulado con sanciones: ${crono.tiempoTotalSegundos.toFixed(2)}s`);
  if (crono.mejorVuelta) {
    console.log(`Vuelta rapida (Fastest Lap): Vuelta #${crono.mejorVuelta.numeroVuelta} (${crono.mejorVuelta.tiempoSegundos}s)`);
  }
}

main();
