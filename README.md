# prop-variants

A small, mostly "types-only" package that organizes the way you make your prop variants.

- ✅ Just types, no runtime stuff
- ✅ Flexible APIs
- ✅ Framework agnostic, it's just props really
- 🗺️ Optional utility for easier mapping

## What it solves

This package aims to provide organization and type-safety when dealing with "variant-like" props. These are props that map to a certain value from a list of keys. A typical example would be a `Button` component that has a `size` prop that is of type `"sm" | "base" | "lg"`:

```svelte
<Button size="base" />
```

Now what we'd normally do is inline it someway, or if you're fancy you would use an object.

```svelte
<button class="{size === "sm" && "text-sm"} {size === "base" && "text-base"} {size === "lg" && "text-lg"}">
  <!-- ... -->
</button>

<button class="{sizes[size]}">
  <!-- ... -->
</button>
```

But things become a bit messy when we need to provide type safety, we'd need to make sure that the props map correctly to the object or inline key, and if we want to provide a default value when we want the prop to be optional, we'd need to modify the prop type and make sure that the places where we use the variant uses the default value.

`prop-variants` aims to solve this small issue by restricting your variants to a slightly-opinionated format:

```ts
// place your variants into an object
const variants = {
  size: {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  },
  theme: {
    $$: "primary", // define a fallback key if no value is provided
    primary: "text-primary-500",
    secondary: "text-secondary-500",
  },
  behavior: {
    debounce: () => _debounce(/* ... */),
    throttle: () => _throttle(/* ... */),
    instant: () => _instant(/* ... */),
  },
};
```

`prop-variants` provides types and utilities that work with this format to organize and smoothly work with variant-like props 🎂

## How to Use

With the format, we could then get the prop types with `VariantMap<T>`:

```ts
import { type VariantMap } from "prop-variants";

const variants = {
  theme: {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    tertiary: "text-tertiary-500",
  },
  size: {
    $$: "base",
    sm: "text-small",
    base: "text-base",
    lg: "text-lg",
  },
};

type Props = VariantMap<typeof variants>;

// which becomes...
type _ = {
  theme: "primary" | "secondary" | "tertiary";
  size?: "sm" | "base" | "lg"; // note how this became a partial
};
```

The `VariantMap` type above accepts a variant object and spits out each variant groups' keys, this would be then used to set the component's props!

### Creating Optional Props

Notice how the `size` property was optional? Well that's because in a variant group we can specify a fallback key using `"$$"`:

```ts
const variants = {
  size: {
    $$: "base", // notice it uses "base" as the value
    sm: "text-small",
    base: "text-base",
    lg: "text-lg",
  },
};

// using `VariantMap<typeof variants>` becomes...
type _ = {
  size?: "sm" | "base" | "lg";
};
```

If the `"$$"` is present in a variant group, it means that the variant will default to the specified key. In this case, the default for the variant group `size` is `base`. Because the variant group has a default key, `VariantMap<T>` assumes that it is optional.

❗ Note that right now this is all just typings, we do offer a utility function to help map the props into values but if you don't use that then you'll have to map it manually with this in mind.

### Optional Props with no defaults

If the variant doesn't have a default value while still being optional, just set `null` or `undefined` on `"$$"`:

```ts
const variants = {
  size: {
    $$: null,
    sm: "text-small",
    base: "text-base",
    lg: "text-lg",
  },
};

// using `VariantMap<typeof variants>` becomes...
type _ = {
  size?: "sm" | "base" | "lg"; // prop is still optional
};
```

### Variants aren't just strings

You can create variant values that take any form. Although the main use case for this project was for class strings, it's really just a mapping of any "variant-like" props you want to expose to the consumer:

```ts
const variants = {
  // objects
  theme: {
    primary: { container: "bg-primary-50 border-primary-50", btn: "bg-primary-500 text-white" },
    secondary: { container: "bg-secondary-50 border-secondary-50", btn: "bg-secondary-500 text-white" },
  },
  // strings
  size: {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  },
  // functions
  behavior: {
    debounce: () => _debounce(/* ... */),
    throttle: () => _throttle(/* ... */),
    instant: () => _instant(/* ... */),
  },
};

// using `VariantMap<typeof variants>` becomes...
type _ = {
  theme?: "primary" | "secondary" | "tertiary";
  size: "sm" | "base" | "lg";
  behavior?: "debounce" | "throttle" | "instant";
};
```

Note that you can shape them however you please but it's probably good practice to keep values in one variant group the same type for consistency.

### Mapping The Props to their Variants

So far, we only talked about how `VariantMap` makes your variant object into prop types. Now lets see how we can use the given props to map to the variant's values. And how we'll do that is through the `map()` fn:

```ts
import { map } from "prop-variants";

const variants = {
  theme: {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    tertiary: "text-tertiary-500",
  },
  size: {
    $$: "base",
    sm: "text-small",
    base: "text-base",
    lg: "text-lg",
  },
  behavior: {
    $$: null,
    debounce: () => _debounce(/* ... */),
    throttled: () => _throttle(/* ... */),
  },
};

// using `VariantMap<typeof variants>` becomes...
type _ = {
  theme?: "primary" | "secondary" | "tertiary";
  size: "sm" | "base" | "lg";
  behavior?: "debounce" | "throttle" | "instant";
};
```

