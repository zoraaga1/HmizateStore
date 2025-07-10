const express = require("express")
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} = require("../controllers/productController");
const protect = require("../middlewares/auth");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);
router.post("/", protect, createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/category/:slug", getProductsByCategory);

module.exports = router;