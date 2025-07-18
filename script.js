// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let coins = 0;
let camera = { x: 0, y: 0 };

// Physics constants
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const RUN_SPEED = 8;

// Game objects arrays
let platforms = [];
let enemies = [];
let collectibles = [];
let particles = [];

// Input handling
const keys = {};
let isRunning = false;

// Player object
const player = {
    x: 100,
    y: 200,
    width: 32,
    height: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    direction: 1, // 1 for right, -1 for left
    color: '#FF0000',
    invincible: false,
    invincibleTime: 0
};

// Platform class
class Platform {
    constructor(x, y, width, height, type = 'ground') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = type === 'ground' ? '#8B4513' : '#DAA520';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        
        // Add brick pattern
        if (this.type === 'brick') {
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            for (let i = 0; i < this.width; i += 16) {
                for (let j = 0; j < this.height; j += 16) {
                    ctx.strokeRect(this.x - camera.x + i, this.y - camera.y + j, 16, 16);
                }
            }
        }
    }
}

// Enemy class
class Enemy {
    constructor(x, y, type = 'goomba') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.vx = -1;
        this.vy = 0;
        this.type = type;
        this.alive = true;
        this.color = type === 'goomba' ? '#8B4513' : '#228B22';
    }

    update() {
        if (!this.alive) return;

        // Move enemy
        this.x += this.vx;
        this.y += this.vy;

        // Apply gravity
        this.vy += GRAVITY * 0.5;

        // Platform collision
        this.checkPlatformCollision();

        // Reverse direction at edges
        if (this.vx > 0 && this.x > 1200) this.vx = -this.vx;
        if (this.vx < 0 && this.x < 0) this.vx = -this.vx;
    }

    checkPlatformCollision() {
        for (let platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Top collision
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                }
            }
        }
    }

    draw() {
        if (!this.alive) return;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
        
        // Add simple face
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - camera.x + 6, this.y - camera.y + 6, 3, 3); // left eye
        ctx.fillRect(this.x - camera.x + 15, this.y - camera.y + 6, 3, 3); // right eye
        ctx.fillRect(this.x - camera.x + 8, this.y - camera.y + 15, 8, 2); // mouth
    }
}

// Collectible class (coins, power-ups)
class Collectible {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.collected = false;
        this.bobOffset = 0;
        this.color = type === 'coin' ? '#FFD700' : '#FF69B4';
    }

    update() {
        if (this.collected) return;
        this.bobOffset += 0.1;
    }

    draw() {
        if (this.collected) return;
        
        const bobY = Math.sin(this.bobOffset) * 3;
        ctx.fillStyle = this.color;
        
        if (this.type === 'coin') {
            // Draw coin as circle
            ctx.beginPath();
            ctx.arc(this.x - camera.x + this.width/2, this.y - camera.y + this.height/2 + bobY, this.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add shine effect
            ctx.fillStyle = '#FFFF99';
            ctx.beginPath();
            ctx.arc(this.x - camera.x + this.width/2 - 3, this.y - camera.y + this.height/2 + bobY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw power-up as rectangle
            ctx.fillRect(this.x - camera.x, this.y - camera.y + bobY, this.width, this.height);
        }
    }
}

// Particle system for effects
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, 4, 4);
        ctx.restore();
    }
}

// Initialize game world
function initializeGame() {
    // Reset player
    player.x = 100;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.invincible = false;
    player.invincibleTime = 0;

    // Reset game state
    score = 0;
    lives = 3;
    coins = 0;
    camera.x = 0;
    camera.y = 0;

    // Clear arrays
    platforms = [];
    enemies = [];
    collectibles = [];
    particles = [];

    // Create platforms
    platforms.push(new Platform(0, 350, 800, 50, 'ground')); // Ground
    platforms.push(new Platform(200, 280, 100, 20, 'brick'));
    platforms.push(new Platform(350, 220, 100, 20, 'brick'));
    platforms.push(new Platform(500, 160, 100, 20, 'brick'));
    platforms.push(new Platform(700, 250, 150, 20, 'brick'));
    platforms.push(new Platform(900, 200, 100, 20, 'brick'));
    platforms.push(new Platform(1100, 300, 200, 20, 'brick'));

    // Create enemies
    enemies.push(new Enemy(300, 300, 'goomba'));
    enemies.push(new Enemy(450, 180, 'goomba'));
    enemies.push(new Enemy(750, 210, 'goomba'));
    enemies.push(new Enemy(950, 160, 'goomba'));
    enemies.push(new Enemy(1150, 260, 'goomba'));

    // Create collectibles
    collectibles.push(new Collectible(220, 250, 'coin'));
    collectibles.push(new Collectible(370, 190, 'coin'));
    collectibles.push(new Collectible(520, 130, 'coin'));
    collectibles.push(new Collectible(720, 220, 'coin'));
    collectibles.push(new Collectible(920, 170, 'coin'));
    collectibles.push(new Collectible(1120, 270, 'coin'));
    collectibles.push(new Collectible(400, 190, 'powerup'));

    updateUI();
}

