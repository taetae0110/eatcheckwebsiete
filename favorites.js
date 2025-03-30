document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소
    const favoritesList = document.getElementById('favorites-list');
    
    // 즐겨찾기 목록 가져오기
    function getFavorites() {
        // 현재 로그인된 사용자 가져오기
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            return [];
        }
        
        // 사용자 정보에서 즐겨찾기 목록 가져오기
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === currentUser.id);
        
        return user ? user.favorites : [];
    }
    
    // 즐겨찾기 추가
    function addFavorite(school) {
        // 현재 로그인된 사용자 가져오기
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            alert('로그인이 필요한 기능입니다.');
            // 로그인 페이지로 리다이렉트
            window.location.href = 'login.html';
            return false;
        }
        
        // 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            return false;
        }
        
        // 이미 즐겨찾기에 있는지 확인
        const isAlreadyFavorite = users[userIndex].favorites.some(
            f => f.schoolCode === school.schoolCode
        );
        
        if (isAlreadyFavorite) {
            alert('이미 즐겨찾기에 추가된 학교입니다.');
            return false;
        }
        
        // 즐겨찾기 추가
        users[userIndex].favorites.push(school);
        
        // 저장
        localStorage.setItem('users', JSON.stringify(users));
        
        // 즐겨찾기 목록 업데이트
        updateFavoritesList();
        
        // 별 아이콘 상태 업데이트
        updateStarIcons();
        
        return true;
    }
    
    // 즐겨찾기 삭제
    function removeFavorite(schoolCode) {
        // 현재 로그인된 사용자 가져오기
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            return false;
        }
        
        // 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            return false;
        }
        
        // 즐겨찾기에서 삭제
        users[userIndex].favorites = users[userIndex].favorites.filter(
            f => f.schoolCode !== schoolCode
        );
        
        // 저장
        localStorage.setItem('users', JSON.stringify(users));
        
        // 즐겨찾기 목록 업데이트
        updateFavoritesList();
        
        // 별 아이콘 상태 업데이트
        updateStarIcons();
        
        return true;
    }
    
    // 즐겨찾기 목록 업데이트
    function updateFavoritesList() {
        // 즐겨찾기 리스트 요소가 없으면 종료
        if (!favoritesList) return;
        
        const favorites = getFavorites();
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<div class="no-results">즐겨찾기한 학교가 없습니다.</div>';
            return;
        }
        
        let html = '';
        
        favorites.forEach(favorite => {
            html += `
                <div class="favorite-item" data-edu-code="${favorite.eduCode}" data-school-code="${favorite.schoolCode}">
                    <div class="favorite-name">${favorite.schoolName}</div>
                    <div class="favorite-actions">
                        <button class="btn btn-sm select-favorite">선택</button>
                        <button class="btn btn-sm btn-outline remove-favorite">삭제</button>
                    </div>
                </div>
            `;
        });
        
        favoritesList.innerHTML = html;
        
        // 이벤트 리스너 추가 - 이벤트 위임 사용
        favoritesList.addEventListener('click', function(e) {
            const target = e.target;
            
            // 선택 버튼 클릭
            if (target.classList.contains('select-favorite')) {
                const item = target.closest('.favorite-item');
                selectFavoriteSchool(
                    item.dataset.eduCode,
                    item.dataset.schoolCode,
                    item.querySelector('.favorite-name').textContent
                );
            }
            
            // 삭제 버튼 클릭
            if (target.classList.contains('remove-favorite')) {
                const item = target.closest('.favorite-item');
                removeFavorite(item.dataset.schoolCode);
                                removeFavorite(item.dataset.schoolCode);
            }
        });
    }
    
    // 즐겨찾기 학교 선택
    function selectFavoriteSchool(eduCode, schoolCode, schoolName) {
        // 학교 선택 이벤트 발생
        const event = new CustomEvent('schoolSelected', {
            detail: {
                eduCode: eduCode,
                schoolCode: schoolCode,
                schoolName: schoolName
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // 별 아이콘 상태 업데이트
    function updateStarIcons() {
        // 현재 즐겨찾기 목록 가져오기
        const favorites = getFavorites();
        
        // 모든 별 아이콘 검색
        document.querySelectorAll('.school-item').forEach(item => {
            const schoolCode = item.dataset.schoolCode;
            const starIcon = item.querySelector('.star-icon');
            
            if (!starIcon) return;
            
            // 즐겨찾기 상태에 따라 별 아이콘 상태 업데이트
            if (favorites.some(f => f.schoolCode === schoolCode)) {
                starIcon.classList.remove('far');
                starIcon.classList.add('fas', 'active');
                starIcon.title = '즐겨찾기에서 제거';
            } else {
                starIcon.classList.remove('fas', 'active');
                starIcon.classList.add('far');
                starIcon.title = '즐겨찾기에 추가';
            }
        });
    }
    
    // 사용자 로그인/로그아웃 이벤트 리스너
    document.addEventListener('userLoggedIn', updateFavoritesList);
    document.addEventListener('userLoggedOut', updateFavoritesList);
    
    // 학교가 선택되었을 때 즐겨찾기 버튼 표시
    document.addEventListener('schoolSelected', function(e) {
        // 이미 즐겨찾기에 있는지 확인
        const school = e.detail;
        const favorites = getFavorites();
        const isAlreadyFavorite = favorites.some(f => f.schoolCode === school.schoolCode);
        
        const selectedSchoolInfo = document.getElementById('selectedSchoolInfo');
        if (!selectedSchoolInfo) return;
        
        // 현재 로그인된 사용자 가져오기
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser && !isAlreadyFavorite) {
            // 즐겨찾기 버튼 추가
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'btn btn-sm btn-outline favorite-btn';
            favoriteBtn.textContent = '즐겨찾기 추가';
            favoriteBtn.style.marginLeft = '10px';
            
            favoriteBtn.addEventListener('click', function() {
                if (addFavorite(school)) {
                    this.remove(); // 버튼 제거
                }
            });
            
            // 기존 버튼 제거 후 새 버튼 추가
            const existingBtn = selectedSchoolInfo.querySelector('.favorite-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            selectedSchoolInfo.appendChild(favoriteBtn);
        }
    });
    
    // 초기화 실행
    if (favoritesList) {
        updateFavoritesList();
    }
    
    // 전역 접근을 위한 함수 노출
    window.favoritesModule = {
        addFavorite,
        removeFavorite,
        getFavorites,
        updateFavoritesList,
        updateStarIcons
    };
});