"use client";
import { useEffect, useState } from "react";
import api from "@/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Product } from "@/types/product";
import { parseJwt } from "@/utils/auth";
import { getRegionById } from '@/utils/regions';

interface User {
  _id: string;
  name: string;
  email: string;
  whatsapp: string;
}

interface Booking {
  _id: string;
  productId: Product & { createdBy: User };
  expertId: string;
  buyer: User;
  totalPrice: number;
  status: "pending" | "in_progress" | "canceled" | "completed";
  createdAt: string;
}

type BookingStatus = Booking["status"];

const statusConfig: Record<BookingStatus, { title: string; bgColor: string }> =
  {
    pending: { title: "Pending Requests", bgColor: "bg-gray-100" },
    in_progress: { title: "In-Progress Bookings", bgColor: "bg-blue-50" },
    completed: { title: "Completed Bookings", bgColor: "bg-green-50" },
    canceled: { title: "Canceled Bookings", bgColor: "bg-red-50" },
  };

const ExpertBookingsPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookings, setBookings] = useState<Record<BookingStatus, Booking[]>>({
    pending: [],
    in_progress: [],
    completed: [],
    canceled: [],
  });
  const [expertId, setExpertId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<BookingStatus>("pending");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt(token);
      if (payload?.id) setExpertId(payload.id);
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setError("");
        setLoading(true);

        const [pendingRes, expertRes] = await Promise.all([
          api.get("/bookings/pending"),
          api.get("/bookings/expert/bookings"),
        ]);

        const newBookings: Record<BookingStatus, Booking[]> = {
          pending: Array.isArray(pendingRes.data) ? pendingRes.data : [],
          in_progress: [],
          completed: [],
          canceled: [],
        };

        const expertBookings = Array.isArray(expertRes.data)
          ? expertRes.data
          : [];
        expertBookings.forEach((booking) => {
          if (booking.status in newBookings) {
            newBookings[booking.status as BookingStatus].push(booking);
          }
        });

        setBookings(newBookings);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
    buyerWhatsapp?: string
  ) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        newStatus,
        ...(newStatus === "in_progress" && { expertId }),
      });

      setBookings((prev) => {
        const updatedBookings = { ...prev };
        // Remove from all status arrays
        Object.keys(updatedBookings).forEach((status) => {
          updatedBookings[status as BookingStatus] = updatedBookings[
            status as BookingStatus
          ].filter((b) => b._id !== bookingId);
        });

        // Add to new status array if we have the booking data
        const booking = Object.values(prev)
          .flat()
          .find((b) => b._id === bookingId);

        if (booking) {
          updatedBookings[newStatus] = [
            ...updatedBookings[newStatus],
            { ...booking, status: newStatus },
          ];
        }

        return updatedBookings;
      });

      if (newStatus === "in_progress" && buyerWhatsapp) {
        window.open(`https://wa.me/${buyerWhatsapp}`, "_blank");
      }
    } catch (err) {
      console.error(`Error changing status to ${newStatus}:`, err);
      alert(`Failed to update booking status`);
    }
  };
  
  const BookingCard = ({ booking }: { booking: Booking }) => {
    const language  = 'en';
  
    return (
      <li
        className={`relative p-4 border rounded-lg shadow-sm ${
          statusConfig[booking.status].bgColor
        }`}
      >
        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-white border">
          {booking.status.replace("_", " ")}
        </span>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Buyer Information</h3>
            <p>
              <span className="font-medium">Name:</span> {booking.buyer.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {booking.buyer.email}
            </p>
            <p>
              <span className="font-medium">WhatsApp:</span>{" "}
              {booking.buyer.whatsapp}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Seller Information</h3>
            <p>
              <span className="font-medium">Name:</span> {booking.productId.createdBy.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {booking.productId.createdBy.email}
            </p>
            <p>
              <span className="font-medium">WhatsApp:</span>{" "}
              {booking.productId.createdBy.whatsapp}
            </p>
          </div>
  
          <div>
            <h3 className="font-semibold text-lg mb-2">Service Details</h3>
            <p>
              <span className="font-medium">Product:</span>{" "}
              {booking.productId.title}
            </p>
            <p>
              <span className="font-medium">Price:</span> ${booking.totalPrice}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Location:</span>{" "}
              {getRegionById(Number(booking.productId.region), language)}
            </p>
          </div>
        </div>
  
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => handleStatusChange(booking._id, "canceled")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() =>
                  handleStatusChange(
                    booking._id,
                    "in_progress",
                    booking.buyer.whatsapp
                  )
                }
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                Accept & Contact
              </button>
            </>
          )}
  
          {booking.status === "in_progress" && (
            <>
              <button
                onClick={() => handleStatusChange(booking._id, "completed")}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleStatusChange(booking._id, "canceled")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </li>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(bookings);
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-18">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Expert Bookings</h1>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setActiveTab(status as BookingStatus)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === status
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {config.title} ({bookings[status as BookingStatus].length})
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          {bookings[activeTab].length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {statusConfig[activeTab].title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You currently don&apos;t have any {activeTab.replace("_", " ")}{" "}
                bookings.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {bookings[activeTab].map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default ExpertBookingsPage;
