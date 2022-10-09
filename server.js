const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const sha1 = require("sha1");
const User = require("./schema/user");
const bodyParser = require("body-parser");
const Fact = require("./schema/fact");
const Quote = require("./schema/quote");
const TDTY = require("./schema/thisDayThatYear");
const Feedback = require("./schema/feedback");
const AWS = require("aws-sdk");
const fs = require("fs");
const multer = require("multer");
// require("dotenv").config();
const path = require("path");
const { CodeStarNotifications } = require("aws-sdk");
app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./uploads/"); // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
});

mongoose.connect(
  "mongodb+srv://ruturajpandav:ruturaj123@cluster0.kpohdlz.mongodb.net/onepage?retryWrites=true&w=majority",
  (err) => {
    if (err) {
      console.error("ERROR while connecting to MongoDB");
    } else {
      console.log("CONNECTED to onepage database");
    }
  }
);
const s3 = new AWS.S3({
  accessKeyId: "AKIARNWBNY2L33XZSIK2",
  secretAccessKey: "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",
  region: "ap-south-1",
});

app.post("/create-user", upload.single("file"), async function (req, res) {
  if (!req.file) {
    console.log("No file upload");
  } else {
    // console.log("user 1");
    var file = req.file;
    let filepath = req.file.path;

    const blob = fs.readFileSync(filepath);

    // console.log("user 2");
    const params = {
      Bucket: "onepage-users",
      Key: file.originalname,
      Body: blob,
    };
    // console.log("user 3");

    s3.upload(params, async function (err, data) {
      if (err) {
        throw err;
      } else {
        // console.log("user 4 ");
        let location = data.Location;

        let thisuser = {
          firstname: req.body.firstname.toLowerCase(),
          lastname: req.body.lastname.toLowerCase(),
          email: req.body.email,
          img: location,
          password: sha1(req.body.password),
        };

        let user = await User.create(thisuser);

        // console.log("user 5");
        if (user) {
          // console.log("user 6");
          console.log(file.originalname);
          fs.unlink(`uploads/${file.originalname}`, function (err) {
            if (err) {
              console.log("error ", err.message);
            } else {
              console.log("file deleted");
            }
          });
          console.log("user 7");

          res.json({
            userCreated: true,
          });
        }
      }
    });
  }
});

// request to login
app.post("/login", async function (req, res) {
  let payload = req.body.payload;
  let useralready = await User.find({
    email: payload.email,
    password: sha1(payload.password),
  });

  if (useralready.length === 1) {
    let user = useralready[0];

    res.json({
      userFound: true,
    });
  } else {
    res.json({
      userFound: false,
    });
  }
});

//
app.get("/home", function (req, res, next) {
  console.log("get request on home");
});

app.get("/all-users", async function (req, res) {
  let user = await User.find();
  if (user.length > 0) {
  }
  res.json({
    users: user.length,
    user,
  });
});

// ******FACTS ******************

// get a random fact .. everytime
app.get("/random-fact", async function (req, res) {
  let random = await Fact.aggregate([{ $sample: { size: 1 } }]);
  if (random.length == 1) {
    res.json({
      msg: "randomfact",
      fact: random,
    });
  }
});

//gets every document from facts collection
app.get("/all-facts", async function (req, res) {
  let facts = await Fact.find();
  let tags = await Fact.distinct("tags");
  // res.json({ tags })
  res.json({
    items: facts.length,
    tags: tags,
    facts,
  });
});

app.post("/create-quote", upload.single("file"), async function (req, res) {
  console.log("here .. trying to a quote");
  if (!req.file) {
    console.log("No file upload");
  } else {
    console.log("quote1");
    var file = req.file;
    let filepath = req.file.path;

    const blob = fs.readFileSync(filepath);

    console.log("quote2");
    const params = {
      Bucket: "onepage-quotes",
      Key: file.originalname,
      Body: blob,
    };

    console.log("quote3");
    // console.log(req.body.title);

    s3.upload(params, async function (err, data) {
      console.log(data);
      if (err) {
        throw err;
      } else {
        console.log("quote4");
        let location = data.Location;
        let thisquote = {
          quote: req.body.quote,
          author: req.body.author,
          img: location,
          imgkey: file.originalname,
        };

        console.log("quote5");
        // let entry = await Profile.create(thisentry);
        let quote = await Quote.create(thisquote);

        console.log("quote6");
        if (quote) {
          res.json({
            quoteCreated: true,
            quote,
          });
        }
      }
    });
  }
});

