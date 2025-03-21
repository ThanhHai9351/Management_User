# User Management System

Hệ thống quản lý người dùng với đầy đủ tính năng xác thực và quản lý tài khoản, được xây dựng bằng Next.js và NestJS.

## Tính năng chính

### 🔐 Xác thực & Phân quyền
- Đăng nhập/Đăng ký tài khoản
- Xác thực JWT (JSON Web Token)
- Phân quyền người dùng (Admin/User)
- Quên mật khẩu và khôi phục tài khoản
- Xác thực 2 lớp (2FA) với email

### 👤 Quản lý người dùng (CRUD)
- Tạo tài khoản mới
- Xem thông tin tài khoản
- Cập nhật thông tin cá nhân
- Xóa tài khoản
- Quản lý danh sách người dùng (Admin)

### 📧 Hệ thống Email
- Gửi email xác thực tài khoản
- Email thông báo đăng nhập mới
- Email khôi phục mật khẩu
- Tùy chỉnh template email

## Công nghệ sử dụng

### Frontend (Next.js)
- Next.js 15.2.3 với App Router
- TypeScript
- Tailwind CSS
- Antd
- React Hook Form
- Zod validation

### Backend (NestJS)
- NestJS 11.0.12
- TypeScript
- MongoDb
- JWT Authentication
- Passport.js
- Nodemailer
- Class Validator
- Postman API

## Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 16+
- MongoDB
- npm/yarn/pnpm

### Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu
cp .env.example .env


# Khởi động server
npm run start:dev
```

### Frontend
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local từ mẫu
cp .env.example .env.local

# Khởi động development server
npm run dev
```

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Cấu trúc Database

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Môi trường Development

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

MIT License - Hari.
