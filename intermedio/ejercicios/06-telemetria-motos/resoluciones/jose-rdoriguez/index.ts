// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)
export type ModoConduccion = 'Track' | 'Sport' | 'Rain' | 'Custom';
export type EstadoMecanico = 'Optimo' | 'Precaucion' | 'Critico';
export type MarchaTransmision = 1 | 2 | 3 | 4 | 5 | 6;

export interface LecturaTelemetria {
    readonly timestampMs: number;
    readonly velocidadKmh: number;
    readonly rpm: number;
    readonly temperaturaMotorC: number;
    readonly presionNeumaticoDelanteroPsi: number;
    readonly presionNeumaticoTraseroPsi: number;
    readonly anguloInclinacionGrados: number;
    readonly marcha: MarchaTransmision;
}

export interface MotoDeportiva {
    readonly id: string;
    readonly modelo: string;
    readonly cilindradaCc: number;
    readonly modoConduccion: ModoConduccion;
    readonly lecturas: readonly LecturaTelemetria[];
}

export interface MetricasTelemetria {
    readonly velocidadMaximaKmh: number;
    readonly velocidadPromedioKmh: number;
    readonly rpmMaximo: number;
    readonly temperaturaPromedioC: number;
    readonly inclinacionMaximaGrados: number;
    readonly estadoGeneral: EstadoMecanico;
    readonly alertasMecanicas: readonly string[];
}

export interface ResumenTelemetriaMoto {
    readonly motoId: string;
    readonly modelo: string;
    readonly cilindradaCc: number;
    readonly totalLecturasValidas: number;
    readonly metricas: MetricasTelemetria;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };
// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO
export function validarLecturaTelemetria(lectura: LecturaTelemetria): ResultadoValidacion<LecturaTelemetria> {
    const errores: string[] = [];
    const { velocidadKmh, rpm, temperaturaMotorC, presionNeumaticoDelanteroPsi, presionNeumaticoTraseroPsi, anguloInclinacionGrados } = lectura;

    if (velocidadKmh < 0 || velocidadKmh > 360) {
        errores.push(`Lectura invalida: Velocidad fuera de rango operativo (${velocidadKmh} km/h).`);
    }

    if (rpm < 0 || rpm > 17500) {
        errores.push(`Lectura invalida: RPM fuera del limite del tacometro (${rpm} RPM).`);
    }

    if (temperaturaMotorC < -20 || temperaturaMotorC > 150) {
        errores.push(`Lectura invalida: Temperatura de motor anomala (${temperaturaMotorC} C).`);
    }

    if (presionNeumaticoDelanteroPsi <= 0 || presionNeumaticoTraseroPsi <= 0) {
        errores.push('Lectura invalida: Presion de neumatico no puede ser menor o igual a 0 PSI.');
    }

    if (anguloInclinacionGrados < 0 || anguloInclinacionGrados > 70) {
        errores.push(`Lectura invalida: Angulo de inclinacion fuera de limites fisicos (${anguloInclinacionGrados} deg).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: lectura }
        : { esValido: false, errores };
}

export function validarMotoDeportiva(moto: MotoDeportiva): readonly string[] {
    const advertencias: string[] = [];

    if (moto.cilindradaCc < 125 || moto.cilindradaCc > 1400) {
        advertencias.push(`Cilindrada fuera del rango de motos deportivas homologadas (${moto.cilindradaCc} cc).`);
    }

    if (moto.lecturas.length === 0) {
        advertencias.push('La moto no registra ninguna lectura de telemetria en la sesion.');
    }

    return advertencias;
}
// 3. TRANSFORMACIÓN Y CÁLCULOS TÉCNICOS
export function calcularMetricasTelemetria(lecturas: readonly LecturaTelemetria[]): MetricasTelemetria {
    if (lecturas.length === 0) {
        return {
            velocidadMaximaKmh: 0,
            velocidadPromedioKmh: 0,
            rpmMaximo: 0,
            temperaturaPromedioC: 0,
            inclinacionMaximaGrados: 0,
            estadoGeneral: 'Optimo',
            alertasMecanicas: []
        };
    }

    const velocidadMaximaKmh = Math.max(...lecturas.map((l) => l.velocidadKmh));
    const sumaVelocidad = lecturas.reduce((acc, l) => acc + l.velocidadKmh, 0);
    const velocidadPromedioKmh = Number((sumaVelocidad / lecturas.length).toFixed(1));

    const rpmMaximo = Math.max(...lecturas.map((l) => l.rpm));

    const sumaTemperatura = lecturas.reduce((acc, l) => acc + l.temperaturaMotorC, 0);
    const temperaturaPromedioC = Number((sumaTemperatura / lecturas.length).toFixed(1));

    const inclinacionMaximaGrados = Math.max(...lecturas.map((l) => l.anguloInclinacionGrados));

    const alertas: string[] = [];

    // Evaluacion de umbrales criticos y alertas mecanicas
    const sobrecalentamiento = lecturas.some((l) => l.temperaturaMotorC >= 115);
    if (sobrecalentamiento) {
        alertas.push('ALERTA: Temperatura de refrigerante superior a 115 C detectada.');
    }

    const rpmCritico = lecturas.some((l) => l.rpm >= 15500);
    if (rpmCritico) {
        alertas.push('ALERTA: Incursion mantenida en zona roja de RPM (Corte de inyeccion).');
    }

    const presionBaja = lecturas.some((l) => l.presionNeumaticoDelanteroPsi < 28 || l.presionNeumaticoTraseroPsi < 26);
    if (presionBaja) {
        alertas.push('PRECAUCION: Presion de neumaticos por debajo del umbral de carrera recomendado.');
    }

    let estadoGeneral: EstadoMecanico = 'Optimo';
    if (sobrecalentamiento || rpmCritico) {
        estadoGeneral = 'Critico';
    } else if (presionBaja || temperaturaPromedioC > 105) {
        estadoGeneral = 'Precaucion';
    }

    return {
        velocidadMaximaKmh,
        velocidadPromedioKmh,
        rpmMaximo,
        temperaturaPromedioC,
        inclinacionMaximaGrados,
        estadoGeneral,
        alertasMecanicas: alertas
    };
}

export function procesarTelemetriaMoto(motoRaw: MotoDeportiva): ResumenTelemetriaMoto {
    const advertencias: string[] = [...validarMotoDeportiva(motoRaw)];
    const lecturasValidas: LecturaTelemetria[] = [];

    for (const lectura of motoRaw.lecturas) {
        const res = validarLecturaTelemetria(lectura);
        if (res.esValido) {
            lecturasValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasTelemetria(lecturasValidas);

    return {
        motoId: motoRaw.id,
        modelo: motoRaw.modelo,
        cilindradaCc: motoRaw.cilindradaCc,
        totalLecturasValidas: lecturasValidas.length,
        metricas,
        advertencias
    };
}
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
export function mostrarResumenTelemetria(resumen: ResumenTelemetriaMoto, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` TELEMETRIA DE MOTOS DEPORTIVAS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`ID Moto             : ${resumen.motoId}`);
    console.log(`Modelo              : ${resumen.modelo} (${resumen.cilindradaCc} cc)`);
    console.log(`Lecturas Procesadas : ${resumen.totalLecturasValidas}`);
    console.log(`Estado Mecanico     : ${resumen.metricas.estadoGeneral.toUpperCase()}`);
    console.log(`Velocidad Max/Prom  : ${resumen.metricas.velocidadMaximaKmh} km/h / ${resumen.metricas.velocidadPromedioKmh} km/h`);
    console.log(`RPM Maximo          : ${resumen.metricas.rpmMaximo} RPM`);
    console.log(`Temperatura Prom    : ${resumen.metricas.temperaturaPromedioC} C`);
    console.log(`Max Inclinacion     : ${resumen.metricas.inclinacionMaximaGrados} deg`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.metricas.alertasMecanicas.length > 0) {
        console.log(`ALERTAS MECANICAS DETECTADAS (${resumen.metricas.alertasMecanicas.length}):`);
        resumen.metricas.alertasMecanicas.forEach((alerta) => console.log(`   - ${alerta}`));
        console.log(`----------------------------------------------------------------------`);
    }

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE SENSADO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }
}
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
// --- CASO 1: Sesión de Pista Óptima (Caso Normal) ---
const motoSuperbikeNormal: MotoDeportiva = {
    id: 'MOTO-S1000RR-01',
    modelo: 'BMW S1000RR M Package',
    cilindradaCc: 999,
    modoConduccion: 'Track',
    lecturas: [
        {
            timestampMs: 1700000000100,
            velocidadKmh: 245,
            rpm: 12500,
            temperaturaMotorC: 94,
            presionNeumaticoDelanteroPsi: 32.5,
            presionNeumaticoTraseroPsi: 29.0,
            anguloInclinacionGrados: 48,
            marcha: 5
        },
        {
            timestampMs: 1700000000200,
            velocidadKmh: 288,
            rpm: 14200,
            temperaturaMotorC: 98,
            presionNeumaticoDelanteroPsi: 32.8,
            presionNeumaticoTraseroPsi: 29.4,
            anguloInclinacionGrados: 56,
            marcha: 6
        },
        {
            timestampMs: 1700000000300,
            velocidadKmh: 160,
            rpm: 9800,
            temperaturaMotorC: 95,
            presionNeumaticoDelanteroPsi: 32.2,
            presionNeumaticoTraseroPsi: 29.1,
            anguloInclinacionGrados: 52,
            marcha: 3
        }
    ]
};

