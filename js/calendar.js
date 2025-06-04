let currentUser = null;
let currentDate = new Date();
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

    // 캘린더 네비게이션
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 거래 추가 버튼
    document.getElementById('addTransactionBtn').addEventListener('click', openModal);

    // 모달 관련
    const modal = document.getElementById('transactionModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 거래 폼 제출
    document.getElementById('transactionForm').addEventListener('submit', saveTransaction);

    // 오늘 날짜로 초기화
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    renderCalendar();
});

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
        
        renderCalendar();
    });
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthHeader = document.getElementById('currentMonth');
    
    // 월 제목 업데이트
    monthHeader.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    
    // 캘린더 초기화
    calendar.innerHTML = '';
    
    // 요일 헤더
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.backgroundColor = '#f0f0f0';
        calendar.appendChild(dayHeader);
    });
    
    // 첫 번째 날과 마지막 날 계산
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 캘린더 날짜 생성
    const today = new Date();
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (date.getMonth() !== currentDate.getMonth()) {
            dayElement.classList.add('other-month');
        }
        
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        dayElement.innerHTML = `<span>${date.getDate()}</span>`;
        
        // 해당 날짜의 거래 내역 표시
        const dateString = date.toISOString().split('T')[0];
        const dayTransactions = transactions.filter(t => t.date === dateString);
        
        dayTransactions.forEach(transaction => {
            const badge = document.createElement('div');
            badge.className = `transaction-badge ${transaction.type}`;
            dayElement.appendChild(badge);
        });
        
        // 클릭 이벤트 (날짜 선택하여 거래 추가)
        dayElement.addEventListener('click', () => {
            document.getElementById('date').value = dateString;
            openModal();
        });
        
        calendar.appendChild(dayElement);
    }
}

function openModal() {
    document.getElementById('transactionModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('transactionModal').style.display = 'none';
    document.getElementById('transactionForm').reset();
}

function saveTransaction(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const memo = document.getElementById('memo').value;
    
    const transactionData = {
        type: type,
        category: category,
        amount: parseInt(amount),
        date: date,
        memo: memo,
        createdAt: new Date().toISOString()
    };
    
    // Firebase에 저장
    const transactionsRef = database.ref('transactions/' + currentUser.uid);
    transactionsRef.push(transactionData)
        .then(() => {
            closeModal();
            alert('거래가 저장되었습니다!');
        })
        .catch((error) => {
            alert('저장에 실패했습니다: ' + error.message);
        });
}
