/* Krishi Companion BD — unit tests. Run: node tests/run.js (no dependencies) */
"use strict";
const assert = require("assert");
const path = require("path");
const D = require(path.join(__dirname, "..", "js", "data.js"));
const I = require(path.join(__dirname, "..", "js", "i18n.js"));

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log("  ok  " + name); }
  catch (e) { fail++; console.log("  FAIL " + name + " — " + e.message); }
}
const approx = (a, b, eps) => Math.abs(a - b) <= (eps === undefined ? 1e-9 : eps);

/* Re-implement the calculator math exactly as app.js does (doseRows/unitToDecimal) */
function doseRows(cropId, areaDecimal) {
  const dose = D.DOSES[cropId];
  const acres = areaDecimal / D.DECIMAL_PER_ACRE;
  return Object.keys(dose.rates).map(f => {
    const [lo, hi] = dose.rates[f];
    const mid = (lo + hi) / 2;
    return { fert: f, lo, hi, mid, perDecimal: mid / D.DECIMAL_PER_ACRE, total: mid * acres };
  });
}
function unitToDecimal(area, unit) {
  if (unit === "acre") return area * D.DECIMAL_PER_ACRE;
  if (unit === "bigha") return area * D.DECIMAL_PER_BIGHA;
  return area;
}

console.log("== unit constants ==");
check("1 acre = 100 decimal", () => assert.strictEqual(D.DECIMAL_PER_ACRE, 100));
check("1 bigha = 33 decimal", () => assert.strictEqual(D.DECIMAL_PER_BIGHA, 33));

console.log("== fertilizer math (hand-verified samples) ==");
// HAND-VERIFY: Boro urea 100–110 kg/acre → mid 105. For 1 acre: 105 kg total.
// Per decimal = 105/100 = 1.05 kg. Per bigha = 105*33/100 = 34.65 kg.
check("boro urea: 1 acre → 105 kg", () => {
  const r = doseRows("boro", 100).find(r => r.fert === "urea");
  assert.ok(approx(r.total, 105));
  assert.ok(approx(r.perDecimal, 1.05));
});
check("boro urea: 33 decimal (1 bigha) → 34.65 kg", () => {
  const r = doseRows("boro", unitToDecimal(1, "bigha")).find(r => r.fert === "urea");
  assert.ok(approx(r.total, 34.65));
});
check("boro urea: 50 decimal → 52.5 kg", () => {
  const r = doseRows("boro", 50).find(r => r.fert === "urea");
  assert.ok(approx(r.total, 52.5));
});
// HAND-VERIFY: Potato MoP 100–110 → mid 105/acre. 2.5 acre = 250 decimal → 262.5 kg.
check("potato mop: 2.5 acre → 262.5 kg", () => {
  const r = doseRows("potato", unitToDecimal(2.5, "acre")).find(r => r.fert === "mop");
  assert.ok(approx(r.total, 262.5));
});
// HAND-VERIFY: Mustard boric 2–2.5 → mid 2.25/acre. Per decimal = 0.0225 kg.
check("mustard boric: per-decimal 0.0225 kg", () => {
  const r = doseRows("mustard", 100).find(r => r.fert === "boric");
  assert.ok(approx(r.perDecimal, 0.0225));
});
// HAND-VERIFY: Lentil gypsum 55–55 (flat) → mid 55. 10 decimal → 5.5 kg.
check("lentil gypsum flat rate: 10 decimal → 5.5 kg", () => {
  const r = doseRows("lentil", 10).find(r => r.fert === "gypsum");
  assert.ok(approx(r.total, 5.5));
});
// Invariants across ALL crops
check("all dose rows: mid/perDecimal/total consistent", () => {
  for (const cropId of Object.keys(D.DOSES)) {
    for (const r of doseRows(cropId, 237)) { // odd area catches rounding slips
      assert.ok(approx(r.mid, (r.lo + r.hi) / 2), cropId + "/" + r.fert + " mid");
      assert.ok(approx(r.perDecimal, r.mid / 100), cropId + "/" + r.fert + " perDecimal");
      assert.ok(approx(r.total, r.mid * 2.37), cropId + "/" + r.fert + " total");
    }
  }
});
check("unitToDecimal: acre/bigha/decimal", () => {
  assert.strictEqual(unitToDecimal(2, "acre"), 200);
  assert.strictEqual(unitToDecimal(3, "bigha"), 99);
  assert.strictEqual(unitToDecimal(7, "decimal"), 7);
});

