# Intermedio 25: Revision de renders arquitectura

**Tematica:** diseno 3D arquitectura
**Alumna:** Dulce Morales

## Problema

Un estudio de visualizacion arquitectonica entrega renders a sus clientes. Antes de enviarlos, cada render pasa una revision:

- resolucion minima segun su uso;
- observaciones de calidad, que pueden ser criticas o menores;
- limite de rondas de cambios incluidas.

Ademas, cada proyecto exige ciertas vistas (fachada, sala, cocina...) y el programa avisa cuales faltan. Al final muestra un tablero por proyecto.

## Que hice

### Modelo

- Union types: `Uso`, `Vista`, `Luz`, `Observacion` y `Veredicto` (aprobado, cambios menores, rechazado).
- `interface Render`:
  - `resolucion` es una tupla `[ancho, alto]`;
  - `observaciones` es un `Set<Observacion>`.
- `interface Proyecto` con `vistasRequeridas: Set<Vista>`, e `interface Revision`.

### Uso de `Record`, `Map` y `Set`

- **`Record<Uso, [ancho, alto]>`:** la resolucion minima para cada uso. Tambien uso `Record` para contar veredictos y para el icono de cada veredicto.
- **`Set`:**
  - las observaciones criticas;
  - las observaciones de cada render;
  - las vistas requeridas de cada proyecto;
  - las vistas ya aprobadas. Con `has` se calculan las que faltan.
- **`Map`:** buscar proyectos por codigo, agrupar las revisiones por proyecto (con `reduce`) y contar que observaciones aparecen mas.

### Reglas de negocio

| Uso | Resolucion minima |
|---|---|
| web | 1920 x 1080 |
| redes | 1080 x 1080 |
| impresion | 6000 x 4000 |

- **Rechazado:** resolucion menor al minimo, o al menos una observacion **critica** (ruido, horizonte torcido, materiales sin textura).
- **Cambios menores:** solo observaciones menores (sin escala humana, exposicion alta, vegetacion repetida).
- **Aprobado:** sin observaciones y con buena resolucion.
- **Ronda extra:** si la ronda del render pasa las incluidas en el proyecto. Cada ronda extra cuesta $120.
- **Listo para entregar:** todas las vistas requeridas tienen al menos un render aprobado.

### Casos probados

- **Limite de resolucion:** `lago_aerea_v1.png` mide **exactamente** 1920x1080, el minimo para web, y se aprueba.
- **Limite de rondas:** `loft_sala_v2.png` va en la ronda 2 de 2 incluidas, asi que **no** es ronda extra.
- **Rondas extra:** la sala de Casa del Lago (ronda 3 de 2) y el lobby de Torre Norte (ronda 4 de 3).
- **Rechazos:**
  - ruido en la cocina;
  - fachada para impresion a 5000x3500;
  - lobby con 2 observaciones criticas;
  - un render de un proyecto que no existe.
- **Tablero:**
  - Casa del Lago y Torre Norte siguen en revision, con sus vistas faltantes;
  - Loft Centro tiene sus 2 vistas aprobadas y queda **listo para entregar**.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/25-arquitectura-3d/index.ts
```

## Salida esperada

```text
====================== REVISION DE RENDERS ======================
OK lago_fachada_v2.png    fachada  atardecer web       3840x2160 -> aprobado
OK lago_aerea_v1.png      aerea    dia       web       1920x1080 -> aprobado
~  lago_sala_v3.png       sala     dia       impresion 6000x4000 -> cambios menores  (ronda extra)
     - menor: sin escala humana
X  lago_cocina_v1.png     cocina   noche     web       2560x1440 -> rechazado
     - critico: ruido
     - menor: exposicion alta
X  torre_fachada_v1.png   fachada  noche     impresion 5000x3500 -> rechazado
     - 5000x3500 es menor que el minimo para impresion (6000x4000)
~  torre_aerea_v2.png     aerea    dia       web       3840x2160 -> cambios menores
     - menor: vegetacion repetida
     - menor: sin escala humana
OK torre_terraza_v1.png   terraza  atardecer redes     1080x1350 -> aprobado
X  torre_lobby_v4.png     sala     dia       web       2560x1440 -> rechazado  (ronda extra)
     - critico: horizonte torcido
     - critico: materiales sin textura
OK loft_sala_v2.png       sala     dia       redes     1080x1080 -> aprobado
OK loft_recamara_v1.png   recamara noche     web       2560x1440 -> aprobado
X  oficina_v1.png         sala     dia       web       1920x1080 -> rechazado
     - proyecto OFI-SUR no existe

====================== TABLERO POR PROYECTO ======================

Casa del Lago (Familia Rojas)
  Renders: 4 | aprobados 2, cambios menores 1, rechazados 1
  Vistas requeridas aprobadas: 2/4 | faltan: sala, cocina
  Rondas extra: 1 (cobro adicional $120)
  Estado: en revision

Torre Norte (Constructora Andina)
  Renders: 4 | aprobados 1, cambios menores 1, rechazados 2
  Vistas requeridas aprobadas: 1/3 | faltan: fachada, aerea
  Rondas extra: 1 (cobro adicional $120)
  Estado: en revision

Loft Centro (Ana Prieto)
  Renders: 2 | aprobados 2, cambios menores 0, rechazados 0
  Vistas requeridas aprobadas: 2/2 | completo
  Rondas extra: 0 (cobro adicional $0)
  Estado: LISTO PARA ENTREGAR

Renders sin proyecto: oficina_v1.png
Observaciones encontradas: sin escala humana (2), exposicion alta (1), horizonte torcido (1), materiales sin textura (1), ruido (1), vegetacion repetida (1)
```
