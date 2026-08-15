
(function () {
  'use strict';

  const displayCurrent = document.getElementById('display-current');
  const displayExpression = document.getElementById('display-expression');
  const btnGrid = document.getElementById('btn-grid');

  let currentInput = '0';     
  let previousInput = '';     
  let operator = null;        
  let shouldResetScreen = false; 
  let lastResult = null;    


  function updateDisplay() {
 
    if (currentInput.length > 12) {
      displayCurrent.classList.add('shrink');
    } else {
      displayCurrent.classList.remove('shrink');
    }

    displayCurrent.classList.remove('error');
    displayCurrent.textContent = currentInput;
  }

  function updateExpression(text) {
    displayExpression.textContent = text;
  }

  function showError(message) {
    displayCurrent.classList.add('error');
    displayCurrent.textContent = message;
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetScreen = false;
    lastResult = null;
    updateExpression('');
  }

  function calculate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) return null;

    let result;

    switch (op) {
      case '+':
        result = numA + numB;
        break;
      case '−':
        result = numA - numB;
        break;
      case '×':
        result = numA * numB;
        break;
      case '÷':
        if (numB === 0) {
          return 'DIV_BY_ZERO';
        }
        result = numA / numB;
        break;
      default:
        return null;
    }

  
    result = parseFloat(result.toPrecision(12));
    return result;
  }


  function handleNumber(value) {
    if (shouldResetScreen) {
      currentInput = '';
      shouldResetScreen = false;
    }

    if (currentInput === '0' && value !== '.') {
      currentInput = value;
    } else {
      // Limit input length
      if (currentInput.length >= 16) return;
      currentInput += value;
    }

    updateDisplay();
  }

  function handleDecimal() {
    if (shouldResetScreen) {
      currentInput = '0';
      shouldResetScreen = false;
    }

    if (currentInput.includes('.')) return;

    currentInput += '.';
    updateDisplay();
  }

  function handleOperator(nextOp) {
    if (operator && !shouldResetScreen) {
      const result = calculate(previousInput, operator, currentInput);

      if (result === 'DIV_BY_ZERO') {
        showError('Cannot divide by zero');
        return;
      }

      if (result === null) {
        showError('Error');
        return;
      }

      currentInput = String(result);
      updateDisplay();
    }

    previousInput = currentInput;
    operator = nextOp;
    shouldResetScreen = true;
    lastResult = null;

   
    updateExpression(previousInput + ' ' + operator);

    highlightOperator(nextOp);
  }

  function handleEquals() {
    if (!operator) return;

    const expressionText = previousInput + ' ' + operator + ' ' + currentInput;
    const result = calculate(previousInput, operator, currentInput);

    if (result === 'DIV_BY_ZERO') {
      showError('Cannot divide by zero');
      updateExpression(expressionText + ' =');
      return;
    }

    if (result === null) {
      showError('Error');
      return;
    }

    updateExpression(expressionText + ' =');
    currentInput = String(result);
    lastResult = result;
    previousInput = '';
    operator = null;
    shouldResetScreen = true;

    updateDisplay();
    clearOperatorHighlight();
  }

  function handleClear() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetScreen = false;
    lastResult = null;

    updateDisplay();
    updateExpression('');
    clearOperatorHighlight();
  }

  function handleBackspace() {
    if (shouldResetScreen) return;

    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }

    updateDisplay();
  }

  function handlePercent() {
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;

    currentInput = String(parseFloat((num / 100).toPrecision(12)));
    updateDisplay();
  }

  
  function highlightOperator(op) {
    clearOperatorHighlight();
    const opButtons = btnGrid.querySelectorAll('[data-action="operator"]');
    opButtons.forEach(function (btn) {
      if (btn.dataset.value === op) {
        btn.classList.add('active');
      }
    });
  }

  function clearOperatorHighlight() {
    const opButtons = btnGrid.querySelectorAll('[data-action="operator"]');
    opButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });
  }

 
  function setRipplePosition(btn, e) {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--ripple-x', x + '%');
    btn.style.setProperty('--ripple-y', y + '%');
  }

  btnGrid.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;
    setRipplePosition(btn, e);

    switch (action) {
      case 'number':
        handleNumber(value);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'operator':
        handleOperator(value);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'clear':
        handleClear();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'percent':
        handlePercent();
        break;
    }
  });

  document.addEventListener('keydown', function (e) {
    const key = e.key;

    if (['0','1','2','3','4','5','6','7','8','9','.','/','+','-','*','Enter','Backspace','Escape','%'].includes(key)) {
      e.preventDefault();
    }

    if (key >= '0' && key <= '9') {
      handleNumber(key);
    } else if (key === '.') {
      handleDecimal();
    } else if (key === '+') {
      handleOperator('+');
    } else if (key === '-') {
      handleOperator('−');
    } else if (key === '*') {
      handleOperator('×');
    } else if (key === '/') {
      handleOperator('÷');
    } else if (key === 'Enter' || key === '=') {
      handleEquals();
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === 'Escape' || key === 'Delete') {
      handleClear();
    } else if (key === '%') {
      handlePercent();
    }
  });

  updateDisplay();

})();
