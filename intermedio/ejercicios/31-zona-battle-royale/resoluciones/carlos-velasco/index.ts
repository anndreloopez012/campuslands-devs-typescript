export {};

// tipos
type EstadoZona = 'estable' | 'encogiendose';

interface JugadorZona {
  readonly nombre: string;
  distanciaAlCentroMetros: number;
  vida: number;
}

// clases
class ZonaBatalla {
  radioMetros = 1000;
  estado: EstadoZona = 'estable';
  private readonly pasoMetros: number;

  constructor(pasoMetros: number) {
    this.pasoMetros = pasoMetros;
  }

  encoger(): number {
    this.radioMetros = Math.max(100, this.radioMetros - this.pasoMetros);
    this.estado = 'encogiendose';
    return this.radioMetros;
  }

  fueraDeZona(jugadores: JugadorZona[]): JugadorZona[] {
    return jugadores.filter((jugador) => jugador.distanciaAlCentroMetros > this.radioMetros);
  }

  aplicarDano(jugador: JugadorZona, danoPorSegundo: number, segundos: number): void {
    const enRiesgo = this.fueraDeZona([jugador]).length > 0;
    if (enRiesgo) {
      jugador.vida = Math.max(0, jugador.vida - danoPorSegundo * segundos);
    }
  }
}

// datos
const jugadores: JugadorZona[] = [
  { nombre: 'Velas', distanciaAlCentroMetros: 420, vida: 100 },
  { nombre: 'Rios', distanciaAlCentroMetros: 880, vida: 75 },
  { nombre: 'Mena', distanciaAlCentroMetros: 1250, vida: 60 },
  { nombre: 'Nux', distanciaAlCentroMetros: 0, vida: 100 },
];

// calculos
function simularZona(zona: ZonaBatalla, jugadores: JugadorZona[], fases: number): void {
  for (let fase = 0; fase < fases; fase += 1) {
    zona.encoger();
    zona.fueraDeZona(jugadores).forEach((jugador) => {
      zona.aplicarDano(jugador, 5, 10);
    });
  }
}

function vivos(jugadores: JugadorZona[]): JugadorZona[] {
  return jugadores.filter((jugador) => jugador.vida > 0);
}

function calcularScore(jugador: JugadorZona): number {
  const bonoDistancia = Math.max(0, 1000 - jugador.distanciaAlCentroMetros) / 10;
  return Number((jugador.vida + bonoDistancia).toFixed(1));
}

// salida
function mostrarResumen(zona: ZonaBatalla, jugadores: JugadorZona[]): void {
  simularZona(zona, jugadores, 3);
  console.log('=== Simulador de zona battle royale ===');
  console.log(`Radio final: ${zona.radioMetros} m | Estado: ${zona.estado}`);
  jugadores.forEach((jugador) => {
    console.log(`- ${jugador.nombre} | Vida: ${jugador.vida} | Score: ${calcularScore(jugador)}`);
  });
  console.log(`Sobrevivientes: ${vivos(jugadores).length}`);
}

mostrarResumen(new ZonaBatalla(300), jugadores);
