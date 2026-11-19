# Ejercicio 04: Interfaces

**Contexto:** Personajes RPG
**Alumna:** Dulce Morales

## Que hice

- Defini la interfaz `PersonajeRPG` con seis propiedades: `nombre`, `clase`, `nivel`, `vida`, `mana` y `armaEquipada`.
- `armaEquipada?` es opcional: el monje Kael no la tiene y el codigo sigue compilando.
- Cree un array tipado `PersonajeRPG[]` con cuatro personajes. Si a un objeto le falta una propiedad obligatoria, TypeScript marca error.
- La funcion `describirPersonaje` recibe un `PersonajeRPG` y usa `??` para mostrar un texto cuando no hay arma.
- No use clases, solo interfaces y objetos.
- Reto extra: con `filter` obtengo los personajes con nivel mayor o igual a 10, listos para una mision dificil.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/04-interfaces/index.ts
```

## Salida esperada

```text
=============== PERSONAJES RPG ===============
Lyra | Maga | Nv 12 | HP 80 | MP 150 | Baston arcano
Thorne | Guerrero | Nv 9 | HP 200 | MP 20 | Hacha doble
Kael | Monje | Nv 10 | HP 140 | MP 60 | Sin arma (combate a mano)
Nyx | Picara | Nv 7 | HP 95 | MP 40 | Dagas gemelas

=== Listos para mision dificil (nivel >= 10) ===
Lyra | Maga | Nv 12 | HP 80 | MP 150 | Baston arcano
Kael | Monje | Nv 10 | HP 140 | MP 60 | Sin arma (combate a mano)
Total: 2 de 4 personajes
```
