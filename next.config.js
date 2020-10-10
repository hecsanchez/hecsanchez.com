const withImages = require('next-images')

module.exports = withImages({
    target: 'serverless',
    webpack: function (config) {
      config.module.rules.push({test:  /\.md$/, use: 'raw-loader'})
      return config
    }
  })