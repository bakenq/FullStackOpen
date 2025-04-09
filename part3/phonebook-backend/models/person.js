const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

if (!url) {
    console.error('MONGODB_URI is not defined')
    process.exit(1);
}

mongoose.set('strictQuery', false)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'Name must be at least 3 characters long'],
        required: [true, 'Name is required'],
    },
    number: {
        type: String,
        minLength: [8, 'Number must be at least 8 characters long'],
        required: [true, 'Number is required'],
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d+$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number. Use XX-XXXX... or XXX-XXXX... (digits only)`
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)