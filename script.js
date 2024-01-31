/* 
모든 페이지는 이 스크립트가 필요하다.
*/

/**
 * 사이트 테마 색상을 바꾼다.
 * 로컬스토리지에 저장은 안 하므로 주의할 것.
 * @param {string} color 테마 색상. 현재 'light', 'dark', 'black' 지원.
 */
function setThemeColor(color) {
    $(':root').attr('class', color);
}

// 테마 설정
let theme = localStorage.getItem('theme') ?? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
setThemeColor(theme);

$((e) => {
    // 헤더, 네비게이션바, 푸터 로드.
    // 헤더는 로드 후에 테마 설정 기능을 생성함.
    // 네비게이션바는 로드 후에 햄버거버튼의 토글 기능을 생성함.
    $('#divHeaderContainer').load('/romans-calculator/template.html header', (e) => {
        $('.button-color').on('click', (e) => {
            setThemeColor($(e.target).val());
            localStorage.setItem('theme', color);
        });
    });
    $('#divNavContainer').load('/romans-calculator/template.html nav.navigation-menu', (e) => {
        $('.hamburger-button').on('click', (e) => {
            $('.navigation-menu').toggleClass('active');
        });
    });
    $('#divFooterContainer').load('/romans-calculator/template.html footer');

});