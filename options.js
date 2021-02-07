// Initialize button with user's preferred url param
// e.g.:
// const urlParam = {
//   forceVersionReadOnly: forceVersion=0.0.0'&readonly=true,
//   param1Param2Param3: param1='abc'&param2=true&param3=99
// }

const ATTR_PARAM_BTN_DEL = 'btnDeleteUrlParam';
const ATTR_URL_PARAM_NAME = 'urlParamName';

let addParam = document.getElementById('addParam');
let resetParam = document.getElementById('resetParam');
let paramsValue = document.getElementById('paramsValue');
let paramsList = document.getElementById('paramsList');

addParam.addEventListener('click', handleAddParamClick);
resetParam.addEventListener('click', handleResetClick);
paramsList.addEventListener('click', handleDeleteParamClick);

function camelCase(strArr) {
  return strArr.map((el, idx) => {
    if (idx > 0) {
      return `${el.charAt(0).toUpperCase()}${el.substring(1)}`;
    }
    return el;
  });
}
function getParamKey(paramKeys) {
  return camelCase((paramKeys || []).sort()).join('');
}

// add param
function handleAddParamClick() {
  chrome.storage.sync.get('urlParam', ({ urlParam }) => {
    const pValue = paramsValue.value;
    const paramKeys = pValue.split('&').map((el) => el.split('=')[0]);
    const pKey = getParamKey(paramKeys);
    if (!pKey || !pValue) return;

    chrome.contextMenus.create({
      title: pValue,
      id: pKey,
      contexts: ['page', 'frame', 'selection', 'link', 'image', 'video', 'audio'],
    });

    chrome.storage.sync.set({
      urlParam: {
        ...urlParam,
        [pKey]: pValue,
      },
    });
    constructParamOptions();
  });
}

// delete url param
function handleDeleteParamClick(evt) {
  const isDeleteBtnClicked = evt.target.hasAttribute(ATTR_PARAM_BTN_DEL);

  if (isDeleteBtnClicked) {
    const urlParamName = evt.target.getAttribute(ATTR_URL_PARAM_NAME);

    chrome.contextMenus.remove(urlParamName);

    chrome.storage.sync.get('urlParam', ({ urlParam }) => {
      delete urlParam[urlParamName];
      chrome.storage.sync.set({
        urlParam,
      });
      constructParamOptions();
    });
  }
}

// delete all url params
function handleResetClick() {
  chrome.storage.sync.set({
    urlParam: {},
  });

  chrome.contextMenus.removeAll();
  constructParamOptions();
}

// Add all specified url params to the page
function constructParamOptions() {
  chrome.storage.sync.get('urlParam', ({ urlParam }) => {
    paramsList.innerHTML = '';
    // parse json string
    let urlParams = Object.entries(urlParam) || []; // [[k, v]]

    // For each url param we were provided
    for (let param of urlParams) {
      // create a div with that param
      let paramDiv = document.createElement('div');
      paramDiv.classList.add('param-item');
      const [k, v] = param;
      const shortKey = k.length > 16 ? `${k.substr(0, 8)} ... ${k.substr(-8)}` : k;
      const shortVal = v.length > 40 ? `${v.substr(0, 20)} ... ${v.substr(-20)}` : v;
      const paramStr = `<span><span class="url-param-item-label" title="${k}">${shortKey}:</span><span class="url-param-item-value" title="${v}">${shortVal}</span></span>`;
      const delBtn = `<span class="url-param-del-btn" ${ATTR_PARAM_BTN_DEL}="true" ${ATTR_URL_PARAM_NAME}="${k}">Delete</span>`;
      paramDiv.innerHTML = `${paramStr}${delBtn}`;

      paramsList.appendChild(paramDiv);
    }
  });
}

// Initialize the page by constructing the url param options
constructParamOptions();
