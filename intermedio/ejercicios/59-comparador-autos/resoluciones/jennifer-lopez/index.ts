export {};

type TipoMotorizacion = 'V12_BiTurbo' | 'V8_Hybrid' | 'QuadTurbo_W16' | 'Electric_TriMotor' | 'V10_Atmosferico';
type CategoriaVehiculo = 'Hiperdeportivo' | 'GranTurismo' | 'Superdeportivo' | 'SUV_Lujo' | 'Exotico';
type EstadoHomologacion = 'HomologadoCalle' | 'ExclusivoCircuito' | 'EnPruebasPrototipo' | 'Agotado';

interface EspecificacionAerodinamica {
  readonly componenteId: string;
  readonly nombreAerodinamica: string;
  readonly cargaDownforceKg: number;
  readonly coeficienteArrastreCd: number;
}

interface VehiculoHiperdeportivo {
  readonly vehiculoId: string;
  readonly marcaModelo: string;
  readonly categoria: CategoriaVehiculo;
  readonly motorizacion: TipoMotorizacion;
  readonly potenciaCaballos: number;
  readonly precioBaseMillonesUSD: number;
  readonly estadoHomologacion: EstadoHomologacion;
  readonly componentesAero: readonly EspecificacionAerodinamica[];
}

interface ReporteComparadorAutos {
  readonly vehiculo: string;
  readonly categoria: CategoriaVehiculo;
  readonly potenciaHp: number;
  readonly precioMUSD: number;
  readonly downforceTotalKg: number;
  readonly relacionPrecioPotencia: number;
  readonly clasificacionExclusividad: 'Excepcional' | 'Elite' | 'Estandar';
}

const registroAutosPremium: readonly VehiculoHiperdeportivo[] = [
  {
    vehiculoId: "AUTO-5901",
    marcaModelo: "Bugatti Chiron Pur Sport",
    categoria: "Hiperdeportivo",
    motorizacion: "QuadTurbo_W16",
    potenciaCaballos: 1500,
    precioBaseMillonesUSD: 3.8,
    estadoHomologacion: "HomologadoCalle",
    componentesAero: [
      { componenteId: "AERO-01", nombreAerodinamica: "Aleron Trasero Fijo Titanio", cargaDownforceKg: 450, coeficienteArrastreCd: 0.38 },
      { componenteId: "AERO-02", nombreAerodinamica: "Splitter Frontal Activo", cargaDownforceKg: 180, coeficienteArrastreCd: 0.32 }
    ]
  },
  {
    vehiculoId: "AUTO-5902",
    marcaModelo: "Koenigsegg Jesko Attack",
    categoria: "Hiperdeportivo",
    motorizacion: "V8_Hybrid",
    potenciaCaballos: 1600,
    precioBaseMillonesUSD: 3.0,
    estadoHomologacion: "HomologadoCalle",
    componentesAero: [
      { componenteId: "AERO-03", nombreAerodinamica: "Boomerang Rear Wing Triplex", cargaDownforceKg: 800, coeficienteArrastreCd: 0.42 },
      { componenteId: "AERO-04", nombreAerodinamica: "Tuneles Venturi Dinamicos", cargaDownforceKg: 200, coeficienteArrastreCd: 0.29 }
    ]
  },
  {
    vehiculoId: "AUTO-5903",
    marcaModelo: "Pagani Utopia Roadster",
    categoria: "Exotico",
    motorizacion: "V12_BiTurbo",
    potenciaCaballos: 852,
    precioBaseMillonesUSD: 3.4,
    estadoHomologacion: "HomologadoCalle",
    componentesAero: [
      { componenteId: "AERO-05", nombreAerodinamica: "Flaps Aerodinamicos Activos", cargaDownforceKg: 320, coeficienteArrastreCd: 0.35 }
    ]
  },
  {
    vehiculoId: "AUTO-5904",
    marcaModelo: "Rimac Nevera R",
    categoria: "Hiperdeportivo",
    motorizacion: "Electric_TriMotor",
    potenciaCaballos: 2107,
    precioBaseMillonesUSD: 2.5,
    estadoHomologacion: "HomologadoCalle",
    componentesAero: [
      { componenteId: "AERO-06", nombreAerodinamica: "Difusor Trasero Extendido", cargaDownforceKg: 400, coeficienteArrastreCd: 0.30 }
    ]
  }
];

class AnalizadorComparadorAutos<T extends VehiculoHiperdeportivo> {
  private readonly vehiculos: readonly T[];

