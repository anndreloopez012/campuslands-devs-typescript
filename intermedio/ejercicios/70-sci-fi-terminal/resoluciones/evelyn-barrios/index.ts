export {};

type NivelSeguridadNave = "DEFCON-5" | "DEFCON-3" | "DEFCON-1" | "ALERTA_ROJA";

interface EntradaConsolaSciFi {
  readonly timestamp: string;
  readonly comandoEjecutado: string;
  readonly salidaConsola: string;
}

type AccionTerminal =
  | { readonly tipo: "EJECUTAR_COMANDO"; readonly comando: string }
  | { readonly tipo: "SUBIR_NIVEL_ALERTA"; readonly nivel: NivelSeguridadNave }
  | { readonly tipo: "LIMPIAR_PANTALLA" };

interface EstadoTerminalSciFi {
  readonly sistemaNave: string;
  readonly nivelAlerta: NivelSeguridadNave;
  readonly porcentajeEscudos: number;
  readonly historialComandos: readonly EntradaConsolaSciFi[];
}

function reductorTerminal(
  estado: EstadoTerminalSciFi,
  accion: AccionTerminal
): EstadoTerminalSciFi {
  switch (accion.tipo) {
    case "EJECUTAR_COMANDO": {
      const salida = accion.comando === "scan"
        ? "Escaneo de largo alcance completado: 0 anomalias hostiles detectadas en sector."
        : accion.comando === "shields"
        ? `Nivel de escudos de plasma: ${estado.porcentajeEscudos}%`
        : `Comando '${accion.comando}' ejecutado en subrutina central.`;

      const entrada: EntradaConsolaSciFi = {
        timestamp: "CYCLE-3490.8",
        comandoEjecutado: accion.comando,
        salidaConsola: salida,
      };

      return {
        ...estado,
        historialComandos: [...estado.historialComandos, entrada],
      };
    }
    case "SUBIR_NIVEL_ALERTA":
      return {
        ...estado,
        nivelAlerta: accion.nivel,
      };
    case "LIMPIAR_PANTALLA":
      return {
        ...estado,
        historialComandos: [],
      };
  }
}

function main() {
  console.log("=== TERMINAL SCI-FI DE LA NAVE (REDUCER / PARSER) ===");
  let terminal: EstadoTerminalSciFi = {
    sistemaNave: "USS Prometheus (NCC-71201)",
    nivelAlerta: "DEFCON-5",
    porcentajeEscudos: 100,
    historialComandos: [],
  };

  terminal = reductorTerminal(terminal, { tipo: "EJECUTAR_COMANDO", comando: "shields" });
  terminal = reductorTerminal(terminal, { tipo: "EJECUTAR_COMANDO", comando: "scan" });
  terminal = reductorTerminal(terminal, { tipo: "SUBIR_NIVEL_ALERTA", nivel: "ALERTA_ROJA" });

  console.log(`Nave: ${terminal.sistemaNave} | Alerta: ${terminal.nivelAlerta}`);
  terminal.historialComandos.forEach((h) => {
    console.log(`[${h.timestamp}] > ${h.comandoEjecutado} -> ${h.salidaConsola}`);
  });
}

main();
