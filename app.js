const liffId = "2008124621-9gEeG5K6";
const gasUrl = "https://script.google.com/macros/s/AKfycbxvdxY9grpBZgYGnNUaeDysfm-IRv0X6Tw2-WUzQN0qhthjV8X6kZ7_GfALl-aWJWvKLw/exec";

async function main() {
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    document.getElementById("loginBtn").onclick = () => liff.login();
  } else {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    const profile = await liff.getProfile();
    document.getElementById("profile").innerHTML = `こんにちは、${profile.displayName} さん！`;
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

  const base64 = await toBase64(file);

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      body: JSON.stringify({
        mode: "upload",
        userId: window.currentUserId,
        filename: file.name,
        image: base64.split(",")[1],
        contentType: file.type
      }),
      headers: { "Content-Type": "application/json" }
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("✅ アップロード成功！");
      loadHistory();
    } else {
      alert("⚠ エラー: " + result.message);
    }
  } catch (err) {
    alert("通信エラー: " + err.message);
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
