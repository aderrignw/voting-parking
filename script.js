const $ = (id) => document.getElementById(id);
const verifyForm = $('verifyForm');
const voteForm = $('voteForm');
const verifyMessage = $('verifyMessage');
const voteMessage = $('voteMessage');
const proposalSection = $('proposalSection');
const voteSection = $('voteSection');
const residentSummary = $('residentSummary');
const verifiedBadge = $('verifiedBadge');
const proposalFrame = $('proposalFrame');
const reviewGate = $('reviewGate');
const reviewTimer = $('reviewTimer');
const reviewDone = $('reviewDone');
const voteEmail = $('voteEmail');
const voteEircode = $('voteEircode');
const voteSubmittedAtIreland = $('voteSubmittedAtIreland');
const voteReferenceId = $('voteReferenceId');
const votingClosedNotice = $('votingClosedNotice');
const votingClosedText = $('votingClosedText');
const votingClosedDate = $('votingClosedDate');
let votingClosed = false;
let resident = { email: '', eircode: '', eircodeStatus: 'verified', confirmUnlistedEircode: false };
let pendingUnlistedEircode = null;
let proposalLoaded = false;
let reviewUnlocked = false;
let reviewInterval = null;
const REVIEW_SECONDS = 75;
const INELIGIBLE_EIRCODE_MESSAGE = 'This consultation is restricted to residents within the Aderrig Green area. The Eircode provided could not be verified as belonging to an eligible residence. Please check your Eircode and try again.';
const UNLISTED_EIRCODE_MESSAGE = 'We could not match this Eircode to the Aderrig Green residence register. Please check it carefully. If it is correct, you may confirm it and it will be marked for administrator review.';
const EMAIL_MESSAGE = 'Please enter a valid email address, e.g. name@example.com.';
const CLUID_LOCK_VERSION = 'cluid-lock-emergency-20260612-02';

const CLUID_EIRCODE_EMAIL_MAP = new Map([
  ['K78T2N5', 'tbreen@cluid.ie'],
  ['K78T9P8', 'tbreen@cluid.ie'],
  ['K78T1W9', 'tbreen@cluid.ie'],
  ['K78E9R2', 'tbreen@cluid.ie'],
  ['K78K2T0', 'tbreen@cluid.ie'],
  ['K78E7Y0', 'tbreen@cluid.ie'],
  ['K78A8P3', 'sculhane@cluid.ie'],
  ['K78N9P3', 'tbreen@cluid.ie'],
  ['K78Y0E0', 'tbreen@cluid.ie'],
  ['K78C2H9', 'tbreen@cluid.ie'],
  ['K78R6P2', 'tbreen@cluid.ie'],
  ['K78X2R5', 'tbreen@cluid.ie'],
  ['K78P8W6', 'tbreen@cluid.ie'],
  ['K78E6H9', 'tbreen@cluid.ie'],
  ['K78X6W2', 'omc@cluid.ie'],
  ['K78K5P1', 'omc@cluid.ie'],
  ['K78E4P9', 'omc@cluid.ie'],
  ['K78R1X7', 'omc@cluid.ie'],
  ['K78A3P8', 'omc@cluid.ie'],
  ['K78P6Y2', 'omc@cluid.ie'],
  ['K78X2W8', 'omc@cluid.ie'],
  ['K78V0Y8', 'omc@cluid.ie'],
  ['K78X8N9', 'omc@cluid.ie']
]);

const CLUID_ONLY_MESSAGE = 'This email is not authorised to vote for this Clúid property. Please use the registered Clúid email address for this property. (Clúid only)';

function eircodeKey(value){
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function cluidAuthorisedEmailForEircode(eircode){
  return CLUID_EIRCODE_EMAIL_MAP.get(eircodeKey(eircode)) || '';
}

function isAuthorisedCluidVote(eircode, email){
  const authorisedEmail = cluidAuthorisedEmailForEircode(eircode);
  if (!authorisedEmail) return true;
  return String(email || '').trim().toLowerCase() === authorisedEmail;
}


function normalizeEircode(value){
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/^(.{3})(.{4})$/, '$1 $2');
}

