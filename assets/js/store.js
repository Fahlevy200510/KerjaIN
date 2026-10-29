// store.js - Central State Management & Reactive Store for KerjaIN Platform
// Persists to localStorage with automatic fallback

const STORAGE_KEY = 'KERJAIN_STATE_V1';

const INITIAL_STATE = {
  currentRole: 'client', // 'client' | 'engineer' | 'admin' | 'public'
  
  // Client (Mahasiswa) Data
  client: {
    name: 'Bambang Pratama',
    email: 'bambang.p@ui.ac.id',
    univ: 'Universitas Indonesia (Teknik Mesin)',
    avatar: 'BP',
    hasUsedFreeQuota: true
  },

  // Active Project Detail (#KRJ-204) matching PRD §6.2
  project: {
    id: '#KRJ-204',
    title: 'Desain Mekanik & Kontrol Otomasi Gripper Robotika',
    category: 'Mechanical 3D & IoT Automation',
    status: 'DALAM PENGERJAAN - TAHAP 2',
    milestoneStep: 3, // 1: Deal, 2: DP 50%, 3: Pengerjaan, 4: Review/Revisi, 5: Pelunasan & Selesai
    totalCost: 700000,
    dpPaid: 350000,
    balanceDue: 350000,
    paymentStatus: 'DP_PAID', // 'DP_PAID' | 'PAID_IN_FULL'
    revisionQuota: 2,
    maxRevisionQuota: 3,
    consultant: 'Dian Pratama, S.T. (Senior Mechatronics Engineer)',
    deadline: '5 November 2026',
    
    // Brankas File (Preview vs Master Locked)
    files: [
      {
        id: 'f1',
        name: 'Render_Assembly_Gripper_V1.png',
        type: 'CAD',
        badge: 'PREVIEW GAMBAR',
        size: '3.4 MB',
        isLocked: false,
        previewUrl: 'assets/img/cad_assembly.jpg',
        description: 'Visualisasi 3D Exploded SolidWorks siap review dimensi.'
      },
      {
        id: 'f2',
        name: 'Skematik_ESP32_SensorNode_Rev1.pdf',
        type: 'PCB',
        badge: 'WATERMARK DRAFT',
        size: '1.8 MB',
        isLocked: false,
        previewUrl: 'assets/img/pcb_schematic.jpg',
        description: 'Wiring & Skematik Altium ber-watermark untuk pengecekan pinout.'
      },
      {
        id: 'f3',
        name: 'Full_Source_SolidWorks_STEP_dan_Kode.zip',
        type: 'ZIP',
        badge: 'GEMBOK ESCROW',
        size: '45.2 MB',
        isLocked: true,
        previewUrl: null,
        description: 'Master 3D CAD (.SLDPRT, .STEP), Gerber PCB, & Source Code Mikrokontroler (.INO, .HEX).'
      }
    ],

    // Revision Tickets History
    revisionTickets: [
      {
        id: 'REV-101',
        note: 'Penyesuaian toleransi bearing shaft diameter dari 8mm menjadi 10mm untuk motor NEMA 17.',
        timestamp: '28 Okt 2026, 14:30 WIB',
        status: 'Selesai Dikerjakan Konsultan'
      }
    ],

    // Quotation Breakdown
    quotation: {
      scopeOfWork: [
        'Pemodelan 3D SolidWorks Gripper 3-Finger dengan gearing ratio 1:3',
        'Analisis tegangan struktur FEA (Finite Element Analysis) pada beban 5 kg',
        'Desain skematik & layout PCB controller ESP32 modul I2C sensor',
        'Kode mikrokontroler Arduino/C++ untuk kontrol stepper & telemetri serial'
      ],
      deliverables: [
        'File Master 3D (.SLDPRT, .STEP, .IGES)',
        'File Gerber PCB & PDF Skematik Altium',
        'Source Code C++ (.INO) dengan dokumentasi komentar per fungsi',
        'Video demonstrasi gerak simulasi (Motion Study)'
      ],
      terms: 'Termasuk 3x kuota revisi minor gratis dan garansi konsultasi pra-sidang 1 jam.'
    }
  },

  // Free Consultations Booked
  consultations: [
    {
      id: 'CONS-901',
      topic: 'Review Konsep Gripper Robotika & Kompatibilitas Motor',
      date: '27 Okt 2026',
      time: '15:00 - 15:30 WIB',
      mentor: 'Dian Pratama, S.T.',
      meetLink: 'https://meet.google.com/krj-in-free',
      status: 'Selesai (Deal Proyek)'
    }
  ],

  // Consultant (Engineer) State
  consultant: {
    name: 'Dian Pratama, S.T.',
    specialization: 'Senior Mechatronics & Embedded IoT Engineer',
    rating: 4.95,
    activeTasks: 4,
    completedProjects: 48,
    walletBalance: 2450000,
    pendingEscrow: 350000
  },

  // Admin Back-Office State
  admin: {
    totalEscrowVault: 8750000,
    platformRevenue: 1575000,
    disputesCount: 1,
    incomingLeads: [
      {
        id: 'LEAD-101',
        clientName: 'Ahmad Fauzi',
        univ: 'ITB (Teknik Elektro)',
        topic: 'Desain PCB Inverter DC-AC 220V',
        date: '31 Okt 2026',
        time: '10:00 WIB',
        status: 'Unassigned'
      },
      {
        id: 'LEAD-102',
        clientName: 'Rina Salsabila',
        univ: 'UGM (Fisika Teknik)',
        topic: 'Simulasi CFD Heatsink Pendingin Baterai',
        date: '31 Okt 2026',
        time: '13:30 WIB',
        status: 'Assigned (Dian Pratama)'
      }
    ],
    disputes: [
      {
        id: 'DSP-01',
        projectId: '#KRJ-199',
        client: 'Farhan (ITS)',
        issue: 'Permintaan revisi ke-4 tanpa biaya adendum',
        status: 'Mediasi Tercapai (Klien tambah add-on Rp 100k)'
      }
    ]
  }
};

class KerjaINStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('localStorage error, using initial state', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  getState() {
    return this.state;
  }

  // Action: Switch Active Role Portal
  setRole(role) {
    this.state.currentRole = role;
    this.saveState();
  }

  // Action: Booking Free Consultation (FR-C02)
  bookConsultation({ name, univ, phone, category, date, time, notes }) {
    const newLead = {
      id: 'LEAD-' + Math.floor(100 + Math.random() * 900),
      clientName: name || this.state.client.name,
      univ: univ || this.state.client.univ,
      phone: phone || '081234567890',
      topic: category || 'Konsultasi Teknis',
      date: date || '1 Nov 2026',
      time: time || '14:00 WIB',
      notes: notes || 'Butuh diskusi awal skripsi',
      status: 'Unassigned'
    };

    const newConsultation = {
      id: 'CONS-' + Math.floor(100 + Math.random() * 900),
      topic: newLead.topic,
      date: newLead.date,
      time: newLead.time,
      mentor: 'Mentor Ditugaskan Admin (Segera)',
      meetLink: 'https://meet.google.com/krj-' + Math.random().toString(36).substring(2, 6),
      status: 'Terjadwal'
    };

    this.state.consultations.unshift(newConsultation);
    this.state.admin.incomingLeads.unshift(newLead);
    this.state.client.hasUsedFreeQuota = true;
    this.saveState();

    return { newConsultation, newLead };
  }

  // Action: Submit Structured Revision (FR-C05)
  submitRevision(note) {
    if (this.state.project.revisionQuota <= 0) {
      throw new Error('Kuota revisi gratis telah habis (3/3). Silakan ajukan adendum tambahan.');
    }
    if (!note || note.trim().length < 5) {
      throw new Error('Catatan revisi minimal 5 karakter deskriptif.');
    }

    const newTicket = {
      id: 'REV-' + Math.floor(100 + Math.random() * 900),
      note: note.trim(),
      timestamp: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'Sedang Dikerjakan Konsultan'
    };

    this.state.project.revisionQuota -= 1;
    this.state.project.revisionTickets.unshift(newTicket);
    this.state.project.milestoneStep = 4; // Review & Revisi Klien
    this.saveState();

    return newTicket;
  }

  // Action: Escrow Full Payment & Unlock Master Files (FR-C04 / FR-C06)
  simulateFullPayment() {
    if (this.state.project.paymentStatus === 'PAID_IN_FULL') {
      return false;
    }

    const balanceAmount = this.state.project.balanceDue;
    this.state.project.paymentStatus = 'PAID_IN_FULL';
    this.state.project.status = 'SELESAI - LUNAS & DOKUMEN TERBUKA';
    this.state.project.balanceDue = 0;
    this.state.project.milestoneStep = 5; // Final handover milestone

    // Unlock all files
    this.state.project.files.forEach(f => {
      f.isLocked = false;
      if (f.badge === 'GEMBOK ESCROW') {
        f.badge = 'TERBUKA (LUNAS)';
      }
    });

    // Update consultant earnings & admin vault
    this.state.consultant.walletBalance += Math.round(balanceAmount * 0.82);
    this.state.consultant.pendingEscrow = 0;
    this.state.admin.totalEscrowVault += balanceAmount;
    this.state.admin.platformRevenue += Math.round(balanceAmount * 0.18);

    this.saveState();
    return true;
  }

  // Action: Assign Lead (Admin FR-A01)
  assignLead(leadId, engineerName = 'Dian Pratama, S.T.') {
    const lead = this.state.admin.incomingLeads.find(l => l.id === leadId);
    if (lead) {
      lead.status = `Assigned (${engineerName})`;
      this.saveState();
      return true;
    }
    return false;
  }

  // Action: Create Quotation (Engineer FR-E02)
  createQuotation({ projectName, totalCost, sowItems, revisionQuota = 3 }) {
    const cost = parseInt(totalCost) || 600000;
    const dp = Math.round(cost * 0.5);
    
    this.state.project.title = projectName || this.state.project.title;
    this.state.project.totalCost = cost;
    this.state.project.dpPaid = dp;
    this.state.project.balanceDue = cost - dp;
    this.state.project.revisionQuota = revisionQuota;
    if (sowItems && sowItems.length > 0) {
      this.state.project.quotation.scopeOfWork = sowItems;
    }
    this.saveState();
  }

  // Reset demo data to initial PRD specs
  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.notify();
  }
}

// Global instance
window.kerjainStore = new KerjaINStore();
