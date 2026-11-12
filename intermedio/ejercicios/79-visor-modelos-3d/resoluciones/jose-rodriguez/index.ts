
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type CategoriaAssetPingPong =
    | 'RaquetaProfesional'
    | 'MesaTorneo'
    | 'PelotaOficial'
    | 'RedSoporte'
    | 'RobotLanzador';

export type FormatoModelo3D = 'GLB' | 'GLTF' | 'FBX' | 'OBJ';

export type NivelDetalleLOD = 'LOD0_Ultra' | 'LOD1_Medio' | 'LOD2_Bajo';

export type ModoIluminacionVisor =
    | 'EstudioTorneo'
    | 'LuzNatural'
    | 'WireframeInspeccion'
    | 'MapaNormalesPBR';

export type EstadoRenderAsset =
    | 'CargadoEnEscena'
    | 'OcultoEnEscena'
    | 'ExcedePresupuestoPoligonal'
    | 'ErrorDeMalla';

export interface Vector3D {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export interface ConfiguracionEscena3D {
    readonly nombreEscena: string;
    readonly presupuestoMaximoTriangulos: number;
    readonly presupuestoMaximoVRAM_MB: number;
    readonly iluminacionActiva: ModoIluminacionVisor;
}

export interface Asset3DPingPongDominio {
    readonly id: string;
    readonly codigoAsset: string;
    readonly nombre: string;
    readonly categoria: CategoriaAssetPingPong;
    readonly formato: FormatoModelo3D;
    readonly nivelLOD: NivelDetalleLOD;
    readonly triangulosBase: number;
    readonly triangulosEfectivos: number;
    readonly resolucionTexturaPx: number;
    readonly tamanoVRAM_MB: number;
    readonly posicion: Vector3D;
    readonly escala: Vector3D;
    readonly rotacionGradosY: number;
    readonly tieneMaterialPBR: boolean;
    readonly animacionActiva: boolean;
    readonly estadoRender: EstadoRenderAsset;
}

// DTO de entrada para importar un modelo 3D de ping-pong al visor
export interface CargarAsset3DDTO {
    readonly codigoAsset: string;
    readonly nombre: string;
    readonly categoria: CategoriaAssetPingPong;
    readonly formato: FormatoModelo3D;
    readonly nivelLOD?: NivelDetalleLOD;
    readonly triangulosBase: number;
    readonly resolucionTexturaPx: number;
    readonly posicion?: Vector3D;
    readonly escalaUniforme?: number;
    readonly rotacionGradosY?: number;
    readonly tieneMaterialPBR?: boolean;
    readonly animacionActiva?: boolean;
}

// DTO de interacción del usuario en el viewport 3D (transformación, LOD, visibilidad)
export interface ActualizarAssetVisorDTO {
    readonly codigoAsset: string;
    readonly nuevoNivelLOD?: NivelDetalleLOD;
    readonly nuevaPosicion?: Vector3D;
    readonly nuevaEscalaUniforme?: number;
    readonly nuevaRotacionGradosY?: number;
    readonly visibleEnEscena?: boolean;
    readonly animacionActiva?: boolean;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenCategoriaAsset3D {
    readonly totalModelos: number;
    readonly activosEnEscena: number;
    readonly triangulosAcumulados: number;
    readonly consumoVRAM_MB: number;
}

export interface ReporteVisorAssets3D {
    readonly reporteId: string;
    readonly configuracionEscena: ConfiguracionEscena3D;
    readonly totalAssetsImportados: number;
    readonly assetsActivosEscenaCount: number;
    readonly assetsRechazadosPresupuestoCount: number;
    readonly triangulosTotalesActivos: number;
    readonly porcentajePresupuestoTriangulos: number;
    readonly vramTotalConsumidaMB: number;
    readonly porcentajePresupuestoVRAM: number;
    readonly fpsEstimadosViewport: number;
    readonly assetMasComplejo: Asset3DPingPongDominio | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaAssetPingPong, ResumenCategoriaAsset3D>>;
    readonly listaAssetsEscena: readonly Asset3DPingPongDominio[];
    readonly advertencias: readonly string[];
}

// 2. REPOSITORIO GENÉRICO EN MEMORIA (Generics & Encapsulamiento)

export class RepositorioEnMemoria<T extends { readonly id: string }> {
    private readonly registros: Map<string, T> = new Map();

