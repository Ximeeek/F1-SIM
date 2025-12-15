import { Game } from './core/Game.js';

// Bootstrapping aplikacji
window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('[Main] Initializing Engine...');
        const game = new Game('gameCanvas');
        game.start();
    } catch (e) {
        console.error('[Critical Error]', e);
        alert('Nie udało się uruchomić gry. Sprawdź konsolę.');
    }
});