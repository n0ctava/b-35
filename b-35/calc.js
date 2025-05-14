const ZERO_SYM = '0', EMPTY_SYM = '', X_SYM = "x", Y_SYM = "y";
const SYMBOL_LIMIT = 8;
const MANTISSA_LIMIT = 8;
let mantissa_full = 0;
let y_slice = '0';
let mantissa1 = 0;
let mantissa_full1 = 0;
let y_full = 0;
let x = 0;
let y = 0;
let a1 = 0;
let root1 = 0;
let root2 = 0;
let zed = 0;
let NormalNumber = 0;
let overc = 0;
let eexflag = 0; // 0 - нет EEx, 1 - ожидается знак экспоненты, 2 - ожидается значение экспоненты
let indication_register = ZERO_SYM; // Инициализируем как строку
let indication_register_index = 0;
let currentRootIndex = 0; // Индекс текущего корня (0 - первый корень, 1 - второй корень)
exponent_sign = '';  // Знак экспоненты (может быть "-" или "")
exponent_value = ''; // Значение экспоненты
let operations_stack = []; // Для хранения операций
let values_stack = []; // Для хранения значений
let dot_flag = false;
let clean_number_flag = false;
let last_action = EMPTY_SYM;
let memory_value = 0; // Один регистр памяти
let isSecondSymbolic = false; // Переключатель символики (false — первая символика, true — вторая)
const first_operator_actions = ["+", "-", "X", "÷", "√", "1/X"];
const second_operator_actions = ["sin", "cos", "tan", "ln", "log", "^","Xy"];
const two_operator_actions = ["+", "-", "X", "÷", "√", "1/X"];
const memory_actions = ["EEx"];
let result_panel = document.querySelector('.calc-screen > p');

// Функция для логирования состояния (для отладки)
function logState() {
    console.log(`x value: ${x}`);
    console.log(`y value: ${y}`);
    console.log(`indication register value: ${indication_register}`);
    console.log(`dot flag: ${dot_flag}`);
    console.log(`clean_number_flag: ${clean_number_flag}`);
    console.log(`last action value: ${last_action}`);
    console.log(`eexflag: ${eexflag}`);
    console.log(`exponent_sign: ${exponent_sign}`);
    console.log(`exponent_value: ${exponent_value}`);
    console.log('______________');
}

// Функция для обрезки больших чисел
function trim_big_number(value) {
    if (Number.isNaN(Number(value)) || !isFinite(value)) {
        console.log(`Invalid value: ${value}`);
        return ".0.0.0.0.0.0.0.0. .0.0.";
    }
    const valueString = String(value);

    if (value >= 0) {
        if (valueString.length > SYMBOL_LIMIT) {
            console.log(`overflow: ${valueString}`);
            return ".0.0.0.0.0.0.0.0. .0.0."; 
        }
    } else {
        if (valueString.length > SYMBOL_LIMIT + 1) {
            console.log(`overflow: ${valueString}`);
            return ".0.0.0.0.0.0.0.0. .0.0."; 
        }
    }

    return value; 
}

// Преобразование числа в строку
function number_to_string(number) {
    return (number + '');
}

let isCalculatorOn = true; // Флаг состояния калькулятора (выключен по умолчанию)
// Обработка включения и выключения калькулятора
let buttons_one = document.getElementsByClassName("button_one");
let arr_one = [...buttons_one];

// Получение ссылки на экран калькулятора
let calculatorScreen = document.querySelector('.calc-screen > p');
let calculatorContainer = document.querySelector('.calc');

arr_one.forEach((element) => {
    element.addEventListener("click", () => {
        // Переключение состояния калькулятора
        if (element.id === "power_on") {
            isCalculatorOn = true; // Включаем калькулятор
            console.log("Калькулятор включен");
        } else if (element.id === "power_off") {
            isCalculatorOn = false; // Выключаем калькулятор
            console.log("Калькулятор выключен");
        }

        // Обновляем состояние кнопок
        arr_one.forEach((item) => {
            item.style.opacity = item === element ? "1" : "0";
        });

        // Обновляем отображение калькулятора
        if (isCalculatorOn) {
            calculatorScreen.textContent = ZERO_SYM; // Устанавливаем ноль на экране
            calculatorContainer.style.opacity = "1"; // Делаем калькулятор активным
        } else {
            calculatorScreen.textContent = ""; // Очищаем экран
        }

        // Сброс состояния при выключении
        if (!isCalculatorOn) {
            resetCalculatorState();
        }
    });
});

// Функция для сброса состояния калькулятора
function resetCalculatorState() {
    indication_register = ZERO_SYM; // Сбрасываем регистр индикации
    x = 0;
    y = 0;
    a1 = 0;
    root1 = 0;
    root2 = 0;
    zed = 0;
    NormalNumber = 0;
    overc = 0;
    eexflag = 0;
    operations_stack = [];
    values_stack = [];
    dot_flag = false;
    clean_number_flag = false;
    last_action = EMPTY_SYM;
    memory_value = 0;
    console.log("Калькулятор сброшен в исходное состояние");
}


let isRadians = true; 