console.log("== season windows ==");
const seasonMonths = {};
D.SEASONS.forEach(s => seasonMonths[s.id] = s.months);
check("seasons cover expected month spans", () => {
  assert.deepStrictEqual(D.SEASONS.map(s => s.id), ["rabi", "kharif1", "kharif2"]);
  assert.ok(seasonMonths.rabi.includes(1) && seasonMonths.rabi.includes(11));
  assert.ok(seasonMonths.kharif1.includes(4) && seasonMonths.kharif1.includes(6));
  assert.ok(seasonMonths.kharif2.includes(8) && seasonMonths.kharif2.includes(10));
});
check("every crop window: months valid 1-12; sowing windows in-season, harvest may spill into next season", () => {
  const order = ["rabi", "kharif1", "kharif2"];
  for (const c of D.CROPS) {
    assert.ok(c.windows.length > 0, c.id + " has windows");
    for (const w of c.windows) {
      assert.ok(w.months.length > 0, c.id + "/" + w.k + " non-empty");
      for (const m of w.months) assert.ok(m >= 1 && m <= 12, c.id + " month " + m);
      const union = new Set();
      c.seasons.forEach(sid => seasonMonths[sid].forEach(m => union.add(m)));
      if (w.k === "harvest") {
        // harvest may extend into the chronologically following season (e.g. Boro Apr–May)
        c.seasons.forEach(sid => {
          const next = order[(order.indexOf(sid) + 1) % 3];
          seasonMonths[next].forEach(m => union.add(m));
        });
      } else {
        // seedbed/sowing may start in the preceding season (e.g. Aman seedbed in June)
        c.seasons.forEach(sid => {
          const prev = order[(order.indexOf(sid) + 2) % 3];
          seasonMonths[prev].forEach(m => union.add(m));
        });
      }
      assert.ok(w.months.some(m => union.has(m)), c.id + "/" + w.k + " intersects season");
    }
  }
});
check("each season has at least 3 crops", () => {
  for (const s of D.SEASONS) {
    const n = D.CROPS.filter(c => c.seasons.includes(s.id)).length;
    assert.ok(n >= 3, s.id + " has " + n);
  }
});

console.log("== dose table schema ==");
check("dose fert keys valid, lo<=hi, lo>0, numbers", () => {
  const valid = Object.keys(D.FERTS);
  for (const [cropId, d] of Object.entries(D.DOSES)) {
    assert.ok(["solid", "derived", "approximate"].includes(d.confidence), cropId + " confidence");
    assert.ok(d.sourceEn && d.sourceBn && d.applyEn && d.applyBn, cropId + " strings");
    for (const [f, [lo, hi]] of Object.entries(d.rates)) {
      assert.ok(valid.includes(f), cropId + " fert " + f);
      assert.ok(typeof lo === "number" && typeof hi === "number", cropId + "/" + f + " numbers");
      assert.ok(lo > 0 && hi >= lo, cropId + "/" + f + " range");
    }
  }
});
check("dose crops all exist in calendar; calendar major crops covered", () => {
  const cropIds = new Set(D.CROPS.map(c => c.id));
  for (const id of Object.keys(D.DOSES)) assert.ok(cropIds.has(id), id + " in calendar");
  for (const id of ["boro", "aman", "aus", "wheat", "jute", "potato", "mustard", "lentil", "maize"])
    assert.ok(D.DOSES[id], id + " has dose");
});
check("no pesticide brand names or dosage prescriptions in pest data", () => {
  const banned = /\bml\b|\bg\/l\b|ec\b.*\d|syngenta|bayer|basf|roundup/i;
  for (const p of D.PESTS) {
    for (const f of ["symEn", "symBn", "mgtEn", "mgtBn"])
      assert.ok(!/\d+\s?(ml|g|l)\s?\/\s?(l|litre|ha)/i.test(p[f]), p.en + " has dosage-like text");
  }
  assert.ok(!banned.test(JSON.stringify(D.PESTS)), "no brand-like tokens");
});
check("every dose/pest crop id exists in CROPS", () => {
  const ids = new Set(D.CROPS.map(c => c.id));
  D.PESTS.forEach(p => assert.ok(ids.has(p.crop), p.en));
});

console.log("== i18n ==");
check("EN/BN keys match; Bengali digits correct", () => {
  const keys = Object.keys(I.STR);
  assert.ok(keys.length > 25, "string count " + keys.length);
  for (const k of keys) {
    assert.ok(I.STR[k].en && I.STR[k].bn, k + " both langs");
  }
  assert.strictEqual(I.toBn("105"), "১০৫");
  assert.strictEqual(I.toBn("0.0225"), "০.০২২৫");
  assert.strictEqual(I.num(34.65, "bn"), "৩৪.৬৫");
  assert.strictEqual(I.num(34.65, "en"), "34.65");
  assert.strictEqual(I.MONTHS.bn[1], "জানু");
  assert.strictEqual(I.MONTHS.en[12], "Dec");
});
check("every crop/fert/season has both EN and BN names", () => {
  D.CROPS.forEach(c => assert.ok(c.en && c.bn, c.id));
  D.SEASONS.forEach(s => assert.ok(s.en && s.bn && s.windowEn && s.windowBn, s.id));
  Object.entries(D.FERTS).forEach(([k, v]) => assert.ok(v.en && v.bn, k));
  D.PESTS.forEach(p => assert.ok(p.en && p.bn && p.symBn && p.mgtBn, p.en));
});

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
