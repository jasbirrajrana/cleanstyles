import chalk from "chalk";
import { strContains } from "lodash-contrib";
export const logUnusedProperty = (item) => {
  if (item) {
    if (strContains(item, "create")) {
      const splitedUnusedStyle = item?.split(".create({");
      console.log(
        chalk.bold.underline(
          `   -> styles.${splitedUnusedStyle[splitedUnusedStyle?.length - 1]}`
        )
      );
    } else {
      console.log(chalk.bold.underline(`   -> ${item}`));
    }
  }
};
