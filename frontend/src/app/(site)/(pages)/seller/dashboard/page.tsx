"use client";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { FaBox, FaDollarSign, FaShoppingCart, FaUsers } from 'react-icons/fa';
import StatsCard from '../../../../../components/AdminDashboard/StatsCard';
import SalesChart from '../../../../../components/AdminDashboard/SalesChart';
import RecentProducts from '../../../../../components/AdminDashboard/RecentProducts';
import QuickActions from '../../../../../components/AdminDashboard/QuickActions';
import api from "@/api";

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
  stock: number;
  createdBy: User;
};

const SellerDashboard = () => {

    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const totalProducts = recentProducts.length;
  
  // Mock data
  const stats = {
    totalSales: 3240,
    pendingOrders: 8,
    customers: 124,
    salesData: [
      { month: 'Jan', sales: 400 },
      { month: 'Feb', sales: 600 },
      { month: 'Mar', sales: 800 },
      { month: 'Apr', sales: 1200 },
      { month: 'May', sales: 546843516465 },
      { month: 'Jun', sales: 1500 },
    ],
    // recentProducts: [
    //   { id: 1, name: 'Wireless Headphones', price: 199.99, stock: 15, category: 'electronics' },
    //   { id: 2, name: 'Running Shoes', price: 89.99, stock: 8, category: 'sports' },
    //   { id: 3, name: 'Smart Watch', price: 249.99, stock: 20, category: 'electronics' },
    //   { id: 4, name: 'Bluetooth Speaker', price: 79.99, stock: 0, category: 'electronics' },
    // ]
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
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

        const sellerProducts = data.filter(
          (product) => product.createdBy._id === sellerIdFromToken
        );

        setRecentProducts(sellerProducts);
      };

      fetchProducts();
    } catch (err) {
      console.error("Invalid token or fetch failed", err);
    }
  }, []);
  console.log("products", recentProducts);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Products" 
          value={totalProducts} 
          icon={FaBox} 
          color="text-blue-600" 
          change="+12%" 
        />
        
        <StatsCard 
          title="Total Sales" 
          value={`$${stats.totalSales}`} 
          icon={FaDollarSign} 
          color="text-green-600" 
          change="+8%" 
        />
        
        <StatsCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={FaShoppingCart} 
          color="text-yellow-600" 
          change="-3%" 
        />
        
        <StatsCard 
          title="Customers" 
          value={stats.customers} 
          icon={FaUsers} 
          color="text-purple-600" 
          change="+5%" 
        />
      </div>
      
      {/* Charts and Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SalesChart data={stats.salesData} />
        <RecentProducts products={recentProducts} />
      </div>
      
      <QuickActions />
    </div>
  );
};

export default SellerDashboard;