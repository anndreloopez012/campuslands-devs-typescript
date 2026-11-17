# Intermedio 54: Chat de equipo MOBA

**Tematica:** videojuegos MOBA
**Alumna:** Dulce Morales

## Problema

El chat de equipo de un MOBA manda mensajes a traves de un servidor (simulado, con demora). Hay cuatro tipos de mensaje: **texto**, **ping** en el mapa, **alerta** de enemigo y **comandos** (`/mute`, `/unmute`). El servidor modera:

- censura palabras prohibidas;
- silencia a quien hace spam (3 mensajes en 2 segundos);
- respeta a quien silencio a otro jugador;
- guarda los mensajes de los desconectados y se los entrega cuando vuelven.

## Que hice

### Tipos

- `type Contenido`: union discriminada por `tipo`, con 4 variantes y sus propios datos (texto, coordenadas e intencion, linea y enemigo, nombre del comando).
- `mostrar(contenido)` usa un `switch` que cubre las 4 variantes.

### Errores tipados

- `ErrorSilenciado` (jugador y hasta que segundo);
- `ErrorMensajeInvalido` (vacio, muy largo o ping fuera del mapa);
- `ErrorRemitente` (alguien que no es del equipo).

En `main`, el `catch (e: unknown)` revisa con `instanceof` y vuelve a lanzar cualquier error que no sea de estos tipos.

### Eventos tipados

`Emisor<E>` es **generico**, con la interfaz `EventosChat`: `entregado`, `censurado` y `silenciado`. Lo que ve cada jugador se arma escuchando `entregado`.

### Servidor (`ServidorChat`)

- `enviar(mensaje)` es `async`:
  - simula la latencia con `await`;
  - valida y aplica los comandos;
  - controla el spam y censura;
  - reparte el mensaje: a los conectados al instante, a los desconectados los deja en cola.
- `reconectar(jugador)` es `async` y entrega los mensajes guardados.
- Estado **privado** en `Set` y `Map`: conectados, pendientes por jugador, historial para el spam, silencios y lista de ignorados de cada jugador.

### Reglas

- **Palabras prohibidas** (un `Set`): se reemplazan por `*`.
- **Spam:** 3 mensajes en menos de 2 segundos silencian 10 segundos. El mensaje que completa los 3 ya se rechaza.
- **`/mute X`:** quien lo usa deja de recibir mensajes de X.
- **Texto:** de 1 a 80 caracteres. **Ping:** dentro del mapa de 0 a 100.

### Casos probados

- **Censura:** "que noob ese tirador" llega como "que **** ese tirador".
- **Spam:** Rex manda 3 mensajes entre los segundos 63 y 64, asi que queda silenciado hasta el 74. "YAAA" y "perdon" se rechazan.
- **Limite:** en el segundo **74 exacto**, cuando termina el silencio, Rex ya puede escribir.
- **Mute:** Mia silencio a Rex, asi que no ve ninguno de sus mensajes.
- **Desconectado:** Zed vuelve al final y recibe todo lo que se perdio.
- **Invalidos:** un mensaje vacio, un ping fuera del mapa y un remitente que no es del equipo.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/54-chat-equipo-moba/index.ts
```

## Salida esperada

```text
==================== ENVIOS ====================
s60 Kai  [PING ATACAR en (50, 50)]                  -> entregado a 4
s61 Lyra [ALERTA: Vex no esta en mid]               -> entregado a 4
s62 Mia  /mute Rex                                  -> aplicado
   ! 1 palabra(s) censurada(s) a Rex
s63 Rex  "que noob ese tirador"                     -> entregado a 3
s64 Rex  "vamos dragon"                             -> entregado a 3
   ! Rex silenciado por spam hasta el segundo 74
s64 Rex  "YA"                                       -> X [ErrorSilenciado] Rex esta silenciado hasta el segundo 74
s65 Rex  "YAAA"                                     -> X [ErrorSilenciado] Rex esta silenciado hasta el segundo 74
s70 Rex  "perdon"                                   -> X [ErrorSilenciado] Rex esta silenciado hasta el segundo 74
s75 Kai  ""                                         -> X [ErrorMensajeInvalido] mensaje vacio
s76 Lyra [PING CUIDADO en (130, 20)]                -> X [ErrorMensajeInvalido] ping fuera del mapa (130, 20)
s77 Bot  "hola"                                     -> X [ErrorRemitente] Bot no esta en el equipo
s74 Rex  "limite: justo cuando termina el silencio" -> entregado a 3
s80 Lyra "Zed vuelve pronto?"                       -> entregado a 4

==================== LO QUE VIO CADA JUGADOR ====================
Kai:
   Lyra: [ALERTA: Vex no esta en mid]
   Rex: "que **** ese tirador"
   Rex: "vamos dragon"
   Rex: "limite: justo cuando termina el silencio"
   Lyra: "Zed vuelve pronto?"
Lyra:
   Kai: [PING ATACAR en (50, 50)]
   Rex: "que **** ese tirador"
   Rex: "vamos dragon"
   Rex: "limite: justo cuando termina el silencio"
Rex:
   Kai: [PING ATACAR en (50, 50)]
   Lyra: [ALERTA: Vex no esta en mid]
   Lyra: "Zed vuelve pronto?"
Mia:
   Kai: [PING ATACAR en (50, 50)]
   Lyra: [ALERTA: Vex no esta en mid]
   Lyra: "Zed vuelve pronto?"
Zed:
   (al volver) Kai: [PING ATACAR en (50, 50)]
   (al volver) Lyra: [ALERTA: Vex no esta en mid]
   (al volver) Rex: "que **** ese tirador"
   (al volver) Rex: "vamos dragon"
   (al volver) Rex: "limite: justo cuando termina el silencio"
   (al volver) Lyra: "Zed vuelve pronto?"
```