// Обработка переключения радиан/градусов
let buttons_two = document.getElementsByClassName("button_two");
let arr_two = [...buttons_two];

arr_two.forEach((element) => {
    element.addEventListener("click", () => {
        element.style.opacity = "1";
        isRadians = element.id === "one_two"; 
        console.log(`Selected: ${isRadians ? "Радианы" : "Градусы"}`);

        arr_two.forEach((item) => {
            if (item !== element) {
                item.style.opacity = "0";
            }
        });
    });
});

// Исполнение тригонометрических операций
function exec_trig_operation(trigFunction, value) {
    let result;

    if (isRadians || (trigFunction === Math.asin || trigFunction === Math.acos || trigFunction === Math.atan)) {
        result = trigFunction(value);
		if (Math.abs(result)<= "1e-5") {
			result = 0;
	}
    } else {
        result = trigFunction(value * (Math.PI / 180));
    }

    if (!isRadians && (trigFunction === Math.asin || trigFunction === Math.acos || trigFunction === Math.atan)) {
        result = result * (180 / Math.PI);
    }



    // Исправление чисел близких к нулю из-за ошибок округления
    if (Math.abs(result) < 1e-7) {
        result = 0;
    }
    // Преобразуем в обычную форму и округляем
    const roundedResult = Math.round(result * 1e8) / 1e8; // Округление до 8 знаков после запятой

    return roundedResult;
}


// Функция для установки числа π
function setPiValue() {
    if (isRadians) {
        indication_register = Math.PI.toFixed(7);
    } else {
        indication_register = 180;
    }
    change_panel_value(indication_register);  // Обновляем отображение на экране калькулятора
    console.log(`Число π установлено: ${indication_register}`);
}

// Функция для переключения режима arc
let isArcMode = false;
function toggleArcMode() {
    isArcMode = !isArcMode;
    console.log(`Arc mode ${isArcMode ? "enabled" : "disabled"}`);
    logState();
}

// Функция для выполнения тригонометрической операции arcsin
function handleArcSin(value) {
    let result;
    if (value < -1 || value > 1) {
        console.error("arcsin is not defined for values outside the range [-1, 1]");
        result = ".0.0.0.0.0.0.0.0. .0.0.";
    } else {
        result = Math.asin(value);
        if (!isRadians) {
            result = result * (180 / Math.PI); // Преобразование в градусы, если режим градусов
        }
        result = Math.round(result * 1e7) / 1e7; // Округление до 8 знаков после запятой
    }
    return result;
}

// Функция для выполнения тригонометрической операции arccos
function handleArcCos(value) {
    let result;
    if (value < -1 || value > 1) {
        console.error("arccos is not defined for values outside the range [-1, 1]");
        result = ".0.0.0.0.0.0.0.0. .0.0.";
    } else {
        result = Math.acos(value);
        if (!isRadians) {
            result = result * (180 / Math.PI); // Преобразование в градусы, если режим градусов
        }
        result = Math.round(result * 1e7) / 1e7; // Округление до 8 знаков после запятой
    }
    return result;
}

// Функция для выполнения тригонометрической операции arctan
function handleArcTan(value) {
    let result;
    result = Math.atan(value);
    if (!isRadians) {
        result = result * (180 / Math.PI); // Преобразование в градусы, если режим градусов
    }
    result = Math.round(result * 1e7) / 1e7; // Округление до 8 знаков после запятой
    return result;
}

// Функция для построения числа из нажатых кнопок
function build_number_from_buttons(event, number) {
    let button_clicked = event.target.textContent;

  

    let string_number = number_to_string(number);
    console.log(`number ${number}`);
	 // Если нажата кнопка смены знака "/-/" и число в научной нотации
    if (button_clicked === "/-/" && clean_number_flag) {
        let match = string_number.match(/^([ -]?)(\d)\.(\d{6}) ([ -])(\d{2})$/);
        if (match) {
            // Инвертируем знак мантиссы
            let sign = match[1] === "-" ? "" : "-";
            string_number =`${sign}${match[2]}.${match[3]}${match[4]}${match[5]}`;
            console.log(`Updated scientific notation: ${string_number}`);
            return string_number; // Возвращаем число в научной нотации
        }
    }
    // Установите переменную, чтобы отслеживать текущий лимит символов
    let currentSymbolLimit = string_number.includes('.') ? SYMBOL_LIMIT + 1 : SYMBOL_LIMIT; // Если есть точка, увеличиваем лимит

    // Проверяем, что вводим только цифру или точку и не превышаем текущий лимит
    if (button_clicked !== "/-/" && string_number.length < currentSymbolLimit) {
        let digit_on_calc = button_clicked;

        // Если вводится точка
        if (digit_on_calc === ".") {
            // Добавляем точку, если её ещё нет в строке
            if (!string_number.includes(".")) {
                string_number += "."; // Добавляем точку к текущему числу
                dot_flag = true;
            }
        } else if (digit_on_calc !== "0") {
            // Если цифра не 0, добавляем её в строку
            if (string_number.length < currentSymbolLimit) { // Проверяем длину ещё раз
                string_number += digit_on_calc;
            }
        } else if (string_number.length > 0) {
            // Если строка не пустая, добавляем 0
            string_number += digit_on_calc;
        }
    }

    // Убираем ведущие нули, если точка отсутствует
    if (!string_number.includes(".")) {
        string_number = string_number.replace(/^0+(?!$)/, "");
    }

    // Если выбор 0 без дробной части
    if (button_clicked === "0" && string_number.length < 2 && dot_flag === false) {
        string_number = '0';
    }

    // Обработка изменения знака числа
    if (button_clicked === "/-/" && string_number.length > 0) {
        console.log("change sign");
        let first_number = string_number[0];
        string_number = first_number === '-' ? string_number.substring(1) : "-" + string_number;
    }

    console.log(`number transformation ${string_number}`);

    return string_number;
}

