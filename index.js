const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "0400-123123",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "0400-123123",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "0400-123123",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "0400-123123",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello Worldss!</h1>");
});

app.get(`${BASEURL}`, (req, res) => {
  res.json(persons);
});

app.get(`${BASEURL}/:id`, (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => {
    return p.id === id;
  });
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/info", (req, res) => {
  const length = persons.length;
  res.send(
    `<p>Phonebook has info for ${length} people.</p><p>${new Date()}</p>`
  );
});

const generateId = () => {
  //const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  //return maxId + 1;
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
  if (persons.find((p) => p.name === body.name)) {
    response.status(400).json({
      error: "name must be unique",
    });
    return;
  }

  // console.log(request.get("Content-Type"));
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };
  persons = persons.concat(person);
  response.json(person);
});

app.delete(`${BASEURL}/:id`, (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
