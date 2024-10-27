function isBetween(val: number, start: number, end: number, exclusive: boolean = false) {
    if (exclusive) return val > start && val < end;
    return val >= start && val <= end;
}

interface PointConfig {
    radius: number;
    color: string;
    borderColor: string;
    borderWidth: number;
    selectedColor: string;
    hoveredColor: string;
    selectedBorderColor: string;
    hoveredBorderColor: string;
}

interface LineConfig {
    color: string;
    width: number;
    selectedColor: string;
    hoveredColor: string;
}


export class Point {
    public x: number;
    public y: number;
    public config: PointConfig;
    public selected: boolean;
    public hovered: boolean;
    public linkedWith: Point[] = [];
    public id: number;

    constructor(x: number, y: number, config: PointConfig) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.selected = false;
        this.hovered = false;
        this.id = Math.floor(Math.random() * 1000000);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.config.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.selected ? this.config.selectedColor : this.hovered ? this.config.hoveredColor : this.config.color;
        ctx.fill();
        ctx.lineWidth = this.config.borderWidth;
        ctx.strokeStyle = this.selected ? this.config.selectedBorderColor : this.hovered ? this.config.hoveredBorderColor : this.config.borderColor;
        ctx.stroke();
    }

    hover() {
        this.hovered = true;
    }

    unhover() {
        this.hovered = false;
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
        for (let i = 0; i < this.linkedWith.length; i++) {
            this.linkedWith[i].x = x;
            this.linkedWith[i].y = y;
        }
    }
    static linkPoints(p1: Point, p2: Point) {
        p1.linkedWith.push(p2);
        p2.linkedWith.push(p1);
    }
}

class CubicBezier {
    public p0: Point;
    public p1: Point;
    public p2: Point;
    public p3: Point;
    private config: LineConfig = {
        color: '#000000',
        width: 1,
        selectedColor: '#FF0000',
        hoveredColor: '#00FF00'
    };
    private selected: boolean;
    private hovered: boolean;

    constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.selected = false;
        this.hovered = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        let p01: { x: number, y: number };
        let p12: { x: number, y: number };
        let p23: { x: number, y: number };
        let p01_12: { x: number, y: number };
        let p12_23: { x: number, y: number };
        let pf: { x: number, y: number };
        ctx.beginPath();
        for (let i = 0; i <= 1; i += 0.01) {
            p01 = { x: this.lerp(this.p0.x, this.p1.x, i), y: this.lerp(this.p0.y, this.p1.y, i) };
            p12 = { x: this.lerp(this.p1.x, this.p2.x, i), y: this.lerp(this.p1.y, this.p2.y, i) };
            p23 = { x: this.lerp(this.p2.x, this.p3.x, i), y: this.lerp(this.p2.y, this.p3.y, i) };
            p01_12 = { x: this.lerp(p01.x, p12.x, i), y: this.lerp(p01.y, p12.y, i) };
            p12_23 = { x: this.lerp(p12.x, p23.x, i), y: this.lerp(p12.y, p23.y, i) };
            pf = { x: this.lerp(p01_12.x, p12_23.x, i), y: this.lerp(p01_12.y, p12_23.y, i) };
            ctx.lineTo(pf.x, pf.y);
            ctx.strokeStyle = this.selected ? this.config.selectedColor : this.hovered ? this.config.hoveredColor : this.config.color;
            ctx.lineWidth = this.config.width;
            ctx.stroke();
        }
        this.p0.draw(ctx);
        this.p1.draw(ctx);
        this.p2.draw(ctx);
        this.p3.draw(ctx);

    }

    lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }


    select() {
        this.selected = true;
    }

    deselect() {
        this.selected = false;
    }

    hover() {
        this.hovered = true;
    }

    unhover() {
        this.hovered = false;
    }
}

class CurvableRect {
    public top: CubicBezier;
    public right: CubicBezier;
    public bottom: CubicBezier;
    public left: CubicBezier;
    public points: Point[] = []
    public selectedPointes: Map<number, Point> = new Map();
    public mainPointConfig: PointConfig = {
        radius: 5,
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        selectedColor: '#FF0000',
        hoveredColor: '#00FF00',
        selectedBorderColor: '#FF0000',
        hoveredBorderColor: '#00FF00'
    };
    public controlPointConfig: PointConfig = {
        radius: 3,
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        selectedColor: '#FF0000',
        hoveredColor: '#00FF00',
        selectedBorderColor: '#FF0000',
        hoveredBorderColor: '#00FF00'
    };

