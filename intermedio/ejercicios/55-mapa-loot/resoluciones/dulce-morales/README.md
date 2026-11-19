# Intermedio 55: Mapa de loot battle royale

**Tematica:** videojuegos battle royale
**Alumna:** Dulce Morales

## Problema

Antes de saltar del avion, una app descarga del servidor (simulado) la informacion de cada zona del mapa: que loot hay y cuantos jugadores suelen caer ahi.

- Las zonas se piden **en paralelo**.
- Algunas tardan demasiado y se cortan por **tiempo limite**.
- Otras llegan con **datos rotos**.

Con lo que si llega, la app recomienda donde caer segun el valor del loot y el riesgo.

## Que hice

### Async y datos remotos simulados

- `pedirZona(nombre)` es `async`: espera la demora de esa zona y devuelve un cuerpo `unknown`, como un JSON real.
- `conTiempoLimite<T>(promesa, zona, ms)`: funcion **generica**. Usa `Promise.race` entre la respuesta y un temporizador; el que llegue primero gana. Si gana el temporizador, se lanza `ErrorTiempoLimite`. Con `finally` se limpia el temporizador.
- `cargarMapa()`: pide todas las zonas con `Promise.allSettled`, asi una zona que falla no cancela a las demas, y separa las cargadas de las fallidas.

### Validacion de datos (type guards)

- `esLoot(x)` revisa cada objeto con `in` y `typeof`, sin casteos.
- `validarZona()` convierte el `unknown` en una `Zona` tipada, o lanza `ErrorDatosZona` diciendo que campo vino mal.

### Errores y eventos tipados

- `ErrorTiempoLimite` (zona y milisegundos) y `ErrorDatosZona` (zona y detalle).
- `Emisor<E>` **generico**, con los eventos `cargada` y `fallida` (el evento `fallida` lleva el error con su tipo).

### Recomendacion

- **Valor del loot:** comun 1, raro 4, epico 10, legendario 25 (un `Record<Rareza, number>`), multiplicado por la cantidad.
- **Puntaje:** valor / (jugadores esperados + 1). Mucho loot con poca gente es lo mejor.

### Casos probados

- **Tiempo limite:** la Base militar tarda 150 ms y el limite es 110 ms, asi que se corta.
- **Limite:** la Aldea tarda 100 ms, llega **10 ms antes** del corte y se usa. Termina siendo la recomendada.
- **Datos rotos:** el Pantano trae `jugadoresEsperados: "muchos"` (texto en vez de numero), asi que se descarta.
- **Recomendacion:** el Puerto tiene mas loot, pero tambien mucha gente. La Aldea gana por menor riesgo.
- **Repetible:** corri el programa 3 veces y la salida fue identica.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/55-mapa-loot/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================ CARGANDO EL MAPA (tiempo limite 110 ms por zona) ================
OK Puerto
OK Granja
OK Torre
OK Aldea
X  Base militar: [ErrorTiempoLimite] Base militar: no respondio en 110 ms
X  Pantano: [ErrorDatosZona] Pantano: jugadoresEsperados no es un numero

================ DONDE CAER ================
1. Aldea    puntaje     8 | loot  32 | ~3 jugadores | 1.6 km | Escudo (epico), Subfusil (raro)
2. Puerto   puntaje   7.4 | loot  74 | ~9 jugadores | 0.4 km | Rifle (epico), Botiquin (raro)
3. Torre    puntaje     7 | loot  35 | ~4 jugadores | 0.9 km | Francotirador (legendario), Mira 8x (epico)
4. Granja   puntaje     6 | loot  18 | ~2 jugadores | 1.2 km | Escopeta (raro), Vendas (comun)

Recomendacion: caer en Aldea.
Zonas cargadas: 4 de 6
```
