/* 
모든 페이지는 이 스크립트가 필요하다.
*/

function setThemeColor(color) {
    $(':root').attr('class', color);
    localStorage.setItem('theme', color);
}

// 테마 설정
setThemeColor(localStorage.getItem('theme'));

$((e) => {
    // 헤더, 네비게이션바, 푸터 로드.
    // 헤더는 로드 후에 테마 설정 기능을 생성함.
    // 네비게이션바는 로드 후에 햄버거버튼의 토글 기능을 생성함.
    $('#divHeaderContainer').load('/template.html header', (e) => {
        $('.button-color').on('click', (e) => {
            setThemeColor($(e.target).val());
        });
    });
    $('#divNavContainer').load('/template.html nav.navigation-menu', (e) => {
        $('.hamburger-button').on('click', (e) => {
            $('.navigation-menu').toggleClass('active');
        });
    });
    $('#divFooterContainer').load('/template.html footer');

});