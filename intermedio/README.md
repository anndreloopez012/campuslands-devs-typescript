# Nivel intermedio - TypeScript

Este nivel contiene 80 ejercicios progresivos para estudiantes que ya dominan la base de TypeScript y necesitan practicar problemas mas cercanos a proyectos reales.

## Progresion del nivel

- 01-20: interfaces, aliases, arrays tipados, filtros, rankings y validaciones.
- 21-40: reglas de negocio, union types, Record, Map, Set, clases y generics.
- 41-60: fechas, estados, reportes, async/await y errores tipados.
- 61-80: reducers, state machines, persistencia simulada y mini sistemas integradores.

## Regla de entrega

Cada estudiante debe entregar dentro de la carpeta `resoluciones/nombre-apellido/` del ejercicio correspondiente.

```text
intermedio/ejercicios/01-dashboard-kd-shooter/resoluciones/nombre-apellido/index.ts
```

No modifiques archivos base del ejercicio. El Pull Request debe ir hacia `dev`.

## Lista de ejercicios

| # | Ejercicio | Tematica | Enfoque |
| --- | --- | --- | --- |
| 01 | [Dashboard K/D de squad shooter](./ejercicios/01-dashboard-kd-shooter) | videojuegos shooters | interfaces, arrays tipados, funciones puras y rankings |
| 02 | [Inventario tactico battle royale](./ejercicios/02-inventario-armas-battle-royale) | videojuegos battle royale | interfaces, arrays tipados, funciones puras y rankings |
| 03 | [Builder de personaje RPG](./ejercicios/03-build-personaje-rpg) | videojuegos RPG | interfaces, arrays tipados, funciones puras y rankings |
| 04 | [Rotacion de heroes MOBA](./ejercicios/04-rotacion-moba) | videojuegos MOBA | interfaces, arrays tipados, funciones puras y rankings |
| 05 | [Ranking de jugadores de futbol](./ejercicios/05-ranking-futbol-pro) | futbol | interfaces, arrays tipados, funciones puras y rankings |
| 06 | [Telemetria de motos deportivas](./ejercicios/06-telemetria-motos) | motos y mecanica de motos | interfaces, arrays tipados, funciones puras y rankings |
| 07 | [Ordenes de taller de motos](./ejercicios/07-orden-taller-motos) | motos y mecanica de motos | interfaces, arrays tipados, funciones puras y rankings |
| 08 | [Catalogo de hiperdeportivos](./ejercicios/08-catalogo-hiperdeportivos) | autos, autos de lujo y vehiculos hiperdeportivos | interfaces, arrays tipados, funciones puras y rankings |
| 09 | [Calendario de torneo futsal](./ejercicios/09-calendario-torneo-futsal) | futbol sala | interfaces, arrays tipados, funciones puras y rankings |
| 10 | [Marcador de kickboxing](./ejercicios/10-marcador-kickboxing) | kickboxing | interfaces, arrays tipados, funciones puras y rankings |
| 11 | [Simulador de carrera por vueltas](./ejercicios/11-circuito-carreras) | carreras | objetos anidados, filtros, reduce y validaciones |
| 12 | [Liga de pingpong](./ejercicios/12-liga-pingpong) | pingpong | objetos anidados, filtros, reduce y validaciones |
| 13 | [Curador de playlist](./ejercicios/13-playlist-dj) | musica | objetos anidados, filtros, reduce y validaciones |
| 14 | [Catalogo de peliculas de miedo](./ejercicios/14-catalogo-terror) | peliculas | objetos anidados, filtros, reduce y validaciones |
| 15 | [Analizador de sagas sci-fi](./ejercicios/15-sagas-ciencia-ficcion) | ciencia ficcion | objetos anidados, filtros, reduce y validaciones |
| 16 | [Biblioteca tech](./ejercicios/16-biblioteca-tech) | libros | objetos anidados, filtros, reduce y validaciones |
| 17 | [Pedidos de food truck](./ejercicios/17-pedidos-foodtruck) | comida | objetos anidados, filtros, reduce y validaciones |
| 18 | [Drop de ropa streetwear](./ejercicios/18-drop-ropa-streetwear) | ropa | objetos anidados, filtros, reduce y validaciones |
| 19 | [Itinerario de viaje](./ejercicios/19-itinerario-viaje) | viajes | objetos anidados, filtros, reduce y validaciones |
| 20 | [Comparador de turismo](./ejercicios/20-paquetes-turisticos) | turismo | objetos anidados, filtros, reduce y validaciones |
| 21 | [Bitacora de paracaidismo](./ejercicios/21-saltos-paracaidismo) | paracaidismo | union types, Record, Map, Set y reglas de negocio |
| 22 | [Agenda de tatuajes](./ejercicios/22-agenda-tatuajes) | tatuajes | union types, Record, Map, Set y reglas de negocio |
| 23 | [Comisiones de dibujo](./ejercicios/23-comisiones-dibujo) | videojuegos RPG | union types, Record, Map, Set y reglas de negocio |
| 24 | [Pipeline de animacion 3D](./ejercicios/24-pipeline-animacion-3d) | animacion 3D | union types, Record, Map, Set y reglas de negocio |
| 25 | [Revision de renders arquitectura](./ejercicios/25-arquitectura-3d) | diseno 3D arquitectura | union types, Record, Map, Set y reglas de negocio |
| 26 | [Control de soldadura](./ejercicios/26-orden-soldadura) | soldadura | union types, Record, Map, Set y reglas de negocio |
| 27 | [Validador de formulas quimicas](./ejercicios/27-formulas-quimicas) | formulas quimicas | union types, Record, Map, Set y reglas de negocio |
| 28 | [Mercado de skins](./ejercicios/28-mercado-skins) | videojuegos shooters | union types, Record, Map, Set y reglas de negocio |
| 29 | [Sistema de loot RPG](./ejercicios/29-loot-rpg) | videojuegos battle royale | union types, Record, Map, Set y reglas de negocio |
| 30 | [Draft inteligente MOBA](./ejercicios/30-draft-moba) | videojuegos MOBA | union types, Record, Map, Set y reglas de negocio |
| 31 | [Simulador de zona battle royale](./ejercicios/31-zona-battle-royale) | videojuegos battle royale | clases basicas, generics, scoring y simulaciones |
| 32 | [Temporada modo carrera](./ejercicios/32-temporada-futbol) | futbol | clases basicas, generics, scoring y simulaciones |
| 33 | [Plan de mantenimiento moto](./ejercicios/33-mantenimiento-moto) | motos y mecanica de motos | clases basicas, generics, scoring y simulaciones |
| 34 | [Subasta de autos de lujo](./ejercicios/34-subasta-autos-lujo) | autos, autos de lujo y vehiculos hiperdeportivos | clases basicas, generics, scoring y simulaciones |
| 35 | [Estrategia de pit stop](./ejercicios/35-pitstop-carreras) | carreras | clases basicas, generics, scoring y simulaciones |
| 36 | [Bracket de kickboxing](./ejercicios/36-bracket-kickboxing) | kickboxing | clases basicas, generics, scoring y simulaciones |
| 37 | [Ranking ELO pingpong](./ejercicios/37-ranking-pingpong-elo) | pingpong | clases basicas, generics, scoring y simulaciones |
| 38 | [Setlist de concierto](./ejercicios/38-setlist-concierto) | musica | clases basicas, generics, scoring y simulaciones |
| 39 | [Recomendador de streaming](./ejercicios/39-streaming-peliculas) | peliculas | clases basicas, generics, scoring y simulaciones |
| 40 | [Club de lectura](./ejercicios/40-club-lectura) | libros | clases basicas, generics, scoring y simulaciones |
| 41 | [Reservas de restaurante](./ejercicios/41-reservas-restaurante) | comida | fechas, estados, reportes y agrupacion de datos |
| 42 | [Outfit segun clima](./ejercicios/42-outfit-clima) | ropa | fechas, estados, reportes y agrupacion de datos |
| 43 | [Presupuesto backpacking](./ejercicios/43-presupuesto-backpacking) | viajes | fechas, estados, reportes y agrupacion de datos |
| 44 | [Rutas turisticas inteligentes](./ejercicios/44-rutas-turisticas) | turismo | fechas, estados, reportes y agrupacion de datos |
| 45 | [Log avanzado de saltos](./ejercicios/45-log-saltos) | paracaidismo | fechas, estados, reportes y agrupacion de datos |
| 46 | [Catalogo de estilos tattoo](./ejercicios/46-catalogo-tatuajes) | tatuajes | fechas, estados, reportes y agrupacion de datos |
| 47 | [Portafolio de dibujo](./ejercicios/47-portafolio-dibujo) | dibujo | fechas, estados, reportes y agrupacion de datos |
| 48 | [Render farm 3D](./ejercicios/48-render-farm) | animacion 3D | fechas, estados, reportes y agrupacion de datos |
| 49 | [Control de planos 3D](./ejercicios/49-planos-arquitectura) | diseno 3D arquitectura | fechas, estados, reportes y agrupacion de datos |
| 50 | [Inspeccion visual soldadura](./ejercicios/50-inspeccion-soldadura) | soldadura | fechas, estados, reportes y agrupacion de datos |
| 51 | [Balance quimico simple](./ejercicios/51-balance-quimico-simple) | formulas quimicas | async/await, errores, eventos tipados y datos remotos simulados |
| 52 | [Cliente API fake shooter](./ejercicios/52-api-fake-shooter) | videojuegos shooters | async/await, errores, eventos tipados y datos remotos simulados |
| 53 | [Gestor de misiones RPG](./ejercicios/53-misiones-rpg) | videojuegos RPG | async/await, errores, eventos tipados y datos remotos simulados |
| 54 | [Chat de equipo MOBA](./ejercicios/54-chat-equipo-moba) | videojuegos MOBA | async/await, errores, eventos tipados y datos remotos simulados |
| 55 | [Mapa de loot battle royale](./ejercicios/55-mapa-loot) | videojuegos battle royale | async/await, errores, eventos tipados y datos remotos simulados |
| 56 | [Mercado de fichajes futbol](./ejercicios/56-mercado-fichajes) | futbol | async/await, errores, eventos tipados y datos remotos simulados |
| 57 | [Panel DOM de sensores moto](./ejercicios/57-sensor-moto-dom) | motos y mecanica de motos | async/await, errores, eventos tipados y datos remotos simulados |
| 58 | [Mini CRM de taller](./ejercicios/58-crm-taller) | motos y mecanica de motos | async/await, errores, eventos tipados y datos remotos simulados |
| 59 | [Comparador de autos premium](./ejercicios/59-comparador-autos) | autos, autos de lujo y vehiculos hiperdeportivos | async/await, errores, eventos tipados y datos remotos simulados |
| 60 | [Garaje de lujo](./ejercicios/60-garaje-lujo) | autos, autos de lujo y vehiculos hiperdeportivos | async/await, errores, eventos tipados y datos remotos simulados |
| 61 | [Simulador de aceleracion hypercar](./ejercicios/61-simulador-hipercar) | autos, autos de lujo y vehiculos hiperdeportivos | reducers, state machines, unions discriminadas y reglas de interfaz |
| 62 | [Dashboard multi-deporte](./ejercicios/62-estadisticas-deportes) | deportes | reducers, state machines, unions discriminadas y reglas de interfaz |
| 63 | [Torneo futbol asincrono](./ejercicios/63-torneo-futbol-api) | futbol | reducers, state machines, unions discriminadas y reglas de interfaz |
| 64 | [Tabla futsal interactiva](./ejercicios/64-posiciones-futsal-dom) | futbol sala | reducers, state machines, unions discriminadas y reglas de interfaz |
| 65 | [Timer de rounds kickboxing](./ejercicios/65-timer-kickboxing) | kickboxing | reducers, state machines, unions discriminadas y reglas de interfaz |
| 66 | [Cronometro de vueltas](./ejercicios/66-cronometro-carreras) | carreras | reducers, state machines, unions discriminadas y reglas de interfaz |
| 67 | [Marcador pingpong DOM](./ejercicios/67-marcador-pingpong-dom) | pingpong | reducers, state machines, unions discriminadas y reglas de interfaz |
| 68 | [Playlist interactiva](./ejercicios/68-reproductor-playlist) | musica | reducers, state machines, unions discriminadas y reglas de interfaz |
| 69 | [Reservas de cine DOM](./ejercicios/69-cine-reservas-dom) | peliculas | reducers, state machines, unions discriminadas y reglas de interfaz |
| 70 | [Terminal sci-fi](./ejercicios/70-sci-fi-terminal) | ciencia ficcion | reducers, state machines, unions discriminadas y reglas de interfaz |
| 71 | [Biblioteca con localStorage](./ejercicios/71-biblioteca-localstorage) | libros | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 72 | [Menu interactivo comida](./ejercicios/72-menu-comida-app) | comida | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 73 | [Tienda de ropa con filtros](./ejercicios/73-tienda-ropa-filtros) | ropa | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 74 | [Planner de viajes DOM](./ejercicios/74-planner-viajes) | viajes | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 75 | [Lista turistica interactiva](./ejercicios/75-turismo-mapa-lista) | turismo | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 76 | [Check-in de salto](./ejercicios/76-paracaidismo-checkin) | paracaidismo | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 77 | [Booking tattoo app](./ejercicios/77-tattoo-booking-app) | tatuajes | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 78 | [Canvas de dibujo basico](./ejercicios/78-canvas-dibujo-basico) | dibujo | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 79 | [Visor de assets 3D](./ejercicios/79-visor-modelos-3d) | pingpong | mini sistemas integradores, persistencia simulada y arquitectura simple |
| 80 | [Cotizador arquitectura 3D](./ejercicios/80-cotizador-arquitectura) | diseno 3D arquitectura | mini sistemas integradores, persistencia simulada y arquitectura simple |
