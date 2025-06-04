let currentUser = null;
let currentPeriod = 'daily';
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    // 인증 상태 확인
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            loadTransactions();
        } else {
            window.location.href = 'index.html';
        }
    });

    // 기간 선택 버튼
    document.getElementById('dailyBtn').addEventListener('click', () => setPeriod('daily'));
    document.getElementById('weeklyBtn').addEventListener('click', () => setPeriod('weekly'));
    document.getElementById('monthlyBtn').addEventListener('click', () => setPeriod('monthly'));

    // 정렬 옵션
    document.getElementById('sortBy').addEventListener('change', sortTransactions);
});

function setPeriod(period) {
    currentPeriod = period;
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(period + 'Btn').classList.add('active');
    
    loadTransactions();
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

    switch (currentPeriod) {
        case 'daily':
            const today = now.toISOString().split('T')[0];
            filteredTransactions = transactions.filter(t => t.date === today);
            break;
        case 'weekly':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= weekStart && transactionDate <= weekEnd;
            });
            break;
        case 'monthly':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= monthStart && transactionDate <= monthEnd;
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
