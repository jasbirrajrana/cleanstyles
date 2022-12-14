import path from "path";
import fs from "fs";

const TAG_START = "{";
const TAG_END = "}";
const TAG_IGNORE = "//check-style disable";

export const fromDir = (startPath, filter, values) => {
  if (startPath.indexOf("node_modules") >= 0 || !fs.existsSync(startPath)) {
    return;
  }

  const files = fs.readdirSync(startPath);

  for (let index = 0; index < files.length; index++) {
    const filename = path.join(startPath, files[index]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, values);
    } else if (filename.indexOf(filter) >= 0) {
      values.push(filename);
    }
  }
};

export const getObjectStyleFromFile = (file) => {
  if (file.includes(TAG_IGNORE)) {
    return [];
  }

  let valueWithoutHeader;

  if (file.indexOf("export const styles = ") !== -1) {
    valueWithoutHeader = file
      .slice(file.indexOf("export const styles = ") + 21)
      .replace(/;/g, "")
      .replace(/ /g, "");
  }

  if (file.indexOf("export default") !== -1) {
    valueWithoutHeader = file
      .slice(file.indexOf("export default") + 14)
      .replace(/;/g, "")
      .replace(/ /g, "");
  }

  valueWithoutHeader = valueWithoutHeader.slice(
    0,
    valueWithoutHeader.lastIndexOf("}")
  );

  let index = null;
  const gotIndex = [];

  for (let i = valueWithoutHeader.length; i > 0; i--) {
    const letter = valueWithoutHeader[i - 1];
    if (letter === TAG_START) {
      if (index) {
        if (gotIndex.length > 0) {
          gotIndex.pop();
        } else {
          const value = valueWithoutHeader.substring(i - 2, index);
          valueWithoutHeader = valueWithoutHeader.replace(value, "");
          index = null;
        }
      }
    } else if (letter === TAG_END) {
      if (index) {
        gotIndex.push(i);
      } else {
        index = i;
      }
    }
  }

  let stringObject = valueWithoutHeader.replace(/\r?\n|\r/g, "");

  if (stringObject && stringObject[stringObject.length - 1] === ",") {
    stringObject = stringObject.substring(0, stringObject.length - 1);
  }

  return stringObject.split(",");
};

export const removeNullFromAray = (array) => {
  return array.filter((ele) => ele !== null);
};
