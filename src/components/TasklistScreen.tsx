/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  BarChart,
  Edit2,
  CheckCircle,
  HelpCircle,
  Clock,
  Trash2,
  FileEdit,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BudgetRequest } from '../types';

interface TasklistScreenProps {
  requests: BudgetRequest[];
  onAddNewRequest: () => void;
  onEditRequest: (request: BudgetRequest) => void;
  onDeleteRequest: (requestId: string) => void;
}

export default function TasklistScreen({
  requests,
  onAddNewRequest,
  onEditRequest,
  onDeleteRequest
}: TasklistScreenProps) {
  // Query parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculators for stats widget (dynamically sums live state!)
  const totalCount = requests.length;
  const draftCount = requests.filter(r => r.status === 'Request').length;
  const submitCount = requests.filter(r => r.status === 'SUBMIT').length;
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  // Filter requests lists
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.namaCustomer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.cabang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.bidangUsahaCustomer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatus === 'all' || 
      req.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination parameters
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Humanize date displays
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: '2-digit', year: 'numeric' };
      const d = new Date(dateStr);
      // If valid date, returns standard IND format, else fallback to source
      if (isNaN(d.getTime())) return dateStr;
      
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-2">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Tasklist Budget Monitoring</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Review and manage recent marketing budget submissions.</p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              placeholder="Search by customer, branch, sector..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-sans whitespace-nowrap">Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 pl-3 pr-8 bg-white border border-outline-variant rounded-lg text-sm text-on-surface font-sans font-semibold focus:outline-hidden focus:border-primary shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="request">Draft (Request)</option>
              <option value="submit">Approved (Submit)</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary hover:shadow-xs transition-all group select-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Total Requests</p>
            <BarChart className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-3xl font-headline-lg font-bold text-on-surface leading-none mt-1">{totalCount}</h4>
        </div>

        {/* Draft Requests */}
        <div className="bg-[#EAEFFF]/60 p-5 rounded-xl border-l-4 border-secondary hover:shadow-xs transition-all group select-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-label-sm font-label-sm text-on-secondary-fixed-variant uppercase tracking-wider">Draft (Request)</p>
            <FileEdit className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-3xl font-headline-lg font-bold text-on-surface leading-none mt-1">{draftCount}</h4>
        </div>

        {/* Approved submit requests */}
        <div className="bg-[#E7F5ED] p-5 rounded-xl border-l-4 border-[#107C41] hover:shadow-xs transition-all group select-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-label-sm font-label-sm text-[#0A5D31] uppercase tracking-wider">Approved (Submit)</p>
            <CheckCircle className="w-5 h-5 text-[#107C41] group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-3xl font-headline-lg font-bold text-on-surface leading-none mt-1">{submitCount}</h4>
        </div>

        {/* Pending requests */}
        <div className="bg-[#FFF4E5] p-5 rounded-xl border-l-4 border-[#B26200] hover:shadow-xs transition-all group select-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-label-sm font-label-sm text-[#8A4D00] uppercase tracking-wider">Pending Status</p>
            <Clock className="w-5 h-5 text-[#B26200] group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="text-3xl font-headline-lg font-bold text-on-surface leading-none mt-1">{pendingCount}</h4>
        </div>
      </div>

      {/* Main Table Container Header & Action trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold flex items-center gap-2">
          Budget Allocation Records
        </h3>
        <button
          onClick={onAddNewRequest}
          className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2.5 rounded-lg font-sans font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 transform active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New MKT Request</span>
        </button>
      </div>

      {/* Table grid wrapper */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap">Tanggal Request</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap">Tanggal Submit Budget</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap text-right w-20">Aging</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap min-w-[180px]">Nama Customer</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap">Bidang Usaha Customer</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap text-center">Tender / Non Tender</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap">Cabang</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap text-center w-28">Status</th>
                <th className="font-label-sm text-label-sm text-on-surface-variant p-table-cell-padding whitespace-nowrap text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-on-surface-variant italic font-sans">
                    No budget requests found matching these filter criteria. Try cleaning search inputs.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]/75';
                  
                  // Status badge styling blocks
                  let statusBadgeStyle = '';
                  if (req.status === 'Request') {
                    statusBadgeStyle = 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
                  } else if (req.status === 'SUBMIT') {
                    statusBadgeStyle = 'bg-secondary-container text-primary font-semibold border border-outline-variant/50';
                  } else {
                    statusBadgeStyle = 'bg-error-container/15 text-error font-medium border border-error/20';
                  }

                  return (
                    <tr key={req.id} className={`hover:bg-surface-bright transition-colors h-11 ${rowBg}`}>
                      {/* Dates */}
                      <td className="p-table-cell-padding whitespace-nowrap font-mono">{formatDate(req.tanggalRequest)}</td>
                      <td className="p-table-cell-padding whitespace-nowrap font-mono">{formatDate(req.tanggalSubmitBudget)}</td>
                      
                      {/* Aging column */}
                      <td className="p-table-cell-padding whitespace-nowrap text-right pr-6 font-semibold font-mono text-xs">{req.aging}</td>
                      
                      {/* Customer Name */}
                      <td className="p-table-cell-padding whitespace-nowrap font-semibold text-on-surface select-text">{req.namaCustomer}</td>
                      
                      {/* Business Sector */}
                      <td className="p-table-cell-padding whitespace-nowrap text-on-surface-variant text-xs capitalize">{req.bidangUsahaCustomer}</td>
                      
                      {/* Tender tag */}
                      <td className="p-table-cell-padding whitespace-nowrap text-center text-xs">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.tenderNonTender === 'tender' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.tenderNonTender}
                        </span>
                      </td>

                      {/* Branch Location */}
                      <td className="p-table-cell-padding whitespace-nowrap text-on-surface select-text">{req.cabang}</td>
                      
                      {/* Status Pil */}
                      <td className="p-table-cell-padding whitespace-nowrap text-center select-none">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${statusBadgeStyle}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Row Inline Actions */}
                      <td className="p-table-cell-padding whitespace-nowrap text-center select-none">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditRequest(req)}
                            className="p-1 px-2 border border-outline-variant rounded bg-white hover:bg-surface-container text-secondary hover:text-primary transition-all text-xs font-semibold flex items-center gap-1"
                            title="Edit specs or status details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteRequest(req.id)}
                            className="p-1.5 rounded-md hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-all"
                            title="Delete this budget record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Dynamic Pagination Controller Footer */}
        <div className="bg-surface-container-lowest px-4 py-3 border-t border-outline-variant flex items-center justify-between sm:px-6 select-none font-sans">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-outline-variant text-sm font-medium rounded-md text-on-surface bg-white hover:bg-surface-container disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-outline-variant text-sm font-medium rounded-md text-on-surface bg-white hover:bg-surface-container disabled:opacity-40"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">
                Showing <span className="font-semibold">{Math.min(startIndex + 1, filteredRequests.length)}</span> to{' '}
                <span className="font-semibold">{Math.min(startIndex + rowsPerPage, filteredRequests.length)}</span> of{' '}
                <span className="font-semibold">{filteredRequests.length}</span> records
              </p>
            </div>
            
            {totalPages > 1 && (
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2.5 py-2 rounded-l-md border border-outline-variant bg-white text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`relative inline-flex items-center px-3.5 py-2 border text-xs font-semibold ${
                          isCurrent
                            ? 'z-10 bg-primary-container text-on-primary border-primary'
                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2.5 py-2 rounded-r-md border border-outline-variant bg-white text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
