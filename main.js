let format, movieSelect, movie, count, duration;
let userSelect = [], allList = [];
let loadCount = 0;
let runButton = document.querySelector("#run");
let cloud = "https://d2wwh0934dzo2k.cloudfront.net/ghibli"; // "http://kjw4569.iptime.org:8080/ghibli";
let protocol = /\w+(?=:)/.exec(document.URL)[0];

fetch("list.json").then(response => response.json())
.then(json => {
    list = json;
    let movieList = document.querySelector("#movieList");
    let movieCheckbox = document.querySelectorAll("#movieCheckbox td");
    let sum = 0;

    for (let category in list) {
        let i;
        for (i=0; i<list[category].length; i++) {
            allList.push(list[category][i]);
            let name = list[category][i].name.slice(3);
    
            let option = document.createElement("option");
            option.value = sum+i;
            option.text = name;
            if (category == "long") {
                movieList.insertBefore(option, document.querySelector("option[value='game']"));
            }
            else if (category == "game") {
                movieList.insertBefore(option, document.querySelector("option[value='short']"));
            }
            else if (category == "short") {
                movieList.insertBefore(option, document.querySelector("option[value='etc']"));
            }
            else if (category == "etc") {
                movieList.appendChild(option);
            }

            let label = document.createElement("label");
            label.className = "color-white";
            let input = document.createElement("input");
            input.type = "checkbox";
            input.value = sum+i;
            input.addEventListener("change", event => {
                if (event.target.checked == true) {
                    userSelect.push(event.target.value);
                }
                else {
                    let idx = userSelect.indexOf(event.target.value);
                    if (idx > -1) userSelect.splice(idx, 1);
                }
            });
            label.appendChild(input);
            label.appendChild(document.createTextNode(name.slice(0,name.indexOf("("))));
            movieCheckbox[sum+i].appendChild(label);
        }
        sum += i;
    }
});

let result = document.querySelector("#result");
for (let i=0; i<36; i++) {
    let item = document.createElement("div");
    item.className = "item";
    let img = document.createElement("img");
    img.src = "";
    img.addEventListener("load", loadFinished);
    let title = document.createElement("p");
    title.className = "shadow-white bold";
    title.textContent = "";
    item.appendChild(img);
    item.appendChild(title);
    result.appendChild(item);
}

for (let radio of document.querySelectorAll("#formatSelect input")) {
    radio.addEventListener("change", event => {
        format = event.target.value;
        let movieSelect = document.querySelectorAll("#movieSelect label");
        let numSelect = document.querySelector("#numSelect");
        let numLabels = [...numSelect.querySelectorAll("label")];
        let numRadios = numLabels.map(label => label.querySelector("input"));
        let rulePC = getCSSRule("myCSS", "#run");
        let ruleMobile = getCSSRule("myCSS", "#run", "(max-width: 768px)");

        setDisplay(format == "jpg", "inline", ...numLabels.slice(4));
        setDisplay(format == "webp", "inline", ...numLabels.slice(0,4));
        setDisplay(format != "jpg", "block", document.querySelector("#durationSelect"));
        setDisplay(format == "slider", "block", document.querySelector("#sliderSelect"));
        setDisplay(format != "slider", "inline", movieSelect[1]);
        setDisplay(format != "slider", "block", numSelect, document.querySelector("#columnSelect"), runButton, result);
        if (format == "jpg") {
            numRadios.slice(4).find(radio => radio.checked).dispatchEvent(new InputEvent("change"));
            if (runButton.disabled) {
                toggleRunButton();
                rulePC.style["font-size"] = "3.5em";
                ruleMobile.style["font-size"] = "2.5em";
            }
        }
        else if (format == "webp") {
            numRadios.slice(0,4).find(radio => radio.checked).dispatchEvent(new InputEvent("change"));
            let test = "";
            fetch(`${protocol}://d2pty0y05env0k.cloudfront.net/`, {method:"POST"})
            .then(response => response.text()).then(response => {test = response;});
            setTimeout(() => {
                if (!test) {
                    runButton.disabled = true;
                    runButton.textContent = "오전 12:00 ~ 오전 08:00 서버중지";
                    rulePC.style["font-size"] = "3em";
                    ruleMobile.style["font-size"] = "2em";
                }
            }, 500);
        }
        else if (format == "slider") {
            movieSelect[0].click();
            let test = "";
            fetch(`${protocol}://d2pty0y05env0k.cloudfront.net/`, {method:"POST"})
            .then(response => response.text()).then(response => {test = response;});
            setTimeout(() => {
                if (!test) {
                    let webp = document.querySelector("#run_webp");
                    webp.disabled = true;
                    webp.textContent = "오전 12:00 ~ 오전 08:00 서버중지";
                }
            }, 500);
        }
    });
}

for (let radio of document.querySelectorAll("#movieSelect input[type='radio']")) {
    radio.addEventListener("change", event => {
        movieSelect = event.target.value;
        setDisplay(movieSelect == "list", "inline", document.querySelector("#movieList"));
        setDisplay(movieSelect == "checkbox", "inline", document.querySelector("#movieCheckbox"));
    });
}

