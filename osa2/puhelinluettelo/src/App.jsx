import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ handleFilterChange }) => {
  return (
    <div>
      filter shown with <input
        id="filter"
        name="filter"
        onChange={handleFilterChange}
      />
    </div>
  )
}

const PersonForm = ({ addPerson, newName, handlePersonChange, newNumber, handleNumberChange }) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input
          id="name"
          name="name"
          value={newName}
          onChange={handlePersonChange}
        />
      </div>
      <div>
        number: <input
          id="number"
          name="number"
          value={newNumber}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ personsToShow, removePerson }) => {
  return (
    <div>
      {personsToShow.map(person => (
        <p key={person.name}>
          {person.name} {person.number}
          <button onClick={() => removePerson(person.id)}>delete</button>
        </p>
      ))}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [completeMessage, setCompleteMessage] = useState({ message: null, error: false })

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])


  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    if (persons.find(person => person.name === newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        updateNumber(persons.find(person => person.name === newName).id, newNumber)
      }

    } else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setCompleteMessage({
            message: `Added ${personObject.name}`, error: false
          })
          setTimeout(() => {
            setCompleteMessage({ message: null, error: false })
          }, 5000)
        })
    }
  }

  const removePerson = id => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setCompleteMessage({
            message: `Removed ${person.name}`, error: false
          })
          setTimeout(() => {
            setCompleteMessage({ message: null, error: false })
          }, 5000)
        })
    }
  }

  const updateNumber = (id, newNumber) => {
    const person = persons.find(person => person.id === id)
    const changedPerson = { ...person, number: newNumber }

    personService
      .update(id, changedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
        setNewName('')
        setNewNumber('')
        setCompleteMessage({
          message: `Updated ${person.name}`, error: false
        })
        setTimeout(() => {
          setCompleteMessage({ message: null, error: false })
        }, 5000)
      })
      .catch(error => {
        setNewName('')
        setNewNumber('')
        setCompleteMessage({
          message: `Information of ${person.name} has already been removed from server`, error: true
        })
        setTimeout(() => {
          setCompleteMessage({ message: null, error: false })
        }, 5000)
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  const Notification = ({ message, error }) => {
    if (message === null) {
      return null
    }

    return (
      <div className={error ? "error" : "completed"}>
        {message}
      </div>
    )
  }

  const handlePersonChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
    if (event.target.value === '') {
      setShowAll(true)
    } else {
      setShowAll(false)
    }
  }

  const personsToShow = showAll
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase
      ()))


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={completeMessage.message} error={completeMessage.error} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handlePersonChange={handlePersonChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons
        personsToShow={personsToShow}
        removePerson={removePerson}
      />
    </div>
  )

}

export default App