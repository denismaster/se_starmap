import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';

export interface Star {
    x: number;
    y: number;
    name?: string;
    owner: string;
    size: number;
    isDestroyed?: boolean;
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit {

    @ViewChild("canvas") canvas: ElementRef;
    private imageLoaded: boolean;
    constructor(http: Http) {
        this.background = new Image();
        this.background.src = "background.jpg";
        http.get("/api/stars").subscribe(result => this.stars = result.json());
        http.get("/api/sectors").subscribe(result => this.sectors = result.json());
    }

    private context: CanvasRenderingContext2D;
    ngAfterViewInit() {
        if (!this.context) {
            this.context = this.canvas.nativeElement.getContext("2d");
            this.captureEvents(this.canvas.nativeElement);
        }
    }
    private stars: Star[] = [];

    private translateX:number=0;
    private  translateY:number=0;

    private sectors: any;
    private currentSelectedStar: Star;
    private background: HTMLImageElement;
    private getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): { x: number, y: number } {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left+this.translateX,
            y: evt.clientY - rect.top+this.translateY
        };
    }
    private mouseMove(event: MouseEvent) {
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

    private removeMiddle(a, b, c): boolean {
        var cross = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
        var dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
        return cross < 0 || cross == 0 && dot <= 0;
    }

    private getOwnerColor(owner:string):string{
        switch(owner)
        {
            case "Alliance": return "rgba(44,40,2,0.7)";
            case "Empire": return "rgba(47,30,14,0.7)";
            case "Jericho": return "rgba(52,4,0, 0.7)";
            case "Dominion": return "rgba(1,38,4,0.7)";
            case "Hollynuts": return "rgba(98,98,98,0.7)";
            case "Federation": return "rgba(1,17,42,0.7)";
            default: return "rgba(168,168,168, 0.3)";
        }
    }
    private render(context: CanvasRenderingContext2D, stars, selectedStar?) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(this.translateX,this.translateY);
        if (this.imageLoaded)
            context.drawImage(this.background, 0, 0);
        context.fillStyle = "#ccc";
        context.font = "bold 12px 'Lato-Regular'";
        context.strokeStyle = "#ccc";
        if (this.sectors && this.sectors.length > 0) {
            for (let sector of this.sectors) {
                context.beginPath();
                const color = this.getOwnerColor(sector.key);
                context.fillStyle = color;
                context.strokeStyle = color;
                
                context.lineWidth = 5;
                for (let star of sector.values) {
                    context.lineTo(star.x, star.y)
                }
                context.fill();
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

    private captureEvents(canvasEl: HTMLCanvasElement) {
        Observable
            .fromEvent(this.background, 'load')
            .subscribe((res: Event) => {
                this.imageLoaded = true;
                this.render(this.context, this.stars)
            })
        Observable
            // this will capture all mousemove events from teh canvas element
            .fromEvent(canvasEl, 'mousemove')
            .subscribe((res: MouseEvent) => {
                this.mouseMove(res);
                this.render(this.context, this.stars, this.currentSelectedStar)
            });
        Observable
            .fromEvent(canvasEl, 'mousedown')
            .switchMap((e) => {
                return Observable
                    .fromEvent(canvasEl, 'mousemove')
                    .takeUntil(Observable.fromEvent(canvasEl, 'mouseup'))
                    .pairwise()
            })
            .subscribe((res: [MouseEvent, MouseEvent]) => {
                const rect = canvasEl.getBoundingClientRect();

                const prevPos = {
                    x: res[0].clientX - rect.left,
                    y: res[0].clientY - rect.top
                };

                const currentPos = {
                    x: res[1].clientX - rect.left,
                    y: res[1].clientY - rect.top
                };

                const difference = {
                    x: currentPos.x - prevPos.x,
                    y: currentPos.y - prevPos.y
                }
                this.translateX+=difference.x;
                this.translateY+=difference.y;
            });
    }
}
