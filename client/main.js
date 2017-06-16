let stars = [];

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function showMenuAt(x, y) {
    let menu = document.querySelector("#context-menu");
    menu.style.display = "block";
    menu.style.top = y + "px";
    menu.style.left = x + "px";
}

function hideMenu() {
    let menu = document.querySelector("#context-menu");
    menu.style.display = "none";
}

function convexHull(points) {
    points.sort(function(a, b) {
        return a.x != b.x ? a.x - b.x : a.y - b.y;
    });

    var n = points.length;
    var hull = [];

    for (var i = 0; i < 2 * n; i++) {
        var j = i < n ? i : 2 * n - 1 - i;
        while (hull.length >= 2 && removeMiddle(hull[hull.length - 2], hull[hull.length - 1], points[j]))
            hull.pop();
        hull.push(points[j]);
    }

    hull.pop();
    return hull;
}

function removeMiddle(a, b, c) {
    var cross = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
    var dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
    return cross < 0 || cross == 0 && dot <= 0;
}
var currentSelectedStar;
window.onload = function() {
    let canvas = document.getElementById("map");
    let context = canvas.getContext("2d");
    let background = new Image();
    background.src = "background.jpg";
    fetch("/api/stars").then(result => result.json()).then(result => stars = result);
    let handleMouseDown = (ev) => {

        // get mouse position relative to the canvas
        var e = getMousePos(canvas, ev)
        var x = e.x;
        var y = e.y;

        if (ev.which !== 1) return;

        // check each rect for hits
        if (currentSelectedStar) {
            showMenuAt(currentSelectedStar.x + 10, currentSelectedStar.y + 10);
        } else {
            hideMenu();
        }
        // prevents the usual context from popping up
        ev.preventDefault();
        ev.stopPropagation();
        return (false);
    }
    canvas.addEventListener('mousedown', handleMouseDown, false);

    canvas.onmousemove = (event) => {
        var selectedStar = undefined;
        let e = getMousePos(canvas, event);
        for (let star of stars) {
            if (Math.abs(star.x - e.x) <= star.size + 10 && Math.abs(star.y - e.y) <= star.size + 10) {
                selectedStar = star;
                break;
            }
        }
        if (selectedStar != currentSelectedStar) {
            currentSelectedStar = selectedStar;
            draw(context, stars, currentSelectedStar);
        }
    }
    let sortFunction = (a, b) => {
        /*if (a.x > b.x) return 1;
        if (a.x < b.x) return -1;
        else
            return a.y - b.y;*/
        let value1 = Math.sqrt(a.x * a.x + a.y * a.y);
        let value2 = Math.sqrt(b.x * b.x + b.y * b.y);
        return value1 >= value2;
    }
    let draw = (context, stars, selectedStar) => {
        context.drawImage(background, 0, 0);
        context.fillStyle = "#ccc";
        context.font = "bold 12px arial";
        context.strokeStyle = "#ccc";
        context.beginPath();
        context.lineWidth = 20;

        for (let star of convexHull(stars.filter(star => star.owner === "Federation"))) {
            context.fillStyle = "rgba(135, 206, 250, 0.5)";
            context.strokeStyle = "rgba(135, 206, 250, 0.3)";
            context.lineTo(star.x, star.y)

        }
        context.fill();
        context.beginPath();
        context.lineWidth = 20;
        for (let star of convexHull(stars.filter(star => star.owner === "Alliance"))) {
            context.fillStyle = "rgba(255, 210, 0, 0.5)";
            context.strokeStyle = "rgba(255, 210, 250, 0.3)";
            context.lineTo(star.x, star.y)

        }
        context.fill();
        context.beginPath();
        context.lineWidth = 20;
        for (let star of convexHull(stars.filter(star => star.owner === "Empire"))) {
            context.fillStyle = "rgba(139,69,19, 0.5)";
            context.strokeStyle = "rgba(139,69,19, 0.3)";
            context.lineTo(star.x, star.y)

        }
        context.fill();
        context.lineWidth = 1;
        context.closePath();
        for (let star of stars) {
            context.beginPath();
            context.strokeStyle = "#ccc";
            context.fillStyle = "#ccc";
            context.arc(star.x, star.y, star.size || 3, 0, 2 * Math.PI)
            if (star.name)
                context.fillText(star.name, star.x + star.size + 2, star.y);
            if (!star.isDestroyed)
                context.fill();
            context.stroke();
        }
        if (selectedStar) {
            context.beginPath();
            context.strokeStyle = "rgba(224,224,224,0.3)";
            context.fillStyle = "rgba(224,224,224,0.3)";
            context.lineWidth = 5;
            context.arc(selectedStar.x, selectedStar.y, selectedStar.size + 4, 0, 2 * Math.PI)
            context.stroke();
        }
    }
    background.onload = () => {
        draw(context, stars);
    };
};