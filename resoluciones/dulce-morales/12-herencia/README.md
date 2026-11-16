# Ejercicio 12: Herencia

**Contexto:** Personajes de videojuegos MOBA
**Alumna:** Dulce Morales

## Que hice

- **Clase base `HeroeMOBA`:** tiene todo lo comun (`nombre`, `rol`, `vida`, `vidaMaxima`, `danioBase`) y los metodos `recibirDanio`, `recibirCuracion`, `atacar`, `habilidadEspecial` y `presentarse`. Las propiedades que usan las hijas son `protected`.
- **Clases hijas con `extends`:** cada una llama a `super(...)` para que la clase base guarde las propiedades comunes, asi no se duplican.
  - `Tanque`: tiene `armadura`. Sobrescribe `recibirDanio` para restar la armadura al danio.
  - `Asesino`: tiene `probabilidadCritico`. Sobrescribe `atacar` para hacer el doble de danio.
  - `Soporte` (reto extra): tiene `poderCuracion` y el metodo `curar(aliado)`, que cura a cualquier heroe sin pasar de su vida maxima.
- Cada hija sobrescribe `habilidadEspecial()` con `override`, asi cada heroe muestra una habilidad distinta.
- Todos los metodos tienen sus parametros y su retorno tipados.
- El array `equipo: HeroeMOBA[]` guarda heroes de distintas clases, y cada uno usa su propia version de los metodos.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/12-herencia/index.ts
```

## Salida esperada

```text
============== EQUIPO MOBA ==============
Brakka [Tanque] - Vida 1200/1200
  Ataque:    Brakka hace un ataque basico de 45 de danio.
  Habilidad: Brakka usa MURO DE ACERO: provoca a los enemigos y bloquea 40 de danio por golpe.
Vex [Asesino] - Vida 600/600
  Ataque:    Vex ataca por la espalda: 220 de danio critico.
  Habilidad: Vex usa SOMBRA LETAL: se vuelve invisible con 35% de critico.
Elara [Soporte] - Vida 750/750
  Ataque:    Elara hace un ataque basico de 30 de danio.
  Habilidad: Elara usa LUZ SANADORA: cura 150 de vida a sus aliados.

============== EN COMBATE ===============
Ambos reciben 300 de danio:
  Brakka [Tanque] - Vida 940/1200  (la armadura bloqueo 40)
  Vex [Asesino] - Vida 300/600
Elara cura a Vex: 300 -> 450 de vida.
Elara cura a Brakka: 940 -> 1090 de vida.
```
