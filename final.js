// Google Sheets 配置
const SHEET_ID = '1wMH-vGM6BY-kh0fHDpJwsMlR28m66CemVViujBpZPVU'; // 替换为你的Google Sheet ID
const RANGE = 'Final!A1:B6'; 
const API_KEY = 'AIzaSyDCoRajSD0Eux3Yf7ZsiIt06ayoB_g1Tz0'; // 替换为你的API密钥

let currentDisplayCount = 0;  // 当前显示的分数数量

function highlightWinner(scores) {
    // 找出最高分
    const maxScore = Math.max(...scores.slice(0, 6));
    
    // 找出所有最高分选手（可能有平局）
    const winnerIndices = scores
        .slice(0, 6)
        .map((score, index) => ({ score, index }))
        .filter(item => item.score === maxScore)
        .map(item => item.index);

    // 移除所有现有的winner类
    document.querySelectorAll('.contestant').forEach(el => {
        el.classList.remove('winner');
    });

    // 为胜者添加特效
    winnerIndices.forEach(index => {
        const winnerElement = document.querySelector(`.contestant:nth-child(${index + 1})`);
        if (winnerElement) {
            winnerElement.classList.add('winner');
        }
    });
}

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

            // 更新显示的分数
            for (let i = 0; i < currentDisplayCount; i++) {
                const score = scores[i];
                const contestantNum = i + 1;
                
                const scoreElement = document.querySelector(`.contestant:nth-child(${contestantNum}) .score`);
                if (scoreElement) {
                    scoreElement.textContent = `${score.toFixed(1)}/10`;
                }
            }

            // 如果所有分数都显示完了，突出显示胜者
            if (currentDisplayCount === 6) {
                highlightWinner(scores);
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
