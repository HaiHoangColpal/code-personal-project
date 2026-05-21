// ===================================================================
// Google Apps Script - Backend cho Expense Manager
// Deploy: Deploy > New deployment > Web app
// ===================================================================

const SPREADSHEET_ID = ''; // <-- Dán ID Google Sheet của bạn vào đây (lấy từ URL: docs.google.com/spreadsheets/d/{ID}/edit)

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ── Khởi tạo Sheet ─────────────────────────────────────────────────

function initSheets() {
  var ss = getSpreadsheet();
  
  // Sheet Transactions
  var txSheet = ss.getSheetByName('Transactions');
  if (!txSheet) {
    txSheet = ss.insertSheet('Transactions');
    txSheet.appendRow(['ID', 'Date', 'Amount', 'Category', 'Description', 'Type', 'CreatedAt', 'Jar']);
    txSheet.getRange('1:1').setFontWeight('bold');
  }
  
  // Sheet Categories
  var catSheet = ss.getSheetByName('Categories');
  if (!catSheet) {
    catSheet = ss.insertSheet('Categories');
    catSheet.appendRow(['ID', 'Name', 'Type', 'Icon', 'Color']);
    catSheet.getRange('1:1').setFontWeight('bold');
    
    var defaults = [
      ['c1', 'Ăn uống', 'expense', 'UtensilsCrossed', '#f43f5e'],
      ['c2', 'Di chuyển', 'expense', 'Car', '#f97316'],
      ['c3', 'Mua sắm', 'expense', 'ShoppingBag', '#a855f7'],
      ['c4', 'Hóa đơn & Tiện ích', 'expense', 'Zap', '#eab308'],
      ['c5', 'Giải trí', 'expense', 'Gamepad2', '#ec4899'],
      ['c6', 'Sức khỏe', 'expense', 'Stethoscope', '#14b8a6'],
      ['c7', 'Giáo dục', 'expense', 'GraduationCap', '#6366f1'],
      ['c8', 'Nhà cửa', 'expense', 'Home', '#06b6d4'],
      ['c9', 'Con cái', 'expense', 'Baby', '#3b82f6'],
      ['c10', 'Thời trang', 'expense', 'Shirt', '#8b5cf6'],
      ['c11', 'Cafe & Đồ uống', 'expense', 'Coffee', '#78716c'],
      ['c12', 'Khác', 'expense', 'CircleDot', '#64748b'],
      ['c13', 'Lương', 'income', 'Banknote', '#10b981'],
      ['c14', 'Thưởng', 'income', 'Award', '#06b6d4'],
      ['c15', 'Đầu tư', 'income', 'TrendingUp', '#8b5cf6'],
      ['c16', 'Kinh doanh', 'income', 'Briefcase', '#f97316'],
      ['c17', 'Thu nhập khác', 'income', 'HandCoins', '#64748b'],
    ];
    defaults.forEach(function(row) { catSheet.appendRow(row); });
  }
  
  // Sheet Budgets
  var budgetSheet = ss.getSheetByName('Budgets');
  if (!budgetSheet) {
    budgetSheet = ss.insertSheet('Budgets');
    budgetSheet.appendRow(['ID', 'CategoryId', 'Amount', 'Month', 'Year']);
    budgetSheet.getRange('1:1').setFontWeight('bold');
  }

  // Sheet Recurring (Khoản cố định hàng tháng)
  var recurSheet = ss.getSheetByName('Recurring');
  if (!recurSheet) {
    recurSheet = ss.insertSheet('Recurring');
    recurSheet.appendRow(['ID', 'Name', 'Type', 'CategoryId', 'Description', 'DefaultAmount', 'FixedAmount']);
    recurSheet.getRange('1:1').setFontWeight('bold');
  }

  // Sheet JARS_Monthly (Tổng hợp 6 chiếc lọ mỗi tháng)
  var jarsSheet = ss.getSheetByName('JARS_Monthly');
  if (!jarsSheet) {
    jarsSheet = ss.insertSheet('JARS_Monthly');
    jarsSheet.appendRow([
      'Month', 'Year', 'TotalIncome', 'TotalExpense',
      'NEC_Budget', 'NEC_Spent', 'NEC_Pct',
      'FFA_Budget', 'FFA_Spent', 'FFA_Pct',
      'LTSS_Budget', 'LTSS_Spent', 'LTSS_Pct',
      'EDU_Budget', 'EDU_Spent', 'EDU_Pct',
      'PLAY_Budget', 'PLAY_Spent', 'PLAY_Pct',
      'GIVE_Budget', 'GIVE_Spent', 'GIVE_Pct',
      'SavedAt', 'Notes'
    ]);
    jarsSheet.getRange('1:1').setFontWeight('bold').setBackground('#1e3a5f').setFontColor('#ffffff');
  }
}

