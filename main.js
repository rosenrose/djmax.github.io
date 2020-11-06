dlcSelect = new Set();
btnSelect = new Set();
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
        label.id = dlc.replaceAll(" ","_");
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
        setDisplay(mode != "artist", "block", document.querySelector("#dlcSelect"), document.querySelector("#pick"), document.querySelector("#result"));

        if (mode == "PC") {
            dlcSelect.delete("소녀전선");
        }
        else if (mode == "PS4") {
            if (document.querySelector("#소녀전선 input").checked) {
                dlcSelect.add("소녀전선");
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

document.querySelector("#run").addEventListener("click", () => {
    let result = [];
    for (let dlc in list.songs) {
        if (dlcSelect.has(dlc)) {
            result = [...result, ...list.songs[dlc]];
        }
    }
    result = result.filter(song => song.hasOwnProperty("exclusive")? song["exclusive"] == mode : true);
    if (levelCheck.checked) {
         
    }

    let rands = new Set();
    let min = Math.min(count, result.length);
    while (rands.size < min) {
        rands.add(getRandomInt(0, result.length));
    }

    resultList = [...rands].map(rand => result[rand]);
    let li = document.querySelectorAll("#result li");
    for (let i=0; i<min; i++) {
        li[i].querySelectorAll("p")[0].textContent = resultList[i]["title"];
        li[i].querySelectorAll("p")[1].textContent = resultList[i]["artist"];
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

function getRandomInt(minInclude, maxExclude) {
    return Math.floor(Math.random() * (maxExclude - minInclude)) + minInclude;
}