const app = require("./app");

//Port listen
let port = 8000;
app.listen(process.env.PORT || port, function () {
  console.log("Port Listening " + process.env.PORT);
});