const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.collection = client.db().collection("theodoimuonsach");
  }

  extractBorrowData(payload) {
    const borrow = {
      MaDocGia: payload.MaDocGia,
      MaSach: payload.MaSach,
      NgayMuon: payload.NgayMuon ? new Date(payload.NgayMuon) : undefined,
      NgayTra: payload.NgayTra ? new Date(payload.NgayTra) : undefined,
      NgayTraTT: payload.NgayTraTT,
      TrangThai: payload.TrangThai,
    };

    Object.keys(borrow).forEach(
      (key) => borrow[key] === undefined && delete borrow[key]
    );

    return borrow;
  }

  // Thêm một lần mượn mới
  async create(payload) {
    const borrow = this.extractBorrowData(payload);
    const result = await this.collection.insertOne(borrow);
    return result;
  }

  // Lấy tất cả lượt mượn
  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  async find(filter = {}, skip = 0, limit = 5) {
    return await this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  // Lấy theo ID (giả định _id MongoDB)
  async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Cập nhật thông tin mượn (có thể dùng để cập nhật ngày trả)
  async update(id, payload) {
    const update = this.extractBorrowData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  // Xoá một lượt mượn
  async delete(id) {
    const result = await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Xoá tất cả (nếu cần)
  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }

  // Tìm tất cả lượt mượn của một độc giả
  async findByReader(maDocGia) {
    return await this.collection.find({ MaDocGia: maDocGia }).toArray();
  }

  // Tìm tất cả lượt mượn của một sách
  async findByBook(maSach) {
    return await this.collection.find({ MaSach: maSach }).toArray();
  }

  // Tìm tất cả lượt mượn của một độc giả kèm thông tin sách
  async findByReaderWithBooks(maDocGia) {
    return await this.collection
      .aggregate([
        { $match: { MaDocGia: maDocGia } },
        {
          $lookup: {
            from: "books",
            localField: "MaSach",
            foreignField: "MaSach",
            as: "bookInfo",
          },
        },
        { $unwind: { path: "$bookInfo", preserveNullAndEmptyArrays: true } },
        { $addFields: { bookTitle: "$bookInfo.TenSach" } },
        { $project: { bookInfo: 0 } },
      ])
      .toArray();
  }

  async getStatistic(month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return await this.collection.countDocuments({
      NgayMuon: {
        $gte: start,
        $lt: end,
      },
    });
  }
}

module.exports = BorrowService;
