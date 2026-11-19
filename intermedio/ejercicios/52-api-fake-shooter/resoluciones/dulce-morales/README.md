# Intermedio 52: Cliente API fake shooter

**Tematica:** videojuegos shooter
**Alumna:** Dulce Morales

## Problema

Una app de estadisticas consume la API de un shooter, aqui simulada en memoria. La API se comporta como una real:

- tarda en responder;
- a veces devuelve **500** (error del servidor);
- limita la cantidad de pedidos a la vez (**429**);
- responde **404** si el jugador no existe.

El cliente:

- reintenta cuando tiene sentido;
- guarda en **cache** lo ya consultado;
- pide datos **en paralelo** con `Promise.all`;
- nunca se cae: cada error llega como un tipo claro.

## Que hice

### Servidor falso (`ServidorFalso`)

- `get(ruta)` es `async`. Simula la demora con `setTimeout` y devuelve `{ status, cuerpo }`.
- El cuerpo es `unknown`, igual que el JSON que llega de una API real: no se confia en su forma.
- El limite permite hasta 4 pedidos dentro de una ventana de 60 ms. Las llamadas 2 y 3 fallan con 500 a proposito.

### Validacion con type guards

`esPerfil`, `esPartida` y `esListaPartidas` revisan que el `unknown` tenga la forma correcta. Usan el operador `in` y `typeof`, sin ningun casteo. Si la forma no coincide, se devuelve el error "datos invalidos".

### Cliente tipado (`ClienteShooter`)

- `pedir<T>(ruta, validar)`: metodo **generico** y **privado**, que hace casi todo el trabajo:
  - primero busca en la cache (un `Map`);
  - 200: valida y guarda en cache;
  - 404: devuelve el error sin reintentar (no tiene sentido);
  - 500 o 429: espera y reintenta, hasta 3 veces. Con 429 espera lo que pide la API.
- Cada reintento queda registrado con su motivo.
- `perfil(id)` y `partidas(id)` son los metodos publicos.

### Tipos de respuesta y errores

- `type Respuesta<T>`: union discriminada (`ok: true` con los datos y si vinieron de cache, u `ok: false` con el error).
- `type ErrorApi`: union discriminada con 4 casos. Cada uno tiene sus datos: el recurso que no existe, cuanto esperar, el codigo, el detalle. Se muestran con un `switch`.

### Casos probados

- **Paralelo:** el perfil y las partidas de cada jugador se piden juntos con `Promise.all`.
- **Error 500 recuperado:** los primeros pedidos de p1 reciben 500 y el reintento funciona.
- **404:** p404 no existe; se informa sin reintentar.
- **Cache:** pedir p1 otra vez no llama al servidor.
- **Limite 429:** en la rafaga de 5 pedidos, algunos reciben 429, esperan y reintentan con exito.
- **Repetible:** corri el programa 5 veces y la salida fue identica.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/52-api-fake-shooter/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
============ PERFIL + PARTIDAS EN PARALELO (Promise.all) ============
NovaStrike nv 87 LATAM | 3 partidas, K/D 2.24, 2 victoria(s)
SilentOwl  nv 120 EU    | 2 partidas, K/D 1.93, 1 victoria(s)
p404: X 404: /jugadores/p404 no existe

============ CACHE ============
p1 otra vez: NovaStrike (desde cache: true)

============ RAFAGA DE PEDIDOS (limite de 4 a la vez) ============
pedido 1: OK
pedido 2: OK
pedido 3: OK (cache)
pedido 4: OK (cache)
pedido 5: OK

============ REINTENTOS DEL CLIENTE (5) ============
- /jugadores/p1: recibio 500, reintento 1
- /jugadores/p1/partidas: recibio 500, reintento 1
- /jugadores/p404: recibio 429, reintento 1
- /jugadores/p404/partidas: recibio 429, reintento 1
- /jugadores/p3/partidas: recibio 429, reintento 1
```
