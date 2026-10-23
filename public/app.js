// Frontend demo only. Change this value to false to preview a non-premium account.
// In a real application, premium status must be verified by the backend, not trusted from client JavaScript.
const IS_PREMIUM_USER = true;
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const transactions = [
  { id: 1, title: 'Monthly salary', category: 'Salary', date: '2026-10-23', type: 'income', amount: 3200, icon: '↙', iconClass: 'salary' },
  { id: 2, title: 'Grocery shopping', category: 'Food & Dining', date: '2026-10-22', type: 'expense', amount: 86.40, icon: '♧', iconClass: 'food' },
  { id: 3, title: 'Apartment rent', category: 'Housing', date: '2026-10-20', type: 'expense', amount: 850, icon: '⌂', iconClass: 'home' },
  { id: 4, title: 'Freelance project', category: 'Side income', date: '2026-10-18', type: 'income', amount: 750, icon: '✳', iconClass: 'salary' },
  { id: 5, title: 'Ride to work', category: 'Transport', date: '2026-10-17', type: 'expense', amount: 18.50, icon: '↗', iconClass: 'transport' },
  { id: 6, title: 'New headphones', category: 'Shopping', date: '2026-10-15', type: 'expense', amount: 129.99, icon: '◇', iconClass: 'shopping' },
  { id: 7, title: 'Health insurance', category: 'Health', date: '2026-10-13', type: 'expense', amount: 95.60, icon: '✚', iconClass: 'health' },
  { id: 8, title: 'Online course', category: 'Education', date: '2026-10-11', type: 'expense', amount: 49, icon: '▤', iconClass: 'other' },
  { id: 9, title: 'Cashback reward', category: 'Other income', date: '2026-10-08', type: 'income', amount: 45, icon: '✦', iconClass: 'salary' },
  { id: 10, title: 'Dinner with friends', category: 'Food & Dining', date: '2026-10-06', type: 'expense', amount: 72, icon: '♧', iconClass: 'food' },
  { id: 11, title: 'Electricity bill', category: 'Utilities', date: '2026-09-27', type: 'expense', amount: 68.25, icon: 'ϟ', iconClass: 'other' },
  { id: 12, title: 'Monthly salary', category: 'Salary', date: '2026-09-23', type: 'income', amount: 3200, icon: '↙', iconClass: 'salary' },
  { id: 13, title: 'Weekend trip', category: 'Travel', date: '2026-09-16', type: 'expense', amount: 245, icon: '↗', iconClass: 'transport' },
  { id: 14, title: 'Freelance project', category: 'Side income', date: '2026-09-10', type: 'income', amount: 500, icon: '✳', iconClass: 'salary' },
  { id: 15, title: 'Groceries', category: 'Food & Dining', date: '2026-08-22', type: 'expense', amount: 93.20, icon: '♧', iconClass: 'food' }
];

const state = { period: 'monthly', page: 1, pageSize: 6, search: '', type: 'all', selectedMonth: '2026-10' };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const dateLabel = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const startOfWeek = (date) => { const result = new Date(date); result.setHours(0, 0, 0, 0); result.setDate(result.getDate() - ((result.getDay() + 6) % 7)); return result; };
const toDate = (value) => new Date(`${value}T12:00:00`);
const amountText = (value) => currency.format(value);

