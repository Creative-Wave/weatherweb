import index from "@/pages";
import { Divider } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";

import {
  Cloud,
  CloudRain,
  CloudRainIcon,
  Cloudy,
  Search,
  Snowflake,
  Sun,
} from "lucide-react";
import { Key, useEffect, useState } from "react";

const Display = () => {
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [queryCity, setQueryCity] = useState("");

  const weatherBgimage = {
    clear: "clear.jpg",
    cloudy: "cloud.jpg",
    rain: "rain.jpg",
    snow: "snow.jpg",
    // Add other weather conditions as needed
  };

  const weatherIcon = {
    clear: Sun,
    Cloudy: Cloud,
    rain: CloudRainIcon,
    snow: Snowflake,
  };

  const getBackgroundImage = (condition: string) => {
    const conditionKey = condition.toLowerCase() as keyof typeof weatherBgimage;
    return weatherBgimage[conditionKey] || "default.jpg";
  };

  const getweatherIcon = (condition: string) => {
    const conditionKey = condition.toLowerCase() as keyof typeof weatherIcon;
    return weatherIcon[conditionKey] || Sun;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLong(position.coords.longitude.toString());
        },
        (error) => {
          console.log("Geolocation error", error);
        }
      );
    } else {
      console.log("Geolocation is not supported");
    }
  }, []);

  const fetchWeather = async () => {
    const query = queryCity ? queryCity : `${lat},${long}`;
    console.log(`Fetching weather for: ${query}`);

    const res = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=2af48d111221474891f134804232809&q=${query}&days=7`
    );

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["weather", queryCity, lat, long],
    queryFn: fetchWeather,
    enabled: !!lat && !!long, // Only run the query if lat and long are set
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQueryCity(city);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-transparent flex justify-center items-center h-screen">
        Weather loading........
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent flex justify-center items-center h-screen">
        Error fetching weather data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-transparent flex justify-center items-center h-screen">
        No data available
      </div>
    );
  }

  const backgroundImage = getBackgroundImage(data?.current?.condition?.text);
  const WeatherIcon = getweatherIcon(data?.current?.condition?.text);

  return (
    <>
      <div
        className="h-screen flex justify-center items-center text-white relative"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Left Section Start */}
        <div className="h-full w-[60%] flex flex-col justify-between items-start relative px-24 py-10">
          {/* Logo Start */}
          <div className="">the Weather</div>
          {/* Logo End */}
          <div className="flex justify-between items-center space-x-8">
            <h1 className="text-7xl font-b mb-4">{data?.current?.temp_c}°C</h1>
            <div className="font-bold">
              <h1>{data?.location?.name}</h1>
              <p>
                {new Date().toLocaleTimeString()} -{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="">
              <WeatherIcon size={52} className="text-white" />
            </div>
          </div>
        </div>
        {/* Left Section End */}

        {/* Right Section Start */}
        <div className="h-full w-[40%] bg-black/10 backdrop-blur-lg relative py-5 px-10 flex justify-center items-start">
          <div className="w-full h-full flex flex-col justify-between items-start">
            {/* Search Bar */}
            <form
              className="mb-8 w-full flex space-x-5 items-center text-white"
              onSubmit={handleSearch}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full p-4 border-b-2 border-gray-300 bg-transparent focus:outline-none"
                style={{ boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.5)" }}
              />
              <button
                type="submit"
                className="p-4 text-white rounded-lg bg-[#6a706b88] hover:bg-[#6a706b] transition ">
                <Search size={24} />
              </button>
            </form>
            {/* Search Bar End */}

            <div className="text-white text-lg mb-4">Weekday Forecast</div>
            <div className="w-full flex justify-between items-center space-x-4 mb-4">
              {data.forecast.forecastday.map((day: any) => (
                <div
                  key={day.date}
                  className="w-[150px] h-[130px] bg-white/30 rounded-lg backdrop-blur-sm space-y-2 flex flex-col justify-center items-center">
                  <div className="">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <img
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                    className="w-8 h-8"
                  />
                  <div className="">{day.day.avgtemp_c}°C</div>
                </div>
              ))}
            </div>

            {/* hour bae weather report */}

            {/* Weather Details Start */}
            <div className="w-full flex flex-col justify-between items-start space-y-6">
              <Divider className="mb-8" />

              <div className="font-bold mb-8">Weather Details</div>
              <div className="w-full flex justify-between items-center">
                <div className="">Condition</div>
                <div className="">{data?.current?.condition?.text}</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="">Humidity</div>
                <div className="">{data?.current?.humidity}%</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="">Wind</div>
                <div className="">{data?.current?.wind_kph} km/h</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div className="">Rain</div>
                <div className="">{data?.current?.precip_mm} mm</div>
              </div>
            </div>
            {/* Weather Details End */}
          </div>
        </div>
        {/* Right Section End */}
      </div>
    </>
  );
};

export default Display;
