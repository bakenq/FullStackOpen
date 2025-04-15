import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    type,
    value,
    onChange
  }
}

const useCountry = (name) => {
  const [country, setCountry] = useState(null)
  const baseUrl = 'https://studies.cs.helsinki.fi/restcountries/api/name'

  useEffect(() => {
    if (!name) {
      setCountry(null)
      return
    }

    let isMounted = true

    axios.get(`${baseUrl}/${name}`)
      .then(response => {
        if (isMounted) {
          const rawData = response.data
          const displayData = {
            name: rawData.name?.common,
            capital: rawData.capital?.[0],
            population: rawData.population,
            flagUrl: rawData.flags?.png ?? rawData.flags?.svg,
            flagAlt: rawData.flags?.alt,
          }
          setCountry({ found: true, data: displayData })
        }
      })
      .catch(error => {
        console.error('API Error:', error)
        if (isMounted) {
          setCountry({ found: false, data: null })
        }
      })

    return () => {
      isMounted = false
    }

  }, [name])

  return country
}

const Country = ({ country }) => {
  if (!country) {
    return null
  }

  if (!country.found) {
    return (
      <div>
        not found...
      </div>
    )
  }

  const { name, capital, population, flagUrl, flagAlt } = country.data

  return (
    <div>
      <h3>{name} </h3>
      <div>capital {capital} </div>
      <div>population {population}</div>
      {flagUrl && <img src={flagUrl} height='100' alt={flagAlt}></img>}
    </div>
  )
}

const App = () => {
  const nameInput = useField('text')
  const [name, setName] = useState('')
  const country = useCountry(name)

  const fetch = (e) => {
    e.preventDefault()
    setName(nameInput.value)
  }

  return (
    <div>
      <form onSubmit={fetch}>
        <input {...nameInput} />
        <button>find</button>
      </form>

      <Country country={country} />
    </div>
  )
}

export default App