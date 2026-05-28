// 監聽後端推送通知命令 (在背景待命)
self.addEventListener('push', function(event) {
  let payload = { 
    title: '蒲公英聊天室', 
    body: '你收到了一則新訊息 🌼',
    avatar: '' 
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      payload.title = data.name + ' 🌼';
      
      // 判斷是否為回覆訊息並加入精緻前綴
      let prefix = data.replyName ? '↩️ 回覆了 ' + data.replyName + '：' : '';
      
      if (data.type === 'text') {
        payload.body = prefix + data.text;
      } else if (data.type === 'image') {
        payload.body = prefix + '📷 傳送了一張圖片';
      } else if (data.type === 'file') {
        payload.body = prefix + '📎 傳送了檔案：' + (data.fileName || '未命名檔案');
      } else if (data.type === 'system') {
        payload.title = '蒲公英通知';
        payload.body = data.text;
      }
      
      if (data.avatar && data.avatar.startsWith('data:')) {
        payload.avatar = data.avatar;
      }
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.avatar || 'favicon.png', 
    badge: 'favicon.png',                 
    vibrate: [100, 50, 100],               
    data: { url: self.location.origin },   
    tag: 'dandelion-chat',                 
    renotify: true                         
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// 當同學點擊手機彈出的通知時
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); 
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
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