export {};

type EstadoButaca = "Disponible" | "Seleccionada" | "Ocupada";

interface ButacaSala {
  readonly fila: string;
  readonly numero: number;
  readonly estado: EstadoButaca;
  readonly precioEur: number;
}

type AccionCine =
  | { readonly tipo: "SELECCIONAR_BUTACA"; readonly fila: string; readonly numero: number }
  | { readonly tipo: "CONFIRMAR_COMPRA" }
  | { readonly tipo: "CANCELAR_SELECCION" };

interface EstadoSalaCine {
  readonly pelicula: string;
  readonly butacas: readonly ButacaSala[];
  readonly totalRecaudadoEur: number;
}

function reductorCine(
  sala: EstadoSalaCine,
  accion: AccionCine
): EstadoSalaCine {
  switch (accion.tipo) {
    case "SELECCIONAR_BUTACA": {
      const actualizadas = sala.butacas.map((b) => {
        if (b.fila === accion.fila && b.numero === accion.numero && b.estado === "Disponible") {
          return { ...b, estado: "Seleccionada" as const };
        }
        return b;
      });
      return { ...sala, butacas: actualizadas };
    }
    case "CONFIRMAR_COMPRA": {
      let ingresoAdicional = 0;
      const actualizadas = sala.butacas.map((b) => {
        if (b.estado === "Seleccionada") {
          ingresoAdicional += b.precioEur;
          return { ...b, estado: "Ocupada" as const };
        }
        return b;
      });
      return {
        ...sala,
        butacas: actualizadas,
        totalRecaudadoEur: sala.totalRecaudadoEur + ingresoAdicional,
      };
    }
    case "CANCELAR_SELECCION": {
      const actualizadas = sala.butacas.map((b) => {
        if (b.estado === "Seleccionada") {
          return { ...b, estado: "Disponible" as const };
        }
        return b;
      });
      return { ...sala, butacas: actualizadas };
    }
  }
}

function main() {
  console.log("=== SISTEMA DE RESERVAS DE CINE DOM (REDUCER) ===");
  const butacasIniciales: ButacaSala[] = [
    { fila: "A", numero: 1, estado: "Disponible", precioEur: 9.5 },
    { fila: "A", numero: 2, estado: "Disponible", precioEur: 9.5 },
    { fila: "A", numero: 3, estado: "Ocupada", precioEur: 9.5 },
    { fila: "B", numero: 1, estado: "Disponible", precioEur: 9.5 },
  ];

  let sala: EstadoSalaCine = {
    pelicula: "Dune: Part Two",
    butacas: butacasIniciales,
    totalRecaudadoEur: 0,
  };

  sala = reductorCine(sala, { tipo: "SELECCIONAR_BUTACA", fila: "A", numero: 1 });
  sala = reductorCine(sala, { tipo: "SELECCIONAR_BUTACA", fila: "A", numero: 2 });
  console.log("Butacas seleccionadas para compra. Procediendo al pago...");

  sala = reductorCine(sala, { tipo: "CONFIRMAR_COMPRA" });
  console.log(`Compra exitosa para "${sala.pelicula}". Total ingresado en taquilla: €${sala.totalRecaudadoEur.toFixed(2)}`);
}

main();
