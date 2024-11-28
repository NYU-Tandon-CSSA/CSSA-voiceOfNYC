// Google Sheets 配置
const SHEET_ID = '1wMH-vGM6BY-kh0fHDpJwsMlR28m66CemVViujBpZPVU'; // 替换为你的Google Sheet ID
const RANGE = 'Revival!A1:B5'; 
const API_KEY = 'AIzaSyDCoRajSD0Eux3Yf7ZsiIt06ayoB_g1Tz0'; // 替换为你的API密钥

async function fetchVoteData() {
    try {
        // 使用 Google Sheets API 获取数据
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();

        if (data.values) {
            // 获取投票数据和选手名字
            const names = data.values.map(row => row[0]);     
            const votes = data.values.map(row => parseInt(row[1])); 
            const totalVotes = votes.reduce((a, b) => a + b, 0);

            // 计算每个选项的百分比
            const percentages = votes.map(vote => ((vote / totalVotes) * 100).toFixed(1));

            // 更新每个柱状图、标签和选手名字
            for (let i = 0; i < 5; i++) {
                const percentage = percentages[i];
                const name = names[i];
                const barNum = i + 1;
                
                // 更新柱状图高度，添加 'px' 单位
                const bar = document.getElementById(`bar${barNum}`);
                if (bar) {
                    bar.style.height = `${percentage}%`;
                }
                
                // 更新柱状图上方的标签
                const label = document.getElementById(`bar${barNum}-label`);
                if (label) {
                    label.textContent = `${percentage}%`;
                }
                
                // 更新选手名字
                const nameElement = document.getElementById(`name${barNum}`);
                if (nameElement) {
                    nameElement.textContent = name;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

// 每分钟更新一次数据
setInterval(fetchVoteData, 60000);

// 初次加载数据
fetchVoteData();
