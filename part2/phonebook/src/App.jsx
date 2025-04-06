import { useState, useEffect, useRef } from 'react'

import './index.css'

import personService from './services/persons'

import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null });
  const notificationTimeoutId = useRef(null);

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        alert('Failed to load phonebook data from server.')
      })
  }, [])


  const displayNotification = (message, type = 'success', duration = 5000) => {
    if (notificationTimeoutId.current) {
      clearTimeout(notificationTimeoutId.current);
    }

    setNotification({ message, type });
    
    notificationTimeoutId.current = setTimeout(() => {
      setNotification({ message: null, type: null });
      notificationTimeoutId.current = null;
    }, duration);
  };


  const addPerson = (event) => {
    event.preventDefault()

    const trimmedName = newName.trim()
    const trimmedNumber = newNumber.trim()

    if (trimmedName === '' || trimmedNumber === '') {
      alert('Please fill in both name and number')
      return
    }

    const nameExists = persons.find(p => p.name.toLowerCase() === trimmedName.toLowerCase())

    if (nameExists) {
      if (window.confirm(`${trimmedName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPersonObject = { ...nameExists, number: trimmedNumber }

        personService
          .update(nameExists.id, updatedPersonObject)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== nameExists.id ? person : returnedPerson))

            displayNotification(`Updated number for ${returnedPerson.name}`, 'success');
            
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            console.error('Error updating person:', error)
            displayNotification(`Failed to update number for ${nameExists.name}.`, 'error');
          })
      }
    } else {
      const personObject = {
        name: trimmedName,
        number: trimmedNumber,
      }
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))

          displayNotification(`Added ${returnedPerson.name}`, 'success');

          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          console.error('Error adding person:', error)
          displayNotification(`Failed to add ${personObject.name}.`, 'error');
        })
    }
  }

  const removePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .removePerson(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))

          displayNotification(`Deleted ${name}`, 'success');
        })
        .catch(error => {
          console.error('Error deleting person:', error)
          displayNotification(`Failed to delete ${name}.`, 'error');
        })
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
      <Notification notification={notification} />

      <Filter
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
      />

      <h2>Add new person</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />

      <h2>Numbers</h2>
      <Persons
        persons={personsToShow}
        handleRemovePerson={removePerson}
      />

    </div>
  )
}

export default App