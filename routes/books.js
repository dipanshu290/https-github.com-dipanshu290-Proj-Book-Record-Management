const express = require("express");
const { books } = require("../data/books.json");
const { users } = require("../data/users.json");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Got all the books",
    data: books,
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const book = books.find((each) => each.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: "book not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Book found",
    data: book,
  });
});

router.get("/issued/by-user", (req, res) => {
  const usersWithTheIssuedBook = users.filter((each) => each.issuedBookId);

  const issuedBook = [];

  usersWithTheIssuedBook.forEach((each) => {
    const book = books.find((book) => book.id === each.issuedBookId);
    if (book) {
      const bookWithUser = {
        ...book,
        issuedBy: each.name,
        issuedDate: each.issuedDate,
        returnDate: each.returnDate,
      };
      issuedBook.push(bookWithUser);
    }
  });

  if (issuedBook.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No books have been issued",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Users with the issued book",
    data: issuedBook,
  });
});

router.post("/", (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "No data to add a book ",
    });
  }

  const book = books.find((each) => each.id === data.id);
  if (book) {
    return res.status(404).json({
      success: false,
      message: "Id already exists",
    });
  }

  const allBooks = { ...books, data };
  return res.status(201).json({
    success: true,
    message: "Added book successfully",
    data: allBooks,
  });
});

router.put("/updateBook/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const book = books.find((each) => each.id === id);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: "Book not found for this ID",
    });
  }
  const updateData = books.map((each) => {
    if (each.id === id) {
      return {
        ...each,
        ...data,
      };
    }
    return each;
  });
  return res.status(200).json({
    success: true,
    message: "Updated a book by their ID",
    data: updateData,
  });
});

router.get("/issued/with-fine", (req, res) => {
  const getDateInDays = (dateStr = "") => {
    if (!dateStr)
      return Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  };

  const subscriptionDurations = {
    Basic: 90,
    Standard: 180,
    Premium: 365,
  };

  const usersWithFine = users.filter((user) => {
    if (!user.issuedBookId) return false;

    const subscriptionDate = getDateInDays(user.subscriptionDate);
    const returnDate = getDateInDays(user.returnDate);
    const issuedDate = getDateInDays(user.issuedDate);
    const currentDate = getDateInDays();

    if (issuedDate < subscriptionDate) return false;

    const subscriptionExpiration =
      subscriptionDate + (subscriptionDurations[user.subscriptionType] || 0);

    const isBookOverdue = returnDate < currentDate;
    const isSubscriptionExpired = subscriptionExpiration <= currentDate;

    let fine = 0;
    if (isSubscriptionExpired && !isBookOverdue) {
      fine = 100;
    } else if (isBookOverdue) {
      fine = isSubscriptionExpired ? 150 : 50;
    }

    user.fine = fine;
    user.isSubscriptionExpired = isSubscriptionExpired;
    return fine > 0;
  });

  const issuedBooksWithFine = [];

  usersWithFine.forEach((user) => {
    const book = books.find((book) => book.id === user.issuedBookId);
    if (book) {
      issuedBooksWithFine.push({
        ...book,
        issuedBy: user.name,
        issuedDate: user.issuedDate,
        returnDate: user.returnDate,
        fine: user.fine,
        email: user.email,
        isSubscriptionExpired: user.isSubscriptionExpired,
      });
    }
  });

  issuedBooksWithFine.sort((a, b) => {
    if (b.fine !== a.fine) return b.fine - a.fine;

    const [dayA, monthA, yearA] = a.returnDate.split("-").map(Number);
    const [dayB, monthB, yearB] = b.returnDate.split("-").map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);

    return dateA - dateB;
  });

  if (issuedBooksWithFine.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No issued books with fine found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Issued books with fines retrieved",
    data: issuedBooksWithFine,
  });
});

module.exports = router;
