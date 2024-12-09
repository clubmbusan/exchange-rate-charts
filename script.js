const exchangeRatesUrl = 'https://api.apilayer.com/exchangerates_data/latest?base=USD&symbols=KRW&apikey=Kjy3i7Zlfz8sskR43poGIqpEkQvXiCdq';
const currencyLayerUrl = 'https://api.currencylayer.com/live?access_key=74bdaf552fd2c840a89905c33ed806c4&currencies=KRW&source=USD&format=1';

const ctx = document.getElementById('candlestickChart').getContext('2d');
const candlestickChart = new Chart(ctx, {
    type: 'candlestick',
    data: {
        datasets: [{
            label: 'USD/KRW',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                adapters: {
                    date: {
                        locale: window.dateFnsLocaleEnUS // 로케일 설정
                    }
                }
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

async function fetchCandleData() {
    try {
        // 첫 번째 API 호출 (Exchange Rates API)
        console.log('Exchange Rates API 호출 중...');
        let response = await fetch(exchangeRatesUrl);

        if (response.status === 429) {
            console.warn('Exchange Rates API 요청 제한 초과. Currency Layer API로 전환합니다.');
            throw new Error('Too Many Requests');
        }

        let data = await response.json();
        if (!data.success || !data.rates || !data.rates.KRW) {
            throw new Error('Exchange Rates API 데이터 없음');
        }

        const rate = data.rates.KRW;
        updateChart(rate);
        return;
    } catch (error) {
        console.warn('Exchange Rates API 실패:', error);

        // Currency Layer API 호출
        try {
            console.log('Currency Layer API 호출 중...');
            const response = await fetch(currencyLayerUrl);
            let data = await response.json();

            if (!data.success || !data.quotes || !data.quotes.USDKRW) {
                throw new Error('Currency Layer API 데이터 없음');
            }

            const rate = data.quotes.USDKRW;
            updateChart(rate);
        } catch (innerError) {
            console.error('두 API 모두 실패:', innerError);
        }
    }
}

function updateChart(rate) {
    const chartData = [
        { t: new Date(), o: rate * 0.98, h: rate * 1.02, l: rate * 0.97, c: rate }
    ];

    candlestickChart.data.datasets[0].data = chartData;
    candlestickChart.update();
}

// 요청 간격을 늘려 API 요청 제한 문제 완화
fetchCandleData();
setInterval(fetchCandleData, 120000); // 2분 간격으로 요청
