# Gobernanza y proteccion de ramas en GitHub

Este documento explica como configurar el repositorio remoto cuando no hay automatizacion disponible desde la terminal local.

## Crear repositorio remoto

1. Entra a GitHub con la cuenta propietaria.
2. Crea un repositorio llamado `campuslands-devs-typescript`.
3. No inicialices con README, .gitignore ni licencia, porque el repositorio local ya los contiene.
4. Copia la URL remota.
5. En terminal:

```bash
git remote add origin https://github.com/ORG_O_USUARIO/campuslands-devs-typescript.git
git push -u origin main
git push -u origin dev
```

## Crear rama dev localmente

```bash
git checkout -b dev
git push -u origin dev
```

## Proteger main

Ruta en GitHub:

```text
Settings > Branches > Add branch protection rule
```

Configurar:

- Branch name pattern: `main`
- Require a pull request before merging: activado.
- Require approvals: activado.
- Require status checks to pass before merging: recomendado.
- Require branches to be up to date before merging: recomendado.
- Restrict who can push to matching branches: activado.
- Agregar solamente al propietario, administradores o equipo de instructores.
- Do not allow bypassing the above settings: desactivado si el administrador debe poder hacer push directo.
- Allow force pushes: desactivado.
- Allow deletions: desactivado.

## Proteger dev

Crear otra regla:

- Branch name pattern: `dev`
- Require a pull request before merging: activado.
- Require approvals: activado.
- Require status checks to pass before merging: recomendado.
- Restrict who can push to matching branches: activado.
- Agregar solamente al propietario, administradores o equipo de instructores.
- Do not allow bypassing the above settings: desactivado si el administrador debe poder hacer push directo.
- Allow force pushes: desactivado.
- Allow deletions: desactivado.

## Permisos para estudiantes

En `Settings > Collaborators and teams`:

- Dar a estudiantes permiso `Write` si deben crear ramas, hacer commit y push.
- No agregarlos a la lista de usuarios con permiso de push directo a `main` o `dev`.
- Indicar que todo trabajo debe ir en ramas personales.

Con esta configuracion los estudiantes pueden crear ramas y subir commits, pero no pueden escribir directamente sobre `main` ni `dev`, ni mezclar cambios sin Pull Request.
