import { signUp, login, getCurrentUser } from "../lib/auth.js";

let mode = "login";
let submitBtn;
let toggleEl;
let errorEl;

async function submit() {
  submitBtn.disabled = true;

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) {
    errorEl.textContent = "必要項目をすべて入力してください";
    errorEl.classList.remove("display-none");
    submitBtn.disabled = false;
    return;
  }

  if (mode === "login") {

    const { error } = await login(email, password);
    if (error) {
      errorEl.textContent = error.message === "Invalid login credentials" ? "ログイン情報が間違っています" : error.message;
      errorEl.classList.remove("display-none");
      submitBtn.disabled = false;
      return;
    }

  } else {

    const { error } = await signUp(email, password);
    if (error) {
      errorEl.textContent = error.message === "User already registered" ? "登録済みです。「すでにアカウントをお持ちの方はこちら」をクリックしてログインしてください" : error.message;
      errorEl.classList.remove("display-none");
      submitBtn.disabled = false;
      return;
    }

  }

  // 成功時リダイレクト
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

  location.href = redirect;
};

function switchMode() {
  const title = document.getElementById("title");
  mode = mode === "login" ? "signup" : "login";

  if (mode === "login") {
    title.textContent = "ログイン";
    submitBtn.textContent = "ログイン";
    toggleEl.textContent = "アカウントをお持ちでない方はこちら";
    errorEl.classList.add("display-none");
  } else {
    title.textContent = "新規登録";
    submitBtn.textContent = "登録する";
    toggleEl.textContent = "すでにアカウントをお持ちの方はこちら";
    errorEl.classList.add("display-none");
  }
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  submitBtn = document.getElementById("submitBtn");
  submitBtn.addEventListener("click", submit);
  toggleEl = document.getElementById("toggleText");
  toggleEl.addEventListener("click", switchMode);
  errorEl = document.getElementById("error");
});
