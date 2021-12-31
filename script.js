"use-strict";

//Elements

const currentDay = document.querySelector(".current-day");
let otherDaysContainer = document.querySelector(".other-days");

const searchBtn = document.querySelector("#search");
const input = document.getElementById("text");

const preloadDiv = document.querySelector(".preload");
const preloadText = document.querySelector(".preload-text");

const body = document.querySelector("body");

const goBackBtn = document.querySelector(".close-preload");

//Render weather function for displaying results on UI
const renderWeather = function (data, cityName) {
  //Current day elements
  currentDay.innerHTML = `<h2 class="city-name">${
    cityName ? cityName : "Current Location"
  }</h2>
      <h3 class="temp">${data.current.temp.toFixed(1)}°C</h3>
      <div class="min-max">
        <p class="min">Low: <span>${data.daily[0].temp.min.toFixed(
          1
        )}°C</span></p>
        <p class="max">High: <span>${data.daily[0].temp.max.toFixed(
          1
        )}°C</span></p>
      </div>
      <div class="desc-and-icon">
          <p class="weather-desc">${data.current.weather[0].description}</p>
          <img src="http://openweathermap.org/img/wn/${
            data.current.weather[0].icon
          }@4x.png " class="weather-icon" alt="icon">
      </div>
      <div class="more-info">
        <div class="sunrise-sunset">
    <p class="sunrise">Sunrise: <span>${window
      .moment(data.current.sunrise * 1000)
      .format("HH:mm a")}</span></p>
    <p class="sunset">Sunset: <span>${window
      .moment(data.current.sunset * 1000)
      .format("HH:mm a")}</span></p>
  </div>
  <div class="pressure-humidity">
    <p class="pressure">Pressure: <span>${data.current.pressure} kPa</span></p>
    <p class="humidity">Humidity: <span>${data.current.humidity} %</span></p>
  </div>
</div>`;

  //Elements for 7 day forecast, starting with index 1 because index 0 is current day

  for (let i = data.daily.length - 1; i >= 1; i--) {
    const others = `
        <div class="other-day">
        <h5 class="day">${window
          .moment(data.daily[i].dt * 1000)
          .format("dddd")} </h5>
        <img src="http://openweathermap.org/img/wn/${
          data.daily[i].weather[0].icon
        }@2x.png " class="weather-icon" alt="icon">
        <div class="other-min-max">
          <p class="min">L:${data.daily[i].temp.min.toFixed(0)}°C</p>
          <p class="max">H:${data.daily[i].temp.max.toFixed(0)}°C</p>
        </div>
      </div>
      `;
    otherDaysContainer.insertAdjacentHTML("afterbegin", others);
  }
};

//Funtion returning geolocation as new Promise
const currentPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

//Display error for user
const displayError = function (errMsg) {
  preloadText.textContent = errMsg;
};

//Change background image depending on weather description
const changeBgImage = function (weatherDesc) {
  if (weatherDesc.includes("overcast clouds")) {
    body.style.backgroundImage = "url('img/overcastClouds.jpg')";
  } else if (weatherDesc.includes("clear")) {
    body.style.backgroundImage = "url('img/clearSky.jpg')";
  } else if (weatherDesc.includes("scattered")) {
    body.style.backgroundImage = "url('img/scatteredBrokenClouds.jpg')";
  } else if (weatherDesc.includes("broken")) {
    body.style.backgroundImage = "url('img/scatteredBrokenClouds.jpg')";
  } else if (weatherDesc.includes("rain")) {
    body.style.backgroundImage = "url('img/rain.jpg')";
  } else if (weatherDesc.includes("drizzle")) {
    body.style.backgroundImage = "url('img/rain.jpg')";
  } else if (weatherDesc.includes("thunderstorm")) {
    body.style.backgroundImage = "url('img/thunder.jpg')";
  } else if (weatherDesc.includes("snow")) {
    body.style.backgroundImage = "url('img/snowy.jpg')";
  } else if (weatherDesc.includes("mist")) {
    body.style.backgroundImage = "url('img/mist.jpg')";
  } else if (weatherDesc.includes("haze")) {
    body.style.backgroundImage = "url('img/mist.jpg')";
  } else if (weatherDesc.includes("few clouds")) {
    body.style.backgroundImage = "url('img/fewClouds.jpg')";
  } else if (weatherDesc.includes("fog")) {
    body.style.backgroundImage = "url('img/mist.jpg')";
  } else {
    body.style.backgroundColor = "#5c99b1";
  }
};

