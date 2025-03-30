document.addEventListener('DOMContentLoaded', function() {
    // API 키 설정 (실제 발급받은 키로 변경 필요)
    const API_KEY = 'bdf2df7436774927a79ff063c88b50fd';
    
    // DOM 요소
    const eduOfficeCodeEl = document.getElementById('eduOfficeCode');
    const schoolNameEl = document.getElementById('schoolName');
    const searchBtnEl = document.getElementById('searchBtn');
    const schoolResultsEl = document.getElementById('schoolResults');
    const mealDateEl = document.getElementById('mealDate');
    const prevDayEl = document.getElementById('prevDay');
    const nextDayEl = document.getElementById('nextDay');
    const selectedSchoolInfoEl = document.getElementById('selectedSchoolInfo');
    const mealResultsEl = document.getElementById('mealResults');
    
    // 초기 날짜 설정
    if (mealDateEl) {
        const today = new Date();
        mealDateEl.valueAsDate = today;
    }
    
    // 이벤트 리스너 설정
    if (searchBtnEl) {
        searchBtnEl.addEventListener('click', searchSchool);
    }
    
    if (prevDayEl) {
        prevDayEl.addEventListener('click', () => changeDate(-1));
    }
    
    if (nextDayEl) {
        nextDayEl.addEventListener('click', () => changeDate(1));
    }
    
    if (mealDateEl) {
        mealDateEl.addEventListener('change', fetchMeal);
    }
    
    // 날짜 변경 함수
    function changeDate(days) {
        const currentDate = new Date(mealDateEl.value);
        currentDate.setDate(currentDate.getDate() + days);
        mealDateEl.valueAsDate = currentDate;
        fetchMeal();
    }
    
    // 학교 검색 함수 (학교 기본정보 API 사용)
    async function searchSchool() {
        const eduOfficeCode = eduOfficeCodeEl.value;
        const schoolName = schoolNameEl.value.trim();
        
        // 입력 유효성 검사
        if (!eduOfficeCode) {
            alert('교육청을 선택해주세요.');
            return;
        }
        
        if (!schoolName) {
            alert('학교명을 입력해주세요.');
            return;
        }
        
        // 검색 결과 영역 초기화 및 로딩 메시지 표시
        schoolResultsEl.innerHTML = '<div class="loading">학교 검색 중...</div>';
        
        try {
            // 학교 정보 API 호출
            const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SCHUL_NM=${encodeURIComponent(schoolName)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // 에러 응답 처리
            if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
                schoolResultsEl.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
                return;
            }
            
            // 결과 처리
            const schools = data.schoolInfo[1].row;
            displaySchoolResults(schools);
        } catch (error) {
            console.error('학교 검색 오류:', error);
            schoolResultsEl.innerHTML = '<div class="no-results">오류가 발생했습니다. 다시 시도해주세요.</div>';
        }
    }
    
    // 학교 검색 결과 표시 함수
    function displaySchoolResults(schools) {
        if (!schools || schools.length === 0) {
            schoolResultsEl.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }
        
        // 현재 사용자의 즐겨찾기 목록 가져오기
        const favorites = [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.id === currentUser.id);
            if (user && user.favorites) {
                favorites.push(...user.favorites);
            }
        }
        
        let html = '';
        schools.forEach(school => {
            // 이 학교가 즐겨찾기에 있는지 확인
            const isFavorite = favorites.some(f => f.schoolCode === school.SD_SCHUL_CODE);
            const starClass = isFavorite ? 'fas fa-star active' : 'far fa-star';
            const starTitle = isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가';
            
            html += `
                <div class="school-item" data-edu-code="${school.ATPT_OFCDC_SC_CODE}" data-school-code="${school.SD_SCHUL_CODE}">
                    <div class="school-name-container">
                        <div class="school-name">${school.SCHUL_NM}</div>
                        <i class="star-icon ${starClass}" title="${starTitle}"></i>
                    </div>
                    <div class="school-address">${school.ORG_RDNMA}</div>
                </div>
            `;
        });
        
        schoolResultsEl.innerHTML = html;
        
        // 별 아이콘 클릭 이벤트 추가
        document.querySelectorAll('.star-icon').forEach(star => {
            star.addEventListener('click', function(e) {
                e.stopPropagation(); // 학교 항목 클릭 이벤트 버블링 방지
                
                const schoolItem = this.closest('.school-item');
                const eduCode = schoolItem.dataset.eduCode;
                const schoolCode = schoolItem.dataset.schoolCode;
                const schoolName = schoolItem.querySelector('.school-name').textContent;
                
                // 현재 사용자 확인
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser) {
                    const confirmation = confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?');
                    if (confirmation) {
                        window.location.href = 'login.html';
                    }
                    return;
                }
                
                // 즐겨찾기 추가 또는 제거
                const school = {
                    eduCode: eduCode,
                    schoolCode: schoolCode,
                    schoolName: schoolName
                };
                
                const isFavorite = this.classList.contains('fas');
                
                if (isFavorite) {
                    // 즐겨찾기 제거
                    if (window.favoritesModule.removeFavorite(schoolCode)) {
                        this.classList.remove('fas', 'active');
                        this.classList.add('far');
                        this.title = '즐겨찾기에 추가';
                    }
                } else {
                    // 즐겨찾기 추가
                    if (window.favoritesModule.addFavorite(school)) {
                        this.classList.remove('far');
                        this.classList.add('fas', 'active');
                        this.title = '즐겨찾기에서 제거';
                    }
                }
            });
        });
        
        // 학교 항목 클릭 이벤트 추가
        document.querySelectorAll('.school-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // 별 아이콘 클릭은 무시
                if (e.target.classList.contains('star-icon')) {
                    return;
                }
                
                // 이전 선택 항목의 강조 제거
                document.querySelectorAll('.school-item').forEach(el => el.classList.remove('selected'));
                
                // 현재 항목 강조
                this.classList.add('selected');
                
                // 선택한 학교 정보 저장
                const selectedSchool = {
                    eduCode: this.dataset.eduCode,
                    schoolCode: this.dataset.schoolCode,
                    schoolName: this.querySelector('.school-name').textContent
                };
                
                // 선택한 학교 정보 표시
                selectedSchoolInfoEl.textContent = `${selectedSchool.schoolName}`;
                
                // 학교 선택 이벤트 발생
                const event = new CustomEvent('schoolSelected', {
                    detail: selectedSchool
                });
                document.dispatchEvent(event);
                
                // 급식 정보 가져오기
                fetchMeal(selectedSchool);
            });
        });
    }
    
    // 급식 정보 가져오기 함수 (급식 API 사용)
    async function fetchMeal(school) {
        // 선택된 학교 저장 (school 매개변수가 없을 경우 기존 선택 학교 사용)
        const selectedSchool = school || window.selectedSchool;
        
        // 선택된 학교 확인
        if (!selectedSchool) {
            mealResultsEl.innerHTML = '<div class="no-results">먼저 학교를 검색하고 선택해주세요.</div>';
            return;
        }
        
        // 현재 선택 학교 저장
        window.selectedSchool = selectedSchool;
        
        // 선택된 날짜 확인
        const date = mealDateEl.value.replace(/-/g, '');
        
        // 급식 정보 영역 초기화 및 로딩 메시지 표시
        mealResultsEl.innerHTML = '<div class="loading">급식 정보를 가져오는 중...</div>';
        
        try {
            // 급식 정보 API 호출
            const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${selectedSchool.eduCode}&SD_SCHUL_CODE=${selectedSchool.schoolCode}&MLSV_YMD=${date}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // 에러 응답 처리 (급식 정보가 없는 경우)
            if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
                const formattedDate = formatDate(date);
                mealResultsEl.innerHTML = `<div class="no-results">${formattedDate}의 급식 정보가 없습니다.</div>`;
                return;
            }
            
            // 결과 처리
            const meals = data.mealServiceDietInfo[1].row;
            displayMealResults(meals, date);
        } catch (error) {
                        console.error('급식 정보 가져오기 오류:', error);
            mealResultsEl.innerHTML = '<div class="no-results">오류가 발생했습니다. 다시 시도해주세요.</div>';
        }
    }
    
    // 급식 정보 표시 함수
    function displayMealResults(meals, date) {
        if (!meals || meals.length === 0) {
            const formattedDate = formatDate(date);
            mealResultsEl.innerHTML = `<div class="no-results">${formattedDate}의 급식 정보가 없습니다.</div>`;
            return;
        }
        
        let html = '';
        meals.forEach(meal => {
            // 급식 종류에 따른 타이틀 설정
            let mealTitle = '';
            switch (meal.MMEAL_SC_CODE) {
                case '1':
                    mealTitle = '아침';
                    break;
                case '2':
                    mealTitle = '점심';
                    break;
                case '3':
                    mealTitle = '저녁';
                    break;
                default:
                    mealTitle = '급식';
            }
            
            // 메뉴 포맷팅 (알레르기 정보 처리)
            const menuItems = meal.DDISH_NM.split('<br/>');
            let formattedMenu = '';
            
            menuItems.forEach(item => {
                // 알레르기 정보 추출 (괄호 안 숫자)
                const cleanItem = item.replace(/\(\d+\.\d+\)/g, ''); // 알레르기 정보 제거
                formattedMenu += `<div class="menu-item">${cleanItem}</div>`;
            });
            
            html += `
                <div class="meal-item">
                    <div class="meal-type">${mealTitle}</div>
                    <div class="meal-menu">${formattedMenu}</div>
                    <div class="meal-info">
                        칼로리: ${meal.CAL_INFO || '정보 없음'} | 
                        영양정보: ${meal.NTR_INFO || '정보 없음'}
                    </div>
                </div>
            `;
        });
        
        mealResultsEl.innerHTML = html;
    }
    
    // 날짜 포맷팅 함수
    function formatDate(dateStr) {
        if (typeof dateStr === 'string' && dateStr.length === 8) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}년 ${month}월 ${day}일`;
        }
        return dateStr;
    }
    
    // 현재 시간 및 사용자 정보 업데이트
    function updateTimeAndUser() {
        const timeElement = document.getElementById('current-time');
        const userElement = document.getElementById('current-user');
        
        if (timeElement) {
            timeElement.textContent = "2025-03-20 06:22:09";
        }
        
        if (userElement) {
            userElement.textContent = "taetae0110";
        }
    }
    
    // 초기화 후 시간과 사용자 정보 업데이트
    updateTimeAndUser();
});
// 시스템 초기화 - 첫 실행 시 관리자 계정 자동 생성
document.addEventListener('DOMContentLoaded', function() {
    // 사용자 목록 확인
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 사용자가 없으면 기본 관리자 계정 생성
    if (users.length === 0) {
        const defaultAdmin = {
            id: Date.now().toString(),
            username: 'admin',
            email: 'z9031118@naver.com',
            password: 'kimtaehwan7@@**',
            role: 'admin',
            status: 'active',
            favorites: []
        };
        
        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('기본 관리자 계정이 생성되었습니다.');
        alert('시스템이 초기화되었습니다.\n기본 관리자 계정이 생성되었습니다.\n아이디: admin\n비밀번호: admin1234');
    }
});