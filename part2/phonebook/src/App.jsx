import { useState } from 'react'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
  ]);

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const addPerson = (event) => {
    event.preventDefault()

    const trimmedName = newName.trim()
    const trimmedNumber = newNumber.trim()
    if (trimmedName === '' || trimmedNumber === '') {
      alert('Please fill in both name and number')
      return
    }

    const nameExists = persons.some(person => person.name.toLowerCase() === trimmedName.toLowerCase())
    if (nameExists) {
      alert(`${trimmedName} is already added to phonebook`)
    } else {
      const personObject = {
        name: trimmedName,
        number: trimmedNumber,
        id: persons.length ? Math.max(...persons.map(p => p.id)) + 1 : 1
      }
      setPersons(persons.concat(personObject))
      setNewName('')
      setNewNumber('')
    }
  }

  const personsToShow = searchTerm === ''
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleSearchChange = (event) => setSearchTerm(event.target.value)

  return (
    <div>
      <h2>Phonebook</h2>

      <div>
        filter shown with:
        <input
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <h2>Add new person</h2>
      <form onSubmit={addPerson}>
        <div>
          name:
          <input
            value={newName}
            onChange={handleNameChange}
          />
        </div>
        <div>
          number:
          <input
            value={newNumber}
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h2>Numbers</h2>
      <div>
        {personsToShow.map((person) => (
          <p key={person.id}>
            {person.name} {person.number}
          </p>
        ))}
      </div>

    </div>
  )
}

export default App