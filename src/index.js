import getLayerByName from "lib/getLayerByName"
import pixmapToPng from "lib/pixmapToPng"

const main = (generator, config) => {
  let currentDocumentId
  let prefewLayerId
  generator.onPhotoshopEvent("currentDocumentChanged", async documentId => {
    const document = await generator.getDocumentInfo(documentId, {layerInfo: true})
    currentDocumentId = documentId
    prefewLayerId = getLayerByName(document, "prefew")?.id
  })
  generator.onPhotoshopEvent("documentChanged", async () => {
    if (!prefewLayerId) {
      return
    }
    const start = Number(new Date)
    const pixmap = await generator.getPixmap(currentDocumentId, prefewLayerId, {
      clipToDocumentBounds: true,
      allowDither: true,
      maxDimension: 320,
    })
    const end = Number(new Date)
    console.log(`Rendered Pixmap in ${end - start} ms`)
    const png = pixmapToPng(pixmap)
    debugger
  })
}

export const init = (generator, config) => process.nextTick(() => main(generator, config))