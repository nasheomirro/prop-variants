type Variants = { [k: string]: { [k: string]: any } };

type DefaultKeys<T extends Variants, K extends keyof T = keyof T> = K extends any ? ("$" extends keyof T[K] ? K : never) : never;
type RequiredKeys<T extends Variants> = Exclude<keyof T, DefaultKeys<T>>;

export type MapWith<T extends Variants> = {
  [K in DefaultKeys<T>]?: Exclude<keyof T[K], "$">;
} & {
  [K in RequiredKeys<T>]: keyof T[K];
};

export type PropsMap<T extends Variants, P extends any> = P & MapWith<T>;

export function map<T extends Variants>(options: T, props: any): { [K in keyof T]: T[K][Exclude<keyof T[K], "$">] } {
  let _props: any = {};
  for (let key of Object.keys(options)) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      // if props has a key, use that key to determine which value should be mapped
      _props[key] = options[key][props[key]];
    } else if (Object.prototype.hasOwnProperty.call(options[key], "$")) {
      // if props doesn't have it, use the fallback key in '$'
      const fbKey = options[key]["$"];
      _props[key] = options[fbKey];
    } else {
      // if props does not hold the key and no fallback was found, throw an error
      throw new Error(`value for ${key} has not been provided and does not have a fallback`);
    }
  }

  return _props;
}
