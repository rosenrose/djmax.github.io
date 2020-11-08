dlcSelect = new Set();
btnSelect = new Set();
levelLimit = 0;
const count = 10;

fetch("list.json").then(response => response.json())
.then(json => {
    list = json;
    document.querySelector("#run").textContent = "뽑기";
    document.querySelector("#run").disabled = false;
    
    let dlcCheck = document.querySelectorAll("#dlcCheckbox td")
    for (let i=0; i<dlcCheck.length; i++) {
        let dlc = Object.keys(list.songs)[i];
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

let ol = document.querySelector("#result ol");
for (let i=0; i<count; i++) {
    let li = document.createElement("li");
    li.className = "left";
    let title = document.createElement("p");
    title.className = "title";
    let artist = document.createElement("p");
    artist.className = "artist";
    li.appendChild(title);
    li.appendChild(artist);
    ol.appendChild(li);
}

for (let radio of document.querySelectorAll("#modeSelect input")) {
    radio.addEventListener("change", event => {
        mode = event.target.value;
        setDisplay(mode == "PS4", "inline", document.querySelector("#소녀전선"));
        setDisplay(mode != "artist", "block", document.querySelector("#dlcSelect"), document.querySelector("#levelSelect"), document.querySelector("#pick"), document.querySelector("ol"));
        let ul = document.querySelector("ul");
        setDisplay(mode == "artist", "block", ul);
        
        if (mode == "PC") {
            dlcSelect.delete("소녀전선");
        }
        else if (mode == "PS4") {
            if (document.querySelector("#소녀전선 input").checked) {
                dlcSelect.add("소녀전선");
            }
        }
        else if (mode == "artist" && !ul.hasChildNodes()) {
            let songs = Object.values(list.songs).reduce((a,b) => [...a, ...b]);
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

document.querySelector("#gtr_equal").addEventListener("change", event => {
    gtr_equal = event.target.value;
});
document.querySelector("#gtr_equal").value = "gtr";
document.querySelector("#gtr_equal").dispatchEvent(new InputEvent("change"));


document.querySelector("#run").addEventListener("click", () => {
    let result = [];
    for (let dlc of dlcSelect) {
        result = [...result, ...list.songs[dlc]];
    }
    console.log(result)
    result = result.filter(song => song.hasOwnProperty("exclusive")? song["exclusive"] == mode : true);
    if (levelCheck.checked) {
        for (let i=0; i<result.length;) {
            let levels = [];
            for (let btn of btnSelect) {
                levels = [...levels, ...Object.values(result[i]["level"][btn])];
            }

            if (gtr_equal == "gtr") {
                if (Math.max(...levels) < levelLimit) {
                    result.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            else if (gtr_equal == "equal") {
                if (!levels.includes(levelLimit)) {
                    result.splice(i, 1);
                }
                else {
                    result[i]["equal"] = getLevel(result[i]["level"], btnSelect, levelLimit);
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
    for (let p of document.querySelectorAll("ol p")) {
        p.textContent = "";
    }
    let li = document.querySelectorAll("#result li");
    for (let i=0; i<min; i++) {
        let p = li[i].querySelectorAll("p");
        p[0].textContent = resultList[i]["title"];
        if (resultList[i].hasOwnProperty("equal")) {
            p[0].textContent += ` (${resultList[i]["equal"]})`
        }
        p[1].textContent = resultList[i]["artist"];
    }
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

function getLevel(level, btns, num) {
    let result = []
    for (let btn of btns) {
        for (let rank in level[btn]) {
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