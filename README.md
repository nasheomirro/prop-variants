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
  theme?: "primary" | "secondary";
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

This provides type-safety and auto-suggestions to the `variants` object. Note that you should always use the `satisfies` keyword to preserve the full type of your object. Now if you want to do this in reverse; where your variants create your `Props`, take a look at the [`ToKeyMap` type](#creating-props-based-on-variants).

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

### Variants aren't just strings

You can create variant values that take any form. Although the main use case for this project was for class strings, it's really just a mapping of any "variant-like" props you want to expose to the consumer:

```ts
import type { ToVariants } from "prop-variants";

type Props = {
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
    primary: "",
    secondary: "",
    /* ... */
  },
};

// note the second argument "theme"
type Props = ToKeyMap<typeof variants, "theme">;

// which translates to...
type Props = {
  size: "sm" | "md" | "lg";
  theme?: "primary" | "secondary";
};
```

The `Props` should now automatically update when variants changes. Note that for optional props we need to manually tell `ToKeyMap` which variant should become optional, this is because `ToKeyMap` has no way to know just from `typeof variants`.

This is useful but this leaves `variants` untyped, because of this it might be better to still use `ToVariants` instead.