function getPeriodTransactions() {
  const now = new Date();
  return transactions.filter((transaction) => {
    const date = toDate(transaction.date);
    if (state.period === 'all') return true;
    if (state.period === 'monthly') return transaction.date.startsWith(state.selectedMonth);
    if (state.period === 'weekly') {
      const start = startOfWeek(now); const end = new Date(start); end.setDate(end.getDate() + 7);
      // Use the selected month's last available week in this demo when viewing another month.
      if (!transaction.date.startsWith(state.selectedMonth)) return false;
      const monthEnd = new Date(`${state.selectedMonth}-01T12:00:00`); monthEnd.setMonth(monthEnd.getMonth() + 1); monthEnd.setDate(0);
      const effectiveStart = state.selectedMonth === now.toISOString().slice(0, 7) ? start : new Date(monthEnd);
      if (state.selectedMonth !== now.toISOString().slice(0, 7)) effectiveStart.setDate(Math.max(1, effectiveStart.getDate() - 6));
      const effectiveEnd = new Date(effectiveStart); effectiveEnd.setDate(effectiveEnd.getDate() + 7);
      return date >= effectiveStart && date < effectiveEnd;
    }
    if (state.period === 'daily') return transaction.date === now.toISOString().slice(0, 10) || (transaction.date.startsWith(state.selectedMonth) && transaction.date.endsWith('23'));
    return true;
  });
}

function renderSummary(list) {
  const incomeItems = list.filter(item => item.type === 'income');
  const expenseItems = list.filter(item => item.type === 'expense');
  const income = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const expenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  $('#balanceAmount').textContent = amountText(income - expenses);
  $('#incomeAmount').textContent = amountText(income);
  $('#expenseAmount').textContent = amountText(expenses);
  $('#incomeCount').textContent = `${incomeItems.length} transactions`;
  $('#chartIncome').textContent = amountText(income);
  $('#chartExpenses').textContent = amountText(expenses);
  const budget = 3350;
  $('#incomeProgress').style.width = `${Math.min(100, income / 5000 * 100)}%`;
  $('#expenseProgress').style.width = `${Math.min(100, expenses / budget * 100)}%`;
  $('#budgetUsed').textContent = `${Math.round(expenses / budget * 100)}% of ${currency.format(budget).replace('.00', '')}`;
  $('#donutTotal').textContent = amountText(expenses).replace('.00', '');
  renderChart(list);
  renderCategories(expenseItems);
}

