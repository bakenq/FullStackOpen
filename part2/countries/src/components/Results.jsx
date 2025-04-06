import React from 'react'

import CountryList from './CountryList'
import CountryDetail from './CountryDetail'

export default function Results({ query, filteredCountries }) {
    if (query === '') return null

    if (filteredCountries.length > 10)
        return <div>Too many matches, specify another filter</div>

    if (filteredCountries.length > 1)
        return <CountryList countries={filteredCountries} />

    if (filteredCountries.length === 1)
        return <CountryDetail country={filteredCountries[0]} />


    return (
        <div>
            <p>No country matches your filter.</p>
        </div>
    )
}
