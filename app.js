// ===== 設定 =====
const liffId = "2008124621-9gEeG5K6"; // ← LIFF IDに置き換え
const gasUrl = "AKfycbxvGTM54JATIaSCvNBuqGCAQXmkXoWYCy3yR3t0LIjqe2Ip0cqcFjU0BjD0auP6mB1TXg"; // ← デプロイ済みGAS URLに置き換え

// ===== 初期化 =====
async function main() {
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    document.getElementById("loginBtn").onclick = () => liff.login();
  } else {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    const profile = await liff.getProfile();
    document.getElementById("profile").innerHTML =
      "こんにちは、" + profile.displayName + " さん！";
    window.currentUserId = profile.userId;

    loadHistory();
  }

  document.getElementById("logoutBtn").onclick = () => {
    liff.logout();
    location.reload();
  };

  document.getElementById("uploadBtn").addEventListener("click", uploadFile);
}

// ===== 画像アップロード =====
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("画像を選択してください");
    return;
  }

  // プレビュー表示
  document.getElementById("preview").src = URL.createObjectURL(file);

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result.split(",")[1];

    try {
      const res = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify({
          mode: "upload",
          image: base64,
          filename: file.name,
          contentType: file.type,
          userId: window.currentUserId
        }),
        headers: { "Content-Type": "application/json" }
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
  };
  reader.readAsDataURL(file);
}

// ===== アップロード履歴読み込み =====
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

// ページ読み込み時に main() を実行
window.onload = main;
