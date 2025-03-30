document.addEventListener('DOMContentLoaded', function() {
    // 관리자 권한 확인
    checkAdminAccess();
    
    // 탭 전환 기능
    initTabs();
    
    // 데이터 로드
    loadDashboardData();
    loadUsersData();
    loadSchoolsData();
    loadSettings();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 현재 시간 정보 업데이트
    updateTimeInfo();
});

// 관리자 권한 확인
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 로컬스토리지에서 사용자 정보 가져오기
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === currentUser.id);
    
    // 관리자 역할 확인 (새로운 필드 'role'이 'admin'인지 확인)
    // 없으면 추가하도록 함
    if (!user || user.role !== 'admin') {
        alert('관리자 권한이 필요한 페이지입니다.');
        window.location.href = 'index.html';
    }
}

// 탭 기능 초기화
function initTabs() {
    // 사이드바 메뉴 탭 전환
    document.querySelectorAll('.admin-sidebar li').forEach(tab => {
        tab.addEventListener('click', function() {
            // 활성 탭 변경
            document.querySelectorAll('.admin-sidebar li').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 해당 섹션 표시
            const tabId = this.dataset.tab;
            document.querySelectorAll('.admin-tab').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
    
    // 설정 탭 내부 탭 전환
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            // 활성 탭 변경
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 해당 콘텐츠 표시
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 대시보드 데이터 로드
function loadDashboardData() {
    // 사용자 데이터 가져오기
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 총 사용자 수 업데이트
    document.getElementById('total-users').textContent = users.length;
    
    // 총 즐겨찾기 수 계산
    let totalFavorites = 0;
    users.forEach(user => {
        if (user.favorites) {
            totalFavorites += user.favorites.length;
        }
    });
    document.getElementById('total-favorites').textContent = totalFavorites;
    
    // 학교 데이터 계산 (학교 API 결과는 캐시해두는 것으로 가정)
    // 실제로는 별도의 로컬스토리지 키를 사용하거나 API를 직접 호출할 수 있음
    const cachedSchools = JSON.parse(localStorage.getItem('cached_schools')) || [];
    document.getElementById('total-schools').textContent = cachedSchools.length || "API 기반";
    
    // 오늘의 조회수 (가상 데이터)
    // 실제로는 방문 로그를 저장하고 계산해야 함
    const viewsToday = Math.floor(Math.random() * 1000) + 100;
    document.getElementById('today-views').textContent = viewsToday;
    
    // 최근 가입한 사용자 목록 표시 (최대 5명)
    const recentUsers = [...users].sort((a, b) => {
        // ID가 타임스탬프 기반인 경우 최신순 정렬
        return parseInt(b.id) - parseInt(a.id);
    }).slice(0, 5);
    
    let recentUsersHtml = '';
    recentUsers.forEach(user => {
        // 가입일 포맷팅 (ID가 타임스탬프인 경우)
        const registerDate = new Date(parseInt(user.id));
        const formattedDate = `${registerDate.getFullYear()}-${String(registerDate.getMonth() + 1).padStart(2, '0')}-${String(registerDate.getDate()).padStart(2, '0')}`;
        
        recentUsersHtml += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    });
    
    if (recentUsers.length === 0) {
        recentUsersHtml = '<tr><td colspan="4" style="text-align: center;">사용자가 없습니다.</td></tr>';
    }
    
    document.getElementById('recent-users').innerHTML = recentUsersHtml;
    
    // 마지막 업데이트 시간 표시
    document.getElementById('last-update').textContent = '2025-03-20 06:31:24';
}

// 사용자 데이터 로드
function loadUsersData(page = 1, search = '') {
    // 사용자 데이터 가져오기
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 검색어가 있으면 필터링
    if (search) {
        search = search.toLowerCase();
        users = users.filter(user => 
            user.username.toLowerCase().includes(search) || 
            user.email.toLowerCase().includes(search)
        );
    }
    
    // 페이지네이션 설정
    const itemsPerPage = 10;
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);
    
    // 사용자 목록 HTML 생성
    let usersHtml = '';
    paginatedUsers.forEach(user => {
        // 역할 및 상태 설정 (기본값은 'user'와 'active')
        const role = user.role || 'user';
        const status = user.status || 'active';
        
        // 역할 및 상태 텍스트 설정
        const roleText = role === 'admin' ? '관리자' : '일반 사용자';
        const statusText = status === 'active' ? '활성' : '비활성';
        const statusClass = status === 'active' ? 'text-success' : 'text-danger';
        
        usersHtml += `
            <tr data-id="${user.id}">
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${roleText}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit-button edit-user" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete-button delete-user" title="삭제">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    if (paginatedUsers.length === 0) {
        usersHtml = '<tr><td colspan="6" style="text-align: center;">사용자가 없습니다.</td></tr>';
    }
    
    document.getElementById('users-list').innerHTML = usersHtml;
    
    // 페이지네이션 생성
    generatePagination('users-pagination', page, totalPages);
    
    // 사용자 수정/삭제 버튼 이벤트 리스너 설정
    setupUserActionListeners();
}

// 학교 데이터 로드
function loadSchoolsData(page = 1, search = '') {
    // 학교 데이터 가져오기 (API 결과를 캐시했다고 가정)
    let schools = JSON.parse(localStorage.getItem('cached_schools')) || [];
    
    // 캐시된 학교 정보가 없는 경우 샘플 데이터 사용
    if (schools.length === 0) {
        schools = [
            { code: 'S123456789', name: '서울고등학교', eduOfficeCode: 'B10', address: '서울특별시 용산구 서울고등학교길 34', favoriteCount: 15 },
            { code: 'S123456790', name: '부산고등학교', eduOfficeCode: 'C10', address: '부산광역시 연제구 교대로 24', favoriteCount: 8 },
            { code: 'S123456791', name: '대구고등학교', eduOfficeCode: 'D10', address: '대구광역시 수성구 청호로 407', favoriteCount: 6 },
            { code: 'S123456792', name: '인천고등학교', eduOfficeCode: 'E10', address: '인천광역시 중구 제물포로 200', favoriteCount: 4 },
            { code: 'S123456793', name: '광주고등학교', eduOfficeCode: 'F10', address: '광주광역시 북구 서림로 154', favoriteCount: 3 },
        ];
    }
    
    // 검색어가 있으면 필터링
    if (search) {
        search = search.toLowerCase();
        schools = schools.filter(school => 
            school.name.toLowerCase().includes(search) || 
            school.address.toLowerCase().includes(search)
        );
    }
    
    // 페이지네이션 설정
    const itemsPerPage = 10;
    const totalPages = Math.ceil(schools.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedSchools = schools.slice(startIndex, startIndex + itemsPerPage);
    
    // 학교 목록 HTML 생성
    let schoolsHtml = '';
    paginatedSchools.forEach(school => {
        schoolsHtml += `
            <tr data-code="${school.code}">
                <td>${school.code}</td>
                <td>${school.name}</td>
                <td>${school.eduOfficeCode}</td>
                <td>${school.address}</td>
                <td>${school.favoriteCount || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button edit-button edit-school" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete-button delete-school" title="삭제">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    if (paginatedSchools.length === 0) {
        schoolsHtml = '<tr><td colspan="6" style="text-align: center;">학교 정보가 없습니다.</td></tr>';
    }
    
    document.getElementById('schools-list').innerHTML = schoolsHtml;
    
    // 페이지네이션 생성
    generatePagination('schools-pagination', page, totalPages);
    
    // 학교 수정/삭제 버튼 이벤트 리스너 설정
    setupSchoolActionListeners();
}

// 설정 데이터 로드
function loadSettings() {
    // 설정 데이터 가져오기
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        siteTitle: '우리 학교 급식 정보',
        adminEmail: 'admin@example.com',
        itemsPerPage: 10,
        collectStats: true,
        apiKey: 'bdf2df7436774927a79ff063c88b50fd',
        apiTimeout: 10,
        enableCache: true,
        cacheDuration: 24
    };
    
    // 일반 설정 폼에 값 설정
    document.getElementById('site-title').value = settings.siteTitle;
    document.getElementById('admin-email').value = settings.adminEmail;
    document.getElementById('items-per-page').value = settings.itemsPerPage;
    document.getElementById('collect-stats').checked = settings.collectStats;
    
    // API 설정 폼에 값 설정
    document.getElementById('api-key').value = settings.apiKey;
    document.getElementById('api-timeout').value = settings.apiTimeout;
    document.getElementById('enable-cache').checked = settings.enableCache;
    document.getElementById('cache-duration').value = settings.cacheDuration;
}

// 페이지네이션 생성 함수
function generatePagination(elementId, currentPage, totalPages) {
    const paginationElement = document.getElementById(elementId);
    
    if (!paginationElement) return;
    
    let paginationHtml = '';
    
    // 이전 페이지 버튼
    paginationHtml += `
        <button class="pagination-button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // 페이지 번호 버튼
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    // 다음 페이지 버튼
    paginationHtml += `
        <button class="pagination-button" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationElement.innerHTML = paginationHtml;
    
    // 페이지네이션 버튼 이벤트 리스너 설정
    paginationElement.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return;
            
            const page = parseInt(this.dataset.page);
            
            if (elementId === 'users-pagination') {
                const searchTerm = document.getElementById('user-search').value;
                loadUsersData(page, searchTerm);
            } else if (elementId === 'schools-pagination') {
                const searchTerm = document.getElementById('school-search').value;
                loadSchoolsData(page, searchTerm);
            }
        });
    });
}

// 사용자 수정/삭제 버튼 이벤트 리스너 설정
function setupUserActionListeners() {
    // 사용자 수정 버튼
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.dataset.id;
            
            openUserModal('edit', userId);
        });
    });
    
    // 사용자 삭제 버튼
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.dataset.id;
            
            if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
                deleteUser(userId);
            }
        });
    });
}

// 학교 수정/삭제 버튼 이벤트 리스너 설정
function setupSchoolActionListeners() {
    // 학교 수정 버튼
    document.querySelectorAll('.edit-school').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const schoolCode = row.dataset.code;
            
            openSchoolModal('edit', schoolCode);
        });
    });
    
    // 학교 삭제 버튼
    document.querySelectorAll('.delete-school