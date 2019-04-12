import getLayerByName from "lib/getLayerByName"
import pixmapToPng from "lib/pixmapToPng"
import socketIoClient from "socket.io-client"

const port = 40666

const main = async generator => {
  console.log(`Connecting to localhost:${port}`)
  const socketClient = socketIoClient(`ws://localhost:${port}`, {
    query: {
      mode: "provider",
    },
  })
  socketClient.on("connect", async () => {
    let previousBuffer
    console.log("Connected")
    const sendImageToPrefew = async () => {
      const findLayerStart = Number(new Date)
      const document = await generator.getDocumentInfo(undefined, {
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
      const prefewLayer = getLayerByName(document, "prefew")
      if (!prefewLayer) {
        console.log("Skipping. No layer named \"prefew\" found.")
        return
      }
      const findLayerEnd = Number(new Date)
      console.log(`Found prefew layer with id ${prefewLayer.id} on document ${document.id} in ${findLayerEnd - findLayerStart} ms`)
      const renderStart = Number(new Date)
      const pixmap = await generator.getPixmap(document.id, prefewLayer.id, {
        allowDither: true,
        maxDimension: 1080,
        clipToDocumentBounds: true,
      })
      const pngBuffer = pixmapToPng(pixmap)
      if (previousBuffer?.equals(pngBuffer)) {
        console.log("Nothing seems to have changed. Skipping.")
        return
      }
      previousBuffer = pngBuffer
      const renderEnd = Number(new Date)
      console.log(`Rendered Pixmap in ${renderEnd - renderStart} ms`)
      socketClient.emit("updateImage", {
        buffer: pngBuffer,
        codec: "png",
        name: "photoshop",
        forcedOptions: {
          skipTrimming: true,
        },
      })
    }
    generator.onPhotoshopEvent("imageChanged", () => {
      sendImageToPrefew()
    })
    await sendImageToPrefew()
  })
  socketClient.on("disconnect", async () => {
    generator.removeAllListeners()
  })
}

export const init = (generator, config) => process.nextTick(() => main(generator, config))