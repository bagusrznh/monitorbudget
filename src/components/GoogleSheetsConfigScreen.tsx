/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  HelpCircle, 
  Copy, 
  Check, 
  FileText, 
  Globe, 
  RefreshCw,
  Clock,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { BudgetRequest, VehicleDetail } from '../types';

interface GoogleSheetsConfigScreenProps {
  requests: BudgetRequest[];
}

export default function GoogleSheetsConfigScreen({ requests }: GoogleSheetsConfigScreenProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('https://docs.google.com/spreadsheets/d/1XyZ_aftersales_tunas_rent_budget_maint/edit');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'vehicles'>('requests');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2500);
  };

  const requestColumns = [
    { label: 'id_request', type: 'VARCHAR (Primary Key)', desc: 'ID unik budget request (e.g., req-001, req-120)' },
    { label: 'tanggal_request', type: 'DATE (YYYY-MM-DD)', desc: 'Tanggal masuk request marketing' },
    { label: 'tanggal_submit_budget', type: 'DATE (YYYY-MM-DD)', desc: 'Target tanggal submit rincian budget' },
    { label: 'aging_sla', type: 'INTEGER', desc: 'Selisih hari kalkulasi pengerjaan SLA (hari libur dieksklusi)' },
    { label: 'nama_customer', type: 'VARCHAR (150)', desc: 'Nama lengkap customer pemakai unit rental Tunas Rent' },
    { label: 'bidang_usaha', type: 'VARCHAR (100)', desc: 'Kategori industri customer (e.g., Komunikasi, Bank)' },
    { label: 'tender_non_tender', type: 'VARCHAR (e.g. tender / non-tender)', desc: 'Klasifikasi tipe tender' },
    { label: 'cabang', type: 'VARCHAR (50)', desc: 'Gudang cabang regional (e.g., Bandung, Jakarta, Surabaya)' },
    { label: 'status', type: 'VARCHAR (Request / SUBMIT / PENDING)', desc: 'Kondisi tahapan approval budget maintenance' },
    { label: 'note_atpm', type: 'TEXT', desc: 'Draft penyesuaian aksesoris / note upgrade spesifikasi unit' },
    { label: 'form_input_aftersales', type: 'TEXT', desc: 'Directives feedback audit atau penyesuaian team Aftersales Tunas Rent' }
  ];

  const vehicleColumns = [
    { label: 'id_request', type: 'VARCHAR (Foreign Key)', desc: 'Relasi foreign key merujuk ke id_request di sheet Requests' },
    { label: 'vehicle_id', type: 'VARCHAR (Primary Key)', desc: 'ID baris kendaraan spesifik' },
    { label: 'jenis_kendaraan', type: 'VARCHAR (200)', desc: 'Tipe model unit ATPM (e.g., Hilux, Pajero)' },
    { label: 'nopol_used_car', type: 'VARCHAR (15)', desc: 'Pelat nomor jika merupakan unit used / bekas pakai' },
    { label: 'qty', type: 'INTEGER', desc: 'Jumlah armada unit yang diajukan' },
    { label: 'tahun', type: 'INTEGER', desc: 'Tahun pembuatan mobil pabrik' },
    { label: 'type', type: 'VARCHAR (High / Standard / Low)', desc: 'Klasifikasi rujukan estimasi biaya' },
    { label: 'tenor', type: 'INTEGER', desc: 'Masa tenor kontrak pemakaian dalam satuan bulan' },
    { label: 'lokasi_pemakaian', type: 'VARCHAR (100)', desc: 'Area rute perjalanan operasional kendaraan' },
    { label: 'pool_penanggung_jawab', type: 'VARCHAR (100)', desc: 'Pool depo representasi aftersales' },
    { label: 'budget_maintenance', type: 'DECIMAL', desc: 'Nominal rujukan rupiah budget maintenance yang dialokasikan' }
  ];

  // Simulated Sheet Sync operation
  const handleSyncToSheets = () => {
    setIsSyncing(true);
    setSyncLogs(['Inisialisasi koneksi Google Sheets API...', 'Mengakses spreadsheet ID memakai Google OAuth...']);
    
    setTimeout(() => {
      setSyncLogs(prev => [...prev, 'Menghapus data rest lama pada Sheet: "Budget_Requests"...', `Mengunggah ${requests.length} baris records untuk schema "Budget_Requests"...`]);
    }, 1000);

    setTimeout(() => {
      const fleetCount = requests.reduce((s, c) => s + (c.vehicles?.length || 0), 0);
      setSyncLogs(prev => [...prev, 'Menyinkronkan Sheet baris cabang: "Vehicle_Specifications"...', `Berhasil memetakan total ${fleetCount} baris spesifikasi kendaraan.`]);
    }, 2000);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, 'Sinkronisasi berhasil! Spreadsheet database Aftersales Tunas Rent up-to-date.']);
      setIsConnected(true);
      setIsSyncing(false);
    }, 3200);
  };

  // Trigger spreadsheet CSV export triggers as prototype download backup!
  const triggerCsvDownload = (type: 'requests' | 'vehicles') => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'requests') {
      headers = requestColumns.map(c => c.label);
      rows = requests.map(r => [
        `"${r.id}"`,
        `"${r.tanggalRequest}"`,
        `"${r.tanggalSubmitBudget}"`,
        `"${r.aging}"`,
        `"${r.namaCustomer.replace(/"/g, '""')}"`,
        `"${r.bidangUsahaCustomer.replace(/"/g, '""')}"`,
        `"${r.tenderNonTender}"`,
        `"${r.cabang}"`,
        `"${r.status}"`,
        `"${r.noteAtpm ? r.noteAtpm.replace(/"/g, '""').replace(/\n/g, ' ') : ''}"`,
        `"${r.formInputAftersales ? r.formInputAftersales.replace(/"/g, '""').replace(/\n/g, ' ') : ''}"`
      ]);
    } else {
      headers = vehicleColumns.map(c => c.label);
      requests.forEach(r => {
        if (r.vehicles) {
          r.vehicles.forEach(v => {
            rows.push([
              `"${r.id}"`,
              `"${v.id}"`,
              `"${v.jenisKendaraan.replace(/"/g, '""')}"`,
              `"${v.nopolUsedCar}"`,
              `"${v.qty}"`,
              `"${v.tahun}"`,
              `"${v.type}"`,
              `"${v.tenor}"`,
              `"${v.lokasiPemakaian}"`,
              `"${v.poolPenanggungJawab}"`,
              `"${v.budgetMaintenance || 0}"`
            ]);
          });
        }
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TunasRent_${type}_Schema.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Google Sheets Database Sync Control</h2>
        <p className="text-on-surface-variant font-body-md mt-1">
          Bantu konfigurasi setup table spreadsheet dengan integrasi dua arah (Google Sheets Database) untuk **Aftersales Tunas Rent**.
        </p>
      </div>

      {/* Overview Block */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* URL Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans">
            Google Spreadsheet URL / ID
          </label>
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-2.5 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-xs leading-none font-mono text-on-surface"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <button
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync ke Sheets'}</span>
            </button>
          </div>

          {/* Sync Status Logs */}
          {syncLogs.length > 0 && (
            <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg font-mono text-xs text-on-surface-variant space-y-1 max-h-[140px] overflow-y-auto">
              <strong className="text-[10px] text-secondary tracking-widest uppercase block mb-1">Log Transmisi Data:</strong>
              {syncLogs.map((log, index) => (
                <div key={index} className="flex gap-1.5 items-center">
                  <span className="text-[#107C41]">►</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {isConnected && (
            <div className="p-3 bg-secondary-container/10 border border-[#107C41]/20 rounded-xl text-xs text-[#0A5D31] flex items-center justify-between font-semibold font-sans">
              <span>🚀 Link Terkoneksi Lancar! Sinkronisasi dua arah berhasil dikonfigurasi.</span>
              <a 
                href={spreadsheetUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-primary hover:underline flex items-center gap-1 font-bold"
              >
                <span>Buka Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Quick Instructions list */}
        <div className="bg-[#E7F5ED]/30 border border-[#107C41]/10 rounded-xl p-5 space-y-3 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-bold text-xs text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Quick Setup Checklist</span>
            </h4>
            <ul className="space-y-2 text-[11px] text-on-surface-variant font-sans">
              <li className="flex gap-2 items-start">
                <span className="text-xs text-[#107C41] font-bold">1.</span>
                <span>Buat file Google Sheet baru bernama <strong>"Aftersales Tunas Rent Budget Maintenance"</strong>.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-xs text-[#107C41] font-bold">2.</span>
                <span>Ubah nama tab bawah sheet pertama jadi <strong>"Budget_Requests"</strong>.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-xs text-[#107C41] font-bold">3.</span>
                <span>Tambah tab sheet kedua bernama <strong>"Vehicle_Specifications"</strong>.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-xs text-[#107C41] font-bold">4.</span>
                <span>Salin & tempel daftar kolom di bawah ini ke baris 1 masing-masing sheet!</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-mono block text-on-surface-variant font-semibold">
              Platform: Tunas Rent Integration Gateway
            </span>
          </div>
        </div>
      </div>

      {/* Tab Header Selector */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex flex-wrap justify-between items-center bg-surface-container-lowest gap-3">
          <div className="flex gap-1 border border-outline-variant/60 rounded-lg p-1 bg-surface-container-low select-none">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md font-sans transition-all flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tab 1: Budget_Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md font-sans transition-all flex items-center gap-1.5 ${
                activeTab === 'vehicles'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tab 2: Vehicle_Specifications</span>
            </button>
          </div>

          <button
            onClick={() => triggerCsvDownload(activeTab)}
            className="px-3.5 py-1.5 border border-outline-variant hover:bg-surface-container-low text-on-surface text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Unduh CSV Rujukan (Pre-Filled)</span>
          </button>
        </div>

        {/* Database columns schema guide */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-on-surface">
            <span>
              Panduan susunan kolom untuk tab spreadsheet <strong>"{activeTab === 'requests' ? 'Budget_Requests' : 'Vehicle_Specifications'}"</strong>:
            </span>
            <button
              type="button"
              onClick={() => {
                const columnStr = (activeTab === 'requests' ? requestColumns : vehicleColumns).map(c => c.label).join('\t');
                handleCopy(columnStr, 'all-headers');
              }}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
            >
              {copiedTextId === 'all-headers' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-secondary" />
                  <span>Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Semua Kolom (Siap Paste di Excel/Sheet)</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto border border-outline-variant/60 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold text-on-surface-variant select-none">
                  <th className="p-3 w-1/4">Nama Kolom (Gunakan Huruf Kecil)</th>
                  <th className="p-3 w-1/4">Tipe Data</th>
                  <th className="p-3 w-3/8">Penjelasan Rujukan Sistem</th>
                  <th className="p-3 w-1/8 text-center">Salin</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-on-surface divide-y divide-outline-variant">
                {(activeTab === 'requests' ? requestColumns : vehicleColumns).map((col) => (
                  <tr key={col.label} className="hover:bg-surface-container-low/40">
                    <td className="p-3 font-semibold text-primary">{col.label}</td>
                    <td className="p-3 text-secondary font-semibold">{col.type}</td>
                    <td className="p-3 text-on-surface-variant font-sans leading-relaxed">{col.desc}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleCopy(col.label, col.label)}
                        className="p-1.5 hover:bg-surface-container rounded-md transition-all text-on-surface-variant"
                        title="Salin nama kolom saja"
                      >
                        {copiedTextId === col.label ? (
                          <Check className="w-3.5 h-3.5 text-secondary font-black" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
