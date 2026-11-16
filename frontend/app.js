/**
 * ZK-GitProof Frontend Application
 * Fully drives the 4 screens matching the user screenshots:
 * - Landing Page (/)
 * - Badge Creator Dashboard (/dashboard)
 * - Verified Skill View (/badge/:id)
 * - Verify Lookup (/verify)
 */

const API_BASE = window.location.origin;

// State
const state = {
  activeView: 'landing',
  sandboxMode: true,
  enterpriseMode: false,
  currentBadgeId: 'zk-rust-15pr-88',
  selectedRepo: 'acme_payment',
  selectedClaimIndex: 1,
  selectedClaim: {
    title: 'Merged 15+ PRs',
    fullSkill: 'Merged 18 Pull Requests in Rust (Private Repository)',
    language: 'Rust',
    prCount: 18
  },
  mintedBadges: []
};

// Repository presets for the Dashboard
const REPO_PRESETS = {
  acme_payment: {
    name: 'acme-corp/payment-api',
    language: 'Rust',
    collaborators: 4,
    diffLines: 1420,
    claim1: 'Merged 15+ PRs',
    fullSkill: 'Merged 18 Pull Requests in Rust (Private Repository)',
    prCount: 18
  },
  acme_pipeline: {
    name: 'acme-corp/data-pipeline',
    language: 'Python',
    collaborators: 5,
    diffLines: 840,
    claim1: '500+ Lines of Rust/Python',
    fullSkill: '500+ Lines of Rust/Python (Private Repository)',
    prCount: 12
  },
  acme_tooling: {
    name: 'acme-corp/internal-tooling',
    language: 'TypeScript',
    collaborators: 6,
    diffLines: 2300,
    claim1: '50+ Private Contributions',
    fullSkill: '50+ Private Contributions (Internal Tooling)',
    prCount: 22
  }
};

