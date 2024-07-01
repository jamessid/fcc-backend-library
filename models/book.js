const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: [String],
  commentcount: { type: Number, default: 0 },
});

bookSchema.post("save", async function (doc) {
  console.log(`${doc.comments.length} comments in this doc.`);
});

module.exports = mongoose.model("Book", bookSchema);