  constructor(vehiculos: readonly T[]) {
    this.vehiculos = vehiculos;
  }

  public async validarVehiculoAsync(vehiculo: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!vehiculo.vehiculoId || vehiculo.potenciaCaballos <= 0) {
          reject(new Error(`Vehículo hiperdeportivo inválido o sin potencia registrada: ${vehiculo.marcaModelo}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularDownforceTotal(componentes: readonly EspecificacionAerodinamica[]): number {
    return componentes.reduce((acc, comp) => acc + comp.cargaDownforceKg, 0);
  }

  public calcularRelacionPrecioPotencia(precioMUSD: number, potencia: number): number {
    if (potencia === 0) return 0;
    return Number(((precioMUSD * 1000000) / potencia).toFixed(2));
  }

  public async procesarAnalisisAutosAsync(): Promise<readonly ReporteComparadorAutos[]> {
    const reportes: ReporteComparadorAutos[] = [];

    for (const vehiculo of this.vehiculos) {
      try {
        await this.validarVehiculoAsync(vehiculo);
        const downforceTotal = this.calcularDownforceTotal(vehiculo.componentesAero);
        const relPrecioPotencia = this.calcularRelacionPrecioPotencia(vehiculo.precioBaseMillonesUSD, vehiculo.potenciaCaballos);

        let clasificacion: 'Excepcional' | 'Elite' | 'Estandar' = 'Estandar';
        if (vehiculo.potenciaCaballos >= 1500 && downforceTotal >= 600) {
          clasificacion = 'Excepcional';
        } else if (vehiculo.potenciaCaballos >= 1000 || vehiculo.precioBaseMillonesUSD >= 3.0) {
          clasificacion = 'Elite';
        }

        reportes.push({
          vehiculo: `${vehiculo.marcaModelo} [${vehiculo.vehiculoId}]`,
          categoria: vehiculo.categoria,
          potenciaHp: vehiculo.potenciaCaballos,
          precioMUSD: vehiculo.precioBaseMillonesUSD,
          downforceTotalKg: downforceTotal,
          relacionPrecioPotencia: relPrecioPotencia,
          clasificacionExclusividad: clasificacion,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Comparador Autos Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.potenciaHp - a.potenciaHp);
  }
}

function imprimirReporteComparadorAutos(titulo: string, reportes: readonly ReporteComparadorAutos[]): void {
  console.log(`=== [COMPARADOR DE AUTOS PREMIUM - HIPERDEPORTIVOS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Vehículo: ${item.vehiculo} | Categoría: ${item.categoria} | Potencia: ${item.potenciaHp} HP | Precio: $${item.precioMUSD}M USD | Downforce: ${item.downforceTotalKg} kg | Ratio $/HP: $${item.relacionPrecioPotencia} | Exclusividad: ${item.clasificacionExclusividad}`
    );
  });
  console.log("====================================================================================================================\n");
}

async function ejecutarFlujoComparadorAutos(): Promise<void> {
  const analizadorOficial = new AnalizadorComparadorAutos(registroAutosPremium);
  const reporteOficial = await analizadorOficial.procesarAnalisisAutosAsync();
  imprimirReporteComparadorAutos("Análisis Oficial de Rendimiento y Exclusividad en Hiperdeportivos", reporteOficial);

  // caso: Prototipo experimental con homologacion pendiente y componentes aerodinamicos inestables
  const vehiculoCasoLimite: readonly VehiculoHiperdeportivo[] = [
    {
      vehiculoId: "AUTO-9999",
      marcaModelo: "Prototipo Experimental Zephyr X",
      categoria: "Exotico",
      motorizacion: "V10_Atmosferico",
      potenciaCaballos: 600,
      precioBaseMillonesUSD: 1.2,
      estadoHomologacion: "EnPruebasPrototipo",
      componentesAero: [
        { componenteId: "AERO-99", nombreAerodinamica: "Aleron Experimental Prototipo", cargaDownforceKg: 90, coeficienteArrastreCd: 0.50 }
      ]
    }
  ];

  const analizadorLimite = new AnalizadorComparadorAutos(vehiculoCasoLimite);
  const reporteLimite = await analizadorLimite.procesarAnalisisAutosAsync();
  imprimirReporteComparadorAutos("caso: Prototipo experimental con homologacion pendiente y componentes aerodinamicos inestables", reporteLimite);
}

ejecutarFlujoComparadorAutos();