import {PNG} from "pngjs"

import normalizePixmapBuffer from "./normalizePixmapBuffer"

export default pixmap => {
  const png = new PNG({
    bitDepth: pixmap.bitsPerChannel,
    width: pixmap.width,
    height: pixmap.height,
    inputHasAlpha: true,
    deflateLevel: 0,
  })
  png.data = pixmap |> normalizePixmapBuffer
  return PNG.sync.write(png)
}