function renderChart(list) {
  const buckets = state.period === 'daily' ? ['Morning', 'Afternoon', 'Evening', 'Night'] : state.period === 'weekly' ? ['Mon–Tue', 'Wed–Thu', 'Fri–Sat', 'Sunday'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const income = buckets.map(() => 0); const expense = buckets.map(() => 0);
  list.forEach(item => {
    const date = toDate(item.date); let index;
    if (state.period === 'daily') index = date.getHours() < 12 ? 0 : date.getHours() < 17 ? 1 : date.getHours() < 21 ? 2 : 3;
    else if (state.period === 'weekly') index = Math.min(3, Math.floor((date.getDay() + 6) % 7 / 2));
    else index = Math.min(3, Math.floor((date.getDate() - 1) / 7));
    (item.type === 'income' ? income : expense)[index] += item.amount;
  });
  const max = Math.max(100, ...income, ...expense) * 1.12;
  const groupWidth = 700 / buckets.length; const barWidth = Math.min(27, groupWidth * .22);
  const bars = [...income.map((value, i) => ({ value, i, cls: 'chart-bar-income', offset: -barWidth / 2 - 2 })), ...expense.map((value, i) => ({ value, i, cls: 'chart-bar-expense', offset: barWidth / 2 + 2 }))];
  $('#chartBars').innerHTML = bars.map(({ value, i, cls, offset }) => {
    const height = Math.max(value > 0 ? 2 : 0, value / max * 205); const x = i * groupWidth + groupWidth / 2 + offset - barWidth / 2; const y = 215 - height;
    return `<rect class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${height.toFixed(1)}" rx="3"><title>${buckets[i]}: ${amountText(value)}</title></rect>`;
  }).join('');
  $('#chartLabels').innerHTML = buckets.map(label => `<span>${label}</span>`).join('');
}

function renderCategories(expenses) {
  const colors = ['#279b70', '#f0b09f', '#7dc8a7', '#d7e9de', '#e9eee9'];
  const totals = {};
  expenses.forEach(item => { totals[item.category] = (totals[item.category] || 0) + item.amount; });
  const categories = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = categories.reduce((sum, item) => sum + item[1], 0) || 1;
  let cursor = 0;
  const segments = categories.map(([, value], i) => { const start = cursor; cursor += value / total * 100; return `${colors[i]} ${start}% ${cursor}%`; });
  $('#spendingDonut').style.background = `conic-gradient(${segments.join(', ')})`;
  $('#categoryLegend').innerHTML = categories.map(([name, value], i) => `<div class="category-row"><i class="swatch" style="background:${colors[i]}"></i><span>${name}</span><strong>${Math.round(value / total * 100)}%</strong></div>`).join('') || '<p>No expense data</p>';
}

function getVisibleTransactions() {
  return getPeriodTransactions().filter(item => {
    const searchMatches = `${item.title} ${item.category}`.toLowerCase().includes(state.search.toLowerCase());
    return searchMatches && (state.type === 'all' || item.type === state.type);
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function renderTransactions() {
  const filtered = getVisibleTransactions();
  const pageCount = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, pageCount);
  const pageItems = filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  $('#transactionRows').innerHTML = pageItems.map(item => `<tr>
    <td><div class="transaction-name"><span class="transaction-icon ${item.iconClass}">${item.icon}</span><span>${item.title}</span></div></td>
    <td><span class="category-tag">${item.category}</span></td><td>${dateLabel(item.date)}</td>
    <td><span class="type-label ${item.type}">${item.type === 'income' ? 'Income' : 'Expense'}</span></td>
    <td class="amount-cell ${item.type}">${item.type === 'income' ? '+' : '−'}${amountText(item.amount)}</td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:28px">No transactions found for this filter.</td></tr>';
  $('#transactionCountLabel').textContent = `Showing ${pageItems.length} of ${filtered.length} transactions`;
  $('#pageLabel').textContent = `${state.page} / ${pageCount}`;
  $('#previousPage').disabled = state.page <= 1;
  $('#nextPage').disabled = state.page >= pageCount;
}

function renderAll() {
  const list = getPeriodTransactions();
  renderSummary(list);
  renderTransactions();
  $$('.period-button').forEach(button => button.classList.toggle('selected', button.dataset.period === state.period));
  $('#dateSelect').disabled = state.period === 'all';
}

function csvEscape(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function downloadCsv() {
  if (!IS_PREMIUM_USER) { showToast('CSV report downloads are available with Premium.'); return; }
  const list = getVisibleTransactions();
  const rows = [['Transaction', 'Category', 'Date', 'Type', 'Amount'], ...list.map(item => [item.title, item.category, item.date, item.type, item.amount.toFixed(2)])];
  const csv = '\uFEFF' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `finora-report-${state.period}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  showToast('Your CSV report is ready.');
}
let toastTimeout;
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2800); }

function setupPremiumUi() {
  const button = $('#downloadButton');
  button.disabled = !IS_PREMIUM_USER;
  $('#premiumChip').textContent = IS_PREMIUM_USER ? 'PRO' : 'LOCKED';
  $('#premiumNote').classList.toggle('hidden', IS_PREMIUM_USER);
  $('#upgradeButton').addEventListener('click', () => showToast('Premium checkout will be connected in a future task.'));
}

$$('.period-button').forEach(button => button.addEventListener('click', () => { state.period = button.dataset.period; state.page = 1; renderAll(); }));
$('#dateSelect').addEventListener('change', event => { state.selectedMonth = event.target.value; state.page = 1; renderAll(); });
$('#searchInput').addEventListener('input', event => { state.search = event.target.value; state.page = 1; renderTransactions(); });
$('#typeFilter').addEventListener('change', event => { state.type = event.target.value; state.page = 1; renderTransactions(); });
$('#previousPage').addEventListener('click', () => { state.page--; renderTransactions(); });
$('#nextPage').addEventListener('click', () => { state.page++; renderTransactions(); });
$('#downloadButton').addEventListener('click', downloadCsv);
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#todayLabel').textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
setupPremiumUi();
renderAll();