```ts
// imagine we got this from the consumer
const props: VariantMap<typeof variants> = {
  theme: "primary",
};

const {
  size, // string
  theme, // string
  behavior, // string | undefined <--- because we have `$$` set to null
} = map(variants, props);

console.log(size); // "text-base"
console.log(theme); // "text-primary-500"
console.log(behavior); // undefined
```

The `map` fn takes your variants and uses your props as a "map" to then spit out the correctly typed variant values. It also uses the default key in `"$$"` if a variant isn't present, and if `"$$"` is null, it spits out `undefined`.

### Not using the map function

The map function is called at runtime and some people understandably will not like that. However, the map function isn't the primary focus of the package but instead it's its types. You shouldn't have any trouble manually mapping the variants, and the whole process should be type-safe:

```ts
// imagine we got this from the consumer
const props: VariantMap<typeof variants> = {
  theme: "primary",
};

// Remember, `size` and `behavior` won't cause type errors because
// in the proper context, props is of type `VariantProps<...>`
const {
  size, // string | undefined
  theme, // string
  behavior, // string | undefined
} = props;

console.log(variants.size[size || "base"]); // "text-base" <--- inline fall back
console.log(variants.size[size || variants.size["$$"]]); // "text-base" <--- uses fall back key
console.log(variants.theme[theme]); // "text-primary-500"
console.log(variants.behavior[behavior || "$$"]); // undefined
```

### Using `Props` to type a variant object

In each example so far we got the type for our props using `VariantMap<typeof variants>`, but what if your `variants` object is defined somewhere where you can't do this? Well you can instead create your own prop types and use that as a way to build your `variants` object, basically doing the reverse:

```ts
import { type Variants } from "prop-variants";

type MyVariants = {
  theme: "primary" | "secondary";
  size?: "sm" | "base" | "lg";
};

const variants = {
  theme: {
    primary: "",
    secondary: "",
  },
  size: {
    $$: "base", // because `size` was optional, it complains when `$$` is missing or incorrect
    sm: "",
    base: "",
    lg: "",
  },
} satisfies Variants<MyVariants>; // this gives autocompletion and type safety!
```

The `Variants<T>` type takes your props and turns them back into an object. You could then use this with the `satisfies` keyword to build your `variants` object. This is useful for when your variants are actually derived from reactive values or from props, hence you can't define them outside your component.

## Examples

This shows basic examples for using `prop-variants` in JS frameworks. In a real world context, `prop-variants` goes really well with `clsx` and `tailwind-merge` if you are using tailwind.

### react

```tsx
import { FC } from "react";
import { map, type VariantProps } from "prop-variants";

const variants = {
  theme: {
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    tertiary: "text-tertiary-500",
  },
  size: {
    $$: "base",
    sm: "text-small",
    base: "text-base",
    lg: "text-lg",
  },
};

// just a shorthand for VariantMap<typeof variants> & { children?: React.ReactNode }.
type Props = VariantProps<typeof variants, { children?: React.ReactNode }>;

export const Button: FC<Props> = ({ children, ...props }) => {
  const { size, theme } = map(variants, props);
  return <button className={`${theme} ${size}`}>{children}</button>;
};
```

```tsx
<Button size="sm" />                  /* error: "theme" was not provided */
<Button theme="primary" />            /* "text-primary-500 text-base" */
<Button theme="primary" size="lg" />  /* "text-primary-500 text-lg" */
```

### svelte

```svelte
<!-- Button.svelte -->
<script lang="ts">
  import { type Snippet } from "svelte";
  import { map, type VariantProps } from "prop-variants";

  const variants = {
    theme: {
      $$: 'primary',
      primary: 'bg-primary-500 text-white',
      secondary: 'bg-secondary-500 text-white',
    },
    size: {
      $$: 'base',
      sm: 'px-2 py-1 text-sm',
      base: 'px-2.5 py-1.5 text-base',
      lg: 'px-3 py-1.5 text-lg',
    }
  }

  type Props = VariantProps<typeof variants, {
    children?: Snippet;
  }>

  const { children, ...props }: Props = $props(); // isolate the variants from the common props
  const { theme, size } = $derived(map(variants, props)); // don't forget $derived in case props change.
</script>

<button class="{theme} {size}">
  {@render children?.()}
</button>
```

```svelte
<Button size="sm" />            <!-- "bg-primary-500 text-white px-2 py-1 text-sm" -->
<Button theme="secondary" />    <!-- "bg-secondary-500 text-white px-2.5 py-1.5 text-base" -->
<Button />                      <!-- "bg-primary-500 text-white px-2.5 py-1.5 text-base" -->
```

## Good to knows

### map function doesn't need strict props

When using the map function, you do not have to explicitly make sure that the props only hold variant keys:

```tsx
const variants = {
  theme: {
    $$: 'primary',
    primary: '',
  }
};

type Props = VariantMap<typeof variants> & { notAVariant: string }

// imagine we got this from the consumer
const props: Props = {
  notAVariant: string;
}

const { theme } = map(variants, props); // still works!
```

`map()` doesn't modify the given props or variants, and won't care about any other properties.

### using multiple variant objects

It should be possible to use multiple variants in a single component:

```tsx
const fieldVariants = {
  /* ... */
};
const buttonVariants = {
  /* ... */
};

// this works as intended
type Props = VariantMap<typeof filedVariants> & VariantMap<typeof buttonVariants>;
```

and if you're using the `map` function, just do it separately:

```ts
const fieldVariantValues = map(fieldVariants, props);
const buttonVariantValues = map(buttonVariants, props);
```

Just make sure that each variant object doesn't have the same keys.
