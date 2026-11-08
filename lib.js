/**
 * lib.js - Pure functions for Sổ Xố Bỏ Túi (shared between browser & Node.js)
 */

export const PRIZE = {
  db: { code: 'ĐB', name: 'Giải Đặc Biệt', amount: 2000000000, digits: 6 },
  phudb: { code: 'Phụ ĐB', name: 'Giải Phụ Đặc Biệt', amount: 50000000, digits: 5 },
  kk: { code: 'Khuyến khích', name: 'Giải Khuyến Khích', amount: 6000000, digits: 6 },
  g1: { code: 'G1', name: 'Giải Nhất', amount: 30000000, digits: 5 },
  g2: { code: 'G2', name: 'Giải Nhì', amount: 15000000, digits: 5 },
  g3: { code: 'G3', name: 'Giải Ba', amount: 10000000, digits: 5 },
  g4: { code: 'G4', name: 'Giải Tư', amount: 3000000, digits: 5 },
  g5: { code: 'G5', name: 'Giải Năm', amount: 1000000, digits: 4 },
  g6: { code: 'G6', name: 'Giải Sáu', amount: 400000, digits: 4 },
  g7: { code: 'G7', name: 'Giải Bảy', amount: 200000, digits: 3 },
  g8: { code: 'G8', name: 'Giải Tám', amount: 100000, digits: 2 }
};

// Drawing schedule by day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
export const SCHEDULE = {
  mn: {
    0: ['Tiền Giang', 'Kiên Giang', 'Đà Lạt'],
    1: ['Hồ Chí Minh', 'Đồng Tháp', 'Cà Mau'],
    2: ['Bến Tre', 'Vũng Tàu', 'Bạc Liêu'],
    3: ['Đồng Nai', 'Cần Thơ', 'Sóc Trăng'],
    4: ['Tây Ninh', 'An Giang', 'Bình Thuận'],
    5: ['Vĩnh Long', 'Bình Dương', 'Trà Vinh'],
    6: ['Hồ Chí Minh', 'Long An', 'Bình Phước', 'Hậu Giang']
  },
  mt: {
    0: ['Khánh Hòa', 'Kon Tum', 'Thừa Thiên Huế'],
    1: ['Thừa Thiên Huế', 'Phú Yên'],
    2: ['Đắk Lắk', 'Quảng Nam'],
    3: ['Đà Nẵng', 'Khánh Hòa'],
    4: ['Bình Định', 'Quảng Trị', 'Quảng Bình'],
    5: ['Gia Lai', 'Ninh Thuận'],
    6: ['Đà Nẵng', 'Quảng Ngãi', 'Đắk Nông']
  }
};

export const ALL_STATIONS = {
  mn: [
    'Hồ Chí Minh', 'Đồng Tháp', 'Cà Mau', 'Bến Tre', 'Vũng Tàu', 'Bạc Liêu',
    'Đồng Nai', 'Cần Thơ', 'Sóc Trăng', 'Tây Ninh', 'An Giang', 'Bình Thuận',
    'Vĩnh Long', 'Bình Dương', 'Trà Vinh', 'Long An', 'Bình Phước', 'Hậu Giang',
    'Tiền Giang', 'Kiên Giang', 'Đà Lạt'
  ],
  mt: [
    'Thừa Thiên Huế', 'Phú Yên', 'Đắk Lắk', 'Quảng Nam', 'Đà Nẵng', 'Khánh Hòa',
    'Bình Định', 'Quảng Trị', 'Quảng Bình', 'Gia Lai', 'Ninh Thuận',
    'Quảng Ngãi', 'Đắk Nông', 'Kon Tum'
  ]
};

