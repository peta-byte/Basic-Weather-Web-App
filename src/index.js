const request = require("request");
const express = require("express");
const app = express();

const PORT = 3001;
const WEATHER_API = "https://www.metaweather.com/api";

const getConsolidatedWeather = (
  locationID,
  locationName,
  locationType,
  res
) => {
  let options = {
    url: `${WEATHER_API}/location/${locationID}`,
    method: "GET"
  };
  // 2nd request
  request(options, (error, response) => {
    if (error) {
      console.log(`Error from the 2nd request: ${error}`);
    } else if (response.statusCode !== 200) {
      console.log(
        `2nd request: A different response code of ${
          response.statusCode
        } and a body: ${response.body}`
      );
    } else {
      let body = JSON.parse(response.body);
      let consolidatedWeather = body.consolidated_weather;
      let weatherStateName = consolidatedWeather[0].weather_state_name;
      let date = consolidatedWeather[0].applicable_date;
      let data = {
        location: locationName,
        type: locationType,
        date: new Date(date).toDateString(),
        name: weatherStateName
      };
      res.render("weatherData", data);
    }
  });
};

app.use(express.static("views"));
app.use(express.urlencoded());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  let locationName = req.body.name;
  let options = {
    url: `${WEATHER_API}/location/search/?query=${locationName}`,
    method: "GET"
  };

  // 1st Request
  request(options, (error, response) => {
    if (error) {
      console.log(`Error: ${error}`);
    } else if (response.statusCode !== 200) {
      console.log(
        `No error. A different response code of ${
          response.statusCode
        } and a body: ${response.body}`
      );
    } else {
      let body = JSON.parse(response.body);
      let woeID = body[0].woeid;
      let locationName = body[0].title;
      let locationType = body[0].location_type;
      getConsolidatedWeather(woeID, locationName, locationType, res);
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`);
});
