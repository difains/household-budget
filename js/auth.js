// 로그인 처리
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // 이미 로그인된 사용자 확인
    auth.onAuthStateChanged(function(user) {
        if (user && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
            window.location.href = 'dashboard.html';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('loginId').value;
            const password = document.getElementById('loginPassword').value;
            
            // Firebase Auth를 사용한 로그인
            auth.signInWithEmailAndPassword(userId + '@household.com', password)
                .then((userCredential) => {
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    alert('로그인에 실패했습니다: ' + error.message);
                });
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('signupId').value;
            const password = document.getElementById('signupPassword').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            
            // Firebase Auth를 사용한 회원가입
            auth.createUserWithEmailAndPassword(userId + '@household.com', password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // 사용자 정보를 데이터베이스에 저장
                    return database.ref('users/' + user.uid).set({
                        userId: userId,
                        email: email,
                        phone: phone,
                        createdAt: new Date().toISOString()
                    });
                })
                .then(() => {
                    alert('회원가입이 완료되었습니다!');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    alert('회원가입에 실패했습니다: ' + error.message);
                });
        });
    }
});

// 로그아웃 함수
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('로그아웃 오류:', error);
    });
}
