export {};

interface JugadorApiShooter {
  readonly id: string;
  readonly username: string;
  readonly rango: string;
  readonly puntuacionElo: number;
}

interface RespuestaLeaderboard {
  readonly estadoHttp: number;
  readonly jugadores: readonly JugadorApiShooter[];
  readonly fechaConsulta: string;
}

async function consultarLeaderboardRemoto(): Promise<RespuestaLeaderboard> {
  // Simular llamada de red a microservicio de matchmaking
  await new Promise((resolve) => setTimeout(resolve, 10));

  const data: JugadorApiShooter[] = [
    { id: "usr-901", username: "S1mple_CS", rango: "Global Elite", puntuacionElo: 3120 },
    { id: "usr-902", username: "ZywOo_Star", rango: "Global Elite", puntuacionElo: 3080 },
    { id: "usr-903", username: "NiKo_Deagle", rango: "Supreme", puntuacionElo: 2950 },
  ];

  return {
    estadoHttp: 200,
    jugadores: data,
    fechaConsulta: "2026-11-10T13:30:00Z",
  };
}

async function bootstrap() {
  console.log("=== CLIENTE API FAKE SHOOTER ===");
  const respuesta = await consultarLeaderboardRemoto();
  console.log(`Respuesta API [${respuesta.estadoHttp}] - ${respuesta.jugadores.length} jugadores en top global:`);
  respuesta.jugadores.forEach((j, i) => {
    console.log(`#${i + 1} ${j.username} (${j.rango}) - ${j.puntuacionElo} ELO`);
  });
}

bootstrap();
