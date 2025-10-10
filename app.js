// === あなたの環境に合わせて設定 ===
const liffId = "2008124621-9gEeG5K6";
const gasUrl = "https://script.google.com/macros/s/AKfycbzZE4yzQAzYCqhiZOrowGhKuPGhor1hQwCa4weEGdhG-yRvygAWubZsfEuFxqQsP4HNwA/exec"; // 公開URL

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

// === 画像アップロード ===
async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("画像を選択してください。");

  document.getElementById("preview").src = URL.createObjectURL(file);

  // Base64エンコードしてGASに送信
  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result.split(",")[1];

    try {
      await fetch(gasUrl, {
        method: "POST",
        mode: "no-cors", // 🔥 CORS回避（レスポンス読めないけど送信OK）
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "upload",
          image: base64Data,
          filename: file.name,
          contentType: file.type,
          userId: window.currentUserId,
        }),
      });

      alert("✅ 画像を送信しました！（数秒後に反映されます）");
      setTimeout(loadHistory, 3000); // 少し待ってから履歴再読込
    } catch (err) {
      alert("通信エラー: " + err.message);
    }
  };
  reader.readAsDataURL(file);
}

// === アップロード履歴取得 ===
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
