# Sổ Xố Bỏ Túi 🎟️

PWA dò vé số cá nhân nhanh gọn, miễn phí, hỗ trợ đầy đủ 21 đài Miền Nam và 14 đài Miền Trung, hoạt động mượt mà cả khi offline.

## ✨ Tính năng v1
- 🎯 **Dò số bằng tay:** Gợi ý đài theo thứ trong tuần, bàn phím nhập 6 số to rõ, thông báo kết quả chi tiết từng giải trúng hoặc vé trượt kèm đối chiếu giải Đặc Biệt.
- 📷 **Quét vé bằng camera (OCR):** Chụp trực tiếp từ camera hoặc chọn ảnh từ thư viện, sử dụng Tesseract.js (được tối ưu whitelist số và chữ cái). **Luôn hiển thị form xác nhận cho phép sửa tay trước khi dò** (đảm bảo độ chính xác ngay cả với vé hoa văn).
- 💼 **Ví vé cá nhân (localStorage):** Tự động dò lại tất cả vé đã lưu mỗi khi mở app, gắn nhãn trạng thái trực quan: *Trúng X đ* / *Chưa trúng* / *Chờ quay*. Vé được lưu hoàn toàn trên trình duyệt của bạn (không gửi đi máy chủ nào).
- 📊 **Bảng kết quả & Lô tô:** Tra cứu kết quả đầy đủ (ĐB đến G8) theo từng đài và ngày, tích hợp bảng **Lô tô Đầu / Đuôi (0–9)** nhanh chóng.
- 📱 **PWA & Offline-ready:** Cài đặt lên màn hình chính điện thoại như ứng dụng native, Service Worker cache app shell và áp dụng Network-First cho dữ liệu kết quả.

## 🛠️ Cấu trúc dự án
```
Ung_do_ve_so/
├── index.html                  # UI 4 tab (Dò số | Quét | Ví | Kết quả), vanilla JS module
├── lib.js                      # Thuần hàm: matchTicket, parseTicketText, SCHEDULE, PRIZE, calculateLotto
├── lib.test.mjs                # Bộ unit tests cho luật dò giải + OCR parser
├── sw.js                       # Service Worker: offline caching & Network-First cho results.json
├── manifest.webmanifest        # Cấu hình PWA cài lên màn hình chính
├── icon.svg                    # App icon sắc nét chuẩn vector
├── data/results.json           # Dữ liệu kết quả xổ số (giữ ~45 ngày gần nhất)
├── scripts/crawl.py            # Crawler stdlib-only: fetch RSS xskt.com.vn, validate, merge JSON
├── scripts/test-e2e.mjs        # Bộ kiểm thử tự động E2E qua Chrome CDP
└── .github/workflows/crawl.yml # GitHub Actions cron tự động cào kết quả mỗi 15 phút (16:45–18:45 VN)
```

## 🧪 Chạy kiểm thử
1. **Chạy Unit Test:**
   ```bash
   node --test lib.test.mjs
   ```
2. **Chạy Crawler cập nhật dữ liệu:**
   ```bash
   python3 scripts/crawl.py
   ```
3. **Chạy End-to-End Test (Chrome headless CDP):**
   ```bash
   node scripts/test-e2e.mjs
   ```