function enforceCluidEmailLockNow(){
  const emailEl = $('email');
  const eircodeEl = $('eircode');
  const email = emailEl ? String(emailEl.value || '').trim().toLowerCase() : '';
  const eircode = eircodeEl ? normalizeEircode(eircodeEl.value || '') : '';
  if (!isAuthorisedCluidVote(eircode, email)) {
    setMessage(verifyMessage, CLUID_ONLY_MESSAGE);
    if (proposalSection) proposalSection.hidden = true;
    if (voteSection) voteSection.hidden = true;
    resident = { email: '', eircode: '', eircodeStatus: 'verified', confirmUnlistedEircode: false };
    return false;
  }
  return true;
}

function eligibleAderrigGreenEircode(eircode){
  return String(eircode || '').replace(/\s+/g, '').startsWith('K78');
}
function validResidentEmail(email){
  const value = String(email || '').trim().toLowerCase();
  if (value.length < 6 || value.length > 254) return false;
  if (/\s/.test(value) || value.includes('..')) return false;
  const match = value.match(/^([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i);
  if (!match) return false;
  const local = match[1];
  const domain = match[2];
  if (local.startsWith('.') || local.endsWith('.')) return false;
  const labels = domain.split('.');
  if (labels.some(label => !label || label.startsWith('-') || label.endsWith('-'))) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) return false;
  if (['pdf','doc','docx','xls','xlsx','txt','jpg','jpeg','png','gif','html','zip'].includes(tld)) return false;
  return true;
}
const INVALID_EIRCODE_MESSAGE = 'This Eircode does not appear to be a valid residential Eircode. Please check the Eircode and try again.';

function clearlyInvalidEircode(eircode){
  const compact = String(eircode || '').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if (!/^K78[A-Z0-9]{4}$/.test(compact)) return false;

  const unique = compact.slice(3);

  if (['0000','XXXX','TEST'].includes(unique)) return true;
  if (/^([A-Z0-9])\1{3}$/.test(unique)) return true;
  if (/^1234$/.test(unique)) return true;
  if (/^ABCD$/.test(unique)) return true;
  if (/^ZZZZ$/.test(unique)) return true;

  return false;
}
function setMessage(el, text, ok=false){
  el.textContent = text || '';
  el.classList.toggle('ok', !!ok);
}
function hideEircodeReviewBox(){
  const box = $('eircodeReviewBox');
  if (box) box.classList.add('hidden');
  pendingUnlistedEircode = null;
}
function showEircodeReviewBox(email, eircode){
  pendingUnlistedEircode = { email, eircode };
  let box = $('eircodeReviewBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'eircodeReviewBox';
    box.className = 'eircodeReviewBox';
    box.innerHTML = `
      <strong>Eircode not found in the register</strong>
      <p>We could not match this Eircode to the Aderrig Green residence register.</p>
      <p>Please check it carefully. Is this the correct Eircode for your residence?</p>
      <div class="eircodeReviewActions">
        <button type="button" class="btn secondary" id="eircodeCorrectBtn">No, I will correct it</button>
        <button type="button" class="btn" id="eircodeConfirmBtn">Yes, this is correct</button>
      </div>`;
    verifyMessage.insertAdjacentElement('afterend', box);
    $('eircodeCorrectBtn').addEventListener('click', () => {
      hideEircodeReviewBox();
      setMessage(verifyMessage, 'Please correct your Eircode and press Continue again.');
      $('eircode').focus();
      $('eircode').select();
    });
    $('eircodeConfirmBtn').addEventListener('click', async () => {
      if (!pendingUnlistedEircode) return;
      const btn = $('eircodeConfirmBtn');
      btn.disabled = true;
      btn.textContent = 'Confirming...';
      try {
        await postJSON('/.netlify/functions/check-eircode', { email: pendingUnlistedEircode.email, eircode: pendingUnlistedEircode.eircode, confirmUnlistedEircode: true });
        unlockProposal(pendingUnlistedEircode.email, pendingUnlistedEircode.eircode, true);
        hideEircodeReviewBox();
        setMessage(verifyMessage, 'Eircode confirmed for administrator review. Please review the proposal below.', true);
        proposalSection.scrollIntoView({ behavior:'smooth', block:'start' });
      } catch (err) {
        setMessage(verifyMessage, err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Yes, this is correct';
      }
    });
  }
  box.classList.remove('hidden');
}
function serviceUnavailableMessage(){
  return location.protocol === 'file:'
    ? 'This vote check only works after the folder is deployed on Netlify. Local file preview cannot run Netlify Functions.'
    : 'Unable to check this Eircode. Please refresh and try again.';
}
function encodeNetlifyForm(form){
  return new URLSearchParams(new FormData(form)).toString();
}
function makePublicReferenceId(){
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `AG-2026-${out.slice(0,4)}-${out.slice(4,8)}`;
}


function formatClosedDateFromStatus(status = {}){
  const label = String(status.votingCloseLabel || status.closeLabel || '').trim();
  if (label) return `Closed on ${label}.`;
  const iso = String(status.votingCloseAtIso || status.closeAtIso || '').trim();
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-IE', { timeZone:'Europe/Dublin', day:'2-digit', month:'long', year:'numeric' });
  const time = d.toLocaleTimeString('en-IE', { timeZone:'Europe/Dublin', hour:'2-digit', minute:'2-digit', hour12:false });
  return `Closed on ${date}, ${time} · Ireland time.`;
}
function disableVotingPage(status = {}){
  votingClosed = true;
  document.body.classList.add('votingClosed');
  if (votingClosedNotice) votingClosedNotice.classList.remove('hidden');
  if (votingClosedText) {
    votingClosedText.textContent = 'The voting period for the Aderrig Green Car Parking Policy consultation has now closed. No further submissions can be accepted.';
  }
  if (votingClosedDate) votingClosedDate.textContent = formatClosedDateFromStatus(status);
  [verifyForm, voteForm].filter(Boolean).forEach(form => {
    form.querySelectorAll('input, button, textarea, select').forEach(el => { el.disabled = true; });
  });
  setMessage(verifyMessage, 'Voting has now closed. No further submissions can be accepted.');
  setMessage(voteMessage, 'Voting has now closed. No further submissions can be accepted.');
}
async function checkVotingStatus(){
  if (location.protocol === 'file:') return;
  try{
    const res = await fetch('/.netlify/functions/voting-status', { headers:{'accept':'application/json'}, cache:'no-store' });
    const status = await res.json().catch(() => ({}));
    if (res.ok && status.closed) disableVotingPage(status);
  }catch(e){
    console.warn('Voting status check failed.', e);
  }
}

function getPolicyDownloadVisitorKey(){
  const storageKey = 'agPolicyDownloadVisitorKey';
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key = 'visitor-' + makePublicReferenceId().replace('AG-2026-', '').replace('-', '') + '-' + Date.now().toString(36);
    localStorage.setItem(storageKey, key);
  }
  return key;
}
function getIrelandTimestamp(){
  return new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
}
function encodePolicyDownloadPayload(payload){
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => params.append(key, value == null ? '' : String(value)));
  return params.toString();
}
async function submitPolicyDownloadAudit(payload){
  const body = encodePolicyDownloadPayload(payload);
  let ok = false;
  try{
    const fn = await fetch('/.netlify/functions/register-policy-download', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(payload)
    });
    ok = fn.ok;
  }catch(e){
    ok = false;
  }
  if (!ok) {
    try{
      await fetch('/', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body
      });
    }catch(e){
      console.warn('Policy download audit registration failed.', e);
    }
  }
}
function currentPolicyDownloadPayload(){
  const emailInput = $('email');
  const eircodeInput = $('eircode');
  const currentEmail = resident.email || (emailInput ? emailInput.value.trim().toLowerCase() : '');
  const currentEircode = resident.eircode || (eircodeInput ? normalizeEircode(eircodeInput.value) : '');
  return {
    'form-name':'aderrig-green-policy-download-audit',
    visitorKey:getPolicyDownloadVisitorKey(),
    email:currentEmail,
    eircode:currentEircode,
    downloadedAtIreland:getIrelandTimestamp(),
    document:'Aderrig Green Parking Policy Draft',
    status:'Downloaded Draft Policy'
  };
}
function setupDraftPolicyDownload(){
  const link = $('draftPolicyDownload');
  if (!link) return;
  link.addEventListener('click', () => {
    submitPolicyDownloadAudit(currentPolicyDownloadPayload());
  });
}

