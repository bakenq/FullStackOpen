import React from 'react'

export default function CountryList({ countries }) {
    if (!countries || countries.length === 0) return null

  return (
    <div>
        {countries.map(country => (
            <p key={country.cca3}>{country.name.common}</p>
        ))}
    </div>
  )
}
