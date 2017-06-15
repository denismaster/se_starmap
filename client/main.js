let stars = [];

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
window.onload = function () {
    let canvas = document.getElementById("map");
    let context = canvas.getContext("2d");
    let background = new Image();
    background.src = "background.jpg";
    canvas.onmousemove = (event) => {
        var selectedStar = undefined;
        let e = getMousePos(canvas, event);
        for (let star of stars) {
            if (Math.abs(star.x - e.x) <= star.size + 10 && Math.abs(star.y - e.y) <= star.size + 10) {
                selectedStar = star;
                break;
            }
        }
        draw(context, stars, selectedStar);
    }
    let sortFunction = (a, b) => {
        if (a.x > b.x) return 1;
        if (a.x < b.x) return -1;
        else
            return a.y - b.y;
    }
    let draw = (context, stars, selectedStar) => {
        stars = stars.sort(sortFunction);
        context.drawImage(background, 0, 0);
        context.fillStyle = "#ccc";
        context.font = "bold 12px arial";
        context.strokeStyle = "#ccc";
        context.beginPath();
        context.lineWidth = 20;
        for (let star of stars.filter(star => star.owner === "Federation")) {
            context.fillStyle = "rgba(135, 206, 250, 0.5)";
            context.strokeStyle = "rgba(135, 206, 250, 0.3)";
            context.lineTo(star.x, star.y)
            
        }
        context.fill();
        context.lineWidth = 1;
        context.closePath();
        for (let star of stars) {
            context.beginPath();
            context.strokeStyle = "#ccc";
            context.fillStyle = "#ccc";
            context.arc(star.x, star.y, star.size, 0, 2 * Math.PI)
            if (star.name)
                context.fillText(star.name, star.x + star.size + 2, star.y);
            if (!star.isDestroyed)
                context.fill();
            context.stroke();
        }
        if (selectedStar) {
            context.beginPath();
            context.strokeStyle = "red";
            context.fillStyle = "red";
            context.arc(selectedStar.x, selectedStar.y, selectedStar.size + 4, 0, 2 * Math.PI)
            context.stroke();
        }
    }
    background.onload = () => {
        draw(context, stars);
    };
};