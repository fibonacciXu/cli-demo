#!/usr/bin/env node
"use strict";
const program = require("commander");
const utils = require("../utils/index");
const inquirer = require("../src/inquirer");
const create = require("../src/create");

const { green, yellow, blue } = utils;

/* mycli create 创建项目 */
program
  .command("create")
  .description("create a project ")
  .action(function () {
    green("👽 👽 👽 " + "欢迎使用mycli,轻松构建react ts项目～🎉🎉🎉");
    inquirer.create().then((res) => {
      if (res.conf) {
        // create(res);
        console.log('====', res);
         if (res.conf) {
           /* 创建文件 */
           create(res);
         }
      }
    });
  });

/* mycli start 运行项目 */
program
  .command("start")
  .description("start a project")
  .action(function () {
    green("--------运行项目-------");
  });

/* mycli build 打包项目 */
program
  .command("build")
  .description("build a project")
  .action(function () {
    green("--------构建项目-------");
  });

program.parse(process.argv);
