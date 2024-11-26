require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
app.use(express.json())
app.use(express.static('dist'))

const morgan = require('morgan')
morgan.token('data', function (req) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const cors = require('cors')
app.use(cors())

app.get('/info', (req, res) => {
  Person.find({}).then((data) => {
    const response = `<p>
    <br>Phonebook has info for ${data.length} people</br>
    <br>${Date()}</br>
    </p>`

    res.send(response)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((data) => {
    res.json(data)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndDelete(id)
    .then((result) => res.status(204).end())
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

app.post('/api/persons', (req, res, next) => {
  const newPerson = req.body

  // if (newPerson.name && newPerson.number) {
  //   if (!persons.some((p) => p.name === newPerson.name)) {
  //     newPerson.id = Math.floor(Math.random() * 20);
  //     persons = persons.concat(newPerson);
  //     res.json(newPerson);
  //   } else {
  //     res.status(400).json({ error: "name must be unique" });
  //   }
  // } else {
  //   res.status(400).json({ error: "name or number is missing" });
  // }

  if (!newPerson.name || !newPerson.number) {
    return res.status(404).json({ errro: 'name or number is missing ' })
  }

  const person = new Person(newPerson)

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch((err) => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  console.log(req.params.id)
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number is missing' })
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      console.log({
        updatedPerson,
      })
      if (!updatedPerson) {
        return res.status(404).json({ error: 'Person not Found' })
      }
      res.json(updatedPerson)
    })
    .catch((err) => next(err))
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`)
})

app.use(errorHandler)
