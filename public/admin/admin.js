const config = window.DIV2_REPO_CONFIG || {};
const files = [
  { label: 'Creator Builds', path: '../data/builds.json', repoPath: 'data/builds.json', help: 'YouTube video cards, tags, descriptions, dates, and starter scores.' },
  { label: 'Tools & Resources', path: '../data/resources.json', repoPath: 'data/resources.json', help: 'Tools, utilities, GitHub projects, official links, guides, spreadsheets, and communities.' },
  { label: 'Creator Sources', path: '../data/creators.json', repoPath: 'data/creators.json', help: 'YouTube channels and search keywords used by the optional scheduled updater.' },
  { label: 'Intel Links', path: '../data/intel.json', repoPath: 'data/intel.json', help: 'Official news, live-service destinations, submit links, and site sections.' }
];
let active = files[0];
const $ = (selector) => document.querySelector(selector);

function repoEditUrl(repoPath){
  const repo = (config.githubRepoUrl || '').replace(/\/$/, '');
  if (!repo || repo.includes('YOUR_USERNAME')) return '#';
  return `${repo}/edit/main/${repoPath}`;
}

function setStatus(message, type = ''){
  const el = $('#admin-status');
  el.textContent = message;
  el.className = `admin-status ${type}`;
}

function parseEditor(){
  return JSON.parse($('#json-editor').value);
}

function renderTabs(){
  $('#admin-tabs').innerHTML = files.map((file) => `<button class="admin-tab ${file.repoPath === active.repoPath ? 'active' : ''}" data-path="${file.repoPath}" type="button">${file.label}<br><span class="admin-small">${file.repoPath}</span></button>`).join('');
  document.querySelectorAll('[data-path]').forEach((button) => button.addEventListener('click', () => {
    active = files.find((file) => file.repoPath === button.dataset.path);
    loadFile(active);
  }));
}

async function loadFile(file){
  renderTabs();
  $('#editor-title').textContent = file.label;
  $('#editor-meta').textContent = `${file.repoPath} — ${file.help}`;
  $('#github-edit-link').href = repoEditUrl(file.repoPath);
  try{
    const response = await fetch(file.path, { cache: 'no-store' });
    if(!response.ok) throw new Error(`Could not load ${file.repoPath}`);
    const data = await response.json();
    $('#json-editor').value = JSON.stringify(data, null, 2);
    setStatus(`Loaded ${file.repoPath}.`, 'ok');
  }catch(error){
    $('#json-editor').value = '';
    setStatus(error.message, 'bad');
  }
}

function validate(){
  try{
    const data = parseEditor();
    const count = Array.isArray(data) ? `${data.length} records` : `${Object.keys(data).length} keys`;
    setStatus(`Valid JSON. ${count} found.`, 'ok');
    return data;
  }catch(error){
    setStatus(`Invalid JSON: ${error.message}`, 'bad');
    return null;
  }
}

function download(){
  const data = validate();
  if(!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = active.repoPath.split('/').pop();
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus(`Downloaded ${a.download}. Upload it to ${active.repoPath} in GitHub.`, 'ok');
}

$('#validate-json').addEventListener('click', validate);
$('#download-json').addEventListener('click', download);
$('#format-json').addEventListener('click', () => {
  const data = validate();
  if(data) $('#json-editor').value = JSON.stringify(data, null, 2);
});
$('#copy-json').addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText($('#json-editor').value);
    setStatus('Copied JSON to clipboard.', 'ok');
  }catch{
    setStatus('Clipboard copy was blocked by the browser. Select the text and copy manually.', 'bad');
  }
});
$('#upload-json').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if(!file) return;
  $('#json-editor').value = await file.text();
  validate();
});

loadFile(active);