// Функция для установки значения регистра
function set_register_value() {
    if (indication_register_index === 0) {
        x = Number(indication_register); // Обновляем x
    } else if (indication_register_index === 1) {
        y = Number(indication_register); // Обновляем y
    }
}

function set_indication_register_index(register_const) {
    if(register_const == X_SYM) {
        indication_register_index = 0
    } else if(register_const == Y_SYM) {
        indication_register_index = 1
    }
}

function format_to_rounded_mode(number) {
    console.log(typeof number)
    return number
}

function enter_exponent(event) {
    last_action = "EEx";
    exponent_value = '';
    exponent_sign = '';

    const currentNumber = Number(indication_register);
    if (isNaN(currentNumber)) {
        console.error("Invalid number in indication register");
        return;
    }

    // Обрезаем мантиссу до 7 значащих цифр
    const mantissa = currentNumber.toPrecision(MANTISSA_LIMIT - 1);
    mantissa_full1 = parseFloat(mantissa);

    indication_register = mantissa.toString();
    change_panel_value(indication_register);

    eexflag = 1; // Ожидаем ввод знака или цифры порядка
}



// Оставшаяся функция change_panel_value без дублирования
function change_panel_value(value) {
    indication_register = value
    set_register_value()
    console.log(`format to rounded mode ${format_to_rounded_mode(indication_register)}`)
	if(!clean_number_flag){
    result_panel.textContent = format_to_rounded_mode(indication_register)
	} else {
		result_panel.textContent = indication_register
	}
}

// Функция для записи значения в память
function store_in_memory() {
    memory_value = Number(indication_register);  // Сохраняем значение из регистра индикации
    console.log(`Stored in memory: ${memory_value}`);
}

// Функция для извлечения значения из памяти 
function recall_from_memory() {
    indication_register = memory_value.toString();  // Устанавливаем значение из памяти в регистр индикации
    change_panel_value(indication_register);  // Обновляем панель с результатом
    x = indication_register;
    y = 0;
    console.log(`Recalled from memory: ${memory_value}`);
}

