import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { 
  ChevronDown, Send, MessageCircle, Clock, 
  History, CheckCircle, HelpCircle, ShieldQuestion, LifeBuoy
} from "lucide-react";
import { supportAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Help() {
  const { user } = useAuth(); // Get user status
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const faqs = [
    { q: "How do I book a PG?", a: "Browse available listings, open the PG you like, and click the Reserve button to proceed." },
    { q: "Can I cancel my booking?", a: "Yes, cancellation depends on the property owner's policy shown on the listing page." },
    { q: "How to contact the host?", a: "Use the 'Message Host' button on the specific PG listing page." }
  ];

  // --- SAFE TICKETS FETCH LOGIC ---
  const fetchMyTickets = async () => {
    if (!user) return; // Don't fetch if not logged in
    setHistoryLoading(true);
    try {
      const res = await supportAPI.getUserTickets();
      
      // Kuch backends res.data.data mein array dete hain, aur kuch res.data.data.tickets mein.
      // Hum dono cases ko handle kar rahe hain safe parsing se:
      const incomingData = res.data?.data;
      const ticketsArray = Array.isArray(incomingData) 
        ? incomingData 
        : (incomingData?.tickets || []);

      setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
      setTickets([]); // Fallback to empty array on error
    } finally { 
      setHistoryLoading(false); 
    }
  };

  useEffect(() => { 
    if (activeTab === "history") fetchMyTickets(); 
  }, [activeTab, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supportAPI.create(formData);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setActiveTab("history");
    } catch (error) { 
      alert("Please login to submit a ticket.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen pb-20">
        {/* Header - Matching RentKaroo Green Section */}
        <div className="bg-[#f0f9f6] py-20 border-b border-[#e0f2ec]">
          <div className="max-w-5xl mx-auto px-6 text-center">
             <div className="inline-flex p-3 bg-[#0fb478] text-white rounded-2xl mb-6 shadow-lg shadow-[#0fb478]/20">
               <LifeBuoy size={32} />
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a332e] tracking-tight mb-4">
               How can we <span className="text-[#0fb478]">help?</span>
             </h1>
             <p className="text-[#4a635d] text-lg max-w-xl mx-auto font-medium">
               Find answers in our FAQ or reach out to our support team.
             </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-8">
          {/* Tab Switcher - RentKaroo Style */}
          <div className="flex bg-white border border-[#e0f2ec] p-1.5 rounded-2xl mb-12 max-w-sm mx-auto shadow-xl shadow-gray-100">
            {(["form", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab ? "bg-[#0fb478] text-white shadow-md" : "text-[#4a635d] hover:bg-[#f0f9f6]"
                }`}
              >
                {tab === "form" ? <ShieldQuestion size={18} /> : <History size={18} />}
                {tab === "form" ? "Get Help" : "My Tickets"}
              </button>
            ))}
          </div>

          {activeTab === "form" ? (
            <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
              {/* FAQ Section */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-2xl font-bold text-[#1a332e]">Common Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div 
                      key={i} 
                      className={`border rounded-2xl p-5 cursor-pointer transition-all ${openFaq === i ? "border-[#0fb478] bg-[#f0f9f6]" : "border-[#e0f2ec] hover:border-[#0fb478]"}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <div className="flex justify-between items-center font-bold text-[#1a332e]">
                        {faq.q} 
                        <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? "rotate-180 text-[#0fb478]" : ""}`} />
                      </div>
                      {openFaq === i && <p className="text-sm text-[#4a635d] mt-3 pt-3 border-t border-[#d1e9df] leading-relaxed">{faq.a}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form - Matching Input Style */}
              <div className="lg:col-span-7">
                <form onSubmit={handleSubmit} className="bg-white border border-[#e0f2ec] rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-100 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" placeholder="Name" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#f9fbfb] border border-[#e0f2ec] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#0fb478] focus:bg-white outline-none" />
                    <input type="email" placeholder="Email" required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#f9fbfb] border border-[#e0f2ec] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#0fb478] focus:bg-white outline-none" />
                  </div>
                  <input type="text" placeholder="Subject" required value={formData.subject} onChange={(e)=>setFormData({...formData, subject: e.target.value})} className="w-full bg-[#f9fbfb] border border-[#e0f2ec] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#0fb478] focus:bg-white outline-none" />
                  <textarea placeholder="Tell us more..." rows={4} required value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full bg-[#f9fbfb] border border-[#e0f2ec] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#0fb478] focus:bg-white outline-none resize-none" />
                  <button disabled={loading} className="w-full bg-[#0fb478] text-white py-4 rounded-xl font-bold hover:bg-[#0d9a66] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0fb478]/20">
                    {loading ? "Sending..." : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Tickets Tab */
            <div className="max-w-3xl mx-auto space-y-6">
              {historyLoading ? (
                <div className="text-center py-20 animate-pulse text-[#0fb478] font-bold">Loading your tickets...</div>
              ) : (!tickets || tickets.length === 0) ? (
                <div className="text-center py-20 border-2 border-dashed border-[#e0f2ec] rounded-[3rem] bg-[#f9fbfb]">
                  <HelpCircle size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-[#4a635d]">No tickets yet. We're here if you need us!</p>
                </div>
              ) : (
                /* SAFE MAP EXECUTION USING CONTINGENCY CHECK */
                Array.isArray(tickets) && tickets.map((t) => (
                  <div key={t._id} className="bg-white border border-[#e0f2ec] rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'resolved' ? 'bg-[#e0f2ec] text-[#0fb478]' : 'bg-orange-50 text-orange-600'}`}>
                          {t.status === 'resolved' ? <CheckCircle size={12} /> : <Clock size={12} />} {t.status}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">ID: #{t._id ? t._id.slice(-6) : "------"}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#1a332e]">{t.subject}</h3>
                      <p className="text-[#4a635d] mt-2 text-sm">{t.message}</p>
                    </div>
                    {t.adminReply?.message && (
                      <div className="m-4 mt-0 p-5 bg-[#f0f9f6] text-[#1a332e] rounded-2xl border border-[#d1e9df]">
                         <p className="text-[10px] font-bold text-[#0fb478] uppercase mb-2">Team Reply:</p>
                        <p className="text-sm italic">"{t.adminReply.message}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}