# Intermedio 24: Pipeline de animacion 3D

**Tematica:** animacion 3D
**Alumna:** Dulce Morales

## Problema

Un estudio de animacion sigue el avance de cada toma (*shot*) por las etapas del pipeline:

**layout -> animacion -> iluminacion -> render -> composicion**

Una etapa no puede empezar si la anterior no esta aprobada. El programa:

- detecta tomas con estados imposibles o datos invalidos;
- muestra en que etapa esta cada toma y el avance por secuencia;
- encuentra los cuellos de botella y la carga de cada artista;
- estima si la granja de render alcanza para lo que falta.

## Que hice

### Modelo

- Union types: `Etapa`, `EstadoEtapa` (pendiente, en progreso, en revision, aprobado) y `Calidad` (preview o final).
- `interface Toma`:
  - `etapas` es un `Record<Etapa, EstadoEtapa>`, asi que cada toma tiene obligatoriamente el estado de las 5 etapas;
  - `responsable` es un `Partial<Record<Etapa, string>>`, porque no todas las etapas tienen artista asignado.
- `interface Analisis`: el resultado de revisar cada toma.

### Uso de `Record` y `Map`

- **`Record`** para las tablas de reglas (peso de cada estado y minutos de render por calidad) y para contar las tomas detenidas en cada etapa.
- **`Map`** para agrupar las tomas por secuencia (con `reduce`) y para la carga de trabajo de cada artista.

### Reglas de negocio

- **Orden del pipeline:** si una etapa esta empezada pero la anterior no esta aprobada, es un error.
- **Responsable:** una etapa "en progreso" debe tener un artista asignado.
- **Avance:** cada etapa suma segun su estado (pendiente 0, en progreso 0.4, en revision 0.8, aprobado 1). El avance de la secuencia es el promedio de sus tomas.
- **Etapa actual:** la primera que no esta aprobada. Si todas lo estan, la toma esta terminada.
- **Render pendiente:** frames x minutos por frame (preview 0.5, final 6) x complejidad (1 a 3). Se compara con la capacidad de la granja: nodos x horas disponibles. Las tomas con errores no se cuentan hasta corregirlas.

### Casos probados

- **SQ010_SH010:** toma terminada (100%).
- **SQ030_SH010:** estado imposible, porque la iluminacion empezo mientras la animacion seguia en revision.
- **SQ030_SH020:** 0 frames y una animacion en progreso sin responsable.
- **Cuello de botella:** 4 tomas estan detenidas en animacion, y Mara tiene 3 de esas tareas.
- **Granja:** faltan 133.5 h de render y hay 144 h de capacidad. Alcanza por poco.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/24-pipeline-animacion-3d/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
====================== PIPELINE DE ANIMACION ======================

SQ010  [########..]  75%
  SQ010_SH010 [##########] 100%  TERMINADA
  SQ010_SH020 [#######...]  68%  render (en progreso)
  SQ010_SH030 [######....]  56%  iluminacion (en revision)

SQ020  [##........]  24%
  SQ020_SH010 [###.......]  28%  animacion (en progreso)
  SQ020_SH020 [####......]  36%  animacion (en revision)
  SQ020_SH030 [#.........]   8%  layout (en progreso)

SQ030  [####......]  36%
  SQ030_SH010 [####......]  44%  animacion (en revision)
      X iluminacion esta "en progreso" pero animacion esta "en revision"
  SQ030_SH020 [###.......]  28%  animacion (en progreso)
      X frames invalidos (0)
      X animacion en progreso sin responsable

====================== CUELLOS DE BOTELLA ======================
layout       * 1 toma(s)
animacion    **** 4 toma(s)
iluminacion  * 1 toma(s)
render       * 1 toma(s)
composicion   0 toma(s)

====================== CARGA DE ARTISTAS ======================
Mara  3 tarea(s): SQ020_SH010/animacion, SQ020_SH020/animacion, SQ030_SH010/animacion
Teo   2 tarea(s): SQ010_SH030/iluminacion, SQ030_SH010/iluminacion
Leo   1 tarea(s): SQ020_SH030/layout
Ops   1 tarea(s): SQ010_SH020/render

====================== GRANJA DE RENDER ======================
SQ020_SH010 200 frames x 6 min x complejidad 3 = 60 h
SQ020_SH030 160 frames x 6 min x complejidad 2 = 32 h
SQ010_SH020 144 frames x 6 min x complejidad 2 = 28.8 h
SQ010_SH030 120 frames x 6 min x complejidad 1 = 12 h
SQ020_SH020 80 frames x 0.5 min x complejidad 1 = 0.7 h
Total pendiente: 133.5 h de nodo | capacidad: 3 nodos x 48 h = 144 h
Alcanza: sobran 10.5 h
(Se excluyen 2 toma(s) con errores hasta que se corrijan)
```
