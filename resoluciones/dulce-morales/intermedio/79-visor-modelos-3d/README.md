# Intermedio 79 - Visor de assets 3D

**Tematica:** pingpong
**Alumna:** Dulce Morales

## Problema

El visor de modelos 3D de un videojuego de ping pong. Los assets (mesa, raqueta, pelota, red, marcador)
llegan en un manifiesto. Antes de mostrarlos hay que validarlos, corregir su escala, revisar si caben en
el presupuesto de cada plataforma y calcular como encuadrarlos con la camara.

## Que hice

- **Entrada**: `AssetDTO` es cada entrada del manifiesto, tal como llega (sin confiar en ella).
- **Validacion**: `importar(dto)` la valida y devuelve el `Asset` listo, o `null`, mas la lista de
  diagnosticos (`error` o `aviso`).
- **Escala**: la medida mas larga de la caja envolvente se compara con la medida real del objeto,
  segun el reglamento (mesa 2.74 m, pelota 40 mm...). `detectarEscala` prueba con m, cm, mm y
  pulgadas hasta que la medida cuadra con un margen de 15 %, y aplica el factor de conversion.
- **Repositorio**: `RepoAssets` guarda en memoria y rechaza ids duplicados.
- **Encuadre**: `distanciaEncuadre` calcula a que distancia poner la camara para que la esfera que
  envuelve al modelo quepa en el campo de vision (FOV).
- **Nivel de detalle**: `elegirLod` escoge el LOD segun la distancia de la camara.
- **Presupuesto**: `cabeEn` revisa cada asset contra el presupuesto de movil, web y escritorio.

## Reglas

| Regla | Detalle |
|---|---|
| Formatos | glb, gltf, obj y fbx; el visor solo carga glTF, asi que obj y fbx generan un aviso de conversion |
| LODs | cada nivel debe tener menos triangulos y usarse a mayor distancia que el anterior |
| Texturas | si no son potencia de 2, se genera un aviso |
| Escala | la medida corregida debe quedar a 15 % o menos de la real; si no hay unidad que cuadre, es error |
| Presupuesto movil | 15k triangulos, texturas de 1024 y 3 MB |
| Presupuesto web | 40k triangulos, texturas de 2048 y 8 MB |
| Presupuesto escritorio | 150k triangulos, texturas de 4096 y 40 MB |

## Casos probados

- **Mesa en metros:** se acepta tal cual. No cabe en el presupuesto de movil.
- **Raqueta en .FBX exportada en cm:** se reescala x0.01 y queda el aviso de conversion.
- **Pelota en mm:** se reescala x0.001 y se avisa que su textura de 300x300 no es potencia de 2.
- **Red:** se rechaza porque su LOD1 no reduce triangulos.
- **Marcador (caso limite):** mide 0.575 m contra 0.5 m reales, justo el 15 % de tolerancia, y se acepta.
- **Mesa vieja en .obj:** mide 900 unidades y ninguna unidad cuadra, asi que se rechaza.
- **Trofeo en .blend:** acumula 4 errores.
- **Pelota repetida:** se marca como duplicado.
- **Encuadre y LOD:** se calculan para 0.5, 3, 10 y 40 m.
- **Reporte:** presupuesto por plataforma y resumen final.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/79-visor-modelos-3d/index.ts
```

## Salida esperada

```text
=== Importacion del manifiesto ===
  OK        mesa_pro      mesa_pro.glb
  OK        raqueta_roja  raqueta_roja.FBX
             aviso: .fbx se debe convertir a glb para el visor
             aviso: exportado en cm: se aplica escala x0.01
  OK        pelota        pelota.gltf
             aviso: textura pelota_logo 300x300 no es potencia de 2
             aviso: exportado en mm: se aplica escala x0.001
  RECHAZADO red_basica    red.glb
             ERROR: LOD1 no reduce triangulos (4000 -> 4000)
  OK        marcador      marcador.glb
  RECHAZADO gigante       mesa_vieja.obj
             aviso: .obj se debe convertir a glb para el visor
             ERROR: escala irreconocible: mide 900 y deberia ser ~2.74 m
  RECHAZADO trofeo        trofeo.blend
             ERROR: formato ".blend" no soportado
             ERROR: referencia "trofeo" desconocida
             ERROR: sin niveles de detalle
             ERROR: caja envolvente invalida
  DUPLICADO pelota        pelota_v2.glb

=== Visor: encuadre (FOV 50, margen 1.2) y LOD por distancia ===
  mesa_pro      2.740 x 0.760 x 1.525  m  camara a  4.58 m   0.5m->LOD0 3m->LOD0 10m->LOD1 40m->LOD2
  raqueta_roja  0.150 x 0.014 x 0.260  m  camara a  0.43 m   0.5m->LOD0 3m->LOD1 10m->LOD1 40m->LOD1
  pelota        0.040 x 0.040 x 0.040  m  camara a  0.10 m   0.5m->LOD0 3m->LOD1 10m->LOD1 40m->LOD1
  marcador      0.575 x 0.300 x 0.100  m  camara a  0.93 m   0.5m->LOD0 3m->LOD0 10m->LOD0 40m->LOD0

=== Presupuesto por plataforma ===
  movil      3/4 assets dentro del presupuesto
     - mesa_pro: 32000 tris > 15000, textura 2048 > 1024, 6.2 MB > 3
  web        4/4 assets dentro del presupuesto
  escritorio 4/4 assets dentro del presupuesto

=== Reporte ===
  Assets validos: 4 de 8 | triangulos LOD0 en escena: 47460 | peso total: 9.8 MB
  Reescalados: raqueta_roja x0.01, pelota x0.001
  Por convertir a glb: raqueta_roja
```
