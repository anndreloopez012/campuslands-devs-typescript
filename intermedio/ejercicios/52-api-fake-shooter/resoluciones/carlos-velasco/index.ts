export {};

// tipos
interface PerfilJugador {
  readonly id: number;
  readonly nickname: string;
  rango: string;
  bajas: number;
  muertes: number;
}

// errores
class ErrorRed extends Error {
  constructor() {
    super('fallo de red simulado');
    this.name = 'ErrorRed';
  }
}

class ErrorNoEncontrado extends Error {
  constructor(id: number) {
    super(`perfil ${id} no existe`);
    this.name = 'ErrorNoEncontrado';
  }
}

// cliente
class ClienteAPI {
  private readonly perfiles = new Map<number, PerfilJugador>();
  private falloSiguiente = false;

  constructor(perfiles: PerfilJugador[]) {
    perfiles.forEach((perfil) => this.perfiles.set(perfil.id, perfil));
  }

  private simularLatencia(ms: number): Promise<void> {
    return new Promise((resolver) => setTimeout(resolver, ms));
  }

  programarFallo(): void {
    this.falloSiguiente = true;
  }

  async obtenerPerfil(id: number): Promise<PerfilJugador> {
    await this.simularLatencia(15);
    if (this.falloSiguiente) {
      this.falloSiguiente = false;
      throw new ErrorRed();
    }
    const perfil = this.perfiles.get(id);
    if (!perfil) throw new ErrorNoEncontrado(id);
    return perfil;
  }
}

// calculos
function kd(perfil: PerfilJugador): number {
  if (perfil.muertes === 0) return perfil.bajas;
  return Number((perfil.bajas / perfil.muertes).toFixed(2));
}

function rangoPorKd(valor: number): string {
  if (valor >= 2) return 'elite';
  if (valor >= 1) return 'veterano';
  return 'recluta';
}

// datos
const cliente = new ClienteAPI([
  { id: 1, nickname: 'Velas', rango: 'recluta', bajas: 120, muertes: 80 },
  { id: 2, nickname: 'NovaR6', rango: 'veterano', bajas: 210, muertes: 100 },
  { id: 99, nickname: 'Fantasma', rango: 'recluta', bajas: 0, muertes: 0 },
]);

// salida
function mostrarResumen(): void {
  console.log('=== Cliente API fake shooter ===');

  void (async () => {
    const ids = [1, 2, 3, 1];
    for (let i = 0; i < ids.length; i += 1) {
      if (i === 2) cliente.programarFallo();

      try {
        const perfil = await cliente.obtenerPerfil(ids[i]);
        const rangoSugerido = rangoPorKd(kd(perfil));
        console.log(`${perfil.nickname} | K/D: ${kd(perfil)} | Rango actual: ${perfil.rango} | Sugerido: ${rangoSugerido}`);
      } catch (error) {
        console.log(`Peticion fallida: ${error instanceof Error ? `${error.name} - ${error.message}` : 'error desconocido'}`);
      }
    }
  })();
}

mostrarResumen();