// Улучшенная функция для переключения научной нотации
function toggle_scientific_notation() {
    let formattedNumber = "";
    NormalNumber = 0;
	if (y_full != 0){
        indication_register = y_full;
    }
    if (!clean_number_flag) {
        // Перевод в научную нотацию
        let currentNumber = Number(indication_register);
		console.log(`f00: ${currentNumber}`);

        normalNumber = currentNumber; // Сохраняем число в обычной нотации в zed
        if (currentNumber === 0) {
            formattedNumber = "0.0000000 00";
        } else {
            if (!(currentNumber.includes("e"))) {
			let scientificForm = currentNumber.toExponential();
            }
            else {
                let scientificForm = currentNumber;
            }
        console.log(scientificForm);
        mantissa_full = currentNumber;
        let parts = scientificForm.split("e");

        // Получаем мантиссу и экспоненту
        let mantissa = parts[0];
       // mantissa_full = mantissa;// Убедимся, что мантисса — число
        exponent = parseInt(parts[1]);

        // Усекаем мантиссу до 7 десятичных знаков без округления
        let mantissaStr = mantissa.toString();
        if (mantissaStr.includes('.')) {
            let [intPart, decPart] = mantissaStr.split('.');
            decPart = decPart.substring(0, 7); // Усекаем до 7 знаков
            mantissaStr = `${intPart}.${decPart}`;
        }
        // Если мантисса не имеет десятичной части, добавляем ".0000"
        else {
            mantissaStr = `${mantissaStr}.0000000`;
        }
            // Проверка ограничения (99999 в степени 99)
            if (Math.abs(exponent) > 99) {
                console.error("Число превышает допустимые ограничения научной нотации.");
                change_panel_value(".0.0.0.0.0.0.0.0. .0.0.");
                return;
            }

            // Форматируем мантиссу
            let mantissaString = mantissaStr; // Убираем точку
            let mantissaFormatted = mantissaString.slice(0, 6);
			console.log(`f00: ${currentNumber}`);
            // Формируем строку
            let signMantissa = currentNumber < 0 ? "-" : " ";
            let signExponent = exponent < 0 ? "-" : " ";
            formattedNumber = `${mantissaFormatted.padEnd(6, "0")}${signExponent}${Math.abs(exponent).toString().padStart(2, "0")}`;
        }
        clean_number_flag = true; // Устанавливаем флаг научной нотации
        y_full = 0;
    } else {
        // Возврат в обычное представление
        let match = indication_register.toString().match(/^([ -]?)(\d)\.(\d{1,6}) ([ -]?)(\d{1,2})$/);
        let match1 = indication_register.toString().match(/^([ -]?)(\d{1,6})([ -]?)(\d{1,2})$/);
		let match2 = indication_register.toString().match(/^([" "-]?)(\d)\.(\d{1,6}) ([ -]?)(\d{1,2})$/);

        if (match) {
            // Обработка формата с точкой
            let sign = match[1] === "-" ? -1 : 1;
            let mantissa = parseFloat(`${match[2]}.${match[3].padEnd(6, "0")}`);
            exponentSign = match[7] === "-" ? -1 : 1;
            exponent = parseInt(match[5], 10) * exponentSign;
            y_slice = y.toString().substring(0,8);
			console.log(`g00: ${y_slice}`);
            // Вычисляем обычное число
            if (Math.abs(y) >= 1e9){
                normalNumber = y_slice;
                y_full = y;
            } else{
                normalNumber = mantissa * Math.pow(10, exponent);
            }

            formattedNumber = normalNumber.toString();
        } else if (match1) {
			// Обработка формата без точки (например, 333 02)
			let sign = match1[1] === "-" ? -1 : 1; // Знак мантиссы
			//let mantissa = parseFloat(match1[2]); // Мантисса как целое число
			exponentSign = match1[3] === "-" ? -1 : 1; // Знак экспоненты
			exponent = parseInt(match1[7], 10) * exponentSign; // Экспонента с учетом знака
            let mantissa_fullString = mantissa_full.toString()
            console.log(mantissa_full);
            let mantstr = mantissa_fullString.slice(1,5);
            y_slice = y.toString().substring(0,8);
			// Преобразование в обычное число
			if (Math.abs(y) >= 1e9){
                normalNumber = y_slice;
                y_full = y;
            } else{
                normalNumber = mantissa * Math.pow(10, exponent);
            }
            console.log(normalNumber)
			formattedNumber = normalNumber.toString(); // Сохраняем обычное представление
		} else if (match2) {
            // Обработка формата с точкой
            let mantissa = parseFloat(`${match2[1]}.${match2[2].padEnd(6, "0")}`);
            exponentSign = match2[4] === "-" ? -1 : 1;
            exponent = parseInt(match2[5], 10) * exponentSign;
            y_slice = y.toString().substring(0,8);
			console.log(`g00: ${y_slice}`);
            // Вычисляем обычное число
            if (Math.abs(y) >= 1e9){
                normalNumber = y_slice;
                y_full = y;
            } else{
                normalNumber = mantissa * Math.pow(10, exponent);
            }

            formattedNumber = normalNumber.toString();
        } else {
            console.error("Некорректный формат числа в научной нотации.");
            return;
        }

        clean_number_flag = false; // Отключаем флаг научной нотации
        mantissa_full = 0;
    }

    // Сохраняем число в обычной форме в zed
    zed = normalNumber;
	
    // Отображаем форматированное значение (в научной или обычной форме)
    if (clean_number_flag) {
        indication_register = formattedNumber; // Научная форма
    } else {
		    if (Math.abs(Number(normalNumber)) >= 1e+100) {
                return ".0.0.0.0.0.0.0.0. .0.0.";
    }
        indication_register = normalNumber.toString(); // Обычная форма
    }

    change_panel_value(indication_register);
}


// Функция для очистки текущего числа (Cx)
function clear_current_number() {
    indication_register = ZERO_SYM; // Сбрасываем регистр индикации
    y = 0;
    y_full = 0;
    mantissa_full = 0;
	root1 = 0;
    root2 = 0;
	currentRootIndex = 0;
	operations_stack = []; // Для хранения операций
	values_stack = [];
	a1 = 0;
    dot_flag = false; // Сбрасываем флаг точки
    clean_number_flag = false; // Сбрасываем флаг нового числа
    change_panel_value(ZERO_SYM); // Обновляем экран
    console.log("Текущее число сброшено (C)");
    logState(); // Логгирование состояния
}

// Функции для работы со скобками и уравнениями
function pre_handle_open_parenthesis() {
    if (indication_register !== ZERO_SYM || last_action) {
        // Если указатель указывает на число или была операция, помещаем его в стек как множитель
        values_stack.push(indication_register);
        last_action = EMPTY_SYM; // Убираем действие, так как мы перешли к скобкам
        indication_register = ZERO_SYM; // Сбрасываем регистр
    }
}

function handle_open_parenthesis() {
    // Сохраняем текущее значение и операцию
    operations_stack.push(last_action ? last_action : null);  // Сохраняем последнюю операцию
    values_stack.push(indication_register);                    // Сохраняем текущее значение регистра
    values_stack.push(y);

    // Обновление состояния для новой вычислительной области
    indication_register = ZERO_SYM;  // Сбрасываем регистр
    last_action = EMPTY_SYM;  // Сбрасываем текущую операцию

    console.log("Открыта новая скобка");
}



