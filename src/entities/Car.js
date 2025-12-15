import { Config } from '../utils/Config.js';
import { Vec2, rnd } from '../math/Vector2.js';

export class Car {
    constructor(track, isPlayer = false, startIdx = 0) {
        this.track = track;
        this.isPlayer = isPlayer;
        
        // Init Position
        const pos = track.path[startIdx];
        const next = track.path[(startIdx + 5) % track.path.length];
        const dir = next.sub(pos).norm();
        
        this.pos = pos;
        this.angle = Math.atan2(dir.x, -dir.y);
        this.speed = 0;
        this.maxSpeed = Config.TOP_SPEED * (isPlayer ? 1.0 : rnd(0.95, 1.02));
        
        // Lap System State
        this.currentSplineIndex = startIdx;
        this.laps = 0;
        this.halfwayPointPassed = false;
        this.totalDistance = 0;
        this.finished = false;

        // AI specific
        this.laneOffset = rnd(-Config.AI_LANE_OFFSET, Config.AI_LANE_OFFSET);
    }

    update(input) {
        if (this.finished) {
            this.speed *= 0.95;
            this._move();
            return;
        }

        if (!this.isPlayer) {
            input = this._calculateAI();
        }

        this._applyPhysics(input);
        this._move();
        this._updateLapLogic();
    }

    _applyPhysics(input) {
        const isOnTrack = this.track.isOnTrack(this.pos);
        const limit = isOnTrack ? this.maxSpeed : Config.OFFROAD_SPEED_LIMIT;
        const fric = isOnTrack ? Config.FRICTION : 0.90;

        if (input.up) this.speed += Config.ACCELERATION;
        if (input.down) this.speed -= Config.BRAKE_FORCE;

        this.speed *= fric;
        this.speed = Math.max(Math.min(this.speed, limit), -2);

        if (Math.abs(this.speed) > 0.1) {
            const turnFactor = this.speed / this.maxSpeed;
            if (input.left) this.angle -= Config.TURN_SPEED * turnFactor;
            if (input.right) this.angle += Config.TURN_SPEED * turnFactor;
        }
    }

    _move() {
        const vx = Math.sin(this.angle) * this.speed;
        const vy = -Math.cos(this.angle) * this.speed;
        this.pos.x += vx;
        this.pos.y += vy;
    }

    _calculateAI() {
        const cmd = { up: false, down: false, left: false, right: false };
        
        const lookIdx = (this.currentSplineIndex + Math.floor(Config.AI_LOOKAHEAD / 10)) % this.track.path.length;
        const target = this.track.path[lookIdx];

        const dx = target.x - this.pos.x;
        const dy = target.y - this.pos.y;
        
        const myDir = new Vec2(Math.sin(this.angle), -Math.cos(this.angle));
        const targetDir = new Vec2(dx, dy).norm();
        
        const cross = myDir.x * targetDir.y - myDir.y * targetDir.x;
        const dot = myDir.x * targetDir.x + myDir.y * targetDir.y;

        if (cross > 0.05) cmd.right = true;
        if (cross < -0.05) cmd.left = true;

        const isOnTrack = this.track.isOnTrack(this.pos);
        if (!isOnTrack) {
            if (cross > 0) cmd.right = true; else cmd.left = true;
            if (this.speed < 2) cmd.up = true;
        } else {
            const turnSharpness = 1.0 - dot;
            const targetSpeed = this.maxSpeed / (1 + (turnSharpness * Config.AI_BRAKE_FACTOR));
            
            if (this.speed < targetSpeed) {
                cmd.up = true;
            } else {
                if (turnSharpness > 0.3) cmd.down = true; 
            }
        }
        return cmd;
    }

    _updateLapLogic() {
        let bestIdx = -1;
        let bestDist = Infinity;
        const searchRange = 30;
        const len = this.track.path.length;
        
        for (let i = -searchRange; i <= searchRange; i++) {
            let idx = (this.currentSplineIndex + i + len) % len;
            const d = this.pos.dist(this.track.path[idx]);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = idx;
            }
        }

        if (Math.abs(bestIdx - len/2) < 10) {
            this.halfwayPointPassed = true;
        }

        if (this.halfwayPointPassed) {
            if (this.currentSplineIndex > len - 20 && bestIdx < 20) {
                this.laps++;
                this.halfwayPointPassed = false;
            }
        }

        this.currentSplineIndex = bestIdx;
        this.totalDistance = (this.laps * len) + this.currentSplineIndex;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-Config.CAR_W/2 + 4, -Config.CAR_H/2 + 4, Config.CAR_W, Config.CAR_H);

        // Body
        ctx.fillStyle = this.isPlayer ? Config.COLORS.PLAYER : (this.finished ? Config.COLORS.FINISHED : Config.COLORS.BOT);
        
        ctx.beginPath();
        ctx.rect(-Config.CAR_W/2, -Config.CAR_H/2 + 10, Config.CAR_W, 10);
        ctx.rect(-Config.CAR_W/2 + 3, -Config.CAR_H/2, Config.CAR_W - 6, 20);
        ctx.rect(-Config.CAR_W/2, -Config.CAR_H/2 - 4, Config.CAR_W, 4);
        ctx.fill();
        
        if (this.isPlayer) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-Config.CAR_W/2 -2, -Config.CAR_H/2 -6, Config.CAR_W+4, Config.CAR_H+20);
        }

        ctx.restore();
    }
}