// ── Migration: thêm cột Jar cho Sheet Transactions đã tồn tại ──────

function migrateAddJarColumn_() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  if (!sheet) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var jarColIdx = headers.indexOf('Jar');

  // Nếu chưa có cột Jar → thêm header và back-fill
  if (jarColIdx === -1) {
    var jarCol = headers.length + 1;
    sheet.getRange(1, jarCol).setValue('Jar').setFontWeight('bold');

    // Back-fill jar cho tất cả giao dịch cũ
    var cats = getAllCategories_(ss);
    var catNameMap = {};
    cats.forEach(function(c) { catNameMap[c.id] = c.name; });

    var data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      var catColIdx = headers.indexOf('Category');
      var descColIdx = headers.indexOf('Description');
      var typeColIdx = headers.indexOf('Type');

      for (var i = 1; i < data.length; i++) {
        var txType = toStr_(data[i][typeColIdx]);
        if (txType === 'expense') {
          var catId = toStr_(data[i][catColIdx]);
          var desc = toStr_(data[i][descColIdx]);
          var catName = catNameMap[catId] || '';
          var jar = mapToJar_(catName, desc);
          sheet.getRange(i + 1, jarCol).setValue(jar);
        }
      }
    }
  }
}

// ── Serve HTML ──────────────────────────────────────────────────────

function doGet() {
  initSheets();
  migrateAddJarColumn_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Quản lý Chi tiêu')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ── Helper ──────────────────────────────────────────────────────────

function generateId() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 12);
}

// Convert any value to YYYY-MM-DD string (handles Date objects from Sheets)
function formatDate_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, '0');
    var d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val);
}