function handle_close_parenthesis() {
    if (operations_stack.length > 0 && values_stack.length > 2) {
        const last_operation = operations_stack.pop(); // Берем последнюю операцию
        const previous_value = Number(values_stack.pop());     // Вытаскиваем предыдущее значение из стека
        const stored_y = Number(values_stack.pop());           // Вытаскиваем сохраненное y

        // Выполняем операцию на значение в регистре
        let result = Number(indication_register); // Сохраняем текущее значение в регистре

        if (last_operation) {
            switch (last_operation) {
                case "+":
                    result = format_number(previous_value + result);
                    break;
                case "-":
                    result = format_number(previous_value - result);
                    break;
                case "X":
                    result = format_number(previous_value * result);
                    break;
                case "÷":
                        result = format_number(previous_value / result);
                    break;
                default:
                    console.log("Нет операции для выполнения");
            }
        } else {
            result = previous_value; // Если операции не было, просто возвращаем значение
        }

        // Восстанавливаем значения x и y
        x = previous_value;
        y = stored_y;

        indication_register = result.toString();  // Обновляем регистр с новым результатом
        change_panel_value(indication_register);  // Обновляем панель с результатом
        console.log(`Закрыта скобка: вычислено значение ${indication_register}`);
    } else {
        console.log("Ошибка: нет операций или значений для выполнения");
    }
}
function format_to_scientific(value) {
    let number = Number(value);
    if (isNaN(number) || !isFinite(number)) {
        return ".0.0.0.0.0.0.0.0. .0.0.";
    }

    const maxMantissaLength = MANTISSA_LIMIT; // Максимальная длина мантиссы
    const maxExponent = 99; // Максимальная экспонента

    // Проверяем длину строки
    if (value.toString().length > SYMBOL_LIMIT) {
        exponent = Math.floor(Math.log10(Math.abs(number)));
        let mantissa = number / Math.pow(10, exponent);

        if (Math.abs(mantissa) > 99999 || Math.abs(exponent) > maxExponent) {
            return ".0.0.0.0.0.0.0.0. .0.0.";
        }

        // Форматируем мантиссу
        return `${mantissa.toFixed(maxMantissaLength - 1)}e${exponent}`;
    }

    return value.toString();
}
// Функция для форматирования числа
function format_number(value) {
    let maxLength = SYMBOL_LIMIT; // Максимальное количество символов для вывода
    let valueString = value.toString();
    console.log(`c: ${clean_number_flag}`);
    // Если включен флаг чистки, возвращаем значение как есть
    if (clean_number_flag) {
        return value;
    }
	console.log(`value: ${value}`);
	NormalNumber = value;
    mantissa_full = value;
    // Проверка на некорректные значения
    if (Number.isNaN(Number(value)) || !isFinite(value) || Math.abs(Number(value)) >= 1e+100) {
        console.log(`Invalid value: ${value}`);
        return ".0.0.0.0.0.0.0.0. .0.0.";
    }

    // Проверяем, если число в научной форме, конвертируем его обратно в обычное (тут менял)
    if (valueString.includes("e")) {
        let parts = valueString.split("e");
        let exponent = parseInt(parts[1], 10);

        // Корректное определение знака экспоненты
        let exponentSign = exponent >= 0 ? " " : "-"; // <-- Исправлено здесь!

        // Форматирование с сохранением знака
        let formattedValue = `${mantissaStr}${exponentSign}${Math.abs(exponent).toString().padStart(2, "0")}`;
        return formattedValue;
    }

    // Если число больше или равно 1e+8 или меньше -1e+8, переводим в научную нотацию
    if (Math.abs(Number(value)) >= 1e+9 && (!clean_number_flag)) {
        NormalNumber = Number(value);
        console.log(value);
        let scientificForm = value.toExponential();
        console.log(scientificForm);
        let parts = scientificForm.split("e");

        // Получаем мантиссу и экспоненту
        let mantissa = parts[0];
       // mantissa_full = mantissa;// Убедимся, что мантисса — число
        exponent = parseInt(parts[1]);

        // Усекаем мантиссу до 7 десятичных знаков без округления
        let mantissaStr = mantissa.toString();
        if (mantissaStr.includes('.')) {
            let [intPart, decPart] = mantissaStr.split('.');
            decPart = decPart.substring(0, 7); // Усекаем до 7 знаков
            mantissaStr = `${intPart}.${decPart}`;
        }
        // Если мантисса не имеет десятичной части, добавляем ".0000"
        else {
            mantissaStr = `${mantissaStr}.0000`;
        }

        // Формируем отформатированное значение
        exponentSign = exponent >= 0 ? " " : "-";
        let formattedValue = `${mantissaStr}${exponentSign}${Math.abs(exponent).toString().padStart(2, "0")}`;
        clean_number_flag = true;
        return formattedValue;
    }

    // Проверка на отрицательность числа и корректировка длины
    if (value < 0) {
        maxLength += 1; // Увеличиваем длину на 1 для знака
    }

    // Если значение NaN или слишком большое, выводим спец. символ
    if (value === "NaN" || Math.abs(Number(value)) >= 1e+100) {
        return ".0.0.0.0.0.0.0.0. .0.0.";
    }

    // Если длина значения больше максимальной, обрезаем
    if (valueString.length > maxLength) {
        if (valueString.includes(".")) {
            // Если есть дробная часть, сокращаем её без округления
            let [integerPart, decimalPart] = valueString.split(".");
            const allowedDecimalLength = maxLength - integerPart.length; // -1 для точки
			
            if (allowedDecimalLength > 0) {
                return `${integerPart}.${decimalPart.substring(0, allowedDecimalLength)}`;
            } else {
                return `${integerPart}`; // Если дробная часть не помещается
            }
        } else {
            // Если нет дробной части, выводим переполнение
        y_full = value;
        let scientificForm = value.toExponential();
        console.log(scientificForm);
        let parts = scientificForm.split("e");

        // Получаем мантиссу и экспоненту
        let mantissa = Number(parts[0]);  // Убедимся, что мантисса — число
        exponent = parseInt(parts[1]);

        // Усекаем мантиссу до 7 десятичных знаков без округления
        let mantissaStr = mantissa.toString();
        if (mantissaStr.includes('.')) {
            let [intPart, decPart] = mantissaStr.split('.');
            decPart = decPart.substring(0, 7); // Усекаем до 7 знаков
            mantissaStr = `${intPart}.${decPart}`;
        }
        // Если мантисса не имеет десятичной части, добавляем ".0000"
        else {
            mantissaStr = `${mantissaStr}.0000000`;
        }

        // Формируем отформатированное значение
        exponentSign = exponent >= 0 ? " " : "";
        let formattedValue = `${mantissaStr}${exponentSign}${Math.abs(exponent).toString().padStart(2, "0")}`;
        clean_number_flag = true;
        y
        return formattedValue;
    };
        }
        if (Number.isNaN(Number(value)) || !isFinite(value) || Math.abs(Number(value)) >= 1e+100) {
            console.log(`Invalid value: ${value}`);
            return ".0.0.0.0.0.0.0.0. .0.0.";
        }
        
    return valueString; // Возвращаем число как есть, если длина допустима
}



