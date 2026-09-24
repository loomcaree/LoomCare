// Google Apps Script — LoomCare Waitlist Webhook
// Deploy as Web App: Execute as Me, Who has access: Anyone
// Spreadsheet ID is hardcoded below (standalone script, not bound to sheet).

var SPREADSHEET_ID = '11RIEMwsQS-OVAK-vcwvdTG1WBiGGLaXPDAmlfG942p0';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', ok: true, service: 'loom-care-waitlist' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot — bots fill this hidden field, real users don't
    if (data.website) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Basic validation
    if (!data.name || !data.email || data.consent !== 'yes') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', ok: false, code: 'INVALID_INPUT' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Open spreadsheet by ID (works in standalone web app — getActiveSpreadsheet() does NOT)
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'City', 'Time Alone', 'Marketing', 'Request ID', 'Consent']);
      sheet.setFrozenRows(1);
    }

    // Duplicate email check
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var emails = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === data.email.toLowerCase()) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', ok: true, duplicate: true, requestId: data.requestId || '' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Append new row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.city || '',
      data.timeAlone || '',
      data.marketingConsent || 'no',
      data.requestId || '',
      'yes'
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', ok: true, requestId: data.requestId || '' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', ok: false, code: 'UNAVAILABLE', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
