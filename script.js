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
let resident = { email: '', eircode: '' };
let proposalLoaded = false;
let reviewUnlocked = false;
let reviewInterval = null;
const REVIEW_SECONDS = 75;

function normalizeEircode(value){
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/^(.{3})(.{4})$/, '$1 $2');
}
function setMessage(el, text, ok=false){
  el.textContent = text || '';
  el.classList.toggle('ok', !!ok);
}
function serviceUnavailableMessage(){
  return location.protocol === 'file:'
    ? 'This vote check only works after the folder is deployed on Netlify. Local file preview cannot run Netlify Functions.'
    : 'Unable to check this Eircode. Please refresh and try again.';
}
function encodeNetlifyForm(form){
  return new URLSearchParams(new FormData(form)).toString();
}
async function submitNetlifyVoteBackup(){
  voteEmail.value = resident.email;
  voteEircode.value = resident.eircode;
  voteSubmittedAtIreland.value = new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' });
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
  residentSummary.textContent = `Verified residence: ${resident.eircode}. One vote only.`;
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
function unlockProposal(email, eircode){
  resident = { email, eircode };
  $('eircode').value = eircode;
  verifiedBadge.textContent = `Verified: ${eircode}`;
  openSection(proposalSection);
  proposalSection.classList.remove('locked');
  proposalSection.classList.add('unlocked');
  if (!proposalLoaded) { proposalFrame.src = proposalFrame.dataset.src; proposalLoaded = true; }
  startReviewTimer();
}
reviewDone.addEventListener('click', unlockVoteStep);
verifyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(verifyMessage, '');
  const email = $('email').value.trim().toLowerCase();
  const eircode = normalizeEircode($('eircode').value);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setMessage(verifyMessage, 'Please enter a valid email address.');
  if (!/^[A-Z0-9]{3}\s[A-Z0-9]{4}$/.test(eircode)) return setMessage(verifyMessage, 'Please enter a valid Eircode, e.g. K78 XXXX.');
  const btn = verifyForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Checking...';
  try{
    await postJSON('/.netlify/functions/check-eircode', { eircode });
    unlockProposal(email, eircode);
    setMessage(verifyMessage, 'Verified. Please review the proposal below.', true);
    proposalSection.scrollIntoView({ behavior:'smooth', block:'start' });
  }catch(err){ setMessage(verifyMessage, err.message); }
  finally{ btn.disabled = false; btn.textContent = 'Continue'; }
});
voteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(voteMessage, '');
  const selected = new FormData(voteForm).get('vote');
  const confirmed = $('confirmed').checked;
  if (!resident.email || !resident.eircode) return setMessage(voteMessage, 'Please complete resident verification first.');
  if (!reviewUnlocked) return setMessage(voteMessage, 'Please review the proposal before submitting your vote.');
  if (!selected) return setMessage(voteMessage, 'Please select your vote.');
  if (!confirmed) return setMessage(voteMessage, 'Please confirm one vote per residence.');
  const btn = voteForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Submitting...';
  try{
    const result = await postJSON('/.netlify/functions/submit-vote', { ...resident, vote:selected, confirmed });
    try { await submitNetlifyVoteBackup(); } catch (formsErr) { console.warn(formsErr); }
    const ref = result?.record?.referenceId || '';
    sessionStorage.setItem('agVoteReferenceId', ref);
    window.location.href = 'success.html?ref=' + encodeURIComponent(ref);
  }
  catch(err){ setMessage(voteMessage, err.message); }
  finally{ btn.disabled = false; btn.textContent = 'Submit Vote'; }
});
