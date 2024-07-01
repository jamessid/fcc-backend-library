/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Book = require("../models/book");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(
      asyncHandler(async function (req, res) {
        // find all books
        const books = await Book.find({}).exec();
        res.json(books);
      })
    )

    .post(
      // Validation
      body("title", "title must exist").exists({ values: "falsy" }),

      asyncHandler(async function (req, res) {
        // create errors result object.
        const result = validationResult(req);

        // if there are errors, return string "missing required field title"
        if (!result.isEmpty()) {
          return res.send("missing required field title");
          // if there are no errors, save book and return saved document
        } else {
          const book = new Book({
            title: req.body.title,
          });

          const savedBook = await book.save();

          return res.json(savedBook);
        }
      })
    )

    .delete(
      asyncHandler(async function (req, res) {
        //if successful response will be 'complete delete successful'
        const bookCount = await Book.countDocuments({});
        const deleteRes = await Book.deleteMany({});

        if (bookCount === deleteRes.deletedCount) {
          res.send("complete delete successful");
        } else {
          res.send("warning: complete delete unsuccessful");
        }
      })
    );

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
};
