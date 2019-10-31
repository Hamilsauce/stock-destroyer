let apiKey;
let symbol;
const hamKey = 'F1P4FC58217NPJEL;'

document.querySelector('#stock-form').addEventListener('submit', e => {
    let dataMessage = document.querySelector('#data-display-message');
    let dataDisplay = document.querySelector('#divContents');

    e.preventDefault();
    getAlphaVantagedata();
    dataDisplay.innerHTML = '';
    dataMessage.innerHTML = 'Waiting for data...'

});

//run  init function defined immediately below upon loading
init();

function init() {
    apiKey = localStorage.getItem('apiKey');
    // inpApiKey.value = apiKey ? apiKey : '';
    apiKey = hamKey;
}

/*
 Part 1: get data from storage, user; validate data and construct query string/url for http request
Part 2: Make the call
Part 3: make someting useful out of returned data, display it on screen
*/
function getAlphaVantagedata() {
    const func = setFunc();
    const size = selSize.value;
    const type = selType.value;
    const interval = selInterval.value;
    let returnSymbol = '';
    let records = [];
    let record = '';
    let htmlArray = [];
    symbol = inpSymbol.value;

    const demo = symbol === 'MSFT' && apiKey === 'demo' ? true : false;

    if (demo === true) {
        url =
            'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo';
    } else {

        url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&outputs=${size}&datatyp=${type}&apikey=${apiKey}`;
        console.log('url: ' + url);

    }

    request({ url: url })
        .then(data => {
            let stockData = JSON.parse(data);
            let html = "";
            let dataDisplay = document.querySelector('#divContents');
            let dataMessage = document.querySelector('#data-display-message');
            let propNames = Object.keys(stockData);



            records = Object.entries(stockData[propNames[1]]);

            records.forEach(stock => {
                let [entryName, entryDetails] = stock;
                let record = Object.entries(stock);
                // console.log('test', 'stock = ' + stock, 'entryName = ' + entryName, 'details = ' +
                //     entryDetails);

                let printData = rec => {
                    let recOut = [];
                    rec.forEach(recProp => {
                        let line = /*html*/`<li style="text-align: center;"><p>${recProp[0].slice(3)}:</p> ${recProp[1]}</li>`;
                        recOut.push(line);
                    });

                    return recOut.join('');
                };
                let recordHTML = /*html*/`
                    <div class="record">
                        <div class="entry-name-container">${entryName}</div>
                        <ul class="entry-details-list">${printData(Object.entries(entryDetails))}</ul>
                    </div>`;
                htmlArray.push(recordHTML);
            });
            // console.log('symbol = ' + Object.entries(stockData["Meta Data"]["2. Symbol"]));
            dataMessage.innerHTML = `Currently viewing results for ${symbol}.`;
            dataDisplay.innerHTML = htmlArray.join('');
        })
        .catch(error => {
            let dataMessage = document.querySelector('#data-display-message');
            dataMessage.innerHTML = 'Something went wrong! Try again n00b'

            console.log(error);
        });
}

let request = obj => {
    return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();
        xhr.open(obj.mthod || 'GET', obj.url, true);

        if (obj.headers) {
            Object.keys(obj.headers).forEach(key => {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(obj.body);
    });
}

const setFunc = () => {
    const funcInput = document.querySelector('#selFunction').value;
    let functionOut = '';

    if (funcInput == 'Daily') {
        functionOut = 'TIME_SERIES_DAILY';
    } else if (funcInput == 'Today') {
        functionOut = 'TIME_SERIES_INTRADAY';
    } else {
        console.log('Problem in function setFunc');
    }
    return functionOut;
}

function setInterval() {
    spnInterval.style.display = selFunction.value !== 'Today' ? 'none' : 'block';
}

function saveDataToFile() {
    const data = document.querySelector('#divContents');
    const blob = new Blob([data.innerHTML]);

    let a = document.body.appendChild(document.createElement('a'));

    a.href = window.url.createObjecturl(blob);
    a.download = symbol + '.txt';
    a.click();
    a = null;
}

function storeApiKey() {
    apiKey = inpApiKey.value;
    localStorage.setItem('apiKey', apiKey);
}

function getStorage() {
    apiKey = localStorage.getItem('apiKey');
}
