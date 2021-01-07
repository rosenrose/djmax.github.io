dlcSelect = new Set();
btnSelect = new Set();
rankSelect = new Set();
levelLimit = 0;
levelLimit2 = 0;
count = 10;
const maxCount = 10;
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
collaboration = ["길티기어", "소녀전선", "그루브 코스터", "디모", "사이터스","츄니즘"];

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

    songs = Object.values(list).reduce((a,b) => [...a, ...b]);
    let artists = [...new Set(songs.map(song => song["artist"]))];
    artists = artists.sort(sortCaseInsensitive);
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
        document.querySelector("#artistResult").appendChild(li);

        let titles = songs.filter(song => song["artist"] == artist).map(song => song["title"]);
        titles = titles.sort(sortCaseInsensitive);
        let second_ul = document.createElement("ul");
        second_ul.style.display = "none";
        li.appendChild(second_ul);
        for (let title of titles) {
            let second_li = document.createElement("li");
            second_li.textContent = title;
            second_ul.appendChild(second_li);
        }
    }

    tags = songs.map(song => song["genre"]).filter(song => song!=null);
    tags = [...new Set(tags.join(" ").split(" "))].sort();
    let tagDiv = document.querySelector("#tag");
    for (let tag of tags) {
        let cloud = document.createElement("div");
        cloud.className = "cloud";
        cloud.textContent = tag;
        cloud.addEventListener("click", event => {
            let result = songs.filter(song => song["genre"]!=null && song["genre"].includes(event.target.textContent));
            result = result.sort((a,b) => sortCaseInsensitive(a["title"], b["title"]));
            let list = document.querySelector("#tagResult");
            for (let song of result) {
                let li = document.createElement("li");
                li.textContent = `${song["title"]} (${song["genre"]})`;
                li.className = "left";
                list.appendChild(li);
            }
        })
        tagDiv.appendChild(cloud);
    }
});

let ol = document.querySelector("#randomResult");
for (let i=0; i<maxCount; i++) {
    let li = document.createElement("li");
    li.className = "left";
    let img = document.createElement("img");
    img.className = "song_pic";
    let div = document.createElement("div");
    div.className = "title_artist";
    let title = document.createElement("p");
    title.className = "title";
    let artist = document.createElement("p");
    artist.className = "artist";
    div.appendChild(title);
    div.appendChild(artist);
    li.appendChild(img);
    li.appendChild(div);
    ol.appendChild(li);
}

for (let radio of document.querySelectorAll("#modeSelect input")) {
    radio.addEventListener("change", event => {
        mode = event.target.value;
        setDisplay(mode == "PC" || mode == "PS4", "block", ...document.querySelectorAll("#dlcSelect, #patternSelect, #levelSelect, #pick, #randomResult, #resultCount"));
        setDisplay(mode == "PC", "inline", document.querySelectorAll("#rankSelect label")[3]);
        setDisplay(mode == "artist", "block", document.querySelector("#artistResult"));
        setDisplay(mode == "artist", "inline", ...document.querySelectorAll("#result > button"));
        setDisplay(mode == "tag", "block", ...document.querySelectorAll("#tag, #tagResult, #result > label"));
        
        if (mode == "PC") {
            if (document.querySelector("input[value='SC']").checked) {
                rankSelect.add("SC");
            }
        }
        else if (mode == "PS4") {
            rankSelect.delete("SC");
        }
    });
}

