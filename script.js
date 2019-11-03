let apiKey;
let symbol;
const hamKey = 'F1P4FC58217NPJEL;'
let records = [];

document.querySelector('#stock-form').addEventListener('submit', e => {
    e.preventDefault();
    let dataMessage = document.querySelector('#data-display-message');
    let dataDisplay = document.querySelector('#divContents');

    getAlphaVantagedata();
    dataDisplay.innerHTML = '';
    dataMessage.innerHTML = 'Waiting for data...'
});

document.querySelector('#find-button').addEventListener('click', e => {
    const dateInput = document.querySelector('#date-input').value;
    findDate(dateInput);
});

//run in it function defined immediately below upon loading
init();

function init() {
    apiKey = localStorage.getItem('apiKey');
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
    //  let records = [];
    let record = '';
    let htmlArray = [];
    symbol = inpSymbol.value;
    const url =
        `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&outputs=${size}&datatyp=${type}&apikey=${apiKey}`;

    request({
        url: url
    })
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
                let entryDate = new Date(entryName).toDateString();

                let printData = rec => {
                    let recOut = [];
                    rec.forEach(recProp => {
                        let line = /*html*/ `<li style="text-align: center;">
                            <p>${recProp[0].slice(3)}:</p> ${recProp[1]}
                        </li>`;
                        recOut.push(line);
                    });

                    return recOut.join('');
                };
                let recordHTML = /*html*/ `
                        <div class="record">
                            <div class="entry-name-container">${entryDate}</div>
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
    const blob = new Blob([records]);
    let a = document.body.appendChild(document.createElement('a'));

    a.href = window.URL.createObjectURL(blob);
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

const findDate = dateStr => {
    let targetDate = new Date(dateStr).toDateString();
    let currDate;
    let dateResult = {};

    let dateCompare = records.some(rec => {
        currDate = new Date(rec[0]).toDateString();
        if (targetDate == currDate) {
            dateResult = rec[1];
        }
        return targetDate == currDate;
    });
    console.log(dateCompare);
    writeFoundData(currDate, dateCompare, dateResult);
}

const writeFoundData = (date, dateFound, results) => {
    const contentDisplay = document.querySelector('#search-results');
    const dataMessage = document.querySelector('#data-display-message');
    let message = '';
    let dateArray = Object.entries(results);
    let htmlOutput = [];

    if (dateFound == false) {
        message = `No results found for ${symbol} on ${date}. Fail!`;
        dataMessage.innerHTML = message;
        htmlOutput = 'Nope';
        return;
    } else {
        message = `Showing results for ${symbol} on ${date}.`;
        dateArray.forEach(el => {
            let [dataKey, dataValue] = el;
            let pairString = `<li class="data-point">
                            <p style="font-weight: bold;">${dataKey.slice(3)}</p>
                            <p>${dataValue}</p>
                        </li>`;

            htmlOutput.push(pairString);
        });
        dataMessage.innerHTML = message;
        contentDisplay.innerHTML = `<ul class="date-result-list">${htmlOutput.join('')}</ul>`;
    }
}