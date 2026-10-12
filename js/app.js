/* Krishi Companion BD — UI logic (no network, no dependencies) */
(function () {
"use strict";

var D = window.KRISHI_DATA;
var I = window.KRISHI_I18N;

var state = { lang: "en", tab: "calendar", season: "rabi", pestCrop: "all", pestQ: "" };
try {
  var savedLang = localStorage.getItem("kcbd-lang");
  if (savedLang === "bn" || savedLang === "en") state.lang = savedLang;
} catch (e) {}

function t(key) { return I.t(key, state.lang); }
function n(v) { return I.num(v, state.lang); }
function monthName(m) {
  return I.MONTHS[state.lang][m];
}
/* Format kg with up to 3 decimals, trailing zeros trimmed */
function fmtKg(v) {
  var r = Math.round(v * 1000) / 1000;
  var s = String(r);
  return n(s);
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

var WIN_COLORS = { seedbed: "wb-sow", sow: "wb-sow", plant: "wb-sow",
                   transplant: "wb-tp", harvest: "wb-hv" };

function monthBar(monthsArr, cls) {
  var on = {};
  monthsArr.forEach(function (m) { on[m] = true; });
  var cells = "";
  for (var m = 1; m <= 12; m++) {
    cells += '<span class="mcell' + (on[m] ? " on " + cls : "") + '" title="' + esc(monthName(m)) + '">' + esc(monthName(m)) + "</span>";
  }
  return '<div class="mbar" role="img">' + cells + "</div>";
}

function seasonById(id) {
  for (var i = 0; i < D.SEASONS.length; i++) if (D.SEASONS[i].id === id) return D.SEASONS[i];
  return D.SEASONS[0];
}
function cropById(id) {
  for (var i = 0; i < D.CROPS.length; i++) if (D.CROPS[i].id === id) return D.CROPS[i];
  return null;
}

/* ---------- CALENDAR ---------- */
function renderCalendar() {
  var html = '<div class="seasons" role="tablist" aria-label="' + esc(t("seasonNow")) + '">';
  D.SEASONS.forEach(function (s) {
    var label = state.lang === "bn" ? s.bn : s.en;
    var win = state.lang === "bn" ? s.windowBn : s.windowEn;
    html += '<button class="season-btn' + (state.season === s.id ? " active" : "") + '" data-testid="season-' + s.id +
      '" data-season="' + s.id + '" role="tab" aria-selected="' + (state.season === s.id) + '">' +
      esc(label) + '<small>' + esc(n(win)) + "</small></button>";
  });
  html += "</div>";

  var s = seasonById(state.season);
  html += '<p class="season-cond">' + esc(state.lang === "bn" ? s.condBn : s.condEn) + "</p>";

  html += '<div class="legend">' +
    '<span><i class="sw wb-sow"></i>' + (state.lang === "bn" ? "বপন/রোপণ" : "Sowing/planting") + "</span>" +
    '<span><i class="sw wb-tp"></i>' + (state.lang === "bn" ? "চারা রোপণ" : "Transplant") + "</span>" +
    '<span><i class="sw wb-hv"></i>' + (state.lang === "bn" ? "ফসল তোলা" : "Harvest") + "</span></div>";

  D.CROPS.forEach(function (c) {
    if (c.seasons.indexOf(state.season) < 0) return;
    var name = state.lang === "bn" ? c.bn : c.en;
    html += '<article class="crop-card" data-testid="crop-' + c.id + '"><h3>' + esc(name) + "</h3>";
    c.windows.forEach(function (w) {
      var wl = state.lang === "bn" ? w.bn : w.en;
      html += '<div class="winrow"><span class="winlabel">' + esc(wl) + "</span>" +
        monthBar(w.months, WIN_COLORS[w.k] || "wb-sow") + "</div>";
    });
    html += '<p class="crop-note">' + esc(state.lang === "bn" ? c.noteBn : c.noteEn) + "</p></article>";
  });
  return html;
}

/* ---------- CALCULATOR ---------- */
function doseRows(cropId, areaDecimal) {
  var dose = D.DOSES[cropId];
  var acres = areaDecimal / D.DECIMAL_PER_ACRE;
  return Object.keys(dose.rates).map(function (f) {
    var lo = dose.rates[f][0], hi = dose.rates[f][1];
    var mid = (lo + hi) / 2;
    return {
      fert: f,
      lo: lo, hi: hi, mid: mid,
      perDecimal: mid / D.DECIMAL_PER_ACRE,
      total: mid * acres
    };
  });
}

function confBadge(conf) {
  var key = conf === "solid" ? "confSolid" : conf === "derived" ? "confDerived" : "confApprox";
  return '<span class="conf conf-' + conf + '">' + esc(t(key)) + "</span>";
}

function renderCalc() {
  var html = '<div class="disc"><strong>' + esc(t("disclaimerTitle")) + ".</strong> " +
    esc(t("disclaimerBody")) + "</div>";

  html += '<form id="calc-form" class="calc-form" data-testid="calc-form">' +
    '<label>' + esc(t("calcCrop")) +
    '<select id="calc-crop" data-testid="calc-crop">';
  D.CROPS.forEach(function (c) {
    if (!D.DOSES[c.id]) return;
    var name = state.lang === "bn" ? c.bn : c.en;
    html += '<option value="' + c.id + '">' + esc(name) + "</option>";
  });
  html += "</select></label>" +
    '<label>' + esc(t("calcArea")) +
    '<input id="calc-area" data-testid="calc-area" type="number" min="0" step="any" inputmode="decimal" placeholder="10"></label>' +
    '<label>' + esc(t("areaHint")) +
    '<select id="calc-unit" data-testid="calc-unit">' +
    '<option value="decimal">' + esc(t("unitDecimal")) + "</option>" +
    '<option value="acre">' + esc(t("unitAcre")) + "</option>" +
    '<option value="bigha">' + esc(t("unitBigha")) + "</option>" +
    "</select></label>" +
    '<button type="submit" class="btn primary" data-testid="calc-btn">' + esc(t("calcBtn")) + "</button></form>";

  html += '<div id="calc-results" data-testid="calc-results"></div>';

  html += '<section class="saved"><div class="saved-head"><h3>' + esc(t("savedTitle")) + '</h3>' +
    '<button class="btn small" id="saved-clear" data-testid="saved-clear">' + esc(t("clearAllBtn")) + "</button></div>" +
    '<div id="saved-list" data-testid="saved-list"></div></section>';
  return html;
}

function unitToDecimal(area, unit) {
  if (unit === "acre") return area * D.DECIMAL_PER_ACRE;
  if (unit === "bigha") return area * D.DECIMAL_PER_BIGHA;
  return area;
}

function renderCalcResults(cropId, areaDecimal) {
  var c = cropById(cropId);
  var dose = D.DOSES[cropId];
  var name = state.lang === "bn" ? c.bn : c.en;
  var html = "<h3>" + esc(name) + " — " + esc(fmtKg(areaDecimal)) + " " +
    (state.lang === "bn" ? "শতাংশ" : "decimal") + "</h3>";
  html += confBadge(dose.confidence);
  html += '<table class="dose-table"><thead><tr><th>' + esc(t("fertCol")) + "</th><th>" +
    esc(t("perAcreCol")) + "</th><th>" + esc(t("perDecCol")) + "</th><th>" +
    esc(t("totalCol")) + "</th></tr></thead><tbody>";
  doseRows(cropId, areaDecimal).forEach(function (r) {
    var fname = state.lang === "bn" ? D.FERTS[r.fert].bn : D.FERTS[r.fert].en;
    html += "<tr><td>" + esc(fname) + "</td><td>" + esc(n(r.lo)) + "–" + esc(n(r.hi)) + "</td><td>" +
      esc(fmtKg(r.perDecimal)) + "</td><td><strong>" + esc(fmtKg(r.total)) + "</strong></td></tr>";
  });
  html += "</tbody></table>";
  html += '<p class="muted">' + esc(t("guideRange")) + ". " + esc(t("usedMid")) + "</p>";
  html += '<p><strong>' + esc(t("howToApply")) + ":</strong> " +
    esc(state.lang === "bn" ? dose.applyBn : dose.applyEn) + "</p>";
  html += '<p class="muted"><strong>' + esc(t("sourceLbl")) + ":</strong> " +
    esc(state.lang === "bn" ? dose.sourceBn : dose.sourceEn) + "</p>";
  html += '<button class="btn" id="save-calc" data-testid="save-calc">' + esc(t("saveBtn")) + "</button>";
  return html;
}

function getSaved() {
  try {
    var raw = localStorage.getItem("kcbd-saved");
    var arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function setSaved(arr) {
  try { localStorage.setItem("kcbd-saved", JSON.stringify(arr)); } catch (e) {}
}

function renderSavedList() {
  var arr = getSaved();
  if (!arr.length) return '<p class="muted">' + esc(t("noSaved")) + "</p>";
  var html = "<ul class=\"saved-list\">";
  arr.forEach(function (it, i) {
    var c = cropById(it.crop);
    var name = c ? (state.lang === "bn" ? c.bn : c.en) : it.crop;
    var tot = it.rows.map(function (r) {
      var fname = state.lang === "bn" ? D.FERTS[r.fert].bn : D.FERTS[r.fert].en;
      return fname + " " + fmtKg(r.total);
    }).join(", ");
    html += '<li data-testid="saved-item"><div><strong>' + esc(name) + "</strong> · " +
      esc(fmtKg(it.areaDecimal)) + " " + (state.lang === "bn" ? "শতাংশ" : "decimal") +
      '<br><small>' + esc(tot) + " kg</small></div>" +
      '<button class="btn small danger" data-del="' + i + '" data-testid="saved-del-' + i + '">' +
      esc(t("deleteBtn")) + "</button></li>";
  });
  return html + "</ul>";
}

/* ---------- PEST ---------- */
function renderPest() {
  var html = '<div class="disc"><strong>' + esc(t("disclaimerTitle")) + ".</strong> " +
    esc(t("consultNote")) + "</div>";
  html += '<div class="pest-tools"><input id="pest-search" data-testid="pest-search" type="search" placeholder="' +
    esc(t("pestSearchPh")) + '" value="' + esc(state.pestQ) + '" aria-label="' + esc(t("pestSearchPh")) + '">' +
    '<div class="chips" role="group">';
  html += '<button class="chip' + (state.pestCrop === "all" ? " active" : "") + '" data-pestcrop="all" data-testid="pestchip-all">' +
    esc(t("pestAll")) + "</button>";
  D.CROPS.forEach(function (c) {
    var has = D.PESTS.some(function (p) { return p.crop === c.id; });
    if (!has) return;
    var name = state.lang === "bn" ? c.bn : c.en;
    html += '<button class="chip' + (state.pestCrop === c.id ? " active" : "") + '" data-pestcrop="' + c.id +
      '" data-testid="pestchip-' + c.id + '">' + esc(name) + "</button>";
  });
  html += "</div></div><div id=\"pest-list\" data-testid=\"pest-list\">" + renderPestList() + "</div>";
  return html;
}

function renderPestList() {
  var q = state.pestQ.trim().toLowerCase();
  var list = D.PESTS.filter(function (p) {
    if (state.pestCrop !== "all" && p.crop !== state.pestCrop) return false;
    if (!q) return true;
    return (p.en + " " + p.bn + " " + p.symEn + " " + p.symBn).toLowerCase().indexOf(q) >= 0;
  });
  if (!list.length) return '<p class="muted">' + esc(t("noPest")) + "</p>";
  var html = "";
  list.forEach(function (p) {
    var c = cropById(p.crop);
    var cname = c ? (state.lang === "bn" ? c.bn : c.en) : p.crop;
    html += '<article class="pest-card" data-testid="pest-card"><div class="pest-head"><h3>' +
      esc(state.lang === "bn" ? p.bn : p.en) + '</h3><span class="ptype">' +
      esc(p.type === "pest" ? t("typePest") : t("typeDisease")) + " · " + esc(cname) + "</span></div>" +
      "<p><strong>" + esc(t("symptomsLbl")) + ":</strong> " +
      esc(state.lang === "bn" ? p.symBn : p.symEn) + "</p>" +
      "<p><strong>" + esc(t("manageLbl")) + ":</strong> " +
      esc(state.lang === "bn" ? p.mgtBn : p.mgtEn) + "</p></article>";
  });
  return html;
}

/* ---------- SHELL ---------- */
function render() {
  document.documentElement.lang = state.lang === "bn" ? "bn" : "en";
  document.getElementById("app-title").textContent = t("appTitle");
  document.getElementById("app-sub").textContent = t("appSub");
  document.getElementById("lang-toggle").textContent = t("langBtn");
  document.getElementById("offline-note").textContent = t("offlineNote");
  var tabs = [["calendar", "tabCalendar"], ["calc", "tabCalc"], ["pest", "tabPest"]];
  var th = "";
  tabs.forEach(function (tb) {
    th += '<button class="tab' + (state.tab === tb[0] ? " active" : "") + '" data-testid="tab-' + tb[0] +
      '" data-tab="' + tb[0] + '" role="tab" aria-selected="' + (state.tab === tb[0]) + '">' +
      esc(t(tb[1])) + "</button>";
  });
  document.getElementById("tabs").innerHTML = th;
  var main = document.getElementById("main");
  if (state.tab === "calendar") main.innerHTML = renderCalendar();
  else if (state.tab === "calc") { main.innerHTML = renderCalc(); renderSavedListInto(); }
  else main.innerHTML = renderPest();
  bind();
}

function renderSavedListInto() {
  var el = document.getElementById("saved-list");
  if (el) el.innerHTML = renderSavedList();
}

function bind() {
  var tabs = document.querySelectorAll("[data-tab]");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () { state.tab = this.getAttribute("data-tab"); render(); });
  }
  var sbs = document.querySelectorAll("[data-season]");
  for (var j = 0; j < sbs.length; j++) {
    sbs[j].addEventListener("click", function () { state.season = this.getAttribute("data-season"); render(); });
  }
  var form = document.getElementById("calc-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var crop = document.getElementById("calc-crop").value;
      var area = parseFloat(document.getElementById("calc-area").value);
      var unit = document.getElementById("calc-unit").value;
      if (!(area > 0)) {
        document.getElementById("calc-results").innerHTML =
          '<p class="err" data-testid="calc-error">' + esc(t("invalidArea")) + "</p>";
        return;
      }
      var areaDecimal = unitToDecimal(area, unit);
      document.getElementById("calc-results").innerHTML =
        renderCalcResults(crop, areaDecimal);
      document.getElementById("save-calc").addEventListener("click", function () {
        var arr = getSaved();
        arr.unshift({ crop: crop, areaDecimal: Math.round(areaDecimal * 1000) / 1000,
                      rows: doseRows(crop, areaDecimal), ts: Date.now() });
        setSaved(arr.slice(0, 50));
        renderSavedListInto();
      });
    });
    var clearBtn = document.getElementById("saved-clear");
    if (clearBtn) clearBtn.addEventListener("click", function () { setSaved([]); renderSavedListInto(); });
  }
  var savedList = document.getElementById("saved-list");
  if (savedList) {
    savedList.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-del]");
      if (!b) return;
      var arr = getSaved();
      arr.splice(+b.getAttribute("data-del"), 1);
      setSaved(arr);
      renderSavedListInto();
    });
  }
  var chips = document.querySelectorAll("[data-pestcrop]");
  for (var k = 0; k < chips.length; k++) {
    chips[k].addEventListener("click", function () {
      state.pestCrop = this.getAttribute("data-pestcrop");
      state.pestQ = "";
      render();
    });
  }
  var ps = document.getElementById("pest-search");
  if (ps) {
    ps.addEventListener("input", function () {
      state.pestQ = ps.value;
      document.getElementById("pest-list").innerHTML = renderPestList();
    });
  }
}

function init() {
  // bound ONCE — #lang-toggle persists across renders, so it must not live in bind()
  document.getElementById("lang-toggle").addEventListener("click", function () {
    state.lang = state.lang === "bn" ? "en" : "bn";
    try { localStorage.setItem("kcbd-lang", state.lang); } catch (e) {}
    render();
  });
  render();
}

document.addEventListener("DOMContentLoaded", init);
})();
