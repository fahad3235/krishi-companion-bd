/* Krishi Companion BD — agronomic dataset
 * Sources: USDA FAS GAIN (Krishi Diary crop calendar), ACIAR season definitions,
 * BARC Fertilizer Recommendation Guide (FRG-2005 nutrient tables; FRG-2012 via
 * cited field trials), BARI Krishi Projukti Hatboi (Azad et al. 2019 via
 * Nahiyan et al. 2024), BARI/BAPARD lentil trial (Haq & Ahmed 2022),
 * peer-reviewed Bangladesh field trials (banglajol.info).
 * Doses are per acre, in kg of fertilizer PRODUCT (not nutrient), for
 * medium-fertility soil. All dose numbers are GUIDANCE ONLY.
 */
(function () {
"use strict";

var DECIMAL_PER_ACRE = 100;   // 1 acre = 100 decimal (শতাংশ)
var DECIMAL_PER_BIGHA = 33;   // 1 bigha (বিঘা) = 33 decimal

var FERTS = {
  urea:   { en: "Urea",          bn: "ইউরিয়া" },
  tsp:    { en: "TSP",           bn: "টিএসপি" },
  mop:    { en: "MoP",           bn: "এমওপি" },
  gypsum: { en: "Gypsum",        bn: "জিপসাম" },
  zinc:   { en: "Zinc sulphate", bn: "জিংক সালফেট" },
  boric:  { en: "Boric acid",    bn: "বরিক এসিড" }
};

var SEASONS = [
  { id: "rabi",
    en: "Rabi", bn: "রবি",
    months: [10, 11, 12, 1, 2, 3],
    windowEn: "mid-Oct – mid-Mar", windowBn: "মধ্য-অক্টোবর – মধ্য-মার্চ",
    condEn: "Dry winter season, occasional rainfall. Boro rice, wheat, potato, mustard, lentil, vegetables.",
    condBn: "শুষ্ক শীত মৌসুম, মাঝে মাঝে বৃষ্টি। বোরো ধান, গম, আলু, সরিষা, মসুর, সবজি।" },
  { id: "kharif1",
    en: "Kharif-1", bn: "খরিফ-১",
    months: [3, 4, 5, 6, 7],
    windowEn: "mid-Mar – mid-Jul", windowBn: "মধ্য-মার্চ – মধ্য-জুলাই",
    condEn: "Pre-monsoon, increasing rainfall and heat. Aus rice, jute, mungbean, Kharif maize.",
    condBn: "প্রাক-বর্ষা, বাড়তে থাকা বৃষ্টি ও তাপ। আউস ধান, পাট, মুগডাল, খরিফ ভুট্টা।" },
  { id: "kharif2",
    en: "Kharif-2", bn: "খরিফ-২",
    months: [7, 8, 9, 10],
    windowEn: "mid-Jul – mid-Oct", windowBn: "মধ্য-জুলাই – মধ্য-অক্টোবর",
    condEn: "Monsoon, heavy rainfall. Transplant Aman rice.",
    condBn: "বর্ষা মৌসুম, ভারী বৃষ্টিপাত। রোপা আমন ধান।" }
];

/* Crop calendar. Windows use month numbers 1-12. */
var CROPS = [
  { id: "boro", en: "Boro rice", bn: "বোরো ধান", seasons: ["rabi"],
    windows: [
      { k: "seedbed",     en: "Seedbed",      bn: "বীজতলা",   months: [11, 12] },
      { k: "transplant",  en: "Transplant",   bn: "রোপণ",     months: [12, 1, 2] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [4, 5] }
    ],
    noteEn: "Fully irrigated dry-season rice. Transplant till mid-February.",
    noteBn: "সম্পূর্ণ সেচনির্ভর শুষ্ক মৌসুমের ধান। ফেব্রুয়ারির মাঝামাঝি পর্যন্ত রোপণ।" },
  { id: "aman", en: "Aman rice (T. Aman)", bn: "আমন ধান (রোপা আমন)", seasons: ["kharif2"],
    windows: [
      { k: "seedbed",     en: "Seedbed",      bn: "বীজতলা",   months: [6] },
      { k: "transplant",  en: "Transplant",   bn: "রোপণ",     months: [7, 8] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [11, 12] }
    ],
    noteEn: "Rain-fed monsoon rice. Transplant 15 July – 15 August.",
    noteBn: "বৃষ্টিনির্ভর বর্ষা মৌসুমের ধান। ১৫ জুলাই – ১৫ আগস্ট রোপণ।" },
  { id: "aus", en: "Aus rice", bn: "আউস ধান", seasons: ["kharif1"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [3, 4] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [7, 8] }
    ],
    noteEn: "Pre-monsoon rice; needs extra water at early stages.",
    noteBn: "প্রাক-বর্ষার ধান; প্রাথমিক পর্যায়ে অতিরিক্ত পানি দরকার।" },
  { id: "wheat", en: "Wheat", bn: "গম", seasons: ["rabi"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [11, 12] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [3, 4] }
    ],
    noteEn: "Sow from 15 November; finish by 10 December for best yield.",
    noteBn: "১৫ নভেম্বর থেকে বপন; ভালো ফলনের জন্য ১০ ডিসেম্বরের মধ্যে শেষ করুন।" },
  { id: "potato", en: "Potato", bn: "আলু", seasons: ["rabi"],
    windows: [
      { k: "plant",       en: "Planting",     bn: "রোপণ",     months: [10, 11] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [1, 2] }
    ],
    noteEn: "Plant from mid-October; finish by 15 December.",
    noteBn: "অক্টোবরের মাঝামাঝি থেকে রোপণ; ১৫ ডিসেম্বরের মধ্যে শেষ করুন।" },
  { id: "mustard", en: "Mustard", bn: "সরিষা", seasons: ["rabi"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [10, 11] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [1, 2] }
    ],
    noteEn: "Sow from mid-October. Fits well after T. Aman in the pattern.",
    noteBn: "অক্টোবরের মাঝামাঝি থেকে বপন। রোপা আমনের পর এই ফসল ভালো হয়।" },
  { id: "lentil", en: "Lentil", bn: "মসুর ডাল", seasons: ["rabi"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [10, 11] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [2, 3] }
    ],
    noteEn: "Low cash cost; fixes nitrogen in soil. Sow from mid-October.",
    noteBn: "কম খরচের ফসল; মাটিতে নাইট্রোজেন যোগায়। অক্টোবরের মাঝামাঝি থেকে বপন।" },
  { id: "jute", en: "Jute", bn: "পাট", seasons: ["kharif1", "kharif2"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [3, 4] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [7, 8] }
    ],
    noteEn: "Sow from mid-March till end of April. Harvest and retting extend into Kharif-2.",
    noteBn: "মার্চের মাঝামাঝি থেকে এপ্রিলের শেষ পর্যন্ত বপন। ফসল তোলা ও পচানো খরিফ-২ পর্যন্ত গড়ায়।" },
  { id: "blackgram", en: "Black gram", bn: "মাসকলাই", seasons: ["kharif2"],
    windows: [
      { k: "sow",         en: "Sowing",       bn: "বপন",      months: [7, 8] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [10, 11] }
    ],
    noteEn: "Short-duration Kharif-2 pulse. Fixes nitrogen; good after early Aus.",
    noteBn: "স্বল্পমেয়াদি খরিফ-২ ডাল ফসল। মাটিতে নাইট্রোজেন যোগায়।" },
  { id: "maize", en: "Maize", bn: "ভুট্টা", seasons: ["rabi", "kharif1"],
    windows: [
      { k: "sow",         en: "Sowing (Rabi)",  bn: "বপন (রবি)",   months: [10, 11] },
      { k: "harvest",     en: "Harvest (Rabi)", bn: "ফসল তোলা (রবি)", months: [3, 4] },
      { k: "sow",         en: "Sowing (Kharif)",  bn: "বপন (খরিফ)", months: [2, 3] },
      { k: "harvest",     en: "Harvest (Kharif)", bn: "ফসল তোলা (খরিফ)", months: [6, 7] }
    ],
    noteEn: "Grown in both Rabi (end-Oct – early Dec) and Kharif (mid-Feb – Mar). Needs good drainage.",
    noteBn: "রবি (অক্টোবর শেষ – ডিসেম্বর শুরু) ও খরিফ (ফেব্রুয়ারি মাঝ – মার্চ) উভয় মৌসুমে হয়। ভালো পানি নিষ্কাশন দরকার।" },
  { id: "vegetables", en: "Vegetables (Rabi)", bn: "সবজি (রবি)", seasons: ["rabi"],
    windows: [
      { k: "sow",         en: "Sowing / Transplant", bn: "বপন / চারা রোপণ", months: [10, 11] },
      { k: "harvest",     en: "Harvest",      bn: "ফসল তোলা", months: [12, 1, 2] }
    ],
    noteEn: "Tomato, cauliflower, cabbage, brinjal, onion, garlic, chili. High value, high pest risk.",
    noteBn: "টমেটো, ফুলকপি, বাঁধাকপি, বেগুন, পেঁয়াজ, রসুন, মরিচ। বেশি লাভ, বেশি পোকার ঝুঁকি।" }
];

