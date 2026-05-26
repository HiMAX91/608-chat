// 監聽後端推送通知命令 (在背景待命)
self.addEventListener('push', function(event) {
  // 預設的通知內容（萬一後端沒傳資料時的備用方案）
  let payload = { 
    title: '蒲公英聊天室', 
    body: '你收到了一則新訊息 🌼',
    avatar: '' 
  };
  
  // 如果後端有傳送 JSON 資料過來
  if (event.data) {
    try {
      const data = event.data.json();
      
      // 1. 設定通知標題為「發送人的名字」
      payload.title = data.name + ' 🌼';
      
      // 2. 智慧判斷訊息類型 (Type)，決定通知欄要顯示什麼字
      if (data.type === 'text') {
        // 如果是文字，直接顯示前幾字
        payload.body = data.text;
      } else if (data.type === 'image') {
        // 如果是圖片
        payload.body = '📷 傳送了一張圖片';
      } else if (data.type === 'file') {
        // 如果是檔案（如 PDF、Doc 等），顯示檔名
        payload.body = '📎 傳送了檔案：' + (data.fileName || '未命名檔案');
      } else if (data.type === 'system') {
        // 如果是系統訊息（例如某某人來了）
        payload.title = '蒲公英通知';
        payload.body = data.text;
      }
      
      // 如果同學有設定大頭貼，也可以試著傳過來當作通知小圖（選填）
      if (data.avatar && data.avatar.startsWith('data:')) {
        payload.avatar = data.avatar;
      }
    } catch (e) {
      // 萬一解析失敗，就用純文字顯示
      payload.body = event.data.text();
    }
  }

  // 通知視窗的精緻設定
  const options = {
    body: payload.body,
    icon: payload.avatar || 'favicon.png', // 如果有同學的頭貼就顯示頭貼，沒有就顯示蒲公英小花
    badge: 'favicon.png',                 // Android 頂部狀態列顯示的小花
    vibrate: [100, 50, 100],               // 收到時手機震動
    data: { url: self.location.origin },   // 點擊通知時要開啟的網址
    tag: 'dandelion-chat',                 // 相同的 tag 會自動覆蓋，手機通知列才不會亂成一團
    renotify: true                         // 新通知來時依舊震動/響鈴
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// 當同學點擊手機彈出的通知時
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // 關閉通知
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 如果聊天室視窗原本就開著，直接切換到該分頁，否則另開新視窗
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});