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


