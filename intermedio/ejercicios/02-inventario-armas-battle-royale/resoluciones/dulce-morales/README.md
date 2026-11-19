# Intermedio 02: Inventario tactico battle royale

**Tematica:** videojuegos battle royale
**Alumna:** Dulce Morales

## Que hice

### Modelo

- Union types: `Rareza`, `TipoMunicion` y `CategoriaArma`.
- Interfaces `Arma`, `Municion` y `Curacion`, cada una con una propiedad `tipo` distinta.
- `type Objeto = Arma | Municion | Curacion`: union discriminada. Con `switch (objeto.tipo)` TypeScript sabe que propiedades tiene cada variante.
- `Inventario` con datos `readonly`.
- `Resultado<T>`: generic para operaciones que pueden fallar (`ok: true` con `valor` u `ok: false` con `error`).
- `BONUS_RAREZA: Record<Rareza, number>`: multiplicador de danio por rareza.

### Reglas de negocio

- Maximo **2 armas** y **5 espacios** por inventario (cada objeto ocupa 1 espacio).
- La municion va de 1 a 60 por espacio.
- Las armas necesitan danio y cadencia mayores que 0.
- **DPS** = danio base x disparos por segundo x bonus de rareza.
- Un arma **sin municion compatible** no suma DPS y se marca con un aviso.
- **Puntaje** = DPS util + curacion total / 2.

### Funciones separadas

- **Validar:** `validarObjeto`.
- **Transformar sin mutar:** `agregarObjeto` y `soltarObjeto` devuelven un inventario **nuevo**. El original no cambia (hay una prueba que lo muestra).
- **Calcular:** `calcularDps`, `municionDisponible`, `curacionTotal`, `resumir` y `ranking` (ordena una copia).
- **Mostrar:** `describirObjeto`, `lootear` y `main`.

### Casos probados

- **Normal (Nova):** recoge 2 armas, su municion y un botiquin. Todo entra.
- **Limite (Kai):** llena los 5 espacios. Se rechaza la 3ra arma y luego el 6to objeto. Su AWP no tiene municion, asi que no suma DPS.
- **Invalidos (Zed):** se rechaza una pistola con danio 0 y 90 balas en un espacio (el limite es 60).

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/02-inventario-armas-battle-royale/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
============ INVENTARIOS BATTLE ROYALE ============

Nova [5/5 espacios, 2/2 armas]
  + SCAR (legendario, 297 DPS)
  + MP5 (raro, 274 DPS)
  + Municion pesada x60
  + Municion ligera x45
  + 1x Botiquin

Kai [5/5 espacios, 2/2 armas]
  + Pump (epico, 90 DPS)
  + AWP (epico, 59 DPS)
  + Municion escopeta x18
  + 5x Vendas
  + 3x Mini escudo
  x Rechazado: ya lleva 2 armas, no puede cargar MP5
  x Rechazado: inventario lleno (5/5)
  ! AWP no tiene municion compatible

Zed [3/5 espacios, 1/2 armas]
  + SCAR (legendario, 297 DPS)
  + Municion pesada x60
  + 3x Mini escudo
  x Rechazado: Pistola rota: danio y cadencia deben ser mayores que 0
  x Rechazado: municion pesada: cantidad 90 fuera de rango (1-60)

--- Prueba de inmutabilidad ---
Nova suelta el botiquin: original 5 objetos, nuevo 4 objetos
Soltar Z9: no tiene un objeto con id Z9

--- Ranking de preparacion (DPS util + curacion/2) ---
1. Nova  | DPS  571 | Curacion 100 | Puntaje 621
2. Zed   | DPS  297 | Curacion  75 | Puntaje 335
3. Kai   | DPS   90 | Curacion 150 | Puntaje 165
```
