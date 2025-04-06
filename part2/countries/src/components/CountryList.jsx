import React from 'react'

export default function CountryList({ countries, handleShowCountry }) {
    if (!countries || countries.length === 0) return null

  return (
    <div>
        {countries.map(country => (
            <div key={country.cca3}>
                <span>{country.name.common}</span>
                <button onClick={() => handleShowCountry(country)}>Show</button>
            </div>
        ))}
    </div>
  )
}
