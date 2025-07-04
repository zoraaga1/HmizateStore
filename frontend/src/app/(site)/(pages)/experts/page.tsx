"use client";
import { useEffect, useState } from "react";
import api from "@/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Product } from "@/types/product";

interface User {
  _id: string;
  name: string;
  email: string;
  whatsapp: string;
}

interface ProductType {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imgs: string[];
  createdBy: User; 
}

interface Booking {
  _id: string;
  productId: ProductType;
  expertId: string;
  buyer: User; 
  totalPrice: number;
  status: "pending" | "accepted" | "canceled";
  createdAt: string;
}


const ExpertBookingsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/pending");
        console.log("API response data pending:", response.data);
    
        if (!Array.isArray(response.data)) {
          console.warn("Warning: bookings response is not an array!", response.data);
          setPendingBookings([]);
        } else {
          setPendingBookings(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/expert/bookings");
        console.log("API response data accepted:", response.data);
    
        if (!Array.isArray(response.data)) {
          console.warn("Warning: bookings response is not an array!", response.data);
          setAcceptedBookings([]);
        } else {
          setAcceptedBookings(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  console.log("accepted", acceptedBookings);
  useEffect(() => {
    console.log("Bookings updated:", pendingBookings);
  }, [pendingBookings]);

  const handleAccept = async (bookingId: string, buyerWhatsapp: string) => {
    try {
      // Accept booking on the server
      await api.post(`/bookings/${bookingId}/accept`);
  
      // Refetch accepted bookings to include the newly accepted one
      const acceptedRes = await api.get("/bookings/expert/bookings");
      if (Array.isArray(acceptedRes.data)) {
        setAcceptedBookings(acceptedRes.data);
      }
  
      // Remove the accepted booking from pending list
      setPendingBookings(prev => prev.filter(b => b._id !== bookingId));
  
      // Open WhatsApp chat with buyer
      window.open(`https://wa.me/${buyerWhatsapp}`, "_blank");
    } catch (err) {
      console.error("Error accepting booking:", err);
      alert("Failed to accept booking");
    }
  };
  
  if (loading) return <div className="text-center py-20">Loading bookings...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  // const pendingbookings = pendingBookings.filter((b) => b.status === "pending");
  // const acceptedBookings = bookings.filter((b) => b.status === "accepted");

  return (
    <div className="max-w-4xl mx-auto p-6 pt-15 bg-gray-100 mt-10">
      <h1 className="text-2xl font-semibold mb-4">Pending Booking Requests</h1>
      {pendingBookings.length === 0 ? (
        <p>No pending bookings at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {pendingBookings.map((booking) => (
            <li key={booking._id} className="p-4 border rounded shadow">
              <p>
                <strong>Buyer:</strong> {booking.buyer.name}
              </p>
              <p>
                <strong>Email:</strong> {booking.buyer.email}
              </p>
              <p>
                <strong>WhatsApp:</strong> {booking.buyer.whatsapp}
              </p>
              <hr></hr>
              <p>
                <strong>Seller:</strong> {booking.productId.createdBy.name}
              </p>
              <p>
                <strong>Email:</strong> {booking.productId.createdBy.email}
              </p>
              <p>
                <strong>Total Price:</strong> ${booking.totalPrice}
              </p>
              <button
                onClick={() =>
                  handleAccept(booking._id, booking.buyer.whatsapp)
                }
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Accept Booking
              </button>
            </li>
          ))}
        </ul>
      )}
      <h1 className="text-2xl font-semibold mb-4 mt-10">
        Accepted Booking Requests
      </h1>
      <ul className="space-y-4">
        {acceptedBookings.map((booking) => (
          <li
            key={booking._id}
            className="p-4 border rounded shadow bg-blue-100"
          >
            <p>
              <strong>Buyer:</strong> {booking.buyer.name}
            </p>
            <p>
              <strong>Email:</strong> {booking.buyer.email}
            </p>
            <p>
              <strong>WhatsApp:</strong> {booking.buyer.whatsapp}
            </p>
            <hr></hr>
            <p>
              <strong>Seller:</strong> {booking.productId.createdBy.name}
            </p>
            <p>
              <strong>Email:</strong> {booking.productId.createdBy.email}
            </p>
            <p>
              <strong>Total Price:</strong> ${booking.totalPrice}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpertBookingsPage;
