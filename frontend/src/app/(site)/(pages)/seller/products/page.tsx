"use client";

import { useState, useEffect } from "react";
import api from "@/api";
import { jwtDecode } from "jwt-decode";

type User = {
  _id: string;
  name?: string;
  email?: string;
  rating?: number;
};

type Product = {
  _id: string;
  title: string;
  price: number;
  imgs: string[];
  description: string;
  category: string;
  region: string;
  createdBy: User;
};

type Region = {
  id: number;
  names: {
    ar: string;
    en: string;
    fr: string;
  };
};

type RegionResponse = {
  count: number;
  data: Region[];
};
export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "_id">>({
    title: "",
    price: 0,
    imgs: [],
    description: "",
    category: "",
    region: "",
    createdBy: { _id: "" },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      console.log("Decoded token:", decoded);
      const sellerIdFromToken = decoded.user?.id || decoded.id || decoded.sub;
      if (!sellerIdFromToken) {
        console.error("User ID not found in token");
        return;
      }
      setSellerId(sellerIdFromToken);

      const fetchProducts = async () => {
        const { data } = await api.get<Product[]>("/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("All returned products:", data);

        const sellerProducts = data.filter(
          (product) => product.createdBy._id === sellerIdFromToken
        );

        console.log("Filtered seller products:", sellerProducts);
        setProducts(sellerProducts);
      };

      fetchProducts();
    } catch (err) {
      console.error("Invalid token or fetch failed", err);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? parseFloat(value)
          : name === "imgs"
          ? value.split(",").map((img) => img.trim())
          : value,
    }));
  };

  const handleAdd = async () => {
    console.log("Form data before submit:", form);

    if (!form.title || !form.category || form.imgs.length === 0) {
      alert("Please fill in all required fields and add at least one image.");
      return;
    }

    if (!sellerId) {
      alert("Seller ID not found.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data: newProduct } = await api.post<Product>(
        "/products",
        {
          ...form,
          createdBy: { _id: sellerId },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (isUploading) {
        alert("Please wait for images to finish uploading.");
        return;
      }
      setProducts((prev) => [...prev, newProduct]);
      resetForm();
    } catch (err) {
      console.error("Failed to create product", err);
      alert("Error creating product");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/products/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === editingId ? { ...p, ...form } : p))
      );
      resetForm();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update product", err);
      alert("Error updating product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Error deleting product");
    }
  };

  const startEdit = (product: Product) => {
    setForm({
      title: product.title,
      price: product.price,
      imgs: product.imgs,
      description: product.description,
      category: product.category,
      region: product.region,
      createdBy: product.createdBy,
    });
    setEditingId(product._id);
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: 0,
      imgs: [],
      description: "",
      category: "",
      region: "",
      createdBy: { _id: "" },
    });
  };

  useEffect(() => {
    fetch("/data/regions.json")
      .then((response) => response.json())
      .then((data) => {
        setRegions(data.regions.data);
      })
      .catch((error) => {
        console.error("Error fetching regions:", error);
      });
  }, []);
  console.log("regions", regions);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("Image input changed");
  
    if (!files || files.length === 0) return;
  
    setIsUploading(true);

    const uploadedUrls: string[] = [];
  
    for (const file of Array.from(files)) {
      try {
        const response = await fetch(
          `https://blob.vercel-storage.com/products/${file.name}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_hmizate_READ_WRITE_TOKEN}`,
              "x-content-type": file.type,
              "x-content-length": file.size.toString(),
            },
            body: file,
          }
        );
  
        if (!response.ok) {
          const errText = await response.text();
          console.error("Upload failed:", errText);
          throw new Error("Upload failed");
        }
  
        const json = await response.json();
        console.log("Uploaded image URL:", json.url);
        uploadedUrls.push(json.url);
      } catch (err) {
        console.error("Error uploading image:", err);
        alert(`Failed to upload ${file.name}`);
      }
    }
  
    console.log("Uploaded URLs:", uploadedUrls);
  
    if (uploadedUrls.length > 0) {
      setForm((prev) => ({ ...prev, imgs: uploadedUrls }));
      setIsUploading(false);
    } else {
      alert("No images were uploaded. Please try again.");
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto mt-10 pt-30 space-y-6">
      <h1 className="text-2xl font-bold">Your Products</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Product Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter product title"
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Price ($)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col col-span-2">
          <label className="mb-1 font-medium">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 rounded"
          />
        </div>
        {isUploading && <p className="text-blue-600 text-sm mt-2">Uploading images...</p>}

        <div className="flex flex-col col-span-2">
          <label className="mb-1 font-medium">Product Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description"
            className="border p-2 rounded h-32 resize-y"
          />
        </div>

        <div className="flex flex-col col-span-2">
          <label className="mb-1 font-medium">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            <option value="televisions">Televisions</option>
            <option value="vehicules">Vehicles</option>
            <option value="home appliances">Home Appliances</option>
            <option value="mobile & tablets">Mobile & Tablets</option>
            <option value="health & sports">Health & Sports</option>
          </select>
        </div>

        <div className="flex flex-col col-span-2">
          <label className="mb-1 font-medium">Region</label>
          <select
            name="region"
            value={form.region}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.names.en}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={editingId ? handleUpdate : handleAdd}
          className={`col-span-2 py-2 rounded text-white ${
            editingId ? "bg-blue-600" : "bg-green-500"
          }`}
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>

      <ul className="space-y-4">
        {products.map((product) => (
          <li
            key={product._id}
            className="flex gap-4 items-center border p-3 rounded"
          >
            <img
              src={product.imgs?.[0] || "/images/placeholder.png"}
              alt={product.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="font-semibold">{product.title}</h2>
              <p>
                ${product.price.toFixed(2)} • {product.description}
              </p>
              <p className="text-sm text-gray-500">{product.category}</p>
              {product.imgs?.length > 1 && (
                <p className="text-xs text-gray-400">
                  +{product.imgs.length - 1} more image
                  {product.imgs.length - 1 > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(product)}
                className="text-blue-600 border border-blue-500 px-2 py-1 rounded hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="text-red-600 border border-red-500 px-2 py-1 rounded hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
