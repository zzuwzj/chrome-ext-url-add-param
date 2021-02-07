let urlParam = { forceVersion: 'forceVersion=0.0.0', readonly: 'readOnly' };

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ urlParam });
});
