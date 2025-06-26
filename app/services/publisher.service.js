const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.collection = client.db().collection("publisher");
  }

  extractPublisherData(payload) {
    const publisher = {
      MaNXB: payload.MaNXB,
      TenNXB: payload.TenNXB,
      DiaChi: payload.DiaChi,
    };

    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );
    return publisher;
  }

  async create(payload) {
    const publisher = this.extractPublisherData(payload);
    const result = await this.collection.insertOne(publisher);
    return result;
  }

  async count(filter) {
    return await this.collection.countDocuments(filter);
  }

  async findWithPagination(filter, skip, limit) {
    return await this.collection.find(filter).skip(skip).limit(limit).toArray();
  }

  async findById(id) {
    return await this.collection.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const publisher = this.extractPublisherData(payload);
    const result = await this.collection.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: publisher },
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

  async findByMaNXB(maNXB) {
    return await this.collection.findOne({ MaNXB: maNXB });
  }
}

module.exports = PublisherService;