/* Fertilizer doses per ACRE (kg of product). confidence:
 *  "solid"      — product-form rates from published DAE/BRRI/BARI guidance
 *  "derived"    — converted by us from FRG nutrient rates (N/0.46 urea, P/0.20 TSP,
 *                 K/0.50 MoP, S/0.18 gypsum, Zn/0.227 zinc sulphate, B/0.17 boric acid)
 *  "approximate"— single/older or conflicting sources; confirm with local officer
 */
var DOSES = {
  boro: { confidence: "solid",
    sourceEn: "FRG-2018 / DAE extension guidance (medium-fertility soil); within BRRI dhan29 recommended band (PLOS ONE 2022).",
    sourceBn: "এফআরজি-২০১৮ / ডিএই সম্প্রসারণ নির্দেশনা (মাঝারি উর্বর মাটি)।",
    rates: { urea: [100, 110], tsp: [35, 40], mop: [40, 45], gypsum: [25, 25], zinc: [4, 4] },
    applyEn: "Full TSP, MoP, gypsum and zinc as basal. Urea in 3 equal splits at ~20, 40 and 60–65 days after transplanting.",
    applyBn: "সম্পূর্ণ টিএসপি, এমওপি, জিপসাম ও জিংক জমি তৈরির সময়। ইউরিয়া ৩ কিস্তিতে — রোপণের ~২০, ৪০ ও ৬০–৬৫ দিন পর।" },
  aman: { confidence: "solid",
    sourceEn: "FRG-2018 / DAE extension guidance (medium-fertility soil).",
    sourceBn: "এফআরজি-২০১৮ / ডিএই সম্প্রসারণ নির্দেশনা (মাঝারি উর্বর মাটি)।",
    rates: { urea: [60, 70], tsp: [20, 25], mop: [25, 30], gypsum: [15, 15] },
    applyEn: "Full TSP, MoP and gypsum as basal. Urea in 3 equal splits at ~15, 30–35 and 50–55 days after transplanting.",
    applyBn: "সম্পূর্ণ টিএসপি, এমওপি ও জিপসাম জমি তৈরির সময়। ইউরিয়া ৩ কিস্তিতে — রোপণের ~১৫, ৩০–৩৫ ও ৫০–৫৫ দিন পর।" },
  potato: { confidence: "solid",
    sourceEn: "BARI Krishi Projukti Hatboi (Azad et al. 2019) via Nahiyan et al. 2024; FRG-2018 / DAE.",
    sourceBn: "বারি কৃষি প্রযুক্তি হাতবই (আজাদ ও অন্যান্য ২০১৯); এফআরজি-২০১৮ / ডিএই।",
    rates: { urea: [90, 100], tsp: [60, 60], mop: [100, 110], gypsum: [40, 40], zinc: [4, 4], boric: [3, 3] },
    applyEn: "Half the urea plus all other fertilizers in the ridge at planting. Remaining urea at 30–35 days with earthing-up. Potato is potash-hungry — do not cut MoP.",
    applyBn: "অর্ধেক ইউরিয়া ও বাকি সব সার রোপণের সময় নালায়। বাকি ইউরিয়া ৩০–৩৫ দিনে মাটি তোলার সময়। আলুতে পটাশ বেশি লাগে।" },
  maize: { confidence: "approximate",
    sourceEn: "DAE extension guidance; NOTE: FRG-2012 hybrid-maize rates (N 250 kg/ha etc., BJAR 2022) are substantially higher — intensive hybrid maize needs more.",
    sourceBn: "ডিএই সম্প্রসারণ নির্দেশনা; দ্রষ্টব্য: এফআরজি-২০১২-এর হাইব্রিড ভুট্টার মাত্রা অনেক বেশি — নিবিড় হাইব্রিড ভুট্টায় বেশি লাগে।",
    rates: { urea: [100, 110], tsp: [50, 50], mop: [40, 40], gypsum: [20, 20], zinc: [4, 4], boric: [2, 2] },
    applyEn: "One-third urea plus all others as basal. One-third at knee-high (~25 days) with earthing-up, one-third before tasseling (~45 days).",
    applyBn: "এক-তৃতীয়াংশ ইউরিয়া ও বাকি সব বপনের সময়। এক-তৃতীয়াংশ হাঁটুসমান (~২৫ দিন) অবস্থায় মাটি তোলাসহ, এক-তৃতীয়াংশ মোচা বের হওয়ার আগে (~৪৫ দিন)।" },
  lentil: { confidence: "approximate",
    sourceEn: "Experimental recommendation for BARI masur-6/7/9, Gopalganj (Haq & Ahmed 2022); FRG tables suggest lower rates — sources vary, confirm locally.",
    sourceBn: "বারি মসুর-৬/৭/৯-এর পরীক্ষামূলক সুপারিশ, গোপালগঞ্জ (হক ও আহমেদ ২০২২); এফআরজি-তে কম মাত্রা — স্থানীয়ভাবে নিশ্চিত করুন।",
    rates: { urea: [45, 45], tsp: [90, 90], mop: [45, 45], gypsum: [55, 55], zinc: [3, 3] },
    applyEn: "All fertilizers as basal at final land preparation. Lentil fixes its own nitrogen — do not over-apply urea.",
    applyBn: "সব সার শেষ চাষের সময়। মসুর নিজে নাইট্রোজেন যোগায় — বেশি ইউরিয়া দেবেন না।" },
  mustard: { confidence: "derived",
    sourceEn: "Derived from FRG-2005 nutrient rates (N70 P23 K22 S14 Zn1 B1 kg/ha); rounded.",
    sourceBn: "এফআরজি-২০০৫-এর পুষ্টি মাত্রা থেকে রূপান্তরিত (N70 P23 K22 S14 Zn1 B1 কেজি/হেক্টর)।",
    rates: { urea: [60, 65], tsp: [45, 50], mop: [18, 20], gypsum: [30, 32], zinc: [1.5, 2], boric: [2, 2.5] },
    applyEn: "All except half the urea as basal. Remaining urea as top-dress after first irrigation (~20–25 days).",
    applyBn: "অর্ধেক ইউরিয়া বাদে বাকি সব শেষ চাষে। বাকি ইউরিয়া প্রথম সেচের পর (~২০–২৫ দিনে) উপরি প্রয়োগ।" },
  wheat: { confidence: "derived",
    sourceEn: "Derived from FRG-2005 nutrient rates (N75 P20 K25 S4 Zn1 B1 kg/ha); regional DAE charts vary (e.g. 140–180 kg/ha TSP cited in N. Bengal) — confirm locally.",
    sourceBn: "এফআরজি-২০০৫ থেকে রূপান্তরিত; আঞ্চলিক চার্টে ভিন্নতা আছে — স্থানীয়ভাবে নিশ্চিত করুন।",
    rates: { urea: [65, 70], tsp: [40, 45], mop: [20, 25], gypsum: [8, 10], zinc: [1.5, 2], boric: [2, 2.5] },
    applyEn: "All P, K, S, Zn, B plus half the urea as basal. Remaining urea top-dressed at crown-root initiation (~21 days).",
    applyBn: "সব টিএসপি, এমওপি, জিপসাম, জিংক, বরিক ও অর্ধেক ইউরিয়া শেষ চাষে। বাকি ইউরিয়া শিকড় গজানোর সময় (~২১ দিনে)।" },
  jute: { confidence: "derived",
    sourceEn: "Derived from FRG-2005 nutrient rates for tossa jute (N75 P7 K13 S5 Zn1 kg/ha); rounded.",
    sourceBn: "এফআরজি-২০০৫-এর তোষা পাটের পুষ্টি মাত্রা থেকে রূপান্তরিত।",
    rates: { urea: [65, 70], tsp: [14, 15], mop: [10, 12], gypsum: [10, 12], zinc: [1.5, 2] },
    applyEn: "Two-thirds of urea plus all others as basal. Remaining urea at ~20 days after sowing.",
    applyBn: "দুই-তৃতীয়াংশ ইউরিয়া ও বাকি সব শেষ চাষে। বাকি ইউরিয়া বপনের ~২০ দিন পর।" },
  aus: { confidence: "derived",
    sourceEn: "Derived from FRG-2005 nutrient rates for modern Aus (N54 P4 K10 S5 Zn1 kg/ha); rounded.",
    sourceBn: "এফআরজি-২০০৫-এর আধুনিক আউসের পুষ্টি মাত্রা থেকে রূপান্তরিত।",
    rates: { urea: [45, 50], tsp: [8, 10], mop: [8, 10], gypsum: [10, 12], zinc: [1.5, 2] },
    applyEn: "Full TSP, MoP, gypsum and zinc as basal. Urea in 2–3 splits during tillering.",
    applyBn: "সম্পূর্ণ টিএসপি, এমওপি, জিপসাম ও জিংক শেষ চাষে। ইউরিয়া কুশি গজানোর সময় ২–৩ কিস্তিতে।" }
};

