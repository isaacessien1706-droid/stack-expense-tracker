class BoundedStack {
  constructor(capacity = 4) {
    this.items = [];
    this.maxCapacity = capacity;
  }
  isEmpty() { return this.items.length === 0; }
  isFull()  { return this.items.length >= this.maxCapacity; }
  size()    { return this.items.length; }
  push(item) {
    if (this.isFull()) throw new Error("Stack Overflow");
    this.items.push(item);
  }
  pop() {
    if (this.isEmpty()) throw new Error("Stack Underflow");
    return this.items.pop();
  }
  peek() {
    return this.isEmpty() ? null : this.items[this.items.length - 1];
  }
}

const hierarchyLevels = [
  { level: 1, role: "1. Employee Submission", defaultPerson: "Kwame Mensah (Software Eng)", defaultNote: "Attached vendor invoice & hardware spec" },
  { level: 2, role: "2. Team Lead Sign-Off", defaultPerson: "Ama Osei (Engineering Lead)", defaultNote: "Verified Q4 infrastructure budget" },
  { level: 3, role: "3. Finance Manager Audit", defaultPerson: "Kofi Boateng (Finance Mgr)", defaultNote: "Tax compliance & VAT calculation verified" },
  { level: 4, role: "4. Executive Director Sign-Off", defaultPerson: "Esi Danquah (Exec Director)", defaultNote: "Final bank disbursement authorized" }
];

const approvalStack = new BoundedStack(4);

function addLog(op, detail) {
  const box = document.getElementById("logContainer");
  const time = new Date().toLocaleTimeString();
  const row = document.createElement("div");
  row.className = "log-entry";
  row.innerHTML = `<span class="log-time">[${time}]</span> <strong style="color:var(--burgundy-primary)">${op}:</strong> ${detail}`;
  box.prepend(row);
}

function updateBanner(message, mode = "normal") {
  const banner = document.getElementById("statusBanner");
  banner.className = "status-banner";
  if (mode === "error") banner.classList.add("error");
  if (mode === "peek") banner.classList.add("peek");
  banner.textContent = message;
}

function populateNextDefaults() {
  const idx = approvalStack.size();
  if (idx < hierarchyLevels.length) {
    document.getElementById("approverInput").value = hierarchyLevels[idx].defaultPerson;
    document.getElementById("noteInput").value = hierarchyLevels[idx].defaultNote;
  }
}

function pushSignature() {
  if (approvalStack.isFull()) {
    updateBanner("STACK OVERFLOW: All 4 approval levels are complete. Payout is already unlocked!", "error");
    addLog("OVERFLOW", "Rejected push() — Stack capacity (4/4) reached.");
    return;
  }

  const idx = approvalStack.size();
  const person = document.getElementById("approverInput").value.trim() || hierarchyLevels[idx].defaultPerson;
  const note = document.getElementById("noteInput").value.trim() || hierarchyLevels[idx].defaultNote;

  const stamp = {
    level: hierarchyLevels[idx].level,
    role: hierarchyLevels[idx].role,
    person,
    note,
    time: new Date().toLocaleTimeString()
  };

  approvalStack.push(stamp);
  updateBanner(`push() -> Added ${stamp.role} by ${stamp.person}.`);
  addLog("PUSH()", `Level ${stamp.level} signed by ${stamp.person}`);

  populateNextDefaults();
  renderStackView();
}

function popSignature() {
  if (approvalStack.isEmpty()) {
    updateBanner("STACK UNDERFLOW: Cannot pop() an empty stack. Invoice has zero signatures.", "error");
    addLog("UNDERFLOW", "Rejected pop() — Stack is already empty.");
    return;
  }

  const reason = document.getElementById("noteInput").value.trim() || "Returned for audit revision";
  const popped = approvalStack.pop();

  const currentHolder = approvalStack.isEmpty()
    ? "Unsigned Employee Draft"
    : `${approvalStack.peek().role} (${approvalStack.peek().person})`;

  updateBanner(`pop() -> Revoked ${popped.role}. Returned to: ${currentHolder}.`, "error");
  addLog("POP()", `Revoked Level ${popped.level} (${popped.person}) — Note: "${reason}"`);

  populateNextDefaults();
  renderStackView();
}

