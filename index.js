const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("dist"));

const morgan = require("morgan");
morgan.token("data", function (req) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

const cors = require("cors");
app.use(cors());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  const response = `<p>
    <br>Phonebook has info for ${persons.length} people</br>
    <br>${Date()}</br>
    </p>`;

  res.send(response);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  const person = persons.find((p) => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  persons = persons.filter((p) => p.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const newPerson = req.body;

  if (newPerson.name && newPerson.number) {
    if (!persons.some((p) => p.name === newPerson.name)) {
      newPerson.id = Math.floor(Math.random() * 20);
      persons = persons.concat(newPerson);
      res.json(newPerson);
    } else {
      res.status(400).json({ error: "name must be unique" });
    }
  } else {
    res.status(400).json({ error: "name or number is missing" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("server is running");
});
