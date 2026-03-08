# `packages/typescript`

Shared TypeScript base config package for this monorepo.

## Files

- [`base.json`](./base.json) - strict/common compiler options used by apps and packages

## Usage

In a package `tsconfig.json`:

```json
{
	"extends": "../../packages/typescript/base.json"
}
```

Relative `extends` is preferred in this repo because it is consistently resolved by both `tsc` and VS Code across project references.

## What It Standardizes

- Strictness flags (`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, ...)
- Consistency flags (`forceConsistentCasingInFileNames`, `isolatedModules`, ...)
- Output defaults (`declaration`, `declarationMap`, `sourceMap`)
- `skipLibCheck: true`

Packages/apps can still override target/module/runtime-specific settings locally.