app.post("/create-tdty", upload.single("file"), async function (req, res) {
  console.log("trying to create tdty");
  if (!req.file) {
    console.log("No file upload");
  } else {
    console.log("tdty 1");
    var file = req.file;
    let filepath = req.file.path;

    const blob = fs.readFileSync(filepath);

    console.log("upload 2");
    const params = {
      // Bucket: "onepage-users",
      Bucket: "onepage-tdty",
      Key: file.originalname,
      Body: blob,
    };
    console.log("tdty 3");

    s3.upload(params, async function (err, data) {
      if (err) {
        throw err;
      } else {
        console.log("tdty 4 ");
        let location = data.Location;

        let thistdty = {
          topic:req.body.topic,
          description: req.body.description,
          dateOfEvent: req.body.date,
          img: location,
          imgkey: file.originalname,
        };

        let tdty = await TDTY.create(thistdty);

        console.log("tdty 5");
        if (tdty) {
          console.log("tdty 6");
          console.log(file.originalname);
          fs.unlink(`uploads/${file.originalname}`, function (err) {
            if (err) {
              console.log("error ", err.message);
            } else {
              console.log("file deleted");
            }
          });
          console.log("upload 7");
          res.json({
            msg: "created",
            tdtyCreated: true,
            tdty,
          });
        }
      }
    });
  }
});

app.post("/create-fact", upload.single("file"), async function (req, res) {
  console.log("trying to create fact");
  if (!req.file) {
    console.log("No file upload");
  } else {
    console.log("upload 1");
    var file = req.file;
    let filepath = req.file.path;

    const blob = fs.readFileSync(filepath);

    console.log("upload 2");
    const params = {
      // Bucket: "onepage-users",
      Bucket: "onepage-facts",
      Key: file.originalname,
      Body: blob,
    };
    console.log("upload 3");

    s3.upload(params, async function (err, data) {
      if (err) {
        throw err;
      } else {
        console.log("upload 4 ");
        let location = data.Location;

        let thisfact = {
          title: req.body.title,
          description: req.body.desc,
          img: location,
          imgkey: file.originalname,
          tags: req.body.tags.split(" "),
        };

        let fact = await Fact.create(thisfact);

        console.log("upload 5");
        if (fact) {
          console.log("upload 6");
          console.log(file.originalname);
          fs.unlink(`uploads/${file.originalname}`, function (err) {
            if (err) {
              console.log("error ", err.message);
            } else {
              console.log("file deleted");
            }
          });
          console.log("upload 7");
          res.json({
            msg: "created",
            factCreated: true,
            fact,
          });
        }
      }
    });
  }
});

// delete a fact by its id
app.delete("/delete-fact/:id", async function (req, res) {
  let id = req.params.id;

  if (id !== undefined && id !== "" && id !== null) {
    let fact = await Fact.findByIdAndDelete(id);

    if (fact) {
      console.log("fact deleted");
      let imgkey = fact.imgkey;
      console.log("thsi is the image ke to be deleted", imgkey);
      var params = {
        Bucket: "onepage-facts",
        Key: imgkey,
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err);
          callback(err);
        } else {
          console.log("no error in aws as well ");
          res.json({
            msg: "delted",
            fact_deleted: true,
          });
        }
      });
    } else {
      res.json({
        msg: "failed to delted",
      });
    }
  }
});

// delete al facts in the databse
app.delete("/delete-all-facts/", async function (req, res) {
  let facts = await Fact.deleteMany({});

  if (facts) {
    res.json({
      msg: "delted everything from facts",
    });
  } else {
    res.json({
      msg: "failed to delete all the facts",
    });
  }
});

