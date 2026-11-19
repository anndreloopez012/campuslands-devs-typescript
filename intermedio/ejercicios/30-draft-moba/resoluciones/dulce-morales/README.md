# Intermedio 30: Draft inteligente MOBA

**Tematica:** videojuegos MOBA
**Alumna:** Dulce Morales

## Problema

Antes de una partida, dos equipos se turnan para **bloquear** (*ban*) y **elegir** (*pick*) heroes:

- el equipo **Azul** usa un asistente que recomienda cada pick;
- el equipo **Rojo** elige a mano, y el programa valida cada accion. Si un intento no es valido, explica por que y pasa al siguiente.

## Que hice

### Modelo

- Union types: `Rol`, `Equipo` y `Accion`.
- `interface Heroe`, `Paso` (que equipo y que accion toca) y `Recomendacion` (heroe, puntaje y razones).
- `interface Estado`: los heroes bloqueados y los picks de cada equipo.

### Uso de `Record`, `Map` y `Set`

- **`Map<string, Set<string>>`:** a que heroes contrarresta cada heroe.
- **`Set`:**
  - heroes bloqueados;
  - todos los heroes ya tomados (bloqueados o elegidos);
  - roles que ya tiene un equipo.
- **`Record<Equipo, Heroe[]>`:** los picks de cada equipo.
- **`Record`:** la tabla de puntos del recomendador.
- **`reduce`:** el winrate promedio de cada equipo.

### Reglas del draft

- **Orden:** 2 bans por equipo y luego picks alternados 1-2-2-2-2-1 (14 pasos).
- **Validacion:**
  - el heroe debe existir;
  - no puede estar bloqueado ni elegido;
  - cada equipo lleva **un heroe por rol**.

### Como recomienda el asistente

Para cada heroe libre de un rol que al equipo le falta:

| Criterio | Puntos |
|---|---|
| Winrate del heroe | su % |
| Rol que le falta al equipo | +10 |
| Contrarresta a un heroe enemigo ya elegido | +6 por cada uno |
| Combina con un aliado ya elegido | +4 por cada uno |

Gana el de mayor puntaje; en empate, por nombre. Tambien se muestra la segunda mejor opcion. Si no queda ningun heroe libre para los roles que faltan, lo avisa en vez de elegir mal.

### Casos probados

- **Contrarresta:** cuando Rojo elige a Quill, el asistente recomienda a Mira con +6 porque la contrarresta.
- **Errores del Rojo:**
  - intenta un heroe bloqueado (Vesper);
  - intenta un segundo tanque (Bastion);
  - intenta heroes que Azul ya eligio.
- **Draft completo:** ambos equipos terminan con un heroe de cada rol.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/30-draft-moba/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
========================= DRAFT =========================
 1. Azul ban  Zarek
 2. Rojo ban  Nyx
 3. Azul ban  Vex
 4. Rojo ban  Vesper
 5. Azul pick Lyra     [mago] puntaje 62: winrate 52% | alternativa: Ryn (62)
 6. Rojo pick X Vesper ya fue bloqueado o elegido, se pide otro
 6. Rojo pick Gorrak [tanque]
 7. Rojo pick X Rojo ya tiene un tanque, se pide otro
 7. Rojo pick Quill [tirador]
 8. Azul pick Mira     [soporte] puntaje 67: winrate 51%; contrarresta a Quill | alternativa: Ryn (62)
 9. Azul pick Ryn      [tirador] puntaje 62: winrate 52% | alternativa: Kael (60)
10. Rojo pick X Lyra ya fue bloqueado o elegido, se pide otro
10. Rojo pick Kael [jungla]
11. Rojo pick Elara [soporte]
12. Azul pick Bastion  [tanque] puntaje 59: winrate 49% | alternativa: Thorn (59)
13. Azul pick Thorn    [jungla] puntaje 59: winrate 49%
14. Rojo pick Orin [mago]

========================= RESULTADO =========================
Azul: Lyra (mago), Mira (soporte), Ryn (tirador), Bastion (tanque), Thorn (jungla) | winrate promedio 50.6%
Rojo: Gorrak (tanque), Quill (tirador), Kael (jungla), Elara (soporte), Orin (mago) | winrate promedio 49.8%
Bloqueados: Zarek, Nyx, Vex, Vesper
```
