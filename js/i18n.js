/* Krishi Companion BD — UI strings (EN/বাংলা) + Bengali digit helper */
(function () {
"use strict";

var BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBn(s) {
  return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
}
function num(s, lang) {
  return lang === "bn" ? toBn(s) : String(s);
}

var MONTHS = {
  en: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  bn: ["", "জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"]
};
var MONTHS_FULL = {
  en: ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  bn: ["", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]
};

var STR = {
  appTitle:    { en: "Krishi Companion BD", bn: "কৃষি সহযোগী বিডি" },
  appSub:      { en: "Farmer's companion for Bangladesh — crop calendar, fertilizer guidance & pest reference", bn: "বাংলাদেশের কৃষকের সহযোগী — ফসল ক্যালেন্ডার, সার নির্দেশনা ও পোকা-রোগ তথ্য" },
  tabCalendar: { en: "Crop Calendar", bn: "ফসল ক্যালেন্ডার" },
  tabCalc:     { en: "Fertilizer Calculator", bn: "সার নির্ণায়ক" },
  tabPest:     { en: "Pest & Disease", bn: "পোকা ও রোগ" },
  langBtn:     { en: "বাংলা", bn: "English" },
  disclaimerTitle: { en: "Guidance only — not a prescription", bn: "শুধু নির্দেশনা — নির্ধারিত মাত্রা নয়" },
  disclaimerBody: {
    en: "Fertilizer figures here are general guidance from public extension sources for medium-fertility soil. They are NOT a prescription for your land. Always do a soil test and consult your local agriculture officer (SAAO / উপসহকারী কৃষি কর্মকর্তা) before applying fertilizer. Pest notes describe general IPM practice only — no pesticide brands or doses are given.",
    bn: "এখানকার সারের মাত্রা মাঝারি উর্বর মাটির জন্য সরকারি সম্প্রসারণ সূত্রের সাধারণ নির্দেশনা। এটি আপনার জমির জন্য নির্ধারিত মাত্রা নয়। সার দেওয়ার আগে অবশ্যই মাটি পরীক্ষা করুন এবং স্থানীয় উপসহকারী কৃষি কর্মকর্তার পরামর্শ নিন। পোকা-রোগের তথ্য শুধু সাধারণ সমন্বিত বালাই ব্যবস্থাপনার ধারণা দেয় — কোনো কীটনাশকের নাম বা মাত্রা দেওয়া হয়নি।"
  },
  calcCrop:      { en: "Crop", bn: "ফসল" },
  calcArea:      { en: "Land area", bn: "জমির পরিমাণ" },
  unitDecimal:   { en: "Decimal (শতাংশ)", bn: "শতাংশ (Decimal)" },
  unitAcre:     { en: "Acre (একর)", bn: "একর (Acre)" },
  unitBigha:    { en: "Bigha (বিঘা)", bn: "বিঘা (Bigha)" },
  calcBtn:      { en: "Calculate", bn: "হিসাব করুন" },
  saveBtn:      { en: "Save calculation", bn: "হিসাব সংরক্ষণ" },
  savedTitle:   { en: "Saved calculations", bn: "সংরক্ষিত হিসাব" },
  noSaved:      { en: "No saved calculations yet.", bn: "এখনো কোনো হিসাব সংরক্ষণ করা হয়নি।" },
  deleteBtn:    { en: "Delete", bn: "মুছুন" },
  clearAllBtn:  { en: "Clear all", bn: "সব মুছুন" },
  fertCol:      { en: "Fertilizer", bn: "সার" },
  perAcreCol:   { en: "Per acre (kg)", bn: "প্রতি একরে (কেজি)" },
  perDecCol:    { en: "Per decimal (kg)", bn: "প্রতি শতাংশে (কেজি)" },
  totalCol:     { en: "Total for your land (kg)", bn: "আপনার জমির জন্য মোট (কেজি)" },
  guideRange:   { en: "Guideline range", bn: "নির্দেশনামূলক মাত্রা" },
  usedMid:      { en: "Totals use the midpoint of each range.", bn: "মোট হিসাবে প্রতিটি মাত্রার মধ্যবিন্দু ব্যবহার করা হয়েছে।" },
  sourceLbl:    { en: "Source", bn: "সূত্র" },
  howToApply:   { en: "How to apply", bn: "প্রয়োগ পদ্ধতি" },
  confSolid:    { en: "DAE/BRRI/BARI guidance", bn: "ডিএই/ব্রি/বারি নির্দেশনা" },
  confDerived:  { en: "Derived from FRG nutrient rates", bn: "এফআরজি পুষ্টি মাত্রা থেকে রূপান্তরিত" },
  confApprox:   { en: "Approximate — confirm with agriculture officer", bn: "আনুমানিক — কৃষি কর্মকর্তার কাছে নিশ্চিত করুন" },
  areaHint:     { en: "1 acre = 100 decimal · 1 bigha = 33 decimal", bn: "১ একর = ১০০ শতাংশ · ১ বিঘা = ৩৩ শতাংশ" },
  invalidArea:  { en: "Please enter a valid area greater than 0.", bn: "সঠিক জমির পরিমাণ দিন (০-এর বেশি)।" },
  pestSearchPh: { en: "Search pest or disease…", bn: "পোকা বা রোগ খুঁজুন…" },
  pestAll:      { en: "All crops", bn: "সব ফসল" },
  typePest:     { en: "Pest", bn: "পোকা" },
  typeDisease:  { en: "Disease", bn: "রোগ" },
  symptomsLbl:  { en: "Symptoms", bn: "লক্ষণ" },
  manageLbl:    { en: "Management (cultural/mechanical first)", bn: "ব্যবস্থাপনা (চাষাবাদ/যান্ত্রিক পদ্ধতি আগে)" },
  noPest:       { en: "No entries match your search.", bn: "খোঁজার সাথে কোনো তথ্য মেলেনি।" },
  consultNote:  { en: "If the problem spreads, consult your local agriculture officer before using any pesticide.", bn: "সমস্যা ছড়িয়ে পড়লে যেকোনো কীটনাশক ব্যবহারের আগে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।" },
  seasonNow:    { en: "Seasons", bn: "মৌসুমসমূহ" },
  offlineNote:  { en: "Works fully offline · data saved on this device only", bn: "সম্পূর্ণ অফলাইনে চলে · তথ্য শুধু এই ডিভাইসে থাকে" }
};

var I18N = {
  BN_DIGITS: BN_DIGITS, toBn: toBn, num: num,
  MONTHS: MONTHS, MONTHS_FULL: MONTHS_FULL, STR: STR,
  t: function (key, lang) {
    var e = STR[key];
    return e ? (lang === "bn" ? e.bn : e.en) : key;
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = I18N;
} else if (typeof window !== "undefined") {
  window.KRISHI_I18N = I18N;
}
})();
