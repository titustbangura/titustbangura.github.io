// Weather App JavaScript - Using WeatherAPI.com
class WeatherApp {
    constructor() {
        // WeatherAPI.com configuration
        this.API_KEY = '0f4de240b4454e9aa2f174858252009'; // Your WeatherAPI key
        this.BASE_URL = 'https://api.weatherapi.com/v1';
        
        // Initialize recent searches array with error handling
        try {
            this.recentSearches = JSON.parse(localStorage.getItem('weatherSearches')) || [];
        } catch (error) {
            console.warn('Error parsing recent searches from localStorage:', error);
            this.recentSearches = [];
        }
        
        // Ensure recentSearches is always an array
        if (!Array.isArray(this.recentSearches)) {
            this.recentSearches = [];
        }
        
        this.initializeElements();
        this.bindEvents();
        this.displayRecentSearches();
        
        // No default city loading - user must search for location
    }
    
    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherCard = document.getElementById('weatherCard');
        this.forecastCard = document.getElementById('forecastCard');
        this.recentSearchesElement = document.getElementById('recentSearches');
        this.welcomeMessage = document.getElementById('welcomeMessage');
    }
    
    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
    }
    
    handleSearch() {
        const city = this.cityInput.value.trim();
        if (city) {
            this.getWeatherData(city);
        }
    }
    

    
    async getWeatherData(city) {
        this.showLoading();
        
        try {
            console.log(`Fetching weather for: ${city}`);
            
            // WeatherAPI.com current weather and forecast (combined in one call)
            const weatherUrl = `${this.BASE_URL}/forecast.json?key=${this.API_KEY}&q=${city}&days=5&aqi=yes`;
            console.log('API URL:', weatherUrl);
            
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                const errorText = await weatherResponse.text();
                console.error('API Error:', weatherResponse.status, errorText);
                
                if (weatherResponse.status === 401 || weatherResponse.status === 403) {
                    throw new Error('Invalid API key. Please check your WeatherAPI key.');
                } else if (weatherResponse.status === 400) {
                    throw new Error('City not found. Please check the spelling and try again.');
                } else {
                    throw new Error(`API Error: ${weatherResponse.status}`);
                }
            }
            
            const data = await weatherResponse.json();
            console.log('Weather data received:', data);
            
            // Convert WeatherAPI data to our expected format
            const weatherData = this.convertWeatherAPIData(data);
            const forecastData = this.convertForecastData(data);
            
            this.displayWeatherData(weatherData);
            this.displayForecastData(forecastData);
            this.addToRecentSearches(city);
            this.hideLoading();
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message);
            this.hideLoading();
        }
    }

    // Convert WeatherAPI data to our display format
    convertWeatherAPIData(data) {
        return {
            name: data.location.name,
            sys: { country: data.location.country },
            main: {
                temp: Math.round(data.current.temp_c),
                feels_like: Math.round(data.current.feelslike_c),
                humidity: data.current.humidity,
                pressure: data.current.pressure_mb
            },
            weather: [{
                main: data.current.condition.text,
                description: data.current.condition.text.toLowerCase(),
                icon: this.getWeatherIcon(data.current.condition.code, data.current.is_day)
            }],
            wind: { speed: data.current.wind_kph / 3.6 }, // Convert km/h to m/s
            visibility: data.current.vis_km * 1000, // Convert km to meters
            clouds: { all: data.current.cloud }
        };
    }

    // Convert WeatherAPI forecast data
    convertForecastData(data) {
        return {
            list: data.forecast.forecastday.map(day => ({
                dt: new Date(day.date).getTime() / 1000,
                main: {
                    temp_max: Math.round(day.day.maxtemp_c),
                    temp_min: Math.round(day.day.mintemp_c)
                },
                weather: [{
                    main: day.day.condition.text,
                    icon: this.getWeatherIcon(day.day.condition.code, 1)
                }]
            }))
        };
    }

    // Map WeatherAPI condition codes to weather icons
    getWeatherIcon(code, isDay) {
        const iconMap = {
            1000: isDay ? '01d' : '01n', // Sunny/Clear
            1003: isDay ? '02d' : '02n', // Partly cloudy
            1006: '03d', // Cloudy
            1009: '04d', // Overcast
            1030: '50d', // Mist
            1063: '10d', // Patchy rain possible
            1066: '13d', // Patchy snow possible
            1069: '13d', // Patchy sleet possible
            1072: '09d', // Patchy freezing drizzle possible
            1087: '11d', // Thundery outbreaks possible
            1114: '13d', // Blowing snow
            1117: '13d', // Blizzard
            1135: '50d', // Fog
            1147: '50d', // Freezing fog
            1150: '09d', // Patchy light drizzle
            1153: '09d', // Light drizzle
            1168: '09d', // Freezing drizzle
            1171: '09d', // Heavy freezing drizzle
            1180: '10d', // Patchy light rain
            1183: '10d', // Light rain
            1186: '10d', // Moderate rain at times
            1189: '10d', // Moderate rain
            1192: '10d', // Heavy rain at times
            1195: '10d', // Heavy rain
            1198: '09d', // Light freezing rain
            1201: '09d', // Moderate or heavy freezing rain
            1204: '13d', // Light sleet
            1207: '13d', // Moderate or heavy sleet
            1210: '13d', // Patchy light snow
            1213: '13d', // Light snow
            1216: '13d', // Patchy moderate snow
            1219: '13d', // Moderate snow
            1222: '13d', // Patchy heavy snow
            1225: '13d', // Heavy snow
            1237: '13d', // Ice pellets
            1240: '10d', // Light rain shower
            1243: '10d', // Moderate or heavy rain shower
            1246: '10d', // Torrential rain shower
            1249: '13d', // Light sleet showers
            1252: '13d', // Moderate or heavy sleet showers
            1255: '13d', // Light snow showers
            1258: '13d', // Moderate or heavy snow showers
            1261: '13d', // Light showers of ice pellets
            1264: '13d', // Moderate or heavy showers of ice pellets
            1273: '11d', // Patchy light rain with thunder
            1276: '11d', // Moderate or heavy rain with thunder
            1279: '11d', // Patchy light snow with thunder
            1282: '11d'  // Moderate or heavy snow with thunder
        };
        
        return iconMap[code] || '01d';
    }
    
    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }
        
        this.showLoading();
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 600000 // 10 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    console.log(`Getting weather for coordinates: ${latitude}, ${longitude}`);
                    
                    const weatherUrl = `${this.BASE_URL}/forecast.json?key=${this.API_KEY}&q=${latitude},${longitude}&days=5&aqi=yes`;
                    console.log('Weather URL:', weatherUrl);
                    
                    const response = await fetch(weatherUrl);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Weather API Error:', response.status, errorText);
                        throw new Error(`API Error: ${response.status} - ${errorText}`);
                    }
                    
                    const data = await response.json();
                    console.log('Weather data received:', data);
                    
                    // Convert WeatherAPI data to our expected format
                    const weatherData = this.convertWeatherAPIData(data);
                    const forecastData = this.convertForecastData(data);
                    
                    this.displayWeatherData(weatherData);
                    this.displayForecastData(forecastData);
                    this.addToRecentSearches(weatherData.name);
                    this.hideLoading();
                    
                } catch (error) {
                    console.error('Location weather error:', error);
                    this.showError(`Unable to fetch weather data: ${error.message}. Please try searching for a city instead.`);
                    this.hideLoading();
                }
            },
            (error) => {
                let errorMessage = 'Unable to get your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown location error occurred.';
                        break;
                }
                console.error('Geolocation error:', error);
                this.showError(errorMessage);
                this.hideLoading();
            },
            options
        );
    }
    
    displayWeatherData(data) {
        // Update city and country
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('countryName').textContent = data.sys.country;
        
        // Update current time
        const currentTime = new Date().toLocaleString();
        document.getElementById('currentTime').textContent = `Updated: ${currentTime}`;
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        document.getElementById('weatherIcon').src = 
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // Update temperature
        document.getElementById('currentTemp').textContent = Math.round(data.main.temp);
        document.getElementById('feelsLike').textContent = 
            `Feels like ${Math.round(data.main.feels_like)}°C`;
        
        // Update weather description
        document.getElementById('weatherDesc').textContent = data.weather[0].description;
        
        // Update weather details
        document.getElementById('visibility').textContent = 
            `${(data.visibility / 1000).toFixed(1)} km`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('windSpeed').textContent = 
            `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        // UV Index and cloud cover (simulated as they're not in basic API)
        document.getElementById('uvIndex').textContent = this.getUVIndex(data.weather[0].id);
        document.getElementById('cloudCover').textContent = `${data.clouds.all}%`;
        
        // Hide welcome message and show weather card with animation
        this.welcomeMessage.style.display = 'none';
        this.weatherCard.style.display = 'block';
        this.weatherCard.classList.add('fade-in');
        
        // Update input field
        this.cityInput.value = data.name;
    }
    
    displayForecastData(data) {
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        
        // Get forecast for next 5 days (every 24 hours)
        const dailyForecasts = this.processForecastData(data.list);
        
        dailyForecasts.forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${this.formatDate(forecast.dt)}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" 
                         alt="${forecast.weather[0].description}">
                </div>
                <div class="forecast-desc">${forecast.weather[0].main}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(forecast.main.temp_max)}°</span>
                    <span class="forecast-low">${Math.round(forecast.main.temp_min)}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
        
        // Show forecast card with animation
        this.forecastCard.style.display = 'block';
        this.forecastCard.classList.add('fade-in');
    }
    
    processForecastData(forecasts) {
        // Group forecasts by day and get one per day
        const dailyForecasts = {};
        
        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).toDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = forecast;
            }
        });
        
        return Object.values(dailyForecasts).slice(0, 5);
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }
    }
    
    getUVIndex(weatherId) {
        // Simulate UV index based on weather condition
        if (weatherId >= 200 && weatherId < 600) return '2'; // Storms/rain
        if (weatherId >= 600 && weatherId < 700) return '1'; // Snow
        if (weatherId >= 700 && weatherId < 800) return '3'; // Atmosphere
        if (weatherId === 800) return '8'; // Clear sky
        if (weatherId > 800) return '5'; // Clouds
        return '3'; // Default
    }
    
    addToRecentSearches(city) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(search => 
            search.toLowerCase() !== city.toLowerCase()
        );
        
        // Add to beginning
        this.recentSearches.unshift(city);
        
        // Keep only last 5 searches
        if (this.recentSearches.length > 5) {
            this.recentSearches = this.recentSearches.slice(0, 5);
        }
        
        // Save to localStorage
        localStorage.setItem('weatherSearches', JSON.stringify(this.recentSearches));
        
        this.displayRecentSearches();
    }
    
    displayRecentSearches() {
        if (this.recentSearches.length === 0) {
            this.recentSearchesElement.style.display = 'none';
            return;
        }
        
        const recentList = document.getElementById('recentList');
        recentList.innerHTML = '';
        
        this.recentSearches.forEach(city => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            recentItem.textContent = city;
            recentItem.addEventListener('click', () => {
                this.cityInput.value = city;
                this.getWeatherData(city);
            });
            recentList.appendChild(recentItem);
        });
        
        this.recentSearchesElement.style.display = 'block';
    }
    
    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.errorMessage.style.display = 'none';
        this.weatherCard.style.display = 'none';
        this.forecastCard.style.display = 'none';
        this.welcomeMessage.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }
    
    showError(message) {
        this.errorMessage.style.display = 'block';
        document.getElementById('errorText').textContent = message;
        this.weatherCard.style.display = 'none';
        this.forecastCard.style.display = 'none';
        // Show welcome message again when there's an error
        this.welcomeMessage.style.display = 'block';
    }
    
    showNotification(message, type = 'info') {
        // Create notification if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
        }
        
        // Set styles based on type
        const colors = {
            info: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('cityInput').focus();
        }
    });
    
    // Add click outside to clear focus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('cityInput').blur();
        }
    });
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/weather-sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
