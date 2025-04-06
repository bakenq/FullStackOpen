import React, { useState, useEffect } from 'react'
import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

export default function Weather({ city }) {
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        setWeather(null)
        setError(null)

        if (!city || !apiKey) {
            setError(city ? 'API Key is missing' : null)
            setLoading(false)
            return
        }

        setLoading(true)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

        axios
            .get(weatherUrl)
            .then(response => {
                setWeather(response.data)
                setError(null)
            })
            .catch(error => {
                console.error('Error fetching weather data:', error)
                setWeather(null)
                setError('Error fetching weather data')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [city])


    if (loading) return <p>Loading weather...</p>

    if (error) return <p style={{ color: 'red' }}>{error}</p>

    if (!weather) return null

    return (
        <div>
            <p>Temperature: {weather.main.temp} °C</p>
            {weather.weather[0] && (
                <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                />
            )}
            <p>Wind: {weather.wind.speed} m/s</p>
        </div>
    )
}
