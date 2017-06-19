import { Component, ViewChild, AfterViewInit,ElementRef } from '@angular/core';
import { Http } from '@angular/http';

export interface Star
{
    x:number;
    y:number;
    name?:string;
    owner:string;
    size:number;
    isDestroyed?:boolean;
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit {

    @ViewChild("canvas") canvas: ElementRef;
    private imageLoaded:boolean;
    constructor(http:Http)
    {
        this.background = new Image();
        this.background.src = "background.jpg";
        this.background.onload = (event)=>
        {
            this.imageLoaded=true;
        }
        http.get("/api/stars").subscribe(result => this.stars=result.json());
        http.get("/api/sectors").subscribe(result => this.sectors=result.json());
    }

    private context: CanvasRenderingContext2D;
    ngAfterViewInit(){
        this.context = this.canvas.nativeElement.getContext("2d");
        this.render(this.context,this.stars);
    }
    private stars: Star[] = [];

    private sectors:any;
    private currentSelectedStar:Star;
    private background:HTMLImageElement;
    private getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): { x: number, y: number } {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    private mouseMove(event: MouseEvent)
    {
        var selectedStar = undefined;
        let e = this.getMousePos(this.canvas.nativeElement, event);
        for (let star of this.stars) {
            if (Math.abs(star.x - e.x) <= star.size + 10 && Math.abs(star.y - e.y) <= star.size + 10) {
                selectedStar = star;
                break;
            }
        }
        if (selectedStar != this.currentSelectedStar) {
            this.currentSelectedStar = selectedStar;
            this.render(this.context,this.stars, this.currentSelectedStar);
        }
    }
    private convexHull(points) {
        points.sort(function (a, b) {
            return a.x != b.x ? a.x - b.x : a.y - b.y;
        });

        var n = points.length;
        var hull = [];

        for (var i = 0; i < 2 * n; i++) {
            var j = i < n ? i : 2 * n - 1 - i;
            while (hull.length >= 2 && this.removeMiddle(hull[hull.length - 2], hull[hull.length - 1], points[j]))
                hull.pop();
            hull.push(points[j]);
        }

        hull.pop();
        return hull;
    }

    private removeMiddle(a, b, c):boolean {
        var cross = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
        var dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
        return cross < 0 || cross == 0 && dot <= 0;
    }

    private render(context:CanvasRenderingContext2D, stars, selectedStar?){
        if(!this.imageLoaded) return;
        context.drawImage(this.background, 0, 0);
        context.fillStyle = "#ccc";
        context.font = "bold 12px arial";
        context.strokeStyle = "#ccc";
        if (this.sectors && this.sectors.length > 0) {
            for (let sector of this.sectors) {
                context.beginPath();
                context.fillStyle = "rgba(168,168,168, 0.3)";
                context.strokeStyle = "rgba(168,168,168, 0.3)";
                context.lineWidth=5;
                console.log(sector);
                for (let star of sector) {
                    context.lineTo(star.x, star.y)
                }
                context.stroke();
                context.closePath();
            }
        }
        context.lineWidth = 1;
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
}
