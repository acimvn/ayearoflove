# Triển khai Vòng Tròn Phép Màu

## Phần Firebase (console.firebase.google.com)
1. Tạo dự án mới.
2. Thêm Web app (biểu tượng </>), copy đoạn `firebaseConfig`.
3. Authentication → bật **Email/Password**.
4. Firestore Database → Create database → vị trí **asia-southeast1**, chế độ production.
5. Project settings → Cloud Messaging → Web Push certificates → **Generate key pair**, copy khoá.
6. Firestore Database → tab **Rules** → dán nội dung tệp `firestore.rules` (đã thay EMAIL_CUA_BAN bằng email của bạn) → **Publish**.
7. Project settings → **Service accounts** → **Generate new private key** → tải về tệp .json. Giữ tệp này kín, không gửi cho ai.

## Phần GitHub (github.com)
1. Tạo repository mới, đặt tên `vong-tron-phep-mau`, chọn **Public**.
2. Chọn **uploading an existing file**, kéo thả toàn bộ tệp và thư mục của app vào, bấm **Commit changes**.
3. Mở tệp `config.js` → biểu tượng bút chì → dán thông tin firebaseConfig và khoá Web Push → **Commit changes**.
4. Settings → Pages → Source: **Deploy from a branch** → Branch **main**, thư mục **/(root)** → Save.
   Link app: `https://TEN-GITHUB.github.io/vong-tron-phep-mau/`
5. Settings → Secrets and variables → Actions → **New repository secret**.
   Name: `FIREBASE_SERVICE_ACCOUNT`. Secret: mở tệp .json bằng Notepad/TextEdit, copy toàn bộ, dán vào.
6. Tab **Actions** → **set up a workflow yourself** → đặt tên `nhac-nho.yml` → dán nội dung tệp `huong-dan/nhac-nho.yml` → **Commit changes**.
   Thử: Actions → Gửi nhắc nhở → **Run workflow**. Dấu tích xanh là chạy được.

## Bắt đầu dùng
1. Mở link app, chọn **Tạo tài khoản** bằng đúng email đã ghi trong Rules. Ô Mã nhóm để trống.
2. Vào **Cài đặt** → đặt **Mã nhóm**.
3. Gửi link app và mã nhóm cho học viên.

## Lưu ý
- Nhắc nhở tính theo giờ Việt Nam. GitHub có thể gửi trễ 5–15 phút so với giờ hẹn.
- Video ghi hình: đưa lên YouTube (chế độ không công khai) hoặc Google Drive, rồi dán link vào buổi học.
- Muốn thêm người cùng quản lý: thêm email của họ vào danh sách trong Rules.
