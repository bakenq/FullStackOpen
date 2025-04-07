const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

morgan.token('body', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    const personCount = persons.length

    const responseHtml = `
        <p>Phonebook has info for ${personCount} people</p>
        <p>${currentTime}</p>
    `

    response.send(responseHtml)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number missing' })
    }

    const nameExists = persons.some(p => p.name.toLowerCase() === body.name.toLowerCase())
    if (nameExists) {
        return response.status(400).json({ error: 'name must be unique' })
    }

    const generateId = () => {
        const maxId = 1000000
        let newId
        do {
            newId = String(Math.floor(Math.random() * maxId))
        } while (persons.some(p => p.id === newId))
        return newId
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.status(201).json(person)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
