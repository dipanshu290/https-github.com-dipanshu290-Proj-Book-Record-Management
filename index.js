const express = require("express");

const userRouter = require("./routes/users.js");
const booksRouter = require("./routes/books.js");

const app = express();

const PORT = 8081;
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is up and running succesfully",
  });
});

app.use("/users", userRouter);
app.use("/books", booksRouter);

app.get(/.*/, (req, res) => {
  res.status(404).json({
    message: "This route doesn't exist",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
