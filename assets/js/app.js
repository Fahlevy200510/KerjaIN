// app.js - UI Controller & Interactions for KerjaIN Web Platform

document.addEventListener('DOMContentLoaded', () => {
  const store = window.kerjainStore;

  // --- UI Elements Cache ---
  const roleButtons = document.querySelectorAll('.role-btn');
  const viewSections = {
    public: document.getElementById('view-public'),
    client: document.getElementById('view-client'),
    engineer: document.getElementById('view-engineer'),
    admin: document.getElementById('view-admin')
  };

  // Modals
  const previewModal = document.getElementById('modal-preview');
  const paymentModal = document.getElementById('modal-payment');
  const revisionModal = document.getElementById('modal-revision');
  const quotationModal = document.getElementById('modal-quotation');

  // --- Navigation & Role Switching ---
  function setActiveRole(role) {
    store.setRole(role);
    renderRoleView(role);
  }

  function renderRoleView(role) {
    roleButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    Object.entries(viewSections).forEach(([name, el]) => {
      if (el) {
        if (role === 'public') {
          el.style.display = name === 'public' ? 'block' : 'none';
        } else {
          el.style.display = name === role ? 'block' : 'none';
        }
      }
    });

    // Scroll to top upon role switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      setActiveRole(role);
    });
  });

  // Direct CTAs inside Public Page that switch to Workspace
  document.querySelectorAll('[data-goto-role]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRole = el.dataset.gotoRole;
      setActiveRole(targetRole);
    });
  });

  // --- Hero Split Visual Tab Switcher ---
  const vTabButtons = document.querySelectorAll('.v-tab-btn');
  const vPanels = document.querySelectorAll('.visual-panel');

  vTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      vTabButtons.forEach(b => b.classList.toggle('active', b === btn));
      vPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `v-panel-${targetTab}`);
      });
    });
  });

  // --- Interactive Cost Calculator (FR-C01) ---
  const calcDisciplineBtns = document.querySelectorAll('[data-calc-discipline]');
  const calcTierBtns = document.querySelectorAll('[data-calc-tier]');
  const calcUrgencyCheck = document.getElementById('calc-urgency');
  const calcPriceDisplay = document.getElementById('calc-price-val');
  const calcDpDisplay = document.getElementById('calc-dp-val');
  const calcFinalDisplay = document.getElementById('calc-final-val');

  let calcState = {
    discipline: '3d_cad',
    tier: 'tugas_besar',
    express: false
  };

  function updateCalculator() {
    const rates = {
      '3d_cad': 180000,
      'pcb_schematic': 150000,
      'iot_programming': 175000,
      'multidiscipline': 350000
    };
    const multipliers = {
      'tugas_praktikum': 0.6,
      'tugas_besar': 1.0,
      'pkm': 1.8,
      'skripsi': 2.8
    };

    const base = rates[calcState.discipline] || 180000;
    const mult = multipliers[calcState.tier] || 1.0;
    const urgencyMult = calcState.express ? 1.4 : 1.0;

    const total = Math.round(base * mult * urgencyMult);
    const minRange = Math.round(total * 0.85 / 10000) * 10000;
    const maxRange = Math.round(total * 1.2 / 10000) * 10000;
    const dp = Math.round(total * 0.5);
    const finalBal = total - dp;

    if (calcPriceDisplay) {
      calcPriceDisplay.textContent = `Rp ${minRange.toLocaleString('id-ID')} - ${maxRange.toLocaleString('id-ID')}`;
    }
    if (calcDpDisplay) {
      calcDpDisplay.textContent = `Rp ${dp.toLocaleString('id-ID')}`;
    }
    if (calcFinalDisplay) {
      calcFinalDisplay.textContent = `Rp ${finalBal.toLocaleString('id-ID')}`;
    }
  }

  calcDisciplineBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcDisciplineBtns.forEach(b => b.classList.toggle('active', b === btn));
      calcState.discipline = btn.dataset.calcDiscipline;
      updateCalculator();
    });
  });

  calcTierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcTierBtns.forEach(b => b.classList.toggle('active', b === btn));
      calcState.tier = btn.dataset.calcTier;
      updateCalculator();
    });
  });

  if (calcUrgencyCheck) {
    calcUrgencyCheck.addEventListener('change', (e) => {
      calcState.express = e.target.checked;
      updateCalculator();
    });
  }

  updateCalculator();

  // --- Direct Booking Form (FR-C02) ---
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('book-name').value;
      const univ = document.getElementById('book-univ').value;
      const phone = document.getElementById('book-phone').value;
      const category = document.getElementById('book-category').value;
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const notes = document.getElementById('book-notes').value;

      try {
        const { newConsultation } = store.bookConsultation({
          name, univ, phone, category, date, time, notes
        });

        showToast(`Jadwal Konsultasi Gratis Berhasil Dikonfirmasi! Tautan: ${newConsultation.meetLink}`, 'success');
        
        // Quick dialog to jump to client workspace
        setTimeout(() => {
          if (confirm('Sesi Konsultasi Anda telah terdaftar. Buka Workspace Klien sekarang untuk memantau status?')) {
            setActiveRole('client');
          }
        }, 800);
      } catch (err) {
        showToast(err.message, 'warning');
      }
    });
  }

  // --- Client Workspace State Rendering ---
  function renderWorkspace() {
    const state = store.getState();
    const project = state.project;

    // Project Info
    const statusBadge = document.getElementById('ws-project-status');
    if (statusBadge) {
      statusBadge.textContent = project.status;
      statusBadge.className = `status-badge ${project.paymentStatus === 'PAID_IN_FULL' ? 'status-completed' : 'status-active'}`;
    }

    // Milestones
    const stepElements = document.querySelectorAll('.m-step');
    stepElements.forEach((el, idx) => {
      const stepNum = idx + 1;
      el.classList.remove('completed', 'current');
      if (stepNum < project.milestoneStep) {
        el.classList.add('completed');
      } else if (stepNum === project.milestoneStep) {
        if (project.paymentStatus === 'PAID_IN_FULL' && stepNum === 5) {
          el.classList.add('completed');
        } else {
          el.classList.add('current');
        }
      }
    });

    // Vault Files Render
    const filesContainer = document.getElementById('vault-files-list');
    if (filesContainer) {
      filesContainer.innerHTML = project.files.map(file => {
        const isLocked = file.isLocked;
        return `
          <div class="file-item-card" data-file-id="${file.id}">
            <div class="file-info-group">
              <div class="file-type-icon ${file.type === 'CAD' ? 'icon-cad' : file.type === 'PCB' ? 'icon-pdf' : 'icon-zip'}">
                ${file.type}
              </div>
              <div>
                <div class="file-name-title">${file.name}</div>
                <div class="file-meta-sub">${file.description} &bull; <strong>${file.size}</strong></div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="file-badge-tag ${isLocked ? 'tag-locked' : file.badge.includes('WATERMARK') ? 'tag-preview' : 'tag-unlocked'}">
                ${isLocked ? '🔒 ' + file.badge : '✓ ' + file.badge}
              </span>
              ${isLocked ? `
                <button class="btn btn-outline btn-sm" onclick="window.triggerPaymentModal()" title="Lunasi Sisa Tagihan untuk Mengunduh">
                  Buka Gembok
                </button>
              ` : file.previewUrl ? `
                <button class="btn btn-primary btn-sm" onclick="window.openPreviewModal('${file.name}', '${file.previewUrl}', '${file.badge}')">
                  Lihat Preview
                </button>
              ` : `
                <button class="btn btn-accent btn-sm" onclick="window.triggerDownload('${file.name}')">
                  Unduh .ZIP
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    // Vault Settlement Banner
    const balanceDisplay = document.getElementById('ws-balance-due');
    const paymentActionBtn = document.getElementById('ws-pay-btn');
    if (balanceDisplay) {
      balanceDisplay.textContent = `Rp ${project.balanceDue.toLocaleString('id-ID')}`;
    }
    if (paymentActionBtn) {
      if (project.paymentStatus === 'PAID_IN_FULL') {
        paymentActionBtn.textContent = '✓ Lunas Terbayar';
        paymentActionBtn.className = 'btn btn-outline btn-sm';
        paymentActionBtn.disabled = true;
      } else {
        paymentActionBtn.textContent = 'Bayar Pelunasan (QRIS)';
        paymentActionBtn.className = 'btn btn-accent btn-sm';
        paymentActionBtn.disabled = false;
      }
    }

    // Revision Quota & Logs
    const revQuotaVal = document.getElementById('rev-quota-remaining');
    const revSubmitBtn = document.getElementById('btn-open-revision');
    if (revQuotaVal) {
      revQuotaVal.textContent = project.revisionQuota;
    }
    if (revSubmitBtn) {
      revSubmitBtn.disabled = project.revisionQuota <= 0;
      if (project.revisionQuota <= 0) {
        revSubmitBtn.textContent = 'Kuota Revisi Habis';
      }
    }

    const revLogList = document.getElementById('revision-log-list');
    if (revLogList) {
      if (project.revisionTickets.length === 0) {
        revLogList.innerHTML = `<p class="text-muted" style="font-size:0.85rem;">Belum ada tiket revisi yang diajukan.</p>`;
      } else {
        revLogList.innerHTML = project.revisionTickets.map(t => `
          <div class="rev-log-item">
            <div class="rev-log-header">
              <span class="font-mono" style="font-weight:700; color:var(--primary);">${t.id}</span>
              <span class="text-muted">${t.timestamp}</span>
            </div>
            <div class="rev-log-desc">${t.note}</div>
            <div style="margin-top:0.5rem; font-size:0.75rem; font-weight:700; color:var(--success);">
              Status: ${t.status}
            </div>
          </div>
        `).join('');
      }
    }

    // Admin Dispatcher Table
    const leadsTableBody = document.getElementById('admin-leads-table-body');
    if (leadsTableBody) {
      leadsTableBody.innerHTML = state.admin.incomingLeads.map(lead => `
        <tr>
          <td class="font-mono"><strong>${lead.id}</strong></td>
          <td>${lead.clientName} <br><small class="text-muted">${lead.univ}</small></td>
          <td>${lead.topic}</td>
          <td>${lead.date} &bull; ${lead.time}</td>
          <td>
            ${lead.status.includes('Assigned') ? `
              <span class="status-badge status-completed">${lead.status}</span>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="window.assignLead('${lead.id}')">
                Tugaskan ke Dian Pratama
              </button>
            `}
          </td>
        </tr>
      `).join('');
    }

    // Admin Escrow Vault
    const escrowVaultVal = document.getElementById('admin-escrow-vault');
    const platformRevVal = document.getElementById('admin-platform-rev');
    if (escrowVaultVal) {
      escrowVaultVal.textContent = `Rp ${state.admin.totalEscrowVault.toLocaleString('id-ID')}`;
    }
    if (platformRevVal) {
      platformRevVal.textContent = `Rp ${state.admin.platformRevenue.toLocaleString('id-ID')}`;
    }

    // Consultant Wallet & Stats
    const consWalletVal = document.getElementById('cons-wallet-val');
    const consPendingVal = document.getElementById('cons-pending-val');
    if (consWalletVal) {
      consWalletVal.textContent = `Rp ${state.consultant.walletBalance.toLocaleString('id-ID')}`;
    }
    if (consPendingVal) {
      consPendingVal.textContent = `Rp ${state.consultant.pendingEscrow.toLocaleString('id-ID')}`;
    }
  }

  // Subscribe to store updates
  store.subscribe(() => {
    renderWorkspace();
  });

  // Initial render
  renderWorkspace();

  // --- Modal Helpers & Global Triggers ---
  window.openPreviewModal = function(title, imgUrl, badgeText) {
    const modalTitle = document.getElementById('preview-modal-title');
    const modalImg = document.getElementById('preview-modal-img');
    const modalWatermark = document.getElementById('preview-modal-watermark');

    if (modalTitle) modalTitle.textContent = title;
    if (modalImg) modalImg.src = imgUrl;
    if (modalWatermark) {
      modalWatermark.style.display = badgeText.includes('WATERMARK') ? 'block' : 'none';
    }

    if (previewModal) previewModal.classList.add('active');
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  window.triggerPaymentModal = function() {
    if (paymentModal) paymentModal.classList.add('active');
  };

  window.triggerRevisionModal = function() {
    if (revisionModal) revisionModal.classList.add('active');
  };

  window.triggerQuotationModal = function() {
    if (quotationModal) quotationModal.classList.add('active');
  };

  window.openBusinessModal = function() {
    const bizModal = document.getElementById('modal-business');
    if (bizModal) bizModal.classList.add('active');
  };

  window.orderMentoring = function() {
    showToast('Sesi Bimbingan Privat 1-on-1 (Rp 150.000) dijadwalkan! Komisi platform 30% (Rp 45.000) dialokasikan otomatis.', 'success');
  };

  window.triggerDownload = function(fileName) {
    showToast(`Mengunduh arsip ${fileName}... Berhasil diverifikasi lunas!`, 'success');
  };

  window.assignLead = function(leadId) {
    store.assignLead(leadId, 'Dian Pratama, S.T.');
    showToast(`Lead ${leadId} berhasil ditugaskan ke Engineer Dian Pratama!`, 'success');
  };

  // Close modals on backdrop click or close button
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-backdrop').classList.remove('active');
    });
  });

  // --- Action: Simulate Payment Handlers ---
  const simulatePayBtn = document.getElementById('btn-simulate-payment');
  if (simulatePayBtn) {
    simulatePayBtn.addEventListener('click', () => {
      simulatePayBtn.disabled = true;
      simulatePayBtn.textContent = 'Memverifikasi Pembayaran QRIS...';

      setTimeout(() => {
        const success = store.simulateFullPayment();
        simulatePayBtn.disabled = false;
        simulatePayBtn.textContent = 'Simulasikan Pembayaran Berhasil (QRIS)';
        window.closeModal('modal-payment');

        if (success) {
          showToast('Pembayaran QRIS Berhasil Diverifikasi! Seluruh Master File SolidWorks & Kode telah DIBUKA.', 'success');
        } else {
          showToast('Tagihan proyek ini sudah lunas sebelumnya.', 'warning');
        }
      }, 900);
    });
  }

  // --- Action: Submit Revision Form ---
  const revisionForm = document.getElementById('revision-form');
  if (revisionForm) {
    revisionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const noteInput = document.getElementById('revision-note-input');
      const note = noteInput.value;

      try {
        const ticket = store.submitRevision(note);
        window.closeModal('modal-revision');
        noteInput.value = '';
        showToast(`Tiket ${ticket.id} berhasil diajukan! Konsultan akan segera menindaklanjuti.`, 'success');
      } catch (err) {
        showToast(err.message, 'warning');
      }
    });
  }

  // --- Action: Engineer Quotation Builder ---
  const quotationForm = document.getElementById('quotation-builder-form');
  if (quotationForm) {
    quotationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pName = document.getElementById('qb-project-name').value;
      const pCost = document.getElementById('qb-total-cost').value;
      const pSow = document.getElementById('qb-sow').value.split('\n').filter(s => s.trim());

      store.createQuotation({
        projectName: pName,
        totalCost: pCost,
        sowItems: pSow
      });

      showToast('Quotation Digital berhasil diperbarui & diterbitkan untuk mahasiswa!', 'success');
    });
  }

  // --- Reset All Data ---
  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset seluruh data simulasi ke kondisi awal PRD?')) {
        store.resetAll();
        showToast('Data simulasi telah di-reset ke kondisi awal.', 'success');
      }
    });
  }

  // --- Toast Notification Manager ---
  function showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-weight:700;">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  window.showToast = showToast;
});
