
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RolHeroe = 'Tanque' | 'Tirador' | 'Mago' | 'Asesino' | 'Soporte' | 'Combatiente';
export type DificultadHeroe = 'Facil' | 'Media' | 'Dificil' | 'Experto';
export type TipoAtaque = 'Melee' | 'Rango';

export interface EstadisticasHeroe {
    readonly winRate: number;
    readonly pickRate: number; 
    readonly banRate: number; 
}

export interface HeroeMOBA {
    readonly id: string;
    readonly nombre: string;
    readonly rol: RolHeroe;
    readonly dificultad: DificultadHeroe;
    readonly tipoAtaque: TipoAtaque;
    readonly costoMonedas: number;
    readonly stats: EstadisticasHeroe;
}

export interface RotacionSemanal {
    readonly semanaId: string;
    readonly limiteHeroes: number;
    readonly heroes: readonly HeroeMOBA[];
}

export interface MetricasRotacion {
    readonly totalHeroes: number;
    readonly winRatePromedio: number;
    readonly heroMasPopular: HeroeMOBA | null;
    readonly desglosePorRol: Readonly<Record<RolHeroe, number>>;
    readonly coberturaCompletaRoles: boolean;
}

export interface ResumenRotacionMOBA {
    readonly semanaId: string;
    readonly metricas: MetricasRotacion;
    readonly heroesProcesados: readonly HeroeMOBA[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarHeroe(heroe: HeroeMOBA): ResultadoValidacion<HeroeMOBA> {
    const errores: string[] = [];
    const { winRate, pickRate, banRate } = heroe.stats;

    if (winRate < 0 || winRate > 100) {
        errores.push(`El heroe "${heroe.nombre}" tiene un winRate invalido (${winRate}%).`);
    }

    if (pickRate < 0 || pickRate > 100) {
        errores.push(`El heroe "${heroe.nombre}" tiene un pickRate invalido (${pickRate}%).`);
    }

    if (banRate < 0 || banRate > 100) {
        errores.push(`El heroe "${heroe.nombre}" tiene un banRate invalido (${banRate}%).`);
    }

    if (heroe.costoMonedas <= 0) {
        errores.push(`El heroe "${heroe.nombre}" tiene un costo en monedas invalido (${heroe.costoMonedas}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: heroe }
        : { esValido: false, errores };
}

export function validarRotacion(rotacion: RotacionSemanal): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (rotacion.heroes.length === 0) {
        advertencias.push('La rotacion semanal no contiene heroes asignados.');
    }

    if (rotacion.heroes.length > rotacion.limiteHeroes) {
        advertencias.push(
            `Exceso de heroes: La rotacion sobrepasa el limite permitido (${rotacion.heroes.length}/${rotacion.limiteHeroes}).`
        );
    }

    for (const heroe of rotacion.heroes) {
        if (idsVistos.has(heroe.id)) {
            advertencias.push(`Heroe duplicado detectado: ${heroe.nombre} (ID: ${heroe.id}).`);
        }
        idsVistos.add(heroe.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

const ROLES_DISPONIBLES: readonly RolHeroe[] = [
    'Tanque',
    'Tirador',
    'Mago',
    'Asesino',
    'Soporte',
    'Combatiente'
];

export function calcularMetricasRotacion(heroes: readonly HeroeMOBA[]): MetricasRotacion {
    if (heroes.length === 0) {
        const desgloseVacio = ROLES_DISPONIBLES.reduce((acc, rol) => {
            acc[rol] = 0;
            return acc;
        }, {} as Record<RolHeroe, number>);

        return {
            totalHeroes: 0,
            winRatePromedio: 0,
            heroMasPopular: null,
            desglosePorRol: desgloseVacio,
            coberturaCompletaRoles: false
        };
    }

    const sumaWinRate = heroes.reduce((acc, h) => acc + h.stats.winRate, 0);
    const winRatePromedio = Number((sumaWinRate / heroes.length).toFixed(2));

    // Determina el héroe con mayor pickRate (Popularidad)
    const heroMasPopular = [...heroes].sort((a, b) => b.stats.pickRate - a.stats.pickRate)[0] ?? null;

    // Conteo de héroes por rol usando Record tipado
    const desglosePorRol = heroes.reduce((acc, h) => {
        acc[h.rol] = (acc[h.rol] ?? 0) + 1;
        return acc;
    }, ROLES_DISPONIBLES.reduce((acc, rol) => ({ ...acc, [rol]: 0 }), {} as Record<RolHeroe, number>));

    // Regla de negocio: Verificar si la rotación incluye al menos 1 héroe para cada rol principal
    const coberturaCompletaRoles = ROLES_DISPONIBLES.every((rol) => (desglosePorRol[rol] ?? 0) > 0);

    return {
        totalHeroes: heroes.length,
        winRatePromedio,
        heroMasPopular,
        desglosePorRol,
        coberturaCompletaRoles
    };
}

export function procesarRotacionMOBA(rotacionRaw: RotacionSemanal): ResumenRotacionMOBA {
    const advertencias: string[] = [...validarRotacion(rotacionRaw)];
    const heroesValidos: HeroeMOBA[] = [];

    for (const raw of rotacionRaw.heroes) {
        const res = validarHeroe(raw);
        if (res.esValido) {
            heroesValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasRotacion(heroesValidos);

    if (!metricas.coberturaCompletaRoles) {
        advertencias.push('Atencion: La rotacion actual no cubre todos los roles principales del juego.');
    }

    return {
        semanaId: rotacionRaw.semanaId,
        metricas,
        heroesProcesados: heroesValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRotacion(resumen: ResumenRotacionMOBA, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` ROTACION DE HEROES MOBA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Semana ID           : ${resumen.semanaId}`);
    console.log(`Heroes Validados    : ${resumen.metricas.totalHeroes}`);
    console.log(`WinRate Promedio    : ${resumen.metricas.winRatePromedio}%`);
    console.log(`Heroe Mas Popular   : ${resumen.metricas.heroMasPopular ? `${resumen.metricas.heroMasPopular.nombre} (${resumen.metricas.heroMasPopular.stats.pickRate}% PickRate)` : 'N/A'}`);
    console.log(`Cobertura de Roles  : ${resumen.metricas.coberturaCompletaRoles ? 'COMPLETA' : 'INCOMPLETA'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ROTACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGROSE DE HEROES POR ROL:`);
    Object.entries(resumen.metricas.desglosePorRol).forEach(([rol, cantidad]) => {
        console.log(`   - ${rol.padEnd(12)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.heroesProcesados.map((h) => ({
            Nombre: h.nombre,
            Rol: h.rol,
            Dificultad: h.dificultad,
            Ataque: h.tipoAtaque,
            Costo: `${h.costoMonedas} BP`,
            'WinRate %': `${h.stats.winRate}%`,
            'PickRate %': `${h.stats.pickRate}%`,
            'BanRate %': `${h.stats.banRate}%`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Rotación Balanceada (Caso Normal) ---
const rotacionSemana42: RotacionSemanal = {
    semanaId: '2026-W42',
    limiteHeroes: 6,
    heroes: [
        {
            id: 'moba-1',
            nombre: 'Kaelthas',
            rol: 'Mago',
            dificultad: 'Media',
            tipoAtaque: 'Rango',
            costoMonedas: 10000,
            stats: { winRate: 52.4, pickRate: 18.5, banRate: 12.1 }
        },
        {
            id: 'moba-2',
            nombre: 'Garen',
            rol: 'Tanque',
            dificultad: 'Facil',
            tipoAtaque: 'Melee',
            costoMonedas: 2000,
            stats: { winRate: 50.1, pickRate: 22.0, banRate: 3.5 }
        },
        {
            id: 'moba-3',
            nombre: 'Valera',
            rol: 'Asesino',
            dificultad: 'Experto',
            tipoAtaque: 'Melee',
            costoMonedas: 12500,
            stats: { winRate: 48.9, pickRate: 14.2, banRate: 25.0 }
        },
        {
            id: 'moba-4',
            nombre: 'Sylvanas',
            rol: 'Tirador',
            dificultad: 'Media',
            tipoAtaque: 'Rango',
            costoMonedas: 10000,
            stats: { winRate: 54.1, pickRate: 20.8, banRate: 8.2 }
        },
        {
            id: 'moba-5',
            nombre: 'Malfurion',
            rol: 'Soporte',
            dificultad: 'Facil',
            tipoAtaque: 'Rango',
            costoMonedas: 4000,
            stats: { winRate: 51.0, pickRate: 15.3, banRate: 2.1 }
        },
        {
            id: 'moba-6',
            nombre: 'Thrall',
            rol: 'Combatiente',
            dificultad: 'Media',
            tipoAtaque: 'Melee',
            costoMonedas: 8000,
            stats: { winRate: 53.2, pickRate: 12.4, banRate: 5.0 }
        }
    ]
};

// --- CASO 2: Datos Corruptos y Roles Incompletos (Caso Límite) ---
const rotacionSemana43Limite: RotacionSemanal = {
    semanaId: '2026-W43',
    limiteHeroes: 3, 
    heroes: [
        {
            id: 'moba-7',
            nombre: 'Invoker',
            rol: 'Mago',
            dificultad: 'Experto',
            tipoAtaque: 'Rango',
            costoMonedas: 15000,
            stats: { winRate: 105.0, pickRate: 25.0, banRate: 40.0 } 
        },
        {
            id: 'moba-8',
            nombre: 'Jaina',
            rol: 'Mago',
            dificultad: 'Media',
            tipoAtaque: 'Rango',
            costoMonedas: 8000,
            stats: { winRate: 49.0, pickRate: 10.0, banRate: 1.0 }
        },
        {
            id: 'moba-8', // ID Duplicado
            nombre: 'Jaina Copia',
            rol: 'Mago',
            dificultad: 'Media',
            tipoAtaque: 'Rango',
            costoMonedas: 8000,
            stats: { winRate: 49.0, pickRate: 10.0, banRate: 1.0 }
        },
        {
            id: 'moba-9',
            nombre: 'Pudge',
            rol: 'Tanque',
            dificultad: 'Dificil',
            tipoAtaque: 'Melee',
            costoMonedas: -500, 
            stats: { winRate: 45.0, pickRate: 35.0, banRate: 50.0 }
        }
    ]
};

// Ejecución
const resumenNormal = procesarRotacionMOBA(rotacionSemana42);
mostrarResumenRotacion(resumenNormal, 'Caso Normal - Semana W42 Balanceada');

const resumenLimite = procesarRotacionMOBA(rotacionSemana43Limite);
mostrarResumenRotacion(resumenLimite, 'Caso Limite - Errores de Limite, Stats y IDs Duplicados');