// Station aliases for OCR and search
export const STATION_ALIASES = {
  'Hồ Chí Minh': ['tp hcm', 'tphcm', 'tp.hcm', 'ho chi minh', 'hcm', 'sai gon'],
  'Đà Lạt': ['da lat', 'lam dong', 'dl'],
  'Thừa Thiên Huế': ['thua thien hue', 'tt hue', 'tth', 'hue'],
  'Đà Nẵng': ['da nang', 'dna', 'dng'],
  'Bình Dương': ['binh duong', 'bd'],
  'Bình Phước': ['binh phuoc', 'bp'],
  'Bà Rịa Vũng Tàu': ['vung tau', 'vt'],
  'Vũng Tàu': ['vung tau', 'vt'],
  'Bạc Liêu': ['bac lieu', 'bl'],
  'Bến Tre': ['ben tre', 'bt'],
  'Tiền Giang': ['tien giang', 'tg'],
  'Kiên Giang': ['kien giang', 'kg'],
  'Đồng Tháp': ['dong thap', 'dt'],
  'Cà Mau': ['ca mau', 'cm'],
  'Cần Thơ': ['can tho', 'ct'],
  'Đồng Nai': ['dong nai', 'dn'],
  'Sóc Trăng': ['soc trang', 'st'],
  'Tây Ninh': ['tay ninh', 'tn'],
  'An Giang': ['an giang', 'ag'],
  'Bình Thuận': ['binh thuan', 'bth'],
  'Vĩnh Long': ['vinh long', 'vl'],
  'Trà Vinh': ['tra vinh', 'tv'],
  'Long An': ['long an', 'la'],
  'Hậu Giang': ['hau giang', 'hg'],
  'Đắk Lắk': ['dak lak', 'dac lac', 'dlk'],
  'Quảng Nam': ['quang nam', 'qna', 'qnm'],
  'Khánh Hòa': ['khanh hoa', 'kh'],
  'Bình Định': ['binh dinh', 'bdi'],
  'Quảng Trị': ['quang tri', 'qt'],
  'Quảng Bình': ['quang binh', 'qb'],
  'Gia Lai': ['gia lai', 'gl'],
  'Ninh Thuận': ['ninh thuan', 'nt'],
  'Quảng Ngãi': ['quang ngai', 'qng'],
  'Đắk Nông': ['dak nong', 'dac nong', 'dno'],
  'Kon Tum': ['kon tum', 'kt'],
  'Phú Yên': ['phu yen', 'py']
};

/**
 * Remove Vietnamese accents and diacritics
 */
export function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

/**
 * Compute Levenshtein distance between two strings
 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Find station region ('mn' or 'mt')
 */
export function getRegionForStation(stationName) {
  if (ALL_STATIONS.mn.includes(stationName)) return 'mn';
  if (ALL_STATIONS.mt.includes(stationName)) return 'mt';
  return 'mn'; // default
}

/**
 * Get stations drawn on a given ISO date (YYYY-MM-DD)
 */
export function getStationsForDate(dateStr, region = 'mn') {
  if (!dateStr) return [];
  const parts = dateStr.split('-');
  const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const day = dt.getDay(); // 0 is Sunday
  return SCHEDULE[region]?.[day] || [];
}

/**
 * Match a 6-digit ticket against a station's day result.
 * 
 * Rules (Mệnh giá vé 10.000đ):
 * - G8: 2 số cuối trùng G8 (100k)
 * - G7: 3 số cuối trùng G7 (200k)
 * - G6: 4 số cuối trùng G6 (400k)
 * - G5: 4 số cuối trùng G5 (1tr)
 * - G4: 5 số cuối trùng G4 (3tr)
 * - G3: 5 số cuối trùng G3 (10tr)
 * - G2: 5 số cuối trùng G2 (15tr)
 * - G1: 5 số cuối trùng G1 (30tr)
 * - ĐB: trùng 6 số ĐB (2 tỷ)
 * - Phụ ĐB: trùng 5 số cuối ĐB nhưng sai chữ số đầu (50tr)
 * - Khuyến khích: sai đúng 1 chữ số bất kỳ ở bất kỳ hàng nào so với ĐB (ngoại trừ hàng đầu đã tính Phụ ĐB) (6tr)
 * - Phụ ĐB và Khuyến khích loại trừ nhau (vé sai đúng chữ số đầu chỉ tính Phụ ĐB)
 * - Một vé trúng nhiều giải -> cộng dồn
 * 
 * @param {string} ticket6 - 6-digit ticket number
 * @param {object} dayResult - { db, g1, g2, g3[], g4[], g5, g6[], g7, g8 }
 * @returns {Array<{prize: string, amount: number, name: string}>}
 */
