# Intermedio 47: Portafolio de dibujo

**Tematica:** dibujo e ilustracion
**Alumna:** Dulce Morales

## Problema

Una ilustradora administra su portafolio en linea:

- cada obra pasa por estados: **borrador -> en revision -> publicada -> archivada**;
- solo se publica si cumple requisitos (titulo, etiquetas y resolucion minima);
- las obras publicadas hace mas de un ano y con poco interes se archivan solas;
- se arma un reporte: obras por mes, tecnicas mas usadas y las obras con mejor interaccion.

## Que hice

### Coleccion generica

`Coleccion<T extends { id }>` guarda los elementos en una lista **privada**:

- `buscar(id)` y `donde(predicado)`;
- `agruparPor<K>(clave)`: un metodo **generico** dentro de una clase generica. Agrupa por cualquier clave (estado, mes, tecnica) y devuelve un `Map<K, T[]>`.

### Servicio `PortafolioService` (encapsulamiento)

- `cambiarEstado(id, nuevo, hoy)`: revisa que la transicion este permitida (una tabla `Record<Estado, Estado[]>`). Si es a "publicada", revisa los requisitos con el metodo **privado** `requisitosPublicacion` y guarda la fecha de publicacion.
- `archivarAntiguas(hoy)`: archiva automaticamente las obras viejas con poco interes.
- `interaccion(obra, hoy)`: me gusta por dia desde que se publico.

### Reglas

| Desde | Puede pasar a |
|---|---|
| borrador | en revision |
| en revision | publicada o borrador |
| publicada | archivada |
| archivada | publicada |

- **Requisitos para publicar:**
  - titulo de al menos 3 letras;
  - al menos una etiqueta (las etiquetas son un `Set<string>`);
  - el lado mas corto de la imagen de 1500 px o mas.
- **Archivado automatico:** obras publicadas hace **mas de** 365 dias y con menos de 50 me gusta.

### Fechas

Uso `Date` para la creacion y la publicacion. Los dias transcurridos se calculan con `getTime()`. Las obras se agrupan por mes con `getFullYear()` y `getMonth()`.

### Casos probados

- **Limite de archivado:**
  - "Retrato de Ana" se publico hace **366 dias** y tiene 35 me gusta, asi que se archiva;
  - "Gato astronauta" se publico hace **365 dias exactos** y no se archiva (la regla es "mas de 365").
- **Publicacion rechazada:**
  - "Boceto rapido" no tiene etiquetas y tiene baja resolucion;
  - "Ok" intenta saltar de borrador a publicada, y luego tiene un titulo muy corto.
- **Popular:** "Ciudad bajo la lluvia" es vieja pero tiene 410 me gusta, asi que no se archiva.
- **Reportes:** top por me gusta por dia, obras por mes, tecnicas y etiquetas unicas (con un `Set`).

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/47-portafolio-dibujo/index.ts
```

## Salida esperada

```text
==================== MOVIMIENTOS (16/11/2026) ====================
OK "Bodegon azul" -> publicada
X  "Boceto rapido" no se publica: sin etiquetas, resolucion 1200x900 (lado minimo 1500)
X  "Ok": no se puede pasar de borrador a publicada
OK "Ok" -> en revision
X  "Ok" no se publica: titulo muy corto
!  "Retrato de Ana" archivada automaticamente (35 me gusta)

==================== ESTADO DEL PORTAFOLIO ====================
publicada (5): Ciudad bajo la lluvia, Gato astronauta, Bosque de tinta, Dragon de jade, Bodegon azul
archivada (1): Retrato de Ana
en revision (2): Boceto rapido, Ok

==================== TOP POR INTERACCION (me gusta por dia) ====================
1. Dragon de jade         230 me gusta en  72 dias -> 3.19/dia
2. Ciudad bajo la lluvia  410 me gusta en 432 dias -> 0.95/dia
3. Bosque de tinta         95 me gusta en 241 dias -> 0.39/dia
4. Gato astronauta         20 me gusta en 365 dias -> 0.05/dia
5. Bodegon azul             0 me gusta en   0 dias -> 0/dia

==================== OBRAS CREADAS POR MES Y TECNICA ====================
2025-09: Ciudad bajo la lluvia (acuarela)
2025-10: Retrato de Ana (lapiz)
2025-11: Gato astronauta (digital)
2026-03: Bosque de tinta (tinta)
2026-09: Dragon de jade (digital)
2026-10: Bodegon azul (oleo)
2026-11: Boceto rapido (lapiz), Ok (digital)
Tecnicas: digital 3, lapiz 2, acuarela 1, tinta 1, oleo 1
Etiquetas usadas (10): bodegon, bosque, dragon, espacio, fantasia, gatos, lluvia, paisaje, prueba, retrato
```
