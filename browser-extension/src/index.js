import axios from 'axios';

// HTML 요소 선택
const form = document.querySelector('.form-data');
const regions = Array.from(document.querySelectorAll('.region-name'));
const apiKey = document.querySelector('.api-key');

const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const clearBtn = document.querySelector('.clear-btn');

// 아이콘 색상 계산 함수
const calculateColor = (value) => {
  const co2Scale = [0, 150, 600, 750, 800];
  const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];
  const closestNum = co2Scale.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
  const scaleIndex = co2Scale.indexOf(closestNum);
  const closestColor = colors[scaleIndex];

  chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

// API 데이터 가져오기 및 결과 표시 함수
const displayCarbonUsage = async (apiKey, regions) => {
  try {
    loading.style.display = 'block'; // 로딩 표시
    errors.textContent = ''; // 오류 메시지 초기화
    results.innerHTML = ''; // 기존 결과 초기화

    // 각 지역에 대해 API 요청 수행
    for (const region of regions) {
      try {
        console.log(`Fetching data for region: ${region}`); // 디버그용

        // API 요청
        const response = await axios.get('https://api.co2signal.com/v1/latest', {
          params: { countryCode: region },
          headers: { 'auth-token': apiKey },
        });

        // 데이터가 없는 경우 오류 발생
        if (!response.data || !response.data.data) {
          throw new Error(`No data available for region ${region}`);
        }

        // 데이터가 있는 경우 결과 표시
        const data = response.data.data;
        const CO2 = Math.floor(data.carbonIntensity);
        calculateColor(CO2);

        // 화석 연료 비율이 없을 경우 "N/A"로 표시
        const fossilFuelPercentage = data.fossilFuelPercentage != null ? data.fossilFuelPercentage.toFixed(2) : "N/A";

        // 개별 결과 생성 및 화면에 표시
        const regionResult = document.createElement('div');
        regionResult.classList.add('region-result');
        regionResult.innerHTML = `
          <h3>Region: ${region}</h3>
          <p><strong>Carbon Usage:</strong> ${CO2} grams (grams CO2 emitted per kilowatt hour)</p>
          <p><strong>Fossil Fuel Percentage:</strong> ${fossilFuelPercentage}%</p>
        `;

        results.appendChild(regionResult); // 결과 컨테이너에 추가

      } catch (regionError) {
        console.error(`Error fetching data for region ${region}:`, regionError);
        const errorElement = document.createElement('p');
        errorElement.textContent = `No data available for region ${region}`;
        results.appendChild(errorElement); // 오류 메시지 추가
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
  displayCarbonUsage(apiKey, regions);
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
    displayCarbonUsage(storedApiKey, storedRegions);
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
