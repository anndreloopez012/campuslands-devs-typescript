export {};

// tipos
type TipoPlano = 'planta' | 'fachada' | 'seccion' | 'render';
type EstadoPlano = 'borrador' | 'revisado' | 'aprobado' | 'vencido';

interface Plano3D {
  readonly id: number;
  readonly nombre: string;
  tipo: TipoPlano;
  version: number;
  fechaEntrega: Date;
  estado: EstadoPlano;
}

// clases
class ControlPlanos {
  private readonly planos = new Map<number, Plano3D>();

  agregar(plano: Plano3D): void {
    this.planos.set(plano.id, plano);
  }

  vencidos(): Plano3D[] {
    const hoy = new Date();
    return [...this.planos.values()].filter((plano) => plano.fechaEntrega < hoy && plano.estado !== 'aprobado');
  }

  marcarVencidos(): void {
    this.vencidos().forEach((plano) => {
      plano.estado = 'vencido';
    });
  }

  aprobar(id: number): boolean {
    const plano = this.planos.get(id);
    if (!plano || plano.estado !== 'revisado') return false;
    plano.estado = 'aprobado';
    return true;
  }

  proximos(dias: number): Plano3D[] {
    const limite = Date.now() + dias * 86_400_000;
    return [...this.planos.values()].filter((plano) => plano.fechaEntrega.getTime() <= limite && plano.estado !== 'aprobado');
  }

  reporte(): Record<EstadoPlano, number> {
    return [...this.planos.values()].reduce<Record<EstadoPlano, number>>((conteo, plano) => {
      conteo[plano.estado] += 1;
      return conteo;
    }, { borrador: 0, revisado: 0, aprobado: 0, vencido: 0 });
  }
}

// datos
const en3Dias = new Date(Date.now() + 3 * 86_400_000);
const hace5Dias = new Date(Date.now() - 5 * 86_400_000);

const planos: Plano3D[] = [
  { id: 1, nombre: 'Planta tipo A', tipo: 'planta', version: 3, fechaEntrega: en3Dias, estado: 'revisado' },
  { id: 2, nombre: 'Fachada norte', tipo: 'fachada', version: 1, fechaEntrega: hace5Dias, estado: 'borrador' },
  { id: 3, nombre: 'Seccion escaleria', tipo: 'seccion', version: 2, fechaEntrega: en3Dias, estado: 'borrador' },
  { id: 4, nombre: 'Render presentacion', tipo: 'render', version: 0, fechaEntrega: hace5Dias, estado: 'aprobado' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Control de planos 3D ===');
  const control = new ControlPlanos();
  planos.forEach((plano) => control.agregar(plano));

  control.marcarVencidos();
  console.log(`Aprobacion de "Planta tipo A": ${control.aprobar(1) ? 'aprobado' : 'rechazado'}`);
  console.log(`Aprobacion de "Planta tipo A" (falta revision): ${control.aprobar(3) ? 'aprobado' : 'rechazado'}`);

  console.log('Proximos 7 dias:', control.proximos(7).map((plano) => plano.nombre).join(', '));
  console.log('Reporte:', JSON.stringify(control.reporte()));

  planos.forEach((plano) => {
    if (plano.version <= 0) console.log(`Alerta: ${plano.nombre} sin version inicial`);
  });
}

mostrarResumen();
