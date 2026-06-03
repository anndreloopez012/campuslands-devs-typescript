# Guia de contribucion

## Flujo obligatorio

1. Sincroniza `dev`.
2. Crea una rama personal.
3. Resuelve ejercicios en tu rama.
4. Ejecuta `npm run build`.
5. Haz commit y push.
6. Abre Pull Request hacia `dev`.

## Reglas

- No hacer push directo a `main`.
- No hacer push directo a `dev`.
- No hacer merge sin Pull Request.
- No copiar soluciones desde `respuestas/`.
- No cambiar la configuracion base sin aprobacion del instructor.

## Formato recomendado de commits

```text
feat: solve primitive types exercise
fix: correct score calculation
docs: improve exercise notes
refactor: simplify inventory search
```

## Checklist antes de Pull Request

- [ ] Mi rama nace desde `dev`.
- [ ] Mi codigo compila con `npm run build`.
- [ ] No modifique respuestas oficiales.
- [ ] El PR explica que hice y como lo probe.
