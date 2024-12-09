// 두 개의 API URL 정의
const currencyLayerUrl = 'http://api.currencylayer.com/live?access_key=74bdaf552fd2c840a89905c33ed806c4&currencies=KRW&source=USD&format=1';
const exchangeRatesUrl = 'https://api.apilayer.com/exchangerates_data/latest?base=USD&symbols=KRW&apikey=Kjy3i7Zlfz8sskR43poGIqpEkQvXiCdq';

// 캔들스틱 차트를 설정
const ctx = document.getElementById('candlestickChart').getContext('2d');
const candlestickChart = new Chart(ctx, {
    type: 'candlestick',
    data: {
        datasets: [{
            label: 'USD/KRW',
            data: [], // 초기 데이터 비워둠
            borderColor: 'rgba(75, 192, 192, 1)',
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                adapters: {
                    date: {
                        locale: 'en-US'
                    }
                }
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

// API 데이터를 가져오는 함수
async function fetchCandleData() {
    try {
        // 첫 번째 API 호출 (Currency Layer)
        let response = await fetch(currencyLayerUrl);
        let data = await response.json();

        // Currency Layer 실패 시 두 번째 API 호출
        if (!data.success || !data.quotes || !data.quotes.USDKRW) {
            console.warn('Currency Layer API 실패, Exchange Rates API로 전환합니다.');

            response = await fetch(exchangeRatesUrl);
            data = await response.json();

            if (!data.success || !data.rates || !data.rates.KRW) {
                console.error('두 API 모두 실패했습니다.');
                return;
            }

            // Exchange Rates API 데이터 처리
            const rate = data.rates.KRW;
            updateChart(rate);
            return;
        }

        // Currency Layer API 데이터 처리
        const rate = data.quotes.USDKRW;
        updateChart(rate);

    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
    }
}

// 차트를 업데이트하는 함수
function updateChart(rate) {
    const chartData = [
        { t: new Date(), o: rate * 0.98, h: rate * 1.02, l: rate * 0.97, c: rate }
    ];

    candlestickChart.data.datasets[0].data = chartData;
    candlestickChart.update();
}

// 데이터를 주기적으로 가져오는 함수
fetchCandleData();
setInterval(fetchCandleData, 60000); // 1분마다 데이터 갱신