document.querySelector("#movieList").addEventListener("change", event => {
    movie = event.target.value;
    if (!isNaN(movie)) {
        let range = document.querySelector("#sliderSelect input[type='range']");
        range.max = allList[movie].cut;
        range.value = "1";
        range.dispatchEvent(new InputEvent("change"));
        document.querySelector("button#forward").textContent = "▶";
        document.querySelector("button#backward").textContent = "◀";
        let webp = document.querySelector("#slider_webp img");
        webp.src = "";
        webp.removeAttribute("name");
    }
});

for (let radio of document.querySelectorAll("#numSelect input")) {
    radio.addEventListener("change", event => {
        count = parseInt(event.target.value);
    });
}

for (let radio of document.querySelectorAll("#durationSelect input")) {
    radio.addEventListener("change", event => {
        duration = parseInt(event.target.value);
    });
}

for (let radio of document.querySelectorAll("#columnSelect input")) {
    radio.addEventListener("change", event => {
        column = parseInt(event.target.value);
        let rule = getCSSRule("myCSS", ".item");
        if (column == 2) {
            rule.style["width"] = "48%";
        }
        else if (column == 3) {
            rule.style["width"] = "32%";
        }
    });
}

let sliderSelect = document.querySelector("#sliderSelect");
let sliderImage = sliderSelect.querySelector("img");
sliderImage.addEventListener("load", slideShow);
let slider = sliderSelect.querySelector("input[type='range']")
slider.addEventListener("change", event => {
    if (isNaN(movie)) {
        alert("작품 하나를 선택해주세요.");
    }
    else {
        let cut = event.target.value;
        sliderSelect.querySelector("#goto").value = parseInt(cut);
        sliderImage.src = `${cloud}/${allList[movie].name}/${cut.padStart(5,"0")}.jpg`;
    }
});
sliderSelect.querySelector("button#prev").addEventListener("click", () => {
    slider.stepDown();
    slider.dispatchEvent(new InputEvent("change"));
});
sliderSelect.querySelector("button#next").addEventListener("click", () => {
    slider.stepUp();
    slider.dispatchEvent(new InputEvent("change"));
});
sliderSelect.querySelector("#goto").addEventListener("input", event => {
    let cut = event.target.value;
    if (cut) {
        slider.value = Math.abs(parseInt(cut));
        slider.dispatchEvent(new InputEvent("change"));
    }
});
sliderSelect.querySelector("button#down_1000").addEventListener("click", () => {
    slider.stepDown(1000);
    slider.dispatchEvent(new InputEvent("change"));
});
sliderSelect.querySelector("button#up_1000").addEventListener("click", () => {
    slider.stepUp(1000);
    slider.dispatchEvent(new InputEvent("change"));
});

let forwardBtn = sliderSelect.querySelector("button#forward");
let backwardBtn = sliderSelect.querySelector("button#backward");
const frame = 24;
const interval = 1000;
forwardBtn.addEventListener("click", event => {
    let status = event.target.textContent;
    if (status == "▶") {
        if (backwardBtn.textContent == "II") backwardBtn.textContent = "◀";
        event.target.textContent = "II";
        slider.stepUp(frame);
        slider.dispatchEvent(new InputEvent("change"));
    }
    else if (status == "II") {
        event.target.textContent = "▶";
    }
});
backwardBtn.addEventListener("click", event => {
    let status = event.target.textContent;
    if (status == "◀") {
        if (forwardBtn.textContent == "II") forwardBtn.textContent = "▶";
        event.target.textContent = "II";
        slider.stepDown(frame);
        slider.dispatchEvent(new InputEvent("change"));
    }
    else if (status == "II") {
        event.target.textContent = "◀";
    }
});

let webp = document.querySelector("#slider_webp img");
webp.addEventListener("click", event => {
    let name = event.target.getAttribute("name");
    if (name) {
        saveAs(event.target.src, name);
    }
});

let rub_webp = document.querySelector("#run_webp");
rub_webp.addEventListener("click", () => {
    if (isNaN(movie)) {
        alert("작품 하나를 선택해주세요.");
    }
    else {
        run_webp.textContent = "로딩...";
        run_webp.disabled = true;
        cut = parseInt(slider.value);
        let lastCut = cut + duration - 1;
        let max = parseInt(slider.max);
        if (lastCut > max) {
            lastCut = max;
        }
        let title = allList[movie];
        let titleName = title.name.slice(3,title.name.indexOf("(")).trim()
        fetch(`${protocol}://d2pty0y05env0k.cloudfront.net/webp`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: urlEncode({
                time: Date.now(),
                num: 0,
                title: title.name,
                cut: cut,
                duration: lastCut - cut + 1
            })
        })
        .then(response => response.blob())
        .then(blob => {
            run_webp.textContent = "움짤";
            run_webp.disabled = false;
            webp.src = URL.createObjectURL(blob);
            webp.setAttribute("name", `${titleName}_${cut.toString().padStart(5,"0")}-${lastCut.toString().padStart(5,"0")}.webp`);
        });
    }
});

