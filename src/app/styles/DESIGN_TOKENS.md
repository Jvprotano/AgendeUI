# Design Tokens

All design tokens are defined in `src/styles/_tokens.scss` as CSS custom properties on `:root`.

## Usage

Use `var(--token-name)` in all component CSS/SCSS files:

```css
.my-component {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

## Token categories

| Category   | Examples                                                    |
|------------|-------------------------------------------------------------|
| Background | `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`  |
| Text       | `--text-primary`, `--text-secondary`, `--text-tertiary`     |
| Accent     | `--accent`, `--accent-hover`, `--accent-subtle`             |
| Status     | `--status-pending`, `--status-confirmed`, `--status-cancelled`, `--status-completed` |
| Borders    | `--border-default`, `--border-strong`                       |
| Shadows    | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`  |
| Radius     | `--radius-sm`, `--radius-md`, `--radius-lg`                 |
| Spacing    | `--space-xs` through `--space-2xl`                          |
| Typography | `--font-size-*`, `--font-weight-*`, `--line-height-*`       |

## Legacy aliases

For backward compatibility, old variable names are aliased in `_tokens.scss`:
- `--primary-green` -> `--accent`
- `--bg-primary` -> `--bg-base`
- `--bg-secondary` -> `--bg-surface`
- `--border-color` -> `--border-default`
- `--text-muted` -> `--text-tertiary`

## Rules

- **No hardcoded hex colors** in component CSS. All colors must reference tokens.
- The only exception is `#fff` for text on accent/gradient buttons.
- Material palette definitions in `material-theme.scss` use hex (required by Angular Material API).
