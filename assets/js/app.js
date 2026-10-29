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
  const adminOrderDetailModal = document.getElementById('modal-admin-order-detail');

  // Admin Dashboard State
  let activeAdminTab = 'orders';
  let orderStatusFilter = 'ALL';
  let orderSearchQuery = '';

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

    // Admin Dashboard: Metric Badges & Counts
    const escrowVaultVal = document.getElementById('admin-escrow-vault');
    const platformRevVal = document.getElementById('admin-platform-rev');
    const activeOrdersCountVal = document.getElementById('admin-active-orders-count');
    const badgeCountOrders = document.getElementById('badge-count-orders');
    const badgeCountLeads = document.getElementById('badge-count-leads');
    const badgeCountDisputes = document.getElementById('badge-count-disputes');

    const ordersList = state.admin.orders || [];
    const activeOrders = ordersList.filter(o => o.escrowStatus !== 'PAID_IN_FULL');

    if (escrowVaultVal) {
      escrowVaultVal.textContent = `Rp ${state.admin.totalEscrowVault.toLocaleString('id-ID')}`;
    }
    if (platformRevVal) {
      platformRevVal.textContent = `Rp ${state.admin.platformRevenue.toLocaleString('id-ID')}`;
    }
    if (activeOrdersCountVal) {
      activeOrdersCountVal.textContent = `${activeOrders.length} Proyek`;
    }
    if (badgeCountOrders) badgeCountOrders.textContent = ordersList.length;
    if (badgeCountLeads) badgeCountLeads.textContent = state.admin.incomingLeads.length;
    if (badgeCountDisputes) badgeCountDisputes.textContent = state.admin.disputes.length;

    // Admin Orders Pipeline Table (FR-A02)
    const ordersTableBody = document.getElementById('admin-orders-table-body');
    if (ordersTableBody) {
      let filteredOrders = ordersList;

      // Status filter
      if (orderStatusFilter !== 'ALL') {
        filteredOrders = filteredOrders.filter(o => o.escrowStatus === orderStatusFilter);
      }

      // Search filter
      if (orderSearchQuery.trim() !== '') {
        const q = orderSearchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(o => 
          o.id.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.univ.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q)
        );
      }

      if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
              Tidak ada order yang sesuai dengan kriteria filter "${orderStatusFilter}".
            </td>
          </tr>
        `;
      } else {
        ordersTableBody.innerHTML = filteredOrders.map(order => {
          let statusBadge = '';
          if (order.escrowStatus === 'WAITING_DP') {
            statusBadge = '<span class="status-badge status-warning">⏳ Menunggu DP 50%</span>';
          } else if (order.escrowStatus === 'DP_VERIFIED') {
            statusBadge = '<span class="status-badge status-active">🔒 Escrow DP Aktif</span>';
          } else if (order.escrowStatus === 'REVIEW_DRAFT') {
            statusBadge = '<span class="status-badge status-purple">👁️ Review Watermark</span>';
          } else if (order.escrowStatus === 'PAID_IN_FULL') {
            statusBadge = '<span class="status-badge status-completed">✓ Lunas & Selesai</span>';
          } else if (order.escrowStatus === 'WAITING_ASSIGNMENT') {
            statusBadge = '<span class="status-badge status-neutral">❓ Perlu Konsultan</span>';
          }

          const waUrl = `https://wa.me/62${order.phone.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(order.clientName)}%2C%20dari%20Admin%20KerjaIN%20mengenai%20proyek%20${order.id}`;

          return `
            <tr>
              <td>
                <span class="font-mono" style="font-weight:700; color:var(--primary); font-size:0.9rem;">#${order.id}</span>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${order.createdAt}</div>
              </td>
              <td>
                <strong>${order.clientName}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${order.univ}</div>
                <a href="${waUrl}" target="_blank" style="font-size:0.75rem; color:#059669; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:3px; margin-top:2px;">
                  💬 Chat WA
                </a>
              </td>
              <td>
                <div style="font-weight:600; font-size:0.875rem; max-width:240px; white-space:normal;">${order.title}</div>
                <div style="margin-top:4px;">
                  <span class="badge-pill" style="font-size:0.7rem; font-weight:700; background:var(--surface-alt); border:1px solid var(--border);">${order.category}</span>
                </div>
              </td>
              <td>
                <div class="font-mono" style="font-weight:700; font-size:0.9rem;">Rp ${order.totalCost.toLocaleString('id-ID')}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                  DP: Rp ${order.dpPaid.toLocaleString('id-ID')} &bull; Sisa: Rp ${order.balanceDue.toLocaleString('id-ID')}
                </div>
              </td>
              <td>${statusBadge}</td>
              <td>
                <div style="font-size:0.78rem; font-weight:600;">Step ${order.progressStep}/5</div>
                <div class="mini-progress-wrap" title="Progress Milestone Step ${order.progressStep} dari 5">
                  <div class="mini-progress-fill" style="width:${order.progressStep * 20}%;"></div>
                </div>
              </td>
              <td>
                ${order.consultant ? `
                  <span style="font-size:0.825rem; font-weight:600;">${order.consultant}</span>
                ` : `
                  <button class="btn btn-outline btn-sm" style="font-size:0.72rem; padding:0.25rem 0.5rem;" onclick="window.adminAssignOrderAction('${order.id}')">
                    + Tugaskan
                  </button>
                `}
              </td>
              <td style="text-align:center;">
                <div style="display:flex; gap:0.35rem; justify-content:center; flex-wrap:wrap;">
                  <button class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="window.openAdminOrderDetail('${order.id}')" title="Buka Detail Brief & Finansial">
                    🔍 Detail
                  </button>
                  ${order.escrowStatus === 'WAITING_DP' ? `
                    <button class="btn btn-primary btn-sm" style="font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="window.adminVerifyDpAction('${order.id}')" title="Verifikasi Pembayaran DP 50%">
                      ✓ Verif DP
                    </button>
                  ` : ''}
                  ${order.escrowStatus === 'REVIEW_DRAFT' ? `
                    <button class="btn btn-accent btn-sm" style="font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="window.adminReleaseEscrowAction('${order.id}')" title="Rilis Dana Escrow Pelunasan">
                      💸 Rilis Escrow
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Admin Dispatcher Table (Leads)
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

  // --- Admin Dashboard Interactivity & Tabs ---
  window.switchAdminTab = function(tabName) {
    activeAdminTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(panel => {
      panel.style.display = panel.id === `admin-tab-${tabName}` ? 'block' : 'none';
    });
  };

  window.filterAdminOrders = function(status) {
    orderStatusFilter = status;
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.filter === status);
    });
    renderWorkspace();
  };

  window.searchAdminOrders = function(query) {
    orderSearchQuery = query;
    renderWorkspace();
  };

  window.adminVerifyDpAction = function(orderId) {
    if (confirm(`Verifikasi pembayaran DP 50% untuk Order #${orderId} masuk ke Escrow Vault?`)) {
      store.adminVerifyDp(orderId);
      showToast(`DP 50% untuk Order #${orderId} berhasil diverifikasi! Dana tersimpan aman di Escrow Vault.`, 'success');
      if (adminOrderDetailModal && adminOrderDetailModal.classList.contains('active')) {
        window.openAdminOrderDetail(orderId);
      }
    }
  };

  window.adminReleaseEscrowAction = function(orderId) {
    if (confirm(`Rilis dana pelunasan Escrow untuk Order #${orderId} ke rekening mitra konsultan? File master akan diserahkan penuh ke mahasiswa.`)) {
      store.adminReleaseEscrow(orderId);
      showToast(`Dana Escrow Order #${orderId} berhasil dirilis ke konsultan! Komisi platform 18% tercatat di pendapatan.`, 'success');
      if (adminOrderDetailModal && adminOrderDetailModal.classList.contains('active')) {
        window.openAdminOrderDetail(orderId);
      }
    }
  };

  window.adminAssignOrderAction = function(orderId) {
    const consultant = prompt('Tugaskan ke konsultan berlisensi:\n1. Dian Pratama, S.T. (Mekatronika & IoT)\n2. Hendra Kusuma, S.T. (Elektronika & PCB)\n3. Bayu Wicaksono, S.T. (Desain 3D Mekanikal)', 'Dian Pratama, S.T.');
    if (consultant) {
      store.adminAssignConsultant(orderId, consultant);
      showToast(`Order #${orderId} berhasil ditugaskan ke ${consultant}!`, 'success');
      if (adminOrderDetailModal && adminOrderDetailModal.classList.contains('active')) {
        window.openAdminOrderDetail(orderId);
      }
    }
  };

  window.openAdminOrderDetail = function(orderId) {
    const state = store.getState();
    const order = (state.admin.orders || []).find(o => o.id === orderId);
    if (!order) return;

    const modalTitle = document.getElementById('admin-modal-order-title');
    const modalContent = document.getElementById('admin-modal-order-content');
    const modalFooter = document.getElementById('admin-modal-order-footer');

    if (modalTitle) modalTitle.textContent = `Detail Order Proyek #${order.id}`;

    const platformFee = Math.round(order.totalCost * 0.18);
    const consultantNet = order.totalCost - platformFee;
    const dpRequired = Math.round(order.totalCost * 0.5);

    let statusHtml = '';
    if (order.escrowStatus === 'WAITING_DP') {
      statusHtml = '<span class="status-badge status-warning">⏳ Menunggu Verifikasi DP 50%</span>';
    } else if (order.escrowStatus === 'DP_VERIFIED') {
      statusHtml = '<span class="status-badge status-active">🔒 Escrow DP Terverifikasi (Pengerjaan)</span>';
    } else if (order.escrowStatus === 'REVIEW_DRAFT') {
      statusHtml = '<span class="status-badge status-purple">👁️ Tahap Review Watermark Draft</span>';
    } else if (order.escrowStatus === 'PAID_IN_FULL') {
      statusHtml = '<span class="status-badge status-completed">✓ Proyek Lunas & Master File Terbuka</span>';
    } else if (order.escrowStatus === 'WAITING_ASSIGNMENT') {
      statusHtml = '<span class="status-badge status-neutral">❓ Menunggu Penugasan Konsultan</span>';
    }

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="order-detail-header-card">
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">PROYEK REKAYASA &bull; STEM</div>
            <h4 style="font-size:1.15rem; margin:0.25rem 0; font-weight:800; color:var(--text-heading);">${order.title}</h4>
            <div style="font-size:0.85rem; color:var(--text-muted);">${order.category} &bull; ${order.software}</div>
          </div>
          <div>${statusHtml}</div>
        </div>

        <div class="order-detail-grid">
          <div class="order-info-box">
            <h5>🎓 Profil Klien & Kampus</h5>
            <div class="info-row"><span class="info-label">Nama Mahasiswa</span><span class="info-val">${order.clientName}</span></div>
            <div class="info-row"><span class="info-label">Universitas & Jurusan</span><span class="info-val">${order.univ}</span></div>
            <div class="info-row"><span class="info-label">Nomor WhatsApp</span><span class="info-val"><a href="https://wa.me/62${order.phone.replace(/^0/, '')}" target="_blank" style="color:#059669; font-weight:700;">${order.phone} 💬</a></span></div>
            <div class="info-row"><span class="info-label">Tanggal Masuk</span><span class="info-val">${order.createdAt}</span></div>
            <div class="info-row"><span class="info-label">Batas Target Deadline</span><span class="info-val" style="color:#dc2626;">${order.deadline}</span></div>
            <div class="info-row"><span class="info-label">Kuota Tiket Revisi</span><span class="info-val">${order.revisionsUsed} dari ${order.revisionsMax} terpakai</span></div>
          </div>

          <div class="order-info-box">
            <h5>🛠️ Konsultan Rekayasa Bertugas</h5>
            <div class="info-row"><span class="info-label">Nama Konsultan</span><span class="info-val">${order.consultant || 'Belum Ditugaskan'}</span></div>
            <div class="info-row"><span class="info-label">Tahapan Milestone</span><span class="info-val">Step ${order.progressStep} dari 5</span></div>
            <div class="info-row"><span class="info-label">Progress Pengerjaan</span><span class="info-val">${order.progressStep * 20}%</span></div>
            <div class="mini-progress-wrap" style="width:100%; margin-top:0.75rem;">
              <div class="mini-progress-fill" style="width:${order.progressStep * 20}%;"></div>
            </div>
            ${!order.consultant ? `
              <div style="margin-top:1rem;">
                <button class="btn btn-outline btn-sm" style="width:100%;" onclick="window.adminAssignOrderAction('${order.id}')">
                  Tugaskan Konsultan Sekarang
                </button>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="financial-split-card">
          <h5 style="margin-bottom:0.75rem; font-size:0.95rem; font-weight:700; color:var(--text-heading); display:flex; justify-content:space-between; align-items:center;">
            <span>💰 Rincian Finansial & Alokasi Komisi Escrow</span>
            <span class="font-mono text-primary" style="font-size:1.1rem;">Rp ${order.totalCost.toLocaleString('id-ID')}</span>
          </h5>

          <div class="info-row"><span class="info-label">Termin 1: Uang Muka DP 50% (Escrow)</span><span class="info-val font-mono">Rp ${dpRequired.toLocaleString('id-ID')} (${order.dpPaid >= dpRequired ? '<span style="color:#059669;">Terbayar</span>' : '<span style="color:#b45309;">Belum Bayar</span>'})</span></div>
          <div class="info-row"><span class="info-label">Termin 2: Sisa Pelunasan 50%</span><span class="info-val font-mono">Rp ${(order.totalCost - dpRequired).toLocaleString('id-ID')} (${order.balanceDue === 0 ? '<span style="color:#059669;">Lunas</span>' : '<span style="color:#b45309;">Tertahan</span>'})</span></div>
          
          <div class="split-bar-visual" title="Pembagian: 82% Hak Konsultan | 18% Komisi Platform">
            <div class="split-bar-consultant" style="width:82%;"></div>
            <div class="split-bar-platform" style="width:18%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:10px; height:10px; background:var(--primary); border-radius:2px;"></span>
              <span>Hak Bersih Mitra Konsultan (82%): <strong>Rp ${consultantNet.toLocaleString('id-ID')}</strong></span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:10px; height:10px; background:var(--accent); border-radius:2px;"></span>
              <span>Komisi Platform KerjaIN (18%): <strong style="color:var(--accent);">Rp ${platformFee.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>
        </div>
      `;
    }

    if (modalFooter) {
      modalFooter.innerHTML = `
        <div style="display:flex; gap:0.5rem; justify-content:space-between; width:100%; flex-wrap:wrap;">
          <div>
            ${order.escrowStatus === 'WAITING_DP' ? `
              <button class="btn btn-primary btn-sm" onclick="window.adminVerifyDpAction('${order.id}')">
                ✓ Verifikasi DP 50% (Masuk Escrow)
              </button>
            ` : ''}
            ${order.escrowStatus === 'REVIEW_DRAFT' ? `
              <button class="btn btn-accent btn-sm" onclick="window.adminReleaseEscrowAction('${order.id}')">
                💸 Rilis Escrow ke Konsultan (Selesai)
              </button>
            ` : ''}
          </div>
          <button class="btn btn-outline btn-sm modal-close-btn" onclick="document.getElementById('modal-admin-order-detail').classList.remove('active')">
            Tutup
          </button>
        </div>
      `;
    }

    if (adminOrderDetailModal) adminOrderDetailModal.classList.add('active');
  };

  window.adminQuickNewOrder = function() {
    const clientName = prompt('Nama Mahasiswa:', 'Alifia Rahman');
    if (!clientName) return;
    const univ = prompt('Universitas & Jurusan:', 'UNPAD (Fisika)');
    const title = prompt('Judul Proyek STEM:', 'Sistem Telemetri LoRa Sensor Kualitas Udara');
    const cost = parseInt(prompt('Estimasi Nilai Kontrak (Rp):', '600000')) || 600000;

    const newOrder = {
      id: 'KRJ-' + Math.floor(210 + Math.random() * 80),
      clientName: clientName,
      univ: univ || 'Institut Teknologi',
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      title: title || 'Perancangan Sistem Rekayasa',
      category: 'IoT & Telemetry',
      software: 'Arduino C++, KiCAD',
      totalCost: cost,
      dpPaid: 0,
      balanceDue: cost,
      escrowStatus: 'WAITING_DP',
      progressStep: 1,
      consultant: 'Dian Pratama, S.T.',
      deadline: '20 Nov 2026',
      createdAt: '29 Okt 2026',
      revisionsUsed: 0,
      revisionsMax: 3
    };

    store.state.admin.orders.unshift(newOrder);
    store.saveState();
    showToast(`Order baru #${newOrder.id} (${newOrder.clientName}) berhasil didaftarkan ke Pipeline Admin!`, 'success');
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
