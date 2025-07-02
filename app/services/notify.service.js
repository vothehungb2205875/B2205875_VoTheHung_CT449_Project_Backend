const { ObjectId } = require("mongodb");

class NotifyService {
  constructor(client) {
    this.collection = client.db().collection("notifications"); // Khởi tạo collection notification
  }

  extractNotifyData(payload) {
    const notify = {
      NoiDung: payload.NoiDung,
      NgayTao: payload.NgayTao || new Date(), // Mặc định là thời điểm hiện tại nếu không có
      Loai: payload.Loai, // "thongbao" hoặc "sukien"
    };

    Object.keys(notify).forEach(
      (key) => notify[key] === undefined && delete notify[key]
    );

    return notify;
  }

  async create(payload) {
    const notify = this.extractNotifyData(payload);
    const result = await this.collection.insertOne(notify);
    return { _id: result.insertedId, ...notify };
  }

  async find(filter = {}) {
    const cursor = await this.collection.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const notify = this.extractNotifyData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: notify },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }

  async findByLoai(loai) {
    return await this.collection.find({ Loai: loai }).toArray();
  }

  async findLatest(limit = 5) {
    return await this.collection
      .find({})
      .sort({ NgayTao: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = NotifyService;
