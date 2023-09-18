// Arrays for current and past cities entered
let searchHistory = []
let cityData = ""
// Variables for API URLs and API key
var initialUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";
var apiKey = "5ea5a9949ddb1597c11f87fc3d143ea6";
var coordUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=";

// API call to OpenWeather
let getWeather = function(city) {
    // Format for OpenWeather API
    // Entered "city" to retrieve city data
    let apiUrl = initialUrl + city + "&appid=" + apiKey + "&units=imperial";

// Fetch the data from API call
    fetch(apiUrl)
        
    // Function to display city data 
    // Accessing response and if response is "ok" (completed) then weather will be displayed
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    // Future function
                    displayWeather(data);
                });

            }
        })  
        
};

// Function for the any submittion within the html form
let formSubmit = function(event) {
    // Prevents event from refreshing
    event.preventDefault();

    // Input section for form
    // city id for any city value entered
    let citySearch = $("#city").val().trim();

    // if statement for city search and if city entered is within getWeather's API call data then display weather
    if(citySearch) {

        // gets city data from getWeather
        getWeather(citySearch);

        // Clears search input
        $("#city").val("");
    } 
};

// Created a function that I mentioned above to display the weather data according to entered city from the weather api
let displayWeather = function(weatherData) {

    // Set up for current day weather information and date
    // displays city name and current date using dayjs
    // Append weather icon based on current day ([0]) that matches with openweather api current weather
    $("#city-name").text(weatherData.name + " (" + dayjs(weatherData.dt * 1000).format("M/D/YYYY") + ") ").append(`<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"></img>`);
    // Displays current day temperature
    // toFixed() is a Number method that is used to convert a number to fixed-point notation (rounding the result where necessary) and return its value as a string
    $("#city-temp").text("Temperature: " + weatherData.main.temp.toFixed(1) + " °F");
    // Displays current day humidity
    $("#city-humid").text("Humidity: " + weatherData.main.humidity + "%");
    // Displays current day wind speed
    $("#city-wind").text("Wind Speed: " + weatherData.wind.speed.toFixed(1) + " mph");

// Fetching different url for weather forecast for next 5 days using longitude and latitude
    fetch(forecastUrl + weatherData.name + "&appid=" + apiKey + "&units=imperial")
        .then(function(response) {
            // Retrieves response data and implements into function
            response.json().then(function(data) {
        

                // Clears 5 day forecast section
                $("#five-day").empty();

                // This took me forever to figure out so this is going to be a long explanation
                /* The openweather api's 5 day forecast bases the 5 days as a value of 40 (Im assuming its based on a 40 hour work day so 9 hours a day).
                 In order to equally spread the current weather day and the next 5 days within that 40 hour span I had to figure out what increments to use. 
                 You cannot start at 0-6 as the current day will show twice (current day and the first day of the 5 day forecast) so I needed to start at 7.
                 From there I needed to find an increment to evenly spread across 40 without going over because going past 40 will cause the last day to not appear.
                 The increment of 8 starting at 7 ends the 5 day span at 39 which displays 5 days of weather */
                for(i = 7; i <= data.list.length; i += 8){
            
                    // This displays the 5 day weather forecast by adding a div within the section alloted for the forecast
                    // This allows the the forecast to appear rather than be on the page automatically
                    let fiveDayCard =
                    // Displays date using dayjs, weather icon like on current weather day, temperature, wind speed, and humidity
                        `<div class="col-md-2 mb-2 bg-info">
                            <h5>` + dayjs(data.list[i].dt * 1000).format("M/D/YYYY") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="Weather Icon" class="m-1">
                            <p>Temp: ` + data.list[i].main.temp + " °F" + `</p>
                            <p>Humidity: ` + data.list[i].main.humidity + "%" + `</p>
                            <p>Wind: ` + data.list[i].wind.speed + " mph" + `</p>
                        </div>`;

                    // Appends the forecast card to the id
                    $("#five-day").append(fiveDayCard);
               }
            })
        });

    // Saves the last city searched
    cityData = weatherData.name;

    // Saves the search history using openweather api's name value
    saveHistoryData(weatherData.name);
};

// Function to save the city searched in form to local storage
let saveHistoryData = function (city) {

    // if statement stating that if the the search history below the search bar does not inslude the city searched then it should load beneath if
    // if the city is already present then no need to add again
    if(!searchHistory.includes(city)){
        searchHistory.push(city);
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + city + "'>" + city + "</a>")
    } 

    // Saves searchHistory array to local storage
    localStorage.setItem("searchHistoryData", JSON.stringify(searchHistory));

    // Saves city data to local storage
    localStorage.setItem("cityData", JSON.stringify(cityData));

    // Displays the search history based on what city has been entered
    loadHistoryData();
};

// Function to load city data saved to local storage
let loadHistoryData = function() {

    // Retrieves search history data from local storage
    searchHistory = JSON.parse(localStorage.getItem("searchHistoryData"));
    // Retrieves the city name data from local storage
    cityData = JSON.parse(localStorage.getItem("cityData"));
  
    // If not data is present then this creates an empt array
    if (!searchHistory) {
        searchHistory = []
    }

    if (!cityData) {
        cityData = ""
    }

    // Clears any previous data from the search history unordered list
    $("#search-history").empty();

    // For loop that runs through the cities avilable in the city data of openweather api
    for(i = 0 ; i < searchHistory.length ;i++) {


        // Converts the display city name in search history to link to pull data from storage if clicked
        // Append to unordered list
        $("#search-history").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHistory[i] + "'>" + searchHistory[i] + "</a>");
    }
  };

// Displays the search history based on what city has been entered
loadHistoryData();

// Starts webpage off with most recent search from local storage
if (cityData != ""){
    getWeather(cityData);
}

// Event handlers for form submittion and click functions
$("#search-form").submit(formSubmit);
$("#search-history").on("click", function(event){

    // Retrieves links value from id
    let pastCity = $(event.target).closest("a").attr("id");

    // Pushes id's link value to getWeather function
    getWeather(pastCity);
});


