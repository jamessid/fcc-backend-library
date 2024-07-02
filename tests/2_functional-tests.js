/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send({
              title: "Test POST",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200, "response should be 200");
              assert.containsAllKeys(res.body, ["_id", "title"]);
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200, "response should be 200");
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          // We need to ensure we actually have a book in place, to allow us to test the GET
          .post("/api/books")
          .send({ title: "Book to ensure a single book exists!" })
          .then(() => {
            chai
              .request(server)
              .keepOpen()
              .get("/api/books")
              .end(function (err, res) {
                assert.equal(res.status, 200, "response should be 200");
                assert.isArray(res.body, "response should be an array");
                assert.containsAllKeys(res.body[0], [
                  "_id",
                  "title",
                  "commentcount",
                  "comments",
                ]);
                done();
              });
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/invalid_id")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          // Create a book, to then GET.
          .post("/api/books")
          .send({ title: "Book to GET" })
          .then((res) => {
            chai
              .request(server)
              .keepOpen()
              // GET book just created
              .get(`/api/books/${res.body._id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200, "response should be 200");
                assert.containsAllKeys(res.body, [
                  "_id",
                  "title",
                  "commentcount",
                  "comments",
                ]);
                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .keepOpen()
            // Create book to post comment on
            .post("/api/books")
            .send({ title: "Book to POST comment on" })
            .then((res) => {
              chai
                .request(server)
                .keepOpen()
                // post comment on book just created
                .post(`/api/books/${res.body._id}`)
                .send({ comment: "test comment" })
                .end(function (err, res) {
                  //console.log(res);
                  assert.equal(res.status, 200, "response should be 200");
                  assert.containsAllKeys(res.body, [
                    "_id",
                    "title",
                    "commentcount",
                    "comments",
                  ]);
                  assert.isArray(res.body.comments);
                  assert.include(res.body.comments, "test comment");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .keepOpen()
            // Create a valid book to post NO comment on
            .post("/api/books")
            .send({ title: "Book to POST NO comment on" })
            .then((res) => {
              chai
                .request(server)
                .keepOpen()
                // Send NO comment to previously created book
                .post(`/api/books/${res.body._id}`)
                .send({})
                .end(function (err, res) {
                  assert.equal(res.status, 200, "response should be 200");
                  assert.equal(res.text, "missing required field comment");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .keepOpen()
            // send valid comment to invalid book.
            .post(`/api/books/invalid_id`)
            .send({ comment: "sending comment to invalid id" })
            .end(function (err, res) {
              assert.equal(res.status, 200, "response should be 200");
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          // Create book to then delete
          .post("/api/books")
          .send({ title: "Book to DELETE" })
          .then((res) => {
            chai
              .request(server)
              .keepOpen()
              // Delete book just created
              .delete(`/api/books/${res.body._id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200, "response should be 200");
                assert.equal(res.text, "delete successful");
                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          // Delete invalid book
          .delete("/api/books/invalid_id")
          .end(function (err, res) {
            assert.equal(res.status, 200, "response should be 200");
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
