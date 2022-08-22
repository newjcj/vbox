const path = require('path')
// const { moveObject } = require('./webpackScript/moveObject');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'electron-main',
  // devtool: 'inline-source-map',// 快速找到代码报错的文件和行数（帮助我们bug定位）
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js'
  },
  plugins: [
    new CopyWebpackPlugin([ 
        {
          from: path.resolve(__dirname, './settings'),
          to: path.resolve(__dirname, './build/settings')
        }
     ])
  ],
  mode: "production",
  node: {
    __dirname: false
  }
}