import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { create } from "tar";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/post-codealong";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8000;
const app = express();

//create a model calles tasks
const Task = mongoose.model("Task", {
  text: {
    type: String,
    required: true,
    minlength: 5,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

//this is a get endpoint that returns 20 tasks in desc order based on createdAt which defined in the model. test in postman using GET http://localhost:8080/tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find().sort({createdAt: `desc`}).limit(20).exec();
  res.json(tasks);  
});

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// now we create a postreq with the same name as the get- request. this adds the data sent by the client to the database. and return a status code 201 if successful. 

app.post("/tasks", async (req, res) => { //retreives the data from the client to our api endpoint
  const { text, complete } = req.body; //use our model to create the database entry
  const task = new Task({ text, complete }); //
  try {
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: "Could not save task to database", error: err.errors });
  }
});
// test this in postman using POST http://localhost:8080/tasks and add the body raw json data. add this in the raw inputfield: 
//{
//"text": "this is a task",
 // "complete": "false"
//}
//and then press send. you should get a status code 201 and the data you sent in the response.

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