// Player movement and physics
function updatePlayer() {
    // Handle input
    const speed = isRunning ? RUN_SPEED : MOVE_SPEED;
    
    if (keys['ArrowLeft'] || keys['a']) {
        player.vx = -speed;
        player.direction = -1;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.vx = speed;
        player.direction = 1;
    } else {
        player.vx *= FRICTION;
    }

    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        createParticles(player.x + player.width/2, player.y + player.height, '#FFFF99', 5);
    }

    // Apply physics
    player.x += player.vx;
    player.y += player.vy;
    player.vy += GRAVITY;

    // Reset ground check
    player.onGround = false;

    // Platform collision
    checkPlayerPlatformCollision();

    // Enemy collision
    checkPlayerEnemyCollision();

    // Collectible collision
    checkPlayerCollectibleCollision();

    // Update invincibility
    if (player.invincible) {
        player.invincibleTime--;
        if (player.invincibleTime <= 0) {
            player.invincible = false;
        }
    }

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.y > canvas.height) {
        loseLife();
    }

    // Update camera
    updateCamera();
}

function checkPlayerPlatformCollision() {
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Top collision (landing on platform)
            if (player.vy > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
            }
            // Bottom collision (hitting platform from below)
            else if (player.vy < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.vy = 0;
            }
            // Side collisions
            else if (player.vx > 0 && player.x < platform.x) {
                player.x = platform.x - player.width;
                player.vx = 0;
            }
            else if (player.vx < 0 && player.x > platform.x) {
                player.x = platform.x + platform.width;
                player.vx = 0;
            }
        }
    }
}

function checkPlayerEnemyCollision() {
    if (player.invincible) return;

    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Jump on enemy (from above)
            if (player.vy > 0 && player.y < enemy.y) {
                enemy.alive = false;
                player.vy = JUMP_FORCE * 0.7; // Bounce
                score += 100;
                createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FFFF00', 8);
                updateUI();
            } else {
                // Take damage
                loseLife();
            }
        }
    }
}

function checkPlayerCollectibleCollision() {
    for (let collectible of collectibles) {
        if (collectible.collected) continue;
        
        if (player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y) {
            
            collectible.collected = true;
            
            if (collectible.type === 'coin') {
                coins++;
                score += 50;
                createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, '#FFD700', 6);
            } else if (collectible.type === 'powerup') {
                score += 200;
                player.invincible = true;
                player.invincibleTime = 300; // 5 seconds at 60fps
                createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, '#FF69B4', 10);
            }
            
            updateUI();
        }
    }
}

function updateCamera() {
    // Follow player
    const targetX = player.x - canvas.width / 2;
    camera.x += (targetX - camera.x) * 0.1;
    
    // Keep camera in bounds
    if (camera.x < 0) camera.x = 0;
    if (camera.x > 1200 - canvas.width) camera.x = 1200 - canvas.width;
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * 6;
        const vy = (Math.random() - 0.5) * 6 - 2;
        particles.push(new Particle(x, y, vx, vy, color, 30));
    }
}

function loseLife() {
    if (player.invincible) return;
    
    lives--;
    player.invincible = true;
    player.invincibleTime = 120; // 2 seconds
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        player.x = 100;
        player.y = 200;
        player.vx = 0;
        player.vy = 0;
        camera.x = 0;
    }
    
    updateUI();
}

function gameOver() {
    gameRunning = false;
    alert(`Game Over! Final Score: ${score}`);
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('coins').textContent = coins;
}

// Drawing functions
function drawPlayer() {
    ctx.save();
    
    // Flicker when invincible
    if (player.invincible && Math.floor(player.invincibleTime / 5) % 2) {
        ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
    
    // Draw Mario hat
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x - camera.x + 4, player.y - camera.y - 4, player.width - 8, 8);
    
    // Draw eyes
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x - camera.x + 8, player.y - camera.y + 8, 3, 3);
    ctx.fillRect(player.x - camera.x + 21, player.y - camera.y + 8, 3, 3);
    
    // Draw mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x - camera.x + 10, player.y - camera.y + 16, 12, 4);
    
    ctx.restore();
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#87CEEB');
    gradient.addColorStop(0.7, '#32CD32');
    gradient.addColorStop(1, '#228B22');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    ctx.fillStyle = 'white';
    for (let i = 0; i < 5; i++) {
        const cloudX = (i * 250 + 100 - camera.x * 0.5) % (canvas.width + 100);
        drawCloud(cloudX, 50 + i * 20);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 15, 15, 0, Math.PI * 2);
    ctx.arc(x + 35, y - 15, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update game objects
    updatePlayer();
    
    for (let enemy of enemies) {
        enemy.update();
    }
    
    for (let collectible of collectibles) {
        collectible.update();
    }
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Draw everything
    for (let platform of platforms) {
        platform.draw();
    }
    
    for (let enemy of enemies) {
        enemy.draw();
    }
    
    for (let collectible of collectibles) {
        collectible.draw();
    }
    
    for (let particle of particles) {
        particle.draw();
    }
    
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    keys[e.key] = true;
    
    if (e.key === ' ') {
        isRunning = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key] = false;
    
    if (e.key === ' ') {
        isRunning = false;
    }
});

// Button event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        initializeGame();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (!gamePaused) gameLoop();
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    setTimeout(() => {
        gameRunning = true;
        initializeGame();
        gameLoop();
    }, 100);
});

// Mobile controls
document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = true;
});

document.getElementById('leftBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
});

document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = true;
});

document.getElementById('rightBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = false;
});

document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowUp'] = true;
});

document.getElementById('jumpBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowUp'] = false;
});

document.getElementById('runBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    isRunning = true;
});

document.getElementById('runBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    isRunning = false;
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Initialize the game when page loads
window.addEventListener('load', () => {
    initializeGame();
    updateUI();
});