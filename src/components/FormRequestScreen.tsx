/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Send, 
  CheckCircle, 
  X,
  FilePlus2,
  Undo2,
  Mail,
  ShieldCheck,
  Building2,
  Inbox
} from 'lucide-react';
import { BudgetRequest, VehicleDetail, BRANCHES, INITIAL_VEHICLES_MKT, BranchCcConfig, UserAccount } from '../types';

interface FormRequestScreenProps {
  editingRequest?: BudgetRequest | null;
  onSave: (request: BudgetRequest) => void;
  onCancel: () => void;
  branchCcConfigs: BranchCcConfig[];
  currentUser: UserAccount | null;
}

export default function FormRequestScreen({
  editingRequest,
  onSave,
  onCancel,
  branchCcConfigs,
  currentUser
}: FormRequestScreenProps) {
  // Local form state
  const [id, setId] = useState('');
  const [cabang, setCabang] = useState(BRANCHES[1]); // Bandung as initial
  const [namaCustomer, setNamaCustomer] = useState('');
  const [bidangUsahaCustomer, setBidangUsahaCustomer] = useState('');
  const [tanggalRequest, setTanggalRequest] = useState('');
  const [tanggalSubmitBudget, setTanggalSubmitBudget] = useState('');
  const [noteAtpm, setNoteAtpm] = useState('');
  const [formInputAftersales, setFormInputAftersales] = useState('');
  const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
  const [tenderNonTender, setTenderNonTender] = useState<'tender' | 'non tender'>('non tender');

  // Tender File upload states & Google Drive details
  const [tenderFiles, setTenderFiles] = useState<{ name: string; size: number; mimeType: string; fileId?: string; url?: string }[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [driveAuthToken, setDriveAuthToken] = useState<string>('');

  // Popup messages
  const [notification, setNotification] = useState<string | null>(null);
  const [showEmailReport, setShowEmailReport] = useState<boolean>(false);
  const [emailDetails, setEmailDetails] = useState<{
    to: string;
    cc: string[];
    replyCc?: string;
    subject: string;
    body: string;
  } | null>(null);

  // Load from editingRequest if exists
  useEffect(() => {
    if (editingRequest) {
      setId(editingRequest.id);
      setCabang(editingRequest.cabang);
      setNamaCustomer(editingRequest.namaCustomer);
      setBidangUsahaCustomer(editingRequest.bidangUsahaCustomer);
      setTanggalRequest(editingRequest.tanggalRequest);
      setTanggalSubmitBudget(editingRequest.tanggalSubmitBudget);
      setNoteAtpm(editingRequest.noteAtpm);
      setFormInputAftersales(editingRequest.formInputAftersales);
      setVehicles(editingRequest.vehicles);
      setTenderNonTender(editingRequest.tenderNonTender);
      setTenderFiles(editingRequest.tenderFiles || []);
    } else {
      // Setup fresh fields with today's date
      const today = new Date().toISOString().split('T')[0];
      setId(`req-${Math.floor(Math.random() * 900000) + 100000}`);
      setCabang(BRANCHES[1]); // Default Bandung
      setNamaCustomer('PT LEN RAIWAY SYSTEMS'); // Prepopulate to match picture
      setBidangUsahaCustomer('komunikasi'); // Prepopulate to match picture
      setTanggalRequest('2026-05-20'); // Prepopulate to match picture
      setTanggalSubmitBudget('2026-05-20'); // Prepopulate to match picture
      setNoteAtpm('-Untuk mobil di pakai dalam kota dan dalam hutan di daerah propinsi riau Untuk pekerja pemasangan alat komunikan Untuk PT pertamina dan Maintenace alat komunikasi nya\n- standar ban nya AT Untuk Hilux\n- unit bukan tender customer ini sudah jadi costomer kita pemakai sekarang masih kota ada di Jakarta yogya bandung');
      setFormInputAftersales('');
      setVehicles([...INITIAL_VEHICLES_MKT]); // Prepopulate vehicle rows
      setTenderNonTender('non tender');
      setTenderFiles([]);
    }
  }, [editingRequest]);

  // Find active CC guidelines for the targeted branch area
  const activeBranchConfig = branchCcConfigs.find(
    cfg => cfg.cabang.toLowerCase() === cabang.toLowerCase()
  ) || {
    cabang,
    emailBos: `bos.${cabang.toLowerCase()}@tunasrent.com`,
    emailTeamAdminCC: `admin.${cabang.toLowerCase()}@tunasrent.com`
  };

  // Google Drive File Upload & Simulation handlers
  const handleFileChange = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setIsUploading(true);
    setUploadProgress(12);
    setUploadStatusMsg('Connecting to Google API Directory...');

    const file = filesList[0];
    const newFileEntry = {
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/pdf',
      url: `https://drive.google.com/drive/u/0/folders/tender_folder_aftersales_id`
    };

    // Incremental progress steps updating bar and statuses
    const statusLogs = [
      'Mencari rujukan folder "tender" di Google Drive...',
      'Folder "tender" terdeteksi, bersiap melakukan multipart upload...',
      'Mengirimkan binary data ke Google Drive: drive.googleapis.com/upload/...',
      'Mengunggah berkas kelengkapan tender (Mengonversi metadata)...',
      'Mendesentralisasikan replika penyimpanan...',
      'Sinkronisasi Google Drive Berhasil!'
    ];

    let currentStep = 0;
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTenderFiles(curr => {
            // Avoid duplicates
            if (curr.some(f => f.name === file.name)) return curr;
            return [...curr, newFileEntry];
          });
          setIsUploading(false);
          showToast(`Berkas "${file.name}" berhasil masuk ke folder /tender/ di Google Drive.`);
          return 100;
        }

        const msgIndex = Math.min(currentStep, statusLogs.length - 1);
        setUploadStatusMsg(statusLogs[msgIndex]);
        currentStep += 1;

        return prev + 22 >= 100 ? 100 : prev + 22;
      });
    }, 550);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleRemoveTenderFile = (fileName: string) => {
    setTenderFiles(curr => curr.filter(f => f.name !== fileName));
    showToast(`Berkas "${fileName}" dihapus dari daftar.`);
  };

  // Handle adding a blank vehicle row
  const handleAddRow = () => {
    const newVehicle: VehicleDetail = {
      id: `v-local-${Math.floor(Math.random() * 10000)}`,
      jenisKendaraan: '',
      nopolUsedCar: '',
      qty: 1,
      tahun: 2026,
      type: 'Standard',
      tenor: 36,
      lokasiPemakaian: '',
      poolPenanggungJawab: '',
      budgetMaintenance: null
    };

    setVehicles([...vehicles, newVehicle]);
    showToast('Empty row added to vehicles details.');
  };

  // Handle removing a vehicle row
  const handleRemoveRow = (rowId: string) => {
    setVehicles(vehicles.filter(v => v.id !== rowId));
    showToast('Vehicle specification row removed.');
  };

  // Input listener for dynamic row cells
  const handleRowChange = (rowId: string, field: keyof VehicleDetail, value: any) => {
    setVehicles(prevVehicles =>prevVehicles.map(v => {
      if (v.id === rowId) {
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  // Toast notifier
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Trigger submittal or draft request
  const handleSubmit = (status: 'Request' | 'SUBMIT') => {
    if (!namaCustomer.trim()) {
      showToast('Please specify the Customer Name.');
      return;
    }

    let calculatedAging = 7;
    if (tanggalRequest && tanggalSubmitBudget) {
      const d1 = new Date(tanggalRequest);
      const d2 = new Date(tanggalSubmitBudget);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (!isNaN(diffDays)) {
        calculatedAging = diffDays;
      }
    }

    const payload: BudgetRequest = {
      id,
      tanggalRequest,
      tanggalSubmitBudget,
      aging: calculatedAging,
      namaCustomer,
      bidangUsahaCustomer,
      tenderNonTender,
      cabang,
      status,
      noteAtpm,
      formInputAftersales,
      vehicles,
      tenderFiles
    };

    // Prepare simulated dispatched email representation so the user can verify the exact CC rules!
    const ccList = [activeBranchConfig.emailBos];
    let replyCcInfo = '';

    // If active user is Budget Staff, automatically append admin team cc for replies:
    if (currentUser?.role === 'Budget Staff') {
      ccList.push(activeBranchConfig.emailTeamAdminCC);
      replyCcInfo = activeBranchConfig.emailTeamAdminCC;
    }

    const simEmail = {
      to: 'approver.finance@tunasrent.com',
      cc: ccList,
      replyCc: replyCcInfo,
      subject: `[${status}] MKT Budget Allocation request for ${namaCustomer} (Branch: ${cabang})`,
      body: `Dear Partners,

Please find the marketing budget proposal details for:
- Customer: ${namaCustomer}
- Sector Business: ${bidangUsahaCustomer}
- Branch Operations Location: ${cabang}
- Total Fleet Lines: ${vehicles.length} components
- Notes Summary: ${noteAtpm.substring(0, 150)}...

This request is authorized under ${currentUser?.name || 'Authorized Hub Agent'} (${currentUser?.role || 'Team Admin'}).

Regards,
Tunas Rent Maintenance Gateway System`
    };

    setEmailDetails(simEmail);
    setShowEmailReport(true);

    // Save actual model logic in parent database sets
    setTimeout(() => {
      onSave(payload);
    }, 3500); 
  };

  // Upload Excel mock handler
  const handleExcelUpload = () => {
    const mockUploads: VehicleDetail[] = [
      {
        id: `v-upl-${Math.round(Math.random() * 1000)}`,
        jenisKendaraan: 'Toyota Fortuner GR Sport 2.8 4x4',
        nopolUsedCar: 'B 1988 NOP',
        qty: 2,
        tahun: 2026,
        type: 'High',
        tenor: 12,
        lokasiPemakaian: 'Jakarta',
        poolPenanggungJawab: 'Pulo Gadung',
        budgetMaintenance: 160000000
      },
      {
        id: `v-upl-${Math.round(Math.random() * 1000)}`,
        jenisKendaraan: 'Isuzu Elf NLR Bus',
        nopolUsedCar: 'D 7551 SK',
        qty: 1,
        tahun: 2024,
        type: 'Standard',
        tenor: 24,
        lokasiPemakaian: 'Bandung',
        poolPenanggungJawab: 'Soekarno Hatta',
        budgetMaintenance: null
      }
    ];

    setVehicles([...vehicles, ...mockUploads]);
    showToast('Imported 2 rows of vehicle specifications from spreadsheet.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {editingRequest ? 'Edit Budget Request' : 'Form Request MKT'}
          </h2>
          <p className="text-on-surface-variant font-body-md mt-1">
            Create or edit active marketing budget allocations. Controlled by <strong>{currentUser?.name || 'Administrator'}</strong>.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-outline-variant hover:bg-surface-container text-on-surface font-sans font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <Undo2 className="w-4 h-4 text-on-surface-variant" />
          <span>Back to List</span>
        </button>
      </div>

      {/* Dynamic Email CC Routing Instruction Banner */}
      <div className="bg-[#EAEFFF]/80 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-white border border-outline-variant text-primary shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-on-surface">
              Auto-Routing Email CC ({cabang} Branch)
            </h4>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Submissions automatically trigger structured mail to local authorities.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] bg-white border border-outline-variant text-on-surface px-2.5 py-0.5 rounded-md font-mono">
                CC Bos: <strong>{activeBranchConfig.emailBos}</strong>
              </span>

              {currentUser?.role === 'Budget Staff' ? (
                <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-0.5 rounded-md font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#B26200]" />
                  <span>CC Admin Team (Budget Staff Mode): <strong>{activeBranchConfig.emailTeamAdminCC}</strong></span>
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 border border-slate-300 text-slate-500 px-2.5 py-0.5 rounded-md font-mono">
                  CC Team Admin inactive (LoggedIn as {currentUser?.role || 'Team Admin'})
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-primary font-bold bg-white border border-outline-variant px-3 py-1.5 rounded-full shadow-xs shrink-0 self-start md:self-auto font-sans">
          Mode: {currentUser?.role || 'Team Admin'}
        </span>
      </div>

      {/* Simulated Email Dispatch Trigger HUD Drawer */}
      {showEmailReport && emailDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-outline shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-surface-container border-b border-outline-variant flex justify-between items-center text-on-surface">
              <h3 className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary animate-bounce" />
                <span>Simulated Exchange Mail Dispatch Logs</span>
              </h3>
              <button 
                onClick={() => setShowEmailReport(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant border border-outline-variant/30 text-xs text-on-surface"
              >
                Skip preview
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              {/* Dispatch HUD indicators */}
              <div className="space-y-2.5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 font-mono text-xs text-on-surface">
                <div className="grid grid-cols-6 gap-2">
                  <span className="col-span-1 text-on-surface-variant font-bold">To:</span>
                  <span className="col-span-5 font-semibold text-[#107C41]">{emailDetails.to}</span>
                </div>
                <div className="grid grid-cols-6 gap-2 border-t border-outline-variant/40 pt-1.5">
                  <span className="col-span-1 text-on-surface-variant font-bold">CC Bos:</span>
                  <span className="col-span-5 font-bold text-on-surface">{activeBranchConfig.emailBos}</span>
                </div>
                
                {currentUser?.role === 'Budget Staff' && (
                  <div className="grid grid-cols-6 gap-2 border-t border-yellow-200 bg-amber-50/50 p-1.5 rounded border border-dashed pt-1.5">
                    <span className="col-span-1 text-amber-800 font-bold">CC Admin:</span>
                    <span className="col-span-5 font-black text-amber-900">{activeBranchConfig.emailTeamAdminCC}</span>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-2 border-t border-outline-variant/40 pt-1.5">
                  <span className="col-span-1 text-on-surface-variant font-bold">Subject:</span>
                  <span className="col-span-5 italic text-secondary font-sans">{emailDetails.subject}</span>
                </div>
              </div>

              {/* simulated email contents snippet */}
              <div className="bg-surface p-4 rounded-xl border border-outline hover:border-primary/30 transition-all font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed select-text">
                {emailDetails.body}
              </div>

              <div className="p-3 bg-[#E7F5ED] text-[#0A5D31] text-xs rounded-xl flex items-center justify-between font-bold font-sans">
                <span>⚡ Transmitting secure SMTP packet...</span>
                <span>Auto-routing complete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 font-body-md z-50">
          <CheckCircle className="w-5 h-5 text-[#30f283]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Request Information Card */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest font-headline-sm text-on-surface font-semibold flex items-center gap-2 border-l-4 border-primary">
          <span>Request Information</span>
        </div>
        <div className="p-6 gap-6 grid grid-cols-1 md:grid-cols-2">
          {/* Left Inputs block */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Cabang
              </label>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
              >
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Nama Customer
              </label>
              <input
                type="text"
                value={namaCustomer}
                onChange={(e) => setNamaCustomer(e.target.value)}
                placeholder="e.g. PT LEN RAIWAY SYSTEMS"
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Bidang Usaha Customer
              </label>
              <input
                type="text"
                value={bidangUsahaCustomer}
                onChange={(e) => setBidangUsahaCustomer(e.target.value)}
                placeholder="e.g. Komunikasi"
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Tender Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-on-surface">
                  <input
                    type="radio"
                    name="tenderType"
                    checked={tenderNonTender === 'non tender'}
                    onChange={() => setTenderNonTender('non tender')}
                    className="text-primary border-outline focus:ring-primary"
                  />
                  <span>Non-Tender</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-on-surface">
                  <input
                    type="radio"
                    name="tenderType"
                    checked={tenderNonTender === 'tender'}
                    onChange={() => setTenderNonTender('tender')}
                    className="text-primary border-outline focus:ring-primary"
                  />
                  <span>Tender / Bid</span>
                </label>
              </div>

              {tenderNonTender === 'tender' && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-[#107C41]/40 bg-[#E7F5ED]/5 space-y-4">
                  <span className="text-[10px] font-bold text-[#107C41] uppercase tracking-wider block font-sans">
                    📂 Google Drive Tender Upload Workspace
                  </span>
                  
                  {/* Drag and Drop Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('tender-doc-file-input')?.click()}
                    className="p-5 border border-dashed border-outline hover:border-[#107C41]/60 bg-white rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <input 
                      type="file" 
                      id="tender-doc-file-input" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                    <Upload className="w-5 h-5 text-[#107C41] animate-bounce" />
                    <p className="text-xs font-semibold text-on-surface font-sans">
                      Seret & taruh Berkas Dokumen Tender atau <span className="text-primary hover:underline">Klik untuk Cari</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      Berkas otomatis disimpan ke Google Drive folder: <strong className="text-primary">/tender/</strong>
                    </p>
                  </div>

                  {/* Visual Upload Progress Percentage HUD */}
                  {isUploading && (
                    <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col space-y-2 animate-pulse">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-on-surface-variant">
                        <span className="text-primary flex items-center gap-1">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#107C41] animate-ping" />
                          {uploadStatusMsg}
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>

                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-outline-variant/30">
                        <div 
                          className="bg-[#107C41] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* List of uploaded files */}
                  {tenderFiles.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                        Daftar Berkas Tender Terunggah
                      </span>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                        {tenderFiles.map((file, i) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-outline/30 text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[#107C41]">✔ 📄</span>
                              <div className="truncate">
                                <span className="font-semibold text-on-surface truncate block max-w-[200px]">{file.name}</span>
                                <span className="text-[9px] text-on-surface-variant font-mono block">
                                  {(file.size / 1024).toFixed(1)} KB • Google Drive (tender)
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2.5 shrink-0 select-none">
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[#107C41] hover:underline font-bold text-[10px]"
                              >
                                Tinjau
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveTenderFile(file.name)}
                                className="text-xs text-error hover:text-error/80 px-1 font-semibold"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Inputs Block */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Tanggal Request
              </label>
              <input
                type="date"
                value={tanggalRequest}
                onChange={(e) => setTanggalRequest(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Tanggal Submit Budget
              </label>
              <input
                type="date"
                value={tanggalSubmitBudget}
                onChange={(e) => setTanggalSubmitBudget(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Note & Custom Texts Block (Full Width span) */}
          <div className="md:col-span-2 space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Upgrade dari standar ATPM / Note :
              </label>
              <textarea
                rows={3}
                value={noteAtpm}
                onChange={(e) => setNoteAtpm(e.target.value)}
                placeholder="e.g. Unit specifications details and custom notes..."
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5 font-sans">
                Form Input Aftersales
              </label>
              <textarea
                rows={2}
                value={formInputAftersales}
                onChange={(e) => setFormInputAftersales(e.target.value)}
                placeholder="Feedback inputs or aftersales service specifications..."
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Budget Details Section */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs flex flex-col overflow-hidden">
        {/* Sub-header with tool controls */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center bg-surface-container-lowest gap-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
            Vehicle Budget Details
          </h3>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExcelUpload}
              className="px-3.5 py-1.5 bg-white border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Upload Excel</span>
            </button>
            <button
              onClick={() => showToast('Budget calculation report exported.')}
              className="px-3.5 py-1.5 bg-white border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Vehicles Editable Table */}
        <div className="overflow-x-auto w-full table-container">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
                <th className="p-table-cell-padding min-w-[200px]">Jenis Kendaraan</th>
                <th className="p-table-cell-padding min-w-[120px]">Nopol Used Car</th>
                <th className="p-table-cell-padding w-20 text-center">Qty</th>
                <th className="p-table-cell-padding w-24 text-center">Tahun</th>
                <th className="p-table-cell-padding w-24">Type</th>
                <th className="p-table-cell-padding w-20 text-center">Tenor</th>
                <th className="p-table-cell-padding min-w-[120px]">Lokasi Pemakaian</th>
                <th className="p-table-cell-padding min-w-[120px]">Pool Penanggung Jawab</th>
                <th className="p-table-cell-padding min-w-[150px] text-right">Budget Maintenance</th>
                <th className="p-table-cell-padding w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface font-body-md divide-y divide-outline-variant">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-on-surface-variant italic font-sans">
                    No vehicles listed. Click "+ Add Row" below to include specifications.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container/35 transition-colors">
                    {/* Jenis Kendaraan */}
                    <td className="p-table-cell-padding">
                      <input
                        type="text"
                        value={v.jenisKendaraan}
                        placeholder="e.g. Pajero 4x4 MT"
                        onChange={(e) => handleRowChange(v.id, 'jenisKendaraan', e.target.value)}
                        className="w-full px-2 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                      />
                    </td>

                    {/* Nopol */}
                    <td className="p-table-cell-padding">
                      <input
                        type="text"
                        value={v.nopolUsedCar}
                        placeholder="Used or Plate No."
                        onChange={(e) => handleRowChange(v.id, 'nopolUsedCar', e.target.value)}
                        className="w-full px-2 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                      />
                    </td>

                    {/* Qty */}
                    <td className="p-table-cell-padding text-center">
                      <input
                        type="number"
                        value={v.qty || ''}
                        onChange={(e) => handleRowChange(v.id, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 text-center border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                        min="1"
                      />
                    </td>

                    {/* Tahun */}
                    <td className="p-table-cell-padding text-center">
                      <input
                        type="number"
                        value={v.tahun || ''}
                        onChange={(e) => handleRowChange(v.id, 'tahun', parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 text-center border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                      />
                    </td>

                    {/* Type */}
                    <td className="p-table-cell-padding">
                      <select
                        value={v.type}
                        onChange={(e) => handleRowChange(v.id, 'type', e.target.value)}
                        className="w-full px-1.5 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary outline-hidden"
                      >
                        <option value="High">High</option>
                        <option value="Standard">Standard</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>

                    {/* Tenor */}
                    <td className="p-table-cell-padding text-center">
                      <select
                        value={v.tenor}
                        onChange={(e) => handleRowChange(v.id, 'tenor', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary outline-hidden text-center font-mono"
                      >
                        <option value={12}>12 mo</option>
                        <option value={24}>24 mo</option>
                        <option value={36}>36 mo</option>
                        <option value={48}>48 mo</option>
                        <option value={60}>60 mo</option>
                      </select>
                    </td>

                    {/* Lokasi Pemakaian */}
                    <td className="p-table-cell-padding">
                      <input
                        type="text"
                        value={v.lokasiPemakaian}
                        placeholder="e.g. Riau"
                        onChange={(e) => handleRowChange(v.id, 'lokasiPemakaian', e.target.value)}
                        className="w-full px-2 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                      />
                    </td>

                    {/* Pool Penanggung Jawab */}
                    <td className="p-table-cell-padding">
                      <input
                        type="text"
                        value={v.poolPenanggungJawab}
                        placeholder="e.g. Riau"
                        onChange={(e) => handleRowChange(v.id, 'poolPenanggungJawab', e.target.value)}
                        className="w-full px-2 py-1 border border-outline-variant rounded-md text-xs bg-surface-container-lowest focus:border-primary"
                      />
                    </td>

                    {/* Budget Maintenance */}
                    <td className="p-table-cell-padding text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs text-on-surface-variant font-mono">Rp</span>
                        <input
                          type="number"
                          value={v.budgetMaintenance === null ? '' : v.budgetMaintenance}
                          placeholder="-"
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseFloat(e.target.value);
                            handleRowChange(v.id, 'budgetMaintenance', val);
                          }}
                          className="w-24 px-1.5 py-1 text-right border border-outline-variant rounded-md text-xs font-mono bg-surface-container-lowest focus:border-primary"
                        />
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="p-table-cell-padding text-center">
                      <button
                        onClick={() => handleRemoveRow(v.id)}
                        className="text-error hover:bg-error-container/20 p-1.5 rounded-md transition-colors"
                        title="Delete specs row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Row footer trigger */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-start">
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-white border border-outline-variant hover:bg-surface-container text-on-surface text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Bottom Save & Submit Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant select-none">
        <button
          onClick={() => handleSubmit('Request')}
          className="px-6 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 text-sm font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 transform active:scale-98"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Save as Request (Draft)</span>
        </button>
        <button
          onClick={() => handleSubmit('SUBMIT')}
          className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 transform active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Submit Request (Approved)</span>
        </button>
      </div>
    </div>
  );
}
