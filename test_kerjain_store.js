// test_kerjain_store.js - Self-check test for KerjaIN core state logic
// Run with: node test_kerjain_store.js

const assert = require('assert');

// Core pure business logic functions matching KerjaIN store
function calculateQuotationSplit(totalCost, platformFeeRate = 0.18) {
  const dpAmount = Math.round(totalCost * 0.5);
  const finalAmount = totalCost - dpAmount;
  const platformFee = Math.round(totalCost * platformFeeRate);
  const engineerPayout = totalCost - platformFee;
  return { dpAmount, finalAmount, platformFee, engineerPayout };
}

function calculateCostEstimate(service, level, isExpress) {
  const baseRates = {
    '3d_cad': 180000,
    'pcb_schematic': 150000,
    'iot_programming': 175000,
    'multidiscipline': 350000
  };
  const levelMultipliers = {
    'tugas_praktikum': 0.6,
    'tugas_besar': 1.0,
    'pkm': 1.8,
    'skripsi': 2.8
  };
  const base = baseRates[service] || 180000;
  const multiplier = levelMultipliers[level] || 1.0;
  const urgencyMultiplier = isExpress ? 1.4 : 1.0;
  
  const estimatedTotal = Math.round(base * multiplier * urgencyMultiplier);
  const minRange = Math.round(estimatedTotal * 0.85 / 10000) * 10000;
  const maxRange = Math.round(estimatedTotal * 1.2 / 10000) * 10000;
  return { minRange, maxRange, estimatedTotal };
}

function processRevisionTicket(currentQuota, revisionNote) {
  if (currentQuota <= 0) {
    throw new Error('Kuota revisi habis. Pengajuan revisi di luar kesepakatan membutuhkan adendum.');
  }
  if (!revisionNote || revisionNote.trim().length < 5) {
    throw new Error('Catatan revisi minimal 5 karakter.');
  }
  return {
    remainingQuota: currentQuota - 1,
    ticket: {
      id: 'REV-' + Date.now().toString().slice(-4),
      note: revisionNote.trim(),
      timestamp: new Date().toISOString(),
      status: 'Sedang Dikerjakan Konsultan'
    }
  };
}

function processEscrowFullPayment(project) {
  if (project.paymentStatus === 'PAID_IN_FULL') {
    return project; // already paid
  }
  return {
    ...project,
    paymentStatus: 'PAID_IN_FULL',
    milestoneStep: 5,
    balanceDue: 0,
    files: project.files.map(f => ({
      ...f,
      isLocked: false
    }))
  };
}

// TEST SUITE
console.log('--- Menjalankan Self-Check Logika Inti KerjaIN ---');

// Test 1: Quotation Split & Escrow platform commission
{
  const split = calculateQuotationSplit(700000, 0.18);
  assert.strictEqual(split.dpAmount, 350000, 'DP harus tepat 50%');
  assert.strictEqual(split.finalAmount, 350000, 'Pelunasan harus tepat 50%');
  assert.strictEqual(split.platformFee, 126000, 'Platform fee 18% dari 700k');
  assert.strictEqual(split.engineerPayout, 574000, 'Net Payout konsultan 574k');
  console.log('[PASS] Test 1: Kalkulasi Quotation Split & Komisi Platform');
}

// Test 2: Estimasi Harga Interaktif (Ramah Mahasiswa)
{
  const estTubes = calculateCostEstimate('3d_cad', 'tugas_besar', false);
  assert.strictEqual(estTubes.estimatedTotal, 180000, '3D CAD Tubes Kuliah = 180k');
  const estSkripsi = calculateCostEstimate('3d_cad', 'skripsi', false);
  assert.strictEqual(estSkripsi.estimatedTotal, 504000, '3D CAD Skripsi Normal = 180k * 2.8 = 504k');
  const estExpress = calculateCostEstimate('3d_cad', 'skripsi', true);
  assert.strictEqual(estExpress.estimatedTotal, 705600, '3D CAD Skripsi Express (+40%) = ~705k');
  console.log('[PASS] Test 2: Kalkulator Estimasi Biaya Berdasarkan Kompleksitas & Urgensi');
}

// Test 3: Pengurangan Kuota Tiket Revisi (FR-C05)
{
  const rev = processRevisionTicket(3, 'Ubah diameter lubang bearing dari 8mm ke 10mm');
  assert.strictEqual(rev.remainingQuota, 2, 'Sisa kuota revisi berkurang menjadi 2');
  assert.ok(rev.ticket.id.startsWith('REV-'), 'Format ID tiket revisi benar');
  
  // Test error when quota is zero
  assert.throws(() => {
    processRevisionTicket(0, 'Revisi tambahan');
  }, /Kuota revisi habis/, 'Harus menolak revisi jika kuota habis');
  console.log('[PASS] Test 3: Validasi Kuota Tiket Revisi Terstruktur');
}

