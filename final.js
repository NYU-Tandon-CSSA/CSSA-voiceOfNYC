// Google Sheets 配置
const SHEET_ID = '1wMH-vGM6BY-kh0fHDpJwsMlR28m66CemVViujBpZPVU'; // 替换为你的Google Sheet ID
const RANGE = 'Final!A1:B6'; 
const API_KEY = 'AIzaSyDCoRajSD0Eux3Yf7ZsiIt06ayoB_g1Tz0'; // 替换为你的API密钥

let currentDisplayCount = 0;  // 当前显示的分数数量

async function fetchVoteData() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();

        if (data.values) {
            const names = data.values.map(row => row[0]);     
            const scores = data.values.map(row => parseFloat(row[1])); 

            // 更新所有选手的名字
            for (let i = 0; i < 6; i++) {
                const name = names[i];
                const nameElement = document.getElementById(`name${i + 1}`);
                if (nameElement) {
                    nameElement.textContent = name;
                }
            }

            // 只更新到当前显示数量的分数
            for (let i = 0; i < currentDisplayCount; i++) {
                const score = scores[i];
                const contestantNum = i + 1;
                
                const scoreElement = document.querySelector(`.contestant:nth-child(${contestantNum}) .score`);
                if (scoreElement) {
                    scoreElement.textContent = `${score.toFixed(1)}/10`;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

// 监听键盘事件
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && currentDisplayCount < 6) {  // 空格键
        currentDisplayCount++;
        fetchVoteData();
    }
});

// 初始化：显示所有名字，但不显示分数
currentDisplayCount = 0;
fetchVoteData();

// 继续定时更新
setInterval(fetchVoteData, 60000);
