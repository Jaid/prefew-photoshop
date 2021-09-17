import {configureGeneratorCorePlugin} from "webpack-config-jaid"

export default configureGeneratorCorePlugin({
  configOutput: true,
  publishimo: {
    fetchGithub: true,
  },
})