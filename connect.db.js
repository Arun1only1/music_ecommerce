import mongoose from "mongoose";

const dbUserName = "arun";
const dbPassword = "arun2nly2";
const databaseName = "music-ecommerce";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUserName}:${dbPassword}@school.b6qkdnb.mongodb.net/${databaseName}?retryWrites=true&w=majority`
    );

    console.log("DB connection established...");
  } catch (error) {
    console.log("DB connection failed...");
    console.log(error.message);
  }
};

export default connectDB;
