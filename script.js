let currentExpression = "";
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
let theme = localStorage.getItem("calcTheme") || "dark";

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  applyTheme();
  updateDisplay();
  renderHistory();
});

// Theme management
function toggleTheme() {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("calcTheme", theme);
  applyTheme();
}

function applyTheme() {
  document.body.setAttribute("data-theme", theme);
  const toggleBtn = document.querySelector(".theme-toggle");
  toggleBtn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}

// Display management
function updateDisplay() {
  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  expressionEl.textContent = currentExpression || "";

  if (currentExpression) {
    try {
      const result = evaluateExpression(currentExpression);
      if (result !== null && isFinite(result)) {
        resultEl.textContent = formatNumber(result);
        resultEl.classList.remove("error");
      } else {
        // Only show error if trying to calculate incomplete expression
        if (isIncompleteExpression(currentExpression)) {
          resultEl.textContent = currentExpression;
          resultEl.classList.remove("error");
        } else {
          resultEl.textContent = "Error";
          resultEl.classList.add("error");
        }
      }
    } catch (e) {
      // Don't show error for incomplete expressions, just show the current input
      if (isIncompleteExpression(currentExpression)) {
        resultEl.textContent = currentExpression;
        resultEl.classList.remove("error");
      } else {
        resultEl.textContent = currentExpression === "" ? "0" : "Error";
        resultEl.classList.add("error");
      }
    }
  } else {
    resultEl.textContent = "0";
    resultEl.classList.remove("error");
  }
}

function isIncompleteExpression(expr) {
  // Check if expression ends with an operator or is just building up
  const operators = ["+", "-", "*", "/", "%"];
  const lastChar = expr.slice(-1);

  // If ends with operator, it's incomplete but valid so far
  if (operators.includes(lastChar)) {
    return true;
  }

  // If it has an operator but no second operand, it's incomplete
  for (let op of operators) {
    if (expr.includes(op)) {
      const parts = expr.split(op);
      if (parts.length === 2 && parts[1].trim() === "") {
        return true;
      }
    }
  }

  return false;
}

// Expression management

function addToExpression(value) {
  animateButton();

  if (["+", "-", "*", "/", "%"].includes(value)) {
    if (
      currentExpression &&
      !["+", "-", "*", "/", "%", "("].includes(currentExpression.slice(-1))
    ) {
      currentExpression += value;
    }
  } else {
    currentExpression += value;
  }

  updateDisplay();
}

function deleteLast() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  currentExpression = "";
  updateDisplay();
}

// Calculation logic

function calculate() {
  if (!currentExpression) return;

  try {
    // Check if expression is incomplete (ends with operator)
    if (isIncompleteExpression(currentExpression)) {
      animateError();
      const resultEl = document.getElementById("result");
      resultEl.textContent = "Error";
      resultEl.classList.add("error");
      return;
    }

    const result = evaluateExpression(currentExpression);

    if (result !== null && isFinite(result)) {
      addToHistory(currentExpression, result);
      currentExpression = result.toString();
      updateDisplay();
      animateSuccess();
    } else {
      throw new Error("Invalid calculation");
    }
  } catch (e) {
    animateError();
  }
}

function evaluateExpression(expr) {
  try {
    // Replace display symbols with actual operators
    let cleanExpr = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/.()%\s]/g, "");

    // Handle percentage
    cleanExpr = cleanExpr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Validate expression
    if (!isValidExpression(cleanExpr)) {
      throw new Error("Invalid expression");
    }

    // Use Function constructor instead of eval for safety
    return Function('"use strict"; return (' + cleanExpr + ")")();
  } catch (e) {
    throw new Error("Calculation error");
  }
}

function isValidExpression(expr) {
  // Basic validation to prevent code injection
  const allowedChars = /^[0-9+\-*/.()%\s]+$/;
  return allowedChars.test(expr) && expr.trim() !== "";
}

function formatNumber(num) {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return parseFloat(num.toFixed(10)).toString();
}

// History management

function toggleHistory() {
  const historyPanel = document.getElementById("historyPanel");
  const overlay = document.getElementById("overlay");

  historyPanel.classList.add("show");
  overlay.classList.add("show");
}

function closeHistory() {
  const historyPanel = document.getElementById("historyPanel");
  const overlay = document.getElementById("overlay");

  historyPanel.classList.remove("show");
  overlay.classList.remove("show");
}

// History tab management

function addToHistory(expression, result) {
  const historyItem = {
    expression: expression,
    result: result,
    timestamp: new Date().toLocaleTimeString(),
  };

  history.unshift(historyItem);

  // Keep only last 10 items
  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  localStorage.setItem("calcHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyList = document.getElementById("history-list");

  if (history.length === 0) {
    historyList.innerHTML =
      '<div style="text-align: center; opacity: 0.5; padding: 20px;">No calculations yet</div>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
                <div class="history-item" onclick="useHistoryItem('${
                  item.result
                }')">
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${formatNumber(
                      item.result
                    )}</div>
                </div>
            `
    )
    .join("");
}

function useHistoryItem(result) {
  currentExpression = result;
  updateDisplay();
}

function clearHistory() {
  history = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
}

// Useful function button
function copyResult() {
  const result = document.getElementById("result").textContent;
  navigator.clipboard.writeText(result).then(() => {
    const copyBtn = document.querySelector(".control-btn");
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1000);
  });
}

function animateButton() {
  // Add visual feedback for button press
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.add("success-animation");
      setTimeout(() => {
        this.classList.remove("success-animation");
      }, 300);
    });
  });
}

function animateSuccess() {
  const result = document.getElementById("result");
  result.classList.add("success-animation");
  setTimeout(() => {
    result.classList.remove("success-animation");
  }, 300);
}

function animateError() {
  const result = document.getElementById("result");
  result.classList.add("error");
  setTimeout(() => {
    result.classList.remove("error");
  }, 500);
}
