const { UserModel, BookModel } = require("../models");

exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find({});

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No books found",
    });
  }

  res.status(200).json({
    success: true,
    data: users,
  });
};

exports.getSingleUserById = async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User Not Found",
    });
  } else {
    res.status(200).json({
      success: true,
      data: user,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.deleteOne({ _id: id });

  if (user.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: "User to be deleted is not found",
    });
  }

  return res
    .status(200)
    .json({ success: true, message: "Deleted the user Successfully" });
};

exports.updateUserById = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  const updatedUserData = await UserModel.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: {
        ...data,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    success: true,
    data: updatedUserData,
  });
};

exports.createNewUser = async (req, res) => {
  const { name, surname, email, subscriptionType, subscriptionDate } = req.body;
  const newUser = await UserModel.create({
    name,
    surname,
    email,
    subscriptionType,
    subscriptionDate,
  });

  return res.status(201).json({
    success: true,
    data: newUser,
  });
};

exports.getSubscriptionDetailsById = async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const getDateInDays = (date = "") => {
    const d = date ? new Date(date) : new Date();
    return Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
  };

  const subscriptionDurations = {
    Basic: 90,
    Standard: 180,
    Premium: 365,
  };

  const subscriptionStart = getDateInDays(user.subscriptionDate);
  const subscriptionDuration =
    subscriptionDurations[user.subscriptionType] || 0;
  const subscriptionExpiration = subscriptionStart + subscriptionDuration;

  const currentDate = getDateInDays();
  const returnDate = getDateInDays(user.returnDate);

  let subscriptionExpired = false;
  let daysLeftForExpiration = 0;
  let fine = 0;

  if (currentDate < subscriptionStart) {
    subscriptionExpired = false;
    daysLeftForExpiration = subscriptionDuration;
    fine = 0;
  } else {
    subscriptionExpired = currentDate > subscriptionExpiration;
    daysLeftForExpiration = subscriptionExpired
      ? 0
      : subscriptionExpiration - currentDate;

    const isBookOverdue = returnDate < currentDate;

    if (isBookOverdue) {
      fine = subscriptionExpired ? 150 : 50;
    } else if (subscriptionExpired) {
      fine = 100;
    }
  }

  const data = {
    ...user.toObject(),
    subscriptionExpired,
    daysLeftForExpiration,
    fine,
  };

  return res.status(200).json({ success: true, data });
};
