# Intermedio 46: Catalogo de estilos tattoo

**Tematica:** tatuajes
**Alumna:** Dulce Morales

## Problema

Un estudio publica un catalogo de disenos *flash* (dibujos listos para tatuar):

- algunos son **unicos** (solo se tatuan una vez) y otros se pueden **repetir**;
- un cliente puede **reservar** un diseno pagando un anticipo del 30%;
- si no se tatua en 7 dias, la reserva **vence** y el diseno vuelve a estar disponible.

El servicio maneja esos estados, permite filtrar el catalogo y arma reportes por estilo y por artista.

## Que hice

### Repositorio generico

`Repositorio<T extends { id: string }>` guarda los datos en un `Map` **privado**:

- `agregar()` rechaza ids repetidos con un error;
- `obtener()` busca por id;
- `listar(filtro)` recibe una funcion de filtro opcional.

### Servicio `CatalogoService` (encapsulamiento)

- Las ventas son una lista **privada**.
- `reservar()` y `tatuar()`: cada uno valida el estado del diseno y lo cambia. Antes de actuar, revisan si hay reservas vencidas.
- `actualizarVencidas(hoy)`: libera las reservas que ya vencieron.
- `buscar(filtro)`: filtros opcionales por estilo, precio maximo y solo disponibles.
- `ingresosPorArtista()` y `tatuadosPorEstilo()`: reportes en un `Map`.

### Estados del diseno

| Desde | Accion | Hacia |
|---|---|---|
| disponible | reservar | reservado (7 dias) |
| reservado | tatuar (solo el mismo cliente) | tatuado si es unico; disponible si se repite |
| reservado | pasa la fecha limite | disponible |
| disponible | tatuar | tatuado si es unico; disponible si se repite |
| tatuado | cualquier accion | rechazada |

### Fechas

Uso objetos `Date`. La fecha limite de la reserva se calcula sumando 7 dias en milisegundos. La reserva vale **hasta ese dia inclusive**: vence recien al dia siguiente.

### Casos probados

- **Limite de reserva:** Tomas reserva el 03/11 hasta el 10/11. El **10/11** Sara intenta tatuarse ese diseno y se rechaza (la reserva sigue vigente). El 11/11 la reserva vence y Sara puede reservarlo.
- **Reservado por otro:** Diego no puede reservar la serpiente que tiene Valeria.
- **Unico:** despues de tatuar la serpiente a Valeria, nadie mas puede tatuarsela.
- **Se repite:** la golondrina se tatua dos veces y sigue disponible.
- **Validacion:** agregar un diseno con id repetido lanza un error controlado.
- **Busqueda:** disenos disponibles de hasta $150, ordenados por precio.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/46-catalogo-tatuajes/index.ts
```

## Salida esperada

```text
Validacion: id repetido: F1

==================== MOVIMIENTOS ====================
02/11 OK Valeria reserva "Serpiente geometrica" hasta el 09/11 (anticipo $78.00)
03/11 OK Tomas reserva "Zorro en flores" hasta el 10/11 (anticipo $63.00)
04/11 X "Serpiente geometrica" esta reservado por Valeria
05/11 OK "Golondrina clasica" tatuado a Ana por Rex ($90)
06/11 OK "Golondrina clasica" tatuado a Luis por Rex ($90)
09/11 OK "Serpiente geometrica" tatuado a Valeria por Rex ($260) - diseno unico, sale del catalogo
09/11 X "Serpiente geometrica" es unico y ya se tatuo
10/11 X "Zorro en flores" esta reservado por Tomas
11/11 ! "Zorro en flores": la reserva de Tomas vencio el 10/11, vuelve a estar disponible
11/11 OK Sara reserva "Zorro en flores" hasta el 18/11 (anticipo $63.00)
12/11 OK "Ballena acuarela" tatuado a Eva por Luna ($180) - diseno unico, sale del catalogo
13/11 OK "Rama de olivo" tatuado a Nico por Luna ($120)

==================== BUSQUEDA: disponibles hasta $150 ====================
F1 Golondrina clasica   tradicional     8 cm  $90  (Rex)
F6 Daga y rosa          tradicional     10 cm  $110  (Rex)
F2 Rama de olivo        fine line       12 cm  $120  (Luna)

==================== ESTADO DEL CATALOGO ====================
F1 Golondrina clasica   repite disponible | tatuado 2 vez/veces
F2 Rama de olivo        repite disponible | tatuado 1 vez/veces
F3 Serpiente geometrica unico  tatuado | tatuado 1 vez/veces
F4 Zorro en flores      unico  reservado por Sara hasta 18/11 | tatuado 0 vez/veces
F5 Ballena acuarela     unico  tatuado | tatuado 1 vez/veces
F6 Daga y rosa          repite disponible | tatuado 0 vez/veces

==================== REPORTES ====================
Ingresos por artista: Rex $440, Luna $300
Tatuajes por estilo: tradicional 2, fine line 1, blackwork 1, acuarela 1
```
