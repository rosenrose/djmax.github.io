dlcSelect = new Set();
btnSelect = new Set();
levelLimit = 0;
const count = 10;
colorMapping = {"리스펙트": "color_respect.png",
                "포터블 1": "color_portable1.png",
                "포터블 2": "color_portable2.png",
                "트릴로지": "color_trilogy.png",
                "클래지콰이": "color_clazziquai.png",
                "블랙 스퀘어": "color_blacksquare.png",
                "V 익스텐션": "color_vextension.png",
                "이모셔널 센스": "color_emotionalsense.png",
                "테크니카 1": "color_technika1.png",
                "테크니카 2": "color_technika2.png",
                "테크니카 3": "color_technika3.png",
                "콜라보": "color_collaboration.png"};
collaboration = ["길티기어", "소녀전선", "그루브 코스터", "디모", "사이터스"];

fetch("list.json").then(response => response.json())
.then(json => {
    list = json;
    document.querySelector("#run").textContent = "뽑기";
    document.querySelector("#run").disabled = false;
    
    let dlcCheck = document.querySelectorAll("#dlcCheckbox td")
    for (let i=0; i<dlcCheck.length; i++) {
        let dlc = Object.keys(list)[i];
        let label = document.createElement("label");
        label.className = "shadow-white";
        label.id = dlc.replace(" ","_");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.value = dlc;
        input.addEventListener("change", event => {
            if (event.target.checked == true) {
                dlcSelect.add(event.target.value);
            }
            else {
                dlcSelect.delete(event.target.value);
            }
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(dlc));
        dlcCheck[i].appendChild(label);
        label.click();
    }
    document.querySelectorAll("#modeSelect input")[0].click();
});

let ol = document.querySelector("#randomResult");
for (let i=0; i<count; i++) {
    let li = document.createElement("li");
    li.className = "left";
    let img = document.createElement("img");
    img.className = "song_pic";
    let title = document.createElement("p");
    title.className = "title";
    let artist = document.createElement("p");
    artist.className = "artist";
    li.appendChild(img);
    li.appendChild(title);
    li.appendChild(artist);
    ol.appendChild(li);
}

for (let radio of document.querySelectorAll("#modeSelect input")) {
    radio.addEventListener("change", event => {
        mode = event.target.value;
        setDisplay(mode == "PC" || mode == "PS4", "block", document.querySelector("#dlcSelect"), document.querySelector("#levelSelect"), document.querySelector("#pick"), document.querySelector("#randomResult"));
        setDisplay(mode == "PS4", "inline", document.querySelector("#소녀전선"));
        let ul = document.querySelector("#artistResult");
        setDisplay(mode == "artist", "block", ul);
        setDisplay(mode == "artist", "inline", ...document.querySelectorAll("#result > button"));
        // let tag = document.querySelector("#tag");
        // setDisplay(mode == "tag", "block", tag);
        
        if (mode == "PC") {
            dlcSelect.delete("소녀전선");
        }
        else if (mode == "PS4") {
            if (document.querySelector("#소녀전선 input").checked) {
                dlcSelect.add("소녀전선");
            }
        }
        else if (mode == "artist" && !ul.querySelector("li")) {
            let songs = Object.values(list).reduce((a,b) => [...a, ...b]);
            let artists = [...new Set(songs.map(song => song["artist"]))].sort();

            for (let artist of artists) {
                let li = document.createElement("li");
                li.className = "left";
                li.textContent = artist;
                let span = document.createElement("span");
                span.textContent = "▼";
                li.appendChild(span);
                li.addEventListener("click", event => {
                    let text = event.target.querySelector("span").textContent;
                    if (text == "▼") {
                        event.target.querySelector("ul").style.display = "block";
                        event.target.querySelector("span").textContent = "▲";
                    }
                    else if (text == "▲") {
                        event.target.querySelector("ul").style.display = "none";
                        event.target.querySelector("span").textContent = "▼";
                    }
                });
                ul.appendChild(li);

                let titles = songs.filter(song => song["artist"] == artist).map(song => song["title"]).sort();
                let second_ul = document.createElement("ul");
                second_ul.style.display = "none";
                li.appendChild(second_ul);
                for (let title of titles) {
                    let second_li = document.createElement("li");
                    second_li.textContent = title;
                    second_ul.appendChild(second_li);
                }
            }
        }
        else if (mode == "tag" && !document.querySelector("#tag span")) {
            tags = Object.values(list).reduce((a,b) => [...a, ...b]).map(song => song["genre"]).filter(song => song!=null);
            tags = [...new Set(tags.reduce((a,b) => a+" "+b).split(" "))].sort();
        }
    });
}

let levelCheck = document.querySelector("#levelCheck");
levelCheck.addEventListener("change", event => {
    setDisplay(event.target.checked, "block", ...document.querySelectorAll("#levelSelect div"))
});

for (let check of document.querySelectorAll("#buttonSelect input")) {
    check.addEventListener("change", event => {
        if (event.target.checked == true) {
            btnSelect.add(event.target.value);
        }
        else {
            btnSelect.delete(event.target.value);
        }
    });
    check.click();
}

document.querySelector("#levelInput").addEventListener("change", event => {
    levelLimit = parseInt(event.target.value);
});

document.querySelector("#levelCondition").addEventListener("change", event => {
    levelCondition = event.target.value;
});
document.querySelector("#levelCondition").value = "gtr";
document.querySelector("#levelCondition").dispatchEvent(new InputEvent("change"));

document.querySelector("#run").addEventListener("click", () => {
    let result = [];
    for (let dlc of dlcSelect) {
        result = [...result, ...JSON.parse(JSON.stringify(list[dlc])).map(song => {
            if(!song.hasOwnProperty("game")) song["game"] = dlc;
            return song;})];
    }
    result = result.filter(song => song.hasOwnProperty("exclusive")? song["exclusive"] == mode : true);
    
    if (levelCheck.checked) {
        for (let i=0; i<result.length;) {
            let levels = getLevels(result[i]["level"]);

            if (levelCondition == "gtr") {
                if (Math.max(...levels) < levelLimit) {
                    result.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            else if (levelCondition == "lss") {
                if (Math.max(...levels) > levelLimit) {
                    result.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            else if (levelCondition == "equal") {
                if (!levels.includes(levelLimit)) {
                    result.splice(i, 1);
                }
                else {
                    result[i]["equal"] = getExactLevel(result[i]["level"], levelLimit);
                    i++;
                }
            }
        }
    }
    console.log(result);

    let rands = new Set();
    let min = Math.min(count, result.length);
    while (rands.size < min) {
        rands.add(getRandomInt(0, result.length));
    }

    resultList = [...rands].map(rand => result[rand]);
    if (resultList.length == 0) {
        alert("결과가 없습니다.");
    }
    let li = document.querySelectorAll("#result li");
    for (let i=0; i<count; i++) {
        li[i].querySelector("img").src = "";
        let p = li[i].querySelectorAll("p");
        p[0].textContent = "";
        p[1].textContent = "";
        p[0].style.color = "";
        p[1].style.color = "";
        li[i].style.backgroundImage = "";
    }
    for (let i=0; i<min; i++) {
        let game = resultList[i]["game"];
        let img = li[i].querySelector("img");

        let src = resultList[i]["title"].replace("/","／").replace(":","：").replace("?","？");
        if (resultList[i]["title"] == "Urban Night") {
            src = `${src} (${resultList[i]["artist"]})`;
        }
        if (game != "소녀전선") {
            img.src = `song_pic/${src}_${getRandomInt(1,4)}.png`;
        }
        
        let p = li[i].querySelectorAll("p");
        p[0].textContent = resultList[i]["title"];
        if (resultList[i].hasOwnProperty("equal")) {
            p[0].textContent += ` (${resultList[i]["equal"]})`
        }
        p[1].textContent = resultList[i]["artist"];
        
        if (game != "클래지콰이") {
            p[0].style.color = "#fff";
            p[1].style.color = "#fff";
        }
        if (collaboration.includes(game)) {
            li[i].style.backgroundImage = `url(${colorMapping["콜라보"]})`;
        }
        else {
            li[i].style.backgroundImage = `url(${colorMapping[game]})`;
        }
    }
});

document.querySelector("#spread").addEventListener("click", () => {
    document.querySelectorAll("#artistResult > li").forEach(li => {
        if (li.querySelector("span").textContent == "▼") {
            li.dispatchEvent(new MouseEvent("click"));
        }
    });
});
document.querySelector("#collpase").addEventListener("click", () => {
    document.querySelectorAll("#artistResult > li").forEach(li => {
        if (li.querySelector("span").textContent == "▲") {
            li.dispatchEvent(new MouseEvent("click"));
        }
    });
});

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

function getLevels(level) {
    let result = [];
    for (let btn of btnSelect) {
        for (let rank in level[btn]) {
            if (mode == "PS4" && rank == "SC") {
                continue;
            }
            result.push(level[btn][rank]);
        }
    }
    return result;
}

function getExactLevel(level, num) {
    let result = [];
    for (let btn of btnSelect) {
        for (let rank in level[btn]) {
            if (mode == "PS4" && rank == "SC") {
                continue;
            }
            if (level[btn][rank] == num) {
                result.push(btn+" "+rank);
            }
        }
    }
    return result.join(", ");
}

function getRandomInt(minInclude, maxExclude) {
    return Math.floor(Math.random() * (maxExclude - minInclude)) + minInclude;
}