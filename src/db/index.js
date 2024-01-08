const { DB_NAME } = require("./../constants.js"),
  mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `mongo connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("error in connection db :", error);
    process.exit(1);
  }
};

module.exports = connectDB;