runButton.addEventListener("click", () => {
    toggleRunButton();
    let items = result.querySelectorAll(".item");
    clear(items, count);
    clearEvents(items);
    
    let time = Date.now();
    for (let i=0; i<count; i++) {
        let image = items[i].querySelector("img");
        let p = items[i].querySelector("p");
        let title = getRandomMovie();
        let titleName = title.name.slice(3,title.name.indexOf("(")).trim()
        let cut;

        if (format == "jpg") {
            cut = getRandomInt(1, title.cut+1).toString().padStart(5,"0");
            image.src = `${cloud}/${title.name}/${cut}.jpg`;
        }
        else if (format == "webp") {
            cut = getRandomInt(1, title.cut+1-duration);
            let lastCut = cut + duration - 1;
            fetch(`${protocol}://d2pty0y05env0k.cloudfront.net/webp`, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: urlEncode({
                    time: time,
                    num: i+1,
                    title: title.name,
                    cut: cut,
                    duration: duration
                })
            })
            .then(response => response.blob())
            .then(blob => {
                console.log(blob);
                image.src = URL.createObjectURL(blob);
                if (!image.hasAttribute("name")) {
                    image.addEventListener("click", event => {
                        let name = event.target.getAttribute("name");
                        if (name) {
                            saveAs(event.target.src, name);
                        }
                    });
                }
                image.setAttribute("name", `${titleName}_${cut.toString().padStart(5,"0")}-${lastCut.toString().padStart(5,"0")}.webp`);
            });
        }
        
        if ((movieSelect=="list" && (movie=="ghibli"||(isNaN(movie) && list[movie].length>1))) ||
            (movieSelect=="checkbox" && userSelect.length!=1)) {
            p.textContent = titleName;
        }
        else {
            p.textContent = "";
        }
    }
});

document.querySelectorAll("#numSelect input")[0].click();
document.querySelectorAll("#numSelect input")[4].click();
document.querySelector("#formatSelect input").click();
document.querySelector("#movieSelect input").click();
document.querySelector("#movieList").value = "long";
document.querySelector("#movieList").dispatchEvent(new InputEvent("change"));
document.querySelector("#durationSelect input").click();

function setDisplay(condition, display, ...element) {
    for (let elem of element) {
        if (condition) {
            elem.style.display = display;
        }
        else {
            elem.style.display = "none";
        }
    }
}

function getRandomMovie() {
    if (movieSelect == "list") {
        if (movie == "ghibli") {
            rand = getRandomInt(0, allList.length-1);
            title = allList[rand];
        }
        else if (!isNaN(movie)) {
            title = allList[parseInt(movie)];
        }
        else {
            rand = getRandomInt(0, list[movie].length);
            title = list[movie][rand];
        }
    }
    else if (movieSelect == "checkbox") {
        if (userSelect.length > 0) {
            rand = userSelect[getRandomInt(0, userSelect.length)];
        }
        else {
            rand = getRandomInt(0, allList.length);
        }
        title = allList[rand];
    }
    return title;
}

function loadFinished() {
    loadCount++;
    if (loadCount == count) {
        loadCount = 0;
        toggleRunButton();
    }
}

function slideShow() {
    if (forwardBtn.textContent == "II") {
        setTimeout(() => {
            slider.stepUp(frame);
            slider.dispatchEvent(new InputEvent("change"));
        }, interval);
    }
    else if (backwardBtn.textContent == "II") {
        setTimeout(() => {
            slider.stepDown(frame);
            slider.dispatchEvent(new InputEvent("change"));
        }, interval);
    }
}

function urlEncode(obj) {
    return Object.entries(obj).map(([key,val]) => `${key}=${encodeURIComponent(val)}`).join("&");
}

function toggleRunButton() {
    if (runButton.disabled) {
        runButton.disabled = false;
        runButton.textContent = "뽑기";
    }
    else {
        runButton.disabled = true;
        runButton.textContent = "로딩...";
    }
}

function clear(items, start) {
    for (let i=start; i<items.length; i++) {
        items[i].querySelector("img").src = "";
        items[i].querySelector("p").textContent = "";
    }
}

function clearEvents(items) {
    for (let i=0; i<4; i++) {
        let img = items[i].querySelector("img");
        if (img.hasAttribute("name")) {
            img.setAttribute("name", "");
        }
    }
}

function getRandomInt(minInclude, maxExclude) {
    return Math.floor(Math.random() * (maxExclude - minInclude)) + minInclude;
}

function getCSSRule(id, query, condition) {
    let sheet = [...document.styleSheets].find(sheet => sheet.title == id || sheet.href == id);
    let rules = [...sheet.cssRules];
    if (condition) {
        rules = [...rules.find(rule => rule.conditionText == condition).cssRules];
    }
    return rules.find(rule => rule.selectorText == query);
}

function saveAs(uri, filename) {
    let link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); // Firefox requires the link to be in the body
        link.download = filename;
        link.href = uri;
        link.click();
        document.body.removeChild(link); // remove the link when done
    } else {
        location.replace(uri);
    }
}
