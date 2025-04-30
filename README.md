# prop-variants

Organize your "variant-like" props a little cleaner.

- ✅ No runtime shenanigans
- ✅ Flexible APIs
- ✅ Framework agnostic
- 🗺️ Optional utility for easier mapping

## How to Use

The root of all this is creating the type for the props depending on your variants:

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

The `VariantMap` type above accepts a variant object and spits out each variant groups' keys. The variant groups in this context are `variants.theme` and `variants.size`, and a variant object just means an object which holds variant groups (the object is `variants` in this case).

### Creating Optional Props

Notice how the `size` above was actually optional? Well that's because in a variant group we can specify a fallback key using `"$$"`:

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

If the `"$$"` is present in a variant group, it means that the variant will default to the specified key. In this case, the default for the variant group `size` is `base`. Note that right now this is all just typings, we do offer a utility function to help map the props into values but if you don't use that then you'll have to make this work manually.

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

So far, we only talked about how `VariantMap` makes your variant object into prop types. Now lets see how we can convert the given props to their actual values. And how we'll do that is through the `map` fn:

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

The `map` fn takes your variants and uses your props as a "map" to then spit out the correctly typed variant values. It also uses the default `"$$"` if a variant isn't present, and if `"$$"` is null, it spits out `undefined`.

### Not using the map function

The map function is called at runtime and some people understandably will not like that. However, the map function isn't the primary  focus of the package but instead it's its types. You shouldn't have any trouble manually mapping the variants, and the whole process should be type-safe:

```ts
// imagine we got this from the consumer
const props: VariantMap<typeof variants> = {
  theme: "primary",
};

// Remember, `size` and `behavior` won't cause type errors because
// in the proper context, props is of type `VariantProps<...>`
const { size, theme, behavior } = props;

console.log(variants.size[size || "base"]); // "text-base" <--- inline substitute
console.log(variants.size[size || variants.size["$$"]]); // "text-base" <--- uses fall back key
console.log(variants.theme[theme]); // "text-primary-500"
console.log(variants.behavior[behavior || "$$"]); // undefined
```

For any defaults, just use the wanted default key directly like the first example for `variants.size` above. for no defaults but still optional you can set `"$$"` to `undefined` and use that key instead like `variants.behavior` above.

### Using `Props` to type a variant object

In each example so far we got the type for our props using `VariantMap<typeof variants>`, but what if your `variants` object is defined somewhere where you can't do this? At this point, you can instead create your own prop types and use that as a way to build your `variants` object, essentially reversing the process:

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
    $$: "base", // because variant group was a partial, it complains when `$$` is missing or incorrect
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
