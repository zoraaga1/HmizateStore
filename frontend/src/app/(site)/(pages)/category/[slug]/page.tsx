"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/api";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { Product } from "@/types/product";

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setNotFound(false);
    api
      .get(`/products/category/${slug}`)
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            setNotFound(true);
          } else {
            setError(true);
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          setError(true);
        } else {
          console.error("Error:", error.message);
          setError(true);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error loading products.</p>;

  if (notFound || products.length === 0) {
    return (
      <main>
        <section className="pt-32 text-center">
          <p className="text-lg text-gray-600">
            No products found in this category.
          </p>
        </section>
      </main>
    );
  }
  

  return (
    <main>
      <ShopWithoutSidebar products={products} />
    </main>
  );
};

export default CategoryPage;
