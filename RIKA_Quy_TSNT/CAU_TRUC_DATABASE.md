

# DATABASE SCHEMA SPECIFICATION (MONGODB)
**Project Name:** RiKa Portal System
**Database Type:** NoSQL (MongoDB)
**Design Patterns:** Embedding (Nhúng), Extended Reference (Tham chiếu mở rộng), Polymorphism (Đa hình).

---

## I. MODULE IAM (QUẢN LÝ NGƯỜI DÙNG)

### 1. Collection: `users`
**Công dụng:** Lưu trữ thông tin đăng nhập và hồ sơ cá nhân. Profile được nhúng trực tiếp để tối ưu hóa hiệu năng đọc (1 query lấy được hết thông tin).

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `username` | String | Tên đăng nhập | Unique, Index |
| `email` | String | Email | Unique, Index |
| `password` | String | Hash mật khẩu | Select: false (Ẩn mặc định) |
| `roles` | Array\<String\> | Danh sách quyền | VD: `['admin', 'editor']` |
| `status` | String | Trạng thái | `active`, `banned`, `pending` |
| `profile` | Object | **Embedded Document** | Chứa thông tin chi tiết |
| `profile.full_name`| String | Họ và tên | |
| `profile.avatar` | String | URL ảnh đại diện | |
| `profile.phone` | String | Số điện thoại | |
| `profile.identity` | String | CCCD/CMND | Dùng cho module Tài chính |
| `social_auth` | Array\<Object\>| Tài khoản MXH | |
| `created_at` | Date | Ngày tạo | |

**Mối quan hệ:**
* **1-1 (Embedded):** Profile nằm trong User.
* **1-N:** User là tác giả của nhiều Article, Comment, Transaction.

---

## II. MODULE CMS (TIN TỨC & NỘI DUNG)

### 2. Collection: `categories`
**Công dụng:** Cây thư mục phân loại nội dung. Hỗ trợ đa cấp.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `name` | String | Tên danh mục | |
| `slug` | String | Đường dẫn tĩnh | Unique, Index |
| `type` | String | Loại danh mục | `news`, `forum`, `document` |
| `parent_id` | ObjectId | Danh mục cha | **Ref:** `categories` |
| `ancestors` | Array\<ObjectId\>| Danh sách tổ tiên | Dùng để query cây thư mục nhanh |

### 3. Collection: `articles`
**Công dụng:** Lưu trữ bài viết tin tức. Sử dụng pattern "Snapshot Author" để giảm lookup.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `title` | String | Tiêu đề bài viết | Text Index (Search) |
| `slug` | String | Đường dẫn tĩnh | Unique |
| `content` | String | Nội dung HTML | |
| `thumbnail` | String | Ảnh đại diện | |
| `author` | Object | **Snapshot** | Lưu cứng thông tin tác giả |
| `author._id` | ObjectId | ID tác giả | **Ref:** `users` |
| `author.name` | String | Tên hiển thị | |
| `category` | ObjectId | Danh mục | **Ref:** `categories` |
| `tags` | Array\<String\> | Thẻ bài viết | Index |
| `status` | String | Trạng thái | `draft`, `published`, `archived` |
| `stats` | Object | Thống kê | `views`, `likes`, `comments` (Counter) |

**Mối quan hệ:**
* **N-1:** Nhiều bài viết thuộc 1 Category.
* **N-1:** Nhiều bài viết thuộc 1 User.

---

## III. MODULE FORUM (DIỄN ĐÀN & TƯƠNG TÁC)

### 4. Collection: `forum_threads`
**Công dụng:** Các chủ đề thảo luận trên diễn đàn.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `title` | String | Tiêu đề Thread | |
| `content` | String | Nội dung | |
| `author` | Object | **Snapshot** | Giống bảng `articles` |
| `category` | ObjectId | Chuyên mục | **Ref:** `categories` |
| `is_sticky` | Boolean | Ghim bài | |
| `last_reply_at`| Date | Thời gian trả lời cuối | Dùng để sort Thread |
| `stats` | Object | Thống kê | `replies_count`, `views_count` |

### 5. Collection: `comments`
**Công dụng:** Lưu bình luận cho cả Tin tức và Diễn đàn (Đa hình).

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `user` | Object | **Snapshot** | Tên & Avatar người comment |
| `content` | String | Nội dung | |
| `target_model` | String | Loại đối tượng | `Article` hoặc `ForumThread` |
| `target_id` | ObjectId | ID đối tượng | **Polymorphic Ref** |
| `parent_id` | ObjectId | ID comment cha | Dùng để trả lời (Reply) |
| `is_approved` | Boolean | Trạng thái duyệt | |