// Convert any value to string safely
function toStr_(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// Read all transactions from sheet as raw objects (no spreadsheet re-open)
// This is the single-read function used by all aggregation functions.
function getAllTransactionsRaw_(ss) {
  var sheet = ss.getSheetByName('Transactions');
  if (!sheet) return [];
  return sheetToObjects(sheet);
}

// Read all categories from sheet as normalized objects
function getAllCategories_(ss) {
  var sheet = ss.getSheetByName('Categories');
  if (!sheet) return [];
  return sheetToObjects(sheet).map(function(row) {
    return {
      id: toStr_(row.ID),
      name: toStr_(row.Name),
      type: toStr_(row.Type),
      icon: toStr_(row.Icon),
      color: toStr_(row.Color),
    };
  });
}

// Normalize raw transaction row → clean object with string dates
function normalizeTx_(row, catMap) {
  var catId = toStr_(row.Category);
  var catName = catMap[catId] || '';
  var desc = toStr_(row.Description);
  var txType = toStr_(row.Type);
  // Jar: nếu sheet đã có thì dùng, chưa có thì tính lại (backward compatible)
  var jar = toStr_(row.Jar);
  if (!jar && txType === 'expense') {
    jar = mapToJar_(catName, desc);
  }
  return {
    id: toStr_(row.ID),
    date: formatDate_(row.Date),
    amount: Number(row.Amount) || 0,
    category: catId,
    categoryName: catName,
    description: desc,
    type: txType,
    createdAt: toStr_(row.CreatedAt),
    jar: jar,
  };
}

// ── JARS Smart Mapper (mirror logic từ JarsAnalysis.tsx) ─────────────
// Logic tài chính:
//   Tiền lãi vay = CHI PHÍ thực sự → NEC
//   Tiền gốc vay = XÂY DỰNG TÀI SẢN → LTSS
//   Đầu tư, chứng khoán = TẠO THU NHẬP THỤ ĐỘNG → FFA

function mapToJar_(categoryName, description) {
  var text = ((categoryName || '') + ' ' + (description || '')).toLowerCase();

  // Lọ CHO ĐI (5%)
  if (text.match(/(từ thiện|cho đi|quà|tặng|lì xì|biếu|hỗ trợ)/)) return 'GIVE';
  // Lọ GIÁO DỤC (10%)
  if (text.match(/(học|sách|khóa học|giáo dục|training|lộ phí|tiền học|học phí)/)) return 'EDU';
  // Lọ TỰ DO TÀI CHÍNH (10%)
  if (text.match(/(đầu tư|ổ phiếu|coin|crypto|kinh doanh|chứng khoán|cổ phần|quỹ đầu tư|etf|real estate)/)) return 'FFA';
  // Lọ TIẾT KIỆM DÀI HẠN (10%) — tiền GỐC trả ngân hàng = equity
  if (text.match(/(tiết kiệm|bảo hiểm|dự phòng|quỹ khẩn cấp|tiền gốc|trả gốc|gốc vay|gốc ngân hàng|trả nợ gốc|gốc nhà|gốc xe)/)) return 'LTSS';
  // Lọ HƯỞNG THỤ (10%)
  if (text.match(/(giải trí|xem phim|game|du lịch|resort|spa|mua sắm|quần áo|thời trang|làm đẹp|cắt tóc|nhà hàng|café sang|chơi|nhậu)/)) return 'PLAY';
  // Mặc định: THIẾT YẾU (55%)
  return 'NEC';
}

// Tự động cập nhật JARS_Monthly sau mỗi thay đổi giao dịch
function autoUpdateJarsMonthly_(ss, month, year) {
  var cats = getAllCategories_(ss);
  var catNameMap = {};
  cats.forEach(function(c) { catNameMap[c.id] = c.name; });

  var rawTxs = getAllTransactionsRaw_(ss);
  var txs = rawTxs.map(function(row) { return normalizeTx_(row, catNameMap); });

  var monthTxs = txs.filter(function(t) {
    if (!t.date) return false;
    var parts = t.date.split('-');
    return parseInt(parts[1], 10) === month && parseInt(parts[0], 10) === year;
  });

  var totalIncome = 0, totalExpense = 0;
  var jarSpent = { NEC: 0, FFA: 0, LTSS: 0, EDU: 0, PLAY: 0, GIVE: 0 };

  monthTxs.forEach(function(t) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
      var jarId = mapToJar_(t.categoryName || '', t.description || '');
      if (jarSpent[jarId] !== undefined) {
        jarSpent[jarId] += t.amount;
      }
    }
  });

  // Budget theo % JARS
  var JARS_PCT = { NEC: 0.55, FFA: 0.10, LTSS: 0.10, EDU: 0.10, PLAY: 0.10, GIVE: 0.05 };
  var jarIds = ['NEC', 'FFA', 'LTSS', 'EDU', 'PLAY', 'GIVE'];

  var sheet = ss.getSheetByName('JARS_Monthly');
  if (!sheet) { initSheets(); sheet = ss.getSheetByName('JARS_Monthly'); }

  // Xóa dòng cũ
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (Number(rows[i][0]) === month && Number(rows[i][1]) === year) {
      sheet.deleteRow(i + 1);
    }
  }

  var pct = function(spent, budget) {
    return budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  };

  // Tạo advice notes cho từng lọ (mirror logic từ JarsAnalysis.tsx)
  var JARS_NAMES = { NEC: 'Thiết yếu (55%)', FFA: 'Tự do Tài chính (10%)', LTSS: 'Tiết kiệm Dài hạn (10%)', EDU: 'Giáo dục (10%)', PLAY: 'Hưởng thụ (10%)', GIVE: 'Cho đi (5%)' };

  var formatVND = function(n) {
    return n.toLocaleString('vi-VN') + ' đ';
  };

  var rowData = [month, year, totalIncome, totalExpense];
  var notes = [];
  jarIds.forEach(function(id) {
    var budget = totalIncome * JARS_PCT[id];
    var spent = jarSpent[id];
    var p = pct(spent, budget);
    rowData.push(budget, spent, p);

    // Generate advice note
    var ratio = budget === 0 ? 0 : spent / budget;
    var advice = '';
    if (totalIncome === 0) {
      advice = JARS_NAMES[id] + ': Chưa có thu nhập để phân bổ.';
    } else if (ratio > 1) {
      advice = JARS_NAMES[id] + ': Vượt ngân sách ' + formatVND(spent - budget) + '. Cần cắt giảm!';
    } else if (ratio >= 0.8) {
      advice = JARS_NAMES[id] + ': Sắp chạm ngưỡng (' + p + '%). Cẩn thận khi chi tiêu thêm.';
    } else if (id !== 'NEC' && ratio < 0.2 && ratio > 0) {
      advice = JARS_NAMES[id] + ': Mới dùng ' + p + '%. Có thể trích thêm vào quỹ này.';
    } else if (spent > 0) {
      advice = JARS_NAMES[id] + ': Trong tầm kiểm soát. Còn dư ' + formatVND(budget - spent) + '.';
    } else {
      advice = JARS_NAMES[id] + ': Chưa có chi tiêu.';
    }
    notes.push(advice);
  });
  rowData.push(new Date().toISOString());
  rowData.push(notes.join(' | '));

  sheet.appendRow(rowData);
}

