import React from 'react'

export default function CountryDetail({ country }) {
    if (!country) return null

    const capital = country.capital ? country.capital : 'N/A'
    const languages = country.languages ? Object.values(country.languages) : []

    return (
        <div>
            <h1>{country.name.common}</h1>
            <p>Capital: {capital}</p>
            <p>Area: {country.area}</p>

            <h2>Languages</h2>
            <ul>
                {languages.map(lang => <li key={lang}>{lang}</li>)}
            </ul>

            <img src={country.flags.png} />
        </div>
    )
}