export function matchTicket(ticket6, dayResult) {
  if (!ticket6 || !dayResult) return [];
  const ticket = String(ticket6).trim();
  if (!/^\d{6}$/.test(ticket)) return [];

  const matched = [];

  // G8: 2 digits
  if (dayResult.g8 && ticket.endsWith(dayResult.g8)) {
    matched.push({ prize: PRIZE.g8.code, amount: PRIZE.g8.amount, name: PRIZE.g8.name });
  }

  // G7: 3 digits
  if (dayResult.g7 && ticket.endsWith(dayResult.g7)) {
    matched.push({ prize: PRIZE.g7.code, amount: PRIZE.g7.amount, name: PRIZE.g7.name });
  }

  // G6: 4 digits (array of 3)
  if (Array.isArray(dayResult.g6)) {
    for (const num of dayResult.g6) {
      if (num && ticket.endsWith(num)) {
        matched.push({ prize: PRIZE.g6.code, amount: PRIZE.g6.amount, name: PRIZE.g6.name });
      }
    }
  }

  // G5: 4 digits
  if (dayResult.g5 && ticket.endsWith(dayResult.g5)) {
    matched.push({ prize: PRIZE.g5.code, amount: PRIZE.g5.amount, name: PRIZE.g5.name });
  }

  // G4: 5 digits (array of 7)
  if (Array.isArray(dayResult.g4)) {
    for (const num of dayResult.g4) {
      if (num && ticket.endsWith(num)) {
        matched.push({ prize: PRIZE.g4.code, amount: PRIZE.g4.amount, name: PRIZE.g4.name });
      }
    }
  }

  // G3: 5 digits (array of 2)
  if (Array.isArray(dayResult.g3)) {
    for (const num of dayResult.g3) {
      if (num && ticket.endsWith(num)) {
        matched.push({ prize: PRIZE.g3.code, amount: PRIZE.g3.amount, name: PRIZE.g3.name });
      }
    }
  }

  // G2: 5 digits
  if (dayResult.g2 && ticket.endsWith(dayResult.g2)) {
    matched.push({ prize: PRIZE.g2.code, amount: PRIZE.g2.amount, name: PRIZE.g2.name });
  }

  // G1: 5 digits
  if (dayResult.g1 && ticket.endsWith(dayResult.g1)) {
    matched.push({ prize: PRIZE.g1.code, amount: PRIZE.g1.amount, name: PRIZE.g1.name });
  }

  // ĐB, Phụ ĐB, Khuyến khích
  if (dayResult.db && dayResult.db.length === 6) {
    const db = dayResult.db;
    if (ticket === db) {
      matched.push({ prize: PRIZE.db.code, amount: PRIZE.db.amount, name: PRIZE.db.name });
    } else if (ticket.slice(1) === db.slice(1) && ticket[0] !== db[0]) {
      // Trùng 5 số cuối, sai số đầu tiên
      matched.push({ prize: PRIZE.phudb.code, amount: PRIZE.phudb.amount, name: PRIZE.phudb.name });
    } else {
      // Kiểm tra sai đúng 1 chữ số ở vị trí bất kỳ (vị trí khác 0)
      let diffCount = 0;
      for (let i = 0; i < 6; i++) {
        if (ticket[i] !== db[i]) {
          diffCount++;
        }
      }
      if (diffCount === 1) {
        matched.push({ prize: PRIZE.kk.code, amount: PRIZE.kk.amount, name: PRIZE.kk.name });
      }
    }
  }

  return matched;
}

