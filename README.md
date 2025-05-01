# prop-variants

A small set of utility types that helps you deal with exposing variants through props.

## Assumption

Before we get into it, the library assumes you want to map your variants into an object similar to this:

```ts
const variants = {
  size: {
    sm: "",
    md: "",
    lg: "",
  },
  theme: {
    primary: "",
    secondary: "",
  },
};

// which translates to...
type Props = {
  size: "sm" | "md" | "lg";
  theme: "primary" | "secondary";
};
```

Now, the goal for this package is to provide types that **"connect"** this object to your props, or vice versa, as well as adding a few things to really organize how you use this object.

## How to use

To map out your `Props` to your variants, you can use the `ToVariants` utility type:

```ts
import type { ToVariants } from "prop-variants";

type Props = {
  size?: "sm" | "md" | "lg";
  theme: "primary" | "secondary";
};

// makes this type-safe!
const variants = {
  size: {
    sm: "",
    md: "",
    // complains that there is no lg!
  },
  theme: {
    primary: "",
    secondary: "",
  },
} satisfies ToVariants<Props>;
```

This provides type-safety and auto-suggestions to the `variants` object. Note that you should always use the `satisfies` keyword to preserve the full type of your object.

Now if you want to do this in reverse; where your variants create your `Props`, take a look at the [`ToKeyMap` type](#creating-props-based-on-variants).

### Dirty `Props`

Sometimes your props aren't just made up of variant mappings, there are other stuff in there that isn't related to variants at all. Now instead of separating your `Props` to accomodate for your variant mappings, `ToVariants` goes around this by being strict on what it allows to become a variant:

```ts
import type { ToVariants } from "prop-variants";

type Props = {
  theme?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  text: string;
  onclick?: () => void;
  disabled?: boolean;
};

// only "theme" and "size" is considered a variant!
const variants = {
  theme: { primary: "", secondary: "..." },
  size: { sm: "", md: "", lg: "..." },
} satisfies ToVariants<Props>;
```

It will ignore the other props in there that doesn't qualify as a variant, this is because `ToVariants` only accept values that are `"string instances"`.

### Optional `Props`

We already see from the previous examples that `ToVariants` can handle optional props without issue. What we don't see however is that `ToVariants` adds a new optional property to our variants:

```ts
import type { ToVariants } from "prop-variants";

type Props = {
  // note that these two are optional
  size?: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
};

const variants = {
  size: {
    $def: null, // `$def` is added as a property
    sm: "",
    md: "",
    lg: "",
  },
  theme: {
    $def: "primary",
    primary: "",
    secondary: "",
  },
} satisfies ToVariants<Props>;
```

The added `$def` property holds the key that maps out the default value to be used when the user didn't provide a key for the given variant. If there should be no default value you can specify it as `null` or `undefined`. This is important because other types in this package depend on the existance of a `$def`.

This is an opinionated decision and because of that we offer types that doesn't have this (checkout [basic types](#using-basic-types)). We also have a way to change the property name if you do not like the name `$def`.

### Variants aren't just strings

You can create variant values that take any form. Although the main use case for this project was for class strings, it's really just a mapping of any "variant-like" props you want to expose to the consumer:

```ts
import type { ToVariants } from "prop-variants";

type Props = {
  // note that these two are optional
  size?: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
  behavior?: "instant" | "debounced";
};

const variants = {
  size: {
    sm: { container: "", text: "" },
    md: { container: "", text: "" },
    lg: { container: "", text: "" },
  },
  theme: {
    primary: "",
    secondary: "",
  },
  behavior: {
    $def: "instant",
    instant: () => {},
    smooth: () => {},
  },
} satisfies ToVariants<Props>;
```

### Creating `Props` based on variants

Now so far we used `ToVariants<Props>` to build out our variants object. But we could also do that in reverse with `ToKeyMap`:

```ts
import type { ToKeyMap } from "prop-variants";

const variants = {
  size: {
    sm: "",
    md: "",
    lg: "",
    /* ... */
  },
  theme: {
    $def: "primary",
    primary: "",
    secondary: "",
    /* ... */
  },
};

type Props = ToKeyMap<typeof variants>;

// which translates to...
type Props = {
  size: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
};
```

The `Props` should now automatically update when variants changes. The existence of the `$def` key is what is used to decide if a prop is optional or not, this makes it so that `ToKeyMap` knows that the author expects that the user might not provide a value for a given variant. If you want a variant to still be optional without a default value, set `$def` to `null` or `undefined`.

This is useful but this leaves `variants` untyped, because of this it might be better to still use `ToVariants` instead.

### Using "basic" types

Understandably, having a `$def` property on your variants might not be what you'd expect and arguably the `$def` property arrangement might be an overreach for a simple utility type package. That is why the package offers types that do not use/need the `$def` property. These types have the same features as their counterparts:

```ts
import type { ToBasicVariants } from "prop-variants";

type Props = {
  size: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
  onclick?: () => void; // also avoids dirty props!
};

const variants = {
  size: {
    sm: "",
    md: "",
    lg: "",
  },
  theme: {
    primary: "",
    secondary: "",
  },
} satisfies ToBasicVariants<Props>;
```

Although when using `ToBasicKeyMap`, you must explicitly list down the variants that are optional since there is no way for the type to know otherwise:

```ts
import type { ToBasicKeyMap } from "prop-variants";

const variants = {
  size: {
    sm: "",
    md: "",
    lg: "",
  },
  theme: {
    primary: "",
    secondary: "",
  },
};

// second argument is a union of variants that you want to make optional
type Props = ToBasicKeyMap<typeof variants, "theme">;

// which translates to...
type Props = {
  size: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
};
```

### Changing `$def` to something else

If you would like to use a different key other than the default `$def`, you have to make your own types that provide the change:

```ts
// utils.ts
import type { AnyObject, VariantGroup, ToVariants, ToKeyMap } from "prop-variants";

export type Variants<T extends AnyObject> = ToVariants<T, "newDefaultKey">;
export type KeyMap<T extends VariantGroup> = ToKeyMap<T, "newDefaultKey">;
```
