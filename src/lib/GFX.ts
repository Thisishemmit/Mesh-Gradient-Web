
class Point {
    public x: number;
    public y: number;
    public id: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.id = Point.generateId(x, y);
    }
    static distance(a: Point, b: Point): number {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
    static equals(a: Point, b: Point): boolean {
        if (a.id === b.id) return true;
        return false;
    }

    static generateId(x: number, y: number): number {
        return x * (1000000 + 1) + y;
    }

}
class BezierCurve {
    private a: Point;
    private b: Point;
    private ac: Point;
    private bc: Point;

    constructor(a: Point, b: Point, ac: Point, bc: Point) {
        this.a = a;
        this.b = b;
        this.ac = ac;
        this.bc = bc;
    }

    pointAt(t: number): Point {
        const mt = 1 - t;
        const x = mt * mt * mt * this.a.x +
            3 * mt * mt * t * this.ac.x +
            3 * mt * t * t * this.bc.x +
            t * t * t * this.b.x;
        const y = mt * mt * mt * this.a.y +
            3 * mt * mt * t * this.ac.y +
            3 * mt * t * t * this.bc.y +
            t * t * t * this.b.y;
        return { x, y , id: Point.generateId(x, y) };
    }

    setA(point: Point) { this.a = point; }
    setB(point: Point) { this.b = point; }
    setAC(point: Point) { this.ac = point; }
    setBC(point: Point) { this.bc = point; }

    getA(): Point { return this.a; }
    getB(): Point { return this.b; }
    getAC(): Point { return this.ac; }
    getBC(): Point { return this.bc; }
}

class CurvableSquare {
    private top: BezierCurve;
    private right: BezierCurve;
    private bottom: BezierCurve;
    private left: BezierCurve;

    constructor(x: number, y: number, w: number, h: number) {
        const a = { x, y ,id: Point.generateId(x, y) };
        const acb = { x: x + w / 3, y ,id: Point.generateId(x, y) };
        const acd = { x, y: y + h / 3 ,id: Point.generateId(x, y) };
        const b = { x: x + w, y ,id: Point.generateId(x, y) };
        const bca = { x: x + 2 * w / 3, y ,id: Point.generateId(x, y) };
        const bcc = { x: x + w, y: y + h / 3 ,id: Point.generateId(x, y) };
        const c = { x: x + w, y: y + h ,id: Point.generateId(x, y) };
        const ccb = { x: x + w, y: y + 2 * h / 3 ,id: Point.generateId(x, y) };
        const ccd = { x: x + 2 * w / 3, y: y + h ,id: Point.generateId(x, y) };
        const d = { x, y: y + h ,id: Point.generateId(x, y) };
        const dca = { x, y: y + 2 * h / 3 ,id: Point.generateId(x, y) };
        const dcc = { x: x + w / 3, y: y + h ,id: Point.generateId(x, y) };

        this.top = new BezierCurve(a, b, acb, bca);
        this.right = new BezierCurve(b, c, bcc, ccb);
        this.bottom = new BezierCurve(c, d, ccd, dcc);
        this.left = new BezierCurve(d, a, dca, acd);
    }

    getTop(): BezierCurve { return this.top; }
    getRight(): BezierCurve { return this.right; }
    getBottom(): BezierCurve { return this.bottom; }
    getLeft(): BezierCurve { return this.left; }

    setTop(top: BezierCurve) { this.top = top; }
    setRight(right: BezierCurve) { this.right = right; }
    setBottom(bottom: BezierCurve) { this.bottom = bottom; }
    setLeft(left: BezierCurve) { this.left = left; }
}
export class GFX {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private squares: CurvableSquare[] = [];

    private undoStack: CurvableSquare[] = [];
    private redoStack: CurvableSquare[] = [];

    private selectedPoints: Point[] = [];

    private mouseDown: boolean = false;

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
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    }




    public addSquare(x: number, y: number, w: number, h: number) {
        this.squares.push(new CurvableSquare(x, y, w, h));
    }

    private ifPointSelected(point: Point): boolean {}
    private onMouseDown(event: MouseEvent) {
        const x = event.offsetX;
        const y = event.offsetY;
        const point = new Point(x, y);
        if (this.ifPointSelected(point)) {
            this.selectedPoints.push(point);
        }

    }
    private onMouseMove(event: MouseEvent) {}
    private onMouseUp(event: MouseEvent) {}
    private onMouseLeave(event: MouseEvent) {}
    private onMouseEnter(event: MouseEvent) {}

    private pointOnCurve(curve: BezierCurve, point: Point, radius: number): boolean {}

    private drawCurve(curve: BezierCurve) {}
    private drawPoint(point: Point) {}

    private curveHover(curve: BezierCurve) {}

    private mainCircle(point: Point) {}
    private mainCircleSelected(point: Point) {}
    private mainCircleHovered(point: Point) {}
    private controlCircle(point: Point) {}
    private controlCircleSelected(point: Point) {}
    private controlCircleHovered(point: Point) {}


    private clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawSquares() {
        this.squares.forEach((square) => {
            this.drawCurve(square.getTop());
            this.drawCurve(square.getRight());
            this.drawCurve(square.getBottom());
            this.drawCurve(square.getLeft());
        });
    }


    draw() {
        this.clear();
        this.drawSquares();
    }
}
