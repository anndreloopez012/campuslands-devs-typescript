# Ejercicio 15: Proyecto Final Integrador

**Contexto:** Gestor de personajes para videojuego RPG con TypeScript
**Alumna:** Dulce Morales

## Estructura

Separe las responsabilidades en varios modulos:

| Archivo | Responsabilidad | Temas que integra |
|---|---|---|
| `tipos.ts` | Contratos: `Personaje`, `ItemEquipo`, `ClasePersonaje`, `Rareza`, `Resultado<T>` | interfaces, union types, enum, `readonly`, generics |
| `utilidades.ts` | Funciones reutilizables: `buscarPorId<T>`, `agruparPor<T, K>`, validaciones y calculo de poder | generics, type guards, funciones tipadas |
| `gestor.ts` | Clase `GestorPersonajes` que encapsula la lista de personajes | clases, `private`, getter, async/await |
| `datos.json` | Datos iniciales (incluye dos registros invalidos a proposito) | modulos JSON |
| `index.ts` | Punto de entrada: usa el gestor y muestra el resultado | `import` / `export` |

## Que hace

1. **Carga inicial asincrona:** `cargarDatosIniciales` espera una latencia simulada y valida cada registro del JSON. Rechaza a Bram (clase "Nigromante" no existe) y a Ivo (nivel -2).
2. **Registrar:** agrega personajes nuevos y rechaza ids repetidos.
3. **Subir nivel:** solo acepta un numero entero mayor que 0, asi el nivel nunca queda negativo. Tambien avisa si el personaje no existe.
4. **Listar por clase:** muestra los personajes de cada clase.
5. **Resumen final:** ranking ordenado por poder total.

Las operaciones que pueden fallar devuelven `Resultado<T>` (`{ ok: true, valor }` o `{ ok: false, error }`), asi los errores se muestran sin detener el programa.

Los datos del JSON llegan como texto. Para convertir `"Maga"` o `"epico"` a sus tipos uso type guards (`esClaseValida`, `esRarezaValida`) en lugar de casteos.

## Reto extra

- **Rareza de equipo:** enum `Rareza` (comun, raro, epico, legendario) con un multiplicador de poder (x1, x1.5, x2, x3).
- **Inventario:** cada personaje tiene una lista de `ItemEquipo`. `equipar` agrega items y evita duplicados.
- **Poder total:** `nivel * 10 + vida / 2 + poder del equipo` (cada item multiplicado por su rareza).

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/15-proyecto-final/index.ts
```

## Salida esperada

```text
Cargando datos iniciales...
Cargados 3 de 5 personajes.
  Rechazado: Bram: clase desconocida "Nigromante"
  Rechazado: Ivo: nivel invalido (-2)

=== REGISTRO ===
  OK    registrar: Thea (nivel 6)
  ERROR registrar: Ya existe un personaje con id P-01

=== SUBIR NIVEL ===
  OK    subir 3 niveles: Sena (nivel 10)
  ERROR subir -5 niveles: Roth: no se puede subir -5 niveles
  ERROR subir 1 nivel: No existe el personaje P-99

=== EQUIPAR ===
  OK    equipar: Thea (nivel 6)

=== PERSONAJES POR CLASE ===
Maga (1)
  Lyra   Nv  8 | HP  90 | Baston de cristal [epico, +60]
Guerrero (1)
  Roth   Nv 11 | HP 145 | Espada larga [raro, +60], Escudo de roble [comun, +15]
Arquera (1)
  Sena   Nv 10 | HP 131 | Arco elfico [legendario, +75]
Clerigo (1)
  Thea   Nv  6 | HP  85 | Amuleto solar [legendario, +60]

=== RESUMEN FINAL: RANKING DE PODER ===
1. Roth   (Guerrero) poder 258
2. Sena   (Arquera ) poder 241
3. Lyra   (Maga    ) poder 185
4. Thea   (Clerigo ) poder 163
Total: 4 personajes en 4 clases.
```
