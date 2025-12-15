/**
 * Global Configuration Object.
 * Zastosowano Object.freeze dla zapewnienia immutability w runtime.
 */
export const Config = Object.freeze({
    // Render
    WIDTH: 1024,
    HEIGHT: 768,
    
    // Gameplay Rules
    MIN_LAPS: 50,
    MAX_LAPS: 75,
    CAR_COUNT: 8,
    
    // Track Generation
    TRACK_WIDTH: 110,
    TRACK_POINTS: 24,
    TRACK_VARIANCE: 0.35,
    
    // Physics (Arcade Model)
    ACCELERATION: 0.15,
    TOP_SPEED: 7.5,
    OFFROAD_SPEED_LIMIT: 2.5,
    TURN_SPEED: 0.045,
    FRICTION: 0.965,
    BRAKE_FORCE: 0.3,
    
    // Dimensions
    CAR_W: 14,
    CAR_H: 28,
    
    // AI Behavior
    AI_LOOKAHEAD: 140,
    AI_BRAKE_FACTOR: 1.9,
    AI_LANE_OFFSET: 35,

    // Colors
    COLORS: {
        BG: '#2c3e50',
        GRASS: '#27ae60',
        ASPHALT: '#34495e',
        KERB: '#95a5a6',
        LINE: '#ecf0f1',
        PLAYER: '#e74c3c',
        BOT: '#3498db',
        FINISHED: '#7f8c8d'
    }
});