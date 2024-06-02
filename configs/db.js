const mongoose = require("mongoose");
require("dotenv").config();

const connected_to_mongoAtlas= mongoose.connect(process.env.mongo_Atlas_URL)


module.exports= connected_to_mongoAtlas