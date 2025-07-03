const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/,
      unique: true,
    },
    issuedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: false,
    },
    issuedDate: {
      type: Date,
      required: false,
    },
    returnDate: {
      type: Date,
      required: false,
    },
    subscriptionType: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    subscriptionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
