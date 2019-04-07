import flattenLayers from "lib/flattenLayers"

export default (document, layerName) => {
  return flattenLayers(document).find(({name}) => name === layerName)
}