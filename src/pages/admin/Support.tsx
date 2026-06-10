import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supportAPI } from "@/services/api";
import { X } from "lucide-react";

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    console.log("fetchTickets called");

    try {
      setLoading(true);

      const res = await supportAPI.getAll();

      console.log("Support Response:", res.data);

      const ticketsData =
        res.data?.data?.tickets ||
        res.data?.tickets ||
        res.data?.data ||
        [];

      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT
  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setIsSubmitting(true);

      await supportAPI.reply(selectedTicket._id, {
        message: replyMessage,
      });

      alert("Reply sent successfully");

      setReplyMessage("");
      setSelectedTicket(null);

      fetchTickets();
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-6">
          Support Requests
        </h1>

        {loading ? (
          <p>Loading requests...</p>
        ) : tickets.length === 0 ? (
          <p>No support requests yet.</p>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="border rounded-xl p-5 bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">
                    {ticket.subject}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {ticket.message}
                  </p>

                  <p className="text-xs text-gray-500">
                    {ticket.name} ({ticket.email})
                  </p>

                  <p className="text-xs mt-1">
                    Status: {ticket.status}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Reply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-2">
              Reply to Ticket
            </h2>

            <p className="mb-4">
              {selectedTicket.subject}
            </p>

            <form onSubmit={handleReply}>
              <textarea
                rows={5}
                className="w-full border rounded-lg p-3"
                value={replyMessage}
                onChange={(e) =>
                  setReplyMessage(e.target.value)
                }
                placeholder="Write your reply..."
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full bg-black text-white py-3 rounded-lg"
              >
                {isSubmitting
                  ? "Sending..."
                  : "Send Reply & Resolve"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}