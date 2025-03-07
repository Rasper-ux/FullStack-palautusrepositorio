import { useState, useEffect } from "react"
import axios from "axios"

const api_key = import.meta.env.VITE_WEATHER_API_KEY

const Countries = ({ countriesToShow, handleShow }) => {
  if (countriesToShow.length > 10) {
    return <div>Too many matches, specify another filter</div>
  }
  if (countriesToShow.length === 1) {
    const country = countriesToShow[0]
    return <Country country={country} />
  }
  return (
    <div>
      {countriesToShow.map(country => (
        <div key={country.name.common}>
          {country.name.common}
          <button onClick={() => handleShow(country.name.common)}>Show</button>
        </div>
      ))}
    </div>
  )
}

const Country = ({ country }) => {
  const [weather, setWeather] = useState(null)


  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const geoResponse = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${country.capital[0]}&limit=1&appid=${api_key}`
        )

        const { lat, lon } = geoResponse.data[0];

        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
        )

        setWeather(weatherResponse.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    fetchWeather()
  }, [country])

  return (
    <div>
      <h2>{country.name.common}</h2>
      <div>Capital {country.capital[0]}</div>
      <div>Area {country.area}</div>
      <h3>Languages</h3>
      <ul>
        {Object.values(country.languages).map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={country.name.common} width="100" />
      <h3>Weather in {country.capital[0]}</h3>
      {weather ? (
        <div>
          <div>Temperature {weather.main.temp} Celsius</div>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <div>Wind {weather.wind.speed} m/s</div>
        </div>
      ) : (
        <div>Loading weather...</div>
      )}
    </div>
  )
}

const Search = ({ search, handleSearchChange }) => {
  return (
    <div>
      find countries <input value={search} onChange={handleSearchChange} />
    </div>
  )
}

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }
    , [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  const handleShow = (name) => {
    setSearch(name)
  }

  const countriesToShow = countries.filter(country => country.name.common.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <Search search={search} handleSearchChange={handleSearchChange} />
      <Countries countriesToShow={countriesToShow} handleShow={handleShow} />
    </div>
  )
}

export default App