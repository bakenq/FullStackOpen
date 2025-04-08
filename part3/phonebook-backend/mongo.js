const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://bakenq:${password}@fso-cluster.9duwnkc.mongodb.net/?retryWrites=true&w=majority&appName=fso-cluster`

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

        if (process.argv.length === 3) {
            return Person.find({})
                .then(result => {
                    console.log('phonebook:')
                    result.forEach(person => {
                        console.log(`${person.name} ${person.number}`)
                    })
                    mongoose.connection.close()
                })
        }
    })
