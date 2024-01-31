import {renderTemplateNTimes, addClassAwhile, restrictInputValue, convertTextInputValue} from './calculators.js';

/**
 * 확률 입력 상자들의 단위를 소수점과 퍼센트에서 토글한다.
 * 구체적으로, 단위를 나타내는 %를 숨기거나 나타내고,
 * 각 값을 변환된 단위로 만들어준다.
 */
function toggleUnit() {
    let $radioChecked = $('input[name="unit"]:checked');
    let $textInput = $('.label-prob input[type="text"]')
    if ($radioChecked.val() === 'decimal') {
        $('.unit-specifier').addClass('invisible');
        $textInput.each((_, e) => {
            convertTextInputValue($(e), 0.01);
        })
        
    } else if ($radioChecked.val() === 'percent') {
        $('.unit-specifier').removeClass('invisible');
        $textInput.each((_, e) => {
            convertTextInputValue($(e), 100);
        })
    }
}

/**
 * 베이즈 정리에 기반하여 역확률을 계산한다.
 * @param {string[]} params P(A), P(B), P(A|B), P(B|A)로 이루어진 배열. 모르는 값은 ''로 들어간다.
 * @returns {number[]} number[0]은 모르는 값의 계산 결과, number[1]은 그 값의 인덱스.
 */
function calculateBayesTheorem(params) {
    let [pa, pb, pab, pba] = params;
    if (countItemFromIter(params, '') !== 1) {
        alertInvalid('정확히 하나의 빈칸만 존재할 수 있어요.');
        return [pa, 0];
    }

    if (countItemFromIter(params.map((e) => e ? Number(e) : e), 0) >= 1) {
        alertInvalid('0인 확률을 지니는 경우 역확률은 0이거나 정의되지 않아요.');
        return [pa, 0];
    }

    unalertInvalid();
    for (let i = 0; i < 4; i++) {
        if (params[i] !== '') {
            continue;
        }
        
        switch (i) {
            case 0:
                return [pab * pb / pba, i];
            case 1:
                return [pba * pa / pab, i];
            case 2:
                return [pba * pa / pb, i];
            case 3:
                return [pab * pb / pa, i];
        }
    }
}

/**
 * 이터러블에서 원하는 항목의 개수를 센다.
 * @param {Iterable} iter 순회하며 아이템을 꺼낼 수 있는 객체.
 * @param {*} item 이터러블에서 개수를 세고 싶은 값.
 * @returns {number} 이터러블에서 찾고자 하는 아이템의 개수.
 */
function countItemFromIter(iter, item) {
    let ret = 0;
    for (let e of iter) {
        ret += e === item;
    }
    return ret;
}

/**
 * 잘못된 입력에 대해 경고문을 띄운다.
 * 처음엔 경고문이 등장하고,
 * 경고문이 보이는 상태에서 또 호출되면 경고문을 진동시킨다.
 * @param {string} text 경고 엘리먼트에서 보여줄 내용.
 */
function alertInvalid(text) {
    $('#exceptionNotice').text(text);
    if ($('#exceptionNotice').hasClass('invisible')) {
        $('#exceptionNotice').removeClass('invisible');
    } else {
        addClassAwhile($('#exceptionNotice'), 'vibrate', 300);
    }
}

/**
 * 입력이 유효해졌을 때 호출하여 경고문을 숨긴다.
 */
function unalertInvalid() {
    $('#exceptionNotice').addClass('invisible');
}


$((e) => {
    // 템플릿을 이용해 텍스트상자들을 띄우고, 단위도 설정함.
    const numOfTextInput = 4;
    const probIds = ['pa', 'pb', 'pab', 'pba'];
    let templateAttrs = new Map();
    templateAttrs.set('class', new Array(numOfTextInput).fill('label-prob'));
    templateAttrs.set('id', probIds);
    renderTemplateNTimes($('#templateProbTextInput'), 4, '#divTextInputs', templateAttrs, ['P(A)', 'P(B)', 'P(A|B)', 'P(B|A)']);
    toggleUnit();

    // 라디오 버튼 값 변화시 단위를 변환함.
    $('input[name="unit"]').on('change', (e) => {
        toggleUnit();
    })

    // 텍스트상자의 입력값을 단위에 따라 0~1, 0~100으로 제한함.
    $('#calculatorArea').on('input', '.label-prob input[type="text"]', (e) => {
        let unitMax = $('input[name="unit"]:checked').val() === 'decimal' ? 1 : 100;
        restrictInputValue($(e.target), 0, unitMax);

    })

    // 계산하기 버튼 클릭 시 값을 계산함
    $('#calculate').on('click', (e) => {
        let [answerValue, answerIndex] = calculateBayesTheorem(probIds.map((e) => $(`#${e} input[type="text"]`).val()));
        let fixedDigit = $('input[name="unit"]:checked').val() === 'decimal' ? 4 : 2
        answerValue = answerValue === '' || answerValue === $('#pa input[type="text"]').val() ?
         answerValue : 
         answerValue.toFixed(fixedDigit);
        $(`#${probIds[answerIndex]} input[type="text"]`).val(answerValue);
    })
})