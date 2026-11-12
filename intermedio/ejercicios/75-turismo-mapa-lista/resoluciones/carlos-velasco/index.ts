export {};

// tipos
type TipoSitio = 'playa' | 'ruina' | 'parque' | 'pueblo';

interface SitioTuristico {
  readonly id: number;
  readonly nombre: string;
  tipo: TipoSitio;
  favorito: boolean;
  visitas: number;
}

// persistencia simulada
interface AlmacenFavoritos {
  guardar(ids: number[]): void;
  leer(): number[] | null;
}

class AlmacenFavoritosMemoria implements AlmacenFavoritos {
  private ids: number[] | null = null;

  guardar(ids: number[]): void {
    this.ids = [...ids];
  }

  leer(): number[] | null {
    return this.ids ? [...this.ids] : null;
  }
}

// clases
class ListaTuristica {
  private readonly sitios = new Map<number, SitioTuristico>();
  private favoritos: number[] = [];

  constructor(private readonly almacen: AlmacenFavoritos) {}

  cargar(sitios: SitioTuristico[]): void {
    sitios.forEach((sitio) => this.sitios.set(sitio.id, sitio));
  }

  marcarFavorito(id: number): boolean {
    const sitio = this.sitios.get(id);
    if (!sitio || this.favoritos.includes(id)) return false;
    sitio.favorito = true;
    this.favoritos.push(id);
    this.almacen.guardar(this.favoritos);
    return true;
  }

  visitar(id: number): boolean {
    const sitio = this.sitios.get(id);
    if (!sitio) return false;
    sitio.visitas += 1;
    return true;
  }

  restaurarFavoritos(): void {
    const ids = this.almacen.leer();
    if (ids) {
      this.favoritos = ids;
      ids.forEach((id) => {
        const sitio = this.sitios.get(id);
        if (sitio) sitio.favorito = true;
      });
    }
  }

  porTipo(): Record<TipoSitio, number> {
    return [...this.sitios.values()].reduce<Record<TipoSitio, number>>((conteo, sitio) => {
      conteo[sitio.tipo] += 1;
      return conteo;
    }, { playa: 0, ruina: 0, parque: 0, pueblo: 0 });
  }
}

// datos
const sitios: SitioTuristico[] = [
  { id: 1, nombre: 'Playa Blanca', tipo: 'playa', favorito: false, visitas: 0 },
  { id: 2, nombre: 'Ruinas Tikal', tipo: 'ruina', favorito: false, visitas: 0 },
  { id: 3, nombre: 'Parque Nacional Darien', tipo: 'parque', favorito: false, visitas: 2 },
];

// salida
function mostrarResumen(): void {
  console.log('=== Lista turistica interactiva ===');
  const lista = new ListaTuristica(new AlmacenFavoritosMemoria());
  lista.cargar(sitios);

  console.log(`Favorito Playa Blanca: ${lista.marcarFavorito(1) ? 'marcado' : 'rechazado'}`);
  console.log(`Favorito duplicado: ${lista.marcarFavorito(1) ? 'marcado' : 'rechazado'}`);
  lista.visitar(2);
  lista.restaurarFavoritos();

  console.log('Sitios por tipo:', JSON.stringify(lista.porTipo()));
  sitios.forEach((sitio) => {
    console.log(`- ${sitio.nombre} | Visitas: ${sitio.visitas} | Favorito: ${sitio.favorito ? 'si' : 'no'}`);
  });
}

mostrarResumen();
