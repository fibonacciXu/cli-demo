const utils = require("../utils/index");
const fs = require("fs");
const npm = require("./install");

const { green, yellow, blue } = utils;
let fileCount = 0; /* 文件数量 */
let dirCount = 0; /* 文件夹数量 */
let flat = 0; /* readir数量 */
let isInstall = false;

module.exports = function (res) {
  /* 创建文件 */
  green("------开始构建-------");
  /* 找到template文件夹下的模版项目 */
  const sourcePath = __dirname.slice(0, -3) + "template";
  blue("当前路径:" + process.cwd());
  // /* 修改package.json*/
  revisePackageJson(res, sourcePath).then(() => {
    copy(sourcePath, process.cwd(), npm());
  });
};

/**
 *
 * @param {*} sourcePath   //template资源路径
 * @param {*} currentPath  //当前项目路径
 * @param {*} cb           //项目复制完成回调函数
 */
function copy(sourcePath, currentPath, cb) {
  flat++;
  /* 读取文件夹下面的文件 */
  fs.readdir(sourcePath, (err, paths) => {
    flat--;
    if (err) {
      throw err;
    }
    console.log("paths", paths);
    paths.forEach((path) => {
      if (path !== ".git" && path !== "package.json") fileCount++;
      const newSoucePath = sourcePath + "/" + path;
      const newCurrentPath = currentPath + "/" + path;
      console.log("====", newSoucePath, newCurrentPath);
      /* 判断文件信息 */
      fs.stat(newSoucePath, (err, stat) => {
        if (err) {
          throw err;
        }
        console.log("----", stat.isFile());
        /* 判断是文件，且不是 package.json  */
        if (stat.isFile() && path !== "package.json") {
          /* 创建读写流 */
          const readSteam = fs.createReadStream(newSoucePath);
          const writeSteam = fs.createWriteStream(newCurrentPath);
          readSteam.pipe(writeSteam);
          green("创建文件：" + newCurrentPath);
          fileCount--;
          completeControl(cb);
          /* 判断是文件夹，对文件夹单独进行 dirExist 操作 */
        } else if (stat.isDirectory()) {
          if (path !== ".git" && path !== "package.json") {
            dirCount++;
            dirExist(newSoucePath, newCurrentPath, copy, cb);
          }
        }
      });
    });
  });
}

function completeControl(cb) {
  if (fileCount === 0 && dirCount === 0 && flat === 0) {
    green("------构建完成-------");
    if (cb && !isInstall) {
      isInstall = true;
      blue("-----开始install-----");
      cb(() => {
        blue("-----完成install-----");
        /* 判断是否存在webpack  */
        runProject();
      });
    }
  }
}

function runProject() {
  try {
    const doing = npm(["start"]);
    doing();
  } catch (e) {
    red("自动启动失败，请手动npm start 启动项目");
  }
}

/**
 * 
 * @param {*} sourcePath  //template资源路径
 * @param {*} currentPath  //当前项目路径
 * @param {*} copyCallback  // 上面的 copy 函数
 * @param {*} cb    //项目复制完成回调函数 
 */
function dirExist(sourcePath, currentPath, copyCallback, cb) {
  fs.exists(currentPath, (ext) => {
    if (ext) {
      /* 递归调用copy函数 */
      copyCallback(sourcePath, currentPath, cb);
    } else {
      fs.mkdir(currentPath, () => {
        fileCount--;
        dirCount--;
        copyCallback(sourcePath, currentPath, cb);
        yellow("创建文件夹：" + currentPath);
        completeControl(cb);
      });
    }
  });
}

function revisePackageJson(res, sourcePath) {
  return new Promise((resolve) => {
    fs.readFile(sourcePath + "/package.json", (err, data) => {
      if (err) throw err;
      const { author, name } = res;
      console.log("data.toString()", data.toString());
      let json = data.toString();
      json = json.replace(/demoName/g, name.trim());
      json = json.replace(/demoAuthor/g, author.trim());
      const path = process.cwd() + "/package.json";
      fs.writeFile(path, new Buffer(json), () => {
        utils.green("创建文件：" + path);
        resolve();
      });
    });
  });
}
