const document = app.activeDocument
const sampler = document.colorSamplers.add([
  new UnitValue(1, "px"),
  new UnitValue(1, "px"),
])
alert(sampler.color.rgb.blue)