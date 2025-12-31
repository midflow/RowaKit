# RowaKit Table – Product Lifecycle & Scope Lock

> **Mục tiêu tài liệu**
>
> 1. Chốt rõ: *làm đến đâu là đã có SẢN PHẨM THẬT để dùng*
> 2. Khoá hướng cho Agent AI / contributor: **không lệch ý tưởng ban đầu**
> 3. Tạo nền tảng rõ ràng để **mở rộng sau này mà không phá sản phẩm**

---

## 1. Định nghĩa “Sản phẩm thật” trong phạm vi RowaKit Table

RowaKit Table được coi là **SẢN PHẨM THẬT** khi thỏa **đồng thời** các điều kiện sau:

1. Có thể dùng trực tiếp trong **internal / business application**
2. Không cần fork, không cần hack core
3. API đủ ổn định để dùng lâu dài
4. Có tài liệu + ví dụ rõ ràng
5. Có giới hạn rõ ràng: biết **khi nào nên dùng / khi nào không nên dùng**

👉 **RowaKit Table KHÔNG nhắm tới**:

* Spreadsheet / Excel-like grid
* DataGrid đa năng cho mọi use-case
* Client-side data engine

---

## 2. Chốt phạm vi: Làm đến đâu thì “đã đủ dùng”?

### Kết luận chốt (quan trọng)

> ✅ **Hoàn thành 100% Stage A + Stage B**
> → **ĐÃ CÓ SẢN PHẨM THẬT, dùng được trong production**

Không cần Stage C để:

* Dùng thật
* Publish OSS
* Onboard team khác

Stage C **chỉ là mở rộng có điều kiện**, không phải điều kiện để dùng.

---

## 3. Giá trị cốt lõi của RowaKit Table (Core Value Proposition)

RowaKit Table giải quyết **một việc duy nhất nhưng rất tốt**:

> 👉 *Hiển thị danh sách dữ liệu server-side cho internal/business app
> với API gọn, nhất quán, dễ đọc, dễ debug.*

### Những thứ RowaKit Table làm tốt

* Server-side pagination
* Server-side sorting
* Server-side filtering (cơ bản)
* Row actions chuẩn hoá
* Loading / empty / error state nhất quán
* Column definition mang tính **ngữ nghĩa**, không phải JSX rối

### Những thứ RowaKit Table **cố ý không làm**

* Virtual scroll
* Inline edit phức tạp
* Pivot / grouping
* Client-side heavy processing

---

## 4. Column strategy – Vì sao chỉ bắt đầu với 4 column types?

### Stage A (MVP)

Bộ column types **cố ý nhỏ**:

* `col.text`
* `col.date`
* `col.boolean`
* `col.actions`

Kèm theo **escape hatch bắt buộc**:

* `col.custom(field, render)`

👉 Điều này đảm bảo:

* API không phình
* Dev vẫn làm được mọi UI đặc biệt
* Core không phải gánh mọi use-case

### Stage B (v1.0)

Chỉ thêm **2 loại có ROI cao nhất**:

* `col.badge` (status / enum)
* `col.number` (amount / count)

❗ Nguyên tắc:

> *Không thêm column type nếu có thể giải quyết bằng `col.custom()`.*

---

## 5. Vì sao RowaKit Table đã là “sản phẩm hoàn chỉnh” sau Stage B?

### So với nhu cầu thực tế

Sau Stage B, RowaKit Table đã cover **~90% màn hình danh sách** trong internal app:

* User list
* Invoice / Order list
* Audit log
* Payment history
* Feature flag list

Không có **feature blocker** nào bắt buộc dev phải tự viết lại table.

### Điều quan trọng hơn số lượng feature

* API ổn định
* Behavior nhất quán
* Docs đủ dùng
* Giới hạn rõ ràng

👉 Đây là tiêu chí của **sản phẩm sống được**, không phải demo.

---

## 6. Stage C – Mở rộng có điều kiện (KHÔNG bắt buộc)

Stage C tồn tại để:

* Lắng nghe nhu cầu thực
* Mở rộng **có kiểm soát**

### Nguyên tắc mở Stage C

Một feature **chỉ được vào Stage C khi**:

1. Có ít nhất 2–3 user thật yêu cầu
2. Không phá API hiện tại
3. Không biến RowaKit Table thành DataGrid

### Ví dụ feature hợp lệ

* Row selection + bulk actions
* Export CSV (server-trigger)
* Persist state to URL

### Ví dụ feature **không hợp lệ**

* Spreadsheet editing
* Client-side data engine
* Pivot / grouping phức tạp

---

## 7. Vai trò của Agent AI trong dự án này

Agent AI **không phải sản phẩm**, mà là:

* Người thực thi roadmap
* Người sinh boilerplate
* Người viết test / docs

Agent AI **PHẢI**:

* Tuân thủ Stage
* Không tự ý mở rộng scope
* Không thêm feature ngoài tài liệu

---

## 8. Nguyên tắc tiến hoá sản phẩm (để dùng lâu dài)

### Chưa cần ngay, nhưng định hướng rõ

* Sau Stage B mới bàn về:

  * Semver
  * Breaking change policy
  * Deprecation flow

Không đưa những thứ này vào MVP để tránh over-engineering.

---

## 9. Tuyên bố chốt hướng (Scope Lock Statement)

> **RowaKit Table là một Business-first Server Table.**
>
> Nó không cố làm mọi thứ.
> Nó chỉ làm **một việc đủ tốt** để dev:
>
> * Không phải viết table nữa
> * Không phải debug table nữa
> * Không phải học table phức tạp nữa

Nếu một feature làm RowaKit Table **mất đi sự “vừa đủ”**,
→ feature đó **không thuộc về sản phẩm này**.

---

## 10. Khi nào cần cập nhật tài liệu này?

Chỉ cập nhật khi:

* Chuẩn bị mở Stage C
* Chuẩn bị public rộng rãi
* Chuẩn bị commercial hoá

Không cập nhật chỉ vì “có ý tưởng mới”.

---

**Tài liệu này là điểm neo (anchor) cho toàn bộ vòng đời RowaKit Table.**

Nếu có xung đột giữa ý tưởng mới và tài liệu này,
→ **tài liệu này luôn đúng cho đến khi được sửa có chủ đích**.
