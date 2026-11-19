# Intermedio 57: Panel DOM de sensores moto

**Tematica:** motos y mecanica de motos
**Alumna:** Dulce Morales

## Problema

Un panel muestra en vivo los sensores de una moto: rpm, temperatura, velocidad y bateria.

- Las lecturas llegan de forma **asincrona**.
- En cada lectura se actualizan los *widgets* del panel. Si un valor cruza un limite, se dispara una **alarma**.
- Si el sensor se desconecta a mitad de camino, el panel lo detecta con un **error tipado**, reconecta y sigue.

## Sobre el DOM

Estos ejercicios se ejecutan con Node (`npm run dev`), donde no hay navegador ni `document`. Por eso simule el DOM con la clase `ElementoVirtual`, que se usa igual que el real:

- `appendChild`, `querySelector("#id")`, `textContent`;
- `classList.add`, `remove`, `toggle` y `contains`;
- `outerHTML`.

El panel se arma y se actualiza exactamente como se haria con `document.createElement`. Al final se imprime el HTML que se generaria. Para llevarlo a un navegador basta con cambiar `ElementoVirtual` por elementos reales.

## Que hice

### Async: generador asincrono

`busDeSensores()` es un `async function*` que entrega una lectura por "tick" (con `await esperar`). El panel la consume con `for await ... of`. Simula una caida de conexion lanzando `ErrorSensorDesconectado`.

### Error tipado y reconexion

`escuchar()` envuelve la lectura en `try/catch`. Si el error es `ErrorSensorDesconectado`, espera, emite el evento `reconexion` y sigue desde el siguiente segundo. Cualquier otro error se vuelve a lanzar.

### Eventos tipados

`Emisor<E>` **generico**, con `EventosPanel`:

- `alarma` lleva el sensor, el nivel (`Exclude<Nivel, "normal">`, asi una alarma nunca puede ser "normal"), el valor y el segundo;
- `reconexion` lleva el segundo.

### Reglas

| Sensor | Alerta | Peligro |
|---|---|---|
| rpm | 11,000 o mas | 13,000 o mas |
| temperatura | 105 C o mas | 115 C o mas |
| velocidad | 160 km/h o mas | 200 km/h o mas |
| bateria (al reves: lo malo es que baje) | 12.0 V o menos | 11.5 V o menos |

- Cada widget recibe la clase CSS `alerta` o `peligro` segun su nivel.
- La alarma se emite solo cuando el nivel **cambia**, no en cada lectura.

### Casos probados

- **Limite rpm:** en el segundo 3 marca **exactamente** 11,000 y entra en alerta.
- **Limite bateria:** en el segundo 7 marca **exactamente** 12.0 V y entra en alerta (la bateria funciona al reves).
- **Desconexion:** se pierde la lectura del segundo 6; el panel reconecta y sigue en el 7.
- **Peligro:** rpm y velocidad en el segundo 5, temperatura en el 7 y bateria en el 8.
- **HTML final:** cada widget queda con su clase de alerta o peligro.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/57-sensor-moto-dom/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
========================= PANEL EN VIVO =========================
s1 |   rpm 4200 rpm        |   temperatura 88 C    |   velocidad 45 km/h   |   bateria 13.8 V
s2 |   rpm 7800 rpm        |   temperatura 93 C    |   velocidad 98 km/h   |   bateria 13.7 V
s3 | ! rpm 11000 rpm       |   temperatura 99 C    |   velocidad 152 km/h  |   bateria 13.6 V
s4 | ! rpm 12400 rpm       | ! temperatura 106 C   | ! velocidad 181 km/h  |   bateria 13.5 V
s5 | !!rpm 13300 rpm       | ! temperatura 112 C   | !!velocidad 204 km/h  |   bateria 13.4 V
   X [ErrorSensorDesconectado] se perdio la conexion con el bus de sensores en el segundo 6
   ... reconectado; se perdio la lectura del segundo 6
s7 |   rpm 9000 rpm        | !!temperatura 116 C   |   velocidad 140 km/h  | ! bateria 12 V
s8 |   rpm 6000 rpm        | ! temperatura 109 C   |   velocidad 90 km/h   | !!bateria 11.4 V

========================= ALARMAS =========================
s3 ALERTA en rpm: 11000 rpm
s4 ALERTA en temperatura: 106 C
s4 ALERTA en velocidad: 181 km/h
s5 PELIGRO en rpm: 13300 rpm
s5 PELIGRO en velocidad: 204 km/h
s7 PELIGRO en temperatura: 116 C
s7 ALERTA en bateria: 12 V
s8 ALERTA en temperatura: 109 C
s8 PELIGRO en bateria: 11.4 V

========================= HTML FINAL DEL PANEL =========================
<section id="panel">
  <div id="widget-rpm" class="widget"><span id="valor-rpm">6000 rpm</span></div>
  <div id="widget-temperatura" class="widget alerta"><span id="valor-temperatura">109 C</span></div>
  <div id="widget-velocidad" class="widget"><span id="valor-velocidad">90 km/h</span></div>
  <div id="widget-bateria" class="widget peligro"><span id="valor-bateria">11.4 V</span></div>
</section>
```
