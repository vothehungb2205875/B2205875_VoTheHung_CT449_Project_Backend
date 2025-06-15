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
      Chucvu: payload.Chucvu,
      Diachi: payload.Diachi,
      SoDienThoai: payload.SoDienThoai,
      email: payload.email,
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

  async find(filter) {
    const cursor = await this.collection.find(filter);
    return await cursor.toArray();
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
    const result = await this.collection.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = StaffService;
