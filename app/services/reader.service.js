const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.collection = client.db().collection("reader");
  }

  extractReaderData(payload) {
    const reader = {
      // Dữ liệu chung (nội bộ)
      MaDocGia: payload.MaDocGia,
      HoLot: payload.HoLot,
      Ten: payload.Ten,
      NgaySinh: payload.NgaySinh,
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
      createdAt: new Date(),
      TrangThai: payload.TrangThai,

      // Đăng nhập truyền thống
      MatKhau: payload.MatKhau,

      // Đăng nhập Google
      googleId: payload.googleId,
      email: payload.email,
      name: payload.name,
      avatar: payload.avatar,
      provider: payload.provider || "local", // "google" hoặc "local"
    };

    // Xoá trường không có giá trị
    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key]
    );

    return reader;
  }

  // Tạo mới người dùng nội bộ
  async create(payload) {
    const reader = this.extractReaderData(payload);
    const result = await this.collection.insertOne(reader);
    return result;
  }

  // Đăng nhập Google: tìm hoặc tạo người dùng
  async createOrFindByGoogle(payload) {
    const reader = this.extractReaderData(payload);

    // Kiểm tra xem người dùng đã tồn tại theo googleId hoặc email
    const existing = await this.collection.findOne({
      $or: [
        { googleId: reader.googleId },
        { email: reader.email, provider: "google" },
      ],
    });

    if (existing) {
      return existing;
    }

    // Nếu chưa có, tạo mới người dùng Google
    const result = await this.collection.insertOne(reader);
    return await this.collection.findOne({ _id: result.insertedId });
  }

  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  // Tìm theo filter bất kỳ
  async find(filter = {}, skip = 0, limit = 5) {
    return await this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  // Tìm theo _id MongoDB
  async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Tìm theo googleId
  async findByGoogleId(googleId) {
    return await this.collection.findOne({ googleId });
  }

  // Cập nhật thông tin người dùng
  async update(id, payload) {
    const reader = this.extractReaderData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: reader },
      { returnDocument: "after" }
    );
    return result;
  }

  // Xoá theo _id
  async delete(id) {
    const result = await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Xoá toàn bộ
  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }

  // Tìm theo mã
  async findByMaDocGia(MaDocGia) {
    return await this.collection.findOne({ MaDocGia });
  }

  // Thống kê
  async getStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalReaders = await this.collection.countDocuments({});
    const newReadersThisMonth = await this.collection.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    return {
      totalReaders,
      newReadersThisMonth,
    };
  }
}

module.exports = ReaderService;
