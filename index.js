import express from "express";
import userRoutes from "./user/user.route.js";
import connectDB from "./connect.db.js";
import productRoutes from "./product/product.route.js";
import cartRoutes from "./cart/cart.route.js";

const app = express();
// to make app understand json
app.use(express.json());

// connect database
connectDB();

// register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);

// port
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
