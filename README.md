# Stock Master B2B - Monorepo

Monorepo con Bun workspaces para Stock Master B2B (backend Express + frontend Angular 21).

## 🏗️ Estructura

```
Stock-Master-B2B/
├── backend/
│ ├── index.ts # Servidor Express
│ └── package.json
├── frontend/
│ └── stockmaster-client/
│ ├── src/
│ └── package.json
├── package.json # Root workspace
├── bun.lock
└── .gitignore
```

## 🚀 Instalación

```bash
bun install
```

## 📦 Scripts

```bash

# Desarrollo

bun run dev:frontend # Angular en :4200
bun run dev:backend # Express

# Build

bun run build:frontend
bun run build:backend
```

## 🔧 Configuración Aplicada

### 1. `package.json` raíz (creado)

```json
{
  "workspaces": ["backend", "frontend/stockmaster-client"]
}
```

### 2. `backend/package.json` (modificado)

**Agregado:**

```json
"scripts": {
"dev": "bun run --hot index.ts",
"build": "bun build index.ts --outdir ./dist"
}
```

### 3. `frontend/stockmaster-client/package.json` (modificado)

**Cambiado:**

```json
"packageManager": "bun@1.3.4"
```

(antes erm `npm@10.9.3`)

### 4. `.gitignore` (creado)

```
node_modules/
dist/
\*.log
.env
.angular/
```

## ✅ Ventajas del Monorepo

- Un solo `bun install`
- Dependencias compartidas (TypeScript, etc.)
- Scripts centralizados
- Listo para `packages/shared`

  ```

  ```
