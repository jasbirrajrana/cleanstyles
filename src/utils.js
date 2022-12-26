import path from "path";
import fs from "fs";
export const getFilesInDir = (dir) => {
  const files = [];
  fs.readdirSync(dir).forEach((file) => {
    if (file !== ".DS_Store") {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        files.push(...getFilesInDir(filePath));
      } else {
        files.push(filePath);
      }
    }
  });
  return files;
};

export const extractStyleObject = (data) => {
  const temp = data.split("StyleSheet.create({")?.[1]?.split("});")?.[0];
  const keys = temp.split(": {").map((text) => {
    const k = text.split(" ");
    const t = text.split(",");
    if (t.length) {
      const l = t[t.length - 2];
      if (l && !l?.includes?.("}")) return undefined;
    }
    return k[k.length - 1];
  });
  return keys.filter((s) => !!s).slice(0, -1);
};

export const searchForStyles = (pathString) => {
  let styles = {};
  const files = fs.readdirSync(pathString);
  files.forEach((file) => {
    if (file.startsWith(".")) {
      return;
    }
    const filePath = path.resolve(pathString, file);
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (isDir) {
      styles = { ...styles, ...searchForStyles(filePath) };
    } else {
      const fileContents = fs.readFileSync(filePath, {
        encoding: "utf8",
        flag: "r",
      });
      if (fileContents.includes("StyleSheet.create({")) {
        styles[filePath] = extractStyleObject(fileContents);
      }
    }
  });
  return styles;
};

export const isStyleImported = (
  stylePath,
  styleName,
  filePath,
  fileContents
) => {
  const styleExtension = `.${styleName.split(".")[1]}`;
  const importStatements =
    fileContents.match(/import\s.+from\s(?:'|")(.+)(?:'|");/g) || [];
    for (const statement of importStatements) {
      let importPath = statement.split("from")[1].trim().slice(1, -2);
      if (!path.isAbsolute(importPath)) {
        importPath = path.join(path.dirname(filePath), importPath);
      }
      if (importPath + styleExtension === stylePath) {
        return true;
    }
  }
  return false;
};

export const getUsedStyles = (importName, styleKeys, fileContents) => {
  const usedStyles = new Set();
  const temp = styleKeys.filter((key) => {
    return fileContents.includes(`${importName}.${key}`);
  });
  for (const key of temp) {
    usedStyles.add(key);
  }

  return usedStyles;
};