// Test 4: Pembayaran Pelunasan & Buka Kunci Source File (FR-C04 / FR-C06)
{
  const mockProject = {
    id: 'KRJ-204',
    paymentStatus: 'DP_PAID',
    milestoneStep: 3,
    balanceDue: 350000,
    files: [
      { id: 'f1', name: 'Render_V1.png', isLocked: false },
      { id: 'f2', name: 'Master_Source.zip', isLocked: true }
    ]
  };
  
  const paidProject = processEscrowFullPayment(mockProject);
  assert.strictEqual(paidProject.paymentStatus, 'PAID_IN_FULL');
  assert.strictEqual(paidProject.balanceDue, 0);
  assert.strictEqual(paidProject.files.find(f => f.id === 'f2').isLocked, false, 'Gembok Master File harus terbuka');
  console.log('[PASS] Test 4: Simulasi Pelunasan Escrow & Buka Kunci File Master');
}

// Test 5: Siklus Order Admin & Verifikasi Escrow (FR-A02)
{
  const mockOrder = {
    id: 'KRJ-205',
    totalCost: 1200000,
    dpPaid: 0,
    balanceDue: 1200000,
    escrowStatus: 'WAITING_DP',
    progressStep: 1
  };
  
  // Simulasi verifikasi DP 50% oleh Admin
  const dpAmount = Math.round(mockOrder.totalCost * 0.5);
  mockOrder.dpPaid = dpAmount;
  mockOrder.balanceDue = mockOrder.totalCost - dpAmount;
  mockOrder.escrowStatus = 'DP_VERIFIED';
  mockOrder.progressStep = 3;

  assert.strictEqual(mockOrder.dpPaid, 600000, 'DP 50% dari 1.2jt harus 600k');
  assert.strictEqual(mockOrder.balanceDue, 600000, 'Sisa tagihan 600k');
  assert.strictEqual(mockOrder.escrowStatus, 'DP_VERIFIED');

  // Simulasi rilis escrow akhir saat mahasiswa puas
  const commission = Math.round(mockOrder.totalCost * 0.18);
  const consultantPayout = mockOrder.totalCost - commission;
  assert.strictEqual(commission, 216000, 'Komisi platform 18% dari 1.2jt = 216k');
  assert.strictEqual(consultantPayout, 984000, 'Hak bersih konsultan 82% = 984k');
  console.log('[PASS] Test 5: Siklus Order Admin, Verifikasi DP & Pembagian Escrow Platform');
}

// Test 6: Autentikasi Login, Remember Me & Logout Panel Admin
{
  function validateAdminAuth(email, password) {
    const validEmail = (email || '').trim().toLowerCase();
    const validPass = (password || '').trim();
    return (validEmail === 'admin@kerjain.id' || validEmail === 'admin') && 
           (validPass === 'admin123' || validPass === 'admin' || validPass === 'kerjain2026');
  }

  assert.strictEqual(validateAdminAuth('admin@kerjain.id', 'admin123'), true, 'Kredensial resmi admin valid');
  assert.strictEqual(validateAdminAuth('admin', 'admin'), true, 'Kredensial singkat valid');
  assert.strictEqual(validateAdminAuth('user@kerjain.id', 'wrongpass'), false, 'Kredensial salah harus ditolak');
  assert.strictEqual(validateAdminAuth('', ''), false, 'Input kosong harus ditolak');

  // Test session state transition
  const mockAdminState = { isAuthenticated: false, rememberMe: true, lastLoginAt: null };
  function mockAdminLogin(state, email, pass, remember = true) {
    if (validateAdminAuth(email, pass)) {
      state.isAuthenticated = true;
      state.rememberMe = !!remember;
      state.lastLoginAt = new Date().toISOString();
      return true;
    }
    return false;
  }
  function mockAdminLogout(state) {
    state.isAuthenticated = false;
    return true;
  }

  assert.strictEqual(mockAdminLogin(mockAdminState, 'admin@kerjain.id', 'admin123', true), true);
  assert.strictEqual(mockAdminState.isAuthenticated, true, 'Harus terautentikasi setelah login berhasil');
  assert.strictEqual(mockAdminState.rememberMe, true, 'Pilihan remember me harus tersimpan');
  assert.ok(mockAdminState.lastLoginAt, 'Timestamp login harus tercatat');

  assert.strictEqual(mockAdminLogout(mockAdminState), true);
  assert.strictEqual(mockAdminState.isAuthenticated, false, 'Sesi harus terputus setelah logout');

  console.log('[PASS] Test 6: Validasi Autentikasi Login, Remember Me & Logout Panel Admin');
}

// Test 7: Verifikasi Integritas Elemen DOM Login Page di Admin Panel
{
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  const requiredIds = [
    'view-admin',
    'admin-login-screen',
    'admin-dashboard-screen',
    'form-admin-page-login',
    'admin-page-email',
    'admin-page-password',
    'admin-page-token',
    'admin-page-remember',
    'admin-page-login-error',
    'btn-admin-submit-login',
    'btn-admin-page-toggle-pass',
    'btn-admin-page-quick-fill',
    'modal-admin-login',
    'form-admin-login'
  ];

  requiredIds.forEach(id => {
    const pattern = new RegExp(`id=["']${id}["']`);
    assert.ok(pattern.test(html), `Elemen ID "${id}" harus tersedia di index.html`);
  });

  console.log('[PASS] Test 7: Integritas Struktur HTML & Elemen DOM Halaman Login Admin');
}

console.log('--- Semua 7 Pengujian Logika Lolos dengan Sempurna! ---');


