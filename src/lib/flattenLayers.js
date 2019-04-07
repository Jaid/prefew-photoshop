import {isArray} from "lodash"

/* eslint-disable unicorn/no-fn-reference-in-iterator */

const flatten = (reduced, value) => {
  reduced.push(value)
  if (isArray(value.layers)) {
    reduced = [...reduced, ...value.layers.reduce(flatten, [])]
  }
  return reduced
}

export default document => {
  if (!isArray(document?.layers)) {
    return []
  }
  return document.layers.reduce(flatten, [])
}