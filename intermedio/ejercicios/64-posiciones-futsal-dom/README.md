# 64. Tabla futsal interactiva

## Dificultad

Intermedio

## Tematica usada

futbol sala

## Contexto del problema

Vas a resolver un caso relacionado con futbol sala: **Tabla futsal interactiva**. La idea es practicar TypeScript como se usa en proyectos reales: primero entiendes los datos, luego defines tipos claros y finalmente implementas la logica.

## Objetivo

Construir una solucion tipada que procese datos, aplique reglas de negocio y entregue un resultado verificable sin usar atajos como `any`.

## Explicacion paso a paso

1. Modela el dominio de futbol sala con tipos e interfaces claras.
2. Crea datos de prueba realistas para Tabla futsal interactiva.
3. Implementa funciones separadas para validar, transformar y calcular resultados.
4. Usa discriminated unions y reducers sin recurrir a any.
5. Muestra un resumen final que permita revisar si la solucion cumple el objetivo.
6. Prueba un caso normal y un caso limite.
7. Ejecuta el compilador antes de enviar el Pull Request.

## Instrucciones detalladas

1. Lee todo el README antes de escribir codigo.
2. Crea primero los `type`, `interface` o `enum` que necesites.
3. Define datos de prueba suficientes para demostrar la solucion.
4. Escribe funciones pequenas con parametros y retornos tipados.
5. Evita mezclar calculos, validaciones y salida por consola en una sola funcion.
6. Muestra un resumen claro con `console.log`.
7. Guarda tu solucion solo dentro de tu carpeta personal.

## Ejemplos

Ejemplo de forma de pensar el modelo:

```ts
type Estado = 'pendiente' | 'aprobado' | 'rechazado';

interface Registro {
  id: number;
  nombre: string;
  estado: Estado;
  puntaje: number;
}
```

No copies este ejemplo como solucion. Usalo como referencia para definir tus propios tipos segun el contexto del ejercicio.

## Entregable esperado

Tu respuesta debe estar aqui:

```text
intermedio/ejercicios/64-posiciones-futsal-dom/resoluciones/nombre-apellido/
```

Ejemplo valido:

```text
intermedio/ejercicios/64-posiciones-futsal-dom/resoluciones/juan-perez/index.ts
```

## Reglas

- No modifiques `README.md` ni `index.ts` base.
- No subas archivos fuera de `resoluciones/nombre-apellido/`.
- No uses `any` salvo justificacion clara.
- No copies respuestas de otros estudiantes.
- El Pull Request debe ir hacia `dev`, nunca hacia `main`.
- Tu codigo debe compilar con `npm run build`.

## Consejos

- Empieza por nombrar correctamente los datos del problema.
- Usa `readonly` si un dato no debe cambiar.
- Usa union types para estados, roles, categorias, rarezas o modos.
- Si el ejercicio crece, divide la logica en funciones.
- Si TypeScript marca error, lee el mensaje antes de cambiar tipos al azar.

## Errores comunes

- Resolver todo con `any`.
- Crear objetos sin interfaces.
- Mutar arreglos originales cuando podrias crear uno nuevo.
- Ordenar numeros como texto.
- Entregar directo en `resoluciones/` sin carpeta personal.

## Pistas opcionales

Conceptos recomendados: `discriminated unions`, `reducers`, `state machine`, `eventos`.

- Si necesitas agrupar, piensa en `Record` o `Map`.
- Si necesitas validar variantes, piensa en unions discriminadas.
- Si necesitas reutilizar logica, piensa en generics.
- Si necesitas manejar errores, evita retornos ambiguos y usa tipos claros.

## Como validar si el ejercicio quedo bien

1. Ejecuta tu archivo con `npm run dev -- ruta/de/tu/index.ts`.
2. Ejecuta `npm run build`.
3. Verifica que no aparezcan errores de TypeScript.
4. Confirma que tu salida corresponde al objetivo del ejercicio.
5. Revisa con `git status` que solo agregaste archivos dentro de tu carpeta personal.
