declare global {
  interface ObjectConstructor {
    rmUndef<T>(obj: T): T;
  }
}

Object.rmUndef = function <T>(obj: T): T {
  const res = obj as any;
  for (const key of Object.keys(res)) {
    if (res[key] === undefined) {
      delete res[key];
    }
  }
  return res;
};

export {};
