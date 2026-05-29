/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Download, 
  RotateCw, 
  AlertTriangle, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { BudgetRequest, BRANCHES } from '../types';

interface DashboardScreenProps {
  requests: BudgetRequest[];
  criticalAgingThreshold: number;
}

export default function DashboardScreen({ 
  requests,
  criticalAgingThreshold 
}: DashboardScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Rows of the matrix
  const agingRows = ['0', '1', '2', '3', '4', '5', '6', '7', '7+'];

  // Calculate the SLA matrix dynamically from current requests list
  const matrix: Record<string, Record<string, number>> = {};
  
  // Initialize matrix with 0s
  agingRows.forEach(row => {
    matrix[row] = {};
    BRANCHES.forEach(branch => {
      matrix[row][branch] = 0;
    });
  });

  // Distribute requests into matrix cells
  requests.forEach(req => {
    // case-insensitive matching for branch
    const matchedBranch = BRANCHES.find(
      b => b.toLowerCase() === req.cabang.toLowerCase()
    );

    if (matchedBranch) {
      let rowKey = '';
      if (req.aging > 7) {
        rowKey = '7+';
      } else {
        rowKey = req.aging.toString();
      }

      if (matrix[rowKey]) {
        matrix[rowKey][matchedBranch]++;
      }
    }
  });

  // Calculate column totals
  const colTotals: Record<string, number> = {};
  BRANCHES.forEach(branch => {
    colTotals[branch] = 0;
    agingRows.forEach(row => {
      colTotals[branch] += matrix[row][branch] || 0;
    });
  });

  // Calculate critical issues: requests that have aging >= criticalAgingThreshold
  const criticalRequestsCount = requests.filter(
    r => r.aging >= criticalAgingThreshold && r.status !== 'SUBMIT'
  ).length;

  const totalActiveRegions = BRANCHES.length;

  // Handle Refresh Data with simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setFeedbackMsg('Refreshing live metrics...');
    setTimeout(() => {
      setIsRefreshing(false);
      setFeedbackMsg('Data updated successfully');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }, 1200);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Aging Hari,' + BRANCHES.join(',') + '\n';

    agingRows.forEach(row => {
      const rowData = [row];
      BRANCHES.forEach(branch => {
        rowData.push((matrix[row][branch] || 0).toString());
      });
      csvContent += rowData.join(',') + '\n';
    });

    // Add totals row
    const totalsRow = ['Total Requests'];
    BRANCHES.forEach(branch => {
      totalsRow.push(colTotals[branch].toString());
    });
    csvContent += totalsRow.join(',') + '\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sla_aging_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackMsg('CSV report downloaded!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard SLA</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Service Level Agreement metrics across regional branches.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {feedbackMsg && (
            <span className="text-xs text-primary bg-primary-container/10 px-3 py-1.5 rounded-lg border border-primary-container/20 font-mono animate-pulse">
              {feedbackMsg}
            </span>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-sans font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container disabled:opacity-80 transition-colors rounded-lg font-sans font-semibold text-sm shadow-xs flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Branches */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300"></div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Branches</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="font-headline-lg text-headline-lg text-on-surface leading-tight">{totalActiveRegions}</h3>
            <span className="text-sm text-on-surface-variant font-sans font-medium">Active Regions</span>
          </div>
        </div>

        {/* Critical Aging */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-container/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300"></div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Critical Aging ({criticalAgingThreshold}+ Days)</p>
          <div className="flex items-center gap-3 mt-2">
            <h3 className="font-headline-lg text-headline-lg text-on-surface leading-tight">
              {criticalRequestsCount > 0 ? `${criticalRequestsCount} Active` : 'Needs Review'}
            </h3>
            <span className="p-1 rounded-full bg-error-container text-error inline-flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-300"></div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Average SLA Compliance</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="font-headline-lg text-headline-lg text-on-surface leading-tight">94.2%</h3>
            <span className="text-xs text-primary font-bold bg-[#E7F5ED] text-[#107C41] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <span>+1.2%</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Aging Analysis Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs flex flex-col overflow-hidden">
        {/* Table header menu */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Aging Analysis Matrix</span>
          </h3>
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-outline-variant/50 font-mono">
            Count: {requests.length} Requests Total
          </span>
        </div>

        {/* Table layout container */}
        <div className="overflow-x-auto table-container w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-table-cell-padding font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider sticky left-0 bg-surface-container-low z-10 border-r border-outline-variant w-32 text-center select-none">
                  Aging Hari
                </th>
                {BRANCHES.map(branch => (
                  <th key={branch} className="p-table-cell-padding font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-24">
                    {branch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
              {agingRows.map((row, idx) => {
                const isSpecial = row === '7+';
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]';
                
                return (
                  <tr 
                    key={row} 
                    className={`hover:bg-surface-container/60 transition-colors h-[40px] ${rowBg} group`}
                  >
                    {/* Header Row Column (Sticky) */}
                    <td className={`p-table-cell-padding text-right pr-6 sticky left-0 border-r border-outline-variant font-semibold select-none ${
                        isSpecial 
                          ? 'bg-error-container/15 text-error font-bold text-center' 
                          : 'text-on-surface-variant bg-inherit group-hover:bg-surface-container/90'
                      }`}
                    >
                      {row}
                    </td>

                    {/* Dynamic Branch Columns */}
                    {BRANCHES.map(branch => {
                      const val = matrix[row][branch] || 0;
                      return (
                        <td 
                          key={branch} 
                          className={`p-table-cell-padding text-right font-medium pr-10 border-r border-outline-variant/30 ${
                            isSpecial && val > 0 
                              ? 'bg-error-container/10 text-error font-semibold' 
                              : ''
                          }`}
                        >
                          {val > 0 ? val : <span className="opacity-15">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-surface-container-low font-bold h-[40px] border-t-2 border-outline-variant">
                <td className="p-table-cell-padding text-left pl-4 sticky left-0 bg-surface-container-low border-r border-outline-variant text-on-surface font-bold font-headline-sm text-xs select-none">
                  Total Requests
                </td>
                {BRANCHES.map(branch => {
                  const tot = colTotals[branch];
                  return (
                    <td key={branch} className="p-table-cell-padding text-right pr-10 font-bold text-primary font-headline-sm text-xs">
                      {tot}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table footer info & pagination icons */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center rounded-b-xl text-sm text-on-surface-variant select-none">
          <div className="font-sans font-medium text-xs">Showing {agingRows.length} of {agingRows.length} rows represented</div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 border border-outline-variant/50 cursor-not-allowed" disabled>
              <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 border border-outline-variant/50 cursor-not-allowed" disabled>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* Corporate disclaimer footnote */}
      <div className="mt-8 text-center text-xs text-on-surface-variant select-none">
        <p className="font-sans">Data last updated: Today, 08:45 AM. Confidential Enterprise Data.</p>
      </div>
    </div>
  );
}