// ── Transactions CRUD ───────────────────────────────────────────────

function getTransactions(params) {
  var ss = getSpreadsheet();
  var rawTxs = getAllTransactionsRaw_(ss);
  var cats = getAllCategories_(ss);
  var catMap = {};
  cats.forEach(function(c) { catMap[c.id] = c.name; });

  var txs = rawTxs.map(function(row) { return normalizeTx_(row, catMap); });

  if (params && params.month && params.year) {
    txs = txs.filter(function(t) {
      if (!t.date) return false;
      var parts = t.date.split('-');
      var m = parseInt(parts[1], 10);
      var y = parseInt(parts[0], 10);
      return m === params.month && y === params.year;
    });
  }

  txs.sort(function(a, b) { return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0; });
  return txs;
}

function addTransaction(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var id = generateId();
  var now = new Date().toISOString();

  var cats = getAllCategories_(ss);
  var cat = null;
  for (var i = 0; i < cats.length; i++) {
    if (cats[i].id === data.category) { cat = cats[i]; break; }
  }

  // Tự động phân loại vào chiếc lọ tương ứng
  var jar = '';
  if (data.type === 'expense') {
    jar = mapToJar_(cat ? cat.name : '', data.description || '');
  }

  sheet.appendRow([id, data.date, data.amount, data.category, data.description, data.type, now, jar]);

  // Auto-update JARS_Monthly
  var dateParts = String(data.date).split('-');
  if (dateParts.length >= 2) {
    try { autoUpdateJarsMonthly_(ss, parseInt(dateParts[1], 10), parseInt(dateParts[0], 10)); } catch(e) { Logger.log('JARS update error: ' + e); }
  }

  return {
    id: id,
    date: String(data.date),
    amount: Number(data.amount),
    category: String(data.category),
    categoryName: cat ? cat.name : '',
    description: String(data.description),
    type: String(data.type),
    createdAt: now,
    jar: jar,
  };
}

