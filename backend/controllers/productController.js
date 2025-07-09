const product = require("../models/product");

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await product.find().populate("createdBy", "name email rating");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET a single product by ID
const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const foundProduct = await product.findById(id).populate("createdBy", "name email rating");
    if (!foundProduct) return res.status(404).json({ error: "Product not found" });
    res.json(foundProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST (create) a new product
const createProduct = async (req, res) => {
  const { title, price, category, imgs, description, region } = req.body;
  try {
    const newProduct = new product({
      title,
      price,
      category,
      imgs,
      description,
      region,
      createdBy: req.user._id,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Region from req.body:", req.body.region);

  }
};

// PATCH (update) a product by ID
const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a product by ID
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