/* Pest & disease quick reference — cultural/mechanical control FIRST.
 * No pesticide brand names, no dosage prescriptions. */
var PESTS = [
  { crop: "boro", type: "pest", en: "Rice stem borer", bn: "মাজরা পোকা",
    symEn: "Dead hearts in young plants; white, empty panicles (white heads) later.",
    symBn: "কচি গাছে মরা ডিগ; পরে সাদা শীষ।",
    mgtEn: "Set up perching for birds, use light traps, destroy stubble after harvest, maintain uniform planting.",
    mgtBn: "পাখি বসার ডাল দিন, আলোর ফাঁদ ব্যবহার করুন, ফসল তোলার পর নাড়া ধ্বংস করুন।" },
  { crop: "aman", type: "pest", en: "Brown planthopper", bn: "বাদামি গাছফড়িং",
    symEn: "Patches of yellowing and drying plants (hopperburn), sooty mold.",
    symBn: "গাছ হলুদ হয়ে শুকিয়ে যাওয়া (হপারবার্ন), ঝুলছত্রাক।",
    mgtEn: "Drain the field briefly, avoid excess urea, keep bunds clean for natural enemies.",
    mgtBn: "জমির পানি কিছুদিন বের করে দিন, অতিরিক্ত ইউরিয়া দেবেন না।" },
  { crop: "boro", type: "disease", en: "Rice blast", bn: "ব্লাস্ট রোগ",
    symEn: "Diamond-shaped gray spots with dark borders on leaves; rotten neck at heading.",
    symBn: "পাতায় হীরাকৃতি ধূসর দাগ; শীষ বের হওয়ার সময় গোড়া পচা।",
    mgtEn: "Balanced fertilizer (avoid excess urea), tolerant varieties, remove infected debris.",
    mgtBn: "সুষম সার (বেশি ইউরিয়া নয়), সহনশীল জাত, আক্রান্ত অংশ সরিয়ে ফেলুন।" },
  { crop: "aman", type: "disease", en: "Bacterial leaf blight", bn: "পাতা পোড়া রোগ",
    symEn: "Water-soaked stripes from leaf tip turning yellow-white; wilting seedlings (kresek).",
    symBn: "পাতার ডগা থেকে পানিভেজা দাগ হলুদ-সাদা হয়; চারার ঢলে পড়া।",
    mgtEn: "Avoid field-to-field irrigation flow, balanced potash, destroy infected stubble.",
    mgtBn: "এক জমির পানি অন্য জমিতে যেতে দেবেন না, সুষম পটাশ, আক্রান্ত নাড়া ধ্বংস করুন।" },
  { crop: "aman", type: "disease", en: "Sheath blight", bn: "খোল পচা রোগ",
    symEn: "Oval gray-green lesions on leaf sheath near water line, spreading upward.",
    symBn: "পানির কাছাকাছি খোলে ডিম্বাকৃতি দাগ, উপরের দিকে ছড়ায়।",
    mgtEn: "Wider spacing, drain excess water, avoid excess nitrogen.",
    mgtBn: "বেশি দূরত্বে রোপণ, অতিরিক্ত পানি বের করে দিন, বেশি নাইট্রোজেন নয়।" },
  { crop: "potato", type: "disease", en: "Late blight", bn: "লেট ব্লাইট / পাতা পচা",
    symEn: "Water-soaked dark leaf spots with white mold underneath in cool humid weather; tuber rot.",
    symBn: "ঠান্ডা ভেজা আবহাওয়ায় পাতায় কালো দাগ, নিচে সাদা ছত্রাক; আলু পচা।",
    mgtEn: "Destroy infected haulms, proper earthing-up, avoid overhead irrigation, use certified seed.",
    mgtBn: "আক্রান্ত গাছ ধ্বংস করুন, ভালোভাবে মাটি তুলুন, প্রত্যয়িত বীজ ব্যবহার করুন।" },
  { crop: "potato", type: "pest", en: "Aphid", bn: "জাব পোকা",
    symEn: "Colonies under leaves, leaf curling, sooty mold; spreads virus diseases.",
    symBn: "পাতার নিচে দল বেঁধে থাকে, পাতা কুঁকড়ে যায়; ভাইরাস ছড়ায়।",
    mgtEn: "Yellow sticky traps, conserve ladybird beetles, remove virus-infected plants early.",
    mgtBn: "হলুদ আঠালো ফাঁদ, লেডিবার্ড পোকা সংরক্ষণ, ভাইরাস আক্রান্ত গাছ তুলে ফেলুন।" },
  { crop: "potato", type: "pest", en: "Cutworm", bn: "কাটুই পোকা",
    symEn: "Seedlings cut at soil level at night; caterpillars hide in soil by day.",
    symBn: "রাতে চারার গোড়া কেটে দেয়; দিনে মাটিতে লুকিয়ে থাকে।",
    mgtEn: "Deep ploughing before planting, hand-pick at night, keep field weed-free.",
    mgtBn: "রোপণের আগে গভীর চাষ, রাতে হাতে ধরে মারুন, জমি আগাছামুক্ত রাখুন।" },
  { crop: "wheat", type: "disease", en: "Leaf rust", bn: "পাতার মরিচা রোগ",
    symEn: "Orange-brown powdery pustules on leaves; premature drying.",
    symBn: "পাতায় কমলা-বাদামি গুঁড়ো দাগ; আগাম শুকিয়ে যাওয়া।",
    mgtEn: "Sow on time (not late), use tolerant varieties, destroy volunteer wheat plants.",
    mgtBn: "সময়মতো বপন (দেরি নয়), সহনশীল জাত, স্বেচ্ছায় গজানো গম ধ্বংস করুন।" },
  { crop: "wheat", type: "disease", en: "Wheat blast", bn: "গমের ব্লাস্ট",
    symEn: "Bleached white heads with dark spots on rachis; shriveled grains.",
    symBn: "শীষ সাদা হয়ে যাওয়া, দানা চুপসে যাওয়া।",
    mgtEn: "Avoid very late sowing, use tolerant varieties, rotate crops. Report new outbreaks to DAE.",
    mgtBn: "বেশি দেরিতে বপন নয়, সহনশীল জাত, ফসল চক্র। নতুন প্রাদুর্ভাব ডিএই-কে জানান।" },
  { crop: "wheat", type: "pest", en: "Termite", bn: "উইপোকা",
    symEn: "Damages roots and lower stem in dry soil; plants dry up in patches.",
    symBn: "শুষ্ক মাটিতে শিকড় ও গোড়া নষ্ট করে; গাছ শুকিয়ে যায়।",
    mgtEn: "Irrigate on time, remove stubbles and dry organic debris from field.",
    mgtBn: "সময়মতো সেচ, জমি থেকে নাড়া ও শুকনো আবর্জনা সরান।" },
  { crop: "jute", type: "pest", en: "Jute hairy caterpillar", bn: "শুঁয়োপোকা",
    symEn: "Defoliation by hairy caterpillars; egg masses on leaf underside.",
    symBn: "লোমশ শুঁয়োপোকা পাতা খেয়ে ফেলে; পাতার নিচে ডিমের গাদা।",
    mgtEn: "Hand-pick and destroy egg masses, light traps, conserve natural enemies.",
    mgtBn: "ডিমের গাদা হাতে তুলে ধ্বংস করুন, আলোর ফাঁদ।" },
  { crop: "jute", type: "pest", en: "Stem weevil", bn: "কাণ্ডের উইভিল",
    symEn: "Swollen galls on stem; fibre quality falls.",
    symBn: "কাণ্ডে ফোলা গিট; আঁশের মান কমে।",
    mgtEn: "Uproot and destroy galled plants early, crop rotation.",
    mgtBn: "আক্রান্ত গাছ আগেই তুলে ধ্বংস করুন, ফসল চক্র।" },
  { crop: "jute", type: "pest", en: "Yellow mite", bn: "হলুদ মাকড়",
    symEn: "Top leaves curl and crinkle, stunted growth.",
    symBn: "আগার পাতা কুঁকড়ে যায়, বৃদ্ধি থেমে যায়।",
    mgtEn: "Spray clean water on foliage to dislodge mites; avoid dusty conditions.",
    mgtBn: "পাতায় পরিষ্কার পানি ছিটিয়ে মাকড় তাড়ান।" },
  { crop: "mustard", type: "pest", en: "Mustard aphid", bn: "সরিষার জাব পোকা",
    symEn: "Dense colonies on flower heads and pods; poor pod setting, sooty mold.",
    symBn: "ফুল ও ছড়ায় ঘন দল; ফলন কমে, ঝুলছত্রাক।",
    mgtEn: "Yellow sticky traps, conserve ladybirds and syrphid flies, timely sowing.",
    mgtBn: "হলুদ আঠালো ফাঁদ, উপকারী পোকা সংরক্ষণ, সময়মতো বপন।" },
  { crop: "mustard", type: "disease", en: "Alternaria blight", bn: "অল্টারনারিয়া দাগ রোগ",
    symEn: "Dark brown spots with concentric rings on leaves and pods.",
    symBn: "পাতা ও ছড়ায় গাঢ় বাদামি বলয়যুক্ত দাগ।",
    mgtEn: "Crop rotation, clean certified seed, destroy crop debris.",
    mgtBn: "ফসল চক্র, পরিষ্কার প্রত্যয়িত বীজ, ফসলের অবশিষ্টাংশ ধ্বংস।" },
  { crop: "maize", type: "pest", en: "Fall armyworm", bn: "ফল আর্মিওয়ার্ম",
    symEn: "Ragged holes in whorl leaves, sawdust-like frass; damaged cobs.",
    symBn: "পাতার কুঁড়িতে ছেঁড়া ছিদ্র, কাঠের গুঁড়োর মতো মল; ভুট্টার মোচা নষ্ট।",
    mgtEn: "Hand-pick larvae and crush egg masses, pheromone traps, conserve natural enemies, scout weekly.",
    mgtBn: "শুঁয়োপোকা হাতে তুলে ডিম নষ্ট করুন, ফেরোমন ফাঁদ, সপ্তাহে জমি পরিদর্শন।" },
  { crop: "lentil", type: "disease", en: "Lentil rust", bn: "মসুরের মরিচা",
    symEn: "Small brown powdery pustules on leaves and stems; defoliation.",
    symBn: "পাতা ও কাণ্ডে ছোট বাদামি গুঁড়ো দাগ; পাতা ঝরে।",
    mgtEn: "Early sowing, resistant varieties, crop rotation, destroy debris.",
    mgtBn: "আগাম বপন, প্রতিরোধী জাত, ফসল চক্র।" },
  { crop: "lentil", type: "disease", en: "Collar rot", bn: "গোড়া পচা",
    symEn: "Seedlings wilt and collapse at soil level; white fungal growth at base.",
    symBn: "চারা মাটির কাছে পচে ঢলে পড়ে; গোড়ায় সাদা ছত্রাক।",
    mgtEn: "Well-drained soil, avoid waterlogging, treat seed with Trichoderma (bio-input), rotate crops.",
    mgtBn: "পানি নিষ্কাশন ভালো রাখুন, জলাবদ্ধতা নয়, শস্য চক্র।" },
  { crop: "vegetables", type: "pest", en: "Brinjal fruit & shoot borer", bn: "বেগুনের ডগা ও ফল ছিদ্রকারী",
    symEn: "Drooping shoots; bored fruits unfit for market.",
    symBn: "ডগা নুয়ে পড়ে; ফলে ছিদ্র।",
    mgtEn: "Clip and destroy wilted shoots weekly, pheromone traps, remove infested fruits.",
    mgtBn: "নুয়ে পড়া ডগা কেটে ধ্বংস করুন, ফেরোমন ফাঁদ, আক্রান্ত ফল তুলে ফেলুন।" },
  { crop: "vegetables", type: "pest", en: "Diamondback moth (cabbage)", bn: "ডায়মন্ডব্যাক মথ",
    symEn: "Window-pane feeding on leaves; skeletonized foliage.",
    symBn: "পাতায় জানালার কাচের মতো খাওয়া দাগ।",
    mgtEn: "Netting over seedlings, crop rotation, conserve parasitic wasps.",
    mgtBn: "চারায় জাল দিন, ফসল চক্র, উপকারী বোলতা সংরক্ষণ।" },
  { crop: "aus", type: "pest", en: "Rice hispa", bn: "পামরি পোকা",
    symEn: "White streaks from scraping on leaves; grubs mine inside leaves.",
    symBn: "পাতায় সাদা আঁচড়ের দাগ; কীড়া পাতার ভেতর খায়।",
    mgtEn: "Clip and destroy affected leaf tips, maintain field sanitation.",
    mgtBn: "আক্রান্ত পাতার ডগা কেটে ধ্বংস করুন, জমি পরিষ্কার রাখুন।" }
];

var DATA = {
  DECIMAL_PER_ACRE: DECIMAL_PER_ACRE,
  DECIMAL_PER_BIGHA: DECIMAL_PER_BIGHA,
  FERTS: FERTS,
  SEASONS: SEASONS,
  CROPS: CROPS,
  DOSES: DOSES,
  PESTS: PESTS
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DATA;
} else if (typeof window !== "undefined") {
  window.KRISHI_DATA = DATA;
}
})();
