import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supportAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function MySupport() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      // 1. Gatekeeper: Wait until auth is ready
      if (authLoading) return;
      if (!user) {
        setError("Please login to view your support tickets.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await supportAPI.getUserTickets();
        setTickets(res.data.data || []);
      } catch (err: any) {
        console.error("Failed to load tickets", err);
        setError("Could not fetch tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Support History</h1>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            New Request
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 border border-red-100">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
             {[1, 2].map((i) => (
               <div key={i} className="h-32 w-full bg-gray-100 animate-pulse rounded-2xl" />
             ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-[2rem] border-gray-100">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No support requests found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((t) => (
              <div key={t._id} className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{t.subject}</h3>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                      t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{t.message}</p>
                  <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Response Section */}
                <div className="p-6 bg-white">
                  {t.adminReply?.message ? (
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                        <MessageCircle size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Official Support Team</p>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {t.adminReply.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          Replied on {new Date(t.adminReply.repliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                      <Clock size={14} />
                      Waiting for our team to review your request...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}