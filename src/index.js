import getLayerByName from "lib/getLayerByName"

const main = (generator, config) => {
  let currentDocumentId
  let prefewLayerId
  generator.onPhotoshopEvent("currentDocumentChanged", async documentId => {
    const document = await generator.getDocumentInfo(documentId)
    currentDocumentId = documentId
    prefewLayerId = getLayerByName(document, "prefew")?.id
  })
  generator.onPhotoshopEvent("imageChanged", async () => {
    if (!prefewLayerId) {
      return
    }
    const start = Number(new Date)
    const pixmap = await generator.getPixmap(currentDocumentId, prefewLayerId, {})
    const end = Number(new Date)
    console.log(`Rendered Pixmap in ${end - start} ms`)
  })
}

export const init = (generator, config) => process.nextTick(() => main(generator, config))