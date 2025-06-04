let currentUser = null;
let currentPeriodType = 'day';
let currentPeriodValue = new Date().getDate();
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    // 인증 상태 확인
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            initializePeriodSelectors();
            loadTransactions();
        } else {
            window.location.href = 'index.html';
        }
    });

    // 네비게이션 버튼 이벤트 리스너 추가
    document.getElementById('calendarBtn').addEventListener('click', function() {
        window.location.href = 'calendar.html';
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        confirmLogout();
    });

    // 기간 선택 이벤트
    document.getElementById('periodType').addEventListener('change', handlePeriodTypeChange);
    document.getElementById('periodValue').addEventListener('change', handlePeriodValueChange);

    // 정렬 옵션
    document.getElementById('sortBy').addEventListener('change', sortTransactions);
});

// 로그아웃 확인 함수
function confirmLogout() {
    if (confirm('한지윤 로그아웃 하신다?')) {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('로그아웃 오류:', error);
        });
    }
}

function initializePeriodSelectors() {
    const periodTypeSelect = document.getElementById('periodType');
    const periodValueSelect = document.getElementById('periodValue');
    
    // 초기 설정
    updatePeriodValueOptions();
    
    // 현재 날짜로 초기값 설정
    const today = new Date();
    periodTypeSelect.value = 'day';
    periodValueSelect.value = today.getDate();
}

function handlePeriodTypeChange() {
    currentPeriodType = document.getElementById('periodType').value;
    updatePeriodValueOptions();
    loadTransactions();
}

function handlePeriodValueChange() {
    currentPeriodValue = parseInt(document.getElementById('periodValue').value);
    loadTransactions();
}

function updatePeriodValueOptions() {
    const periodValueSelect = document.getElementById('periodValue');
    const currentYear = new Date().getFullYear();
    
    periodValueSelect.innerHTML = '';
    
    switch (currentPeriodType) {
        case 'day':
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + '일';
                periodValueSelect.appendChild(option);
            }
            currentPeriodValue = new Date().getDate();
            break;
        case 'week':
            for (let i = 1; i <= 5; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + '주';
                periodValueSelect.appendChild(option);
            }
            currentPeriodValue = Math.ceil(new Date().getDate() / 7);
            break;
        case 'month':
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + '월';
                periodValueSelect.appendChild(option);
            }
            currentPeriodValue = new Date().getMonth() + 1;
            break;
        case 'year':
            for (let i = 2020; i <= currentYear; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + '년';
                periodValueSelect.appendChild(option);
            }
            currentPeriodValue = currentYear;
            break;
    }
    
    periodValueSelect.value = currentPeriodValue;
}

function loadTransactions() {
    if (!currentUser) return;

    const transactionsRef = database.ref('transactions/' + currentUser.uid);
    
    transactionsRef.on('value', (snapshot) => {
        transactions = [];
        const data = snapshot.val();
        
        if (data) {
            Object.keys(data).forEach(key => {
                transactions.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        filterAndDisplayTransactions();
    });
}

function filterAndDisplayTransactions() {
    const now = new Date();
    let filteredTransactions = [];

    switch (currentPeriodType) {
        case 'day':
            const targetDate = new Date(now.getFullYear(), now.getMonth(), currentPeriodValue);
            const dateString = targetDate.toISOString().split('T')[0];
            filteredTransactions = transactions.filter(t => t.date === dateString);
            break;
        case 'week':
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const weekStart = new Date(firstDayOfMonth);
            weekStart.setDate(weekStart.getDate() + (currentPeriodValue - 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= weekStart && transactionDate <= weekEnd;
            });
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), currentPeriodValue - 1, 1);
            const monthEnd = new Date(now.getFullYear(), currentPeriodValue, 0);
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= monthStart && transactionDate <= monthEnd;
            });
            break;
        case 'year':
            const yearStart = new Date(currentPeriodValue, 0, 1);
            const yearEnd = new Date(currentPeriodValue, 11, 31);
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= yearStart && transactionDate <= yearEnd;
            });
            break;
    }

    updateSummary(filteredTransactions);
    displayTransactions(filteredTransactions);
}

function updateSummary(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += parseInt(transaction.amount);
        } else {
            totalExpense += parseInt(transaction.amount);
        }
    });

    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = totalIncome.toLocaleString() + '원';
    document.getElementById('totalExpense').textContent = totalExpense.toLocaleString() + '원';
    document.getElementById('totalBalance').textContent = balance.toLocaleString() + '원';
}

function displayTransactions(transactions) {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        transactionList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">거래 내역이 없습니다.</p>';
        return;
    }

    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.category}</h4>
                <p>${transaction.date} ${transaction.memo ? '• ' + transaction.memo : ''}</p>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${parseInt(transaction.amount).toLocaleString()}원
            </div>
        `;
        
        transactionList.appendChild(transactionElement);
    });
}

function sortTransactions() {
    const sortBy = document.getElementById('sortBy').value;
    
    transactions.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'amount':
                return parseInt(b.amount) - parseInt(a.amount);
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
    
    filterAndDisplayTransactions();
}
