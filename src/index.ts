type VariantGroup = { [k: string]: any };
type VariantObj = { [k: string]: VariantGroup };

/** Spits out the keys that have fallbacks */
type FallbackKey<T extends VariantObj, K extends keyof T = keyof T> = K extends any ? ("$$" extends keyof T[K] ? K : never) : never;

/** Removes any key that has a fallback */
type RequiredKeys<T extends VariantObj> = Exclude<keyof T, FallbackKey<T>>;

/** Returns undefined if fallback of `VariantGroup` is null */
type FallbackNull<T extends VariantGroup> = "$$" extends keyof T ? (T["$$"] extends null | undefined ? undefined : never) : never;

/**
 * Converts a variant map back to it's variant object representation.
 *
 * Note that if you wish to type an object with
 * `Variants<T>`, you should do so using the `satisfies` keyword. This is because `Variants<T>` does not save the
 * variant values' types.
 */
export type Variants<T extends { [k: string]: string }> = {
  [K in keyof T]-?: {
    [L in Exclude<T[K], undefined> | (undefined extends T[K] ? "$$" : never)]: L extends "$$" ? T[K] | undefined | null : any;
  };
};

/** Converts variant objects into their prop counterparts */
export type VariantMap<T extends VariantObj> = { [K in FallbackKey<T>]?: Exclude<keyof T[K], "$$"> } & {
  [K in RequiredKeys<T>]: keyof T[K];
};

/** Converts variant objects into their prop counterparts */
export type VariantProps<T extends VariantObj, P extends any> = P & VariantMap<T>;

/** Gives the mapping of values from a variant object */
export type VariantValueMap<T extends VariantObj> = { [K in keyof T]: T[K][Exclude<keyof T[K], "$$">] | FallbackNull<T[K]> };

/** uses `props` which contains a mapping of variants to spit out the correct value for the given variant */
export function map<T extends VariantObj, P extends VariantMap<T>>(options: T, props: P): VariantValueMap<T>;
export function map<T extends VariantObj, P extends { [K: string]: any }>(options: T, props: P): VariantValueMap<T> {
  let _props: any = {};
  for (let key of Object.keys(options)) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      // if props has a key, use that key to determine which value should be mapped
      _props[key] = options[key][props[key]];
    } else if (Object.prototype.hasOwnProperty.call(options[key], "$$")) {
      // if props doesn't have it, use the fallback key in '$$'
      const fbKey = options[key]["$$"];
      _props[key] = options[key][fbKey];
    } else {
      // if props does not hold the key and no fallback was found, throw an error
      throw new Error(`value for $${key} has not been provided and does not have a fallback`);
    }
  }

  return _props;
}
