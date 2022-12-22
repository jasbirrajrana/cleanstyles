#!/usr/bin/env node


import chalk from "chalk";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import {
  getFilesInDir,
  getUsedStyles,
  isStyleImported,
  searchForStyles,
} from "./utils.js";
import { askQuestions } from "./logger.js";

const dirname_ =
  "/Users/jasbirrana/Desktop/Jasbirrana/HRx_portal/app/containers/health-pay/components/payment-summary-drawer";

const findUnusedStyles = (dir) => {
  const styles = searchForStyles(dir);
  Object.keys(styles).forEach((stylePath) => {
    let importName;
    getFilesInDir(dir).forEach((file) => {
      if (file !== stylePath) {
        const fileContents = fs.readFileSync(file, "utf8");
        if (
          isStyleImported(
            stylePath,
            path.basename(stylePath),
            file,
            fileContents
          )
        ) {
          importName = path.basename(stylePath).split(".")[0];
        }
      }
    });

    if (importName) {
      let usedStyles;
      getFilesInDir(dir).forEach((file) => {
        if (file !== stylePath) {
          const fileContents = fs.readFileSync(file, "utf8");
          usedStyles = getUsedStyles(
            importName,
            styles[stylePath],
            fileContents
          );
        }
      });

      const unusedStyles = styles[stylePath].filter(
        (styleKey) => !usedStyles.has(styleKey)
      );

      if (unusedStyles.length > 0) {
        console.log(
          chalk.bold.italic.magentaBright(`Unused styles in ${stylePath}`)
        );
        unusedStyles.forEach((unusedStyle) => {
          console.log(chalk.bold.red(`-> styles.${unusedStyle}`));
        });
      }
    }
  });
};

const init = async () => {
  console.log(
    chalk.green(
      figlet.textSync("CLEAN IT UP", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        whitespaceBreak: false,
      })
    )
  );
  const { path } = await askQuestions();

  console.log(chalk.white.bgGreen.bold(`Your Starting Path is:${path}`));

  findUnusedStyles(path);
};

init();