// --- CASO 2: Sensores Corruptos y Fallo Térmico (Caso Límite) ---
const motoLimiteCritica: MotoDeportiva = {
    id: 'MOTO-R1M-02',
    modelo: 'Yamaha YZF-R1M',
    cilindradaCc: 998,
    modoConduccion: 'Custom',
    lecturas: [
        {
            timestampMs: 1700000001000,
            velocidadKmh: 295,
            rpm: 15800, // RPM zona roja
            temperaturaMotorC: 118, // Sobrecalentamiento extremo
            presionNeumaticoDelanteroPsi: 24.0, // Presion peligrosamente baja
            presionNeumaticoTraseroPsi: 22.5,
            anguloInclinacionGrados: 61,
            marcha: 6
        },
        {
            timestampMs: 1700000002000,
            velocidadKmh: 420, // Velocidad imposible (>360 km/h) -> Invalida
            rpm: 18500, // RPM imposible -> Invalida
            temperaturaMotorC: 200, // Sensor dañado -> Invalida
            presionNeumaticoDelanteroPsi: -5.0, // Presion negativa -> Invalida
            presionNeumaticoTraseroPsi: 28.0,
            anguloInclinacionGrados: 85, // Inclinacion imposible -> Invalida
            marcha: 1
        }
    ]
};

// Ejecución
const resumenNormal = procesarTelemetriaMoto(motoSuperbikeNormal);
mostrarResumenTelemetria(resumenNormal, 'Caso Normal - Sesion en Circuito Optima');

const resumenLimite = procesarTelemetriaMoto(motoLimiteCritica);
mostrarResumenTelemetria(resumenLimite, 'Caso Limite - Fallo Mecanico y Sensores Corruptos');