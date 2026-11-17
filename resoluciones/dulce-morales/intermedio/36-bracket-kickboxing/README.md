# Intermedio 36: Bracket de kickboxing

**Tematica:** kickboxing
**Alumna:** Dulce Morales

## Problema

Armar y simular la llave de eliminacion directa de un torneo de kickboxing:

1. **Pesaje:** quien pasa el limite de su categoria (o esta inscrito en otra) queda fuera.
2. **Siembra:** los que pasan se ordenan por ranking (cabezas de serie). Si no son una potencia de 2, los mejores pasan directo a la siguiente ronda (*bye*).
3. **Peleas:** cada pelea se decide segun la diferencia de nivel, con un generador con semilla para que el resultado sea repetible.

## Que hice

### Clase `Torneo`

- **`pesaje()`:** separa aptos y descalificados. El limite **exacto** se acepta.
- **`armarLlave()`:** calcula el tamano de la llave (la siguiente potencia de 2) y ubica a cada peleador con un metodo **privado** `ordenDeSiembra`.
- **`simular()`:** juega ronda por ronda (cuartos, semifinal, final) y guarda cada combate en un historial **privado**.
- **`pelear()`** (privado): decide ganador, metodo (KO, TKO o decision) y round.

### Tipos y type guards

- Literal types: `Categoria` y `Metodo`.
- **`type Cupo<T>`:** tipo **generico**. Un cupo de la llave es un peleador o un `bye`.
- **Type guard generico** `esPeleador<T>`: distingue un peleador de un bye sin casteos.
- `Record<Categoria, number>`: el limite de peso de cada categoria.

### Reglas

- **Orden de siembra estandar:** para 8 cupos es `[1, 8, 4, 5, 2, 7, 3, 6]`. Asi el 1 y el 2 quedan en mitades distintas y solo pueden cruzarse en la **final**. Las siembras sin peleador (7 y 8) son byes.
- **Probabilidad de ganar:** 1 / (1 + 10^((nivel rival - nivel propio) / 20)). Mas nivel, mas probable, pero hay sorpresas.
- **Metodo:** 25% KO, 20% TKO y 55% decision. Una decision siempre llega al round 3.

### Casos probados

- **Limite de peso:** Lia Moreno pesa **exactamente** 63.5 kg (el limite) y pasa.
- **Descalificadas:** Rita Gomez (64 kg) y Ivy Chen (inscrita en pluma).
- **Byes:** con 6 aptas, las cabezas de serie #1 y #2 pasan directo a semifinales.
- **Sorpresas:** el programa marca cuando gana la peleadora de peor ranking.
- **Final:** #1 contra #2, como se espera en una llave bien sembrada.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/36-bracket-kickboxing/index.ts
```

## Salida esperada

```text
============ Copa Andina de Kickboxing - categoria ligero (hasta 63.5 kg) ============
Pesaje: 6 aptos
  X Rita Gomez: pesa 64 kg (limite 63.5 kg)
  X Ivy Chen: inscrito en pluma, no en ligero

Llave de 8 cupos (2 bye):
  #1 Camila Torres   vs BYE
  #4 Eva Kraus       vs #5 Sol Pena
  #2 Nadia Brooks    vs BYE
  #3 Lia Moreno      vs #6 Ana Ruiz

============ COMBATES ============
Cuartos:
  Camila Torres pasa directo (bye)
  Eva Kraus      vs Sol Pena       -> gana Sol Pena por KO (round 2)  << sorpresa
  Nadia Brooks pasa directo (bye)
  Lia Moreno     vs Ana Ruiz       -> gana Ana Ruiz por decision (round 3)  << sorpresa
Semifinal:
  Camila Torres  vs Sol Pena       -> gana Camila Torres por decision (round 3)
  Nadia Brooks   vs Ana Ruiz       -> gana Nadia Brooks por TKO (round 3)
Final:
  Camila Torres  vs Nadia Brooks   -> gana Camila Torres por decision (round 3)

CAMPEONA: Camila Torres
Definiciones: KO 1, decision 3, TKO 1
```
