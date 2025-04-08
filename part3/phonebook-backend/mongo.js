const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://bakenq:${password}@fso-cluster.9duwnkc.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=fso-cluster`

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// collection will be named 'people'
const Person = mongoose.model('Person', personSchema)

mongoose.connect(url)
    .then(() => {
        console.log('connected')

        // List phonebook entries
        if (process.argv.length === 3) {
            Person.find({})
                .then(persons => {
                    console.log('phonebook:')
                    persons.forEach(person => {
                        console.log(`${person.name} ${person.number}`)
                    })
                    return mongoose.connection.close()
                })
                .then(() => {
                    console.log('connection closed')
                })
                .catch(err => {
                    console.error('Error fetching persons:', err)
                    mongoose.connection.close()
                })

            // Add a new person to the phonebook
        } else if (process.argv.length === 5) {
            const name = process.argv[3]
            const number = process.argv[4]

            const person = new Person({
                name: name,
                number: number,
            })

            person.save()
                .then(savedPerson => {
                    console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`)
                    return mongoose.connection.close()
                })
                .then(() => {
                    console.log('connection closed')
                })
                .catch(err => {
                    console.error('Error saving person:', err)
                    mongoose.connection.close()
                })

            // Invalid number of arguments
        } else {
            console.log('Invalid number of arguments. Usage: node mongo.js <password> "<name>" <number>')
            mongoose.connection.close().then(() => process.exit(1))
        }
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message)
        process.exit(1)
    })
