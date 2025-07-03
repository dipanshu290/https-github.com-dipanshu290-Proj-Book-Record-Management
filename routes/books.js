const express = require("express");
const {
  getAllBooks,
  getSingleBookById,
  getAllIssuedBooks,
  addNewBook,
  updateBookById,
  getIssuedBooksWithFines,
} = require("../controllers/book-controller");

const router = express.Router();

router.get("/", getAllBooks);

router.get("/issued/by-user", getAllIssuedBooks);

router.get("/issued/with-fine", getIssuedBooksWithFines);

router.get("/:id", getSingleBookById);

router.post("/", addNewBook);

router.put("/:id", updateBookById);

module.exports = router;
