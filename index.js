require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));
app.use(morgan("tiny", { skip: (req, res) => req.method === "POST" }));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

morgan.token("data", (req) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :data",
    { skip: (req, res) => req.method !== "POST" }
  )
);

const BASEURL = "/api/persons";

app.get("/", (req, res) => {
  res.send("<h1>Hello Worldss!</h1>");
});

app.get(`${BASEURL}`, (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get(`${BASEURL}/:id`, (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    // .catch((error) => {
    //   console.log(error);
    //   response.status(400).send({ error: "malformatted id" });
    // });
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  Person.countDocuments({}, function (err, count) {
    res.send(
      `<p>Phonebook has info for ${count} people.</p><p>${new Date()}</p>`
    );
  });
});

const generateId = () => {
  // const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  // return maxId + 1;
  return Math.floor(1000 * Math.random());
};

app.post(`${BASEURL}`, (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    response.status(400).json({
      error: "name or number missing",
    });
    return;
  }
  /*if (persons.find((p) => p.name === body.name)) {
    response.status(400).json({
      error: "name must be unique",
    });
    return;
  }*/

  const person = new Person({
    name: body.name,
    number: body.number,
    //id: generateId()
  });
  //persons = persons.concat(person);
  //response.json(person);
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.delete(`${BASEURL}/:id`, (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
