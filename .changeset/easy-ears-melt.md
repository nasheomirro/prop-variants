---
"prop-variants": minor
---

Changed, renamed, and added more types:

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
