import {countItemFromIter, renderTemplateNTimes, toDecimalString, alertInvalid, unalertInvalid, isPureNumberString, getMantissaAndExpString, toExponentialString} from './calculators.js';


/**
 * JQuery 텍스트박스의 입력을 지수 표기법에 맞게 바꿔준다.
 * @param {jQuery} $textInput 대상 텍스트상자 JQuery 객체.
 */
function validifyTextInputWhenExponential($textInput) {
    let text = $textInput.val().replace(/ㄷ/g, 'e').replace(/(e.*)e/g, '$1');
    let [mantissa, exp=''] = text.split('e');
    let e = text.indexOf('e') === -1 ? '' : 'e';
    mantissa = mantissa.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/^\./, '0.');
    exp = exp.replace(/[^0-9+\-]/, '').replace(/(.+)[+\-]/g, '$1');

    $textInput.val(mantissa + e + exp);
}

/**
 * 십진 표기법과 지수 표기법 텍스트상자 중 빈 칸에 비지 않은 칸의 값을 변환해서 띄워준다.
 */
function ChangeTextValueToAnswer() {
    let $exp = $('#LabelExponential input[type="text"]');
    let $decimal = $('#LabelDecimal input[type="text"]')
    let exp = $exp.val();
    let decimal = $decimal.val();
    let inputNums = [exp, decimal];

    if (countItemFromIter(inputNums, '') === 0) {
        alertInvalid('빈칸이 존재해야 변환할 수 있어요.');
        return;
    }
    if (countItemFromIter(inputNums, '') === 2) {
        alertInvalid('변환할 숫자를 써주세요.');
        return;
    }
    if (isToLargeNumberString(exp) || isToLargeNumberString(decimal)) {
        alertInvalid('변환하기에 너무 크거나 작은 수예요.');
        return;
    }

    // TODO : 정밀도 상승
    if (exp === '') {
        $exp.val(toExponentialString(decimal));
    } else {
        $decimal.val(toDecimalString(ensureNumberStringIsExponential(exp)));
    }
    unalertInvalid();

}

/**
 * 가수 문자열의 길이나 지수가 전역변수 maxDigit 이상인지 확인한다.
 * @param {string} str 범위를 벗어나는지 알고 싶은 문자열.
 * @returns {boolean} 주어진 문자열이 나타내는 숫자가 범위를 벗어나는지.
 */
function isToLargeNumberString(str) {
    if (str === '') {
        return false;
    }
    str = ensureNumberStringIsExponential(str);
    let {mantissa, exp} = getMantissaAndExpString(str);
    return mantissa.length > maxDigit || Math.abs(parseInt(exp)) > maxDigit
}

/**
 * 어떤 문자열이 순수하게 숫자 문자열이면 뒤에 'e+0'을 더해 지수 표기법으로 만든다.
 * @param {string} str 숫자를 나타내는 문자열.
 * @returns {string} 해당 문자열을 지수 표기법 꼴로 나타낸 문자열.
 */
function ensureNumberStringIsExponential(str) {
    if (isPureNumberString(str)) {
        return str + 'e+0';
    }
    return str;
}

const maxDigit = 100000;
$((e) => {

    let numOfTextInput = 2;
    let templateAttrs = new Map();
    templateAttrs.set('class', new Array(numOfTextInput).fill('label-num'));
    templateAttrs.set('id', ['LabelExponential', 'LabelDecimal']);

    renderTemplateNTimes($('#templateNumTextInput'), numOfTextInput, '#divTextInputs', templateAttrs, ['지수 표기법', '십진 표기법'], ['text', 'decimal']);

    $('#LabelExponential').on('input', (e) => {
        validifyTextInputWhenExponential($(e.target));
    });

    $('#calculate').on('click', (e) => {
        ChangeTextValueToAnswer();
    })
});