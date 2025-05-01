export type AnyObject = { [K: string]: any };
export type VariantGroup = { [K: string]: AnyObject };

/**
 * Checks if type is an actual string instance `(ex. "foo" | "bar" | "baz")` and not just `string`.
 */
type IsStringInstance<T, K> = [T] extends [string] ? (string extends T ? never : K) : never;

/**
 * Determines the keys that are valid to be used in constructing variant groups
 */
type GetVariantKeys<T extends AnyObject, K extends keyof T = keyof T> = K extends any
  ? IsStringInstance<Exclude<T[K], undefined>, K>
  : never;

/**
 * Returns only the list of variants that have a default key
 */
type GetVariantsWithDef<T extends VariantGroup, D extends string, K extends keyof T = keyof T> = K extends any
  ? D extends keyof T[K]
    ? K
    : never
  : never;

/**
 * Returns only the list of variants that have a default key that is `null` or `undefined`
 */
type GetVariantsWithDefNull<T extends VariantGroup, D extends string, K extends keyof T = keyof T> = K extends any
  ? D extends keyof T[K]
    ? T[K][D] extends null | undefined
      ? K
      : never
    : never
  : never;

/**
 * From `T`, tries it's best to determine which are variants and returns a variant group based on it.
 *
 * Always use the `satisfies` keyword instead of directly typing or asserting this to your object.
 */
export type ToVariants<T extends AnyObject, D extends string = "$def"> = {
  [K in GetVariantKeys<T>]-?: {
    [L in Exclude<T[K], undefined>]: any;
  } & (undefined extends T[K]
    ? {
        [L in D]?: T[K] | undefined | null;
      }
    : {});
};

/**
 * Constructs a set of key-value pairs using the structure of `T`.
 *
 * You must be explicit with your use of `D` in `T` to correctly signal that the key should be optional.
 */
export type ToKeyMap<T extends VariantGroup, D extends string = "$def"> = {
  [L in GetVariantsWithDef<T, D>]?: Exclude<keyof T[L], D>;
} & {
  [L in Exclude<keyof T, GetVariantsWithDef<T, D>>]: Exclude<keyof T[L], D>;
};

/**
 * Like `ToKeyMap` but instead of giving keys for each variant, it gives you the values that they might have.
 */
export type ToValueMap<T extends VariantGroup, D extends string = "$def"> = {
  [K in keyof T]: T[K][Exclude<keyof T[K], D>] | (K extends GetVariantsWithDef<T, D> ? undefined : never);
};

/**
 * Like `ToValueMap` but the values assume that default key would be used if value could be `undefined`, if
 * default is null, it remains `undefined`.
 */
export type ToCompedValueMap<T extends VariantGroup, D extends string = "$def"> = {
  [K in keyof T]: T[K][Exclude<keyof T[K], D>] | (K extends GetVariantsWithDefNull<T, D> ? undefined : never);
};

/**
 * From `T`, tries it's best to determine which are variants and returns a variant group based on it. Does not have
 * default keys.
 *
 * Always use the `satisfies` keyword instead of directly typing or asserting this to your object.
 */
export type ToBasicVariants<T extends AnyObject> = {
  [K in GetVariantKeys<T>]-?: {
    [L in Exclude<T[K], undefined>]: any;
  };
};

/**
 * Constructs a set of key-value pairs using the structure of `T`.
 *
 * Because we don't use default keys, you could instead provide a list of variants you want to be optional.
 */
export type ToBasicKeyMap<T extends VariantGroup, Optional extends keyof T = never> = {
  [K in Exclude<keyof T, Optional>]: keyof T[K];
} & (Optional extends keyof T ? { [K in Optional]?: keyof T[K] | undefined } : never);

/**
 * Like `ToKeyMap` but instead of giving keys for each variant, it gives you the values that they might have.
 *
 * Because we don't use default keys, you could instead provide a list of variants that could be `undefined`
 */
export type ToBasicValueMap<T extends VariantGroup, Optional extends keyof T = never> = {
  [K in Exclude<keyof T, Optional>]: T[K][keyof T[K]];
} & (Optional extends keyof T ? { [K in Optional]: T[K][keyof T[K]] | undefined } : never);