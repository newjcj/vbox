/** 22 */
const fs = require("fs");
const path = require("path");
class moveObject {
  apply(compiler) {
    console.log("=======start")
    // emit 是异步 hook，使用 tapAsync 触及它，还可以使用 tapPromise/tap(同步)
    compiler.hooks.emit.tap("moveObject Plugin", (compilation) => {
      // const outputPath = compiler.path || compilation.options.output.path;
      // const versionFile = outputPath + "/version.json";
      // const content = `{"version": "${version}"}`;
      const objectPath = path.resolve(__dirname, '../setting');
      const destPath = path.resolve(__dirname, '../build/setting');

      /** 如果路径存在则返回 true，否则返回 false。 */
      if (!fs.existsSync(objectPath)) {
        fs.rename(objectPath,destPath,re=>{
          console.log(re)
        })
      }

      // // http://nodejs.cn/api-v14/fs.html#fs_fs_writefilesync_file_data_options
      // fs.writeFileSync(versionFile, content, {
      //   encoding: "utf8",
      //   flag: "w",
      // });
    });
  }
}

module.exports = { moveObject };