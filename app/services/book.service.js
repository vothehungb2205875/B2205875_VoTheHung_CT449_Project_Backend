const { ObjectId } = require("mongodb"); // Import ObjectId từ mongodb để làm việc với ID đối tượng

class BookService {
  constructor(client) {
    this.collection = client.db().collection("books"); // Khởi tạo collection "books" từ client MongoDB
  }

  extractBookData(payload) {
    const book = {
      MaSach: payload.MaSach,
      TenSach: payload.TenSach,
      DonGia: payload.DonGia !== undefined ? Number(payload.DonGia) : undefined,
      SoQuyen:
        payload.SoQuyen !== undefined ? Number(payload.SoQuyen) : undefined,
      NamXuatBan:
        payload.NamXuatBan !== undefined
          ? Number(payload.NamXuatBan)
          : undefined,
      MaNXB: payload.MaNXB,
      TacGia: payload.TacGia,
      BiaSach: payload.BiaSach,
      LuotXem: payload.LuotXem !== undefined ? Number(payload.LuotXem) : 0, // fallback mặc định
      TheLoai: payload.TheLoai,
      TrangThai: payload.TrangThai,
    };
    // Xóa các thuộc tính có giá trị undefined
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  async create(payload) {
    const book = this.extractBookData(payload);
    const result = await this.collection.insertOne(book);
    return { _id: result.insertedId, ...book }; // ...book để trả về các trường khác ngoài _id
  }

  // Đếm số lượng sách theo điều kiện
  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  // Tìm kiếm sách theo điều kiện, phân trang
  // skip, limit nếu không truyền vào sẽ mặc định là 0 và 12
  async find(filter = {}, skip = 0, limit = 12) {
    return await this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  async findById(id) {
    // Hàm để tìm sách theo ID
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    // Hàm để cập nhật thông tin sách theo ID
    const book = this.extractBookData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: book },
      { returnDocument: "after" } // Trả về tài liệu đã cập nhật
    );
    return result;
  }

  async delete(id) {
    // Hàm để xóa sách theo ID
    const result = await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    // Hàm để xóa tất cả sách
    const result = await this.collection.deleteMany({});
    return result.deletedCount; // Trả về số lượng sách đã xóa
  }

  async findTopViewed(limit = 4) {
    return await this.collection
      .find({})
      .sort({ LuotXem: -1 })
      .limit(limit)
      .toArray();
  }

  async findByMaSach(maSach) {
    return await this.collection.findOne({ MaSach: maSach });
  }
}

module.exports = BookService;
