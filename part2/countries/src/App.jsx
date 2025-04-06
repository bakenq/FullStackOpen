import { useState, useEffect } from 'react'
import axios from 'axios'

import Results from './components/Results'

function App() {
  const [query, setQuery] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setAllCountries(response.data)
      })
      .catch(error => {
        console.error('Error fetching countries:', error)
      })
  }, [])

  useEffect(() => {
    if (query === '') {
      setFilteredCountries([])
    } else {
      const results = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCountries(results)
    }
  }, [query, allCountries])

  const handleQueryChange = (event) => setQuery(event.target.value)

  const handleShowCountry = (country) => setQuery(country.name.common)

  return (
    <div>
      find countries <input value={query} onChange={handleQueryChange} />

      <Results
        query={query}
        filteredCountries={filteredCountries}
        handleShowCountry={handleShowCountry}
      />
    </div>
  )
}

export default App
