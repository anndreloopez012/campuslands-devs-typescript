# Campuslands Devs TypeScript

Repositorio educativo para aprender TypeScript desde cero hasta nivel intermedio mediante ejercicios practicos, progresivos y contextualizados en intereses reales de estudiantes.

## Introduccion a TypeScript

TypeScript es un superset de JavaScript que agrega tipado estatico, mejores herramientas de autocompletado y validaciones antes de ejecutar el codigo. El objetivo no es escribir mas codigo, sino detectar errores temprano y construir software mas mantenible.

## JavaScript vs TypeScript

| JavaScript | TypeScript |
| --- | --- |
| Tipado dinamico en tiempo de ejecucion. | Tipado estatico durante desarrollo y compilacion. |
| Los errores de tipos suelen aparecer al ejecutar. | Muchos errores se detectan antes de ejecutar. |
| No requiere compilacion. | Se compila a JavaScript. |
| Flexible para prototipos rapidos. | Mas seguro para proyectos medianos y grandes. |

## Requisitos

1. Instalar Node.js LTS desde https://nodejs.org.
2. Verificar instalacion:

```bash
node --version
npm --version
```

3. Instalar dependencias del repositorio:

```bash
npm install
```

## Instalacion de TypeScript

Este repositorio incluye TypeScript como dependencia de desarrollo. Si necesitas instalarlo globalmente para practicar en otros proyectos:

```bash
npm install -g typescript
tsc --version
```

## Como ejecutar ejercicios

Cada ejercicio contiene un `index.ts`. Ejecuta un ejercicio basico con:

```bash
npm run dev -- ejercicios/01-introduccion-typescript/index.ts
```

Ejecuta un ejercicio intermedio con:

```bash
npm run dev -- intermedio/ejercicios/01-dashboard-kd-shooter/index.ts
```

## Como compilar TypeScript

```bash
npm run build
```

El comando valida el proyecto con `tsc --noEmit`, sin generar archivos JavaScript.

## Flujo Git de Campuslands

Ramas principales:

- `main`: versiones estables.
- `dev`: rama principal de desarrollo.
- Ramas personales: trabajo de estudiantes.

Ejemplos de ramas personales:

```bash
git checkout dev
git pull origin dev
git checkout -b juan-perez
git add .
git commit -m "feat: solve exercise 01"
git push -u origin juan-perez
```

Los estudiantes deben abrir Pull Request hacia `dev`. Nadie debe mezclar cambios directamente a `main` salvo administradores del repositorio.

## Como crear Pull Requests

1. Publica tu rama personal.
2. En GitHub, entra al repositorio.
3. Selecciona **Compare & pull request**.
4. Base: `dev`.
5. Compare: tu rama personal.
6. Describe que ejercicios resolviste y como probaste tu codigo.
7. Solicita revision.

Las entregas de estudiantes no deben modificar los archivos base. Cada respuesta debe ir en una carpeta personal dentro de `resoluciones`.

Ejemplo basico:

```text
ejercicios/01-introduccion-typescript/resoluciones/juan-perez/index.ts
```

Ejemplo intermedio:

```text
intermedio/ejercicios/01-dashboard-kd-shooter/resoluciones/juan-perez/index.ts
```

## Buenas practicas

- Usa nombres claros y descriptivos.
- Mantén funciones pequenas y con una sola responsabilidad.
- No uses `any` salvo justificacion tecnica.
- Ejecuta `npm run build` antes de enviar PR.
- Lee el README de cada ejercicio antes de programar.
- No modifiques archivos dentro de `respuestas/` para entregar ejercicios.
- Escribe commits pequenos y con mensajes claros.

## Convenciones de nombres

- Variables y funciones: `camelCase`.
- Tipos, interfaces, clases y enums: `PascalCase`.
- Carpetas de ejercicios: numero + nombre en kebab-case.
- Ramas personales: nombre-apellido en minusculas, sin tildes ni espacios.

## Estructura del repositorio

```text
/
├── README.md
├── CONTRIBUTING.md
├── .editorconfig
├── .gitignore
├── package.json
├── tsconfig.json
├── .vscode/
├── docs/
├── ejercicios/
├── intermedio/
└── respuestas/
```

## Ruta de ejercicios

| # | Ejercicio | Contexto | Concepto |
| --- | --- | --- | --- |
| 01 | [Introduccion a TypeScript](./ejercicios/01-introduccion-typescript) | Videojuegos Shooter | conocer la sintaxis basica de TypeScript y ejecutar un archivo tipado |
| 02 | [Tipos primitivos](./ejercicios/02-tipos-primitivos) | Motos | usar `string`, `number`, `boolean`, `null` y `undefined` de forma segura |
| 03 | [Arrays y Tuplas](./ejercicios/03-arrays-y-tuplas) | Equipos de futbol | representar listas homogeneas y posiciones fijas con tipos |
| 04 | [Interfaces](./ejercicios/04-interfaces) | Personajes RPG | definir contratos para objetos con propiedades obligatorias y opcionales |
| 05 | [Type Alias](./ejercicios/05-type-alias) | Catalogo de ropa | crear alias reutilizables para objetos, literales y combinaciones |
| 06 | [Funciones tipadas](./ejercicios/06-funciones-tipadas) | Sistema de puntuacion deportiva | tipar parametros, retornos y funciones auxiliares |
| 07 | [Objetos avanzados](./ejercicios/07-objetos-avanzados) | Biblioteca de peliculas | usar objetos anidados, propiedades readonly, opcionales y metodos |
| 08 | [Union Types](./ejercicios/08-union-types) | Vehiculos deportivos e hiperdeportivos | permitir valores controlados y discriminar variantes |
| 09 | [Enums](./ejercicios/09-enums) | Generos musicales | agrupar constantes con nombre para opciones conocidas |
| 10 | [Generics](./ejercicios/10-generics) | Inventario de videojuegos | crear funciones y estructuras reutilizables sin perder tipos |
| 11 | [Clases](./ejercicios/11-clases) | Sistema de motocicletas | encapsular estado y comportamiento con clases |
| 12 | [Herencia](./ejercicios/12-herencia) | Personajes de videojuegos MOBA | reutilizar comportamiento con clases base y especializadas |
| 13 | [Modulos](./ejercicios/13-modulos) | Aplicacion de viajes | separar responsabilidades usando `export` e `import` |
| 14 | [Async/Await](./ejercicios/14-async-await) | Consulta de API de peliculas | trabajar con promesas, funciones asincronas y manejo de errores |
| 15 | [Proyecto Final Integrador](./ejercicios/15-proyecto-final) | Gestor de personajes para videojuego RPG con TypeScript | integrar tipos, interfaces, clases, generics, modulos y asincronia |

## Nivel intermedio

El nivel intermedio agrega 80 ejercicios progresivos en [intermedio/](./intermedio). La dificultad sube por bloques:

- 01-20: interfaces, aliases, arrays tipados, filtros, rankings y validaciones.
- 21-40: reglas de negocio, union types, Record, Map, Set, clases y generics.
- 41-60: fechas, estados, reportes, async/await y errores tipados.
- 61-80: reducers, state machines, persistencia simulada y mini sistemas integradores.

## Gobernanza

Las reglas completas para proteger `main` y `dev` estan documentadas en [docs/github-governance.md](./docs/github-governance.md).
