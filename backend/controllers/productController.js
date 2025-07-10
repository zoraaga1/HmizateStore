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
  const { title, price, category, imgs, description, region, stock } = req.body;
  try {
    const newProduct = new product({
      title,
      price,
      category,
      imgs,
      description,
      region,
      stock,
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

// GET /api/products/category/:slug
const getProductsByCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ").trim();
    const products = await product.find({ category: { $regex: new RegExp("^" + category + "$", "i") } });

    console.log("Found products:", products.length);

    if (!products.length) {
      return res.status(404).json({ message: `No products found in this category: ${category}` });
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};
