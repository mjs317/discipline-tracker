/**
 * Protocol — Google Apps Script
 * Serves the PWA: getProgram, getLog, getMetcons, getDayNotes (GET)
 * and logSet, logMetcon, logDayNotes (POST).
 *
 * IMPORTANT: logSet finds/updates by (Week, Day, Date, Exercise, Set #)
 * so multiple cycles (different dates) keep separate rows. Old data is never overwritten.
 */

var SS;

function getSpreadsheet() {
  if (!SS) SS = SpreadsheetApp.getActiveSpreadsheet();
  return SS;
}

// --- Sheet names (change if yours differ) ---
var SHEET_PROGRAM = 'Program';
var SHEET_LOG = 'Log';
var SHEET_METCONS = 'Metcons';
var SHEET_METCON_RESULTS = 'MetconResults';
var SHEET_DAY_NOTES = 'Day Notes';

// --- Helpers: range → array of objects (first row = headers) ---
function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (!data.length) return [];
  var headers = data[0].map(function(h) { return h && String(h).trim(); });
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) row[headers[j]] = data[i][j];
    }
    out.push(row);
  }
  return out;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  var result = [];
  var book = getSpreadsheet();

  try {
    if (action === 'getProgram') {
      result = sheetToObjects(book.getSheetByName(SHEET_PROGRAM));
    } else if (action === 'getLog') {
      result = sheetToObjects(book.getSheetByName(SHEET_LOG));
    } else if (action === 'getMetcons') {
      result = sheetToObjects(book.getSheetByName(SHEET_METCONS));
    } else if (action === 'getDayNotes') {
      result = sheetToObjects(book.getSheetByName(SHEET_DAY_NOTES));
    } else {
      return jsonResponse({ error: 'Unknown action: ' + action }, 400);
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: String(err.message) }, 500);
  }
}

function doPost(e) {
  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
  var data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }
  var action = data.action;
  if (!action) return jsonResponse({ error: 'Missing action' }, 400);

  var book = getSpreadsheet();

  try {
    if (action === 'logSet') {
      handleLogSet(book, data);
    } else if (action === 'logMetcon') {
      handleLogMetcon(book, data);
    } else if (action === 'logDayNotes') {
      handleLogDayNotes(book, data);
    } else {
      return jsonResponse({ error: 'Unknown action: ' + action }, 400);
    }
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: String(err.message) }, 500);
  }
}

/**
 * Find row in Log by (Week, Day, Date, Exercise, Set #). Update that row or append.
 * This keeps old and new cycle data: same Week/Day/Exercise/Set but different Date = different row.
 */
function handleLogSet(book, data) {
  var sheet = book.getSheetByName(SHEET_LOG);
  if (!sheet) throw new Error('Sheet "' + SHEET_LOG + '" not found');

  var week = data.week;
  var day = data.day;
  var date = data.date || '';
  var exercise = data.exercise || '';
  var setNum = data.setNum;
  var weight = data.weight;
  var reps = data.reps;

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  if (!values.length) {
    // No header yet: write header and first row
    var headers = ['Week', 'Day', 'Date', 'Exercise', 'Set #', 'Actual Weight', 'Actual Reps'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.appendRow([week, day, date, exercise, setNum, weight, reps]);
    return;
  }

  var headers = values[0];
  var weekCol = headers.indexOf('Week') + 1;
  var dayCol = headers.indexOf('Day') + 1;
  var dateCol = headers.indexOf('Date') + 1;
  var exCol = headers.indexOf('Exercise') + 1;
  var setCol = headers.indexOf('Set #') + 1;
  var weightCol = headers.indexOf('Actual Weight') + 1;
  var repsCol = headers.indexOf('Actual Reps') + 1;

  if (weekCol < 1 || dayCol < 1 || exCol < 1 || setCol < 1 || weightCol < 1 || repsCol < 1) {
    throw new Error('Log sheet must have columns: Week, Day, Date, Exercise, Set #, Actual Weight, Actual Reps');
  }

  // Normalize date for comparison (YYYY-MM-DD string)
  var dateStr = date ? String(date).slice(0, 10) : '';

  var foundRow = -1;
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var rWeek = row[weekCol - 1];
    var rDay = row[dayCol - 1];
    var rDate = row[dateCol - 1] ? String(row[dateCol - 1]).slice(0, 10) : '';
    var rEx = row[exCol - 1];
    var rSet = row[setCol - 1];
    if (rWeek == week && rDay == day && rDate === dateStr && String(rEx) === String(exercise) && rSet == setNum) {
      foundRow = r + 1; // 1-based row index
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, weightCol).setValue(weight);
    sheet.getRange(foundRow, repsCol).setValue(reps);
    if (dateCol > 0) sheet.getRange(foundRow, dateCol).setValue(dateStr || date);
  } else {
    sheet.appendRow([week, day, dateStr || date, exercise, setNum, weight, reps]);
  }
}

function handleLogMetcon(book, data) {
  var sheet = book.getSheetByName(SHEET_METCON_RESULTS);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_METCON_RESULTS);
    sheet.appendRow(['Week', 'Day', 'Date', 'Time', 'Score', 'Notes']);
  }
  var headers = sheet.getRange(1, 1, 1, 6).getValues()[0];
  if (!headers || !headers[0]) {
    sheet.getRange(1, 1, 1, 6).setValues([['Week', 'Day', 'Date', 'Time', 'Score', 'Notes']]);
  }
  sheet.appendRow([
    data.week != null ? data.week : '',
    data.day != null ? data.day : '',
    data.date || '',
    data.time != null ? data.time : '',
    data.score != null ? data.score : '',
    data.notes || ''
  ]);
}

function handleLogDayNotes(book, data) {
  var sheet = book.getSheetByName(SHEET_DAY_NOTES);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_DAY_NOTES);
    sheet.appendRow(['Week', 'Day', 'Date', 'Notes']);
  }
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0] || [];
  var weekCol = headers.indexOf('Week') + 1;
  var dayCol = headers.indexOf('Day') + 1;
  var dateCol = headers.indexOf('Date') + 1;
  var notesCol = headers.indexOf('Notes') + 1;
  if (weekCol < 1 || dayCol < 1 || notesCol < 1) {
    if (!values.length) {
      sheet.getRange(1, 1, 1, 4).setValues([['Week', 'Day', 'Date', 'Notes']]);
      weekCol = 1; dayCol = 2; dateCol = 3; notesCol = 4;
    } else {
      throw new Error('Day Notes sheet must have columns: Week, Day, Date, Notes');
    }
  }
  var dateStr = data.date ? String(data.date).slice(0, 10) : '';
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var rWeek = row[weekCol - 1];
    var rDay = row[dayCol - 1];
    var rDate = row[dateCol - 1] ? String(row[dateCol - 1]).slice(0, 10) : '';
    if (rWeek == data.week && rDay == data.day && rDate === dateStr) {
      sheet.getRange(r + 1, notesCol).setValue(data.notes || '');
      return;
    }
  }
  sheet.appendRow([data.week, data.day, dateStr, data.notes || '']);
}

function jsonResponse(obj, status) {
  status = status || 200;
  var output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
