/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Info, 
  Edit3, 
  Trash2, 
  Calendar,
  X,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Holiday } from '../types';

interface HolidayScreenProps {
  holidays: Holiday[];
  onAddHoliday: (holiday: Holiday) => void;
  onEditHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (holidayId: string) => void;
}

export default function HolidayScreen({
  holidays,
  onAddHoliday,
  onEditHoliday,
  onDeleteHoliday
}: HolidayScreenProps) {
  // Query state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formId, setFormId] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formTahun, setFormTahun] = useState(2026);
  const [isEditing, setIsEditing] = useState(false);

  // Status toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter list
  const filteredHolidays = holidays.filter(hol => {
    const matchesSearch = hol.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          hol.tanggal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = hol.tahun === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Pagination parameters
  const totalItems = filteredHolidays.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedHolidays = filteredHolidays.slice(startIndex, startIndex + rowsPerPage);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormId(`hol-${Math.floor(Math.random() * 100000)}`);
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormKeterangan('');
    setFormTahun(selectedYear);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (hol: Holiday) => {
    setFormId(hol.id);
    // Parse formatting if it's e.g. "1 Jan 2024" to "2024-01-01" fallback
    let dateVal = hol.tanggal;
    if (!Date.parse(dateVal)) {
      // simple mapper fallback
      dateVal = new Date(`${hol.tahun}-01-01`).toISOString().split('T')[0];
    } else {
      dateVal = new Date(hol.tanggal).toISOString().split('T')[0];
    }

    setFormTanggal(dateVal);
    setFormKeterangan(hol.keterangan);
    setFormTahun(hol.tahun);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeterangan.trim()) {
      alert('Description/Keterangan cannot be empty!');
      return;
    }

    // Format Date string nicely as "D MMM YYYY" for indonesian style
    let formattedDate = formTanggal;
    try {
      const d = new Date(formTanggal);
      if (!isNaN(d.getTime())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      }
    } catch {}

    const parsedYear = new Date(formTanggal).getFullYear() || formTahun;

    const payload: Holiday = {
      id: formId,
      tanggal: formattedDate,
      keterangan: formKeterangan,
      tahun: parsedYear
    };

    if (isEditing) {
      onEditHoliday(payload);
      triggerToast('Public holiday modified successfully.');
    } else {
      onAddHoliday(payload);
      triggerToast('New public holiday registered.');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Master Libur</h2>
          <p className="text-on-surface-variant font-body-md mt-1">
            Manage company holiday schedules, regional public lockouts, and workforce availability parameters.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2.5 rounded-lg font-sans font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 transform active:scale-98 select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Libur</span>
        </button>
      </div>

      {/* Floating alert toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 font-body-md z-50">
          <CheckCircle2 className="w-5 h-5 text-[#30f283]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Access Restriction Notice Banner */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-secondary-container text-primary">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-sans font-bold text-sm text-on-surface">Access Restricted Area</h4>
          <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
            Manajemen Master Libur hanya dapat dilakukan oleh pengguna dengan otorisasi Administrator HR atau Finance. Perubahan akan langsung mempengaruhi SLA dashboard.
          </p>
        </div>
      </div>

      {/* Holidays Data Container with Searching and Filtering */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs flex flex-col overflow-hidden">
        
        {/* Search controls row */}
        <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center gap-4 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari hari libur..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary transition-all h-9"
            />
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-surface-container border border-outline-variant rounded-lg px-3 py-1 text-sm font-sans font-semibold text-on-surface focus:outline-hidden focus:border-primary h-9 outline-hidden"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>

        {/* Dynamic Holidays List table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-16 text-center select-none">No</th>
                <th className="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-48">Tanggal Libur</th>
                <th className="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Keterangan</th>
                <th className="py-2.5 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-28 select-none pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-data-tabular text-data-tabular text-on-surface">
              {paginatedHolidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-on-surface-variant italic font-sans">
                    Tidak ada hari libur publik terdaftar untuk tahun {selectedYear}. Klik "+ Tambah Libur" untuk menambah data baru.
                  </td>
                </tr>
              ) : (
                paginatedHolidays.map((hol, idx) => {
                  const noIdx = startIndex + idx + 1;
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/70';
                  
                  return (
                    <tr 
                      key={hol.id} 
                      className={`hover:bg-surface-container-low transition-colors group h-10 ${rowBg}`}
                    >
                      {/* No column */}
                      <td className="py-2 px-4 text-center text-on-surface-variant font-sans select-none">{noIdx}</td>
                      
                      {/* Holiday Date */}
                      <td className="py-2 px-4 font-medium text-on-surface whitespace-nowrap">{hol.tanggal}</td>
                      
                      {/* Description */}
                      <td className="py-2 px-4 text-on-surface-variant select-text group-hover:text-on-surface transition-colors">{hol.keterangan}</td>
                      
                      {/* Edit or Delete Action triggers */}
                      <td className="py-2 px-4 text-right pr-6 select-none">
                        <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(hol)}
                            className="text-secondary hover:text-primary p-1.5 rounded-md hover:bg-surface-container transition-all"
                            title="Edit keterangan libur"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus libur "${hol.keterangan}"?`)) {
                                onDeleteHoliday(hol.id);
                                triggerToast('Libur removed from registry files.');
                              }
                            }}
                            className="text-error hover:bg-error-container/20 p-1.5 rounded-md transition-all ml-1"
                            title="Hapus dari database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination details */}
        <div className="p-4 border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm select-none font-sans">
          <span>Menampilkan {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + rowsPerPage, totalItems)} dari {totalItems} hari libur</span>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 font-sans font-semibold">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high disabled:opacity-40 text-xs text-on-surface font-sans"
              >
                Seb
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 border rounded-md text-xs font-sans ${
                      isCurrent
                        ? 'border-primary bg-primary-container text-on-primary font-bold'
                        : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 border border-outline-variant rounded-md hover:bg-surface-container-high disabled:opacity-40 text-xs text-on-surface font-sans"
              >
                Sel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-Up Form Dialogue Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-outline shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span>{isEditing ? 'Ubah Libur' : 'Tambah Libur Baru'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/30 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                  Tanggal Libur
                </label>
                <input
                  type="date"
                  required
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                  Keterangan / Nama Libur
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hari Raya Idul Fitri"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary transition-all"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-outline-variant hover:bg-surface-container text-on-surface font-sans font-semibold text-sm rounded-lg shadow-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container text-sm font-bold rounded-lg shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
