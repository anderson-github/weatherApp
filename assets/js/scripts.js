// Primero vamos a traer datos de latitud y longitud que neceitamos
// para hacer las llamadas a la API del clima.

const apiKey = '889bbbc6508d7d70931f6f4d5a6c56b3'

const searchCityDiv = document.getElementById("search-city")
searchCityDiv.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){

        const city2 = document.getElementById("input-city").value
        const lonLatUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city2}&limit=8&appid=${apiKey}`

        const myPromise = new Promise((resolve, reject) => {
            let res = fetch(lonLatUrl)
            .then(response => response.json())
            .then(data =>{
                
                const lat = data[0].lat
                const lon = data[0].lon

                weatherApiCallData(lat, lon)
                
            });
        });
    }
})
// 

const actualLocationBtn = document.getElementById("btn-current-location-id")
actualLocationBtn.addEventListener("click", function(){

    console.log("Estoy entrando en actualLocationBtn")

    let coords = geolocationPosition.coords;
    const lat = coords.latitude
    const lon = coords.longitude

    weatherApiCallData(lat, lon)
})


function weatherApiCallData(lat, lon){

    const weatherUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        fetch(weatherUrl)
            .then(resp => resp.json())
            .then(datos => {
                // resolve(dataWeather)
                console.log("datos: ", datos)

                const city = datos['name']
                const country = datos['sys'].country
                const temperature= Math.round(datos['main'].temp)
                const humidity = datos['main'].humidity
                const pressure = datos['main'].pressure
                const realFeel = datos['main'].feels_like
                const actualWeather = datos['weather'][0].main
                const weatherDescription = datos['weather'][0].description
                const visibility = datos['visibility'] / 1000
                const weatherIcon = datos['weather'][0]['icon']
                
                // Working with dates:
                // Actual date and time:
                const unixTimestamp = datos['dt']
                const actualDate = new Date(unixTimestamp * 1000)

                // Sunrise and sunset datetimes:
                const sunriseDt = new Date(datos['sys'].sunrise * 1000)
                // const langRegion = "en-" + country
                // const options = {
                //     hour: "numeric",
                //     minute: "numeric",
                //     hour12: false
                // }
                // console.log("new sunrise: ", sunriseDt.toLocaleDateString(langRegion, options))

                const sunriseHour = sunriseDt.getHours().toString().padStart(2, '0')
                const sunriseMinutes = sunriseDt.getMinutes().toString().padStart(2, '0')

                const sunsetDt = new Date(datos['sys'].sunset * 1000)
                const sunsetHour = sunsetDt.getHours().toString().padStart(2, '0')
                const sunsetMinutes = sunsetDt.getMinutes().toString().padStart(2, '0')

                const sunTimes = [sunriseHour, sunriseMinutes, sunsetHour, sunsetMinutes]

                // Injecting data into HTML:
                injectDataIntoHTML(
                    temperature, weatherDescription,actualDate,
                    city, country, sunTimes,
                    humidity, pressure, visibility,
                    realFeel, weatherIcon)
            })
                    
            const forecastUrl =
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
            let forecast = fetch(forecastUrl)
                .then(resp => resp.json())
                .then(forecastData => {
                    const forecastList = injectForecastIntoHtml(forecastData)
                })

}


const arrayRange = (start, stop, step) => Array.from(
    {
        length: (stop - start) / step + 1 
    },
    (value, index) => start + index * step
    );

function injectDataIntoHTML(
    temperature, weatherDescription, actualDate,
    city, country, sunTimes,
    humidity, pressure, visibility,
    realFeel, weatherIcon){

        document.getElementById("view-state-id").innerHTML = `${city}, ${country}`
        document.getElementById("view-item-country-id").innerHTML = `${country}`

        // document.getElementById("actual-temp-id").innerHTML = `${temperature}&degC`
        document.getElementById("actual-temp-id").innerHTML = `
        <p  class="heading">${temperature}&degC</p>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}.png"
        width="150"
        height="150"
        alt=""
        class="weather-icon">
        `
        document.getElementById("weather-description-id").innerHTML = `${weatherDescription}`

        document.getElementById("actual-date-id").innerHTML = `${actualDate.
            toLocaleDateString('en-CO', {day: 'numeric', month: 'short', weekday: 'short'})}`

        document.getElementById("actual-location-id").innerHTML = `${city}, ${country}`
        document.getElementById("sunrise-id").innerHTML = `${sunTimes[0]}:${sunTimes[1]}`
        document.getElementById("sunset-id").innerHTML = `${sunTimes[2]}:${sunTimes[3]}`
        document.getElementById("humidity-id").innerHTML = `${humidity}<sub>%</sub>`
        document.getElementById("pressure-id").innerHTML = `${pressure}<sub>mb</sub>`
        document.getElementById("visibility-id").innerHTML = `${visibility}<sub>Km</sub>`
        document.getElementById("realFeel-id").innerHTML = `${realFeel}<sub>C</sub>`
        document.getElementById("air-quality-id").innerHTML = `${23.3} PM<sub>2.05</sub>`

}

function injectForecastIntoHtml(forecastData){

    console.log("forecast data: ", forecastData)
    let idxData = arrayRange(3, 27, 8)
    let forecastList = []
    
    for(let item=0; item<idxData.length; item++){

        forecastList.push(forecastData['list'][idxData[item]])
        let temp = forecastData['list'][idxData[item]]

        const unixToDate = new Date(temp['dt'] * 1000)
        const dateTime = unixToDate.toLocaleDateString('en-CO', {day: 'numeric', month: 'short', weekday: 'short'})
        console.log("Trasformed Date: ", dateTime)

        const temperature = Math.round(temp['main']['temp'])
        const forecastIcon= temp['weather'][0]['icon']

        // Injecting dynamically into HTML:
        document.getElementById("forecast-id").innerHTML += `
        <li class="card-item">
            <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${forecastIcon}.png" 
                width="60" height="60" alt="" 
                class="weather-icon">
                <span class="span">
                    <p class="title-2"> ${temperature} </p>
                </span>
            </div>
            <p class="label-1">${dateTime}</p>
        </li>        
        `
    }
    return forecastList
}

