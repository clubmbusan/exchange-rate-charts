const currencyLayerUrl = 'https://api.currencylayer.com/live?access_key=74bdaf552fd2c840a89905c33ed806c4&currencies=KRW&source=USD&format=1';
const exchangeRatesUrl = 'https://api.apilayer.com/exchangerates_data/latest?base=USD&symbols=KRW&apikey=Kjy3i7Zlfz8sskR43poGIqpEkQvXiCdq';

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

            const rate = data.rates.KRW;
            updateChart(rate);
            return;
        }

        const rate = data.quotes.USDKRW;
        updateChart(rate);

    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
    }
}

function updateChart(rate) {
    const chartData = [
        { t: new Date(), o: rate * 0.98, h: rate * 1.02, l: rate * 0.97, c: rate }
    ];

    candlestickChart.data.datasets[0].data = chartData;
    candlestickChart.update();
}

fetchCandleData();
setInterval(fetchCandleData, 60000);
