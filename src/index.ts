type Map = {
  [k: string]: {
    [k: string]: any;
  };
};

type DefaultKeys<T extends Map, K extends keyof T = keyof T> = K extends any ? ("$" extends keyof T[K] ? K : never) : never;

type RequiredKeys<T extends Map> = Exclude<keyof T, DefaultKeys<T>>;

export type OptionProps<T extends Map, P extends any> = P & {
  [K in DefaultKeys<T>]?: Exclude<keyof T[K], "$">;
} & {
  [K in RequiredKeys<T>]: keyof T[K];
};

export function choose<T extends Map>(options: T, props: any): { [K in keyof T]: T[K] } {
  let _props: any = {};

  for (let key of Object.keys(options)) {
    const fallback = options[key]["$"];
    if (Object.hasOwn(props, key)) {
      _props[key] = options[key][props[key]];
    } else if (typeof fallback !== "undefined") {
      _props[key] = fallback;
    } else {
      throw new Error(`value for ${key} has not been provided and does not have a fallback`);
    }
  }

  return _props;
}
