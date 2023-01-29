const mysqldump = require("mysqldump");
module.exports = async function (database) {
  try {
    return await mysqldump({
      connection: {
        database: database,
        ...require("./config/config.js").mysql,
      },
      dump: {
        schema: {
          table: {
            dropIfExist: true,
          },
        },
        data: {
          maxRowsPerInsertStatement: 100,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
};