### 6. Collection: `reactions`
**Công dụng:** Lưu lượt Like/Tim/Haha.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `user_id` | ObjectId | Người thả tim | **Ref:** `users` |
| `type` | String | Loại cảm xúc | `like`, `love`, `angry`... |
| `target_model` | String | Loại đối tượng | `Article`, `ForumThread`, `Comment` |
| `target_id` | ObjectId | ID đối tượng | **Polymorphic Ref** |

---

## IV. MODULE FINANCE (TÀI CHÍNH & KẾ TOÁN)
**Quan trọng:** Tất cả các trường tiền tệ PHẢI dùng kiểu dữ liệu `Decimal128` để đảm bảo độ chính xác tuyệt đối.

### 7. Collection: `funds`
**Công dụng:** Quản lý các ví tiền/sổ quỹ.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `name` | String | Tên quỹ | VD: Quỹ Học Bổng 2024 |
| `balance` | Decimal128 | Số dư hiện tại | **Critical Data** |
| `currency` | String | Đơn vị tiền tệ | Default: 'VND' |
| `account_num` | String | Số tài khoản NH | |

### 8. Collection: `finance_transactions`
**Công dụng:** Nhật ký giao dịch thu/chi (Ledger).

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `fund_id` | ObjectId | Quỹ liên quan | **Ref:** `funds` |
| `user_id` | ObjectId | Người thực hiện | **Ref:** `users` |
| `type` | String | Loại giao dịch | `income` (Thu), `expense` (Chi) |
| `amount` | Decimal128 | Số tiền | |
| `desc` | String | Diễn giải | |
| `status` | String | Trạng thái | `pending`, `completed`, `rejected` |
| `invoice` | Object | **Embedded Invoice** | Thông tin hóa đơn |
| `invoice.url` | String | Ảnh hóa đơn | |
| `invoice.code` | String | Mã số thuế/Số HĐ | |
| `ref_obj` | Object | Tham chiếu nghiệp vụ | |
| `ref_obj.model`| String | Nguồn gốc | VD: `ScholarshipApplication` |
| `ref_obj.id` | ObjectId | ID nguồn gốc | Link tới đơn xin học bổng |

---

## V. MODULE SCHOLARSHIP (HỌC BỔNG)

### 9. Collection: `scholarships`
**Công dụng:** Các đợt mở xét tuyển học bổng.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `name` | String | Tên đợt | |
| `budget` | Decimal128 | Ngân sách dự kiến | |
| `criteria` | Array\<Object\>| **Embedded Config** | Cấu hình tiêu chí chấm điểm |
| `criteria.key` | String | Mã tiêu chí | VD: `gpa` |
| `criteria.weight`| Number | Trọng số (%) | VD: 30% |

### 10. Collection: `scholarship_applications`
**Công dụng:** Đơn ứng tuyển của sinh viên. Schema linh hoạt (Flexible).

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `scholarship_id`| ObjectId | Đợt học bổng | **Ref:** `scholarships` |
| `user_id` | ObjectId | Người nộp đơn | **Ref:** `users` |
| `status` | String | Trạng thái | `submitted`, `approved`... |
| `data` | Object | **Dynamic Data** | Lưu dữ liệu form (Linh hoạt) |
| `review` | Object | Kết quả chấm | |
| `review.score` | Number | Điểm số | |
| `review.note` | String | Nhận xét giám khảo | |

---

## VI. MODULE SYSTEM (HỆ THỐNG)

### 11. Collection: `system_settings`
**Công dụng:** Lưu cấu hình key-value cho toàn trang.

| Field | Type | Description | Ghi chú |
| :--- | :--- | :--- | :--- |
| `key` | String | Khóa cấu hình | Unique (VD: `site_logo`) |
| `value` | Mixed | Giá trị | String, Number hoặc JSON |
| `group` | String | Nhóm cấu hình | `general`, `smtp`, `payment` |

### 12. Collection: `media_files`
**Công dụng:** Quản lý tập trung file upload.

| Field | Type | Description | Ghi chú / Quan hệ |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `url` | String | Đường dẫn file | |
| `type` | String | Loại file | `image/png`, `video/mp4` |
| `uploader` | ObjectId | Người upload | **Ref:** `users` |

### 13. Collection: `audit_logs`
**Công dụng:** Lưu vết hành động hệ thống.