function updateTransaction(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var rows = sheet.getDataRange().getValues();

  var cats = getAllCategories_(ss);
  var cat = null;
  for (var c = 0; c < cats.length; c++) {
    if (cats[c].id === data.category) { cat = cats[c]; break; }
  }

  var jar = '';
  if (data.type === 'expense') {
    jar = mapToJar_(cat ? cat.name : '', data.description || '');
  }

  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(data.id)) {
      // Cột B-F (Date, Amount, Category, Description, Type) + cột H (Jar)
      sheet.getRange(i + 1, 2, 1, 5).setValues([[data.date, data.amount, data.category, data.description, data.type]]);
      // Cập nhật cột Jar (cột 8)
      sheet.getRange(i + 1, 8).setValue(jar);
      break;
    }
  }

  // Auto-update JARS_Monthly
  var dateParts = String(data.date).split('-');
  if (dateParts.length >= 2) {
    try { autoUpdateJarsMonthly_(ss, parseInt(dateParts[1], 10), parseInt(dateParts[0], 10)); } catch(e) { Logger.log('JARS update error: ' + e); }
  }

  return data;
}

function deleteTransaction(id) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var rows = sheet.getDataRange().getValues();

  var txDate = null;
  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(id)) {
      txDate = formatDate_(rows[i][1]);
      sheet.deleteRow(i + 1);
      break;
    }
  }

  // Auto-update JARS_Monthly
  if (txDate) {
    var dateParts = txDate.split('-');
    if (dateParts.length >= 2) {
      try { autoUpdateJarsMonthly_(ss, parseInt(dateParts[1], 10), parseInt(dateParts[0], 10)); } catch(e) { Logger.log('JARS update error: ' + e); }
    }
  }

  return { success: true };
}

// ── Categories CRUD ─────────────────────────────────────────────────

function getCategories() {
  var ss = getSpreadsheet();
  return getAllCategories_(ss);
}

function addCategory(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Categories');
  var id = generateId();
  sheet.appendRow([id, data.name, data.type, data.icon, data.color]);
  return { id: id, name: data.name, type: data.type, icon: data.icon, color: data.color };
}

function updateCategory(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Categories');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(data.id)) {
      sheet.getRange(i + 1, 2, 1, 4).setValues([[data.name, data.type, data.icon, data.color]]);
      break;
    }
  }

  return data;
}

function deleteCategory(id) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Categories');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return { success: true };
}

// ── Dashboard (optimized: reads sheets only once) ───────────────────

function getDashboardData(params) {
  var now = new Date();
  var month = (params && params.month) || (now.getMonth() + 1);
  var year = (params && params.year) || now.getFullYear();

  var ss = getSpreadsheet();
  var cats = getAllCategories_(ss);
  var catMap = {};
  cats.forEach(function(c) { catMap[c.id] = c; });
  var catNameMap = {};
  cats.forEach(function(c) { catNameMap[c.id] = c.name; });

  var rawTxs = getAllTransactionsRaw_(ss);
  var txs = rawTxs.map(function(row) { return normalizeTx_(row, catNameMap); });

  // Filter to current month
  var monthTxs = txs.filter(function(t) {
    if (!t.date) return false;
    var parts = t.date.split('-');
    return parseInt(parts[1], 10) === month && parseInt(parts[0], 10) === year;
  });

  monthTxs.sort(function(a, b) { return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0; });

  var totalIncome = 0, totalExpense = 0;
  var catAgg = {};
  var dailyMap = {};

  monthTxs.forEach(function(t) {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') {
      totalExpense += t.amount;
      if (!catAgg[t.category]) {
        var cat = catMap[t.category];
        catAgg[t.category] = { name: cat ? cat.name : 'Khác', value: 0, color: cat ? cat.color : '#64748b' };
      }
      catAgg[t.category].value += t.amount;
    }
    // Daily aggregation
    var dayKey = t.date; // YYYY-MM-DD
    if (!dailyMap[dayKey]) dailyMap[dayKey] = { income: 0, expense: 0 };
    if (t.type === 'income') dailyMap[dayKey].income += t.amount;
    if (t.type === 'expense') dailyMap[dayKey].expense += t.amount;
  });

  var daysInMonth = new Date(year, month, 0).getDate();
  var dailyTrend = [];
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var dayData = dailyMap[dateStr] || { income: 0, expense: 0 };
    dailyTrend.push({
      date: String(d).padStart(2, '0'),
      income: dayData.income,
      expense: dayData.expense,
    });
  }

  return {
    totalIncome: totalIncome,
    totalExpense: totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions: monthTxs.slice(0, 5),
    expenseByCategory: Object.values(catAgg),
    dailyTrend: dailyTrend,
  };
}

