class IssuedBook {
  _id;
  name;
  genre;
  price;
  publisher;
  issuedBy;
  issuedDate;
  returnDate;
  email;
  fine;
  isSubscriptionExpired;

  constructor(user) {
    const book = user.issuedBook;

    this._id = book._id;
    this.name = book.name;
    this.genre = book.genre;
    this.price = book.price;
    this.publisher = book.publisher;
    this.issuedBy = user.name;
    this.issuedDate = user.issuedDate;
    this.returnDate = user.returnDate;
    this.email = user.email;
    this.fine = user.fine || 0;
    this.isSubscriptionExpired = user.isSubscriptionExpired || false;
  }
}

module.exports = IssuedBook;
