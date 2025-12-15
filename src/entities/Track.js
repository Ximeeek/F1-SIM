import { Config } from '../utils/Config.js';
import { Vec2, rnd } from '../math/Vector2.js';

export class Track {
    constructor() {
        this.path = [];
        this.startLine = { p1: null, p2: null };
        this.isReady = false;
    }

    generate() {
        console.log('[System] Generating procedural track...');
        const cx = Config.WIDTH / 2;
        const cy = Config.HEIGHT / 2;
        const rx = Config.WIDTH * 0.4;
        const ry = Config.HEIGHT * 0.4;
        
        let rawPoints = [];
        for (let i = 0; i < Config.TRACK_POINTS; i++) {
            const angle = (i / Config.TRACK_POINTS) * Math.PI * 2;
            const noise = rnd(1 - Config.TRACK_VARIANCE, 1 + Config.TRACK_VARIANCE);
            rawPoints.push(new Vec2(
                cx + Math.cos(angle) * rx * noise,
                cy + Math.sin(angle) * ry * noise
            ));
        }

        this.path = this._createSpline(rawPoints);
        this._calculateStartLineGeometry();
        this.isReady = true;
    }

    _createSpline(points) {
        let spline = [];
        const n = points.length;
        const steps = 15; 

        for (let i = 0; i < n; i++) {
            const p0 = points[(i - 1 + n) % n];
            const p1 = points[i];
            const p2 = points[(i + 1) % n];
            const p3 = points[(i + 2) % n];

            for (let t = 0; t < steps; t++) {
                const st = t / steps;
                const tt = st * st;
                const ttt = tt * st;

                const qx = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * st + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * ttt);
                const qy = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * st + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * ttt);
                spline.push(new Vec2(qx, qy));
            }
        }
        return spline;
    }

    _calculateStartLineGeometry() {
        const pStart = this.path[0];
        const pNext = this.path[4]; 
        const tangent = pNext.sub(pStart).norm();
        const normal = tangent.perp();

        const halfWidth = Config.TRACK_WIDTH / 2;
        this.startLine.p1 = pStart.sub(normal.mul(halfWidth));
        this.startLine.p2 = pStart.add(normal.mul(halfWidth));
    }

    isOnTrack(pos) {
        // Optymalizacja: w produkcji użylibyśmy QuadTree.
        // Tutaj przy <500 pkt iteracja jest akceptowalna.
        let minDistSq = Infinity;
        const limitSq = (Config.TRACK_WIDTH / 2) ** 2;

        for (const p of this.path) {
            const dx = pos.x - p.x;
            const dy = pos.y - p.y;
            const dSq = dx*dx + dy*dy;
            if (dSq < minDistSq) minDistSq = dSq;
            if (minDistSq < limitSq) return true; // Early exit
        }
        return false;
    }

    draw(ctx) {
        // Pobocze
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.strokeStyle = Config.COLORS.KERB;
        ctx.lineWidth = Config.TRACK_WIDTH + 16;
        this._drawPath(ctx);
        ctx.stroke();

        // Jezdnia
        ctx.beginPath();
        ctx.strokeStyle = Config.COLORS.ASPHALT;
        ctx.lineWidth = Config.TRACK_WIDTH;
        this._drawPath(ctx);
        ctx.stroke();

        // Meta
        ctx.beginPath();
        ctx.strokeStyle = Config.COLORS.LINE;
        ctx.lineWidth = 6;
        ctx.moveTo(this.startLine.p1.x, this.startLine.p1.y);
        ctx.lineTo(this.startLine.p2.x, this.startLine.p2.y);
        ctx.stroke();
    }

    _drawPath(ctx) {
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.closePath();
    }
}