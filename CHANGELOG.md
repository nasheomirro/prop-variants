# prop-variants

## 0.3.1

### Patch Changes

- Removed cjs and esm exports, we only export types now

## 0.3.0

### Minor Changes

- 01f1189: Breaking changes:

  - Removed the `$def` property
  - `ToVariants`, `ToKeyMap`, and `ToValueMap` now all function like their `basic` counterparts
  - Removed `basic` types and moved them to their core counterparts
    `Removed`ToCompedValueMap`

### Patch Changes

- Modified README.md

## 0.2.0

### Minor Changes

- 79fc33c: Changed, renamed, and added more types:

  - Renamed internal types
  - `Variants` ---> `ToVariants`
  - `VariantMap` ---> `ToKeyMap`
  - `VariantValueMap` ---> `ToValueMap`

  - `ToVariants` now tries it's best to determine which key-value pairs are actually a `variant`.
  - `ToValueMap` is dumbed down and only assumes that as long as variant has a default key, it's value could be `undefined`.
  - `ToVariants`, `ToKeyMap`, and `ToValueMap` can now be modifyable to change the default key.
  - Refactored internal typing as well as the core utilities

  - Added `ToCompedValueMap` which is basically the old `ToValueMap`.
  - Added `ToBasicVariants` that functions just like `ToVariants`, but does not have default keys.
  - Added `ToBasicKeyMap` that functions just like `ToKeyMap`, but doesn't assume default keys, and optional variants must be directly listed
  - Added `ToBasicValueMap` that functions just like `ToValueMap`, but doesn't assume default keys, and optional variants must be directly listed
  - Exposed `VariantGroup` to the user
  - Exposed `AnyObject` to the user

  - Removed runtime functions, making this package consists of only types

## 0.1.0

### Minor Changes

- Provided the core utilities:

  - `VariantMap` which converts a variant object type to props type.
  - `Variants` which converts props type to a variant object type.
  - `map()` a helper for mapping props to variant values.

### Patch Changes

- created README.md and LICENSE.md
