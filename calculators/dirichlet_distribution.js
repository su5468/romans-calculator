import {rangeWithPrefix, renderTemplateNTimes} from './calculators.js';

/**
 * start ... end-1까지의 별점 입력상자를 숨긴다.
 * @param {number} start 처음 바꿀 별점 입력상자의 인덱스.
 * @param {number} end 마지막으로 바꿀 별점 입력상자의 인덱스 + 1.
 */
function toggleTextInputVisibilityByOrder(start, end) {
    for (let i = start; i < end; i++) {
        $(`.label-star#star${i}`).toggleClass('invisible');
    }
}

/**
 * 텍스트상자의 값을 바탕으로 디리클레 분포 기댓값을 계산한다.
 * @returns {number} 디리클레 분포의 기댓값.
 */
function calculateDirichletExpectation() {
    let candidates = $('.label-star:not(.invisible) input[type="text"]').map((_, e) => Number($(e).val()) + 1);
    let numerator = candidates.map((i, e) => e * (i + 1)).toArray().reduce((a, b) => a + b, 0);
    let denominator = candidates.toArray().reduce((a, b) => a + b, 0);

    return numerator / denominator;
}

/**
 * 계산결과를 표시하고 관련된 애니메이션 효과를 준다.
 */
function setAnswer() {
    let answer = calculateDirichletExpectation()
    answer = answer.toFixed(2);
    $('#answer').text(answer).addClass('updated');
    setTimeout(() => {
        $('#answer').removeClass('updated');
    }, 100);
}


$((e) => {
    // 10개의 별점 입력 상자를 만들고 뒤의 10개는 숨김.
    // 이후 정답을 초기화.
    const numOfTextInput = 10
    let templateAttrs = new Map();
    templateAttrs.set('class', new Array(numOfTextInput).fill('label-star'));
    templateAttrs.set('id', rangeWithPrefix(0, 10, 'star'));

    renderTemplateNTimes($('#templateStarTextInput'), numOfTextInput, '#divTextInputs', templateAttrs, rangeWithPrefix(1, 11));
    toggleTextInputVisibilityByOrder(5, 10);
    setAnswer();
    
    // 라디오버튼에 따라 텍스트상자를 숨기거나 나타냄.
    // 이후 보이는 텍스트박스만 가지고 정답을 다시 계산.
    let $radioStar = $('input[name="num-of-stars"]');
    
    $radioStar.on('change', (e) => {
        toggleTextInputVisibilityByOrder(5, 10);
        setAnswer();
    });

    // 계산하기 누르면 정답 계산.
    $('#calculate').on('click', (e) => {
        setAnswer();
    });
});