const mongoose = require("mongoose");
const config = require("./config");

mongoose.set("strictQuery", false);

console.log(
  "connecting to",
  config.MONGODB_URI.replace(/:\/\/(.*):(.*)@/, "://<user>:<password>@")
);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connection to MongoDB:", error.message);
    process.exit(1);
  });

// module.exports = mongoose;
