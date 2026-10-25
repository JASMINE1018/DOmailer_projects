// ---------- Data ----------
  let nextId = 13;
  let emails = [
    { id: 1,  sender: "HR TechCorp",          subject: "URGENT: Submit Q4 Performance Assessment", body: "Please complete your quarterly review before 5 PM today to avoid delay in processing.", time: "08:15 AM", read: false, starred: true },
    { id: 2,  sender: "Alex Dev",             subject: "Code Review - PR #402 DOM Refactoring", body: "Hey, can you take a look at the event delegation implementation when you have time?", time: "08:42 AM", read: false, starred: true },
    { id: 3,  sender: "GitHub Notifications", subject: "[IMPORTANT] Security alert on repository main branch", body: "We detected a potential dependency vulnerability in package.json. Please update immediately.", time: "09:05 AM", read: false, starred: true },
    { id: 4,  sender: "Sarah Product Lead",   subject: "Sprint Planning Alignment for Next Week", body: "Let's align our backlog items for DOMailer milestone 2 tomorrow at 10 AM.", time: "09:30 AM", read: true,  starred: false },
    { id: 5,  sender: "Figma Team",           subject: "New comments on DOMailer UI Wireframes", body: "Sarah left 3 new comments on the table view layout component.", time: "10:00 AM", read: true,  starred: false },
    { id: 6,  sender: "DevOps Ops",           subject: "Staging Server Maintenance Notice", body: "Staging environment will be down for scheduled upgrades tonight between 11 PM and 1 AM.", time: "10:15 AM", read: true,  starred: false },
    { id: 7,  sender: "Client Support",       subject: "URGENT: Login issue reported on production", body: "Multiple users are reporting intermittent 500 errors when submitting the login form.", time: "10:45 AM", read: false, starred: true },
    { id: 8,  sender: "Slack Workspace",      subject: "Weekly Activity Digest for TechCorp", body: "Here is your weekly summary: 142 new messages across 8 active channels.", time: "11:20 AM", read: true,  starred: false },
    { id: 9,  sender: "Finance Department",   subject: "Reimbursement Claim Approved", body: "Your internet allowance claim for last month has been processed and approved.", time: "11:50 AM", read: true,  starred: true },
    { id: 10, sender: "Radian QA",            subject: "Bug Report: Checkbox bulk selection bug", body: "When select all is checked, unchecking one row does not update the master checkbox state.", time: "12:10 PM", read: false, starred: false },
    { id: 11, sender: "Calendar",             subject: "Reminder: All-Hands Meeting in 30 minutes", body: "Join the company all-hands on the main video channel.", time: "01:00 PM", read: false, starred: false },
    { id: 12, sender: "Nina Design",          subject: "Icon set v2 ready for handoff", body: "Exported SVGs are in the shared drive under /DOMailer/icons.", time: "01:25 PM", read: true,  starred: true }
  ];

  const state = { filter: "all", query: "", selected: new Set() };
  const listEl = document.getElementById("email-list");
  const searchEl = document.getElementById("search");
  const filtersEl = document.getElementById("filters");
  const selectAllEl = document.getElementById("select-all");
  const bulkBar = document.getElementById("bulk-bar");
  const modal = document.getElementById("compose-modal");
  const form = document.getElementById("compose-form");

  // Subject yang mengandung kata ini akan diberi label prioritas.
  function isPriority(subject) {
    return /\b(URGENT|IMPORTANT)\b/i.test(subject);
  }

  // Cek apakah sebuah email sesuai dengan filter yang sedang dipilih.
  function matchesFilter(mail) {
    if (state.filter === "unread") return !mail.read;
    if (state.filter === "starred") return mail.starred;
    return true;
  }

  // Cek apakah pengirim atau subject mengandung kata pencarian.
  function matchesSearch(mail) {
    const query = state.query.trim().toLowerCase();
    if (!query) return true;

    return mail.sender.toLowerCase().includes(query)
      || mail.subject.toLowerCase().includes(query);
  }

  // Ambil email yang boleh ditampilkan berdasarkan filter dan pencarian.
  function getVisible() {
    return emails.filter((mail) => matchesFilter(mail) && matchesSearch(mail));
  }

  // Membuat cell tabel berisi teks biasa.
  function createTextCell(text, className = "") {
    const cell = document.createElement("td");
    cell.className = className;
    cell.textContent = text;
    return cell;
  }

  // Membuat cell checkbox untuk memilih email.
  function createCheckboxCell(mail) {
    const cell = document.createElement("td");
    const checkbox = document.createElement("input");

    cell.className = "c-chk";
    checkbox.type = "checkbox";
    checkbox.className = "row-check";
    checkbox.checked = state.selected.has(mail.id);
    checkbox.setAttribute("aria-label", "Select email from " + mail.sender);
    cell.append(checkbox);

    return cell;
  }

  // Membuat cell bintang. Kliknya diproses oleh event delegation di bawah.
  function createStarCell(mail) {
    const cell = document.createElement("td");
    const star = document.createElement("span");

    cell.className = "c-star";
    star.className = mail.starred ? "star on" : "star";
    star.dataset.action = "star";
    star.textContent = mail.starred ? "★" : "☆";
    cell.append(star);

    return cell;
  }

  // Membuat cell subject, termasuk label prioritas dan potongan isi email.
  function createSubjectCell(mail) {
    const cell = document.createElement("td");
    const snippet = document.createElement("span");

    if (isPriority(mail.subject)) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "HIGH PRIORITY";
      cell.append(tag);
    }

    snippet.className = "snippet";
    snippet.textContent = mail.body;
    cell.append(document.createTextNode(mail.subject), snippet);
    return cell;
  }

  // Membuat tombol hapus untuk satu email.
  function createDeleteCell() {
    const cell = document.createElement("td");
    const button = document.createElement("button");

    cell.className = "c-act";
    button.className = "del";
    button.dataset.action = "delete";
    button.textContent = "Delete";
    cell.append(button);

    return cell;
  }

  // Mengubah satu object email menjadi satu baris tabel.
  function buildRow(mail) {
    const row = document.createElement("tr");

    row.dataset.id = mail.id;
    row.className = mail.read ? "read" : "unread";
    row.append(
      createCheckboxCell(mail),
      createStarCell(mail),
      createTextCell(mail.sender),
      createSubjectCell(mail),
      createTextCell(mail.time, "c-date"),
      createDeleteCell()
    );

    return row;
  }


  function showEmptyMessage() {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "empty";
    cell.textContent = "No emails match your search or filter.";
    row.append(cell);
    listEl.append(row);
  }

  function render() {
    const visibleEmails = getVisible();

    listEl.replaceChildren();
    if (visibleEmails.length === 0) {
      showEmptyMessage();
    } else {
      listEl.append(...visibleEmails.map(buildRow));
    }

    updateCounters();
    updateBulkUI(visibleEmails);
  }

  function updateCounters() {
    const unreadCount = emails.filter((mail) => !mail.read).length;
    const starredCount = emails.filter((mail) => mail.starred).length;

    document.getElementById("unread-count").textContent = unreadCount;
    document.getElementById("starred-count").textContent = starredCount;
  }

  function updateBulkUI(visible = getVisible()) {
    // Jika email dihapus, hapus juga ID-nya dari daftar pilihan.
    const existingIds = new Set(emails.map((mail) => mail.id));
    state.selected.forEach((id) => {
      if (!existingIds.has(id)) state.selected.delete(id);
    });

    document.getElementById("selected-count").textContent = state.selected.size;
    bulkBar.classList.toggle("show", state.selected.size > 0);

    // Checkbox "select all" hanya menghitung email yang sedang terlihat.
    const checkedVisible = visible.filter((mail) => state.selected.has(mail.id)).length;
    selectAllEl.checked = visible.length > 0 && checkedVisible === visible.length;
    selectAllEl.indeterminate = checkedVisible > 0 && checkedVisible < visible.length;
  }

  // Ambil email berdasarkan ID yang disimpan di atribut data-id pada baris.
  function getMailFromRow(row) {
    const id = Number(row.dataset.id);
    return emails.find((mail) => mail.id === id);
  }

  // Menjalankan aksi ketika baris email diklik.
  function handleEmailClick(event) {
    const row = event.target.closest("tr[data-id]");
    if (!row || event.target.closest(".row-check")) return;

    const mail = getMailFromRow(row);
    const actionElement = event.target.closest("[data-action]");
    const action = actionElement ? actionElement.dataset.action : "toggle-read";

    if (action === "star") {
      mail.starred = !mail.starred;
    } else if (action === "delete") {
      emails = emails.filter((item) => item.id !== mail.id);
      state.selected.delete(mail.id);
    } else {
      // Klik di area lain pada baris akan mengubah status sudah dibaca.
      mail.read = !mail.read;
    }

    render();
  }

  // Menyimpan perubahan ketika checkbox satu email dicentang.
  function handleEmailSelection(event) {
    if (!event.target.matches(".row-check")) return;

    const row = event.target.closest("tr");
    const id = Number(row.dataset.id);

    if (event.target.checked) {
      state.selected.add(id);
    } else {
      state.selected.delete(id);
    }
    updateBulkUI();
  }

  // Event dipasang pada table body, bukan pada setiap baris.
  // Cara ini disebut event delegation dan tetap bekerja setelah render ulang.
  listEl.addEventListener("click", handleEmailClick);
  listEl.addEventListener("change", handleEmailSelection);

  // Select all & bulk actions 
  selectAllEl.addEventListener("change", () => {
    getVisible().forEach((mail) => {
      if (selectAllEl.checked) {
        state.selected.add(mail.id);
      } else {
        state.selected.delete(mail.id);
      }
    });
    render();
  });

  document.getElementById("bulk-read").addEventListener("click", () => {
    emails.forEach((mail) => {
      if (state.selected.has(mail.id)) mail.read = true;
    });
    render();
  });

  document.getElementById("bulk-delete").addEventListener("click", () => {
    emails = emails.filter((mail) => !state.selected.has(mail.id));
    state.selected.clear();
    render();
  });

  //Search & filters 
  searchEl.addEventListener("input", () => {
    state.query = searchEl.value;
    render();
  });

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    state.filter = btn.dataset.filter;
    filtersEl.querySelectorAll("button[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === btn);
    });
    render();
  });

  // Compose 
  document.getElementById("open-compose").addEventListener("click", () => {
    modal.showModal();
  });

  document.getElementById("cancel-compose").addEventListener("click", () => {
    modal.close();
  });

  // Membaca nilai input form dengan menghapus spasi di awal dan akhir.
  function getFormValue(id) {
    return document.getElementById(id).value.trim();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newEmail = {
      id: nextId++,
      sender: getFormValue("f-sender") || "You",
      subject: getFormValue("f-subject"),
      body: getFormValue("f-body"),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      read: false,
      starred: false
    };

    // unshift() menambahkan email baru di posisi paling atas.
    emails.unshift(newEmail);
    form.reset();
    document.getElementById("f-sender").value = "You";
    modal.close();
    render();
  });

  render();