const env = process.env.NODE_ENV || "development";

if (env === "development" || env === "test") {
  var config = require("./config.json");
  console.log("aksjdnakjdna: ", config);
  var envConfig = config[env];
  Object.keys(envConfig).map(key => {
    process.env[key] = envConfig[key];
  });
}