function peekSignature() {
  if (approvalStack.isEmpty()) {
    updateBanner("peek() -> Stack is empty (nullptr). No active signature on top.", "peek");
    addLog("PEEK()", "Inspected top of stack -> Empty");
    return;
  }
  const top = approvalStack.peek();
  updateBanner(`peek() TOP -> ${top.role} signed by ${top.person} ("${top.note}")`, "peek");
  addLog("PEEK()", `Top element is Level ${top.level}: ${top.person}`);
}

function resetWorkflow() {
  while (!approvalStack.isEmpty()) {
    approvalStack.pop();
  }
  populateNextDefaults();
  updateBanner("Invoice stack cleared via repeated pop() operations. Ready for Level 1.");
  addLog("RESET", "Cleared all signatures from stack.");
  renderStackView();
}

function renderStackView() {
  const well = document.getElementById("stackWell");
  well.innerHTML = "";

  document.getElementById("sizeCounter").textContent = `size(): ${approvalStack.size()} / 4`;

  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step${i}`);
    stepEl.className = i <= approvalStack.size() ? "step-pill completed" : "step-pill";
  }

  const badge = document.getElementById("payoutBadge");
  if (approvalStack.isFull()) {
    badge.className = "payout-badge unlocked";
    badge.textContent = "✓ All 4 Approvals Complete — Payout Unlocked";
  } else {
    badge.className = "payout-badge";
    badge.textContent = `Pending (${4 - approvalStack.size()} more required)`;
  }

  if (approvalStack.isEmpty()) {
    well.innerHTML = `
      <div class="empty-state">
        <div style="font-weight:700; color:var(--burgundy-primary); margin-bottom:0.25rem;">[ APPROVAL STACK IS EMPTY ]</div>
        <div style="font-size:0.82rem;">Click <strong>"push() Sign-Off"</strong> to place the first signature onto the stack.</div>
      </div>`;
    return;
  }

  const tempStack = new BoundedStack(4);
  let isTop = true;

  while (!approvalStack.isEmpty()) {
    const item = approvalStack.pop();
    tempStack.push(item);

    const card = document.createElement("div");
    card.className = isTop ? "stamp-card top-of-stack" : "stamp-card";

    card.innerHTML = `
      <div>
        <div>
          <span class="stamp-badge ${isTop ? 'badge-top' : 'badge-locked'}">
            ${isTop ? 'TOP (Accessible)' : 'LOCKED (Buried)'}
          </span>
          <span class="stamp-role">${item.role}</span>
        </div>
        <div class="stamp-meta">
          Signed by <strong>${item.person}</strong> &mdash; <em>"${item.note}"</em>
        </div>
      </div>
      <div class="stamp-time">${item.time}</div>
    `;

    well.appendChild(card);
    isTop = false;
  }

  while (!tempStack.isEmpty()) {
    approvalStack.push(tempStack.pop());
  }
}

function switchView(view) {
  const simView = document.getElementById("simView");
  const cppView = document.getElementById("cppView");
  const simBtn  = document.getElementById("tabSimBtn");
  const cppBtn  = document.getElementById("tabCppBtn");

  if (view === "sim") {
    simView.classList.remove("hidden");
    cppView.classList.add("hidden");
    simBtn.classList.add("active");
    cppBtn.classList.remove("active");
  } else {
    simView.classList.add("hidden");
    cppView.classList.remove("hidden");
    cppBtn.classList.add("active");
    simBtn.classList.remove("active");
  }
}

function copyCppCode() {
  const code = document.getElementById("cppCodeBlock").innerText;
  navigator.clipboard.writeText(code);
  const btn = document.getElementById("copyBtn");
  btn.textContent = "✓ Copied!";
  setTimeout(() => { btn.textContent = "Copy C++ Code"; }, 2000);
}

pushSignature();
pushSignature();