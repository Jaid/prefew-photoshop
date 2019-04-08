import getLayerByName from "lib/getLayerByName"
import pixmapToPng from "lib/pixmapToPng"
import socketIoClient from "socket.io-client"
import arraybufferEqual from "arraybuffer-equal"

const port = 40666

const main = async (generator, config) => {
  console.log(`Connecting to localhost:${port}`)
  const socketClient = socketIoClient(`ws://localhost:${port}`, {
    query: {
      mode: "provider",
    },
  })
  socketClient.on("connect", async () => {
    let currentDocument
    let previousBuffer
    console.log("Connected")
    const updatePrefewLayer = async documentId => {
      const document = await generator.getDocumentInfo(documentId, {
        compInfo: false,
        imageInfo: false,
        layerInfo: true,
        expandSmartObjects: false,
        getTextStyles: false,
        getFullTextStyles: false,
        selectedLayers: false,
        getCompLayerSettings: false,
        getDefaultLayerFX: false,
        getPathData: false,
      })
      console.log(`Fetched layer info for document ${document.id}`)
      const prefewLayer = getLayerByName(document, "prefew")
      if (prefewLayer) {
        console.log(`Found layer "prefew" with id ${prefewLayer.id}`)
        return {
          id: document.id,
          prefewLayer: prefewLayer.id,
        }
      } else {
        return {
          id: document.id,
        }
      }
    }
    const sendImageToPrefew = async () => {
      const documentId = currentDocument.id
      const layerId = currentDocument.prefewLayer
      console.log(`Render pixmap from layer ${layerId} of document ${documentId}`)
      try {
        const start = Number(new Date)
        const pixmap = await generator.getPixmap(documentId, layerId, {
          clipToDocumentBounds: true,
          allowDither: true,
          maxDimension: 320,
        })
        if (previousBuffer && arraybufferEqual(previousBuffer, pixmap.pixels)) {
          console.log("Nothing seems to have changed. Skipping.")
          return
        }
        previousBuffer = pixmap.pixels
        const pngBuffer = pixmapToPng(pixmap)
        const end = Number(new Date)
        console.log(`Rendered Pixmap in ${end - start} ms`)
        socketClient.emit("updateImage", {
          buffer: pngBuffer,
          codec: "png",
          name: "photoshop",
          forcedOptions: {
            skipTrimming: true,
          },
        })
      } catch (error) {
        console.error(error)
        debugger
      }
    }
    generator.onPhotoshopEvent("currentDocumentChanged", async () => {
      currentDocument = await updatePrefewLayer()
    })
    generator.onPhotoshopEvent("documentChanged", () => {
      console.log("Document changed!")
      if (currentDocument.prefewLayer) {
        sendImageToPrefew()
      }
    })
    currentDocument = await updatePrefewLayer()
    sendImageToPrefew()
  })
  socketClient.on("disconnect", async () => {
    generator.removeAllListeners()
  })
}

export const init = (generator, config) => process.nextTick(() => main(generator, config))