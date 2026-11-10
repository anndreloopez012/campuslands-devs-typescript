export {};

type EstadoHypercar = "Detenido" | "EnLaunchControl" | "Acelerando" | "VelocidadMaxima" | "Frenando";

type AccionSimulador =
  | { readonly tipo: "ACTIVAR_LAUNCH_CONTROL"; readonly rpmOptimas: number }
  | { readonly tipo: "SOLTAR_FRENO_Y_ACELERAR"; readonly segundosTranscurridos: number; readonly aceleracionG: number }
  | { readonly tipo: "ALCANZAR_TOPE"; readonly velocidadKmH: number }
  | { readonly tipo: "FRENADA_EMERGENCIA"; readonly desaceleracionG: number };

interface EstadoTelemetria {
  readonly fase: EstadoHypercar;
  readonly velocidadKmH: number;
  readonly rpm: number;
  readonly distanciaRecorridaMetros: number;
}

function reductorTelemetria(estadoActual: EstadoTelemetria, accion: AccionSimulador): EstadoTelemetria {
  switch (accion.tipo) {
    case "ACTIVAR_LAUNCH_CONTROL":
      return {
        ...estadoActual,
        fase: "EnLaunchControl",
        rpm: accion.rpmOptimas,
      };
    case "SOLTAR_FRENO_Y_ACELERAR": {
      const incrementoVelocidad = accion.segundosTranscurridos * accion.aceleracionG * 9.81 * 3.6;
      const nuevaVel = Math.min(420, estadoActual.velocidadKmH + incrementoVelocidad);
      return {
        ...estadoActual,
        fase: nuevaVel >= 400 ? "VelocidadMaxima" : "Acelerando",
        velocidadKmH: Math.round(nuevaVel),
        distanciaRecorridaMetros: estadoActual.distanciaRecorridaMetros + Math.round((nuevaVel / 3.6) * accion.segundosTranscurridos),
      };
    }
    case "ALCANZAR_TOPE":
      return {
        ...estadoActual,
        fase: "VelocidadMaxima",
        velocidadKmH: accion.velocidadKmH,
        rpm: 8500,
      };
    case "FRENADA_EMERGENCIA":
      return {
        ...estadoActual,
        fase: "Frenando",
        velocidadKmH: 0,
        rpm: 900,
      };
  }
}

function main() {
  console.log("=== SIMULADOR ACELERACION HYPERCAR (REDUCER / FSM) ===");
  let telemetria: EstadoTelemetria = {
    fase: "Detenido",
    velocidadKmH: 0,
    rpm: 800,
    distanciaRecorridaMetros: 0,
  };

  const acciones: AccionSimulador[] = [
    { tipo: "ACTIVAR_LAUNCH_CONTROL", rpmOptimas: 4500 },
    { tipo: "SOLTAR_FRENO_Y_ACELERAR", segundosTranscurridos: 2.5, aceleracionG: 1.4 },
    { tipo: "SOLTAR_FRENO_Y_ACELERAR", segundosTranscurridos: 5.0, aceleracionG: 1.1 },
    { tipo: "ALCANZAR_TOPE", velocidadKmH: 412 },
    { tipo: "FRENADA_EMERGENCIA", desaceleracionG: 1.8 },
  ];

  for (const accion of acciones) {
    telemetria = reductorTelemetria(telemetria, accion);
    console.log(`[${telemetria.fase}] Vel: ${telemetria.velocidadKmH} km/h | Dist: ${telemetria.distanciaRecorridaMetros}m | RPM: ${telemetria.rpm}`);
  }
}

main();
