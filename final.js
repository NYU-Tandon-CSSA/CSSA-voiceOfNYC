// Google Sheets 配置
const SHEET_ID = '1wMH-vGM6BY-kh0fHDpJwsMlR28m66CemVViujBpZPVU'; // 替换为你的Google Sheet ID
const RANGE = 'Final!A1:B6'; 
const API_KEY = 'AIzaSyDCoRajSD0Eux3Yf7ZsiIt06ayoB_g1Tz0'; // 替换为你的API密钥

let currentDisplayCount = 0;  // 当前显示的分数数量

function highlightWinner(scores) {
    // 创建包含所有信息的数组
    const contestantsData = scores.slice(0, 6).map((score, index) => ({
        element: document.querySelector(`.contestant:nth-child(${index + 1})`),
        score: score,
        originalIndex: index
    }));
    
    // 按分数降序排序
    contestantsData.sort((a, b) => b.score - a.score);

    // 获取容器
    const container = document.getElementById('contestants');
    
    // 清空容器
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // 移除所有现有的名次类
    document.querySelectorAll('.contestant').forEach(el => {
        el.classList.remove('winner-gold', 'winner-silver', 'winner-bronze');
    });

    // 获取不同的分数值（去重）并排序
    const uniqueScores = [...new Set(contestantsData.map(data => data.score))].sort((a, b) => b - a);
    
    // 处理第一名
    const goldScore = uniqueScores[0];
    const goldMedalists = contestantsData.filter(data => data.score === goldScore);
    goldMedalists.forEach(data => {
        data.element.classList.add('winner-gold');
    });

    // 如果第一名没有并列，处理第二名
    if (goldMedalists.length === 1 && uniqueScores.length > 1) {
        const silverScore = uniqueScores[1];
        const silverMedalists = contestantsData.filter(data => data.score === silverScore);
        silverMedalists.forEach(data => {
            data.element.classList.add('winner-silver');
        });

        // 如果第二名也没有并列，处理第三名
        if (silverMedalists.length === 1 && uniqueScores.length > 2) {
            const bronzeScore = uniqueScores[2];
            const bronzeMedalists = contestantsData.filter(data => data.score === bronzeScore);
            bronzeMedalists.forEach(data => {
                data.element.classList.add('winner-bronze');
            });
        }
    } else if (goldMedalists.length > 1) {
        // 如果第一名有并列，直接处理第三名（跳过银牌）
        if (uniqueScores.length > 1) {
            const bronzeScore = uniqueScores[1];  // 第二高的分数作为铜牌
            const bronzeMedalists = contestantsData.filter(data => data.score === bronzeScore);
            bronzeMedalists.forEach(data => {
                data.element.classList.add('winner-bronze');
            });
        }
    }

    // 重新排列元素
    contestantsData.forEach(data => {
        container.appendChild(data.element);
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

            // 更新显示的分数，保留两位小数
            for (let i = 0; i < currentDisplayCount; i++) {
                const score = scores[i];
                const contestantNum = i + 1;
                
                const scoreElement = document.querySelector(`.contestant:nth-child(${contestantNum}) .score`);
                if (scoreElement) {
                    scoreElement.textContent = `${score.toFixed(2)}/10`;
                }
            }

            // 如果所有分数都显示完了，突出显示胜者
            if (currentDisplayCount === 6) {
                setTimeout(() => {
                    highlightWinner(scores);
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

// 监听键盘事件
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && currentDisplayCount < 6) {  // 空格键显示下一个分数
        currentDisplayCount++;
        fetchVoteData();
    } else if (event.code === 'KeyR') {  // 按R键刷新所有数据
        fetchVoteData();
    }
});

// 初始化：显示所有名字，但不显示分数
currentDisplayCount = 0;
fetchVoteData();
