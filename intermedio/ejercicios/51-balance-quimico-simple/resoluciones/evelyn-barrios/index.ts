export {};

interface ReactivoQuimico {
  readonly formula: string;
  readonly moles: number;
}

interface ReaccionQuimica {
  readonly reactivos: readonly ReactivoQuimico[];
  readonly productos: readonly ReactivoQuimico[];
  readonly esExotermica: boolean;
}

interface ResultadoReaccion {
  readonly balanceada: boolean;
  readonly energiaKj: number;
  readonly mensaje: string;
}

async function simularBalanceReaccion(reaccion: ReaccionQuimica): Promise<ResultadoReaccion> {
  // Simulacion asincrona de calculo termodinamico
  await new Promise((resolve) => setTimeout(resolve, 10));

  const molesReactivos = reaccion.reactivos.reduce((acc, r) => acc + r.moles, 0);
  const molesProductos = reaccion.productos.reduce((acc, p) => acc + p.moles, 0);
  const balanceada = molesReactivos === molesProductos;
  const energiaKj = reaccion.esExotermica ? -285.8 : 142.3;

  return {
    balanceada,
    energiaKj,
    mensaje: balanceada ? "Reaccion estequiometricamente balanceada" : "Desbalance en conservacion de masa",
  };
}

async function main() {
  const reaccionAgua: ReaccionQuimica = {
    reactivos: [
      { formula: "2H2", moles: 2 },
      { formula: "O2", moles: 1 },
    ],
    productos: [{ formula: "2H2O", moles: 3 }],
    esExotermica: true,
  };

  console.log("=== BALANCE QUIMICO ASINCRONO ===");
  const resultado = await simularBalanceReaccion(reaccionAgua);
  console.log(`Estado: ${resultado.mensaje}`);
  console.log(`Entalpia de reaccion: ${resultado.energiaKj} kJ`);
}

main();
