const backupToAzure = require("./backupAzure");
const listDatabases = require("./listMySQLDatabases");
const moment = require("moment");
const backupMySQL = require("./backupMySQL");
const config = require("./config/config");
const Cryptr = require("cryptr");
const { deflate } = require("zlib");
const { promisify } = require("util");

const do_gzip = promisify(deflate);

(async function () {
  // Build array of database names.
  const databases = await listDatabases();

  // for each database
  for (const db of databases) {
    let fileName = `${moment().format("DD-MM-YY")}/${db}_${moment().format(
      "HH-mm"
    )}.sql`;
    console.log(`Backing up ${db}...`);
    let content;
    // backup database
    content = await backupMySQL(db);
    // check MySQL dump is not empty
    if (content != undefined) {
      content = `${content.dump.schema}\n${content.dump.data}`;

      // compress the string
      if (config.mysqlOptions.compress) {
        console.log(`Compressing ${db}...`);
        content = (await do_gzip(content)).toString("base64");
        fileName = fileName.concat(".zip");
      }

      if (config.mysqlOptions.encrypt) {
        const cryptr = new Cryptr(config.mysqlOptions.encryptKey);
        console.log(`Encrypting ${db}...`);
        content = cryptr.encrypt(content);
        fileName = fileName.concat(".enc");
      }
      // Backup to azure
      await backupToAzure(fileName, content);
    }
  }
})();
