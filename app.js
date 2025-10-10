// === あなたの環境に合わせて設定 ===
const liffId = "あなたのLIFF_ID";
const gasUrl = "https://script.google.com/macros/s/あなたのGASデプロイID/exec"; // 公開URL

async function main() {
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    document.getElementById("loginBtn").onclick = () => liff.login();
  } else {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    const profile = await liff.getProfile();
    document.getElementById("profile").innerHTML =
      `こんにちは、${profile.displayName} さん！`;
    window.currentUserId = profile.userId;

    loadHistory();
  }

  document.getElementById("logoutBtn").onclick = () => {
    liff.logout();
    location.reload();
  };

  document.getElementById("uploadBtn").addEventListener("click", uploadFile);
}

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("画像を選択してください。");

  document.getElementById("preview").src = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append("mode", "upload");
  formData.append("file", file);
  formData.append("userId", window.currentUserId);

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("アップロード成功！");
      loadHistory();
    } else {
      alert("エラー: " + result.message);
    }
  } catch (err) {
    alert("通信エラー: " + err.message);
  }
}

async function loadHistory() {
  try {
    const res = await fetch(`${gasUrl}?mode=history&userId=${window.currentUserId}`);
    const data = await res.json();
    const list = document.getElementById("historyList");
    list.innerHTML = "";
    data.forEach(row => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${row.fileUrl}" target="_blank">${row.fileName}</a> (${row.createdAt})`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("履歴読み込みエラー:", err);
  }
}

window.onload = main;