/**
 * Parse OCR output into ticket number (6 digits), draw date (YYYY-MM-DD), and station name.
 * 
 * @param {object|string} ocrInput - Tesseract data ({ text, words, lines }) or raw text string
 * @param {object} [options] - Optional default date, default region, stations list
 * @returns {{ number: string|null, date: string|null, station: string|null, region: string }}
 */
export function parseTicketText(ocrInput, options = {}) {
  let fullText = '';
  let words = [];

  if (typeof ocrInput === 'string') {
    fullText = ocrInput;
  } else if (ocrInput && typeof ocrInput === 'object') {
    fullText = ocrInput.text || '';
    if (Array.isArray(ocrInput.words)) {
      words = ocrInput.words;
    }
  }

  // 1. Find 6-digit ticket number
  // Criteria: ^\d{6}$ with largest bbox.height; fallback to regex in text
  let bestNumber = null;
  let maxHeight = -1;

  if (words.length > 0) {
    for (const w of words) {
      if (!w || !w.text) continue;
      // Clean word text to check for 6-digit match
      const cleaned = w.text.trim().replace(/[^0-9]/g, '');
      if (/^\d{6}$/.test(cleaned)) {
        let height = 0;
        if (w.bbox) {
          height = (w.bbox.y1 != null && w.bbox.y0 != null)
            ? (w.bbox.y1 - w.bbox.y0)
            : (w.bbox.height || 0);
        }
        if (height > maxHeight) {
          maxHeight = height;
          bestNumber = cleaned;
        }
      }
    }
  }

  // Fallback if no 6-digit word with bbox
  if (!bestNumber) {
    const numMatches = fullText.match(/\b\d{6}\b/g);
    if (numMatches && numMatches.length > 0) {
      // Pick first prominent 6-digit number
      bestNumber = numMatches[0];
    }
  }

  // 2. Find date: \d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?
  let foundDate = null;
  const dateRegex = /(?:ng[aàáảãạăắằẳẵặâấầẩẫậ]y\s*)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/gi;
  let dateMatch;
  while ((dateMatch = dateRegex.exec(fullText)) !== null) {
    const d = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10);
    let y = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();

    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      if (y < 100) y += 2000;
      // Format as YYYY-MM-DD
      const mm = String(m).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      foundDate = `${y}-${mm}-${dd}`;
      break;
    }
  }

  // If no date found, fallback to options.defaultDate or today
  if (!foundDate && options.defaultDate) {
    foundDate = options.defaultDate;
  }

  // 3. Find station
  const normText = removeVietnameseTones(fullText).toLowerCase();
  let foundStation = null;

  // Compile all stations list, sorted by length descending so longer station names match first
  const allProvinces = [...ALL_STATIONS.mn, ...ALL_STATIONS.mt];
  allProvinces.sort((a, b) => b.length - a.length);

  // Phase 1: Direct match with whole words for normalized station names
  for (const st of allProvinces) {
    const normSt = removeVietnameseTones(st).toLowerCase();
    const regex = new RegExp('(?:^|[^a-z0-9])' + normSt.replace(/ /g, '\\s+') + '(?:$|[^a-z0-9])', 'i');
    if (regex.test(normText)) {
      foundStation = st;
      break;
    }
  }

  // Phase 2: Distinct multi-word aliases (e.g. 'tp hcm', 'tp.hcm', 'sai gon', 'lam dong')
  if (!foundStation) {
    const distinctAliases = {
      'Hồ Chí Minh': ['tp hcm', 'tphcm', 'tp.hcm', 'sai gon'],
      'Đà Lạt': ['lam dong'],
      'Thừa Thiên Huế': ['tt hue', 'tth']
    };
    for (const [st, list] of Object.entries(distinctAliases)) {
      for (const al of list) {
        const escaped = al.replace(/\./g, '\\.');
        const regex = new RegExp('(?:^|[^a-z0-9])' + escaped + '(?:$|[^a-z0-9])', 'i');
        if (regex.test(normText)) {
          foundStation = st;
          break;
        }
      }
      if (foundStation) break;
    }
  }

  // Phase 3: Fuzzy matching on sliding token window (Levenshtein distance <= 1)
  if (!foundStation) {
    const tokens = normText.split(/[^a-z0-9]+/).filter(t => t.length >= 2);
    outerFuzzy:
    for (const st of allProvinces) {
      const normSt = removeVietnameseTones(st).toLowerCase();
      const stWords = normSt.split(/\s+/);
      const wCount = stWords.length;
      if (tokens.length >= wCount) {
        for (let i = 0; i <= tokens.length - wCount; i++) {
          const slice = tokens.slice(i, i + wCount).join(' ');
          if (levenshtein(slice, normSt) <= 1) {
            foundStation = st;
            break outerFuzzy;
          }
        }
      }
    }
  }

  // Phase 4: Standalone short abbreviation codes (e.g. 'bp', 'la', 'dn')
  if (!foundStation) {
    // Only check short codes if preceded and followed by whitespace or punctuation
    for (const [st, aliases] of Object.entries(STATION_ALIASES)) {
      for (const al of aliases) {
        if (al.length === 2 && !['kt', 'xs', 'tn'].includes(al)) { // exclude ambiguous codes
          const regex = new RegExp(`\\b${al}\\b`, 'i');
          if (regex.test(normText)) {
            foundStation = st;
            break;
          }
        }
      }
      if (foundStation) break;
    }
  }

  // Fallback station: if not detected, suggest first station for day of week
  let region = 'mn';
  if (foundStation) {
    region = getRegionForStation(foundStation);
  } else {
    // Determine day of week from foundDate or today
    const targetDate = foundDate ? new Date(foundDate) : new Date();
    const day = isNaN(targetDate.getTime()) ? new Date().getDay() : targetDate.getDay();
    const defaultRegion = options.defaultRegion || 'mn';
    const dayStations = SCHEDULE[defaultRegion]?.[day] || [];
    if (dayStations.length > 0) {
      foundStation = dayStations[0];
      region = defaultRegion;
    } else {
      foundStation = 'Hồ Chí Minh';
      region = 'mn';
    }
  }

  return {
    number: bestNumber,
    date: foundDate,
    station: foundStation,
    region
  };
}

