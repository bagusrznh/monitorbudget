/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VehicleDetail {
  id: string;
  jenisKendaraan: string;
  nopolUsedCar: string;
  qty: number;
  tahun: number;
  type: string;
  tenor: number;
  lokasiPemakaian: string;
  poolPenanggungJawab: string;
  budgetMaintenance: number | null; // null represents '-'
}

export interface BudgetRequest {
  id: string;
  tanggalRequest: string;
  tanggalSubmitBudget: string;
  aging: number;
  namaCustomer: string;
  bidangUsahaCustomer: string;
  tenderNonTender: 'tender' | 'non tender';
  cabang: string;
  status: 'Request' | 'SUBMIT' | 'PENDING';
  noteAtpm: string;
  formInputAftersales: string;
  vehicles: VehicleDetail[];
  tenderFiles?: { name: string; size: number; mimeType: string; fileId?: string; url?: string }[];
}

export interface Holiday {
  id: string;
  tanggal: string; // e.g., '1 Jan 2024' or '2026-01-01'
  keterangan: string;
  tahun: number;
}

export interface AppSettings {
  criticalAgingThreshold: number; // default: 7
  activeBranches: string[];
  autoRefreshInterval: number; // in seconds, default: 0 (disabled)
  theme: 'light' | 'dark';
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // Opted out for client security optionally
  name: string;
  email: string;
  role: 'Team Admin' | 'Budget Staff';
}

export interface BranchCcConfig {
  cabang: string;
  emailBos: string;
  emailTeamAdminCC: string;
}

// Branches list constant
export const BRANCHES = [
  'Jakarta', 'Bandung', 'Semarang', 'Tangerang', 'Palembang', 'Surabaya', 'Cikarang'
];

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  { id: 'usr-1', username: 'admin', password: 'admin123', name: 'Tunas Rent Admin Team', email: 'admin.tunas@tunasrent.com', role: 'Team Admin' },
  { id: 'usr-2', username: 'budget1', password: 'budget123', name: 'Zulkifli Budget Officer', email: 'zulkifli.budget@tunasrent.com', role: 'Budget Staff' },
  { id: 'usr-3', username: 'aftersales', password: '123', name: 'Aftersales User', email: 'aftersalestunasrent@gmail.com', role: 'Team Admin' }
];

export const INITIAL_BRANCH_CC_CONFIGS: BranchCcConfig[] = [
  { cabang: 'Jakarta', emailBos: 'bos.jakarta@tunasrent.com', emailTeamAdminCC: 'admin.jakarta@tunasrent.com' },
  { cabang: 'Bandung', emailBos: 'bos.bandung@tunasrent.com', emailTeamAdminCC: 'admin.bandung@tunasrent.com' },
  { cabang: 'Semarang', emailBos: 'bos.semarang@tunasrent.com', emailTeamAdminCC: 'admin.semarang@tunasrent.com' },
  { cabang: 'Tangerang', emailBos: 'bos.tangerang@tunasrent.com', emailTeamAdminCC: 'admin.tangerang@tunasrent.com' },
  { cabang: 'Palembang', emailBos: 'bos.palembang@tunasrent.com', emailTeamAdminCC: 'admin.palembang@tunasrent.com' },
  { cabang: 'Surabaya', emailBos: 'bos.surabaya@tunasrent.com', emailTeamAdminCC: 'admin.surabaya@tunasrent.com' },
  { cabang: 'Cikarang', emailBos: 'bos.cikarang@tunasrent.com', emailTeamAdminCC: 'admin.cikarang@tunasrent.com' }
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: '1', tanggal: '1 Jan 2024', keterangan: 'Tahun Baru Masehi', tahun: 2024 },
  { id: '2', tanggal: '8 Feb 2024', keterangan: 'Isra Mikraj Nabi Muhammad SAW', tahun: 2024 },
  { id: '3', tanggal: '10 Feb 2024', keterangan: 'Tahun Baru Imlek 2575 Kongzili', tahun: 2024 },
  { id: '4', tanggal: '11 Mar 2024', keterangan: 'Hari Suci Nyepi Tahun Baru Saka 1946', tahun: 2024 },
  { id: '5', tanggal: '10 Apr 2024', keterangan: 'Hari Raya Idul Fitri 1445 Hijriah', tahun: 2024 },
  { id: '6', tanggal: '11 Apr 2024', keterangan: 'Hari Raya Idul Fitri 1445 Hijriah', tahun: 2024 },
  { id: '7', tanggal: '1 Jan 2026', keterangan: 'Tahun Baru Masehi', tahun: 2026 },
  { id: '8', tanggal: '15 Feb 2026', keterangan: 'Isra Mikraj Nabi Muhammad SAW', tahun: 2026 },
  { id: '9', tanggal: '17 Feb 2026', keterangan: 'Tahun Baru Imlek 2577 Kongzili', tahun: 2026 },
  { id: '10', tanggal: '29 Mar 2026', keterangan: 'Hari Suci Nyepi Tahun Baru Saka 1948', tahun: 2026 },
  { id: '11', tanggal: '24 May 2026', keterangan: 'Hari Raya Idul Fitri 1447 Hijriah', tahun: 2026 },
  { id: '12', tanggal: '25 May 2026', keterangan: 'Hari Raya Idul Fitri 1447 Hijriah', tahun: 2026 },
];

