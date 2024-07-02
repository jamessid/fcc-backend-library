/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { body, param, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Book = require("../models/book");
const { checkValidObjectId, checkIdExists } = require("../validators.js");

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
        // total model count, to compare to delete
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
    .get(
      // validation
      param("id").custom(checkValidObjectId).bail().custom(checkIdExists),

      asyncHandler(async function (req, res) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
          res.send("no book exists");
        } else {
          const book = await Book.findById(req.params.id);
          res.send(book);
        }
      })
    )

    .post(
      // validation
      param("id", "invalid id")
        .custom(checkValidObjectId)
        .bail()
        .custom(checkIdExists),
      body("comment", "must provide comment").exists({ values: "falsy" }),

      asyncHandler(async function (req, res) {
        const result = validationResult(req);

        const errorPaths = result.formatWith((error) => error.path).array();

        // deal with validation errors
        if (!result.isEmpty()) {
          if (errorPaths.includes("comment")) {
            res.send("missing required field comment");
          } else if (errorPaths.includes("id")) {
            res.send("no book exists");
          } else {
            res.send("could not update.");
          }
        } else {
          // req is all good.
          // find doc on which to comment
          const doc = await Book.findById(req.params.id);
          // add comment and update commentcount
          doc.comments.push(req.body.comment);
          doc.commentcount = doc.comments.length;

          // save and respond with updated doc
          await doc.save();
          res.send(doc);
        }
      })
    )

    .delete(
      // validation
      param("id", "invalid id")
        .custom(checkValidObjectId)
        .bail()
        .custom(checkIdExists),

      asyncHandler(async function (req, res) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
          res.send("no book exists");
        } else {
          const deletedBook = await Book.deleteOne({ _id: req.params.id });
          if (deletedBook.deletedCount === 1) {
            res.send("delete successful");
          } else {
            res.send("could not delete");
          }
        }
      })
    );
};
