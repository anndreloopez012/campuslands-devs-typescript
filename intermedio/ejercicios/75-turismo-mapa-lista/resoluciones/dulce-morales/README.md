# Intermedio 75 - Lista turistica interactiva

**Tematica:** turismo
**Alumna:** Dulce Morales

## Problema

Una app turistica con un mapa y una lista de lugares sincronizados. Permite filtrar y ordenar, guardar
favoritos que sobreviven a una recarga de la pagina y armar una ruta a pie que pase por los favoritos.

## Que hice

- **`ConsultaDTO`**: lo que la vista manda al servicio (posicion, hora, radio, categorias, solo
  abiertos y orden).
- **`FilaDTO`**: lo que regresa el servicio, con la distancia ya calculada y la marca de favorito.
- **`RepoLugares`**: un repositorio en memoria con los lugares del centro de Guanajuato (coordenadas
  aproximadas).
- **`Favoritos`**: guarda los ids en un storage simulado con la misma forma que `localStorage`.
  Lee el JSON con cuidado: si esta danado, empieza vacio.
- **`AppTurismo`**: el servicio que lista, alterna favoritos y arma la ruta.
- **Distancias**: se calculan con la formula de haversine (en km sobre la esfera terrestre).
- **Ruta**: usa el algoritmo del vecino mas cercano, caminando a 4.5 km/h. Si el lugar mas cercano
  estara cerrado al llegar, prueba con el siguiente. Si ninguno esta abierto, los omite.
- **Mapa**: `dibujarMapa` proyecta las coordenadas a una cuadricula de texto. Los lugares que no pasan
  el filtro aparecen como `o`, igual que un marcador atenuado en un mapa real.

## Reglas

| Regla | Detalle |
|---|---|
| Horario | abierto si `abre <= hora < cierra`; a la hora exacta de cierre ya esta cerrado |
| Radio | inclusivo (`distancia <= radio`) |
| Orden por calificacion | si hay empate, gana el mas cercano |
| Favoritos | alternar dos veces quita y vuelve a poner; un id inexistente se rechaza |
| Ruta | 75 min de visita por lugar; se omiten los que ya estaran cerrados |

## Casos probados

- Lista completa por distancia, radio de 400 m por calificacion y filtro por categorias y abiertos.
- Caso limite: museos a las 17:00 (abiertos) y a las 18:00 (cerrados, porque cierran a las 18).
- Mapa con los lugares dentro y fuera del filtro.
- Favoritos: agregar, quitar, volver a agregar, id inexistente y recarga (nueva instancia que lee el storage).
- Ruta saliendo a las 10:00, que visita los 5 favoritos.
- Ruta saliendo a las 16:30, donde 3 favoritos ya estan cerrados al llegar y se omiten.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/75-turismo-mapa-lista/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text

--- Todo, por distancia, 9:00: 8 lugar(es) ---
    Callejon del Beso        mirador     76 m  4.3  abierto
    Basilica Colegiata       iglesia    169 m  4.7  abierto
    Mercado Hidalgo          mercado    247 m  4.4  abierto
    Monumento al Pipila      mirador    320 m  4.8  abierto
    Alhondiga de Granaditas  museo      398 m  4.7  cerrado
    Jardin de la Union       parque     457 m  4.8  abierto
    Museo de las Momias      museo      960 m  4.2  abierto
    Presa de la Olla         parque    1440 m  4.5  abierto

--- Radio 400 m, por calificacion: 5 lugar(es) ---
    Monumento al Pipila      mirador    320 m  4.8  abierto
    Basilica Colegiata       iglesia    169 m  4.7  abierto
    Alhondiga de Granaditas  museo      398 m  4.7  cerrado
    Mercado Hidalgo          mercado    247 m  4.4  abierto
    Callejon del Beso        mirador     76 m  4.3  abierto

--- Museos y miradores abiertos a las 9:00: 3 lugar(es) ---
    Callejon del Beso        mirador     76 m  4.3  abierto
    Monumento al Pipila      mirador    320 m  4.8  abierto
    Museo de las Momias      museo      960 m  4.2  abierto

--- Museos abiertos a las 17:00: 2 lugar(es) ---
    Alhondiga de Granaditas  museo      398 m  4.7  abierto
    Museo de las Momias      museo      960 m  4.2  abierto

--- Museos abiertos a las 18:00 (limite: cierran a las 18): 0 lugar(es) ---

--- Mapa (filtro: radio 400 m) ---  @ hotel, M museo, V mirador, $ mercado, P parque, + iglesia, o fuera del filtro
  ...........M............................
  .............$..V...+...................
  .................@.......o..............
  ......................V.................
  o.......................................
  ........................................
  ........................................
  ........................................
  .......................................o

--- Favoritos ---
  Monumento al Pipila: agregado a favoritos
  Alhondiga de Granaditas: agregado a favoritos
  Museo de las Momias: agregado a favoritos
  Presa de la Olla: agregado a favoritos
  no existe el lugar "teatro"
  Jardin de la Union: agregado a favoritos
  Jardin de la Union: quitado de favoritos
  Jardin de la Union: agregado a favoritos
  storage: ["pipila","alhondiga","momias","presa","union"]

--- Lista tras recargar (favoritos con *): 4 lugar(es) ---
  * Monumento al Pipila      mirador    320 m  4.8  abierto
  * Jardin de la Union       parque     457 m  4.8  abierto
    Basilica Colegiata       iglesia    169 m  4.7  abierto
  * Alhondiga de Granaditas  museo      398 m  4.7  cerrado

--- Ruta a pie saliendo a las 10:00 (75 min por lugar) ---
  10:04 llegar a Monumento al Pipila (+320 m)
  11:22 llegar a Jardin de la Union (+200 m)
  12:48 llegar a Alhondiga de Granaditas (+819 m)
  14:13 llegar a Museo de las Momias (+763 m)
  15:58 llegar a Presa de la Olla (+2237 m)
  recorrido: 4.34 km

--- Ruta a pie saliendo a las 16:30 (75 min por lugar) ---
  16:34 llegar a Monumento al Pipila (+320 m)
  17:52 llegar a Jardin de la Union (+200 m)
  omitido: Alhondiga de Granaditas (cerrado a las 19:07)
  omitido: Museo de las Momias (cerrado a las 19:07)
  omitido: Presa de la Olla (cerrado a las 19:07)
  recorrido: 0.52 km
```
