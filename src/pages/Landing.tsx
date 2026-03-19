import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  FileBarChart, 
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const NavItem = ({ label, to }: { label: string, to: string }) => (
  <Link to={to} className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors">
    {label}
  </Link>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group"
  >
    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Landing({ user, onLogout }: { user: any, onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">FarmSecure</span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <NavItem label="Home" to="/" />
            <NavItem label="Farm Dashboard" to="/dashboard" />
            <NavItem label="Biosecurity Guidelines" to="/biosecurity" />
            <NavItem label="Reports" to="/reports" />
            <NavItem label="Contact" to="#contact" />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className="hidden sm:block text-slate-600 hover:text-emerald-600 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={onLogout}
                  className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Portal Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Advanced Biosecurity Systems</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter mb-8">
              DIGITAL FARM <br />
              <span className="text-emerald-500 italic">BIOSECURITY</span> <br />
              MANAGEMENT.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
              Implementing smart farm monitoring and disease prevention protocols for modern pig and poultry ecosystems. Secure your livestock with real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/dashboard"
                className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 group"
              >
                Launch Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:border-emerald-200 transition-all flex items-center justify-center gap-3">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Farm Illustration" 
                className="rounded-[2.5rem] w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Floating HUD Elements */}
              <div className="absolute top-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Index</p>
                    <p className="text-xl font-black text-slate-900">98.4%</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -right-10 bg-slate-900 p-6 rounded-3xl shadow-xl animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security</p>
                    <p className="text-xl font-black text-white uppercase">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.5em] mb-4">Core Capabilities</h2>
            <p className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Advanced Technology for <br />
              <span className="text-emerald-500 italic">Sustainable</span> Farming.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={LayoutDashboard}
              title="Farm Monitoring"
              description="Real-time tracking of environmental conditions and livestock behavior using IoT sensors."
              delay={0.1}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Disease Prevention"
              description="Automated biosecurity protocols and early warning systems to prevent pathogen entry."
              delay={0.2}
            />
            <FeatureCard 
              icon={AlertTriangle}
              title="Biosecurity Alerts"
              description="Instant notifications for protocol breaches or abnormal health indicators across the farm."
              delay={0.3}
            />
            <FeatureCard 
              icon={FileBarChart}
              title="Farm Reports"
              description="Comprehensive analytical reports for compliance audits and operational optimization."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 p-12 lg:p-24 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-8">
                  The Command Center <br />
                  <span className="text-emerald-400 italic">At Your Fingertips.</span>
                </h2>
                <div className="space-y-6 mb-10">
                  {[
                    "Intuitive livestock distribution charts",
                    "Real-time sensor data visualization",
                    "Automated biosecurity compliance logs",
                    "Integrated vaccination scheduling"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-400">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/dashboard"
                  className="inline-flex bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all"
                >
                  Explore Dashboard
                </Link>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1200" 
                    alt="Dashboard Preview" 
                    className="rounded-2xl w-full shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-50 pt-24 pb-12 px-6 lg:px-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">FarmSecure</span>
              </div>
              <p className="text-slate-500 max-w-md leading-relaxed font-medium mb-8">
                Leading the digital transformation in agricultural biosecurity. We provide the tools farmers need to protect their livestock and ensure sustainable food production.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">
                  <Activity size={20} />
                </div>
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">
                  <Globe size={20} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Contact Us</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-slate-500">
                  <MapPin size={20} className="text-emerald-600" />
                  <span className="text-sm font-medium">123 Agri-Tech Plaza, Silicon Valley</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <Phone size={20} className="text-emerald-600" />
                  <span className="text-sm font-medium">+1 (555) 000-FARM</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <Mail size={20} className="text-emerald-600" />
                  <span className="text-sm font-medium">support@farmsecure.io</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Quick Links</h4>
              <div className="space-y-4 flex flex-col">
                <NavItem label="Farm Dashboard" to="/dashboard" />
                <NavItem label="Biosecurity Guidelines" to="/biosecurity" />
                <NavItem label="Animal Records" to="/animals" />
                <NavItem label="Vaccination Logs" to="/vaccinations" />
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              © 2026 FarmSecure Digital Management. All Rights Reserved.
            </p>
            <div className="flex gap-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600">Privacy Policy</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Globe = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
