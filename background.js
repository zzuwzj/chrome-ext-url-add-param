let urlParam = { forceVersion: 'forceVersion=0.0.0', readonly: 'readOnly' };

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ urlParam });

  setupContextMenu();
});

function setupContextMenu() {
  chrome.storage.sync.get('urlParam', ({ urlParam }) => {
    // parse json string
    let urlParams = Object.entries(urlParam) || []; // [[k, v]]

    // For each url param we were provided
    for (let param of urlParams) {
      // create a div with that param
      const [k, v] = param;
      // const shortKey = k.length > 16 ? `${k.substr(0, 8)} ... ${k.substr(-8)}` : k;
      const shortVal = v.length > 40 ? `${v.substr(0, 20)} ... ${v.substr(-20)}` : v;

      chrome.contextMenus.create({
        title: `Open new tab with param: ${shortVal}`,
        id: v,
        contexts: ["page", "frame", "selection", "link", "image", "video", "audio"]
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener(function (itemData) {
  // link url first
  let url = new URL(itemData.linkUrl || itemData.pageUrl);
  let params = new URLSearchParams(url.search);
  const paramsArr = itemData.menuItemId.split('&').map((el) => el.split('='));
  (paramsArr || []).forEach(([k, v = '']) => params.append(k, v));

  // new url with urlParam
  const { origin, pathname } = url;

  chrome.tabs.create({
    active: true,
    url: `${origin}${pathname}?${params.toString()}`,
  });
});
