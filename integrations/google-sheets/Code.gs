// Deploy separately in Google Apps Script; never upload this as browser code.
// Set SPREADSHEET_ID and optional FIREBASE_WEB_API_KEY in Script Properties.
// Keep the spreadsheet private. Never log tokens or put them in sheet rows.
var HEADERS = ['Signed up (UTC)', 'Name', 'Email', 'Phone', 'City', 'Time alone', 'Consent', 'Marketing updates', 'Request ID'];
var CONSENT_VERSION = '2026-09-22';
var ACCEPTED_CONSENT = { '2026-09-22': true, '2026-09-03': true };
var MAX_ROWS = 20000;
var ALLOWED_PROVIDERS = { 'google.com': true, password: true };

function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return reply_({ status: 'success', ok: true, service: 'loom-care-waitlist', version: 5, authentication: 'firebase' });
}

function parsePayload_(event) {
  if (!event) return {};
  var p = {};
  if (event.parameter && Object.keys(event.parameter).length > 0) {
    p = event.parameter;
  }
  if (event.postData && event.postData.contents) {
    var raw = String(event.postData.contents).trim();
    if (raw.indexOf('{') === 0) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (var key in parsed) {
            p[key] = parsed[key];
          }
        }
      } catch (_) {
        // Not JSON
      }
    } else if (raw.indexOf('=') !== -1) {
      var pairs = raw.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair[0]) {
          try {
            p[decodeURIComponent(pair[0])] = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
          } catch (_) {
            p[pair[0]] = pair[1] || '';
          }
        }
      }
    }
  }
  return p;
}

function validate_(event) {
  if (!event || (event.contentLength && event.contentLength > 32768)) return null;
  var p = parsePayload_(event);
  var name = String(p.name || '').trim();
  var email = String(p.email || '').trim().toLowerCase();
  var phone = String(p.phone || '').trim();
  var city = String(p.city || '').trim();
  var timeAlone = String(p.timeAlone || '').trim();
  var requestId = String(p.requestId || '');
  var consent = String(p.consent || '').trim();
  var consentVersion = String(p.consentVersion || CONSENT_VERSION).trim();
  var marketingConsent = p.marketingConsent === true || p.marketingConsent === 'yes' ? 'yes' : 'no';

  if (p.website) return null;
  if (consent !== 'yes' || !ACCEPTED_CONSENT[consentVersion]) return null;
  if (!name || name.length > 100 || city.length > 100 || email.length > 254) return null;
  if (phone.length > 40 || timeAlone.length > 30) return null;
  if (/[\x00-\x1f\x7f]/.test(name + city + email + phone + timeAlone)) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (timeAlone && timeAlone !== 'yes' && timeAlone !== 'no') return null;

  return {
    name: name,
    email: email,
    phone: phone,
    city: city,
    timeAlone: timeAlone,
    marketingConsent: marketingConsent,
    requestId: requestId,
    idToken: String(p.idToken || '')
  };
}

function sheetText_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function verifyFirebaseUser_(idToken) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('FIREBASE_WEB_API_KEY');
  if (!apiKey) {
    // If apiKey is not configured, we allow the submission to record
    return { unverified: true };
  }
  var response = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey),
    { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true }
  );
  var status = response.getResponseCode();
  if (status === 400 || status === 401) return null;
  if (status !== 200) throw new Error('Authentication unavailable');
  var result = JSON.parse(response.getContentText());
  var account = result.users && result.users.length === 1 ? result.users[0] : null;
  if (!account || account.disabled) return null;
  var claims;
  try {
    claims = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(idToken.split('.')[1])).getDataAsString());
  } catch (_) { return null; }
  var now = Math.floor(Date.now() / 1000);
  var provider = claims.firebase && claims.firebase.sign_in_provider;
  if (!ALLOWED_PROVIDERS[provider]) return null;
  if (provider === 'google.com' && account.emailVerified !== true) return null;
  if (claims.aud !== 'loom-care' || claims.iss !== 'https://securetoken.google.com/loom-care' ||
      claims.sub !== account.localId || typeof claims.sub !== 'string' || !claims.sub ||
      !Number.isFinite(claims.exp) || claims.exp <= now ||
      !Number.isFinite(claims.iat) || claims.iat > now + 60 ||
      !Number.isFinite(claims.auth_time) || claims.auth_time > now + 60 ||
      claims.auth_time < Number(account.validSince || 0)) return null;
  var email = String(account.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\x00-\x1f\x7f]/.test(email)) return null;
  return { email: email };
}

function getWaitlistSheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var spreadsheet;
  if (id) {
    spreadsheet = SpreadsheetApp.openById(id);
  } else {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!spreadsheet) throw new Error('Missing configuration');
  var sheet = spreadsheet.getSheetByName('Waitlist');
  if (!sheet) sheet = spreadsheet.insertSheet('Waitlist');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setupWaitlist() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getWaitlistSheet_();
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
}

function doPost(event) {
  var values = validate_(event);
  if (!values) return reply_({ status: 'error', ok: false, code: 'INVALID_INPUT' });

  var idToken = values.idToken;
  var apiKey = PropertiesService.getScriptProperties().getProperty('FIREBASE_WEB_API_KEY');
  if (apiKey) {
    if (!idToken || idToken.length > 12000 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(idToken)) {
      return reply_({ status: 'error', ok: false, code: 'AUTH_REQUIRED' });
    }
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply_({ status: 'error', ok: false, code: 'BUSY' });
  try {
    var cache = CacheService.getScriptCache();
    var rateKey = 'minute-' + Math.floor(Date.now() / 60000);
    var attempts = Number(cache.get(rateKey) || '0');
    if (attempts >= 60) return reply_({ status: 'error', ok: false, code: 'BUSY' });
    cache.put(rateKey, String(attempts + 1), 70);

    if (apiKey) {
      var identity = verifyFirebaseUser_(idToken);
      if (!identity || (identity.email && identity.email !== values.email)) {
        return reply_({ status: 'error', ok: false, code: 'AUTH_REQUIRED' });
      }
      if (identity.email) values.email = identity.email;
    }

    var sheet = getWaitlistSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow > MAX_ROWS) return reply_({ status: 'error', ok: false, code: 'BUSY' });

    var lastCol = sheet.getLastColumn ? sheet.getLastColumn() : 1;
    var headerRow = sheet.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];
    if (lastRow > 0 && (!headerRow || String(headerRow[0] || '').indexOf('Signed up') !== 0)) {
      return reply_({ status: 'error', ok: false, code: 'UNAVAILABLE' });
    }

    var emails = lastRow > 1 ? sheet.getRange(2, 3, lastRow - 1, 1).getValues() : [];
    var duplicate = emails.some(function(row) {
      var saved = String(row[0]).toLowerCase();
      return saved === values.email || saved === sheetText_(values.email);
    });

    if (!duplicate) {
      sheet.appendRow([
        new Date().toISOString(),
        sheetText_(values.name),
        sheetText_(values.email),
        sheetText_(values.phone),
        sheetText_(values.city),
        sheetText_(values.timeAlone),
        'yes',
        values.marketingConsent,
        values.requestId
      ]);
      SpreadsheetApp.flush();
    }
    return reply_({ status: 'success', ok: true, requestId: values.requestId, duplicate: duplicate });
  } catch (_) {
    return reply_({ status: 'error', ok: false, code: 'UNAVAILABLE' });
  } finally { lock.releaseLock(); }
}
