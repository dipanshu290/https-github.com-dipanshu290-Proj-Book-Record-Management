const { UserModel, BookModel } = require("../models");
const IssuedBook = require("../dtos/book-dto");
const express = require("express");
const router = express.Router();

exports.getAllBooks = async (req, res) => {
  const books = await BookModel.find();

  if (books.length === 0)
    return res.status(404).json({
      success: false,
      message: "No Book Found",
    });

  res.status(200).json({
    success: true,
    data: books,
  });
};

exports.getSingleBookById = async (req, res) => {
  const { id } = req.params;

  const book = await BookModel.findById(id);

  if (!book)
    return res.status(404).json({ success: false, message: "Book not found" });

  return res.status(200).json({ success: true, data: book });
};

exports.getAllIssuedBooks = async (req, res) => {
  try {
    const users = await UserModel.find({
      issuedBook: { $exists: true, $ne: null },
    }).populate("issuedBook");

    const issuedBooks = users
      .map((each) => new IssuedBook(each))
      .filter(Boolean);

    if (issuedBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No book has been issued",
      });
    }

    return res.status(200).json({
      success: true,
      data: issuedBooks,
    });
  } catch (error) {
    console.error("Error in getAllIssuedBooks:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.addNewBook = async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({
      success: false,
      message: "No Data Was Provided",
    });
  }

  await BookModel.create(data);

  const allBooks = await BookModel.find();

  return res.status(200).json({
    success: true,
    data: allBooks,
  });
};

exports.updateBookById = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  const updatedBook = await BookModel.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    data: updatedBook,
  });
};

exports.getIssuedBooksWithFines = async (req, res) => {
  const users = await UserModel.find({
    issuedBook: { $exists: true },
  }).populate("issuedBook");

  const currentDate = new Date();
  const subscriptionDurations = {
    Basic: 90,
    Standard: 180,
    Premium: 365,
  };

  const finedUsers = users
    .map((user) => {
      const { issuedDate, returnDate, subscriptionDate, subscriptionType } =
        user;
      if (!issuedDate || !returnDate || !subscriptionDate) return null;

      const issued = new Date(issuedDate);
      const returned = new Date(returnDate);
      const subscribed = new Date(subscriptionDate);

      const subscriptionEnd = new Date(subscribed);
      subscriptionEnd.setDate(
        subscriptionEnd.getDate() +
          (subscriptionDurations[subscriptionType] || 0)
      );

      const isBookOverdue = returned < currentDate;
      const isSubscriptionExpired = subscriptionEnd <= currentDate;

      let fine = 0;
      if (isBookOverdue) {
        fine = isSubscriptionExpired ? 150 : 50;
      } else if (isSubscriptionExpired) {
        fine = 100;
      }

      if (fine === 0) return null;

      user.fine = fine;
      user.subscriptionExpired = isSubscriptionExpired;
      return new IssuedBook(user);
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.fine - a.fine || new Date(a.returnDate) - new Date(b.returnDate)
    );

  if (finedUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No issued books with fine found",
    });
  }

  return res.status(200).json({
    success: true,
    data: finedUsers,
  });
};
