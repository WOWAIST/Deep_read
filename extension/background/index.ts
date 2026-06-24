// 개발자 B 담당
// Side Panel 열기, content script와 메시지 교환
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId! });
});
