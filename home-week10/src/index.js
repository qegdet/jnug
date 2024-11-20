import axios from 'axios';

// HTML 요소 선택
const form = document.querySelector('.form-data');
const regions = Array.from(document.querySelectorAll('.region-name'));
const apiKey = document.querySelector('.api-key');

const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const clearBtn = document.querySelector('.clear-btn');

// API 데이터 가져오기 및 결과 표시 함수
const displayWeatherData = async (apiKey, regions) => {
  try {
    loading.style.display = 'block'; // 로딩 표시
    errors.textContent = ''; // 오류 메시지 초기화
    results.innerHTML = ''; // 기존 결과 초기화

    // 각 지역에 대해 API 요청 수행
    for (const region of regions) {
      try {
        console.log(`Fetching weather data for region: ${region}`); // 디버그용

        // OpenWeatherMap API 요청
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: region,
            appid: apiKey,
            units: 'metric', // 섭씨 온도 사용
          },
        });

        // 데이터가 없는 경우 오류 발생
        if (!response.data) {
          throw new Error(`No weather data available for region ${region}`);
        }

        // 데이터가 있는 경우 결과 표시
        const data = response.data;
        const temperature = Math.round(data.main.temp); // 온도
        const description = data.weather[0].description; // 날씨 설명
        const humidity = data.main.humidity; // 습도
        const windSpeed = data.wind.speed; // 풍속

        // 개별 결과 생성 및 화면에 표시
        const regionResult = document.createElement('div');
        regionResult.classList.add('region-result');
        regionResult.innerHTML = `
          <h3>Region: ${region}</h3>
          <p><strong>Temperature:</strong> ${temperature}°C</p>
          <p><strong>Condition:</strong> ${description}</p>
          <p><strong>Humidity:</strong> ${humidity}%</p>
          <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        `;

        results.appendChild(regionResult); // 결과 컨테이너에 추가

      } catch (regionError) {
        console.error(`Error fetching weather data for region ${region}:`, regionError);
        const errorElement = document.createElement('p');
        errorElement.textContent = `No weather data available for region ${region}`;
        results.appendChild(errorElement); // 오류 메시지 추가
        console.error(`Error fetching weather data for region ${region}:`, JSON.stringify(regionError));
    
         errorElement.textContent = `Error fetching weather data for region ${region}. Check console for details.`;
       results.appendChild(errorElement);
      }
    }

    loading.style.display = 'none'; // 로딩 숨기기
    results.style.display = 'block'; // 결과 표시

    // 폼 숨기기
    form.style.display = 'none';
    clearBtn.style.display = 'block';

  } catch (error) {
    console.error(error);
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent = 'Sorry, we have no data for the regions you have requested.';
    
  }
};

// 사용자 설정 함수
function setUpUser(apiKey, regions) {
  localStorage.setItem('apiKey', apiKey);
  localStorage.setItem('regions', JSON.stringify(regions));
  loading.style.display = 'block';
  errors.textContent = '';
  clearBtn.style.display = 'block';
  displayWeatherData(apiKey, regions);
}

// 제출 처리 함수
function handleSubmit(e) {
  e.preventDefault();
  const regionValues = regions.map(region => region.value).filter(Boolean); // 빈 값 제외한 각 지역 필드 값 가져오기
  setUpUser(apiKey.value, regionValues);
}

// 초기화 함수
function init() {
  const storedApiKey = localStorage.getItem('apiKey');
  const storedRegions = JSON.parse(localStorage.getItem('regions'));

  if (!storedApiKey || !storedRegions) {
    form.style.display = 'block';
    results.style.display = 'none';
    loading.style.display = 'none';
    clearBtn.style.display = 'none';
    errors.textContent = '';
  } else {
    form.style.display = 'none';
    clearBtn.style.display = 'block';
    loading.style.display = 'block';
    displayWeatherData(storedApiKey, storedRegions);
  }
}

// 데이터 리셋 함수
function reset(e) {
  e.preventDefault();
  localStorage.removeItem('apiKey');
  localStorage.removeItem('regions');
  form.style.display = 'block';  // 폼 다시 표시
  results.style.display = 'none'; // 결과 숨기기
  clearBtn.style.display = 'none';
  errors.textContent = '';  // 오류 메시지 초기화
}

form.addEventListener('submit', handleSubmit);
clearBtn.addEventListener('click', reset);

init();  // 초기화 함수 호출