    constructor(x: number, y: number, w: number, h: number) {
        const topMain1 = new Point(x, y, this.mainPointConfig);
        const topControl1 = new Point(x + w / 3, y, this.controlPointConfig);
        const topControl2 = new Point(x + 2 * w / 3, y, this.controlPointConfig);
        const topMain2 = new Point(x + w, y, this.mainPointConfig);
        this.top = new CubicBezier(topMain1, topControl1, topControl2, topMain2);
        const rightMain1 = new Point(x + w, y, this.mainPointConfig);
        const rightControl1 = new Point(x + w, y + h / 3, this.controlPointConfig);
        const rightControl2 = new Point(x + w, y + 2 * h / 3, this.controlPointConfig);
        const rightMain2 = new Point(x + w, y + h, this.mainPointConfig);
        this.right = new CubicBezier(rightMain1, rightControl1, rightControl2, rightMain2);
        const bottomMain1 = new Point(x + w, y + h, this.mainPointConfig);
        const bottomControl1 = new Point(x + 2 * w / 3, y + h, this.controlPointConfig);
        const bottomControl2 = new Point(x + w / 3, y + h, this.controlPointConfig);
        const bottomMain2 = new Point(x, y + h, this.mainPointConfig);
        this.bottom = new CubicBezier(bottomMain1, bottomControl1, bottomControl2, bottomMain2);
        const leftMain1 = new Point(x, y + h, this.mainPointConfig);
        const leftControl1 = new Point(x, y + 2 * h / 3, this.controlPointConfig);
        const leftControl2 = new Point(x, y + h / 3, this.controlPointConfig);
        const leftMain2 = new Point(x, y, this.mainPointConfig);
        this.left = new CubicBezier(leftMain1, leftControl1, leftControl2, leftMain2);
        Point.linkPoints(topMain1, leftMain2);
        Point.linkPoints(topMain2, rightMain1);
        Point.linkPoints(rightMain2, bottomMain1);
        Point.linkPoints(bottomMain2, leftMain1);

        this.points.push(topMain1)
        this.points.push(topControl1)
        this.points.push(topControl2)
        this.points.push(topMain2)
        this.points.push(rightMain1)
        this.points.push(rightControl1)
        this.points.push(rightControl2)
        this.points.push(rightMain2)
        this.points.push(bottomMain1)
        this.points.push(bottomControl1)
        this.points.push(bottomControl2)
        this.points.push(bottomMain2)
        this.points.push(leftMain1)
        this.points.push(leftControl1)
        this.points.push(leftControl2)
        this.points.push(leftMain2)
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.top.draw(ctx);
        this.right.draw(ctx);
        this.bottom.draw(ctx);
        this.left.draw(ctx);
    }
}
export class GFX {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private rects: CurvableRect[] = [];
    private moveSelected: boolean = false;

    constructor(container: string) {
        this.canvas = document.createElement('canvas');
        const element = document.getElementById(container)!;
        element.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvas.width = element.offsetWidth;
        this.canvas.height = element.offsetHeight;


        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    addRect(x: number, y: number, w: number, h: number) {
        this.rects.push(new CurvableRect(x, y, w, h));
    }


    private onMouseMove(e: MouseEvent) {
        for (let j = 0; j < this.rects.length; j++) {
            for (let i = 0; i < this.rects[j].points.length; i++) {

                if (isBetween(e.x,
                    this.rects[j].points[i].x - this.rects[j].points[i].config.radius,
                    this.rects[j].points[i].x + this.rects[j].points[i].config.radius)&&
                    isBetween(e.y,
                    this.rects[j].points[i].y - this.rects[j].points[i].config.radius,
                    this.rects[j].points[i].y + this.rects[j].points[i].config.radius)
                   ) {
                    this.rects[j].points[i].hover()
                } else {

                    this.rects[j].points[i].unhover()
                }

                if (this.moveSelected) {
                    this.rects[j].selectedPointes.forEach(point => {
                        point.move(e.x, e.y);
                    });
                }
            }
        }
        this.draw();
    }

    private onMouseDown(e: MouseEvent) {
        this.moveSelected = true;
        for (let j = 0; j < this.rects.length; j++) {
            for (let i = 0; i < this.rects[j].points.length; i++) {
                if (isBetween(e.x,
                    this.rects[j].points[i].x - this.rects[j].points[i].config.radius,
                    this.rects[j].points[i].x + this.rects[j].points[i].config.radius)&&
                    isBetween(e.y,
                    this.rects[j].points[i].y - this.rects[j].points[i].config.radius,
                    this.rects[j].points[i].y + this.rects[j].points[i].config.radius)
                   ) {
                    this.rects[j].selectedPointes.clear();
                    this.rects[j].points[i].selected = true;
                    this.rects[j].selectedPointes.set(this.rects[j].points[i].id, this.rects[j].points[i]);
                } else {
                    if (this.rects[j].selectedPointes.has(this.rects[j].points[i].id)) {
                        this.rects[j].selectedPointes.delete(this.rects[j].points[i].id);
                        this.rects[j].points[i].selected = false;
                    }
                }
            }
        }
        this.draw();
    }

    private onMouseUp() {
        this.moveSelected = false;
        this.draw();
    }



    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rects.forEach(rect => rect.draw(this.ctx));
    }
}
