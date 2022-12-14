#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { strContains } from "lodash-contrib";
import inquirer from "inquirer";
import { fromDir, getObjectStyleFromFile } from "./utils.js";
import { logUnusedProperty } from "./logger.js";

const questions = [
  {
    type: "input",
    name: "path",
    message: "Your starting path? (eg ./app/containers/health-pay)",
  },
];

let START_PATH;

inquirer.prompt(questions).then((answers) => {
  START_PATH = answers.path;
});

const checkAllUnusedStyle = () => {
  const values = [];
  if (!START_PATH) {
    return;
  }

  fromDir(START_PATH, "styles.ts", values);
  const styles = getUnusedStyle(values);

  if (styles.length > 0) {
    const countError = styles.reduce((sum, item) => sum + item.length, 0);
    console.log(chalk.red.bold(`\n ✖ Encontrado -->${countError} problem \n`));
    process.exit(500);
  } else {
    console.log(chalk.green.bold("All good"));
  }
};

const getUnusedStyle = (pathStyles) =>
  pathStyles
    .map((pathStyle) => {
      const data = fs.readFileSync(pathStyle, "utf-8");
      const values = getObjectStyleFromFile(data);
      if (!values) {
        return;
      }

      const styles = values.map((item) => `styles.${item}`);

      const currentStyleDir = path.dirname(pathStyle);

      const filesInCwd = fs.readdirSync(currentStyleDir);

      let correspondingIndexFilePath;

      if (
        filesInCwd.indexOf("styles.ts") !== -1 &&
        filesInCwd.indexOf("index.tsx") !== -1
      ) {
        correspondingIndexFilePath = pathStyle.replace(
          "styles.ts",
          "index.tsx"
        );
      }

      if (
        filesInCwd.indexOf("styles.js") !== -1 &&
        filesInCwd.indexOf("index.js") !== -1
      ) {
        correspondingIndexFilePath = pathStyle.replace(
          "styles.ts",
          "index.tsx"
        );
      }

      if (correspondingIndexFilePath) {
        const indexData = fs.readFileSync(correspondingIndexFilePath, "utf-8");
        let unusedStyles = styles.map((item) =>
          indexData.indexOf(item) === -1 ? item : null
        );
        unusedStyles = removeNullFromAray(unusedStyles);

        console.log(
          chalk.red.bold(
            `\n -> ${correspondingIndexFilePath} (${unusedStyles?.length}) \n`
          )
        );
        unusedStyles.forEach((item) => {
          logUnusedProperty(item);
        });
        return unusedStyles;
      }
      return null;
    })
    .filter((item) => item);

checkAllUnusedStyle();
