export {};

type CategoriaPlato = "Entrada" | "Plato Fuerte" | "Postre" | "Bebida";

interface PlatoDTO {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: CategoriaPlato;
  readonly precioUsd: number;
  readonly vegetariano: boolean;
  readonly calorias: number;
}

interface FiltrosMenuDTO {
  readonly categoria?: CategoriaPlato;
  readonly soloVegetariano?: boolean;
  readonly caloriasMaximas?: number;
}

class MenuRestauranteServicio {
  private platillos: PlatoDTO[] = [];

  registrarPlatillo(plato: PlatoDTO): void {
    this.platillos.push(plato);
  }

  consultarConFiltros(filtros: FiltrosMenuDTO): readonly PlatoDTO[] {
    return this.platillos.filter((p) => {
      if (filtros.categoria && p.categoria !== filtros.categoria) return false;
      if (filtros.soloVegetariano && !p.vegetariano) return false;
      if (filtros.caloriasMaximas && p.calorias > filtros.caloriasMaximas) return false;
      return true;
    });
  }

  generarReporteMenu(): { totalPlatos: number; precioPromedio: number } {
    if (this.platillos.length === 0) return { totalPlatos: 0, precioPromedio: 0 };
    const suma = this.platillos.reduce((acc, p) => acc + p.precioUsd, 0);
    return {
      totalPlatos: this.platillos.length,
      precioPromedio: Math.round((suma / this.platillos.length) * 100) / 100,
    };
  }
}

function main() {
  console.log("=== MENU INTERACTIVO DE COMIDA (DTO & SERVICIO) ===");
  const servicio = new MenuRestauranteServicio();

  servicio.registrarPlatillo({ id: "p-1", nombre: "Bruschetta Clasica", categoria: "Entrada", precioUsd: 7.5, vegetariano: true, calorias: 280 });
  servicio.registrarPlatillo({ id: "p-2", nombre: "Bife de Chorizo", categoria: "Plato Fuerte", precioUsd: 22.0, vegetariano: false, calorias: 750 });
  servicio.registrarPlatillo({ id: "p-3", nombre: "Risotto de Hongos", categoria: "Plato Fuerte", precioUsd: 16.5, vegetariano: true, calorias: 520 });
  servicio.registrarPlatillo({ id: "p-4", nombre: "Tiramisu Artesanal", categoria: "Postre", precioUsd: 6.5, vegetariano: true, calorias: 410 });

  const filtroVeg = servicio.consultarConFiltros({ soloVegetariano: true, caloriasMaximas: 550 });
  console.log(`Opciones vegetarianas ligeras (<550 cal): ${filtroVeg.length}`);
  filtroVeg.forEach((p) => console.log(`- ${p.nombre} (${p.categoria}) | $${p.precioUsd} | ${p.calorias} kcal`));

  const reporte = servicio.generarReporteMenu();
  console.log(`Platos totales: ${reporte.totalPlatos} | Ticket promedio de carta: $${reporte.precioPromedio}`);
}

main();
