"use strict";

const display = document.querySelector("#display");
const previous = document.querySelector("#previous");
const message = document.querySelector("#message");
const buttons = document.querySelector("#buttons");

let current = "0";
let stored = null;
let operator = null;
let replaceCurrent = false;
let lastOperand = null;
let lastOperator = null;

const symbols = { "+": "+", "−": "−", "×": "×", "÷": "÷" };

function render() {
  display.textContent = current;
  previous.textContent = stored !== null && operator ? `${stored} ${operator}` : "";
}

function cleanNumber(number) {
  if (!Number.isFinite(number)) return null;
  // Floating point arithmetic can leave tiny tails (for example 0.1 + 0.2).
  return Number(number.toPrecision(12)).toString();
}

function calculate(a, op, b) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return b === 0 ? null : a / b;
  return b;
}

function enterDigit(digit) {
  if (replaceCurrent) {
    current = digit;
    replaceCurrent = false;
  } else if (current === "0") {
    current = digit;
  } else if (current === "-0") {
    current = `-${digit}`;
  } else if (current.replace("-", "").length < 15) {
    current += digit;
  }
  message.textContent = "Numbers! Numbers!";
  render();
}

function chooseOperator(nextOperator) {
  const value = Number(current);
  if (operator && !replaceCurrent) {
    const result = calculate(Number(stored), operator, value);
    const normalized = result === null ? null : cleanNumber(result);
    if (normalized === null) return showError("Cannot divide by zero. Math said no.");
    current = normalized;
    stored = normalized;
  } else {
    stored = current;
  }
  operator = nextOperator;
  replaceCurrent = true;
  lastOperator = null;
  lastOperand = null;
  message.textContent = "Operator selected. Thrilling.";
  render();
}

function equals() {
  let op = operator;
  let left = stored;
  let right = Number(current);
  if (!op && lastOperator) {
    op = lastOperator;
    left = current;
    right = lastOperand;
  }
  if (!op || left === null) return;
  const result = calculate(Number(left), op, right);
  const normalized = result === null ? null : cleanNumber(result);
  if (normalized === null) return showError("Cannot divide by zero. Math said no.");
  previous.textContent = `${left} ${op} ${right} =`;
  current = normalized;
  lastOperator = op;
  lastOperand = right;
  stored = null;
  operator = null;
  replaceCurrent = true;
  message.textContent = "The answer is answer.";
  render();
  previous.textContent = `${left} ${op} ${right} =`;
}

function decimal() {
  if (replaceCurrent) {
    current = "0.";
    replaceCurrent = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  render();
}

function clear() {
  current = "0";
  stored = null;
  operator = null;
  replaceCurrent = false;
  lastOperand = null;
  lastOperator = null;
  message.textContent = "Fresh start!";
  render();
}

function erase() {
  if (replaceCurrent) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

function showError(text) {
  current = "Error";
  stored = null;
  operator = null;
  replaceCurrent = true;
  lastOperand = null;
  lastOperator = null;
  message.textContent = text;
  render();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
  if (button.dataset.operator) chooseOperator(button.dataset.operator);
  if (button.dataset.action === "decimal") decimal();
  if (button.dataset.action === "equals") equals();
  if (button.dataset.action === "clear") clear();
  if (button.dataset.action === "delete") erase();
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === ".") decimal();
  else if (event.key === "+") chooseOperator("+");
  else if (event.key === "-") chooseOperator("−");
  else if (event.key === "*") chooseOperator("×");
  else if (event.key === "/") { event.preventDefault(); chooseOperator("÷"); }
  else if (event.key === "Enter" || event.key === "=") equals();
  else if (event.key === "Backspace") erase();
  else if (event.key === "Escape") clear();
});

render();
