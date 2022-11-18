const server = require("./app");
const port = process.env.PORT || 8080;
async function main() {
  server.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
  console.log("Server on port", 8080);
}

main();
