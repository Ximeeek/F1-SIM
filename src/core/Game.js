import { Config } from '../utils/Config.js';
import { rndInt } from '../math/Vector2.js';
import { Track } from '../entities/Track.js';
import { Car } from '../entities/Car.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error("Canvas not found");
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = Config.WIDTH;
        this.canvas.height = Config.HEIGHT;
        
        this.track = new Track();
        this.cars = [];
        this.player = null;
        this.raceLaps = rndInt(Config.MIN_LAPS, Config.MAX_LAPS);
        
        this.input = { up: false, down: false, left: false, right: false };
        this.running = false;
        
        this._bindInput();
        this._initUI();
    }

    _initUI() {
        this.ui = {
            hud: document.getElementById('hud'),
            pos: document.getElementById('pos-display'),
            lap: document.getElementById('lap-display'),
            endScreen: document.getElementById('end-screen'),
            endTitle: document.getElementById('end-title'),
            endStats: document.getElementById('end-stats')
        };
    }

    start() {
        this.track.generate();
        this._spawnCars();
        
        this.running = true;
        this.ui.hud.style.display = 'block';
        console.log(`[Game] Race started. Laps: ${this.raceLaps}, Cars: ${Config.CAR_COUNT}`);
        
        this.loop();
    }

    _spawnCars() {
        const startNode = this.track.path[0];
        const nextNode = this.track.path[5];
        const dir = nextNode.sub(startNode).norm();
        const perp = dir.perp();
        
        for (let i = 0; i < Config.CAR_COUNT; i++) {
            const isPlayer = (i === Config.CAR_COUNT - 1);
            const row = Math.floor(i / 2); 
            const side = (i % 2 === 0) ? 1 : -1;
            
            const startDist = 60 + (row * 40);
            const sideDist = side * 15;
            const spawnPos = startNode.sub(dir.mul(startDist)).add(perp.mul(sideDist));
            
            // Spawnujemy na końcu splajnu logicznie, ale w pozycji startowej fizycznie
            const car = new Car(this.track, isPlayer, this.track.path.length - 10);
            car.pos = spawnPos;
            car.angle = Math.atan2(dir.x, -dir.y);
            
            if (isPlayer) this.player = car;
            this.cars.push(car);
        }
    }

    _bindInput() {
        const handler = (key, state) => {
            if(key === 'w') this.input.up = state;
            if(key === 's') this.input.down = state;
            if(key === 'a') this.input.left = state;
            if(key === 'd') this.input.right = state;
        };
        window.addEventListener('keydown', e => handler(e.key.toLowerCase(), true));
        window.addEventListener('keyup', e => handler(e.key.toLowerCase(), false));
    }

    update() {
        // Kolizje
        for (let i=0; i<this.cars.length; i++) {
            for (let j=i+1; j<this.cars.length; j++) {
                const c1 = this.cars[i];
                const c2 = this.cars[j];
                const dist = c1.pos.dist(c2.pos);
                const minDist = 20; 
                
                if (dist < minDist) {
                    const overlap = minDist - dist;
                    const push = c2.pos.sub(c1.pos).norm().mul(overlap * 0.5);
                    c1.pos = c1.pos.sub(push);
                    c2.pos = c2.pos.add(push);
                }
            }
        }

        this.cars.forEach(car => car.update(car === this.player ? this.input : {}));
        this.cars.sort((a, b) => b.totalDistance - a.totalDistance);
        
        this._updateHUD();
    }

    _updateHUD() {
        if (!this.player) return;
        
        const pos = this.cars.indexOf(this.player) + 1;
        this.ui.pos.innerText = `${pos} / ${Config.CAR_COUNT}`;
        this.ui.lap.innerText = `${Math.min(this.player.laps + 1, this.raceLaps)} / ${this.raceLaps}`;
        
        if (this.player.laps >= this.raceLaps && !this.player.finished) {
            this.player.finished = true;
            this._endRace(pos);
        }
        
        this.cars.forEach(c => {
            if (c.laps >= this.raceLaps) c.finished = true;
        });
    }

    _endRace(position) {
        this.ui.endScreen.style.display = 'flex';
        if (position === 1) {
            this.ui.endTitle.innerText = "ZWYCIĘSTWO!";
            this.ui.endTitle.style.color = "#f1c40f";
        } else {
            this.ui.endTitle.innerText = "UKOŃCZONO";
            this.ui.endTitle.style.color = "#ecf0f1";
        }
        this.ui.endStats.innerText = `Zająłeś ${position}. miejsce`;
    }

    draw() {
        this.ctx.fillStyle = Config.COLORS.GRASS;
        this.ctx.fillRect(0, 0, Config.WIDTH, Config.HEIGHT);
        
        this.track.draw(this.ctx);
        [...this.cars].reverse().forEach(car => car.draw(this.ctx));
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}