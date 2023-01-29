module.exports = async function () {
  const { Client } = require("@mysql.js/mysql");

  const client = new Client({ ...require("./config/config.js").mysql });
  const { results } = await client.query("show databases");
  await client.end();

  return results
    .filter((result) => {
      if (
        result.Database != "information_schema" &&
        result.Database != "sys" &&
        result.Database != "performance_schema" &&
        result.Database != "mysql"
      ) {
        return result;
      }
    })
    .map((result) => {
      return result.Database;
    });

  //connection.connect()
};
