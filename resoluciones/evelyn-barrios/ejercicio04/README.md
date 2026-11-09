# Ejercicio 04: Interfaces y Objetos Complejos - Evelyn Barrios

## Resolución y Explicación

En este ejercicio, avanzamos en la organización del código utilizando **Interfaces** para definir la estructura de objetos complejos, como el perfil completo de un jugador. A diferencia de las variables sueltas de los primeros ejercicios, aquí agrupamos toda la información bajo un "contrato" único.

- **Definición de Interfaz:** Se creó la interfaz `Jugador` que incluye propiedades clave como `nickname`, `nivel`, y `rango`.
- **Propiedades Opcionales:** Se implementó el uso del modificador `?` para campos que no siempre están presentes, como el `clan` o `equipoSecundario`, permitiendo flexibilidad sin perder el control.
- **Propiedades de Solo Lectura:** Se utilizó el modificador `readonly` para el `id` único del jugador, asegurando que datos críticos no sean sobrescritos por error durante la ejecución.

### ¿Por qué se hizo así?

En el desarrollo de software a gran escala, trabajar con objetos sin una estructura definida es una fuente constante de errores (por ejemplo, intentar acceder a `jugador.vida` cuando la propiedad se llamó accidentalmente `jugador.hp`). Las interfaces actúan como un **plano de construcción (blueprint)**. Al usarlas, garantizamos que cada objeto de tipo "Jugador" en nuestro videojuego siga la misma estructura, facilitando la colaboración y la escalabilidad.

## Diferencias observadas con JavaScript

| Característica            | JavaScript                                                                                                     | TypeScript (Interfaces)                                                                                |
| :------------------------ | :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Estructura de Objetos** | Los objetos son dinámicos; puedes añadir o quitar propiedades en cualquier momento sin control.                | Los objetos deben seguir estrictamente el "contrato" definido por la interfaz.                         |
| **Propiedades Faltantes** | Si accedes a una propiedad inexistente, obtienes `undefined` y el programa continúa (pudiendo fallar después). | El compilador te advierte inmediatamente si falta una propiedad obligatoria.                           |
| **Inmutabilidad**         | Se requiere `Object.freeze()` para proteger datos, lo que añade carga en tiempo de ejecución.                  | Se usa `readonly` en tiempo de desarrollo para evitar cambios accidentales sin afectar el rendimiento. |
| **Documentación**         | Depende de comentarios manuales (JSDoc) para saber qué campos tiene un objeto complejo.                        | La interfaz sirve como documentación viva y autocompletado exacto en el editor.                        |

## Ejemplo de Mejora

**En JavaScript (Incierto):**

```javascript
const procesarMision = (jugador) => {
  // No sabemos si 'jugador' tiene las propiedades necesarias hasta que falla
  console.log(jugador.recompensas.oro);
};
```

**En TypeScript (Seguro):**

```typescript
interface IJugador {
  readonly id: string;
  nickname: string;
  clan?: string; // El sistema sabe que puede o no existir
}
```

## Conclusión

El uso de interfaces marca la transición de "escribir scripts" a "diseñar sistemas". Ahora el código es predecible y resistente a cambios, permitiendo que el equipo de desarrollo entienda la forma de los datos simplemente leyendo la definición de la interfaz.
