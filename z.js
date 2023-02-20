//<![CDATA[
var testTimes = new Array(); //stores test times
var responseTimes = new Array(); //stores response times
var testDuration = 10; //default test time is 10 minutes
var minREsponseTime = 100; //threshold in msec for determining a false start
var maxResponseTime = 1500; //threshold in msec for moving on to next target
var minDelay = 1; //minimum delay of 1 sec before target appears
var maxDelay = 10; //maximum delay in sec before target appears
var t, t1;
var startT, stopT; //start and stop times for each repsonse measurement
var testStart, testStop; //start and stop times from the beginning for a complete test
var count = 0; //running time count
var timerOn = 0; //flag to indicate status of running timer
var numFalseStarts = 0;
var userId = 0;
var duration = 0;
var csv;
var numResponses = 0;
var avgResponseTime = 0;
var id = localStorage.getItem("userId") || 0;

function printDebug(str) {
    document.title = str;
}

setTimeout(function () {
    localStorage.clear();
}, 120000);
//not used currently;  to be used in future implementation
function preloadTestTimes() {
    var elapsed = 0;
    var testTime = testDuration * 60 * 1000; //total test time in ms
    while (elapsed < testTime) {
        var timeDelay = parseInt(minDelay + Math.random() * maxDelay) * 1000;
        testTimes.push(timeDelay);
        elapsed += timeDelay;
    }
}
//process event when user clicks on box
function handleMouseDown(evt) {
    if (!startT) {
        return;
    }
    stopT = new Date().getTime();
    var rTime = stopT - startT;
    startT = 0;
    if (rTime < 100) {
        numFalseStarts++;
    } else {
        responseTimes.push(rTime); //store this response time
    }
    document.getElementById("responseOut").innerHTML =
        "<h2>" + rTime + " msec</h2>";
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
    var currentT = new Date().getTime();
    if (currentT - testStart >= testDuration * 60000) {
        //test is finished
        stopPVT();
        return;
    }
    startPVT();
}
//change cursor style on
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
    responseTimes = new Array();
    startPVT();
}
function startPVT() {
    var timeDelay = parseInt(minDelay + Math.random() * maxDelay) * 1000;
    count = 0;
    timerOn = 1;
    t1 = setTimeout("displayTimer()", timeDelay);
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
    await fetch("http://localhost:3000/upload/csv", {
        method: "POST",
        body: formData
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            url = data.url;
        })
        .catch((error) => {
            err = error;
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        });

    var str = !err
        ? "<h2>Thank you for your participation </h2> " +
          `<h4> <a href=${url} >Download Link </a> </h4> `
        : err;
    if (numResponses == 0) {
        str = "<p>Test aborted. Refresh or reload this page to try again.</p>";
    }
    document.getElementById("responseOut").innerHTML = str;

    window.location.href = "#responseOut";
};

//called when user wishes to terminate entire test or when preset duration is reached.
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