async function submitNetlifyVoteBackup(){
  voteEmail.value = resident.email;
  voteEircode.value = resident.eircode;
  const voteEircodeStatus = $('voteEircodeStatus');
  if (voteEircodeStatus) voteEircodeStatus.value = resident.eircodeStatus || 'verified';
  voteSubmittedAtIreland.value = new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
  if (voteReferenceId && !voteReferenceId.value) voteReferenceId.value = makePublicReferenceId();
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeNetlifyForm(voteForm)
  });
  if (!res.ok) throw new Error('Netlify Forms backup submission failed.');
}
async function postJSON(url, data){
  let res;
  try{
    res = await fetch(url, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data) });
  }catch(e){
    throw new Error(serviceUnavailableMessage());
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || serviceUnavailableMessage());
  return json;
}
function openSection(section){
  section.classList.remove('closed');
}
function unlockVoteStep(){
  if (reviewUnlocked) return;
  reviewUnlocked = true;
  voteSection.classList.remove('locked');
  voteSection.classList.add('unlocked');
  residentSummary.textContent = resident.eircodeStatus === 'review_required'
    ? `Residence Eircode: ${resident.eircode}. This Eircode will be marked for administrator review. One vote only.`
    : `Verified residence: ${resident.eircode}. One vote only.`;
  reviewTimer.textContent = 'Thank you. You may now submit your vote below.';
  reviewDone.disabled = true;
  reviewDone.textContent = 'Proposal reviewed';
  openSection(voteSection);
  voteSection.scrollIntoView({ behavior:'smooth', block:'start' });
}
function startReviewTimer(){
  clearInterval(reviewInterval);
  reviewGate.hidden = false;
  reviewDone.disabled = true;
  let remaining = REVIEW_SECONDS;
  const render = () => {
    const min = Math.floor(remaining / 60);
    const sec = String(remaining % 60).padStart(2, '0');
    reviewTimer.textContent = `Please review the proposal. The vote button will unlock in ${min}:${sec}.`;
  };
  render();
  reviewInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(reviewInterval);
      reviewTimer.textContent = 'You can now confirm that you have reviewed the proposal.';
      reviewDone.disabled = false;
      reviewDone.textContent = 'I have reviewed the proposal';
      return;
    }
    render();
  }, 1000);
}
function unlockProposal(email, eircode, reviewRequired=false){
  resident = { email, eircode, eircodeStatus: reviewRequired ? 'review_required' : 'verified', confirmUnlistedEircode: !!reviewRequired };
  $('eircode').value = eircode;
  verifiedBadge.textContent = reviewRequired ? `Confirmed for review: ${eircode}` : `Verified: ${eircode}`;
  openSection(proposalSection);
  proposalSection.classList.remove('locked');
  proposalSection.classList.add('unlocked');
  if (!proposalLoaded) { proposalFrame.src = proposalFrame.dataset.src; proposalLoaded = true; }
  startReviewTimer();
}
reviewDone.addEventListener('click', unlockVoteStep);
verifyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (votingClosed) return setMessage(verifyMessage, 'Voting has now closed. No further submissions can be accepted.');
  setMessage(verifyMessage, '');
  hideEircodeReviewBox();
  const email = $('email').value.trim().toLowerCase();
  const eircode = normalizeEircode($('eircode').value);
  if (!validResidentEmail(email)) return setMessage(verifyMessage, EMAIL_MESSAGE);
  if (!enforceCluidEmailLockNow()) return;
  if (!/^[A-Z0-9]{3}\s[A-Z0-9]{4}$/.test(eircode)) return setMessage(verifyMessage, 'Please enter a valid Eircode, e.g. K78 XXXX.');
  if (!eligibleAderrigGreenEircode(eircode)) return setMessage(verifyMessage, INELIGIBLE_EIRCODE_MESSAGE);
  if (clearlyInvalidEircode(eircode)) return setMessage(verifyMessage, INVALID_EIRCODE_MESSAGE);
  if (!isAuthorisedCluidVote(eircode, email)) return setMessage(verifyMessage, CLUID_ONLY_MESSAGE);
  const btn = verifyForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Checking...';
  try{
    const check = await postJSON('/.netlify/functions/check-eircode', { email, eircode });
    if (check.needsConfirmation || check.reviewRequired) {
      setMessage(verifyMessage, UNLISTED_EIRCODE_MESSAGE);
      showEircodeReviewBox(email, eircode);
      return;
    }
    unlockProposal(email, eircode, false);
    setMessage(verifyMessage, 'Verified. Please review the proposal below.', true);
    proposalSection.scrollIntoView({ behavior:'smooth', block:'start' });
  }catch(err){ setMessage(verifyMessage, err.message); }
  finally{ btn.disabled = false; btn.textContent = 'Continue'; }
});
voteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (votingClosed) return setMessage(voteMessage, 'Voting has now closed. No further submissions can be accepted.');
  setMessage(voteMessage, '');
  const selected = new FormData(voteForm).get('vote');
  const confirmed = $('confirmed').checked;
  if (!resident.email || !resident.eircode) return setMessage(voteMessage, 'Please complete resident verification first.');
  if (clearlyInvalidEircode(resident.eircode)) return setMessage(voteMessage, INVALID_EIRCODE_MESSAGE);
  if (!isAuthorisedCluidVote(resident.eircode, resident.email)) return setMessage(voteMessage, CLUID_ONLY_MESSAGE);
  if (!reviewUnlocked) return setMessage(voteMessage, 'Please review the proposal before submitting your vote.');
  if (!selected) return setMessage(voteMessage, 'Please select your vote.');
  if (!confirmed) return setMessage(voteMessage, 'Please confirm one vote per residence.');
  const btn = voteForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Submitting...';
  try{
    const publicReferenceId = makePublicReferenceId();
    if (voteReferenceId) voteReferenceId.value = publicReferenceId;
    const result = await postJSON('/.netlify/functions/submit-vote', { ...resident, vote:selected, confirmed, referenceId: publicReferenceId, confirmUnlistedEircode: resident.confirmUnlistedEircode === true });
    const ref = result?.record?.referenceId || publicReferenceId;
    if (voteReferenceId) voteReferenceId.value = ref;
    try { await submitNetlifyVoteBackup(); } catch (formsErr) { console.warn(formsErr); }
    sessionStorage.setItem('agVoteReferenceId', ref);
    sessionStorage.setItem('agVoteChoice', selected);
    window.location.href = 'success.html?ref=' + encodeURIComponent(ref) + '&vote=' + encodeURIComponent(selected);
  }
  catch(err){ setMessage(voteMessage, err.message); }
  finally{ btn.disabled = false; btn.textContent = 'Submit Vote'; }
});

checkVotingStatus();
setupDraftPolicyDownload();