let levelCheck = document.querySelector("#levelCheck");
levelCheck.addEventListener("change", event => {
    setDisplay(event.target.checked, "block", document.querySelector("#levelSelect > div"))
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
for (let check of document.querySelectorAll("#rankSelect input")) {
    check.addEventListener("change", event => {
        if (event.target.checked == true) {
            rankSelect.add(event.target.value);
        }
        else {
            rankSelect.delete(event.target.value);
        }
    });
    check.click();
}

document.querySelector("#levelInput").addEventListener("change", event => {
    levelLimit = parseInt(event.target.value);
});
document.querySelector("#levelInput2").addEventListener("change", event => {
    levelLimit2 = parseInt(event.target.value);
});

document.querySelector("#levelCondition").addEventListener("change", event => {
    levelCondition = event.target.value;
    setDisplay(levelCondition == "range", "inline", document.querySelector("#range"));
});
document.querySelector("#levelCondition").value = "gtr";
document.querySelector("#levelCondition").dispatchEvent(new InputEvent("change"));

document.querySelector("#run").addEventListener("click", () => {
    let result = [];
    for (let dlc of dlcSelect) {
        let temp = JSON.parse(JSON.stringify(list[dlc]));
        for (let song of temp) {
            if(!song.hasOwnProperty("game")) song["game"] = dlc;
        }
        result = [...result, ...temp];
    }
    result = result.filter(song => song.hasOwnProperty("exclusive")? song["exclusive"] == mode : true);
    result = result.filter(song => {
        for (let btn of btnSelect) {
            for (let rank of rankSelect) {
                if (song["level"][btn].hasOwnProperty(rank)) {
                    return true;
                }
            }
        }
        return false;
    });
    
    if (levelCheck.checked) {
        result = result.filter(song => {
            let pattern = getPatterns(song["level"], levelLimit, levelLimit2);
            if (pattern.length) {
                song["pattern"] = pattern;
                return true;
            }
            else {
                return false;
            }
        });
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
    for (let i=0; i<maxCount; i++) {
        li[i].querySelector("img").src = "";
        let p = li[i].querySelectorAll("p");
        p[0].textContent = "";
        p[1].textContent = "";
        p[0].style.color = "";
        p[1].style.color = "";
        li[i].querySelector("div").style.backgroundImage = "";
    }
    for (let i=0; i<min; i++) {
        let game = resultList[i]["game"];
        let src = resultList[i]["title"];
        let replaces = [["\\","＼"],["/","／"],[":","："],["*","＊"],["?","？"],["\"","＂"],["<","＜"],[">","＞"],["|","｜"],["&","＆"],["#","＃"]]
        for (let rep of replaces) {
            src = src.replace(rep[0], rep[1]);
        }
        if (resultList[i]["title"] == "Urban Night") {
            src = `${src} (${resultList[i]["artist"]})`;
        }
        li[i].querySelector("img").src = `song_pic/${src}_${getRandomInt(1,4)}.png`;
        
        let p = li[i].querySelectorAll("p");
        p[0].textContent = resultList[i]["title"];
        if (resultList[i].hasOwnProperty("pattern")) {
            let span = document.createElement("span");
            span.textContent = " (";
            span.className = "pattern";
            for (let j=0; j<resultList[i]["pattern"].length; j++) {
                span.appendChild(document.createTextNode(resultList[i]["pattern"][j][0]+" "));
                let pattern = document.createElement("span");
                pattern.textContent = resultList[i]["pattern"][j][1];
                pattern.className = resultList[i]["pattern"][j][1];
                span.appendChild(pattern);
                if (j<resultList[i]["pattern"].length-1) span.appendChild(document.createTextNode(", "));
            }
            span.appendChild(document.createTextNode(")"));
            p[0].appendChild(span);
        }
        p[1].textContent = resultList[i]["artist"];
        
        if (game != "클래지콰이") {
            p[0].style.color = "#fff";
            p[1].style.color = "#fff";
        }
        li[i].querySelector("div").style.backgroundImage = (collaboration.includes(game))? `url(${colorMapping["콜라보"]})` : `url(${colorMapping[game]})`;
    }
});

document.querySelector("#resultCountInput").addEventListener("change", event => {
    count = parseInt(event.target.value);
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
    element.forEach(elem => {
        elem.style.display = (condition)? display : "none";
    });
}

function getPatterns(level, num, num2) {
    let result = [];
    for (let btn of btnSelect) {
        for (let rank in level[btn]) {
            if (!rankSelect.has(rank)) {
                continue;
            }
            let value = level[btn][rank];
            switch (levelCondition) {
                case "gtr":
                    if (value >= num) result.push([btn,rank]);
                    break;
                case "lss":
                    if (value <= num) result.push([btn,rank]);
                    break;
                case "equal":
                    if (value == num) result.push([btn,rank]);
                    break;
                case "range":
                    if ((value >= num) && (value <= num2)) result.push([btn,rank]);
                    break;
            }
        }
    }
    return result;
}

function getRandomInt(minInclude, maxExclude) {
    return Math.floor(Math.random() * (maxExclude - minInclude)) + minInclude;
}

function sortCaseInsensitive(a, b) {
    if(a.toLowerCase()>b.toLowerCase()) return 1;
    if(a.toLowerCase()<b.toLowerCase()) return -1;
    return 0;
}