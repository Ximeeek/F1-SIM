/**
 * Immutable 2D Vector Math Library.
 */
export class Vec2 {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
    }

    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mul(s) { return new Vec2(this.x * s, this.y * s); }
    
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    
    norm() { 
        const m = this.mag(); 
        return m === 0 ? new Vec2(0,0) : this.mul(1/m); 
    }
    
    dist(v) { return this.sub(v).mag(); }
    
    // Zwraca wektor prostopadły (-Y, X)
    perp() { return new Vec2(-this.y, this.x); } 
}

// Helpery matematyczne
export const rnd = (min, max) => Math.random() * (max - min) + min;
export const rndInt = (min, max) => Math.floor(rnd(min, max + 1));