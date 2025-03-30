document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소
    const authContainer = document.getElementById('auth-container');
    
    // 현재 로그인된 사용자
    let currentUser = null;
    
    // 초기화: 저장된 사용자 정보 확인
    function init() {
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        } else {
            updateAuthUI();
        }
    }
    
    // 인증 UI 업데이트
    function updateAuthUI() {
        if (currentUser) {
            // 로그인 상태
            authContainer.innerHTML = `
                <div class="user-info">안녕하세요, ${currentUser.username}님!</div>
                <button id="logout-btn" class="btn btn-sm btn-outline">로그아웃</button>
            `;
            
            // 로그아웃 버튼 이벤트 리스너
            document.getElementById('logout-btn').addEventListener('click', logout);
            
            // 즐겨찾기 섹션 표시
            if (document.getElementById('favorites-section')) {
                document.getElementById('favorites-section').style.display = 'block';
            }
            
            // 이벤트 발생 - 로그인 성공 알림
            const loginEvent = new CustomEvent('userLoggedIn', { detail: currentUser });
            document.dispatchEvent(loginEvent);
        } else {
            // 로그아웃 상태
            authContainer.innerHTML = `
                <a href="login.html" class="btn btn-sm">로그인</a>
                <a href="register.html" class="btn btn-sm btn-outline">회원가입</a>
            `;
            
            // 즐겨찾기 섹션 숨기기
            if (document.getElementById('favorites-section')) {
                document.getElementById('favorites-section').style.display = 'none';
            }
            
            // 이벤트 발생 - 로그아웃 알림
            document.dispatchEvent(new Event('userLoggedOut'));
        }
    }
    
    // 로그아웃 처리
    function logout() {
        // 로그인 정보 삭제
        localStorage.removeItem('currentUser');
        currentUser = null;
        
        // UI 업데이트
        updateAuthUI();
    }
    
    // 현재 시간 및 사용자 표시 (푸터)
    function updateTimeAndUser() {
        const timeElement = document.getElementById('current-time');
        const userElement = document.getElementById('current-user');
        
        if (timeElement) {
            timeElement.textContent = "2025-03-20 06:16:50";
        }
        
        if (userElement) {
            userElement.textContent = "taetae0110";
        }
    }
    
    // 초기화 실행
    init();
    updateTimeAndUser();
});