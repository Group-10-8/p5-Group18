/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

// session + JSON body parser
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

// for file upload forms
const processFormBody = multer({
  storage: multer.memoryStorage()
}).single('uploadedphoto');

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

app.use((req, res, next) => {
  if (req.path === "/admin/login" || req.path === "/admin/logout") {
    return next();
  }

  if (req.path === "/user" && req.method === "POST") {
    return next(); 
  }

  if (!req.session.user_id) {
    return res.status(401).send("Not logged in");
  }

  next();
});

/*
Login/Logout and scheme update part 
*/

app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).send("Missing login_name or password");
  }

  const user = await User.findOne({ login_name }).lean();

  if (!user || user.password !== password) {
    return res.status(400).send("Invalid login");
  }

  req.session.user_id = user._id;

  res.status(200).send({
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

app.post("/admin/logout", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Not logged in");
  }

  req.session.destroy(() => {
    res.status(200).send("Logged out");
  });
});

/**
 * URL /user/list - Returns all the User objects.
 * New MongoDB Implementation.
 */
app.get('/user/list', async function (req, res) {
  try {
    const users = await User.find({}, '_id first_name last_name').lean();
    res.status(200).send(users);
  } catch (err) {
    console.error('Error fetching user list:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send({ message: "Invalid user id format." });
    return;
  }

  try {
    const user = await User.findById(
      id,
      "_id first_name last_name location description occupation"
    ).lean();
    if (!user) {
      console.log("User with _id:" + id + " not found.");
      response.status(400).send({ message: "User not found." });
      return;
    }
    response.status(200).send(user);
  } catch (err) {
    console.error("Error in /user/:id:", err);
    response.status(500).send({ message: "Internal server error." });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user id.");
  }

  try {
    const user = await User.findById(id).select("_id").lean();
    if (!user) {
      return response.status(400).send("User not found.");
    }

    const photos = await Photo.find({ user_id: id })
      .select("_id user_id file_name date_time comments")
      .lean();

    const result = await Promise.all(
      photos.map(async (photo) => {
        const formattedComments = await Promise.all(
          (photo.comments || []).map(async (c) => {
            const commenter = await User.findById(
              c.user_id,
              "_id first_name last_name"
            ).lean();

            return {
              _id: c._id,
              comment: c.comment,
              date_time: c.date_time,
              user: commenter || null,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: formattedComments,
        };
      })
    );

    response.status(200).send(result);
  } catch (err) {
    console.error("Error in /photosOfUser/:id:", err);
    response.status(500).send("Internal server error.");
  }
});

app.post("/commentsOfPhoto/:photoId", express.json(), async function (request, response) {
  const photoId = request.params.photoId;
  const userId = request.session.user_id;
  const { comment } = request.body;

  if (!userId) {
    return response.status(401).send("User must be logged in to comment.");
  }

  if (!comment || comment.trim() === "") {
    return response.status(400).send("Comment cannot be empty.");
  }

  if (!mongoose.Types.ObjectId.isValid(photoId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send("Invalid photo id or user id.");
  }
  
  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(400).send("Photo not found.");
    }
    const newComment = {
      user_id: userId,
      comment: comment,
      date_time: new Date(),
    };
    photo.comments.push(newComment);
    await photo.save();
    response.status(200).send("Comment added successfully.");
  } catch (err) {
    console.error("Error adding comment:", err);
    return response.status(500).send("Internal server error.");
  }
});

app.post("/user", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("Missing required fields");
  }

  const existing = await User.findOne({ login_name });
  if (existing) {
    return res.status(400).send("Login name already exists");
  }

  try {
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();

    res.status(200).send("User registered successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error creating user");
  }
});
app.post("/photos/new", function (request, response) {
  // Must be logged in
  if (!request.session || !request.session.user_id) {
    return response.status(401).send("Not logged in");
  }

  processFormBody(request, response, function (err) {
    // If multer failed or no file was attached -> 400
    if (err || !request.file) {
      return response.status(400).send("No file uploaded.");
    }

    // Build a unique filename: U<timestamp><originalName>
    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    // Save file into ./images
    fs.writeFile("./images/" + filename, request.file.buffer, async function (err) {
      if (err) {
        console.error("Error writing file:", err);
        return response.status(500).send("Error saving file on server.");
      }

      try {
        // Create Photo document in MongoDB
        const newPhoto = await Photo.create({
          file_name: filename,
          date_time: new Date(),
          user_id: request.session.user_id,
          comments: []
        });

        // Success – send the created photo back
        return response.status(200).send(newPhoto);
      } catch (dbErr) {
        console.error("Error creating Photo:", dbErr);
        return response.status(500).send("Error saving photo in database.");
      }
    });
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
