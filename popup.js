// Initialize button with user's preferred url param
const addParamList = document.getElementById('addParamList');
const PARAM_BTN_CLASS = 'param-item-btn';
const ATTR_PARAM_BTN = 'isParamBtn';
const ATTR_URL_PARAM = 'urlParam';

// When the button is clicked, inject open new page with param into current page
addParamList.addEventListener('click', async (evt) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const isParamBtnClicked = evt.target.hasAttribute(ATTR_PARAM_BTN);
  if (isParamBtnClicked) {
    const urlParam = evt.target.getAttribute(ATTR_URL_PARAM);
    chrome.storage.sync.set({
      urlParamToAdd: urlParam,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: goToPageWithParam,
    });
  }
});

// The body of this function will be executed as a content script inside the
// current page
function goToPageWithParam() {
  chrome.storage.sync.get('urlParamToAdd', ({ urlParamToAdd }) => {
    let url = new URL(location.href);
    let params = new URLSearchParams(url.search);
    const paramsArr = urlParamToAdd.split('&').map((el) => el.split('='));
    (paramsArr || []).forEach(([k, v = '']) => params.append(k, v));

    // new url with urlParam
    const { origin, pathname } = location;
    const newUrlWithParam = `${origin}${pathname}?${params.toString()}`;
    window.open(newUrlWithParam);
  });
}

// Add all specified url params to the page
function constructParamOptions() {
  chrome.storage.sync.get('urlParam', ({ urlParam }) => {
    addParamList.innerHTML = '';
    let urlParams = Object.entries(urlParam) || []; // [[k, v]]

    // For each url param we were provided
    for (let param of urlParams) {
      // create a div with that param
      const [k, v] = param;

      let paramBtn = document.createElement('input');
      paramBtn.type = 'button';
      paramBtn.setAttribute(ATTR_PARAM_BTN, true);
      paramBtn.setAttribute(ATTR_URL_PARAM, v);
      paramBtn.setAttribute("title", v);

      const shortVal = v.length > 30 ? `${v.substr(0, 15)} ... ${v.substr(-15)}` : v;

      const paramStr = `${shortVal}`;
      paramBtn.value = paramStr;
      addParamList.appendChild(paramBtn);
    }
  });
}

// Initialize the page by constructing the url param options
constructParamOptions();
