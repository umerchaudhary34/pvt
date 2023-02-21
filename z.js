// Initialize variables
var testTimes = [];
var responseTimes = [];
var testDuration = 10; // 10 minutes
var minResponseTime = 100; // false start threshold in msec
var maxResponseTime = 1500; // threshold in msec to move on to next target
var minDelay = 1; // minimum delay of 1 sec before target appears
var maxDelay = 10; // maximum delay in sec before target appears
var numFalseStarts = 0;
var numResponses = 0;
var avgResponseTime = 0;
var userId = localStorage.getItem("userId") || 0;
var id = userId;
var timerOn = false;
const API_BASE_URL = window.location.origin;

// const API_BASE_URL = "http://localhost:3000";

// Start and stop times for each response measurement
var startT, stopT;

// Start and stop times from the beginning for a complete test
var testStart, testStop;

// Running time count
var count = 0;

// Clear local storage after 2 minutes
setTimeout(function () {
    localStorage.clear();
}, 120000);

// Functions
function printDebug(str) {
    document.title = str;
}

// Preload test times - not currently used
function preloadTestTimes() {
    var elapsed = 0;
    var testTime = testDuration * 60 * 1000; //total test time in ms
    while (elapsed < testTime) {
        var timeDelay = parseInt(minDelay + Math.random() * maxDelay) * 1000;
        testTimes.push(timeDelay);
        elapsed += timeDelay;
    }
}

function handleMouseDown(evt) {
    if (!startT) {
        return;
    }
    stopT = new Date().getTime();
    let rTime = stopT - startT;
    startT = 0;
    if (rTime < 100) {
        numFalseStarts++;
    } else {
        responseTimes.push(rTime);
    }
    document.getElementById("responseOut").innerHTML = `<h2>${rTime} msec</h2>`;
    resetDisplayTimer();
}

function handleValue() {
    userId = document.getElementById("userId").value;
    localStorage.setItem("userId", userId);
}

function resetDisplayTimer() {
    clearTimeout(t);
    count = 0;
    timerOn = 0;
    document.getElementById("numeric").innerHTML = "";
    let currentT = new Date().getTime();
    if (currentT - testStart >= testDuration * 60000) {
        stopPVT();
        return;
    }
    startPVT();
}

function handleMouseMove(evt) {
    document.getElementById("box").style.cursor = "crosshair";
}

function init() {
    document.getElementById("box").onmousedown = handleMouseDown;
    document.getElementById("box").onmousemove = handleMouseMove;
}

function startEntireTest() {
    if (!id) {
        window.location.href = "error.html";
    }
    document.getElementById("buttons").innerHTML =
        '<input type= "button" id="stop" value="Stop" onclick="" />';
    testStart = new Date().getTime();
    responseTimes = [];
    startPVT();
}

function startPVT() {
    var timeDelay = parseInt(minDelay + Math.random() * maxDelay) * 1000;
    count = 0;
    timerOn = 1;
    t1 = setTimeout(displayTimer, timeDelay);
}

const handleDownload = async () => {
    avgResponseTime = parseInt(responseTimes.avg());
    numResponses = responseTimes.length;
    let data = {
        "User ID": id,
        "Test Duration": duration,
        "Number of false starts": numFalseStarts,
        "Average response time": avgResponseTime,
        Attempts: numResponses,
        Hits: responseTimes
    };

    // Create the CSV string
    let csvString = "";
    for (let key in data) {
        if (Array.isArray(data[key])) {
            csvString += `"${key}","${data[key].join(", ")}"\n`;
        } else {
            csvString += `"${key}","${data[key]}"\n`;
        }
    }

    // Create the form data object
    const formData = new FormData();
    formData.append(
        "file",
        new Blob([csvString], { type: "text/csv" }),
        "data.csv"
    );
    let url;
    let err;
    try {
        const response = await fetch(`${API_BASE_URL}/upload/csv`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        url = responseData.url;
    } catch (error) {
        err = error;
        console.error("There was a problem with the fetch operation:", error);
    }

    var str = !err
        ? "<h2>Thank you for your participation </h2> " +
          `<h4> <a href=${url} >Download</a> </h4> `
        : err;
    if (numResponses == 0) {
        str = "<p>Test aborted. Refresh or reload this page to try again.</p>";
    }
    document.getElementById("responseOut").innerHTML = str;
    window.location.href = "#responseOut";
};

// called when user wishes to terminate entire test or when preset duration is reached.
function stopPVT() {
    document.getElementById("buttons").innerHTML = "";
    clearTimeout(t);
    count = 0;
    timerOn = 0;
    document.getElementById("numeric").innerHTML = "";
    testStop = new Date().getTime();
    duration = parseInt((testStop - testStart) / 1000);
    numResponses = responseTimes.length;
    avgResponseTime = parseInt(responseTimes.avg());
    handleDownload();
}

//displays running timer in box
function displayTimer() {
    if (!timerOn) {
        return;
    }
    document.getElementById("numeric").innerHTML = "<h1>" + count + "</h1>";
    if (count == 0) {
        startT = new Date().getTime();
    }
    count += 10;
    if (count > maxResponseTime) {
        responseTimes.push(1500);
        resetDisplayTimer();
        return;
    }
    t = setTimeout("displayTimer()", 10);
}
//calculates average of numeric values in array
Array.prototype.avg = function () {
    var av = 0;
    var cnt = 0;
    var len = this.length;
    for (var i = 0; i < len; i++) {
        var e = +this[i];
        if (!e && this[i] !== 0 && this[i] !== "0") e--;
        if (this[i] == e) {
            av += e;
            cnt++;
        }
    }
    return av / cnt;
};
//]]>
