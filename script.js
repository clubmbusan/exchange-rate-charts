import { enUS } from 'date-fns/locale';

const apiUrl = 'https://api.exchangerate.host/timeseries?start_date=2023-12-01&end_date=2023-12-07&base=USD&symbols=KRW';

const ctx = document.getElementById('candlestickChart').getContext('2d');
const candlestickChart = new Chart(ctx, {
    type: 'candlestick',
    data: {
        datasets: [{
            label: 'USD/KRW',
            data: [], // 데이터를 비워둠
            borderColor: 'rgba(75, 192, 192, 1)',
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                adapters: {
                    date: {
                        locale: enUS, // 영어(미국) 로케일 추가
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
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.rates) {
            console.error('API 응답에 데이터가 없습니다.');
            return;
        }

        const chartData = Object.keys(data.rates).map(date => {
            const rate = data.rates[date].KRW;
            return {
                t: new Date(date), // 날짜
                o: rate * 0.98,    // 시가 (예시)
                h: rate * 1.02,    // 고가
                l: rate * 0.97,    // 저가
                c: rate            // 종가
            };
        });

        candlestickChart.data.datasets[0].data = chartData;
        candlestickChart.update();
    } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
    }
}

fetchCandleData();
setInterval(fetchCandleData, 60000);