/**
 * Calculate lô tô Đầu / Đuôi matrix (0..9) for a station's results.
 * Each 2-digit ending from all prizes (18 numbers in MN/MT) is catalogued.
 * 
 * @param {object} stationResult - { db, g1, g2, g3[], g4[], g5, g6[], g7, g8 }
 * @returns {{ dau: object, duoi: object }}
 */
export function calculateLotto(stationResult) {
  const dau = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
  const duoi = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };

  if (!stationResult) return { dau, duoi };

  const allNumbers = [];
  if (stationResult.db) allNumbers.push(stationResult.db);
  if (stationResult.g1) allNumbers.push(stationResult.g1);
  if (stationResult.g2) allNumbers.push(stationResult.g2);
  if (Array.isArray(stationResult.g3)) allNumbers.push(...stationResult.g3);
  if (Array.isArray(stationResult.g4)) allNumbers.push(...stationResult.g4);
  if (stationResult.g5) allNumbers.push(stationResult.g5);
  if (Array.isArray(stationResult.g6)) allNumbers.push(...stationResult.g6);
  if (stationResult.g7) allNumbers.push(stationResult.g7);
  if (stationResult.g8) allNumbers.push(stationResult.g8);

  for (const num of allNumbers) {
    if (typeof num === 'string' && num.length >= 2) {
      const tail2 = num.slice(-2);
      const d = parseInt(tail2[0], 10);
      const e = parseInt(tail2[1], 10);
      if (!isNaN(d)) dau[d].push(tail2);
      if (!isNaN(e)) duoi[e].push(tail2);
    }
  }

  // Sort each list ascending
  for (let i = 0; i <= 9; i++) {
    dau[i].sort();
    duoi[i].sort();
  }

  return { dau, duoi };
}
