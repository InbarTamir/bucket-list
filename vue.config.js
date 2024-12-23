module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/bucket-list/' : '/',
  outputDir: 'docs',
  transpileDependencies: true
}
