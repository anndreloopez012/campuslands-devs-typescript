# Intermedio 10: Marcador de kickboxing

**Tematica:** kickboxing
**Alumna:** Dulce Morales

## Problema

Calcular el resultado de una pelea con el **sistema de 10 puntos**. Tres jueces deciden quien gano cada round. Las caidas y las faltas restan puntos. Si un peleador cae 3 veces en el mismo round, pierde por nocaut tecnico (TKO). Al final se suman las tarjetas y se decide el tipo de victoria.

## Que hice

### Modelo

- `type Esquina = "roja" | "azul"` y `type DecisionJuez = Esquina | "parejo"`.
- `interface Round`. `jueces` es una **tupla de exactamente 3** decisiones, asi TypeScript no deja poner 2 o 4 jueces. `caidas` y `faltas` son `Record<Esquina, number>`.
- `interface Peleador` y `interface Pelea`, todo `readonly`.
- `type ResultadoPelea`: union discriminada con cuatro casos: `TKO`, `decision`, `empate` o `invalida`. Cada caso tiene sus propios datos.

### Reglas de negocio

- **Por round, cada juez:** el ganador recibe 10 y el perdedor 9. Si fue parejo, ambos reciben 10.
- **Cada caida** resta 1 punto al que cayo. **Cada falta** resta 1 punto al que la cometio.
- **TKO:** 3 caidas en un mismo round terminan la pelea. Las tarjetas ya no importan.
- **Tipo de decision:**
  - **Unanime:** los 3 jueces dan el mismo ganador.
  - **Mayoritaria:** 2 jueces dan ganador y el otro ve empate.
  - **Dividida:** 2 jueces para uno y 1 juez para el otro.
  - **Empate:** si los jueces quedan igualados.
- **Validacion:** debe haber rounds, no mas de los programados, numerados en orden y sin caidas ni faltas negativas.

### Funciones separadas

- **Validar:** `esConteoValido`, `validarPelea`.
- **Calcular (puras):** `rival`, `puntuarRound`, `sumarPuntos`, `tarjetaDeJuez`, `ganadorDeTarjeta`, `buscarTko`, `decidir`, `calcularResultado`.
- **Mostrar:** `formatearTarjetas`, `describir` (un `switch` sobre el tipo de resultado) y `main`.
- `round(...)` es un helper que rellena caidas y faltas con 0 para que los datos de prueba sean cortos.

### Casos probados

| Pelea | Caso | Resultado |
|---|---|---|
| 1 | Dominio claro con una caida (10-8) | Decision unanime |
| 2 | Pelea cerrada, los jueces no coinciden | Decision dividida |
| 3 | Limite: sin la falta seria unanime; con la falta, un juez ve 28-28 | Decision mayoritaria |
| 4 | Limite: 3 caidas en el round 2 | TKO |
| 5 | Limite: tarjetas iguales | Empate |
| 6 | Rounds desordenados y caida negativa | Invalida |

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/10-marcador-kickboxing/index.ts
```

## Salida esperada

```text
================= VELADA DE KICKBOXING =================

Pelea 1 - Peso ligero: Camila Torres (roja) vs Nadia Brooks (azul)
  Tarjetas (roja-azul): Juez 1: 29-27 | Juez 2: 30-26 | Juez 3: 29-27
  GANA Camila Torres por decision unanime

Pelea 2 - Peso welter: Diego Saenz (roja) vs Ken Ito (azul)
  Tarjetas (roja-azul): Juez 1: 29-28 | Juez 2: 29-28 | Juez 3: 27-30
  GANA Diego Saenz por decision dividida

Pelea 3 - Peso pluma: Lia Moreno (roja) vs Eva Kraus (azul)
  Tarjetas (roja-azul): Juez 1: 29-27 | Juez 2: 29-27 | Juez 3: 28-28
  GANA Lia Moreno por decision mayoritaria

Pelea 4 - Peso pesado: Bruno Vidal (roja) vs Omar Diallo (azul)
  GANA Omar Diallo por TKO en el round 2 (Bruno Vidal cayo 3 veces en el round)

Pelea 5 - Peso medio: Ana Ruiz (roja) vs Sol Pena (azul)
  Tarjetas (roja-azul): Juez 1: 29-29 | Juez 2: 29-29 | Juez 3: 29-29
  EMPATE

Pelea 6 - Datos con error: X (roja) vs Y (azul)
  X el round en la posicion 1 dice ser el 2
  X round 2: caidas o faltas negativas

Resumen: 3 por decision, 1 TKO, 1 empate, 1 invalida
```
