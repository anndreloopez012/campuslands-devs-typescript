# Intermedio 04: Rotacion de heroes MOBA

**Tematica:** videojuegos MOBA
**Alumna:** Dulce Morales

## Problema

Cada semana el juego regala una rotacion de heroes gratis. El programa elige los heroes con reglas claras y explica por que deja fuera a los demas.

## Que hice

### Modelo

- Union types: `Rol`, `EstadoHeroe` y `MotivoExclusion`.
- `interface Heroe` (todo `readonly`). `ultimaSemanaGratis: number | null`, donde `null` significa que nunca estuvo gratis.
- `interface ConfigRotacion`: semana, cupos y semanas de espera.
- `interface Candidato`, `Exclusion` y `Rotacion` para los resultados.

### Reglas de negocio

1. **Excluir** heroes en mantenimiento, con datos invalidos (winrate o pickrate fuera de 0-100) o que estuvieron gratis hace menos de `semanasDeEspera` semanas.
2. **Prioridad** de cada candidato:
   - `100 - pickrate`: se prefieren heroes poco jugados, para darlos a conocer.
   - Bonus por tiempo sin estar gratis (30 si nunca lo estuvo).
   - Penalizacion de 25 si el winrate es menor a 45% (no conviene regalar un heroe que casi siempre pierde).
3. **Seleccion:**
   - Paso 1: el mejor heroe de cada rol, para cubrir todos los roles. Si hay menos cupos que roles, entran primero los roles cuyo mejor heroe tiene mas prioridad.
   - Paso 2: los cupos que sobran se llenan por prioridad.
4. **Avisos:** roles sin ningun heroe disponible, roles que no alcanzaron cupo y elegibles que quedaron fuera.

### Funciones separadas

- **Validar:** `esPorcentaje`, `validarHeroe`, `motivoExclusion`.
- **Calcular (puras):** `semanasDesdeGratis`, `calcularPrioridad`, `ordenarPorPrioridad` (sobre una copia), `generarRotacion`.
- **Mostrar:** `imprimirRotacion` y `main`.

### Casos probados

- **Normal (8 cupos, espera de 3 semanas):** se cubren los 6 roles y quedan 8 heroes. Kaela estuvo gratis hace **exactamente** 3 semanas: es elegible (el limite es "menos de 3"), pero no alcanza cupo.
- **Limite (4 cupos, espera de 5 semanas):**
  - Hay menos cupos que roles. Asesino se queda sin cupo.
  - Tirador no tiene ningun heroe disponible.
  - Ahora Kaela si queda excluida por estar en espera.
- **Datos invalidos:** Glitchy tiene 140% de winrate y se excluye.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/04-rotacion-moba/index.ts
```

## Salida esperada

```text
========== ROTACION GRATIS (semana 40, 8 cupos) ==========
 1. Bastion  tanque    prioridad 127 | pick  3.1% | win 49.0% | ultima gratis: nunca
 2. Draven   luchador  prioridad 114 | pick  6.0% | win 50.1% | ultima gratis: semana 20
 3. Gorrak   tanque    prioridad 112 | pick  8.5% | win 51.2% | ultima gratis: semana 30
 4. Mira     soporte   prioridad 106 | pick  9.8% | win 51.9% | ultima gratis: semana 32
 5. Lyra     mago      prioridad 101 | pick 18.9% | win 53.5% | ultima gratis: semana 25
 6. Shiro    asesino   prioridad 100 | pick 12.0% | win 47.3% | ultima gratis: semana 34
 7. Orin     mago      prioridad  93 | pick  2.0% | win 43.0% | ultima gratis: semana 10
 8. Vesper   tirador   prioridad  86 | pick 22.0% | win 50.6% | ultima gratis: semana 36
Elegibles sin cupo: Kaela (91)
Excluidos:
  - Nyx      [mantenimiento] deshabilitado por un bug
  - Quill    [en espera] estuvo gratis hace 1 semana(s)
  - Elara    [mantenimiento] deshabilitado por un bug
  - Glitchy  [datos invalidos] winrate/pickrate fuera de 0-100 (140% / 3%)
Todos los roles estan cubiertos.

========== CASO LIMITE (semana 40, 4 cupos) ==========
 1. Bastion  tanque    prioridad 127 | pick  3.1% | win 49.0% | ultima gratis: nunca
 2. Draven   luchador  prioridad 114 | pick  6.0% | win 50.1% | ultima gratis: semana 20
 3. Mira     soporte   prioridad 106 | pick  9.8% | win 51.9% | ultima gratis: semana 32
 4. Lyra     mago      prioridad 101 | pick 18.9% | win 53.5% | ultima gratis: semana 25
Elegibles sin cupo: Gorrak (112), Shiro (100), Orin (93)
Excluidos:
  - Kaela    [en espera] estuvo gratis hace 3 semana(s)
  - Nyx      [mantenimiento] deshabilitado por un bug
  - Vesper   [en espera] estuvo gratis hace 4 semana(s)
  - Quill    [en espera] estuvo gratis hace 1 semana(s)
  - Elara    [mantenimiento] deshabilitado por un bug
  - Glitchy  [datos invalidos] winrate/pickrate fuera de 0-100 (140% / 3%)
AVISO: roles sin heroe disponible: tirador
AVISO: roles que no alcanzaron cupo: asesino
```
