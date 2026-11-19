# Intermedio 49: Control de planos 3D

**Tematica:** arquitectura y modelado 3D
**Alumna:** Dulce Morales

## Problema

Un despacho de arquitectura lleva el control de versiones de sus planos:

- cada plano tiene revisiones (A, B, C...);
- una revision se **aprueba** solo cuando firman todas las disciplinas que la deben revisar (arquitectura, estructura, electrica, hidraulica);
- si una disciplina la rechaza, queda **rechazada**;
- al aprobar una revision nueva, la anterior aprobada queda **obsoleta**: solo hay una vigente;
- una revision que lleva **mas de 5 dias habiles** esperando firmas se marca como atrasada.

## Que hice

### Versionado generico

`Versionado<T extends { letra }>` envuelve la lista de revisiones de un plano:

- `siguienteLetra()` calcula A -> B -> C con `charCodeAt`;
- `agregar()` y `donde(predicado)`.

### Servicio `ControlPlanos` (encapsulamiento)

Los planos se guardan en un `Map` **privado**; solo se cambian por estos metodos:

- `emitir()`: crea la siguiente revision, si no hay otra pendiente en ese plano.
- `firmar()`: registra la firma de una disciplina. Rechaza si a esa disciplina no le toca o si ya firmo.
  - Si una disciplina rechaza, la revision queda rechazada con su comentario.
  - Si firman todas, se aprueba y la aprobada anterior pasa a obsoleta.
- `atrasadas(hoy)`: revisiones pendientes con mas de 5 dias habiles.

Las disciplinas que deben revisar y las que ya firmaron son `Set<Disciplina>`.

### Fechas: dias habiles

`diasHabiles(desde, hasta)` avanza dia por dia con `setDate()` y cuenta solo de lunes a viernes (con `getDay()`). No cuenta el dia de emision.

### Estados de una revision

| Estado | Cuando |
|---|---|
| en revision | recien emitida, esperando firmas |
| aprobada | firmaron todas las disciplinas requeridas |
| rechazada | una disciplina no la aprobo |
| obsoleta | se aprobo una revision mas nueva del mismo plano |

### Casos probados

- **Obsoleta:** A-101 rev. A se aprueba; despues se aprueba la rev. B, asi que la A pasa a obsoleta.
- **Firmas invalidas:** hidraulica firma dos veces, electrica intenta firmar una revision que no le toca, y se intenta emitir una revision mientras otra sigue pendiente.
- **Rechazo:** estructura rechaza A-102 rev. A ("faltan vigas"), y se emite la rev. B.
- **Limite de atraso:**
  - E-201 se emitio el viernes 06/11 y al lunes 16/11 lleva 6 dias habiles, asi que esta atrasada;
  - S-301 y A-102 rev. B se emitieron el lunes 09/11 y llevan **exactamente** 5, asi que todavia no estan atrasadas.
- **Plano inexistente:** X-999.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/49-planos-arquitectura/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
==================== MOVIMIENTOS ====================
OK A-101 rev. A emitida por Lucia (lun 02/11), la revisan: arquitectura, estructura
OK A-101 rev. A: firma arquitectura, faltan estructura
OK A-101 rev. A APROBADA (firmaron todas las disciplinas)
OK A-101 rev. B emitida por Lucia (lun 09/11), la revisan: arquitectura, estructura, hidraulica
OK A-101 rev. B: firma hidraulica, faltan arquitectura, estructura
X A-101 rev. B: hidraulica ya firmo
X A-101 rev. B: electrica no tiene que revisarla
X A-101: ya hay una revision B en revision
OK A-101 rev. B: firma arquitectura, faltan estructura
OK A-101 rev. B APROBADA (firmaron todas las disciplinas)
OK A-102 rev. A emitida por Marco (vie 06/11), la revisan: arquitectura, estructura
X A-102 rev. A RECHAZADA por estructura (faltan vigas en eje 4)
OK A-102 rev. B emitida por Marco (lun 09/11), la revisan: arquitectura, estructura
OK E-201 rev. A emitida por Sofia (vie 06/11), la revisan: electrica, arquitectura
OK E-201 rev. A: firma arquitectura, faltan electrica
OK S-301 rev. A emitida por Diego (lun 09/11), la revisan: estructura
X el plano X-999 no existe

==================== ESTADO AL lun 16/11 ====================
A-101 Planta baja            vigente: rev. B
   rev. A lun 02/11 Lucia  obsoleta
   rev. B lun 09/11 Lucia  aprobada
A-102 Planta alta            vigente: ninguna
   rev. A vie 06/11 Marco  rechazada (estructura: faltan vigas en eje 4)
   rev. B lun 09/11 Marco  en revision
E-201 Instalacion electrica  vigente: ninguna
   rev. A vie 06/11 Sofia  en revision
S-301 Cimentacion            vigente: ninguna
   rev. A lun 09/11 Diego  en revision

==================== REVISIONES ATRASADAS (mas de 5 dias habiles) ====================
! E-201 rev. A: 6 dias habiles esperando a electrica
(Limite: S-301 y A-102 rev. B se emitieron el lun 09/11: llevan 5 dias habiles exactos y todavia no estan atrasadas)
```
