const { ObjectId } = require("mongodb"); // Import ObjectId từ mongodb để làm việc với ID đối tượng

class BookService {
  constructor(client) {
    this.collection = client.db().collection("books"); // Khởi tạo collection "books" từ client MongoDB
  }

  extractBookData(payload) {
    // Hàm để trích xuất dữ liệu sách từ payload
    const book = {
      MaSach: payload.MaSach,
      TenSach: payload.TenSach,
      DonGia: payload.DonGia,
      SoQuyen: payload.SoQuyen,
      NamXuatBan: payload.NamXuatBan,
      MaNXB: payload.MaNXB,
      TacGia: payload.TacGia,
      BiaSach: payload.BiaSach,
      LuotXem: payload.LuotXem,
      TheLoai: payload.TheLoai,
    };
    Object.keys(book).forEach(
      // Duyệt qua tất cả các khóa trong đối tượng book
      (key) => book[key] === undefined && delete book[key] // Nếu giá trị của khóa là undefined, xóa khóa đó khỏi đối tượng
    );
    return book;
  }

  async create(payload) {
    const book = this.extractBookData(payload);
    const result = await this.collection.insertOne(book);
    return { _id: result.insertedId, ...book };
  }

  async find(filter) {
    // Hàm để tìm sách theo bộ lọc
    const cursor = await this.collection.find(filter);
    return await cursor.toArray(); // Chuyển đổi kết quả tìm kiếm thành mảng
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
