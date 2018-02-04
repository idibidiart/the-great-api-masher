export interface Context {
  request: any
}

// _.defaults()
export const mergeObjects = (object, ...sources) => {
  object = Object(object)
  sources.forEach((source) => {
    if (source != null) {
      source = Object(source)
      for (const key in source) {
        const value = object[key]
        if (value === undefined ||
            (value === Object.prototype[key] && !Object.hasOwnProperty.call(object, key))) {
          object[key] = source[key]
        }
      }
    }
  })
  return object
}