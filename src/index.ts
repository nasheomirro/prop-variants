export type AnyObject = Record<string, any>;
export type VariantGroup = Record<string, AnyObject>;

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
 * Takes the keys that could be undefined from the given `T`.
 */
export type GetOptionalKeys<T extends AnyObject, K extends keyof T = keyof T> = K extends any
  ? undefined extends T[K]
    ? K
    : never
  : never;

/**
 * From `T`, tries it's best to determine which are variants and returns a variant group based on it.
 *
 * Always use the `satisfies` keyword instead of directly typing or asserting this to your object.
 */
export type ToVariants<T extends AnyObject> = {
  [K in GetVariantKeys<T>]-?: {
    [L in Exclude<T[K], undefined>]: any;
  };
};

/**
 * Constructs a set of key-value pairs using the structure of `T`.
 *
 * Because we don't have an intrinsic way to tell which variant is optional,
 * you could instead provide a list of variants you want to be optional.
 */
export type ToKeyMap<T extends VariantGroup, Optional extends keyof T = never> = {
  [K in Exclude<keyof T, Optional>]: keyof T[K];
} & ([Optional] extends [keyof T] ? { [K in Optional]?: keyof T[K] | undefined } : {});

/**
 * Like `ToKeyMap` but instead of giving keys for each variant, it gives you the values that they might have.
 *
 * Because we don't have an intrinsic way to tell which variant is optional,
 * you could instead provide a list of variants you want to be optional.
 */
export type ToValueMap<T extends VariantGroup, Optional extends keyof T = never> = {
  [K in Exclude<keyof T, Optional | undefined>]: T[K][keyof T[K]];
} & ([Optional] extends [keyof T] ? { [K in Exclude<Optional, undefined>]: T[K][keyof T[K]] | undefined } : {});

/**
 * Like `ToValueMap`, it grabs all the value types of all the variants, and spits them out as an array.
 *
 * Because we don't have an intrinsic way to tell if a variant is optional,
 * you could instead provide a boolean to say that "yes some variants are optional".
 */
export type ToValueArray<T extends VariantGroup, IsOptional extends true = never> = keyof T extends infer K
  ? K extends keyof T
    ? (T[K][keyof T[K]] | (true extends IsOptional ? undefined : never))[]
    : never
  : never;
