/*
모든 계산기 페이지(현재로서는 메인 페이지를 제외한 모든 페이지)는
이 스크립트가 필요하다.
추가로, 여러 js 파일에서 공용으로 사용할 함수도 여기에 정의된다.
*/

// 다른 스크립트에서 import해 사용할 함수들.
/**
 * start~end-1 범위의 숫자들에 똑같이 prefix가 붙은 문자열 배열을 만든다.
 * @param {number} start 시작점. 범위에 포함됨.
 * @param {number} end 종료점. 범위에 포함되지 않음.
 * @param {string} [prefix=''] 각 원소 앞에 붙을 문자열.
 * @returns {string[]} prefixE 꼴의 문자열 배열(시작점<=E<종료점).
 */
export function rangeWithPrefix(start, end, prefix='') {
    let len = end - start
    return new Array(len).fill(0).map((_, i) => prefix + (start + i))
}

/**
 * 이터러블에서 원하는 항목의 개수를 센다.
 * @param {Iterable} iter 순회하며 아이템을 꺼낼 수 있는 객체.
 * @param {*} item 이터러블에서 개수를 세고 싶은 값.
 * @returns {number} 이터러블에서 찾고자 하는 아이템의 개수.
 */
export function countItemFromIter(iter, item) {
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
export function alertInvalid(text) {
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
export function unalertInvalid() {
    $('#exceptionNotice').addClass('invisible');
}

/**
 * html 객체를 n번 복사해서, 각각의 html 속성과 문자를 포매팅하고 원하는 위치에 배치한다.
 * @param {jQuery} $template 복사할 JQuery 객체.
 * @param {number} n 만들 개수.
 * @param {string} dstSelector 템플릿의 인스턴스가 나타날 위치.
 * @param {Map<string, string[]>} attrMap 인스턴스들이 가질 html 속성들의 문자열: 배열 맵.
 * @param  {...string[]} formatArrays 템플릿의 {{}}를 포매팅하기 위한 문자열들의 배열(들).
 */
export function renderTemplateNTimes($template, n, dstSelector, attrMap, ...formatArrays) {

    for (let i = 0; i < n; i++) {
        let $templateInstance = $template.html()
        for (let formatArray of formatArrays) {
            $templateInstance = $templateInstance.replace(/\{\{\}\}/, formatArray[i])
        }

        $templateInstance = $($templateInstance)
        for (let [key, val] of attrMap) {
            $templateInstance.attr(key, val[i])
        }

        $templateInstance.appendTo(dstSelector);
    }
}

/**
 * 잠깐동안만 JQuery 객체에 클래스를 추가했다가 삭제한다.
 * @param {jQuery} $target 클래스를 추가할 JQuery 객체.
 * @param {string} className 추가할 클래스 이름.
 * @param {number} ms 클래스가 남아있는 시간.
 */
export function addClassAwhile($target, className, ms) {
    $target.addClass(className);
    setTimeout(() => {
        $target.removeClass(className);
    }, ms);
}

/**
 * Number가 들어가는 텍스트상자의 값을 정해진 범위 안으로 고정시킨다.
 * 범위를 넘어가면 최댓값이나 최솟값을 넣어줌.
 * @param {jQuery} $textInput 값을 제한하고 싶은 JQuery 객체.
 * @param {number} min 값의 최솟값.
 * @param {number} max 값의 최댓값.
 * @returns {undefined}
 */
export function restrictInputValue($textInput, min, max) {
    if (!isPureNumberString($textInput.val())) {
        return;
    }
    
    let currentValue = Number($textInput.val());
    let minimax = Math.min(Math.max(currentValue, min), max);
    if (currentValue === minimax) {
        return;
    }
    $textInput.val(minimax);
}

/**
 * 정규표현식을 통해 문자열이 순수한 숫자인지 확인한다.
 * (O) '0', '1.1', '01.2345', ...
 * (X) '', '1.', '1.2.3', '1spam', ...
 * @param {string} str 확인하고자 하는 문자열.
 * @returns {boolean} 해당 문자열이 순수한 숫자인지의 여부.
 */
export function isPureNumberString(str) {
    return /^\d+(\.\d+)?$/.test(str);
}

/**
 * 텍스트상자의 값에 원하는 수를 곱해서 다시 설정한다.
 * 곱할 때는 multiplyPrecisely()를 이용한다.
 * 또한 결과가 지수 표기법이 아님을 보장한다.
 * @param {jQuery} $textInput 대상 텍스트상자의 JQuery 객체.
 * @param {number} coeff 상자의 값에 곱하고 싶은 계수.-
 */
export function convertTextInputValue($textInput, coeff) {
    if (!$($textInput).val()) {
        return;
    }
    $($textInput).val(toDecimalString(multiplyPrecisely($($textInput).val(), coeff).toExponential()));
}

/**
 * 부동소수점 연산을 더 정확하게 하기 위해 두 수를 정수로 변환한 후 곱하고 다시 원래 자릿수로 나눈다.
 * @param {number | string} a 곱할 숫자. 문자열로 주어도 됨.
 * @param {number | string} b 곱할 숫자. 문자열로 주어도 됨.
 * @returns {number} 두 수를 곱한 결과.
 */
export function multiplyPrecisely(a, b) {
    a = a.toString();
    b = b.toString();
    let digit_a = a.split('.')[1]?.length ?? 0;
    let digit_b = b.split('.')[1]?.length ?? 0;
    let digits = digit_a + digit_b

    a = Math.round(Number(a) * 10 ** digit_a);
    b = Math.round(Number(b) * 10 ** digit_b);

    if (digits === 0) {
        return a * b
    }
    return a * b / 10 ** digits;
}

/**
 * 지나치게 크거나 작아서 지수 표기법으로 표현되는 숫자를 일반 표기법 문자열로 나타낸다.
 * @param {string} exponentialString 지수 표기법 문자열.
 * @returns {string} n을 지수 표기법이 아닌 일반적인 십진 표기법으로 표현한 문자열.
 */
export function toDecimalString(exponentialString) {
    let {mantissa, exp} = getMantissaAndExpString(exponentialString);
    exp = Number(exp);
    let pointIdx = getNumberLengthBeyondPoint(mantissa, exp >= 0);
    let mantissaPointRemoved = mantissa.replace('.', '');
    let answer = mantissa;
    
    if (exp < 0) {
        exp = -exp;
        if (exp >= pointIdx) {
            exp -= pointIdx;
            answer = '0.' + '0'.repeat(exp) + mantissaPointRemoved;
        } else {
            pointIdx -= exp;
            answer = mantissaPointRemoved.replace(new RegExp(`(^.{${pointIdx}})`), '$1.');
        }

    }
    else if (exp > 0) {
        if (exp >= pointIdx) {
            exp -= pointIdx;
            answer = mantissaPointRemoved + '0'.repeat(exp);
        } else {
            pointIdx -= exp;
            answer = mantissaPointRemoved.replace(new RegExp(`(.{${pointIdx}}$)`), '.$1');
        }

    }

    answer = removeUnnecessaryZeros(answer);
    return answer;
}

/**
 * 주어진 지수 표기법 문자열을 분해하여 지수와 가수를 추출한다.
 * @param {string} exponentialString 지수 표기법 문자열.
 * @returns {object} 문자열에서 지수와 가수를 정규표현식으로 추출한 결과.
 */
export function getMantissaAndExpString(exponentialString) {
    return exponentialString.match(/^(?<mantissa>\d+(?:\.\d+)?)e(?<exp>[+-]?\d+)$/).groups;
}

/**
 * 숫자를 나타내는 문자열에서 소수점 앞 또는 뒤로 몇 개의 숫자가 등장하는지 확인한다.
 * @param {string} numberString 정수 또는 실수를 나타내는 문자열.
 * @param {boolean} reversed true면 점 뒤의 숫자 개수, false면 점 앞의 숫자 개수.
 * @returns {number} 점 앞 또는 뒤로 숫자가 몇 개 위치했는지의 여부.
 */
export function getNumberLengthBeyondPoint(numberString, reversed=false) {
    let idx = reversed ? numberString.length - numberString.indexOf('.') - 1 : numberString.indexOf('.');
    if (idx === -1) {
        idx = numberString.length;
    } else if (idx === numberString.length) {
        idx = 0;
    }

    return idx;
}

/**
 * 일반적인 십진 표기법 문자열을 정규화된 지수 표기법으로 변환한다.
 * @param {string} decimalString 십진 표기법 문자열.
 * @returns {string} 지수 표기법 문자열.
 */
export function toExponentialString(decimalString) {
    decimalString = removeUnnecessaryZeros(decimalString);
    let [intString, floatString=''] = decimalString.split('.');

    if (intString === '0') {
        let {mantissa, expZeros} = floatString.match(/^(?<expZeros>0*)(?<mantissa>.*)$/).groups;
        let exp = -(expZeros.length + 1);

        mantissa = mantissa.replace(/^(.)(.)/, '$1.$2');

        return mantissa + 'e' + exp;
    }
    if (floatString === '') {
        let {mantissa, expZeros} = intString.match(/^(?<mantissa>.*?)(?<expZeros>0*)$/).groups;
        let exp = expZeros.length
        
        exp += mantissa.length - 1
        mantissa = mantissa.replace(/^(.)(.)/, '$1.$2');

        return mantissa + 'e+' + exp;
    }

    let exp = getNumberLengthBeyondPoint(decimalString, false) - 1;
    decimalString = decimalString.replace('.', '');
    decimalString = decimalString.replace(/^(.)(.)/, '$1.$2');
    return decimalString + 'e+' + exp;
}

/**
 * 숫자를 표현하는 문자열에서 불필요한 0을 삭제한다.
 * '00123' -> '123'
 * '12301.20' -> '12301.2'
 * @param {string} decimalString 0을 제거할 숫자를 표현하는 문자열.
 * @returns {string} 불필요한 0이 제거된 숫자를 표현하는 문자열.
 */
export function removeUnnecessaryZeros(decimalString) {
    return decimalString.replace(/^0+(\d)/, '$1').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}


// 텍스트 입력상자(input[type="text"])와 관련된 함수들.
/**
 * 텍스트상자의 값을 제한한다. 현재 가능한 타입: 정수형(numeric), 실수형(decimal).
 * @param {jQuery} $textInput 대상 JQuery 텍스트상자.
 */
function validifyTextInput($textInput) {
    if ($textInput.attr('inputmode') === 'numeric') {
        $textInput.val($textInput.val().replace(/[^0-9]/g, ''));
    }
    else if ($textInput.attr('inputmode') === "decimal") {
        $textInput.val($textInput.val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/^\./, '0.'));
    }
}

/**
 * 텍스트상자의 길이를 가변적으로 바꾼다.
 * @param {jQuery} $textInput 대상 JQuery 텍스트상자.
 * @param {number} perEmDivideUnit 문자 개수와 늘어나는 길이(단위: em)의 비.
 */
function changeTextInputLength($textInput, perEmDivideUnit) {
    $textInput.css('width', $textInput.val().length / perEmDivideUnit + 'em')
}

/**
 * 텍스트상자의 포커스를 다른 텍스트상자로 옮긴다.
 * @param {jQuery} $currentTextInput 현재 JQuery 텍스트상자.
 * @param {number} offset 현재 상자와의 거리.
 */
function gotoAnotherCalculatorTextInput($currentTextInput, offset) {
    let $calculatorTextInput = $('#calculatorArea input[type="text"]')
    let i = $calculatorTextInput.index($currentTextInput);
    
    $calculatorTextInput.eq(i + offset).focus();
}

/**
 * 포커스를 마지막 텍스트상자로 옮긴다.
 */
function gotoLastCalculatorTextInput() {
    let $lastCalculatorTextInput = $('#calculatorArea label:not(.invisible) input[type="text"]').last();
    gotoAnotherCalculatorTextInput($lastCalculatorTextInput, 0);
}


$((e) => {
    // 텍스트 입력 검증하고 입력상자 길이 조절.
    $('#calculatorArea').on('input', 'input[type="text"]', (e) => {
        let $textInput = $(e.target);
        let perEmDivideUnit = 1.7;
        validifyTextInput($textInput);
        changeTextInputLength($textInput, perEmDivideUnit);
    })

    // Enter, Shift + Enter로 이동 구현.
    $('#calculatorArea').on('keyup', 'input[type="text"]', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            gotoAnotherCalculatorTextInput(e.target, -1);
        } else if (e.key === 'Enter') {
            gotoAnotherCalculatorTextInput(e.target, 1);

            if ($(':focus').is(e.target)) {
                $('#calculate').focus().trigger($.Event('click'));
            }
        }
    });

    // 계산하기 버튼 Enter, Shift + Enter 구현.
    $('#calculate').on('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            gotoLastCalculatorTextInput();
        }
    })
});