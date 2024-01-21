import express from "express";
import userRoutes from "./user/user.route.js";
import connectDB from "./connect.db.js";

const app = express();
// to make app understand json
app.use(express.json());

// connect database
connectDB();

// register routes
app.use(userRoutes);

// port
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
