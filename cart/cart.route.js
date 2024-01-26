import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import { validateReqBody } from "../middleware/validation.middleware.js";
import {
  addProductToCartValidationSchema,
  updateItemQuantitySchema,
} from "./cart.validation.js";
import mongoose from "mongoose";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";
import { checkMongoIdValidity } from "../utils/check.mongo.id.validity.js";

const router = express.Router();

// add item to cart
router.put(
  "/cart/add/item",
  isBuyer,
  validateReqBody(addProductToCartValidationSchema),
  async (req, res) => {
    // extract item to be added to cart
    const item = req.body;

    // check productId for mongo id validity
    const isValidMongoId = mongoose.Types.ObjectId.isValid(item.productId);

    // if not valid mongo id
    if (!isValidMongoId) {
      return res.status(400).send({ message: "Invalid mongo id." });
    }

    // check if product exists using productId
    const product = await Product.findOne({ _id: item.productId });

    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    const cart = await Cart.findOne({ "items.productId": item.productId });

    if (cart) {
      return res.status(409).send({ message: "Item already present in cart." });
    }

    // check for stock availability
    if (item.orderedQuantity > product.quantity) {
      return res.status(422).send({ message: "Product is outnumbered." });
    }

    // add item to cart
    await Cart.updateOne(
      { buyerId: req.loggedInUserId },
      {
        $push: {
          items: item,
        },
      }
    );

    return res
      .status(200)
      .send({ message: "Product is added to cart successfully." });
  }
);

// remove single item from cart
router.put(
  "/cart/remove/:id",
  isBuyer,
  checkMongoIdValidity,
  async (req, res) => {
    //   extract product id from req.params
    const productId = req.params.id;

    //   buyer id
    const buyerId = req.loggedInUserId;

    await Cart.updateOne(
      { buyerId: buyerId },
      {
        $pull: {
          items: { productId: productId },
        },
      }
    );

    return res.status(200).send({ message: "Item is removed successfully." });
  }
);

// flush cart
router.put("/cart/flush", isBuyer, async (req, res) => {
  // buyerId
  const buyerId = req.loggedInUserId;

  await Cart.updateOne(
    { buyerId: buyerId },
    {
      $set: {
        items: [],
      },
    }
  );

  return res.status(200).send({ message: "Cart is flushed successfully." });
});

// update cart item quantity

router.put(
  "/cart/item/update-quantity",
  isBuyer,
  validateReqBody(updateItemQuantitySchema),
  async (req, res) => {
    // extract req.body
    const input = req.body;

    // check mongo id  validity for product id
    const isValidMongoId = mongoose.Types.ObjectId.isValid(input.productId);

    // if not valid, throw error
    if (!isValidMongoId) {
      return res.status(400).send({ message: "Invalid mongo id." });
    }

    // check if item is in cart or not
    const cartItem = await Cart.findOne({ "items.productId": input.productId });

    // if not cart item
    if (!cartItem) {
      return res.status(404).send({ message: "Item is not present in cart." });
    }

    // find product
    const product = await Product.findOne({ _id: input.productId });

    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    const foundItemOnCart = cartItem.items.filter((item) =>
      item.productId.equals(input.productId)
    );

    const newOrderedQuantity =
      input.action === "inc"
        ? foundItemOnCart[0].orderedQuantity + 1
        : foundItemOnCart[0].orderedQuantity - 1;

    await Cart.updateOne(
      { buyerId: req.loggedInUserId, "items.productId": product._id },
      {
        $set: {
          "items.$.orderedQuantity": newOrderedQuantity,
        },
      }
    );

    return res
      .status(200)
      .send({ message: "Quantity is updated successfully." });
  }
);
export default router;
