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

console.log('--- Semua 4 Pengujian Logika Lolos dengan Sempurna! ---');