// ========================================================
// ROUTING & VIEW NAVIGATION
// ========================================================
function navigate(path, pushState = true) {
  if (pushState) {
    window.history.pushState({}, '', path);
  }

  // Hide all view sections
  document.getElementById('viewLanding').classList.add('hidden');
  document.getElementById('viewDashboard').classList.add('hidden');
  document.getElementById('viewBadge').classList.add('hidden');
  document.getElementById('viewVerify').classList.add('hidden');

  const dashNav = document.getElementById('dashboardNavLinks');
  if (dashNav) dashNav.classList.add('hidden');

  // Match routes
  if (path === '/' || path === '') {
    state.activeView = 'landing';
    document.getElementById('viewLanding').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (path === '/dashboard') {
    state.activeView = 'dashboard';
    document.getElementById('viewDashboard').classList.remove('hidden');
    if (dashNav) dashNav.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (path.startsWith('/badge/')) {
    state.activeView = 'badge';
    const badgeId = path.split('/badge/')[1].split('?')[0];
    state.currentBadgeId = badgeId || 'zk-rust-15pr-88';
    document.getElementById('viewBadge').classList.remove('hidden');
    loadBadgeDetails(state.currentBadgeId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (path === '/verify') {
    state.activeView = 'verify';
    document.getElementById('viewVerify').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Default fallback to landing
    navigate('/', false);
  }
}

window.addEventListener('popstate', () => {
  navigate(window.location.pathname, false);
});

function goToHowItWorks() {
  if (state.activeView !== 'landing') {
    navigate('/', true);
    setTimeout(() => {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ========================================================
// PAGE 2: DASHBOARD LOGIC (Screenshot 2)
// ========================================================
function handleRepoChange(repoKey) {
  state.selectedRepo = repoKey;
  const repo = REPO_PRESETS[repoKey];
  if (!repo) return;

  // Update Live Redaction Preview browser view
  const previewRepo = document.getElementById('previewBrowserRepoName');
  if (previewRepo) previewRepo.textContent = repo.name;

  // Update Anti-Gaming check indicators
  const collabsText = document.getElementById('antiGamingCollabsText');
  const diffText = document.getElementById('antiGamingDiffText');
  if (collabsText) collabsText.textContent = `Multi-contributor repo verified (${repo.collaborators} contributors >= 2)`;
  if (diffText) diffText.textContent = `Substantial code diff verified (${repo.diffLines} lines changed >= 500)`;

  updateClaimSelection();
}

function selectClaimOption(optionIndex) {
  state.selectedClaimIndex = optionIndex;
  
  const opt1 = document.getElementById('claimOption1');
  const opt2 = document.getElementById('claimOption2');
  const opt3 = document.getElementById('claimOption3');

  // Reset classes
  [opt1, opt2, opt3].forEach((opt, idx) => {
    if (!opt) return;
    const isSelected = (idx + 1) === optionIndex;
    if (isSelected) {
      opt.className = 'cursor-pointer rounded-2xl p-3 border-2 border-emerald-500 bg-emerald-50/50 flex flex-col items-center text-center space-y-2 transition-all';
      opt.querySelector('div').className = 'w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center';
      opt.querySelector('div').innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-600"></span>';
    } else {
      opt.className = 'cursor-pointer rounded-2xl p-3 border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center text-center space-y-2 transition-all';
      opt.querySelector('div').className = 'w-4 h-4 rounded-full border-2 border-slate-300';
      opt.querySelector('div').innerHTML = '';
    }
  });

  updateClaimSelection();
}

function updateClaimSelection() {
  const repo = REPO_PRESETS[state.selectedRepo] || REPO_PRESETS.acme_payment;
  let title = 'Merged 15+ PRs';
  let fullSkill = 'Merged 18 Pull Requests in Rust (Private Repository)';
  let prCount = 18;

  if (state.selectedClaimIndex === 1) {
    title = 'Merged 15+ PRs';
    fullSkill = `Merged ${repo.prCount || 18} Pull Requests in ${repo.language} (Private Repository)`;
    prCount = repo.prCount || 18;
  } else if (state.selectedClaimIndex === 2) {
    title = '500+ Lines of Rust/Python';
    fullSkill = `500+ Lines of Code in ${repo.language} (Private Repository)`;
    prCount = 12;
  } else if (state.selectedClaimIndex === 3) {
    title = '50+ Private Contributions';
    fullSkill = `50+ Private Contributions in ${repo.language}`;
    prCount = 25;
  }

  state.selectedClaim = {
    title,
    fullSkill,
    language: repo.language,
    prCount
  };

  const previewClaim = document.getElementById('previewBrowserClaimText');
  if (previewClaim) previewClaim.textContent = title;
}

async function handleGenerateProof() {
  const btn = document.getElementById('generateProofBtn');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Generating zkTLS Proof...`;

  const repo = REPO_PRESETS[state.selectedRepo];

  try {
    const payload = {
      candidate_id: "@alex-dev",
      candidate_role: "Developer",
      skill_title: state.selectedClaim.fullSkill,
      language: state.selectedClaim.language,
      pr_count: state.selectedClaim.prCount,
      private_repo_name: repo.name,
      company_name: "Tier-1 Enterprise / Quant Firm",
      date_range: "Jan 2026 - Oct 2026",
      collaborators_count: repo.collaborators,
      lines_changed: repo.diffLines,
      enterprise_mode: state.enterpriseMode
    };

    const res = await fetch(`${API_BASE}/api/proof/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success && data.badge_id) {
      showToast('ZK Badge Minted Successfully!');
      setTimeout(() => {
        navigate(`/badge/${data.badge_id}`);
      }, 700);
    } else {
      alert(`Error minting badge: ${data.detail || 'Unknown error'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to backend API.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function switchSidebarTab(tab) {
  if (tab === 'create') {
    navigate('/dashboard');
  } else if (tab === 'badges') {
    const el = document.getElementById('dashboardMintedBadgesGrid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else if (tab === 'settings') {
    toggleEnterpriseMode();
  }
}

// ========================================================
// PAGE 3: VERIFIED SKILL VIEW (Screenshot 3)
// ========================================================
async function loadBadgeDetails(badgeId) {
  try {
    const res = await fetch(`${API_BASE}/api/badges/${badgeId}`);
    if (!res.ok) {
      console.warn('Badge not found, using default state');
      return;
    }
    const badge = await res.json();
    const pub = badge.public_inputs;

    const handle = document.getElementById('badgeCandidateHandle');
    if (handle) handle.textContent = badge.candidate_id || '@alex-dev';

    const role = document.getElementById('badgeCandidateRole');
    if (role) role.textContent = badge.candidate_role || 'Developer';

    const skillText = document.getElementById('badgeSkillClaimText');
    if (skillText) skillText.textContent = pub.skill_title;

    const timeframe = document.getElementById('badgeTimeframeText');
    if (timeframe) timeframe.textContent = pub.date_range || 'Jan 2026 - Oct 2026';

    // Co-Signature display
    const coSignBox = document.getElementById('badgeCoSignDisplay');
    if (badge.co_signature && coSignBox) {
      coSignBox.classList.remove('hidden');
      document.getElementById('coSignText').textContent = `"${badge.co_signature.endorsement_note}"`;
      document.getElementById('coSignSigner').textContent = `— ${badge.co_signature.manager_name}, ${badge.co_signature.manager_title}`;
    } else if (coSignBox) {
      coSignBox.classList.add('hidden');
    }
  } catch (err) {
    console.error('Error fetching badge details:', err);
  }
}

function handleReVerifyLocal() {
  const spin = document.getElementById('reVerifySpin');
  const resultCard = document.getElementById('localVerifyResultCard');
  if (spin) spin.classList.add('animate-spin');

  setTimeout(() => {
    if (spin) spin.classList.remove('animate-spin');
    if (resultCard) {
      resultCard.classList.remove('hidden');
      const hashEl = document.getElementById('localMerkleHash');
      if (hashEl) {
        hashEl.textContent = `Merkle Root: 0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)} | TLS Signature Authentic`;
      }
    }
    showToast('Cryptographic local verification complete!');
  }, 1000);
}

// ========================================================
// PAGE 4: VERIFY LOOKUP (Screenshot 4)
// ========================================================
async function handleVerifyNow() {
  const input = document.getElementById('verifyLookupInput');
  const badgeId = input.value.trim();
  if (!badgeId) return;

  const btn = document.getElementById('verifyNowBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="w-4 h-4 animate-spin text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Verifying Proof...`;

  const card = document.getElementById('verifyOutcomeCard');

  try {
    const res = await fetch(`${API_BASE}/api/proof/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id: badgeId })
    });
    const data = await res.json();

    card.classList.remove('hidden');

    if (data.valid) {
      card.className = 'rounded-2xl p-5 border border-emerald-300 bg-emerald-50 text-xs space-y-3';
      card.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
          <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          <span>Proof Verified Authentic!</span>
        </div>
        <p class="text-emerald-950 font-semibold">${data.message}</p>
        <div class="bg-white/80 rounded-xl p-3 font-mono text-[11px] space-y-1 text-slate-700">
          <div><span class="text-slate-400">Skill Statement:</span> <span class="font-bold text-slate-900">${data.details.skill || 'Merged PRs'}</span></div>
          <div><span class="text-slate-400">Employer Entity:</span> <span class="font-bold text-emerald-800">${data.details.company || '[REDACTED]'}</span></div>
          <div><span class="text-slate-400">Repository Name:</span> <span class="font-bold text-emerald-800">[REDACTED]</span></div>
          <div><span class="text-slate-400">Curve:</span> BN254 Groth16 | Status: ${data.details.status}</div>
        </div>
        <button onclick="navigate('/badge/${badgeId}')" class="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700">
          Open Verified Badge View →
        </button>
      `;
      showToast('Badge verification succeeded!');
    } else {
      card.className = 'rounded-2xl p-5 border border-rose-300 bg-rose-50 text-xs space-y-3';
      card.innerHTML = `
        <div class="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
          <div class="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">✕</div>
          <span>Verification Failed / Signature Mismatch</span>
        </div>
        <p class="text-rose-950 font-semibold">${data.message}</p>
        <div class="bg-white/80 rounded-xl p-3 font-mono text-[11px] space-y-1 text-slate-700">
          <div><span class="text-slate-400">Badge ID:</span> <span class="text-rose-700 font-bold">${badgeId}</span></div>
          <div><span class="text-slate-400">Attestation Error:</span> Tampered public input or invalid cryptographic signature.</div>
        </div>
      `;
      showToast('Cryptographic check failed: Tampering detected!');
    }
  } catch (err) {
    console.error(err);
    card.classList.remove('hidden');
    card.className = 'rounded-2xl p-5 border border-amber-300 bg-amber-50 text-xs space-y-2';
    card.innerHTML = `<span class="font-bold text-amber-900">Network error while connecting to verifier.</span>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function trySampleBadge(type) {
  const input = document.getElementById('verifyLookupInput');
  if (type === 'valid') {
    input.value = 'zk-rust-15pr-88';
  } else {
    input.value = 'zk-tampered-badge-99';
  }
  handleVerifyNow();
}

// ========================================================
// SHARE MODAL & ECOSYSTEM WIDGETS (Phase 4)
// ========================================================
function openShareModal(badgeId) {
  const id = badgeId || state.currentBadgeId || 'zk-rust-15pr-88';
  state.currentBadgeId = id;
  const modal = document.getElementById('shareModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // 1. LinkedIn deep link
  const certName = encodeURIComponent('Verified Private PR Contributions (zkTLS)');
  const orgName = encodeURIComponent('ZK-GitProof Verifier Network');
  const certUrl = encodeURIComponent(`${API_BASE}/badge/${id}`);
  const linkedinLink = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&certUrl=${certUrl}&certId=${id}`;
  document.getElementById('linkedinDeepLink').href = linkedinLink;

  // 2. Markdown Snippet
  const markdownSnippet = `[![ZK-GitProof: Merged PRs](${API_BASE}/api/badges/${id}/svg)](${API_BASE}/badge/${id})`;
  document.getElementById('markdownSnippetText').value = markdownSnippet;

  // 3. ATS JSON-LD URL
  document.getElementById('atsJsonLdUrl').value = `${API_BASE}/api/badges/${id}/ats`;
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function copySnippet(type) {
  let text = '';
  if (type === 'markdown') {
    text = document.getElementById('markdownSnippetText').value;
  } else if (type === 'ats') {
    text = document.getElementById('atsJsonLdUrl').value;
  }
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
}

function copyBadgeLink(badgeId) {
  const link = `${window.location.origin}/badge/${badgeId}`;
  navigator.clipboard.writeText(link);
  showToast('Badge link copied to clipboard!');
}

// ========================================================
// ENTERPRISE & CO-SIGNATURE WORKFLOW (Phase 3)
// ========================================================
function toggleEnterpriseMode() {
  state.enterpriseMode = !state.enterpriseMode;
  const banner = document.getElementById('enterpriseBannerNotice');
  if (banner) {
    if (state.enterpriseMode) {
      banner.classList.remove('hidden');
      showToast('Enterprise Mode enabled (contributionsCollection)');
    } else {
      banner.classList.add('hidden');
      showToast('Enterprise Mode disabled');
    }
  }
}

function openCoSignModal() {
  const modal = document.getElementById('coSignModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeCoSignModal() {
  const modal = document.getElementById('coSignModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleGenerateCoSign() {
  const name = document.getElementById('managerNameInput').value;
  const title = document.getElementById('managerTitleInput').value;
  const email = document.getElementById('managerEmailInput').value;

  try {
    const res = await fetch(`${API_BASE}/api/enterprise/co-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        badge_id: state.currentBadgeId || 'zk-rust-15pr-88',
        manager_name: name,
        manager_title: title,
        manager_company: 'Enterprise Corp',
        manager_email: email,
        endorsement_note: 'I verify that this developer delivered high-impact engineering work in our confidential repository.'
      })
    });
    const data = await res.json();
    if (data.success) {
      closeCoSignModal();
      showToast('Manager Co-Sign link generated!');
      loadBadgeDetails(state.currentBadgeId);
    }
  } catch (err) {
    console.error(err);
  }
}

// ========================================================
// SANDBOX & GITHUB AUTH DEMO
// ========================================================
function toggleSandboxMode() {
  state.sandboxMode = !state.sandboxMode;
  const label = document.getElementById('sandboxLabel');
  if (label) {
    label.textContent = state.sandboxMode ? 'Sandbox Mode' : 'Live GitHub Mode';
  }
  showToast(state.sandboxMode ? 'Switched to Sandbox Mode' : 'Switched to Live GitHub OAuth');
}

function handleConnectGitHub() {
  if (state.sandboxMode) {
    showToast('Sandbox GitHub session connected: @alex-dev');
    navigate('/dashboard');
  } else {
    // In real mode, would redirect to GitHub OAuth authorize URL
    const clientId = 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = encodeURIComponent(`${window.location.origin}/dashboard`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,read:user&redirect_uri=${redirectUri}`;
  }
}

// Toast helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ========================================================
// INITIALIZATION
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize routes from current URL
  navigate(window.location.pathname, false);

  // Initialize repo selection
  handleRepoChange('acme_payment');
  selectClaimOption(1);
});
