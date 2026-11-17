# Intermedio 53: Gestor de misiones RPG

**Tematica:** videojuegos RPG
**Alumna:** Dulce Morales

## Problema

Un grupo de aventureros tiene un tablero de misiones:

- algunas requieren haber completado otras antes, o un **nivel minimo**;
- las misiones tardan en completarse (son **asincronas**);
- el grupo puede hacer como **maximo 2 a la vez**;
- una mision puede fallar, y entonces se reintenta **una vez**.

Al completar misiones se gana experiencia, y cada 300 xp el grupo sube de nivel. Todo se avisa con **eventos tipados**, y los problemas, con **errores tipados**.

## Que hice

### Errores tipados

- `ErrorCiclo`: las misiones dependen unas de otras en circulo (A -> B -> C -> A).
- `ErrorRequisitoFaltante`: una mision pide otra que no existe.
- `ErrorMisionFallida`: fallo en los dos intentos.

### Eventos tipados

`Emisor<E>` es **generico**. La interfaz `EventosGremio` define que dato lleva cada evento: `iniciada`, `completada`, `fallo`, `"sube de nivel"` y `bloqueada`. Toda la salida por consola se arma escuchando esos eventos.

### Clase `GestorMisiones`

- Las misiones completadas (un `Set`), la xp y el oro son **privados**. El nivel es un getter calculado.
- `validarTablero()`: revisa que todos los requisitos existan y busca ciclos con una busqueda en profundidad (usa dos `Set`: "visitando" y "listas").
- `intentar(mision)` (**privado**, `async`): espera la duracion con `await`, decide si sale bien y reintenta una vez. Si falla las dos veces, lanza `ErrorMisionFallida`.
- `ejecutar()` (`async`): trabaja en tandas. En cada tanda toma hasta 2 misiones disponibles y las hace en paralelo con `Promise.allSettled`, para que una mision fallida no detenga a la otra. Al final avisa cuales quedaron bloqueadas y por que.

### Reglas

- **Disponible:** no esta hecha, sus requisitos estan completos y el grupo tiene el nivel minimo.
- **Probabilidad de fallar:** facil 5%, media 20%, dificil 35%, epica 50%. Uso un generador **con semilla** para que el resultado se pueda repetir.

### Casos probados

- **Validacion:** se detecta un ciclo A -> B -> C -> A y un requisito inexistente.
- **Paralelo:** las dos primeras misiones se hacen a la vez. "Ratas en la bodega" falla una vez y sale bien en el reintento.
- **Nivel:** la Cueva (nivel 2) recien se puede hacer despues de subir a nivel 2.
- **Falla definitiva:** el Lich (epico) falla en los dos intentos y lanza `ErrorMisionFallida`.
- **Bloqueada en cadena:** como el Lich fallo, el Dragon queda bloqueado porque lo requiere.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/53-misiones-rpg/index.ts
```

## Salida esperada

```text
Validacion (ciclo): [ErrorCiclo] dependencias en circulo: A -> B -> C -> A
Validacion (requisito inexistente): [ErrorRequisitoFaltante] "Ratas en la bodega" requiere "M99", que no existe en el tablero

================ JORNADA DEL GREMIO (max 2 misiones a la vez) ================
  > inicia "Ratas en la bodega" (facil)
  > inicia "Escoltar al mercader" (facil)
  X  "Ratas en la bodega" fallo en el intento 1
  > inicia "Ratas en la bodega" (facil) - reintento 2
  OK "Escoltar al mercader" +150 xp, +40 oro (xp total 150)
  OK "Ratas en la bodega" +120 xp, +15 oro (xp total 270)
  > inicia "Bandidos del puente" (media)
  OK "Bandidos del puente" +220 xp, +60 oro (xp total 490)
  ** El grupo sube a nivel 2 **
  > inicia "Cueva de las aranas" (dificil)
  OK "Cueva de las aranas" +300 xp, +90 oro (xp total 790)
  ** El grupo sube a nivel 3 **
  > inicia "El lich del pantano" (epica)
  X  "El lich del pantano" fallo en el intento 1
  > inicia "El lich del pantano" (epica) - reintento 2
  X  "El lich del pantano" fallo en el intento 2
  -  "Dragon de la montana" no se pudo hacer: requiere "El lich del pantano"
  [ErrorMisionFallida] "El lich del pantano" fallo 2 veces

Resultado: 4 misiones completadas | nivel 3 | 790 xp | 205 de oro
```
