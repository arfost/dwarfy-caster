const { readFileSync } = require("fs");
const { createServer: createHttpServer } = require("http");
const { createServer: createHttpsServer } = require("https");

function create(args) {
  const secure = args.indexOf("-s") > -1;
  const certPath = args.indexOf("-c") !== -1 ? args[args.indexOf("-c") + 1] : undefined;
  const keyPath = args.indexOf("-k") !== -1 ? args[args.indexOf("-k") + 1] : undefined;

  console.log("secure : ", secure, "certPath : ", certPath, "keyPath : ", keyPath);

  const server = secure ? createHttpsServer({ cert: readFileSync(certPath), key: readFileSync(keyPath) }) : createHttpServer();
  return server;
}

module.exports = create;