// Функция для выполнения операций
function exec_operations() {
    if (last_action) {
        switch (last_action) {
            case "+":
                if (eexflag){
                    exponent_sign = last_action;
                } else {               
                    y = format_number(+y + Number(x)); // Сложение
                }
                break;
            case "-":
                if (eexflag){
                    exponent_sign = last_action;
                } else {
                    y = format_number(+y - Number(x)); // Вычитание
                }
                break;
            case "X":
                console.log(clean_number_flag);
                y = format_number(+y * Number(x)); // Умножение
                console.log(y);
                
                break;
            case "÷":
                    y = format_number(+y / Number(x)); // Деление
  
                break;
            case "√":
		if (x !== 0) {
                	y = format_number(Math.sqrt(x)); 
                } else if(y !== 0) {
                        y = format_number(Math.sqrt(y));
		} else{
            change_panel_value(".0.0.0.0.0.0.0.0. .0.0."); // Отображаем ошибку
			isSecondSymbolic = false;
                        return ".0.0.0.0.0.0.0.0. .0.0."; // Выход из функции после ошибки
                    }
      		break;    
                

           // Убрали случай "EEx", т.к. он обрабатывается отдельно
            case "Xy": // Возведение в степень
                y = format_number(Math.pow(y, Number(x))); // Возводим Y в степень X
                break;
        }

        // Обновляем отображение результата операции
        change_panel_value(y);
        logState();
		y_full = y;
        // Обновляем регистры
        indication_register = y.toString(); // Сохраняем результат в регистре как мантиссу
	if (clean_number_flag){
	   y = NormalNumber;
	}
        x = 0; // Сбрасываем x для новой операции
        last_action = EMPTY_SYM; // Очищаем последнее действие
    }
}

// Функция для переключения символики
function toggle_symbolic_true() {
    isSecondSymbolic = !isSecondSymbolic;
    const symbolicText = isSecondSymbolic ? "2-я символика" : "1-я символика";
    console.log(`Переключение на ${symbolicText}`);
    logState();
}

function swap_indication_and_working_register() {
    // Обмен содержимым регистра индикации и рабочего регистра 
    [indication_register, y] = [y.toString(), Number(indication_register)];
    console.log(`Swapped registers: indication_register = ${indication_register}, y = ${y}`);
}

