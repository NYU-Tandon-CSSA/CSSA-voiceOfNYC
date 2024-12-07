// Google Sheets 配置
const SHEET_ID = '1wMH-vGM6BY-kh0fHDpJwsMlR28m66CemVViujBpZPVU'; // 替换为你的Google Sheet ID
const RANGE = 'Final!A1:B6'; 
const API_KEY = 'AIzaSyDCoRajSD0Eux3Yf7ZsiIt06ayoB_g1Tz0'; // 替换为你的API密钥

let currentDisplayCount = 0;  // 当前显示的分数数量
let showingAllContestants = true;  // 新增全局变量

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

    // 获取不��分数值（去重）并排序
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
    contestantsData.forEach((data, index) => {
        container.appendChild(data.element);
        data.element.style.display = 'block';  // 确保所有选手都显示
    });
    
    showingAllContestants = true;  // 设置标志，表示当前显示所有选手
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

            // 存储分数供后续使用
            window.lastScores = scores;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

// 监听键盘事件
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (currentDisplayCount < 6) {  // 显示下一个分数
            currentDisplayCount++;
            fetchVoteData();
        } else if (currentDisplayCount === 6 && !window.winnerHighlighted) {  // 显示获奖特效
            highlightWinner(window.lastScores);
            window.winnerHighlighted = true;
        } else if (showingAllContestants) {  // 隐藏后三名并调整前三名间距
            const contestants = document.querySelectorAll('.contestant');
            contestants.forEach((contestant, index) => {
                if (index > 2) {
                    contestant.style.display = 'none';
                } else {
                    // 减小前三名之间的间距
                    contestant.style.margin = '2vh 30px';  
                    contestant.style.display = 'inline-block';
                }
            });
            showingAllContestants = false;
        }
    } else if (event.code === 'KeyR') {  // 按R键重置
        currentDisplayCount = 0;
        showingAllContestants = true;
        window.winnerHighlighted = false;
        document.querySelectorAll('.contestant').forEach(el => {
            el.style.display = 'block';
            el.classList.remove('winner-gold', 'winner-silver', 'winner-bronze');
            el.style.margin = '2vh 30px';  // 重置为原始间距
        });
        fetchVoteData();
    }
});

// 初始化：显示所有名字，但不显示分数
currentDisplayCount = 0;
fetchVoteData();
