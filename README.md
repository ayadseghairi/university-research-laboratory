# University Research Laboratory

نظام لإدارة ميزانية مختبر/فريق بحثي، يتكون من واجهة أمامية بـ Next.js وخادم خلفي بـ Express وPrisma مع PostgreSQL.

مستودع المشروع على GitHub: https://github.com/ayadseghairi/university-research-laboratory

## المتطلبات الأساسية

- Node.js 18 أو أحدث
- npm
- PostgreSQL 14 أو أحدث
- Git لتنزيل المشروع

## تنزيل المشروع

```bash
git clone https://github.com/ayadseghairi/university-research-laboratory.git
cd university-research-laboratory
```

## تثبيت المتطلبات

ثبّت الحزم في كل جزء من المشروع على حدة:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## إعداد قاعدة البيانات

1. أنشئ قاعدة بيانات PostgreSQL جديدة، مثل `labbudget_db`.
2. أنشئ مستخدمًا وصلاحيات مناسبة إذا كنت تستخدم قاعدة بيانات محلية أو خادمًا منفصلًا.
3. أنشئ ملف البيئة `backend/.env` وضع فيه القيم المناسبة.

مثال عملي:

```env
DATABASE_URL="postgresql://labbudget_user:your_secure_password@localhost:5432/labbudget_db"
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
JWT_EXPIRATION=24h
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

إذا أردت ربط الواجهة الأمامية بعنوان API مختلف في بيئة الإنتاج، اضبط:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## تشغيل قاعدة البيانات

هذا المشروع يعتمد على PostgreSQL فقط. بعد تجهيز القاعدة وملف `.env`، طبّق الترحيلات من مجلد `backend`:

```bash
cd backend
npx prisma migrate dev
```

إذا أردت فتح Prisma Studio:

```bash
npx prisma studio
```

ولإعادة ضبط قاعدة البيانات في بيئة التطوير:

```bash
npx prisma migrate reset
```

## التشغيل في بيئة التطوير

شغّل الخادم الخلفي أولًا:

```bash
cd backend
npm run dev
```

ثم شغّل الواجهة الأمامية في نافذة طرفية ثانية:

```bash
cd frontend
npm run dev
```

- الخادم الخلفي يعمل افتراضيًا على `http://localhost:5000`
- الواجهة الأمامية تعمل افتراضيًا على `http://localhost:3000`
- فحص الصحة متاح عبر `GET /api/health`

## البناء والتشغيل في الإنتاج

### بناء وتشغيل الخلفية

```bash
cd backend
npm run build
npm start
```

### بناء وتشغيل الواجهة الأمامية

```bash
cd frontend
npm run build
npm start
```

## أوامر مفيدة

### Backend

- `npm run dev` لتشغيل الخادم بوضع التطوير
- `npm run build` لبناء TypeScript
- `npm start` لتشغيل النسخة المبنية
- `npm run db:migrate` لتطبيق الترحيلات
- `npm run db:seed` لتشغيل ملف seed
- `npm run db:studio` لفتح Prisma Studio
- `npm run db:reset` لإعادة ضبط قاعدة البيانات

### Frontend

- `npm run dev` لتشغيل الواجهة بوضع التطوير
- `npm run build` لبناء تطبيق Next.js
- `npm start` لتشغيل النسخة المبنية

## بنية المشروع

- `backend/` يحتوي على API، Prisma، وقاعدة البيانات
- `frontend/` يحتوي على واجهة Next.js
- `backend/uploads/` لتخزين الملفات المرفوعة

## ملاحظات تشغيل

- تأكد من أن PostgreSQL يعمل قبل تشغيل الترحيلات أو الخادم الخلفي.
- تأكد من تطابق قيمة `CORS_ORIGIN` مع عنوان الواجهة الأمامية.
- إذا استخدمت اسم مضيف أو منفذ مختلفين، حدّث `.env` و`NEXT_PUBLIC_API_URL` وفقًا لذلك.
