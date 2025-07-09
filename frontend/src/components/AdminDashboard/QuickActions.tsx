import React from 'react';
import { FaBox, FaDollarSign, FaShoppingCart, FaUsers } from 'react-icons/fa';
import Link from "next/link";

const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <Link href="/seller/products">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center">
          <FaBox className="mr-2" />
          Add New Product
        </button>
        </Link>
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition flex items-center">
          <FaShoppingCart className="mr-2" />
          Manage Orders
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition flex items-center">
          <FaUsers className="mr-2" />
          View Customers
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition flex items-center">
          <FaDollarSign className="mr-2" />
          Sales Reports
        </button>
      </div>
    </div>
  );
};

export default QuickActions;