| Field | Type | Description | Ghi chú |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | |
| `actor` | ObjectId | Người thực hiện | **Ref:** `users` |
| `action` | String | Hành động | `update`, `delete` |
| `collection` | String | Tên bảng bị tác động| |
| `target_id` | ObjectId | ID dòng bị tác động | |
| `changes` | Object | Thay đổi | `{ old: ..., new: ... }` |
| `created_at` | Date | Thời gian | **TTL Index:** Tự xóa sau 1 năm |



IV. Lập trình quản trị Back-End				
1	Database	                            Lập trình Cơ sở dữ liệu Website		
2	Website/ App Admin	                       "Cấu hình Trình Quản trị Website
                                                    • Lập trình khung Quản trị theo Sitemap App
                                                    • Xây dựng hệ thống menu, header, footer,...
                                                    • Lập trình hệ thống API
                                                    • Lập trình hệ thống xử lý media (hình ảnh, ảnh động, video,...)"	


3	Module Quản lý thành viên	                Quản lý thông tin thành viên (các trường thông tin)		
		                                        Chức năng tìm kiếm, lọc và phân loại thành viên		
		                                        Chức năng xuất / nhập danh sách lớn (theo file excel)		
		                                        Chức năng theo dõi lịch sử hoạt động của thành viên		
		                                        Chức năng Thêm/Sửa/Xóa/Phân quyền thành viên	


                                                	
8	Module Quản lý tin tức	                    Quản lý danh sách tin bài chi tiết		
		                                        Chức năng Thêm / Sửa / Xóa tin bài - Trình biên tập richtext		
		                                        Chức năng sắp xếp / quản lý phân phối tin tức (Ấn hiện, logic hiển thị, highlight, sắp xếp thứ tự,...)		
                                        		Chức năng Quản lý danh mục phân loại tin bài		
                                            	Chức năng Tìm kiếm và truy xuất tin tức		

13	Module Diễn đàn	                            Chức năng Bình luận & Tương tác các bài viết		
                                        		Các tính năng diễn đàn cơ bản (lọc, tìm kiếm, siêu liên kết user,...)		
                                            	Hệ thống tự động lọc ngôn từ & thông tin phản biện độc hại		
                                        		Trình tìm kiếm tin bài đa biến (nội dung, tác giả, ngày tháng,...)		
17	Module Quản trị & Phê duyệt	                Hệ thống theo dõi và phê duyệt tin bài của Ban biên tập /                                                                           Thành                                                                                     viên		
                                            	Lập trình các tính năng logic Thông báo hệ thống		
19	Module Kế toán	                            Quản lý nguồn thu / chi của quỹ (ghi nhận, phân loại và theo dõi các khoản quyên góp và chi tiêu)		
                                        		Lập và quản lý danh sách phiếu / hóa đơn thu - chi		
                                        		Tìm kiếm, tra cứu danh sách phiếu / hóa đơn thu - chi		
                                        		Quản lý danh mục sổ quỹ		
                                        		Theo dõi và đối soát công nợ		
                                        		Kết xuất báo cáo


25	Module Đánh giá học bổng	                Quản lý danh sách học bổng		
                                            	Trình quản lý các tiêu chí đánh giá học bổng		
                                            	Tìm kiếm & lọc danh sách học bổng		
                                        		Chức năng nhập / xuất danh sách học bổng		
                                        		Lập trình logic đánh giá và xét duyệt học bổng		
                                        		Thông báo và trạng thái xét duyệt học bổng qua email		
                                        		Báo cáo và kết xuất dữ liệu		

                                                
32	Module Quản lý Admin	                    Thêm / Sửa / Xóa danh sách quản trị viên		
                                        		Quản lý phân quyền quản trị viên		
                                            	Tích hợp đồng bộ Thu - Chi	Đọc - Theo dõi - Cập nhật biến động số dư trên Website realtime		Theo danh mục số tài khoản
                                                Hệ thống API kết nối với ngân hàng hoặc đối tác Seapay		Tùy chọn giải pháp
36	Module Quản lý Menu	                        Chức năng quản lý & phân phối tầng thư mục / danh mục tin tức		

37	Moduel Quản lý thông tin tĩnh	            Chức năng quản lý & chỉnh sửa thông tin tĩnh toàn trang	

38	Module Báo cáo	                            Dashboard báo cáo chung của hệ thống		

39	QA (Test)	                                Kiểm thử tính năng, performance, cân bằng tải,...		
40		                                        Kiểm thử Penetration		