    public guardar(entidad: T): void {
        this.registros.set(entidad.id, entidad);
    }

    public obtenerPorId(id: string): T | undefined {
        return this.registros.get(id);
    }

    public buscarUno(predicado: (item: T) => boolean): T | undefined {
        for (const item of this.registros.values()) {
            if (predicado(item)) {
                return item;
            }
        }
        return undefined;
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.registros.values());
    }

    public contar(): number {
        return this.registros.size;
    }
}

// 3. VALIDACIONES, CÁLCULOS DE MALLA/VRAM Y TRANSFORMACIONES DTO <-> DOMINIO

const CATEGORIAS_ASSET_PINGPONG: readonly CategoriaAssetPingPong[] = [
    'RaquetaProfesional',
    'MesaTorneo',
    'PelotaOficial',
    'RedSoporte',
    'RobotLanzador'
];

const FACTOR_REDUCCION_LOD: Readonly<Record<NivelDetalleLOD, number>> = {
    LOD0_Ultra: 1.0,
    LOD1_Medio: 0.5,
    LOD2_Bajo: 0.25
};

const RESOLUCIONES_TEXTURA_VALIDAS: readonly number[] = [256, 512, 1024, 2048, 4096];

export function calcularMetricasMalla3D(
    triangulosBase: number,
    nivelLOD: NivelDetalleLOD,
    resolucionTexturaPx: number,
    tieneMaterialPBR: boolean
): { readonly triangulosEfectivos: number; readonly tamanoVRAM_MB: number } {
    const factorLOD = FACTOR_REDUCCION_LOD[nivelLOD];
    const triangulosEfectivos = Math.max(1, Math.round(triangulosBase * factorLOD));

    // Estimación realista: ~48 bytes por triángulo indexado + mapas de textura (Albedo, Normal, Roughness/Metalness)
    const vramGeometriaMB = (triangulosEfectivos * 48) / (1024 * 1024);
    const canalesPBR = tieneMaterialPBR ? 3 : 1;
    const vramTexturasMB =
        (resolucionTexturaPx * resolucionTexturaPx * 4 * canalesPBR) / (1024 * 1024);

    return {
        triangulosEfectivos,
        tamanoVRAM_MB: Number((vramGeometriaMB + vramTexturasMB).toFixed(2))
    };
}

export function estimarFPSViewport(
    triangulosActivos: number,
    presupuestoMaxTriangulos: number,
    modoIluminacion: ModoIluminacionVisor
): number {
    if (triangulosActivos === 0) return 120;
    const cargaRelativa = triangulosActivos / Math.max(1, presupuestoMaxTriangulos);
    const penalizacionShader =
        modoIluminacion === 'WireframeInspeccion'
            ? 1.15
            : modoIluminacion === 'EstudioTorneo'
                ? 0.92
                : 1.0;

    const fpsBase = (120 / Math.max(0.5, cargaRelativa * 1.35)) * penalizacionShader;
    return Math.max(15, Math.min(144, Math.round(fpsBase)));
}

export function validarCargarAsset3DDTO(
    dto: CargarAsset3DDTO
): ResultadoOperacion<CargarAsset3DDTO> {
    const errores: string[] = [];

    if (dto.codigoAsset.trim().length < 4) {
        errores.push(`Código de asset 3D inválido ("${dto.codigoAsset}"): mínimo 4 caracteres.`);
    }

    if (dto.nombre.trim().length < 3) {
        errores.push(`El nombre del modelo 3D ("${dto.nombre}") es obligatorio.`);
    }

    if (!Number.isInteger(dto.triangulosBase) || dto.triangulosBase <= 0 || dto.triangulosBase > 2_000_000) {
        errores.push(
            `Conteo de triángulos fuera de rango (${dto.triangulosBase}) en "${dto.nombre}" (${dto.codigoAsset}).`
        );
    }

    if (!RESOLUCIONES_TEXTURA_VALIDAS.includes(dto.resolucionTexturaPx)) {
        errores.push(
            `Resolución de textura no potencia de 2 válida (${dto.resolucionTexturaPx} px) en "${dto.nombre}". Use: ${RESOLUCIONES_TEXTURA_VALIDAS.join(', ')}.`
        );
    }

    if (dto.escalaUniforme !== undefined && (dto.escalaUniforme <= 0 || dto.escalaUniforme > 50)) {
        errores.push(
            `Escala uniforme inválida (${dto.escalaUniforme}) en "${dto.nombre}".`
        );
    }

    if (dto.posicion) {
        const { x, y, z } = dto.posicion;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
            errores.push(`Coordenadas 3D no finitas en "${dto.nombre}".`);
        }
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearAsset3DDTOADominio(
    dto: CargarAsset3DDTO,
    secuencia: number
): Asset3DPingPongDominio {
    const codigoLimpio = dto.codigoAsset.trim().toUpperCase();
    const nivelLOD: NivelDetalleLOD = dto.nivelLOD ?? 'LOD0_Ultra';
    const tieneMaterialPBR = dto.tieneMaterialPBR ?? true;
    const escalaVal = dto.escalaUniforme ?? 1;
    const { triangulosEfectivos, tamanoVRAM_MB } = calcularMetricasMalla3D(
        dto.triangulosBase,
        nivelLOD,
        dto.resolucionTexturaPx,
        tieneMaterialPBR
    );

    const rotacionNormalizada = (((dto.rotacionGradosY ?? 0) % 360) + 360) % 360;

    return {
        id: `m3d-${codigoLimpio}-${secuencia}`,
        codigoAsset: codigoLimpio,
        nombre: dto.nombre.trim(),
        categoria: dto.categoria,
        formato: dto.formato,
        nivelLOD,
        triangulosBase: dto.triangulosBase,
        triangulosEfectivos,
        resolucionTexturaPx: dto.resolucionTexturaPx,
        tamanoVRAM_MB,
        posicion: dto.posicion ?? { x: 0, y: 0, z: 0 },
        escala: { x: escalaVal, y: escalaVal, z: escalaVal },
        rotacionGradosY: Number(rotacionNormalizada.toFixed(1)),
        tieneMaterialPBR,
        animacionActiva: dto.animacionActiva ?? false,
        estadoRender: 'CargadoEnEscena'
    };
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE VISOR DE ASSETS 3D (PING-PONG)

export function generarReporteVisorAssets3D(
    escena: ConfiguracionEscena3D,
    assets: readonly Asset3DPingPongDominio[],
    advertencias: readonly string[]
): ReporteVisorAssets3D {
    const assetsActivos = assets.filter((a) => a.estadoRender === 'CargadoEnEscena');
    const assetsRechazadosPresupuestoCount = assets.filter(
        (a) => a.estadoRender === 'ExcedePresupuestoPoligonal'
    ).length;

    const triangulosTotalesActivos = assetsActivos.reduce(
        (acc, a) => acc + a.triangulosEfectivos,
        0
    );

    const porcentajePresupuestoTriangulos =
        escena.presupuestoMaximoTriangulos > 0
            ? Number(
                ((triangulosTotalesActivos / escena.presupuestoMaximoTriangulos) * 100).toFixed(1)
            )
            : 0;

    const vramTotalConsumidaMB = Number(
        assetsActivos.reduce((acc, a) => acc + a.tamanoVRAM_MB, 0).toFixed(2)
    );

    const porcentajePresupuestoVRAM =
        escena.presupuestoMaximoVRAM_MB > 0
            ? Number(
                ((vramTotalConsumidaMB / escena.presupuestoMaximoVRAM_MB) * 100).toFixed(1)
            )
            : 0;

    const fpsEstimadosViewport = estimarFPSViewport(
        triangulosTotalesActivos,
        escena.presupuestoMaximoTriangulos,
        escena.iluminacionActiva
    );

    const assetMasComplejo =
        [...assetsActivos].sort(
            (a, b) => b.triangulosEfectivos - a.triangulosEfectivos
        )[0] ?? null;

    const desglosePorCategoria = CATEGORIAS_ASSET_PINGPONG.reduce((acc, cat) => {
        const delGrupo = assets.filter((a) => a.categoria === cat);
        const activosGrupo = delGrupo.filter((a) => a.estadoRender === 'CargadoEnEscena');
        const triangulosAcumulados = activosGrupo.reduce(
            (s, a) => s + a.triangulosEfectivos,
            0
        );
        const consumoVRAM_MB = Number(
            activosGrupo.reduce((s, a) => s + a.tamanoVRAM_MB, 0).toFixed(2)
        );

        acc[cat] = {
            totalModelos: delGrupo.length,
            activosEnEscena: activosGrupo.length,
            triangulosAcumulados,
            consumoVRAM_MB
        };
        return acc;
    }, {} as Record<CategoriaAssetPingPong, ResumenCategoriaAsset3D>);

    return {
        reporteId: `REP-3D-PP-${Date.now()}`,
        configuracionEscena: escena,
        totalAssetsImportados: assets.length,
        assetsActivosEscenaCount: assetsActivos.length,
        assetsRechazadosPresupuestoCount,
        triangulosTotalesActivos,
        porcentajePresupuestoTriangulos,
        vramTotalConsumidaMB,
        porcentajePresupuestoVRAM,
        fpsEstimadosViewport,
        assetMasComplejo,
        desglosePorCategoria,
        listaAssetsEscena: assets,
        advertencias
    };
}

export class ServicioVisorAssets3DPingPong {
    private readonly repoAssets = new RepositorioEnMemoria<Asset3DPingPongDominio>();
    private readonly advertencias: string[] = [];
    private escenaActual: ConfiguracionEscena3D;
    private secuenciaAsset = 1;

    constructor(configuracionInicial: ConfiguracionEscena3D) {
        this.escenaActual = configuracionInicial;
    }

    public cambiarModoIluminacion(nuevoModo: ModoIluminacionVisor): void {
        this.escenaActual = {
            ...this.escenaActual,
            iluminacionActiva: nuevoModo
        };
    }

    public importarAsset3D(
        dto: CargarAsset3DDTO
    ): ResultadoOperacion<Asset3DPingPongDominio> {
        const validacion = validarCargarAsset3DDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoAsset.trim().toUpperCase();
        const duplicado = this.repoAssets.buscarUno(
            (a) => a.codigoAsset === codigoNormalizado
        );
        if (duplicado) {
            const msg = `Asset 3D duplicado en escena: "${codigoNormalizado}" ("${dto.nombre}") ya fue importado.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const asset = mapearAsset3DDTOADominio(dto, this.secuenciaAsset++);
        const activosActuales = this.repoAssets
            .obtenerTodos()
            .filter((a) => a.estadoRender === 'CargadoEnEscena');

        const triangulosProyectados =
            activosActuales.reduce((acc, a) => acc + a.triangulosEfectivos, 0) +
            asset.triangulosEfectivos;
        const vramProyectada = Number(
            (
                activosActuales.reduce((acc, a) => acc + a.tamanoVRAM_MB, 0) +
                asset.tamanoVRAM_MB
            ).toFixed(2)
        );

        if (
            triangulosProyectados > this.escenaActual.presupuestoMaximoTriangulos ||
            vramProyectada > this.escenaActual.presupuestoMaximoVRAM_MB
        ) {
            const msg = `Presupuesto de escena excedido al cargar "${asset.nombre}" (${asset.codigoAsset}): ${triangulosProyectados.toLocaleString()} tris / ${vramProyectada} MB VRAM.`;
            this.advertencias.push(msg);
            const assetFueraPresupuesto: Asset3DPingPongDominio = {
                ...asset,
                estadoRender: 'ExcedePresupuestoPoligonal'
            };
            this.repoAssets.guardar(assetFueraPresupuesto);
            return { ok: true, valor: assetFueraPresupuesto };
        }

        this.repoAssets.guardar(asset);
        return { ok: true, valor: asset };
    }

    public actualizarAssetEnVisor(
        dto: ActualizarAssetVisorDTO
    ): ResultadoOperacion<Asset3DPingPongDominio> {
        const codigoNormalizado = dto.codigoAsset.trim().toUpperCase();
        const asset = this.repoAssets.buscarUno(
            (a) => a.codigoAsset === codigoNormalizado
        );

        if (!asset) {
            const msg = `No se encontró el modelo 3D "${codigoNormalizado}" en el visor.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (
            dto.nuevaEscalaUniforme !== undefined &&
            (dto.nuevaEscalaUniforme <= 0 || dto.nuevaEscalaUniforme > 50)
        ) {
            const msg = `Escala inválida (${dto.nuevaEscalaUniforme}) al transformar "${asset.nombre}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nivelLOD = dto.nuevoNivelLOD ?? asset.nivelLOD;
        const metricas = calcularMetricasMalla3D(
            asset.triangulosBase,
            nivelLOD,
            asset.resolucionTexturaPx,
            asset.tieneMaterialPBR
        );

        const escala =
            dto.nuevaEscalaUniforme !== undefined
                ? {
                    x: dto.nuevaEscalaUniforme,
                    y: dto.nuevaEscalaUniforme,
                    z: dto.nuevaEscalaUniforme
                }
                : asset.escala;

        const rotacionGradosY =
            dto.nuevaRotacionGradosY !== undefined
                ? Number(((((dto.nuevaRotacionGradosY % 360) + 360) % 360)).toFixed(1))
                : asset.rotacionGradosY;

        let estadoRender: EstadoRenderAsset = asset.estadoRender;
        if (dto.visibleEnEscena === false) {
            estadoRender = 'OcultoEnEscena';
        } else if (dto.visibleEnEscena === true || dto.nuevoNivelLOD !== undefined) {
            const otrosActivos = this.repoAssets
                .obtenerTodos()
                .filter((a) => a.id !== asset.id && a.estadoRender === 'CargadoEnEscena');
            const totalTris =
                otrosActivos.reduce((s, a) => s + a.triangulosEfectivos, 0) +
                metricas.triangulosEfectivos;
            const totalVram =
                otrosActivos.reduce((s, a) => s + a.tamanoVRAM_MB, 0) +
                metricas.tamanoVRAM_MB;

            estadoRender =
                totalTris <= this.escenaActual.presupuestoMaximoTriangulos &&
                    totalVram <= this.escenaActual.presupuestoMaximoVRAM_MB
                    ? 'CargadoEnEscena'
                    : 'ExcedePresupuestoPoligonal';
        }

        const actualizado: Asset3DPingPongDominio = {
            ...asset,
            nivelLOD,
            triangulosEfectivos: metricas.triangulosEfectivos,
            tamanoVRAM_MB: metricas.tamanoVRAM_MB,
            posicion: dto.nuevaPosicion ?? asset.posicion,
            escala,
            rotacionGradosY,
            animacionActiva: dto.animacionActiva ?? asset.animacionActiva,
            estadoRender
        };

        this.repoAssets.guardar(actualizado);
        return { ok: true, valor: actualizado };
    }

    public obtenerReporteFinal(): ReporteVisorAssets3D {
        return generarReporteVisorAssets3D(
            this.escenaActual,
            this.repoAssets.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteVisor3D(
    reporte: ReporteVisorAssets3D,
    tituloCaso: string
): void {
    const { configuracionEscena: escena } = reporte;
    console.log(`\n======================================================================`);
    console.log(` VISOR DE ASSETS 3D (PING-PONG) - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Escena 3D           : ${escena.nombreEscena} | Iluminación: ${escena.iluminacionActiva}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Assets en Viewport  : ${reporte.assetsActivosEscenaCount} activos / ${reporte.totalAssetsImportados} importados (Excedidos: ${reporte.assetsRechazadosPresupuestoCount})`);
    console.log(`Carga Poligonal     : ${reporte.triangulosTotalesActivos.toLocaleString()} / ${escena.presupuestoMaximoTriangulos.toLocaleString()} tris (${reporte.porcentajePresupuestoTriangulos}%)`);
    console.log(`Memoria VRAM GPU    : ${reporte.vramTotalConsumidaMB} MB / ${escena.presupuestoMaximoVRAM_MB} MB (${reporte.porcentajePresupuestoVRAM}%)`);
    console.log(`Rendimiento Est.    : ${reporte.fpsEstimadosViewport} FPS`);
    console.log(`Asset Más Complejo  : ${reporte.assetMasComplejo ? `"${reporte.assetMasComplejo.nombre}" (${reporte.assetMasComplejo.triangulosEfectivos.toLocaleString()} tris - ${reporte.assetMasComplejo.nivelLOD})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ALERTAS DE RENDIMIENTO, MALLA Y PRESUPUESTO (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORÍA DE EQUIPAMIENTO PING-PONG:`);
    Object.entries(reporte.desglosePorCategoria).forEach(([cat, info]) => {
        console.log(
            `   - ${cat.padEnd(20)}: ${info.activosEnEscena}/${info.totalModelos} activos | ${String(info.triangulosAcumulados).padStart(7)} tris | VRAM: ${info.consumoVRAM_MB.toFixed(2)} MB`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.listaAssetsEscena.map((a) => ({
            Código: a.codigoAsset,
            Modelo3D: a.nombre,
            Categoría: a.categoria,
            Formato: a.formato,
            LOD: a.nivelLOD,
            Triángulos: a.triangulosEfectivos.toLocaleString(),
            'Textura/VRAM': `${a.resolucionTexturaPx}px (${a.tamanoVRAM_MB} MB)`,
            'Pos (X,Y,Z)': `(${a.posicion.x}, ${a.posicion.y}, ${a.posicion.z})`,
            Estado: a.estadoRender
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de inicialización del pipeline WebGL / PBR
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Arena de Torneo ITTF con Mesa, Raqueta Carbono, Red y Pelota 3 Estrellas (Caso Normal) ---
    const escenaNormal: ConfiguracionEscena3D = {
        nombreEscena: 'Estadio Olímpico Table Tennis Arena',
        presupuestoMaximoTriangulos: 250_000,
        presupuestoMaximoVRAM_MB: 256,
        iluminacionActiva: 'EstudioTorneo'
    };

    const visorNormal = new ServicioVisorAssets3DPingPong(escenaNormal);

    visorNormal.importarAsset3D({
        codigoAsset: 'PP-MESA-001',
        nombre: 'Mesa Oficial ITTF Pro Blue 25mm',
        categoria: 'MesaTorneo',
        formato: 'GLB',
        nivelLOD: 'LOD0_Ultra',
        triangulosBase: 48_500,
        resolucionTexturaPx: 2048,
        posicion: { x: 0, y: 0, z: 0 },
        tieneMaterialPBR: true
    });

    visorNormal.importarAsset3D({
        codigoAsset: 'PP-RAQ-002',
        nombre: 'Raqueta Carbono Viscaria + Goma Tenergy',
        categoria: 'RaquetaProfesional',
        formato: 'GLTF',
        nivelLOD: 'LOD0_Ultra',
        triangulosBase: 32_000,
        resolucionTexturaPx: 2048,
        posicion: { x: -1.45, y: 0.92, z: 0.15 },
        rotacionGradosY: 35,
        tieneMaterialPBR: true,
        animacionActiva: true
    });

    visorNormal.importarAsset3D({
        codigoAsset: 'PP-RED-003',
        nombre: 'Soporte y Red Tensada Torneo',
        categoria: 'RedSoporte',
        formato: 'GLB',
        nivelLOD: 'LOD1_Medio',
        triangulosBase: 26_000,
        resolucionTexturaPx: 1024,
        posicion: { x: 0, y: 0.76, z: 0 },
        tieneMaterialPBR: true
    });

    visorNormal.importarAsset3D({
        codigoAsset: 'PP-PEL-004',
        nombre: 'Pelota ABS 40+ 3 Estrellas Naranja',
        categoria: 'PelotaOficial',
        formato: 'GLB',
        nivelLOD: 'LOD0_Ultra',
        triangulosBase: 6_400,
        resolucionTexturaPx: 512,
        posicion: { x: 0.25, y: 1.08, z: -0.1 },
        tieneMaterialPBR: true,
        animacionActiva: true
    });

    visorNormal.importarAsset3D({
        codigoAsset: 'PP-ROB-005',
        nombre: 'Robot Lanzador Multiefecto Pro-Spin',
        categoria: 'RobotLanzador',
        formato: 'FBX',
        nivelLOD: 'LOD1_Medio',
        triangulosBase: 54_000,
        resolucionTexturaPx: 1024,
        posicion: { x: 1.65, y: 0.76, z: 0 },
        rotacionGradosY: 180,
        tieneMaterialPBR: true
    });

    // Transformación interactiva en el visor (rotar raqueta y optimizar LOD de mesa)
    visorNormal.actualizarAssetEnVisor({
        codigoAsset: 'PP-RAQ-002',
        nuevaPosicion: { x: -1.35, y: 0.98, z: 0.2 },
        nuevaRotacionGradosY: 420 // Se normaliza a 60°
    });

    const reporteNormal = visorNormal.obtenerReporteFinal();
    mostrarReporteVisor3D(reporteNormal, 'Caso Normal - Escena Torneo Ping-Pong y PBR');

    // --- CASO 2: Exceso de Presupuesto Poligonal/VRAM, Optimización LOD y DTO Inválido (Caso Límite) ---
    const escenaLimite: ConfiguracionEscena3D = {
        nombreEscena: 'Visor Móvil WebGL (Presupuesto Restringido)',
        presupuestoMaximoTriangulos: 60_000,
        presupuestoMaximoVRAM_MB: 64,
        iluminacionActiva: 'LuzNatural'
    };

    const visorLimite = new ServicioVisorAssets3DPingPong(escenaLimite);

    // Asset 1 cabe dentro del presupuesto (35,000 tris < 60,000)
    visorLimite.importarAsset3D({
        codigoAsset: 'PP-MESA-MOB',
        nombre: 'Mesa Entrenamiento Compacta',
        categoria: 'MesaTorneo',
        formato: 'GLB',
        nivelLOD: 'LOD0_Ultra',
        triangulosBase: 35_000,
        resolucionTexturaPx: 1024,
        tieneMaterialPBR: true
    });

    // Asset 2 en LOD0_Ultra (80,000 tris) excede el presupuesto -> entra como ExcedePresupuestoPoligonal
    visorLimite.importarAsset3D({
        codigoAsset: 'PP-ROB-HEAVY',
        nombre: 'Robot Industrial Alta Densidad',
        categoria: 'RobotLanzador',
        formato: 'OBJ',
        nivelLOD: 'LOD0_Ultra',
        triangulosBase: 80_000,
        resolucionTexturaPx: 1024,
        tieneMaterialPBR: false
    });

    // Usuario baja el LOD de PP-ROB-HEAVY a LOD2_Bajo (25% -> 20,000 tris) y logra cargarlo en escena (35k + 20k = 55k <= 60k)
    visorLimite.actualizarAssetEnVisor({
        codigoAsset: 'PP-ROB-HEAVY',
        nuevoNivelLOD: 'LOD2_Bajo'
    });

    // Intento de importar asset duplicado
    visorLimite.importarAsset3D({
        codigoAsset: 'PP-MESA-MOB',
        nombre: 'Mesa Duplicada',
        categoria: 'MesaTorneo',
        formato: 'GLB',
        triangulosBase: 10_000,
        resolucionTexturaPx: 512
    });

    // Intento de importar DTO corrupto (resolución no potencia de 2, triángulos negativos, escala 0)
    visorLimite.importarAsset3D({
        codigoAsset: 'X',
        nombre: 'AB',
        categoria: 'PelotaOficial',
        formato: 'GLB',
        triangulosBase: -500,
        resolucionTexturaPx: 777,
        escalaUniforme: 0
    });

    const reporteLimite = visorLimite.obtenerReporteFinal();
    mostrarReporteVisor3D(reporteLimite, 'Caso Límite - Presupuesto Poligonal, Recuperación LOD y DTO Corrupto');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));