// ── Reports (optimized: reads sheets only ONCE for all 6 months) ────

function getReportData(params) {
  var now = new Date();

  var ss = getSpreadsheet();
  var cats = getAllCategories_(ss);
  var catMap = {};
  cats.forEach(function(c) { catMap[c.id] = c; });
  var catNameMap = {};
  cats.forEach(function(c) { catNameMap[c.id] = c.name; });

  // Read ALL transactions once
  var rawTxs = getAllTransactionsRaw_(ss);
  var allTxs = rawTxs.map(function(row) { return normalizeTx_(row, catNameMap); });

  // Build month boundaries for last 6 months
  var months = [];
  for (var m = 5; m >= 0; m--) {
    var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear(), label: 'T' + (d.getMonth() + 1) });
  }

  // Aggregate per month
  var monthlyTrend = months.map(function(mo) {
    var income = 0, expense = 0;
    allTxs.forEach(function(t) {
      if (!t.date) return;
      var parts = t.date.split('-');
      var ty = parseInt(parts[0], 10);
      var tm = parseInt(parts[1], 10);
      if (tm === mo.month && ty === mo.year) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
    });
    return { month: mo.label, income: income, expense: expense };
  });

  // Get min date for 6-month window
  var sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Filter to last 6 months
  var recentTxs = allTxs.filter(function(t) {
    if (!t.date) return false;
    var td = new Date(t.date);
    return td >= sixMonthsAgo;
  });

  // Category aggregation
  var expCatAgg = {};
  var incCatAgg = {};
  recentTxs.forEach(function(t) {
    var cat = catMap[t.category];
    if (t.type === 'expense') {
      if (!expCatAgg[t.category]) expCatAgg[t.category] = { name: cat ? cat.name : 'Khác', value: 0, color: cat ? cat.color : '#64748b' };
      expCatAgg[t.category].value += t.amount;
    } else if (t.type === 'income') {
      if (!incCatAgg[t.category]) incCatAgg[t.category] = { name: cat ? cat.name : 'Khác', value: 0, color: cat ? cat.color : '#64748b' };
      incCatAgg[t.category].value += t.amount;
    }
  });

  var topExpenses = recentTxs
    .filter(function(t) { return t.type === 'expense'; })
    .sort(function(a, b) { return b.amount - a.amount; })
    .slice(0, 10);

  return {
    monthlyTrend: monthlyTrend,
    expenseByCategory: Object.values(expCatAgg),
    incomeByCategory: Object.values(incCatAgg),
    topExpenses: topExpenses,
  };
}

// ── Budgets ─────────────────────────────────────────────────────────

function getBudgets(params) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Budgets');
  if (!sheet) return [];

  var now = new Date();
  var month = (params && params.month) || (now.getMonth() + 1);
  var year = (params && params.year) || now.getFullYear();

  var cats = getAllCategories_(ss);
  var catMap = {};
  cats.forEach(function(c) { catMap[c.id] = c; });
  var catNameMap = {};
  cats.forEach(function(c) { catNameMap[c.id] = c.name; });

  // Read transactions once for spent calculation
  var rawTxs = getAllTransactionsRaw_(ss);
  var txs = rawTxs.map(function(row) { return normalizeTx_(row, catNameMap); });
  var monthTxs = txs.filter(function(t) {
    if (!t.date) return false;
    var parts = t.date.split('-');
    return parseInt(parts[1], 10) === month && parseInt(parts[0], 10) === year && t.type === 'expense';
  });

  var budgets = sheetToObjects(sheet).map(function(row) {
    return {
      id: toStr_(row.ID),
      categoryId: toStr_(row.CategoryId),
      amount: Number(row.Amount) || 0,
      month: Number(row.Month),
      year: Number(row.Year),
    };
  });

  budgets = budgets.filter(function(b) { return b.month === month && b.year === year; });

  return budgets.map(function(b) {
    var cat = catMap[b.categoryId];
    var spent = 0;
    monthTxs.forEach(function(t) {
      if (t.category === b.categoryId) spent += t.amount;
    });
    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: cat ? cat.name : '',
      amount: b.amount,
      spent: spent,
      month: b.month,
      year: b.year,
    };
  });
}

