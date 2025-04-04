import React from 'react'

export default function Persons({ persons, handleRemovePerson }) {
    return (
        <div>
            {persons.map((person) => (
                <div key={person.id}>
                    <span>
                        {person.name} {person.number}
                    </span>
                    <button
                        onClick={() => handleRemovePerson(person.id, person.name)}
                    >
                        delete
                    </button>
                </div>
            ))}
        </div>
    )
}
