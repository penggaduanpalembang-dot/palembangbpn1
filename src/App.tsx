import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getStoredData, 
  saveStoredData, 
  INITIAL_COMPLAINTS, 
  INITIAL_OFFICERS, 
  INITIAL_MANAGERS, 
  INITIAL_LOGS 
} from "./mockData";
import { 
  Complaint, 
  Officer, 
  Manager, 
  ActivityLog, 
  Role, 
  StatusPengaduan 
} from "./types";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Table, 
  Bell, 
  RefreshCw, 
  Sparkles,
  Users,
  CheckCircle2,
  Trash2,
  X,
  Menu
} from "lucide-react";
import StatsGrid from "./components/StatsGrid";
import Charts from "./components/Charts";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintTracker from "./components/ComplaintTracker";
import ManagerActions from "./components/ManagerActions";
import OfficerActions from "./components/OfficerActions";
import SpreadsheetView from "./components/SpreadsheetView";
import NotificationCenter, { NotificationItem } from "./components/NotificationCenter";

export default function App() {
  // Database States
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Simulator Settings
  const [currentRole, setCurrentRole] = useState<Role>("Masyarakat");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [activeToasts, setActiveToasts] = useState<{ id: string; title: string; body: string }[]>([]);

  // Load Initial Data
  useEffect(() => {
    const data = getStoredData();
    setComplaints(data.complaints);
    setOfficers(data.officers);
    setManagers(data.managers);
    setLogs(data.logs);

    // Initial dummy notifications to make it look active
    setNotifications([
      {
        id: "notif-1",
        title: "Sistem Pengaduan Online",
        body: "Selamat datang di Dashboard Pengaduan Pelayanan Kantor Pertanahan Kota Palembang. Gunakan panel atas untuk ganti peran simulasi.",
        time: "Baru saja",
        type: "public",
        isRead: false
      }
    ]);
  }, []);

  // Update persistent LocalStorage
  const handleAddComplaint = (newComplaint: Complaint) => {
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    saveStoredData({ complaints: updated });
  };

  const handleUpdateComplaint = (updatedComplaint: Complaint) => {
    const updated = complaints.map((c) => 
      c.ID_PENGADUAN === updatedComplaint.ID_PENGADUAN ? updatedComplaint : c
    );
    setComplaints(updated);
    saveStoredData({ complaints: updated });
  };

  const handleUpdateOfficers = (updatedOfficers: Officer[]) => {
    setOfficers(updatedOfficers);
    saveStoredData({ officers: updatedOfficers });
  };

  const handleUpdateManagers = (updatedManagers: Manager[]) => {
    setManagers(updatedManagers);
    saveStoredData({ managers: updatedManagers });
  };

  const handleAddActivityLog = (user: string, id: string, activityText: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0] + " " + now.toTimeString().split(" ")[0];
    const newLog: ActivityLog = {
      TANGGAL: dateStr,
      USER: user,
      AKTIVITAS: activityText,
      ID_PENGADUAN: id,
      KETERANGAN: `Melalui panel virtual peran: ${currentRole}`
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredData({ logs: updatedLogs });
  };

  const handleResetDatabase = () => {
    if (confirm("Apakah Anda yakin ingin mereset seluruh database virtual ke kondisi awal bawaan?")) {
      localStorage.clear();
      const data = getStoredData();
      setComplaints(data.complaints);
      setOfficers(data.officers);
      setManagers(data.managers);
      setLogs(data.logs);
      setNotifications([
        {
          id: "notif-reset",
          title: "Database Direset",
          body: "Seluruh data pengaduan, master petugas, dan log aktivitas telah dikembalikan ke bawaan asli.",
          time: "Baru saja",
          type: "public",
          isRead: false
        }
      ]);
      triggerToast("Database Direset", "Data dikembalikan ke bawaan pabrik");
    }
  };

  // Toast and Notification Management
  const triggerNotification = (title: string, body: string, type: "manager" | "officer" | "public") => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5);
    
    const newNotif: NotificationItem = {
      id: `notif-${now.getTime()}`,
      title,
      body,
      time: timeStr,
      type,
      isRead: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast(title, body);
  };

  const triggerToast = (title: string, body: string) => {
    const toastId = `toast-${Date.now()}`;
    setActiveToasts(prev => [...prev, { id: toastId, title, body }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== toastId));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Automatically adjust default sub-tab when user changes simulator role
  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    setIsMobileMenuOpen(false);
    if (role === "Masyarakat") {
      setActiveTab("form-pengaduan");
    } else if (role === "Manager Loket") {
      setActiveTab("verifikasi-manager");
    } else if (role === "Petugas") {
      setActiveTab("tindak-lanjut-petugas");
    } else if (role === "Administrator") {
      setActiveTab("spreadsheet-db");
    }
  };

  // Quick summary stats for top badges
  const unverifiedCount = complaints.filter(c => c.STATUS === StatusPengaduan.MenungguVerifikasi).length;
  const inProgressCount = complaints.filter(c => c.STATUS === StatusPengaduan.DalamPenanganan).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white flex justify-between items-center px-4 py-3 sticky top-0 z-45 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-slate-900 italic text-sm border border-slate-950 shadow-sm shrink-0">
            BPN
          </div>
          <div>
            <h1 className="font-display text-xs font-black tracking-tight text-white leading-tight uppercase">ATR/BPN Palembang</h1>
            <p className="text-[8px] font-black tracking-widest text-yellow-400 uppercase leading-none">Pengaduan Pelayanan</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Mobile Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-750 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 z-50">
                <NotificationCenter 
                  notifications={notifications}
                  onMarkAllAsRead={markAllNotificationsAsRead}
                  onClearAll={clearAllNotifications}
                  onClose={() => setShowNotificationsDropdown(false)}
                />
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-750 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between p-6 border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0
        md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div>
          {/* Close button for mobile menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-slate-900 italic text-lg border-2 border-slate-950 shadow-md rotate-[-3deg]">
              BPN
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-yellow-400/20">ATR / BPN</span>
              </div>
              <h1 className="font-display text-sm font-black tracking-tighter text-white uppercase leading-tight">Palembang</h1>
            </div>
          </div>

          {/* Simulator Switcher Widget inside Sidebar */}
          <div className="mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-ping shrink-0" />
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Simulator Multi-Peran:</span>
            </div>
            
            <div className="space-y-1.5">
              {([
                { id: "Masyarakat", label: "Masyarakat", emoji: "👥" },
                { id: "Manager Loket", label: "Manager Loket", emoji: "👮‍♂️" },
                { id: "Petugas", label: "Petugas", emoji: "🛠️" },
                { id: "Administrator", label: "Administrator", emoji: "⚙️" }
              ] as { id: Role; label: string; emoji: string }[]).map((r) => {
                const isActive = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all duration-200 uppercase tracking-tight
                      ${isActive 
                        ? "bg-yellow-400 text-slate-900 shadow-md shadow-yellow-400/10 scale-[1.02]" 
                        : "bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white border border-slate-800/60"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Menu in Sidebar */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3 px-2">Menu Layanan</div>
              <div className="space-y-1">
                
                {/* Universal KPI Tab */}
                <button 
                  onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                    ${activeTab === "dashboard" 
                      ? "bg-slate-800 text-white border-l-4 border-yellow-400 font-black" 
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                    }
                  `}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>Dashboard SLA</span>
                </button>

                {/* Role specific tabs */}
                {currentRole === "Masyarakat" && (
                  <>
                    <button 
                      onClick={() => { setActiveTab("form-pengaduan"); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                        ${activeTab === "form-pengaduan" 
                          ? "bg-slate-800 text-white border-l-4 border-yellow-400" 
                          : "text-slate-400 hover:bg-slate-850 hover:text-white"
                        }
                      `}
                    >
                      <FileText className="w-4 h-4 shrink-0 text-yellow-400" />
                      <span>Kirim Pengaduan</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab("lacak-pengaduan"); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                        ${activeTab === "lacak-pengaduan" 
                          ? "bg-slate-800 text-white border-l-4 border-yellow-400" 
                          : "text-slate-400 hover:bg-slate-850 hover:text-white"
                        }
                      `}
                    >
                      <Search className="w-4 h-4 shrink-0 text-yellow-400" />
                      <span>Lacak Status</span>
                    </button>
                  </>
                )}

                {currentRole === "Manager Loket" && (
                  <button 
                    onClick={() => { setActiveTab("verifikasi-manager"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                      ${activeTab === "verifikasi-manager" 
                        ? "bg-slate-800 text-white border-l-4 border-yellow-400" 
                        : "text-slate-400 hover:bg-slate-850 hover:text-white"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-yellow-400" />
                      <span>Verifikasi Loket</span>
                    </span>
                    <span className="bg-yellow-400 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[9px]">{unverifiedCount}</span>
                  </button>
                )}

                {currentRole === "Petugas" && (
                  <button 
                    onClick={() => { setActiveTab("tindak-lanjut-petugas"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                      ${activeTab === "tindak-lanjut-petugas" 
                        ? "bg-slate-800 text-white border-l-4 border-yellow-400" 
                        : "text-slate-400 hover:bg-slate-850 hover:text-white"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <Users className="w-4 h-4 shrink-0 text-yellow-400" />
                      <span>Tindak Lanjut</span>
                    </span>
                    <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[9px]">
                      {complaints.filter(c => c.PETUGAS_PENANGGUNG_JAWAB && c.STATUS !== StatusPengaduan.Selesai && c.STATUS !== StatusPengaduan.Ditolak).length}
                    </span>
                  </button>
                )}

                {/* Universal Database Spreadsheet Virtual */}
                <button 
                  onClick={() => { setActiveTab("spreadsheet-db"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200
                    ${activeTab === "spreadsheet-db" 
                      ? "bg-slate-800 text-white border-l-4 border-yellow-400" 
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                    }
                  `}
                >
                  <Table className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>Spreadsheet DB</span>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Footer Sidebar Profile / Reset */}
        <div className="pt-6 border-t border-slate-850 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-850 border border-slate-850 flex items-center justify-center font-black text-yellow-400 text-xs tracking-tight shrink-0">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wide text-white truncate">{currentRole}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">ATR/BPN Palembang</div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Reset Database Tool */}
            <button 
              onClick={handleResetDatabase}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-950 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl transition-colors border border-slate-850 text-[10px] font-black uppercase tracking-widest"
              title="Reset Database"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin-hover" />
              <span>Reset DB</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-10 relative overflow-y-auto bg-slate-50">
        
        {/* Top bar with Notifications and quick links */}
        <div className="hidden md:flex justify-end items-center gap-4 mb-8">
          
          {/* Quick Action Button */}
          <button 
            onClick={() => {
              setCurrentRole("Masyarakat");
              setActiveTab("form-pengaduan");
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-yellow-400 hover:text-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md shadow-slate-900/10 hover:scale-105 border border-slate-950"
          >
            + Pengaduan Baru
          </button>

          {/* Desktop Notification dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors relative"
              title="Sistem Notifikasi Alur"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 z-50">
                <NotificationCenter 
                  notifications={notifications}
                  onMarkAllAsRead={markAllNotificationsAsRead}
                  onClearAll={clearAllNotifications}
                  onClose={() => setShowNotificationsDropdown(false)}
                />
              </div>
            )}
          </div>

        </div>

        {/* High-Impact Main Heading Block */}
        <header className="mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Kantor Pertanahan Kota Palembang</p>
            
            {activeTab === "dashboard" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Dashboard<br/><span className="text-yellow-500">Monitoring</span>
              </h2>
            )}
            {activeTab === "form-pengaduan" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Kirim<br/><span className="text-yellow-500">Pengaduan</span>
              </h2>
            )}
            {activeTab === "lacak-pengaduan" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Lacak<br/><span className="text-yellow-500">Pengaduan</span>
              </h2>
            )}
            {activeTab === "verifikasi-manager" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Verifikasi<br/><span className="text-yellow-500">Manager</span>
              </h2>
            )}
            {activeTab === "tindak-lanjut-petugas" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Tindak<br/><span className="text-yellow-500">Lanjut</span>
              </h2>
            )}
            {activeTab === "spreadsheet-db" && (
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Spreadsheet<br/><span className="text-yellow-500">Database</span>
              </h2>
            )}
            
            <p className="mt-4 text-slate-500 text-[10px] font-black tracking-wider uppercase">Sistem Pengaduan Pelayanan BPN Kota Palembang ATR/BPN</p>
          </div>
        </header>

        {/* Content Screens Container */}
        <div className="space-y-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-8 flex-1"
            >
              {/* Dashboard (Global Tab) */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <StatsGrid complaints={complaints} />
                  <Charts complaints={complaints} />
                </div>
              )}

              {/* Form Pengaduan */}
              {activeTab === "form-pengaduan" && currentRole === "Masyarakat" && (
                <ComplaintForm 
                  onAddComplaint={handleAddComplaint}
                  onAddActivityLog={handleAddActivityLog}
                />
              )}

              {/* Lacak Pengaduan */}
              {activeTab === "lacak-pengaduan" && currentRole === "Masyarakat" && (
                <ComplaintTracker complaints={complaints} />
              )}

              {/* Verifikasi Manager */}
              {activeTab === "verifikasi-manager" && currentRole === "Manager Loket" && (
                <ManagerActions 
                  complaints={complaints}
                  officers={officers}
                  managers={managers}
                  onUpdateComplaint={handleUpdateComplaint}
                  onAddActivityLog={handleAddActivityLog}
                  onTriggerNotification={triggerNotification}
                />
              )}

              {/* Tindak Lanjut Petugas */}
              {activeTab === "tindak-lanjut-petugas" && currentRole === "Petugas" && (
                <OfficerActions 
                  complaints={complaints}
                  officers={officers}
                  onUpdateComplaint={handleUpdateComplaint}
                  onAddActivityLog={handleAddActivityLog}
                  onTriggerNotification={triggerNotification}
                />
              )}

              {/* Spreadsheet Virtual view */}
              {activeTab === "spreadsheet-db" && (
                <SpreadsheetView 
                  complaints={complaints}
                  officers={officers}
                  managers={managers}
                  logs={logs}
                  onUpdateOfficers={handleUpdateOfficers}
                  onUpdateManagers={handleUpdateManagers}
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>ATR/BPN Palembang © 2026</span>
          <span>Spesifikasi Alur Lacak Pengaduan Virtual</span>
        </div>

      </main>

      {/* Live Toast Popups (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {activeToasts.map((toast) => (
          <div 
            key={toast.id}
            className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 pointer-events-auto animate-slide-in"
          >
            <div className="p-1.5 bg-yellow-400 text-slate-900 rounded-lg shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <h4 className="font-bold text-white truncate">{toast.title}</h4>
              <p className="text-slate-300 mt-1">{toast.body}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
