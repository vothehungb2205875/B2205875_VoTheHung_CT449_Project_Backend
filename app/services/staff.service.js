const { ObjectId } = require("mongodb");

class StaffService {
  constructor(client) {
    this.collection = client.db().collection("staff");
  }

  extractStaffData(payload) {
    const staff = {
      MSNV: payload.MSNV,
      HoTenNV: payload.HoTenNV,
      Password: payload.Password,
      ChucVu: payload.ChucVu,
      DiaChi: payload.DiaChi,
      SoDienThoai: payload.SoDienThoai,
      email: payload.email,
      TrangThai: payload.TrangThai,
      createdAt: new Date(),
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );
    return staff;
  }

  async create(payload) {
    const staff = this.extractStaffData(payload);
    const result = await this.collection.insertOne(staff);
    return result;
  }

  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  async find(filter = {}, skip = 0, limit = 5) {
    return await this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const staff = this.extractStaffData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: staff },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    return await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = StaffService;
