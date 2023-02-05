const backupToAzure = require("./backupAzure");
const listDatabases = require("./listMySQLDatabases");
const moment = require("moment");
const backupMySQL = require("./backupMySQL");
const config = require("./config/config");
const Cryptr = require("cryptr");
const { deflate } = require("zlib");
const { promisify } = require("util");

const do_deflate = promisify(deflate);

(async function () {
  const databases = await listDatabases();
  for (const db of databases) {
    try {
      let fileName = `${moment().format("DD-MM-YY")}/${db}_${moment().format(
        "HH-mm"
      )}.sql`;
      console.log(`Backing up db '${db}'...`);
      let content;

      content = await backupMySQL(db);
      if (content != undefined) {
        content = `${content.dump.schema}\n${content.dump.data}`;

        if (config.mysqlOptions.compress) {
          console.log(`Compressing ${db}...`);
          content = (await do_deflate(content)).toString("base64");
          fileName = fileName.concat(".zip");
        }

        if (config.mysqlOptions.encrypt) {
          const cryptr = new Cryptr(config.mysqlOptions.encryptKey);
          console.log(`Encrypting ${db}...`);
          content = cryptr.encrypt(content);
          fileName = fileName.concat(".enc");
        }

        await backupToAzure(fileName, content);
      }
    } catch (error) {
      console.error(`Failed to backup db '${db}'`);
      console.error(error);
    }
  }
})();