export const INITIAL_VEHICLES_MKT: VehicleDetail[] = [
  {
    id: 'v1',
    jenisKendaraan: 'Hilux 2.4 Gdouble Cabin MT + Ban AT',
    nopolUsedCar: '',
    qty: 20,
    tahun: 2026,
    type: 'High',
    tenor: 36,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
  {
    id: 'v2',
    jenisKendaraan: 'Pajero 4x4 MT',
    nopolUsedCar: '',
    qty: 3,
    tahun: 2026,
    type: 'High',
    tenor: 36,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
  {
    id: 'v3',
    jenisKendaraan: 'Rush 1.5 G Manual',
    nopolUsedCar: '',
    qty: 3,
    tahun: 2026,
    type: 'High',
    tenor: 36,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
  {
    id: 'v4',
    jenisKendaraan: 'Hilux 2.4 Gdouble Cabin MT + Ban AT',
    nopolUsedCar: '',
    qty: 20,
    tahun: 2026,
    type: 'High',
    tenor: 60,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
  {
    id: 'v5',
    jenisKendaraan: 'Pajero 4x4 MT',
    nopolUsedCar: '',
    qty: 3,
    tahun: 2026,
    type: 'High',
    tenor: 60,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
  {
    id: 'v6',
    jenisKendaraan: 'Rush 1.5 G Manual',
    nopolUsedCar: '',
    qty: 3,
    tahun: 2026,
    type: 'High',
    tenor: 60,
    lokasiPemakaian: 'Riau',
    poolPenanggungJawab: 'Riau',
    budgetMaintenance: null,
  },
];

// Recreate some budget requests
export const INITIAL_BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: 'req-001',
    tanggalRequest: '2026-05-20',
    tanggalSubmitBudget: '2026-05-27',
    aging: 7,
    namaCustomer: 'PT LEN RAIWAY SYSTEMS',
    bidangUsahaCustomer: 'komunikasi',
    tenderNonTender: 'non tender',
    cabang: 'Bandung',
    status: 'Request',
    noteAtpm: 'Untuk mobil di pakai dalam kota dan dalam hutan di daerah propinsi riau Untuk pekerja pemasangan alat komunikan Untuk PT pertamina dan Maintenace alat komunikasi nya\n- standar ban nya AT Untuk Hilux\n- unit bukan tender customer ini sudah jadi costomer kita pemakai sekarang masih kota ada di Jakarta yogya bandung',
    formInputAftersales: '',
    vehicles: INITIAL_VEHICLES_MKT,
  },
  {
    id: 'req-002',
    tanggalRequest: '2026-05-20',
    tanggalSubmitBudget: '2026-05-27',
    aging: 7,
    namaCustomer: 'PT ABC',
    bidangUsahaCustomer: 'MANUFAKTUR',
    tenderNonTender: 'non tender',
    cabang: 'Jakarta',
    status: 'SUBMIT',
    noteAtpm: 'Upgrade armatures, high specification chassis requirements for manufacturing logistics line.',
    formInputAftersales: 'Approved with minor warranty extension details.',
    vehicles: [
      {
        id: 'v-abc-1',
        jenisKendaraan: 'Hilux Double Cabin 4x4',
        nopolUsedCar: 'B 9231 TQA',
        qty: 5,
        tahun: 2025,
        type: 'Standard',
        tenor: 48,
        lokasiPemakaian: 'Karawang',
        poolPenanggungJawab: 'Bekasi',
        budgetMaintenance: 125000000,
      }
    ],
  },
  {
    id: 'req-003',
    tanggalRequest: '2026-05-20',
    tanggalSubmitBudget: '2026-05-27',
    aging: 7,
    namaCustomer: 'BANK GRAHA',
    bidangUsahaCustomer: 'BANK',
    tenderNonTender: 'non tender',
    cabang: 'Semarang',
    status: 'PENDING',
    noteAtpm: 'Unit blind van untuk operasional kas keliling cabang Jawa Tengah.',
    formInputAftersales: 'Need revision on insurance premiums.',
    vehicles: [
      {
        id: 'v-bg-1',
        jenisKendaraan: 'Gran Max Blind Van 1.3',
        nopolUsedCar: 'H 8211 CG',
        qty: 12,
        tahun: 2026,
        type: 'Standard',
        tenor: 36,
        lokasiPemakaian: 'Semarang',
        poolPenanggungJawab: 'Semarang',
        budgetMaintenance: 450000000,
      }
    ],
  }
];

// Let's create extra request items to reach 156 total requests in stat indicators while representing them programmatically!
// This is perfect! Let's generate a list of 153 addition items that we can seed to back up the exact dashboard display.
// This way, the dashboard math matches the numbers: 156 total, 42 Request, 89 Submit, 25 Pending!
export function getSeededBudgetRequests(): BudgetRequest[] {
  const seed: BudgetRequest[] = [...INITIAL_BUDGET_REQUESTS];
  
  const customers = [
    'PT Sinar Mas', 'Astra International', 'Telkomsel Indonesia', 'PT Pertamina Logistik',
    'Bank Mandiri', 'PT Indofood CBP', 'Kalbe Farma Tbk', 'Gojek Tokopedia Tbk',
    'Chandra Asri Petrochemical', 'United Tractors', 'Bank Central Asia', 'Adaro Energy'
  ];
  
  const businessTypes = [
    'Manufaktur', 'Pertambangan', 'Perbankan', 'Telekomunikasi', 'Logistik',
    'Agribisnis', 'Farmasi', 'E-commerce', 'Konstruksi', 'Energi'
  ];

  // We have:
  // initial: 1 Request, 1 Submit, 1 Pending -> need 41 more Request, 88 Submit, 24 Pending
  // Total target: 42, 89, 25
  const counts = {
    'Request': 41,
    'SUBMIT': 88,
    'PENDING': 24
  };

  const statuses: ('Request' | 'SUBMIT' | 'PENDING')[] = [];
  Object.entries(counts).forEach(([status, count]) => {
    for (let i = 0; i < count; i++) {
      statuses.push(status as 'Request' | 'SUBMIT' | 'PENDING');
    }
  });

  // Shuffle seed slightly and generate reproducible data
  // Using simple deterministic generator
  let state = 42;
  function random() {
    const x = Math.sin(state++) * 10000;
    return x - Math.floor(x);
  }

  statuses.forEach((status, idx) => {
    const branch = BRANCHES[Math.floor(random() * BRANCHES.length)];
    // Aging: mostly 0-7, with some higher ones
    let aging = Math.floor(random() * 9); // 0 to 8
    if (aging === 8) aging = 10; // represent 7+ easily
    
    const cust = customers[Math.floor(random() * customers.length)];
    const biz = businessTypes[Math.floor(random() * businessTypes.length)];
    const isTender = random() > 0.7 ? 'tender' : 'non tender';
    
    // Dates back in May 2026
    const reqDay = 15 + Math.floor(random() * 10); // 15 to 24 May
    const requestDate = `2026-05-${reqDay < 10 ? '0' + reqDay : reqDay}`;
    const submitDate = `2026-05-27`;

    seed.push({
      id: `seed-req-${idx + 4}`,
      tanggalRequest: requestDate,
      tanggalSubmitBudget: submitDate,
      aging,
      namaCustomer: `${cust} Divisi ${idx + 2}`,
      bidangUsahaCustomer: biz,
      tenderNonTender: isTender,
      cabang: branch,
      status,
      noteAtpm: `Seeded auto request for operational vehicle maintenance in ${branch}. Requirements: standard warranty logs.`,
      formInputAftersales: status === 'SUBMIT' ? 'Auto-processed and validated.' : '',
      vehicles: [
        {
          id: `v-seed-${idx}`,
          jenisKendaraan: random() > 0.5 ? 'Toyota Avanza 1.5G' : 'Mitsubishi Triton 4x4',
          nopolUsedCar: '',
          qty: 1 + Math.floor(random() * 5),
          tahun: 2025,
          type: 'Standard',
          tenor: random() > 0.5 ? 36 : 60,
          lokasiPemakaian: branch,
          poolPenanggungJawab: branch,
          budgetMaintenance: null
        }
      ]
    });
  });

  return seed;
}
