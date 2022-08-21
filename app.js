const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// 用mongoose連結mongoDB
mongoose
  .connect("mongodb://localhost:27017/studentDB")
  .then(() => {
    console.log("Successfully!");
  })
  .catch((e) => {
    console.log("Failed");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send(".Homepage.");
});

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch {
    res.send("Error with finding data");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentpage.ejs", { data });
    } else {
      res.send("Please enter the Vaild number");
    }
  } catch (e) {
    res.send("ERROR");
    console.log(e);
  }
});

app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student Accepted");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student Not Accepted");
      console.log(e);
      res.render("reject.ejs");
    });
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data != null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cant find the Student");
    }
  } catch {
    res.send("Error");
  }
});

// method override
app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let data = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render("reject.ejs");
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Deleted!!");
    })
    .catch((e) => {
      console.log(e);
      res.send("Deleted Failed");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("404 Not Allowed");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
