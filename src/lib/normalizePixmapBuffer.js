export default pixmap => {
  const input = pixmap.pixels
  const size = input.length
  const output = Buffer.allocUnsafe(size)
  for (let i = 0; i < size; i += 4) {
    output[i] = input[i + 1] // output[Red]
    output[i + 1] = input[i + 2] // output[Green]
    output[i + 2] = input[i + 3] // output[Blue]
    output[i + 3] = input[i] // output[Alpha]
  }
  return output
}