function saveBudget(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Budgets');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][1]) === String(data.categoryId) && Number(rows[i][3]) === data.month && Number(rows[i][4]) === data.year) {
      sheet.getRange(i + 1, 3).setValue(data.amount);
      return { success: true };
    }
  }

  var id = generateId();
  sheet.appendRow([id, data.categoryId, data.amount, data.month, data.year]);
  return { success: true };
}

// ── Recurring Templates (Khoản cố định hàng tháng) ──────────────────

function getRecurringTemplates() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Recurring');
  if (!sheet) return [];
  return sheetToObjects(sheet).map(function(row) {
    return {
      id: toStr_(row.ID),
      name: toStr_(row.Name),
      type: toStr_(row.Type),
      categoryId: toStr_(row.CategoryId),
      description: toStr_(row.Description),
      defaultAmount: Number(row.DefaultAmount) || 0,
      fixedAmount: row.FixedAmount === true || row.FixedAmount === 'true' || row.FixedAmount === 'TRUE',
    };
  });
}

function saveRecurringTemplate(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Recurring');
  if (!sheet) return { success: false };
  var rows = sheet.getDataRange().getValues();

  // Update nếu đã tồn tại
  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(data.id)) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[
        data.name, data.type, data.categoryId,
        data.description, data.defaultAmount, data.fixedAmount
      ]]);
      return { success: true };
    }
  }

  // Thêm mới
  var id = data.id || generateId();
  sheet.appendRow([id, data.name, data.type, data.categoryId, data.description, data.defaultAmount, data.fixedAmount]);
  return { success: true, id: id };
}

function deleteRecurringTemplate(id) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Recurring');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (toStr_(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

// ── JARS Monthly Snapshot ────────────────────────────────────────────
// Hàm này được gọi từ frontend khi người dùng bấm "Lưu JARS tháng này"

function saveJarsSnapshot(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('JARS_Monthly');
  if (!sheet) {
    initSheets();
    sheet = ss.getSheetByName('JARS_Monthly');
  }
  var rows = sheet.getDataRange().getValues();

  // Xóa dòng cũ cùng tháng/năm nếu có (overwrite)
  for (var i = rows.length - 1; i >= 1; i--) {
    if (Number(rows[i][0]) === data.month && Number(rows[i][1]) === data.year) {
      sheet.deleteRow(i + 1);
    }
  }

  var now = new Date().toISOString();
  var jars = data.jars; // mảng 6 phần tử: { id, budget, spent }
  var jarMap = {};
  jars.forEach(function(j) { jarMap[j.id] = j; });

  var pct = function(spent, budget) {
    return budget > 0 ? Math.round((spent / budget) * 1000) / 10 : 0;
  };

  var nec  = jarMap['NEC']  || { budget: 0, spent: 0 };
  var ffa  = jarMap['FFA']  || { budget: 0, spent: 0 };
  var ltss = jarMap['LTSS'] || { budget: 0, spent: 0 };
  var edu  = jarMap['EDU']  || { budget: 0, spent: 0 };
  var play = jarMap['PLAY'] || { budget: 0, spent: 0 };
  var give = jarMap['GIVE'] || { budget: 0, spent: 0 };

  sheet.appendRow([
    data.month, data.year, data.totalIncome, data.totalExpense,
    nec.budget,  nec.spent,  pct(nec.spent,  nec.budget),
    ffa.budget,  ffa.spent,  pct(ffa.spent,  ffa.budget),
    ltss.budget, ltss.spent, pct(ltss.spent, ltss.budget),
    edu.budget,  edu.spent,  pct(edu.spent,  edu.budget),
    play.budget, play.spent, pct(play.spent, play.budget),
    give.budget, give.spent, pct(give.spent, give.budget),
    now
  ]);

  return { success: true };
}
