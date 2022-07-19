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

app.post(`${BASEURL}`, (request, response, next) => {
  const body = request.body;
  /* Alla oleva virhe käsitellään mongoosessa.
   * Onko käsittely backissä tarpeen?
   */
  // if (!body.name || !body.number) {
  //   response.status(400).json({
  //     error: "name or number missing",
  //   });
  //   return;
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put(`${BASEURL}/:id`, (request, response, next) => {
  console.log("put");
  const { name, number } = request.body;
  const person = {
    oldName: request.body.name,
    newNumber: request.body.number,
  };
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete(`${BASEURL}/:id`, (request, response, next) => {
  const id = Number(request.params.id);
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
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
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
