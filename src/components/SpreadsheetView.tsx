import React, { useState, useMemo } from "react";
import { Table, Search, Download, Plus, RefreshCw, X, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Complaint, Officer, Manager, ActivityLog } from "../types";

interface SpreadsheetViewProps {
  complaints: Complaint[];
  officers: Officer[];
  managers: Manager[];
  logs: ActivityLog[];
  onUpdateOfficers: (officers: Officer[]) => void;
  onUpdateManagers: (managers: Manager[]) => void;
  onResetDatabase: () => void;
}

type ActiveSheet = "DATA_PENGADUAN" | "MASTER_PETUGAS" | "MASTER_MANAGER" | "LOG_AKTIVITAS";

export default function SpreadsheetView({
  complaints,
  officers,
  managers,
  logs,
  onUpdateOfficers,
  onUpdateManagers,
  onResetDatabase
}: SpreadsheetViewProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>("DATA_PENGADUAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);

  // Form states for new Officer
  const [newOfficer, setNewOfficer] = useState({
    ID_PETUGAS: "",
    NAMA_PETUGAS: "",
    JABATAN: "",
    UNIT_KERJA: "Seksi Survei dan Pemetaan",
    EMAIL: "",
    STATUS: "Aktif" as "Aktif" | "Cuti" | "Non-Aktif"
  });

  // Form states for new Manager
  const [newManager, setNewManager] = useState({
    ID_MANAGER: "",
    NAMA_MANAGER: "",
    EMAIL: "",
    JABATAN: ""
  });

  const [modalError, setModalError] = useState("");

  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${activeSheet}.csv`;

    if (activeSheet === "DATA_PENGADUAN") {
      headers = [
        "ID_PENGADUAN", "TGL_PENGADUAN", "NAMA_PELAPOR", "HP", "NO_BERKAS", "PETUGAS_LAPANGAN",
        "JENIS_LAYANAN", "KATEGORI", "URAIAN", "FOTO_BUKTI", "STATUS", "MANAGER_VERIFIKASI",
        "TGL_VERIFIKASI", "PETUGAS_PENANGGUNG_JAWAB", "TGL_TINDAKLANJUT", "KENDALA", "ANALISIS",
        "TINDAKAN", "TARGET_SELESAI", "BUKTI_TINDAKLANJUT", "HASIL_PENYELESAIAN", "TGL_SELESAI"
      ];
      rows = complaints.map((c) => [
        c.ID_PENGADUAN, c.TGL_PENGADUAN, c.NAMA_PELAPOR, c.HP, c.NO_BERKAS, c.PETUGAS_LAPANGAN || "",
        c.JENIS_LAYANAN, c.KATEGORI, c.URAIAN, c.FOTO_BUKTI || "", c.STATUS, c.MANAGER_VERIFIKASI || "",
        c.TGL_VERIFIKASI || "", c.PETUGAS_PENANGGUNG_JAWAB || "", c.TGL_TINDAKLANJUT || "", c.KENDALA || "",
        c.ANALISIS || "", c.TINDAKAN || "", c.TARGET_SELESAI || "", c.BUKTI_TINDAKLANJUT || "",
        c.HASIL_PENYELESAIAN || "", c.TGL_SELESAI || ""
      ]);
    } else if (activeSheet === "MASTER_PETUGAS") {
      headers = ["ID_PETUGAS", "NAMA_PETUGAS", "JABATAN", "UNIT_KERJA", "EMAIL", "STATUS"];
      rows = officers.map((o) => [o.ID_PETUGAS, o.NAMA_PETUGAS, o.JABATAN, o.UNIT_KERJA, o.EMAIL, o.STATUS]);
    } else if (activeSheet === "MASTER_MANAGER") {
      headers = ["ID_MANAGER", "NAMA_MANAGER", "EMAIL", "JABATAN"];
      rows = managers.map((m) => [m.ID_MANAGER, m.NAMA_MANAGER, m.EMAIL, m.JABATAN]);
    } else {
      headers = ["TANGGAL", "USER", "AKTIVITAS", "ID_PENGADUAN", "KETERANGAN"];
      rows = logs.map((l) => [l.TANGGAL, l.USER, l.AKTIVITAS, l.ID_PENGADUAN, l.KETERANGAN]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search filter
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeSheet === "DATA_PENGADUAN") return complaints;
      if (activeSheet === "MASTER_PETUGAS") return officers;
      if (activeSheet === "MASTER_MANAGER") return managers;
      return logs;
    }

    if (activeSheet === "DATA_PENGADUAN") {
      return complaints.filter((c) => 
        c.ID_PENGADUAN.toLowerCase().includes(query) ||
        c.NAMA_PELAPOR.toLowerCase().includes(query) ||
        c.HP.includes(query) ||
        c.NO_BERKAS.toLowerCase().includes(query) ||
        c.STATUS.toLowerCase().includes(query)
      );
    } else if (activeSheet === "MASTER_PETUGAS") {
      return officers.filter((o) => 
        o.ID_PETUGAS.toLowerCase().includes(query) ||
        o.NAMA_PETUGAS.toLowerCase().includes(query) ||
        o.JABATAN.toLowerCase().includes(query) ||
        o.UNIT_KERJA.toLowerCase().includes(query)
      );
    } else if (activeSheet === "MASTER_MANAGER") {
      return managers.filter((m) => 
        m.ID_MANAGER.toLowerCase().includes(query) ||
        m.NAMA_MANAGER.toLowerCase().includes(query) ||
        m.JABATAN.toLowerCase().includes(query)
      );
    } else {
      return logs.filter((l) => 
        l.USER.toLowerCase().includes(query) ||
        l.AKTIVITAS.toLowerCase().includes(query) ||
        l.ID_PENGADUAN.toLowerCase().includes(query) ||
        l.KETERANGAN.toLowerCase().includes(query)
      );
    }
  }, [activeSheet, searchQuery, complaints, officers, managers, logs]);

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.ID_PETUGAS.trim() || !newOfficer.NAMA_PETUGAS.trim() || !newOfficer.JABATAN.trim() || !newOfficer.EMAIL.trim()) {
      setModalError("Semua field wajib diisi");
      return;
    }
    if (officers.some((o) => o.ID_PETUGAS.toUpperCase() === newOfficer.ID_PETUGAS.toUpperCase())) {
      setModalError("ID Petugas sudah ada dalam database");
      return;
    }

    onUpdateOfficers([...officers, { ...newOfficer, ID_PETUGAS: newOfficer.ID_PETUGAS.toUpperCase() }]);
    setShowAddOfficerModal(false);
    setNewOfficer({
      ID_PETUGAS: "",
      NAMA_PETUGAS: "",
      JABATAN: "",
      UNIT_KERJA: "Seksi Survei dan Pemetaan",
      EMAIL: "",
      STATUS: "Aktif"
    });
    setModalError("");
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManager.ID_MANAGER.trim() || !newManager.NAMA_MANAGER.trim() || !newManager.EMAIL.trim() || !newManager.JABATAN.trim()) {
      setModalError("Semua field wajib diisi");
      return;
    }
    if (managers.some((m) => m.ID_MANAGER.toUpperCase() === newManager.ID_MANAGER.toUpperCase())) {
      setModalError("ID Manager sudah ada dalam database");
      return;
    }

    onUpdateManagers([...managers, { ...newManager, ID_MANAGER: newManager.ID_MANAGER.toUpperCase() }]);
    setShowAddManagerModal(false);
    setNewManager({
      ID_MANAGER: "",
      NAMA_MANAGER: "",
      EMAIL: "",
      JABATAN: ""
    });
    setModalError("");
  };

  const deleteOfficer = (id: string) => {
    if (confirm(`Hapus petugas dengan ID ${id}?`)) {
      onUpdateOfficers(officers.filter((o) => o.ID_PETUGAS !== id));
    }
  };

  const deleteManager = (id: string) => {
    if (confirm(`Hapus manager dengan ID ${id}?`)) {
      onUpdateManagers(managers.filter((m) => m.ID_MANAGER !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Controller */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-slate-950 pb-5">
        <div>
          <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Table className="w-5 h-5 text-slate-950 shrink-0 stroke-[3]" />
            Integrasi Spreadsheet Database
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Melihat data realtime tersinkronisasi otomatis dengan database sheet virtual</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onResetDatabase}
            className="bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-900 font-black uppercase tracking-widest rounded-xl px-4 py-2.5 text-[10px] flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            title="Kembalikan database ke kondisi awal pabrik"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
            <span>Reset Database Virtual</span>
          </button>
          
          <button 
            onClick={exportToCSV}
            className="bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-950 text-slate-900 font-black uppercase tracking-widest rounded-xl px-4 py-2.5 text-[10px] flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Ekspor (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="flex border-b-2 border-slate-950 overflow-x-auto gap-1">
        {(["DATA_PENGADUAN", "MASTER_PETUGAS", "MASTER_MANAGER", "LOG_AKTIVITAS"] as ActiveSheet[]).map((tab) => {
          const isActive = activeSheet === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveSheet(tab);
                setSearchQuery("");
              }}
              className={`px-5 py-3.5 font-mono text-xs font-black border-b-4 whitespace-nowrap transition-all uppercase tracking-wider ${isActive ? 'border-slate-950 text-slate-900 bg-yellow-400/90' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-400'}`}
            >
              📊 {tab.replace("_", " ")}
            </button>
          );
        })}
      </div>

      {/* Table Utility Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input 
            type="text"
            placeholder={`Cari dalam ${activeSheet.replace("_", " ")}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-950 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <Search className="w-4 h-4 text-slate-950 absolute left-3 top-3.5 stroke-[3]" />
        </div>

        {/* Dynamic Plus Button for Masters */}
        {activeSheet === "MASTER_PETUGAS" && (
          <button 
            onClick={() => { setShowAddOfficerModal(true); setModalError(""); }}
            className="bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-950 text-slate-900 font-black rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Master Petugas</span>
          </button>
        )}

        {activeSheet === "MASTER_MANAGER" && (
          <button 
            onClick={() => { setShowAddManagerModal(true); setModalError(""); }}
            className="bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-950 text-slate-900 font-black rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Master Manager</span>
          </button>
        )}
      </div>

      {/* Table View */}
      <div className="bg-white border-2 border-slate-950 rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full border-collapse text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-wider sticky top-0 z-10 border-b-2 border-slate-950">
              {activeSheet === "DATA_PENGADUAN" && (
                <tr>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">ID_PENGADUAN</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">TGL_PENGADUAN</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">NAMA_PELAPOR</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">HP</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">NO_BERKAS</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">PETUGAS_LAPANGAN</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">JENIS_LAYANAN</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">KATEGORI</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">STATUS</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">MANAGER_VERIFIKASI</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">PETUGAS_PJ</th>
                  <th className="p-3.5 bg-slate-900 text-white">TARGET_SELESAI</th>
                </tr>
              )}
              {activeSheet === "MASTER_PETUGAS" && (
                <tr>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">ID_PETUGAS</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">NAMA_PETUGAS</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">JABATAN</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">UNIT_KERJA</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">EMAIL</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">STATUS</th>
                  <th className="p-3.5 bg-slate-900 text-white text-right">AKSI</th>
                </tr>
              )}
              {activeSheet === "MASTER_MANAGER" && (
                <tr>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">ID_MANAGER</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">NAMA_MANAGER</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">EMAIL</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">JABATAN</th>
                  <th className="p-3.5 bg-slate-900 text-white text-right">AKSI</th>
                </tr>
              )}
              {activeSheet === "LOG_AKTIVITAS" && (
                <tr>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">TANGGAL</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">USER</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">AKTIVITAS</th>
                  <th className="p-3.5 bg-slate-900 text-white border-r border-slate-800">ID_PENGADUAN</th>
                  <th className="p-3.5 bg-slate-900 text-white">KETERANGAN</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y-2 divide-slate-950">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Tidak ada baris data yang cocok dengan kriteria pencarian
                  </td>
                </tr>
              ) : (
                filteredData.map((row: any, index) => {
                  if (activeSheet === "DATA_PENGADUAN") {
                    return (
                      <tr key={row.ID_PENGADUAN} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="p-3.5 font-mono font-black text-slate-900 whitespace-nowrap border-r border-slate-200">{row.ID_PENGADUAN}</td>
                        <td className="p-3.5 whitespace-nowrap font-bold border-r border-slate-200">{row.TGL_PENGADUAN}</td>
                        <td className="p-3.5 font-black text-slate-900 whitespace-nowrap border-r border-slate-200">{row.NAMA_PELAPOR}</td>
                        <td className="p-3.5 font-mono font-bold border-r border-slate-200">{row.HP}</td>
                        <td className="p-3.5 font-mono font-bold whitespace-nowrap border-r border-slate-200">{row.NO_BERKAS}</td>
                        <td className="p-3.5 font-bold truncate max-w-[120px] border-r border-slate-200">{row.PETUGAS_LAPANGAN}</td>
                        <td className="p-3.5 text-slate-900 font-black whitespace-nowrap border-r border-slate-200">{row.JENIS_LAYANAN}</td>
                        <td className="p-3.5 text-slate-900 font-black whitespace-nowrap border-r border-slate-200">{row.KATEGORI}</td>
                        <td className="p-3.5 whitespace-nowrap border-r border-slate-200">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 border-slate-950 ${
                            row.STATUS === "Selesai" ? "bg-emerald-400 text-slate-950" : 
                            row.STATUS === "Ditolak" ? "bg-rose-400 text-slate-950" : "bg-yellow-400 text-slate-950"
                          }`}>{row.STATUS}</span>
                        </td>
                        <td className="p-3.5 font-bold truncate max-w-[120px] border-r border-slate-200">{row.MANAGER_VERIFIKASI || "-"}</td>
                        <td className="p-3.5 font-bold truncate max-w-[120px] text-slate-900 border-r border-slate-200">{row.PETUGAS_PENANGGUNG_JAWAB || "-"}</td>
                        <td className="p-3.5 text-slate-900 font-mono font-black whitespace-nowrap">{row.TARGET_SELESAI || "-"}</td>
                      </tr>
                    );
                  } else if (activeSheet === "MASTER_PETUGAS") {
                    return (
                      <tr key={row.ID_PETUGAS} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="p-3.5 font-mono font-black text-slate-900 border-r border-slate-200">{row.ID_PETUGAS}</td>
                        <td className="p-3.5 font-black text-slate-900 border-r border-slate-200">{row.NAMA_PETUGAS}</td>
                        <td className="p-3.5 font-bold border-r border-slate-200">{row.JABATAN}</td>
                        <td className="p-3.5 font-bold border-r border-slate-200">{row.UNIT_KERJA}</td>
                        <td className="p-3.5 font-mono font-semibold border-r border-slate-200">{row.EMAIL}</td>
                        <td className="p-3.5 border-r border-slate-200">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 border-slate-950 ${row.STATUS === "Aktif" ? "bg-emerald-400 text-slate-950" : "bg-slate-200 text-slate-600"}`}>{row.STATUS}</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button onClick={() => deleteOfficer(row.ID_PETUGAS)} className="p-1.5 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg border-2 border-transparent hover:border-slate-950 transition-all" title="Hapus Petugas">
                            <Trash2 className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    );
                  } else if (activeSheet === "MASTER_MANAGER") {
                    return (
                      <tr key={row.ID_MANAGER} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="p-3.5 font-mono font-black text-slate-900 border-r border-slate-200">{row.ID_MANAGER}</td>
                        <td className="p-3.5 font-black text-slate-900 border-r border-slate-200">{row.NAMA_MANAGER}</td>
                        <td className="p-3.5 font-mono font-semibold border-r border-slate-200">{row.EMAIL}</td>
                        <td className="p-3.5 font-bold border-r border-slate-200">{row.JABATAN}</td>
                        <td className="p-3.5 text-right">
                          <button onClick={() => deleteManager(row.ID_MANAGER)} className="p-1.5 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg border-2 border-transparent hover:border-slate-950 transition-all" title="Hapus Manager">
                            <Trash2 className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="p-3.5 font-mono text-[10px] whitespace-nowrap border-r border-slate-200 font-bold">{row.TANGGAL}</td>
                        <td className="p-3.5 font-black text-slate-900 whitespace-nowrap border-r border-slate-200">{row.USER}</td>
                        <td className="p-3.5 text-slate-900 font-bold whitespace-nowrap border-r border-slate-200">{row.AKTIVITAS}</td>
                        <td className="p-3.5 font-mono font-black whitespace-nowrap text-slate-900 border-r border-slate-200">{row.ID_PENGADUAN}</td>
                        <td className="p-3.5 text-slate-700 font-semibold">{row.KETERANGAN}</td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative">
            <button onClick={() => setShowAddOfficerModal(false)} className="p-1.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-950 rounded-xl text-slate-950 absolute right-4 top-4 transition-colors">
              <X className="w-5 h-5 stroke-[3]" />
            </button>
            <h4 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Tambah Master Petugas</h4>
            
            {modalError && (
              <div className="mb-4 bg-rose-100 border-2 border-slate-950 text-rose-950 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[3]" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddOfficer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">ID_PETUGAS (Unik, misal PTG-006)</label>
                <input 
                  type="text"
                  placeholder="PTG-XXX"
                  value={newOfficer.ID_PETUGAS}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, ID_PETUGAS: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Nama Petugas Lapangan</label>
                <input 
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={newOfficer.NAMA_PETUGAS}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, NAMA_PETUGAS: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Jabatan Fungsional</label>
                <input 
                  type="text"
                  placeholder="Jabatan"
                  value={newOfficer.JABATAN}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, JABATAN: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Unit Kerja / Seksi</label>
                <select 
                  value={newOfficer.UNIT_KERJA}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, UNIT_KERJA: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                >
                  <option value="Seksi Survei dan Pemetaan">Seksi Survei dan Pemetaan</option>
                  <option value="Seksi Penetapan Hak dan Pendaftaran">Seksi Penetapan Hak dan Pendaftaran</option>
                  <option value="Seksi Hubungan Hukum Pertanahan">Seksi Hubungan Hukum Pertanahan</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Email Dinas</label>
                <input 
                  type="email"
                  placeholder="contoh@bpn.go.id"
                  value={newOfficer.EMAIL}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, EMAIL: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="pt-4 border-t-2 border-slate-950 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddOfficerModal(false)} className="border-2 border-slate-950 hover:bg-slate-50 text-slate-900 font-black uppercase tracking-widest rounded-xl px-4 py-2 text-[10px]">Batal</button>
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 border-2 border-slate-950 font-black uppercase tracking-widest rounded-xl px-4 py-2.5 text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">Simpan Petugas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddManagerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative">
            <button onClick={() => setShowAddManagerModal(false)} className="p-1.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-950 rounded-xl text-slate-950 absolute right-4 top-4 transition-colors">
              <X className="w-5 h-5 stroke-[3]" />
            </button>
            <h4 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Tambah Master Manager</h4>
            
            {modalError && (
              <div className="mb-4 bg-rose-100 border-2 border-slate-950 text-rose-950 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[3]" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddManager} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">ID_MANAGER (Unik, misal MGR-004)</label>
                <input 
                  type="text"
                  placeholder="MGR-XXX"
                  value={newManager.ID_MANAGER}
                  onChange={(e) => setNewManager(prev => ({ ...prev, ID_MANAGER: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Nama Lengkap Manager</label>
                <input 
                  type="text"
                  placeholder="Nama Lengkap & Gelar"
                  value={newManager.NAMA_MANAGER}
                  onChange={(e) => setNewManager(prev => ({ ...prev, NAMA_MANAGER: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Email Dinas</label>
                <input 
                  type="email"
                  placeholder="contoh@bpn.go.id"
                  value={newManager.EMAIL}
                  onChange={(e) => setNewManager(prev => ({ ...prev, EMAIL: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Jabatan Dinas</label>
                <input 
                  type="text"
                  placeholder="Kepala Seksi / Koordinator..."
                  value={newManager.JABATAN}
                  onChange={(e) => setNewManager(prev => ({ ...prev, JABATAN: e.target.value }))}
                  className="w-full bg-white border-2 border-slate-950 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="pt-4 border-t-2 border-slate-950 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddManagerModal(false)} className="border-2 border-slate-950 hover:bg-slate-50 text-slate-900 font-black uppercase tracking-widest rounded-xl px-4 py-2 text-[10px]">Batal</button>
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 border-2 border-slate-950 font-black uppercase tracking-widest rounded-xl px-4 py-2.5 text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">Simpan Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
