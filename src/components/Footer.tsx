import { Link } from "react-router-dom";
import { Home, Mail, Phone, Github, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#f9fbfb] border-t border-[#e0f2ec] mt-12 sm:mt-20">
      <div className="container mx-auto px-5 sm:px-6 pt-10 sm:pt-16 pb-6 sm:pb-8">

        <div className="grid gap-10 sm:gap-12 grid-cols-2 md:grid-cols-12 mb-10 sm:mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-[#1a332e]">
              <div className="rounded-xl bg-[#0fb478] p-2 shadow-lg shadow-[#0fb478]/20">
                <Home className="h-5 w-5 text-white" />
              </div>
              RentKaroo
            </div>

            <p className="text-[#4a635d] text-sm leading-relaxed max-w-sm font-medium">
              We're on a mission to simplify student living. From verified listings to seamless bookings, find your next home away from home with confidence.
            </p>

            <div className="flex gap-3">
              {[Instagram, Linkedin, Github].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#e0f2ec] text-[#4a635d] hover:bg-[#0fb478] hover:text-white hover:border-[#0fb478] transition-all duration-300 shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[#1a332e] font-black text-xs uppercase tracking-[0.15em] mb-4 sm:mb-6">
              Platform
            </h4>
            <ul className="space-y-3 sm:space-y-4 text-sm font-bold text-[#4a635d]">
              <li><Link to="/listings" className="hover:text-[#0fb478] transition-colors">Browse PGs</Link></li>
              <li><Link to="/listings" className="hover:text-[#0fb478] transition-colors">Safety Hub</Link></li>
              <li><Link to="/register" className="hover:text-[#0fb478] transition-colors">Partner with us</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[#1a332e] font-black text-xs uppercase tracking-[0.15em] mb-4 sm:mb-6">
              Support
            </h4>
            <ul className="space-y-3 sm:space-y-4 text-sm font-bold text-[#4a635d]">
              <li><Link to="/help" className="hover:text-[#0fb478] transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-[#0fb478] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#0fb478] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-4 space-y-3">
            <h4 className="text-[#1a332e] font-black text-xs uppercase tracking-[0.15em] mb-2 sm:mb-4">
              Get in touch
            </h4>
            <a
              href="mailto:support@rentkaroo.com"
              className="flex items-center gap-3 text-sm font-bold text-[#1a332e] hover:text-[#0fb478] transition-colors w-fit"
            >
              <div className="p-2 bg-[#f0f9f6] rounded-lg text-[#0fb478] shrink-0"><Mail size={16} /></div>
              support@rentkaroo.com
            </a>
            <a
              href="tel:+919410448110"
              className="flex items-center gap-3 text-sm font-bold text-[#1a332e] hover:text-[#0fb478] transition-colors w-fit"
            >
              <div className="p-2 bg-[#f0f9f6] rounded-lg text-[#0fb478] shrink-0"><Phone size={16} /></div>
              +91 9410448110
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#e0f2ec] flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] sm:text-xs font-bold text-[#4a635d] tracking-wide text-center sm:text-left">
            © {new Date().getFullYear()} RentKaroo Technologies. Made in India 🇮🇳
          </p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0fb478] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4a635d]">
              System status: all systems live
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;