//Get weather data from geolocation weather API
const weatherDataGeoLoc = async function () {
  try {
    const apiKey = "b9397320e242edb9df82636abb1f6c51";

    //Getting coords from promise above to use them in API for current location
    const curPosRes = await currentPosition();
    const { latitude: lat, longitude: lon } = curPosRes.coords;

    //Weather API response with coords from geolocation
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&units=metric&appid=${apiKey}`
    );

    //Throwing error manualy in case something is wrong
    if (!response.ok) {
      preloadDiv.style.opacity = 1;
      goBackBtn.style.opacity = 1;
      throw new Error("Problem getting location data");
    } else {
      preloadDiv.style.opacity = 0;
      preloadDiv.style.zIndex = 0;
    }

    //Weather API data
    const data = await response.json();
    const weatherDescFromData = data.current.weather[0].description;

    //Change background image
    changeBgImage(weatherDescFromData);

    //Calling renderWeather to display data
    renderWeather(data);
  } catch (err) {
    //Displaying error in console and on UI
    console.error(err);
    displayError(err.message);
  }
};

//Calling weather data with geolocation as soon as app loads
weatherDataGeoLoc();

//Function for getting data for different cities
const inputWeatherData = async function () {
  try {
    const apiKey = "b9397320e242edb9df82636abb1f6c51";

    //Value from search input to use in API below to get desired city/town
    let city = document.getElementById("text").value;

    const inputResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    //Throwing error manualy in case something is wrong
    if (!inputResponse.ok) {
      preloadDiv.style.opacity = 1;
      goBackBtn.style.opacity = 1;
      throw new Error("City not found, check spelling and try again!");
    } else {
      preloadDiv.style.opacity = 0;
      preloadDiv.style.zIndex = 0;
    }

    //Data
    const inputData = await inputResponse.json();
    console.log(inputData);
    const weatherDesc = inputData.weather[0].description;

    changeBgImage(weatherDesc);

    //Getting coords from data to use them in API
    const { lat, lon } = inputData.coord;

    //City name variable to be displayed on UI
    const cityName = inputData.name;

    //API for 7 day forecast
    const geoLocRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&units=metric&appid=${apiKey}`
    );

    //Weather data
    const weatherData = await geoLocRes.json();

    //Render new data for desired city when function is called
    renderWeather(weatherData, cityName);
  } catch (err) {
    //Display in console and UI
    console.error(err);
    displayError(err.message);
  }
};

//Click on search button calls function for desired city and empties search input
searchBtn.addEventListener("click", function () {
  preloadDiv.style.zIndex = 2000;
  otherDaysContainer.innerHTML = "";
  inputWeatherData();
  input.value = "";
});

//Press ENTER to call function that searches for desired city and empties search input
input.addEventListener("keyup", function (e) {
  if (e.keyCode === 13) {
    preloadDiv.style.zIndex = 2000;
    otherDaysContainer.innerHTML = "";
    inputWeatherData();
    input.value = "";
  }
});

//Click on GO BACK button to go back to initiat settings
goBackBtn.addEventListener("click", function () {
  preloadDiv.style.opacity = 0;
  preloadDiv.style.zIndex = 0;
  goBackBtn.style.opacity = 0;
  weatherDataGeoLoc();
});
