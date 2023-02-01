const { readFileSync, writeFileSync } = require("fs");
const Cryptr = require("cryptr");
const { unzip } = require("zlib");
const { promisify } = require("util");

const do_unzip = promisify(unzip);

(async function () {
  const configFileName = "decrypt_config.json";
  const configFile = readFileSync(configFileName);
  const config = JSON.parse(configFile);

  const cryptr = new Cryptr(config.encryptKey);

  try {
    let file = readFileSync(config.inputFileName, "utf-8");

    if (config.inputFileName.includes(".enc")) {
      file = cryptr.decrypt(file);
    }

    if (config.inputFileName.includes(".zip")) {
      const fileBuffer = Buffer.from(file, "base64");
      file = (await do_unzip(fileBuffer)).toString();
    }

    writeFileSync(config.resultFileName, file);
  } catch (err) {
    console.error(err);
  }
})();
