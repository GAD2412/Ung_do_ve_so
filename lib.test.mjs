import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchTicket,
  parseTicketText,
  calculateLotto,
  SCHEDULE,
  PRIZE,
  removeVietnameseTones,
  levenshtein
} from './lib.js';

// Sample drawing result for testing (from actual 2026-11-07 Bình Phước result)
const SAMPLE_BP_RESULT = {
  db: '508805',
  g1: '64229',
  g2: '75545',
  g3: ['06275', '35520'],
  g4: ['37465', '01695', '41507', '73219', '97075', '86244', '00262'],
  g5: '0819',
  g6: ['0656', '8893', '7360'],
  g7: '452',
  g8: '15'
};

describe('Lottery Matching Logic (matchTicket)', () => {
  it('Trúng Giải Tám (G8: 2 số cuối)', () => {
    const res = matchTicket('999915', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G8');
    assert.equal(res[0].amount, 100000);
  });

  it('Trúng Giải Bảy (G7: 3 số cuối)', () => {
    const res = matchTicket('999452', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G7');
    assert.equal(res[0].amount, 200000);
  });

  it('Trúng Giải Sáu (G6: 4 số cuối)', () => {
    const res = matchTicket('990656', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G6');
    assert.equal(res[0].amount, 400000);
  });

  it('Trúng Giải Năm (G5: 4 số cuối)', () => {
    const res = matchTicket('990819', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G5');
    assert.equal(res[0].amount, 1000000);
  });

  it('Trúng Giải Tư (G4: 5 số cuối)', () => {
    const res = matchTicket('937465', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G4');
    assert.equal(res[0].amount, 3000000);
  });

  it('Trúng Giải Ba (G3: 5 số cuối)', () => {
    const res = matchTicket('935520', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G3');
    assert.equal(res[0].amount, 10000000);
  });

  it('Trúng Giải Nhì (G2: 5 số cuối)', () => {
    const res = matchTicket('975545', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G2');
    assert.equal(res[0].amount, 15000000);
  });

  it('Trúng Giải Nhất (G1: 5 số cuối)', () => {
    const res = matchTicket('964229', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'G1');
    assert.equal(res[0].amount, 30000000);
  });

  it('Trúng Giải Đặc Biệt (ĐB: đúng 6 số)', () => {
    const res = matchTicket('508805', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'ĐB');
    assert.equal(res[0].amount, 2000000000);
  });

  it('Trúng Giải Phụ Đặc Biệt (Phụ ĐB: sai số đầu, trùng 5 số cuối)', () => {
    // ĐB là 508805, vé là 108805: sai số đầu 1 != 5, trùng 08805
    const res = matchTicket('108805', SAMPLE_BP_RESULT);
    assert.equal(res.length, 1);
    assert.equal(res[0].prize, 'Phụ ĐB');
    assert.equal(res[0].amount, 50000000);
    // Lưu ý: Phụ ĐB và Khuyến khích loại trừ nhau, không được cộng thêm KK
    const hasKK = res.some(p => p.prize === 'Khuyến khích');
    assert.equal(hasKK, false);
  });

  it('Trúng Giải Khuyến Khích (sai đúng 1 chữ số bất kỳ khác số đầu)', () => {
    // ĐB là 508805.
    // Ghi chú luật: Theo quy định Bộ Tài chính, giải Khuyến khích dành cho vé sai 1 chữ số
    // ở bất kỳ hàng nào so với Giải Đặc Biệt (ngoại trừ sai hàng trăm nghìn đã trúng Phụ ĐB).
    
    // Ca 1: Sai chữ số hàng chục nghìn (vị trí 1): '9' thay vì '0'
    const res1 = matchTicket('598805', SAMPLE_BP_RESULT);
    assert.equal(res1.length, 1);
    assert.equal(res1[0].prize, 'Khuyến khích');
    assert.equal(res1[0].amount, 6000000);

    // Ca 2: Sai chữ số hàng đơn vị (vị trí 5): '9' thay vì '5'
    const res2 = matchTicket('508809', SAMPLE_BP_RESULT);
    assert.equal(res2.length, 1);
    assert.equal(res2[0].prize, 'Khuyến khích');
    assert.equal(res2[0].amount, 6000000);
  });

  it('Trúng nhiều giải cùng lúc (cộng dồn giải thưởng)', () => {
    // Thiết lập kết quả mẫu nơi số đuôi trùng nhiều giải:
    // Ví dụ G8 là '05' và G7 là '805'
    const multiResult = {
      ...SAMPLE_BP_RESULT,
      g8: '05',
      g7: '805'
    };
    // Vé '999805' trúng cả G7 (805) và G8 (05)
    const res = matchTicket('999805', multiResult);
    assert.equal(res.length, 2);
    const prizes = res.map(r => r.prize).sort();
    assert.deepEqual(prizes, ['G7', 'G8']);
    const totalAmount = res.reduce((sum, r) => sum + r.amount, 0);
    assert.equal(totalAmount, 300000); // 200k + 100k
  });

  it('Trúng Giải Đặc Biệt kèm Giải Tám (cộng dồn)', () => {
    // Nếu ĐB là 508815 và G8 là 15:
    const customResult = {
      ...SAMPLE_BP_RESULT,
      db: '508815',
      g8: '15'
    };
    const res = matchTicket('508815', customResult);
    assert.equal(res.length, 2);
    const prizes = res.map(r => r.prize).sort();
    assert.deepEqual(prizes, ['G8', 'ĐB']);
    const totalAmount = res.reduce((sum, r) => sum + r.amount, 0);
    assert.equal(totalAmount, 2000100000);
  });

  it('Vé trượt (không trùng giải nào)', () => {
    const res = matchTicket('000000', SAMPLE_BP_RESULT);
    assert.equal(res.length, 0);
  });

  it('Input validation (vé không hợp lệ)', () => {
    assert.deepEqual(matchTicket('', SAMPLE_BP_RESULT), []);
    assert.deepEqual(matchTicket('12345', SAMPLE_BP_RESULT), []);
    assert.deepEqual(matchTicket('1234567', SAMPLE_BP_RESULT), []);
    assert.deepEqual(matchTicket('abcdef', SAMPLE_BP_RESULT), []);
    assert.deepEqual(matchTicket('508805', null), []);
  });
});

describe('OCR Ticket Parser (parseTicketText)', () => {
  it('Trích xuất số vé, ngày, đài từ chuỗi có nhiễu', () => {
    const noisyText = `
      CÔNG TY TNHH MTV XỔ SỐ KIẾN THIẾT BÌNH PHƯỚC
      Vé số truyền thống - Mệnh giá 10.000đ
      Ký hiệu: 11K2 - Seri: A938
      NGÀY XỔ SỐ: 07/11/2026 (Thứ Bảy)
      === SỐ DỰ THƯỞNG ===
      508805
      Kính chúc Quý khách may mắn phát tài!
      Hotline: 0271.3888888
    `;
    const parsed = parseTicketText(noisyText);
    assert.equal(parsed.number, '508805');
    assert.equal(parsed.date, '2026-11-07');
    assert.equal(parsed.station, 'Bình Phước');
    assert.equal(parsed.region, 'mn');
  });

  it('Chọn số 6 chữ số có bbox.height lớn nhất (số to in trên vé)', () => {
    const ocrData = {
      text: 'Mã seri 123456 Số dự thưởng 789012 Bến Tre 03/11/2026',
      words: [
        { text: 'Mã', bbox: { y0: 10, y1: 25, height: 15 } },
        { text: 'seri', bbox: { y0: 10, y1: 25, height: 15 } },
        { text: '123456', bbox: { y0: 10, y1: 24, height: 14 } }, // Mã số nhỏ
        { text: 'Số', bbox: { y0: 100, y1: 130, height: 30 } },
        { text: '789012', bbox: { y0: 140, y1: 200, height: 60 } }, // Dãy số dự thưởng in to
        { text: 'Bến', bbox: { y0: 210, y1: 230, height: 20 } },
        { text: 'Tre', bbox: { y0: 210, y1: 230, height: 20 } },
        { text: '03/11/2026', bbox: { y0: 240, y1: 260, height: 20 } }
      ]
    };
    const parsed = parseTicketText(ocrData);
    assert.equal(parsed.number, '789012');
    assert.equal(parsed.station, 'Bến Tre');
    assert.equal(parsed.date, '2026-11-03');
    assert.equal(parsed.region, 'mn');
  });

  it('Nhận diện đài viết tắt hoặc không dấu', () => {
    const raw1 = 'XSKT TP.HCM NGAY 07/11/2026 VE 274588';
    const parsed1 = parseTicketText(raw1);
    assert.equal(parsed1.station, 'Hồ Chí Minh');
    assert.equal(parsed1.number, '274588');

    const raw2 = 'XO SO DA NANG 07-11-2026 399936';
    const parsed2 = parseTicketText(raw2);
    assert.equal(parsed2.station, 'Đà Nẵng');
    assert.equal(parsed2.region, 'mt');
  });

  it('Fuzzy matching khi tên đài bị lỗi 1 ký tự OCR', () => {
    // "Binh Phuox" thay vì "Binh Phuoc" (Levenshtein distance = 1)
    const raw = 'XSKT Binh Phuox NGAY 07/11/2026 VE 508805';
    const parsed = parseTicketText(raw);
    assert.equal(parsed.station, 'Bình Phước');
  });
});

describe('Lô Tô Đầu / Đuôi (calculateLotto)', () => {
  it('Tính đúng đầu đuôi cho các số giải', () => {
    const lotto = calculateLotto(SAMPLE_BP_RESULT);
    // Kiểm tra đầu 0..9 và đuôi 0..9 đều tồn tại
    for (let i = 0; i <= 9; i++) {
      assert.ok(Array.isArray(lotto.dau[i]));
      assert.ok(Array.isArray(lotto.duoi[i]));
    }
    // G8 là 15 -> đầu 1 phải có '15', đuôi 5 phải có '15'
    assert.ok(lotto.dau[1].includes('15'));
    assert.ok(lotto.duoi[5].includes('15'));

    // ĐB là 508805 -> đuôi 2 số là 05 -> đầu 0 có '05', đuôi 5 có '05'
    assert.ok(lotto.dau[0].includes('05'));
    assert.ok(lotto.duoi[5].includes('05'));
  });
});

describe('Schedule and Station Verification', () => {
  it('SCHEDULE có đầy đủ 7 ngày cho cả MN và MT', () => {
    for (let day = 0; day <= 6; day++) {
      assert.ok(SCHEDULE.mn[day].length >= 3, `MN ngày ${day} phải có ít nhất 3 đài`);
      assert.ok(SCHEDULE.mt[day].length >= 2, `MT ngày ${day} phải có ít nhất 2 đài`);
    }
  });
});
