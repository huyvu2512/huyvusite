<div align="center">
  <img width="120" height="120" alt="Logo" src="https://lichnghi.vercel.app/logo.png" />

  <h1>HUYVU2512 – Công cụ cá nhân</h1>

  <p>Tập hợp các công cụ tiện ích giúp sinh viên quản lý thời gian, tài chính và lịch học hiệu quả.</p>

  <a href="https://lichnghi.vercel.app/">🌐 Live Demo</a> &nbsp;|&nbsp;
  <a href="#tính-năng">✨ Tính năng</a> &nbsp;|&nbsp;
  <a href="#chạy-locally">🚀 Cài đặt</a>
</div>

---

## ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🏠 **Trang chủ** | Dashboard tổng quan với đồng hồ thực, thời tiết và đếm ngược ngày lễ |
| 📅 **Lịch nghỉ** | Lịch nghỉ lễ Việt Nam, theo dõi lịch học theo tuần |
| 💰 **Chi tiêu** | Quản lý sinh hoạt phí, chi phí cố định và chi phí nước điện |
| ⚽ **Bóng đá** | Xem lịch thi đấu bóng đá |
| 📚 **Học tập** | Hỗ trợ học tập, AI Code Doctor tích hợp Gemini AI |
| 🎬 **YouTube Tools** | Công cụ hỗ trợ xử lý video YouTube |

## 🛠️ Công nghệ

- **Frontend:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`)
- **Deploy:** Vercel + Vercel Analytics

## 🚀 Chạy Locally

**Yêu cầu:** Node.js >= 18

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env.local và thêm Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 3. Chạy dev server
npm run dev
```

Truy cập `http://localhost:5173` trên trình duyệt.

## 📦 Build & Deploy

```bash
# Build production
npm run build

# Preview bản build
npm run preview
```

Deploy tự động lên Vercel khi push lên nhánh `main`.

## 📁 Cấu trúc thư mục

```
huyvusite/
├── components/          # React components
│   ├── TrangChu/        # Trang chủ
│   ├── LichNghi/        # Lịch nghỉ lễ
│   ├── ChiTieu/         # Quản lý chi tiêu
│   ├── BongDa/          # Lịch bóng đá
│   ├── HocTap/          # Học tập
│   └── Common/          # Components dùng chung
├── hooks/               # Custom React hooks
├── public/              # Static assets
├── App.tsx              # Root component
├── index.html           # Entry HTML
└── vite.config.ts       # Cấu hình Vite
```

---

<div align="center">
  Made with ❤️ by <strong>HuyVu2512</strong>
</div>
