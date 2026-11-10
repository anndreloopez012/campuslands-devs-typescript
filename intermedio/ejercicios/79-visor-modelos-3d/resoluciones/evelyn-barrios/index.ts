export {};

type FormatoModelo3D = "GLTF" | "FBX" | "OBJ";

interface Modelo3DDTO {
  readonly id: string;
  readonly nombre: string;
  readonly formato: FormatoModelo3D;
  readonly conteoVertices: number;
  readonly conteoPoligonos: number;
  readonly pesoMb: number;
  readonly animado: boolean;
}

class VisorAssets3DRepositorio {
  private assets: Modelo3DDTO[] = [];

  registrarModelo(modelo: Modelo3DDTO): void {
    this.assets.push(modelo);
  }

  obtenerModelosPorFormato(formato: FormatoModelo3D): readonly Modelo3DDTO[] {
    return this.assets.filter((m) => m.formato === formato);
  }

  calcularEstadisticasEscena(): { totalPoligonos: number; memoriaTotalMb: number } {
    const totalPoli = this.assets.reduce((acc, m) => acc + m.conteoPoligonos, 0);
    const totalMb = this.assets.reduce((acc, m) => acc + m.pesoMb, 0);
    return {
      totalPoligonos: totalPoli,
      memoriaTotalMb: Math.round(totalMb * 10) / 10,
    };
  }
}

function main() {
  console.log("=== VISOR DE ASSETS 3D (DTO & ESCENA) ===");
  const visor = new VisorAssets3DRepositorio();

  visor.registrarModelo({ id: "3d-01", nombre: "Paleta Tenis de Mesa Pro", formato: "GLTF", conteoVertices: 4800, conteoPoligonos: 9200, pesoMb: 3.4, animado: false });
  visor.registrarModelo({ id: "3d-02", nombre: "Mesa PingPong Oficial ITTF", formato: "GLTF", conteoVertices: 12500, conteoPoligonos: 22000, pesoMb: 8.1, animado: false });
  visor.registrarModelo({ id: "3d-03", nombre: "Pelota con Estela Efecto", formato: "FBX", conteoVertices: 1200, conteoPoligonos: 2100, pesoMb: 1.2, animado: true });

  const stats = visor.calcularEstadisticasEscena();
  console.log(`Carga de la escena 3D: ${stats.totalPoligonos} poligonos | Consumo VRAM estimado: ${stats.memoriaTotalMb} MB`);

  const modelosGltf = visor.obtenerModelosPorFormato("GLTF");
  console.log(`Assets GLTF listos para WebGL: ${modelosGltf.length}`);
  modelosGltf.forEach((m) => console.log(`- ${m.nombre} (${m.conteoPoligonos} poligonos, ${m.pesoMb} MB)`));
}

main();
