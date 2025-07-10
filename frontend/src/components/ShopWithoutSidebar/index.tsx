"use client"
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import api from "@/api";
import { Product } from "@/types/product";

interface ShopWithoutSidebarProps {
  products?: Product[];
}

const ShopWithoutSidebar: React.FC<ShopWithoutSidebarProps> = ({ products: propProducts }) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [products, setProducts] = useState<Product[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts); // if no prop, loading true
  const [error, setError] = useState<string | null>(null);

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  useEffect(() => {
    if (propProducts) return;

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [propProducts]);

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <>
      <Breadcrumb
        title={"Explore Products"}
        pages={["shop", "/", "shop without sidebar"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className="w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />

                    <p>
                      Showing{" "}
                      <span className="text-dark">
                        {products.length} of {products.length}
                      </span>{" "}
                      Products
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="Grid view"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "text-gray-700 bg-gray-100 border-gray-300"
                      } flex items-center justify-center w-10 h-9 rounded-md border transition-colors hover:bg-blue-600 hover:border-blue-600 hover:text-white`}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM12 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM12 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="List view"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "text-gray-700 bg-gray-100 border-gray-300"
                      } flex items-center justify-center w-10 h-9 rounded-md border transition-colors hover:bg-blue-600 hover:border-blue-600 hover:text-white`}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }`}
              >
                {products.map((item) =>
                  productStyle === "grid" ? (
                    <SingleGridItem item={item} key={item._id} />
                  ) : (
                    <SingleListItem item={item} key={item._id} />
                  )
                )}
              </div>

              {/* Pagination remains the same */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
