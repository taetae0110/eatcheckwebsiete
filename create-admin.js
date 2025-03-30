document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소
    const createAdminForm = document.getElementById('create-admin-form');
    const usernameInput = document.getElementById('admin-username');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const confirmPasswordInput = document.getElementById('admin-confirm-password');
    const securityCodeInput = document.getElementById('security-code-input');
    const securityCodeDisplay = document.getElementById('security-code');
    const statusMessage = document.getElementById('status-message');
    
    // 현재 시스템에 이미 관리자가 있는지 확인
    function checkExistingAdmin() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminExists = users.some(user => user.role === 'admin');
        
        if (adminExists) {
            // 이미 관리자가 있는 경우 경고 메시지 표시
            statusMessage.textContent = '주의: 시스템에 이미 관리자 계정이 존재합니다. 추가 관리자 계정을 생성하려면 기존 관리자의 승인이 필요합니다.';
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
        }
    }
    
    // 관리자 계정 생성 폼 제출 처리
    createAdminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 입력값 가져오기
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const securityCode = securityCodeInput.value.trim();
        const expectedSecurityCode = securityCodeDisplay.textContent;
        
        // 입력값 유효성 검사
        
        // 1. 아이디 유효성 검사
        if (username.length < 4 || username.length > 20 || !/^[a-zA-Z0-9]+$/.test(username)) {
            showError('아이디는 4~20자의 영문, 숫자 조합이어야 합니다.');
            return;
        }
        
        // 2. 이메일 유효성 검사
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('유효한 이메일 주소를 입력해주세요.');
            return;
        }
        
        // 3. 비밀번호 유효성 검사
        if (password.length < 8 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
            showError('비밀번호는 8자 이상의 영문, 숫자 조합이어야 합니다.');
            return;
        }
        
        // 4. 비밀번호 확인
        if (password !== confirmPassword) {
            showError('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // 5. 보안 코드 확인
        if (securityCode !== expectedSecurityCode) {
            showError('보안 코드가 일치하지 않습니다.');
            return;
        }
        
        // 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // 아이디 중복 확인
        if (users.some(user => user.username === username)) {
            showError('이미 사용 중인 아이디입니다.');
            return;
        }
        
        // 이메일 중복 확인
        if (users.some(user => user.email === email)) {
            showError('이미 사용 중인 이메일입니다.');
            return;
        }
        
        // 새 관리자 계정 생성
        const newAdmin = {
            id: Date.now().toString(), // 간단한 고유 ID 생성
            username: username,
            email: email,
            password: password, // 실제 서비스에서는 비밀번호 해싱 필요
            role: 'admin', // 관리자 역할 지정
            status: 'active', // 계정 활성화 상태
            favorites: [] // 빈 즐겨찾기 목록
        };
        
        // 사용자 목록에 추가
        users.push(newAdmin);
        
        // localStorage에 저장
        localStorage.setItem('users', JSON.stringify(users));
        
        // 성공 메시지 표시
        showSuccess('관리자 계정이 성공적으로 생성되었습니다.<br>이제 로그인하여 관리자 페이지에 접근할 수 있습니다.');
        
        // 폼 초기화
        createAdminForm.reset();
        
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    });
    
    // 에러 메시지 표시 함수
    function showError(message) {
        statusMessage.innerHTML = message;
        statusMessage.className = 'status-message error';
        statusMessage.style.display = 'block';
    }
    
    // 성공 메시지 표시 함수
    function showSuccess(message) {
        statusMessage.innerHTML = message;
        statusMessage.className = 'status-message success';
        statusMessage.style.display = 'block';
    }
    
    // 현재 시간 업데이트
    function updateTime() {
        const timeElement = document.getElementById('current-time');
        const userElement = document.getElementById('current-user');
        
        if (timeElement) {
            timeElement.textContent = "2025-03-20 07:17:10";
        }
        
        if (userElement) {
            userElement.textContent = "taetae0110";
        }
    }
    
    // 초기화
    function init() {
        // 보안 코드 생성 (실제로는 더 복잡한 코드나 서버에서 생성된 코드를 사용해야 함)
        // 여기서는 예시로 정적 코드 사용
        securityCodeDisplay.textContent = "ADMIN2025";
        
        // 이미 관리자가 있는지 확인
        checkExistingAdmin();
        
        // 시간 정보 업데이트
        updateTime();
    }
    
    // 초기화 실행
    init();
});