// ******FACTS ******************

// ******Quotes ******************
// get a random quote .. everytime
app.get("/all-authors", async function (req, res) {
  console.log("getting authros");
  let authors = await Quote.distinct("author");
  res.json({ authors });
});
app.get("/all-tags", async function (req, res) {
  console.log("getting tags");
  let tags = await Fact.distinct("tags");
  res.json({ tags });
});
app.get("/random-quote", async function (req, res) {
  let random = await Quote.aggregate([{ $sample: { size: 1 } }]);
  if (random.length == 1) {
    res.json({
      msg: "random quote",
      quote: random,
    });
  }
});

//gets every document from quote collection
app.get("/all-quotes", async function (req, res) {
  let quotes = await Quote.find();
  if (quotes) {
    let authors = await Quote.distinct("author");
    res.json({
      items: quotes.length,
      authors: authors,
      quotes,
    });
  }
});

// create a quote and store it to the database ..

// delete all quotes in the collection
app.delete("/delete-all-quotes/", async function (req, res) {
  let quotes = await Quote.deleteMany({});

  if (quotes) {
    res.json({
      msg: "delted everything",
    });
  } else {
    res.json({
      msg: "failed to delete all the quotes",
    });
  }
});

// delete a quite by its id
app.delete("/delete-feedback/:id", async function (req, res) {
  let id = req.params.id;

  if (id !== undefined && id !== "" && id !== null) {
    let feedback = await Feedback.findByIdAndDelete(id);
    if (feedback) {
      res.json({
        feedback_deleted: true,
        msg: "deleted the feedback",
        deleted_feedback: feedback,
      });
    } else {
      res.json({
        msg: "failed to delted the feedback",
      });
    }
  }
});
app.delete("/delete-tdty/:id", async function (req, res) {
  console.log("deletetdty1");
  let id = req.params.id;

  console.log("this is id to delete ", id);
  if (id !== undefined && id !== "" && id !== null) {
    let tdty = await TDTY.findByIdAndDelete(id);
    if (tdty) {
      console.log("tdty foud");

      var params = {
        Bucket: "onepage-tdty",
        Key: tdty.imgkey,
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err);
          callback(err);
        } else {
          console.log("no error in aws as well ");
          res.json({
            msg: "delted",
            tdty_deleted: true,
          });
        }
      });
    } else {
      res.json({
        msg: "failed to delted",
      });
    }
  }
});
app.delete("/delete-quote/:id", async function (req, res) {
  let id = req.params.id;

  if (id !== undefined && id !== "" && id !== null) {
    let quote = await Quote.findByIdAndDelete(id);
    if (quote) {
      console.log("quote foud");

      var params = {
        Bucket: "onepage-quotes",
        Key: quote.imgkey,
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err);
          callback(err);
        } else {
          console.log("no error in aws as well ");
          res.json({
            msg: "delted",
            quote_deleted: true,
          });
        }
      });
    } else {
      res.json({
        msg: "failed to delted",
      });
    }
  }
});

// get quotes by author
//

// ******Quotes ******************

// feedback
app.post("/create-feedback", async function (req, res) {
  console.log("trying to create feedback");
  let feedback = {
    email: req.body.payload.email,
    title: req.body.payload.title,
    description: req.body.payload.description,
  };
  let response = await Feedback.create(feedback);
  if (response) {
    console.log("feedback sent");
    res.json({
      feedbackAdded: true,
      feedback,
    });
  } else {
    res.json({
      feedbackAdded: false,
    });
  }
});

app.get("/all-feedback", async function (req, res) {
  let feedback = await Feedback.find();

  res.json({
    feedbacks: feedback.length,
    feedback,
  });
});
app.get("/all-tdty", async function (req, res) {
  console.log("trying to get all tdty");
  let tdty = await TDTY.find();

  res.json({
    tdtyl: tdty.length,
    tdty,
  });
});

// listening to ----
app.listen(process.env.PORT || 8000, () => {
  console.log("listening 8000");
});
