const express = require("express");
const { users } = require("../data/users.json");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: users,
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((each) => each.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user doesn't exist",
    });
  }
  return res.status(200).json({
    success: true,
    message: "User found",
    data: user,
  });
});

router.post("/", (req, res) => {
  const { id, name, surname, email, subscriptionType, subscriptionDate } =
    req.body;

  const user = users.find((each) => each.id === id);

  if (user) {
    return res.status(409).json({
      success: false,
      message: "User with the ID already exists",
    });
  }
  users.push({
    id,
    name,
    surname,
    email,
    subscriptionType,
    subscriptionDate,
  });
  return res.status(201).json({
    success: true,
    message: "user successfully added",
    data: users,
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const user = users.find((each) => each.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user doesn't exist",
    });
  }

  const index = users.findIndex((each) => each.id === id);
  users[index] = { ...users[index], ...data };

  return res.status(200).json({
    success: true,
    message: "User updated",
    data: users,
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((each) => each.id === id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user doesn't exist",
    });
  }
  const index = users.indexOf(user);
  users.splice(index, 1);

  return res
    .status(200)
    .json({ success: true, message: "Deleted User", data: users });
});

router.get("/subscription-details/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User with the ID doesn't exist",
    });
  }
  const isValidDate = (dateStr = "") => {
    if (!dateStr) return false;
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  if (
    !isValidDate(user.subscriptionDate) ||
    (user.issuedDate && !isValidDate(user.issuedDate)) ||
    (user.returnDate && !isValidDate(user.returnDate))
  ) {
    return res.status(400).json({
      success: false,
      message:
        "One or more dates are invalid. Please use dd-mm-yyyy format and valid calendar dates.",
    });
  }
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

  const subscriptionDate = getDateInDays(user.subscriptionDate);
  const returnDate = getDateInDays(user.returnDate);
  const issuedDate = getDateInDays(user.issuedDate);
  const currentDate = getDateInDays();

  if (issuedDate < subscriptionDate) {
    return res.status(400).json({
      success: false,
      message: "Book cannot be issued before the subscription starts.",
    });
  }

  const subscriptionExpiration =
    subscriptionDate + (subscriptionDurations[user.subscriptionType] || 0);

  const isBookOverdue = user.issuedBookId && returnDate < currentDate;
  const isSubscriptionExpired = subscriptionExpiration <= currentDate;

  let fine = 0;

  if (isSubscriptionExpired && !isBookOverdue) {
    fine = 100;
  } else if (isBookOverdue) {
    fine = isSubscriptionExpired ? 150 : 50;
  }

  const data = {
    ...user,
    isSubscriptionExpired,
    daysLeftForExpiration: isSubscriptionExpired
      ? 0
      : subscriptionExpiration - currentDate,
    fine,
  };

  return res.status(200).json({
    success: true,
    message: "Subscription detail for the user is:",
    data,
  });
});

module.exports = router;
