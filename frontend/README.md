# final_project

# 🛒Hmizate Store
Hmizate Store is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web platform that allows users to buy and sell used products — including cars, phones, PCs, and washing machines. What sets HamzaStore apart is its expert verification service: buyers can request certified experts to inspect a product before purchasing, helping build trust in second-hand transactions.

---

## 🌟 Features

### 👥 User Roles
- **Buyer:** Browse, filter, and book expert inspections.
- **Seller:** List and manage used products.
- **Expert:** Accept and manage inspection bookings.
- **Admin:** Approve listings, manage users, and moderate activity.

### 📦 Product Marketplace
- Categories: Vehicles( car | bicycle | electric scooter), Phones, PCs, Home Appliances (washing machine | dishwasher | refrigerator | ...)
- Add product listings with multiple images
- Search and filter by category, price, location
- Mark products as “Available” or “Sold”

### 🧑‍🔧 Expert Booking System
- Buyers can book experts to inspect specific listings
- Experts receive requests and respond via dashboard
- Post-inspection report submission by expert
- Booking status: Pending → Accepted → Completed

### 💼 Admin Dashboard
- Approve listings and expert registrations
- Monitor bookings, users, and products

### 📑 Legal Compliance (For Car Listings)
- Educational page for Moroccan car sale laws
- Checklist and optional document upload (e.g., Carte Grise)
- “I confirm compliance” checkbox for car sellers

### 💳 Payment System (Planned Feature)
- Future integration with Stripe for expert service payment
- Simulated flow in MVP (UI only)

---

## 🛠️ Tech Stack

| Technology | Description |
|------------|-------------|
| **MongoDB** | NoSQL database for users, listings, and bookings |
| **Express.js** | REST API server for business logic |
| **React.js** | Frontend SPA with dynamic routing |
| **Node.js** | Backend runtime |
| **Multer** | File/image upload handler |
| **Tailwind CSS / Material UI** | Modern, responsive styling |
| **JWT** | Secure user authentication |
| **Socket.IO** (optional) | Real-time updates for expert booking |

---

## 🗃️ Database Models (Simplified)

### User
```js
{
  name,
  email,
  passwordHash,
  role: "buyer" | "seller" | "expert" | "admin",
  location
}
{
  title,
  description,
  category,
  price,
  images: [url],
  sellerId,
  status: "available" | "sold"
}
{
  productId,
  buyerId,
  expertId,
  date,
  status: "pending" | "accepted" | "completed",
  report
}