// Добавление событий для кнопок
const buttons = document.querySelectorAll('.btn_cont');
buttons.forEach(button => {
    button.addEventListener("click", (event) => {
        const buttonText = event.target.textContent;

        // Проверяем состояние калькулятора, кроме переключателей
        if (!isCalculatorOn && !event.target.classList.contains("button_one") && !event.target.classList.contains("button_two")) {
            console.log("Калькулятор выключен. Нажатие кнопок не допускается.");
            return; // Игнорируем действия на остальных кнопках
        }

        if (event.target.classList.contains("button_one")) {
            // Обработка переключателей "button_one"
            arr_one.forEach((item) => {
                item.style.opacity = item === event.target ? "1" : "0";
            });

            isCalculatorOn = event.target.id === "power_on";
            console.log(isCalculatorOn ? "Калькулятор включен" : "Калькулятор выключен");

            if (isCalculatorOn) {
                calculatorScreen.textContent = ZERO_SYM; // Устанавливаем ноль на экране
            } else {
                calculatorScreen.textContent = ""; // Очищаем экран
                resetCalculatorState();
            }
            return;
        }

        if (event.target.classList.contains("button_two")) {
            // Обработка переключателей "button_two"
            arr_two.forEach((item) => {
                item.style.opacity = item === event.target ? "1" : "0";
            });

            isRadians = event.target.id === "one_two";
            console.log(`Режим: ${isRadians ? "Радианы" : "Градусы"}`);
            return;
        }

        if (isSecondSymbolic) {

            // Обработка второй символики
            switch (buttonText) {
                case "π":
                    // Вычисление факториала
                    const num = parseFloat(indication_register);
                    if (num < 0 || !Number.isInteger(num)) {
                        change_panel_value(".0.0.0.0.0.0.0.0. .0.0."); // Ошибка для отрицательных или нецелых чисел
                    } else {
                        let factorial = 1;
                        for (let i = 1; i <= num; i++) {
                            factorial *= i;
                        }
                        // Ограничиваем результат до 7 значащих знаков
                        indication_register = format_number(Number(factorial.toPrecision(8)));
                    }
                    break;
                case "/-/":
                    if (x !== 0) {
                        indication_register = format_number(1 / x);
                        y = Number(indication_register); // Обратная величина
                    } else if (y !== 0) {
                        indication_register = format_number(1 / y);
                        y = Number(indication_register); // Обратная величина
                    } else {
                        change_panel_value(".0.0.0.0.0.0.0.0. .0.0."); // Отображаем ошибку
                        isSecondSymbolic = false;
                        return ".0.0.0.0.0.0.0.0. .0.0."; // Выход из функции после ошибки
                    }
                    break;
                case "7":
                    indication_register = format_number(Math.exp(parseFloat(indication_register)));
                    break;
                case "8":
                    indication_register = format_number(Math.pow(10, parseFloat(indication_register)));
                    break;
                case "9":
                    last_action = "Xy";
                    y = indication_register;
                    indication_register = ZERO_SYM;
                    dot_flag = false;
                    break;
                case "÷":
                    indication_register = format_number(parseFloat(memory_value) / indication_register);
                    break;
                case "4":
                    indication_register = format_number(Math.log(parseFloat(indication_register)));
                    break;
                case "5":
                    indication_register = format_number(Math.log10(parseFloat(indication_register)));
                    break;
                case "6":
                    if (clean_number_flag) {
                        indication_register = NormalNumber;
                        clean_number_flag = 0;
                    }
                    indication_register = format_number(Math.sqrt(parseFloat(indication_register)));
                    break;
                case "X":
                    indication_register = format_number(parseFloat(indication_register) * memory_value);
                    break;
                case "1":
                    indication_register = format_number(exec_trig_operation(Math.sin, parseFloat(indication_register)));
                    break;
                case "2":
                    indication_register = format_number(exec_trig_operation(Math.cos, parseFloat(indication_register)));
                    break;
                case "3":
                    indication_register = format_number(exec_trig_operation(Math.tan, parseFloat(indication_register)));
                    break;
                case "-":
                    indication_register = format_number(parseFloat(memory_value) - indication_register);
                    break;
                case "0":
                    indication_register = format_number((parseFloat(indication_register) * 180) / Math.PI);
                    break;
                case ".":
                    indication_register = format_number((parseFloat(indication_register) * Math.PI) / 180);
                    break;
                case "=":
                    recall_from_memory();  // Вызвать из памяти   
                    break;
                case "+":
                    indication_register = format_number(parseFloat(indication_register) + memory_value);
                    break;
                case "C":
                    isSecondSymbolic = false;
                    break;
                case "[(":
                    store_in_memory();  // Записать в память
                    break;
                case ")]":
                    memory_value = 0;
                    break;
                case "⟷":
                    [indication_register, memory_value] = [memory_value.toString(), Number(indication_register)];
                    indication_register = Number(indication_register).toString(); // Преобразуем обратно в строку для корректного отображения
                    break;
            }
            change_panel_value(format_number(indication_register));
            isSecondSymbolic = false;
            logState();
        } else {

            // Обработка клавиши "C" для сброса после "ВП"
            if ((eexflag === 1 || eexflag === 2) && buttonText === "C") {
                // Сброс состояния научной нотации
                eexflag = 0;
                exponent_sign = '';
                exponent_value = '';
                indication_register = ZERO_SYM; // Сбрасываем значение регистра
                change_panel_value(indication_register);
                x = 0;
                y = 0;
                a1 = 0;
                root1 = 0;
                root2 = 0;
                zed = 0;
                NormalNumber = 0;
                overc = 0;
                eexflag = 0;
                operations_stack = [];
                values_stack = [];
                dot_flag = false;
                clean_number_flag = false;
                last_action = EMPTY_SYM;
                console.log("EEx сброшен с помощью клавиши C");
                return; // Выходим из обработчика
            }

            // В обработчике кнопок для eexflag=1:
            if (eexflag === 1) {
                if (buttonText === "/-/") {
                    exponent_sign = "-";
                    eexflag = 2;
                    // Отображаем мантиссу, знак "-" и "00" для порядка
                    change_panel_value(`${mantissa_full1}${exponent_sign}00`);
                } else if (/^\d$/.test(buttonText)) {
                    exponent_sign = "";
                    exponent_value = buttonText;
                    eexflag = 2;
                    // Отображаем мантиссу, пробел и первую цифру порядка с пробелом
                    change_panel_value(`${mantissa_full1} ${exponent_value.padEnd(2, ' ')}`);
                }
                return;
            }

            // В обработчике кнопок для eexflag=2:
            if (eexflag === 2) {
                if (/^\d$/.test(buttonText)) {
                    if (exponent_value.length < 2) {
                        exponent_value += buttonText; // Добавляем цифру в конец
                        // Обновляем отображение порядка (дополняем пробелами)
                        const displayExp = exponent_value.padEnd(2, ' ');
                        change_panel_value(`${mantissa_full1}${exponent_sign}${displayExp}`);

                        // Автоматическое применение при вводе двух цифр
                        if (exponent_value.length === 2) {
                            finalizeExponent();
                        }
                    }
                } else if (buttonText === "=") {
                    // Дополняем слева нулями до двух цифр
                    exponent_value = exponent_value.padStart(2, '0');
                    finalizeExponent();
                }
                return;
            }

            // Функция завершения ввода экспоненты
            function finalizeExponent() {
                const order = parseInt(exponent_sign + exponent_value, 10);

                if (order < -99 || order > 99) {
                    change_panel_value(".0.0.0.0.0.0.0.0. .0.0.");
                    resetExponent();
                    return;
                }

                const result = mantissa_full1 * Math.pow(10, order);
                indication_register = format_number(result);
                change_panel_value(indication_register);

                resetExponent();
            }

            function resetExponent() {
                eexflag = 0;
                exponent_sign = '';
                exponent_value = '';
            }


            // Основная обработка кнопок
            if (buttonText === "=") {
                exec_operations();
            } else if (buttonText === "⟷") {
                swap_indication_and_working_register();  // Обмен регистра индикации и рабочего регистра
                change_panel_value(indication_register); // Обновляем отображение панели
            } else if (buttonText === "arc") {
                toggleArcMode();
            } else if (buttonText === "1" && isArcMode) {
                // Если включен режим arc и нажата кнопка "1", выполняем arcsin
                const inputValue = parseFloat(indication_register);
                const result = handleArcSin(inputValue);
                indication_register = result.toString();
                change_panel_value(indication_register);
                isArcMode = false; // Выключаем режим arc после выполнения операции
            } else if (buttonText === "2" && isArcMode) {
                // Если включен режим arc и нажата кнопка "2", выполняем arccos
                const inputValue = parseFloat(indication_register);
                const result = handleArcCos(inputValue);
                indication_register = result.toString();
                change_panel_value(indication_register);
                isArcMode = false; // Выключаем режим arc после выполнения операции
            } else if (buttonText === "3" && isArcMode) {
                // Если включен режим arc и нажата кнопка "3", выполняем arctan
                const inputValue = parseFloat(indication_register);
                const result = handleArcTan(inputValue);
                indication_register = result.toString();
                change_panel_value(indication_register);
                isArcMode = false; // Выключаем режим arc после выполнения операции
            } else if (buttonText === "π") {
                setPiValue();
            } else if (buttonText === "ВП") {
                enter_exponent(event);
            } else if (buttonText === "[(") {
                handle_open_parenthesis();
            } else if (buttonText === ")]") {
                exec_operations();
                handle_close_parenthesis();
            } else if (buttonText === "F") {
                toggle_symbolic_true();
            } else if (buttonText === "C") {
                clear_current_number(); // Вызов функции сброса текущего числа    
            } else if (
                (!isSecondSymbolic && first_operator_actions.includes(buttonText)) ||
                (isSecondSymbolic && second_operator_actions.includes(buttonText))
            ) {
				
                if (last_action){
					
                
				exec_operations()};
		y = indication_register;

                last_action = buttonText;
                indication_register = ZERO_SYM;
                if (clean_number_flag){
                    y = NormalNumber;
                    clean_number_flag = 0;
                }
                dot_flag = false;
            } else {
                const number = build_number_from_buttons(event, indication_register);
                change_panel_value(number);
            }

            logState();
        }

        // После ввода значения экспоненты, выполняем вычисление
        if (eexflag === 2 && /^[0-9]$/.test(buttonText)) {
            exponent = parseInt(`${exponent_sign}${buttonText}`);
            if (!isNaN(exponent)) {
                const mantissa = parseFloat(indication_register.split('E')[0]);
		const finalNumber = mantissa * Math.pow(10, exponent);
		console.log(`finalNumber ${finalNumber}`);
                indication_register = format_number(finalNumber);
                change_panel_value(indication_register);
            }
	    
           
        }
    });
});

// Инициализация калькулятора при загрузке страницы
window.onload = () => {
    change_panel_value(ZERO_SYM);
    x = 0; 
    indication_register = ZERO_SYM; 
    dot_flag = false; 
    last_action = EMPTY_SYM; 
    logState(); // Логгирование начального состояния
};

