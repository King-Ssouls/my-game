import Phaser from 'phaser';

import Player from '../entities/Player.js';
import Finish from '../entities/Finish.js';
import SpikeTrap from '../entities/SpikeTrap.js';
import WalkingEnemy from '../entities/WalkingEnemy.js';

import WeaponSystem from '../systems/WeaponSystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import HealthSystem from '../systems/HealthSystem.js';

import HUD from '../ui/HUD.js';

import { createLevelTimer } from '../utils/timer.js';
import { addEnemyScore, calculateScore } from '../utils/score.js';

import { createPlayerAnimations } from '../animations/playerAnimations.js';
import { createEnemyAnimations } from '../animations/enemyAnimations.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.player = null;
        this.platforms = null;
        this.finish = null;
        this.enemies = [];
        this.traps = [];

        this.healthSystem = null;
        this.weaponSystem = null;
        this.combatSystem = null;

        this.hud = null;
        this.levelTimer = null;

        this.cursors = null;
        this.keys = null;

        this.score = 0;
        this.enemiesDefeated = 0;
        this.hitsTaken = 0;
        this.levelCompleted = false;
        this.playerDead = false;

        this.worldWidth = 2400;
        this.worldHeight = 720;
    }

    create() {
        this.createTextures();
        createPlayerAnimations(this);
        createEnemyAnimations(this);

        this.cameras.main.setBackgroundColor('#7dd3fc');
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.createBackground();
        this.createPlatforms();
        this.createControls();

        this.player = new Player(this, 120, 600);
        this.physics.add.collider(this.player, this.platforms);

        this.healthSystem = new HealthSystem(this);
        this.healthSystem.bind(this.player, {
            maxHealth: 5,
            invulnerabilityDuration: 1000,
            onDamage: () => this.handlePlayerDamaged(),
            onDeath: () => this.handlePlayerDeath()
        });

        this.weaponSystem = new WeaponSystem(this, this.player);

        this.createEnemies  ();
        this.createTraps();
        this.createFinish();

        this.combatSystem = new CombatSystem(this, {
            player: this.player,
            enemies: this.enemies,
            traps: this.traps,
            finish: this.finish,
            weaponSystem: this.weaponSystem,
            healthSystem: this.healthSystem,
            onPlayerDamaged: () => this.handlePlayerDamaged(),
            onPlayerDeath: () => this.handlePlayerDeath(),
            onEnemyKilled: (enemy) => this.handleEnemyKilled(enemy),
            onLevelComplete: () => this.handleLevelComplete()
        });

        this.hud = new HUD(this);
        this.levelTimer = createLevelTimer(this);

        this.updateHud();

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    update() {
        if (!this.player || !this.player.active) {
            return;
        }

        if (!this.levelCompleted && !this.playerDead) {
            this.player.update(this.cursors, this.keys);

        if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
            this.weaponSystem.attack();
        }

        this.enemies.forEach((enemy) => {
            if (enemy && enemy.active) {
                enemy.update();
            }
        });
        }

        this.updateHud();
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({   
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    createBackground() {
        this.add.rectangle(this.worldWidth / 2, 140, this.worldWidth, 280, 0x8be9fd).setScrollFactor(0.2);
        this.add.rectangle(this.worldWidth / 2, 380, this.worldWidth, 320, 0x93c5fd).setScrollFactor(0.35);

        for (let i = 0; i < 7; i += 1) {
            const x = 220 + i * 340;
            this.add.rectangle(x, 530, 220, 120, 0x64748b, 0.35).setScrollFactor(0.55);
            this.add.rectangle(x + 120, 490, 180, 90, 0x475569, 0.4).setScrollFactor(0.55);
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        for (let x = 32; x < this.worldWidth; x += 64) {
            this.platforms.create(x, 704, 'ground');
        }

        const platformCoords = [
            { x: 340, y: 600 },
            { x: 520, y: 520 },
            { x: 760, y: 460 },
            { x: 980, y: 610 },
            { x: 1260, y: 560 },
            { x: 1480, y: 500 },
            { x: 1710, y: 450 },
            { x: 1980, y: 560 }
        ];

        platformCoords.forEach((item) => {
            this.platforms.create(item.x, item.y, 'ground');
        });
    }

    createEnemies() {
        const enemyConfigs = [
            {
                x: 640,
                y: 420,
                patrolDistance: 110,
                speed: 58 
            },
            {
                x: 1340,
                y: 520,
                patrolDistance: 120,
                speed: 68 
            },
            {
                x: 1840,
                y: 410,
                patrolDistance: 100,
                speed: 72 
            }
        ];

        enemyConfigs.forEach((config) => {
            const enemy = new WalkingEnemy(this, config.x, config.y, config);
            this.enemies.push(enemy);

            this.physics.add.collider(enemy, this.platforms);

            this.healthSystem.bind(enemy, {
                maxHealth: 2,
                invulnerabilityDuration: 150,
                onDeath: () => enemy.onDeath()
            });
        });
    }

    createTraps() {
        const spikes = [
            { x: 880, y: 690 },
            { x: 910, y: 690 },
            { x: 940, y: 690 },
            { x: 1580, y: 690 },
            { x: 1610, y: 690 },
            { x: 1640, y: 690 }
        ];

        spikes.forEach((item) => {
            const trap = new SpikeTrap(this, item.x, item.y);
            this.traps.push(trap);
        });
    }

    createFinish() {
        this.finish = new Finish(this, 2260, 690);
    }

    handleEnemyKilled(enemy) {
        if (enemy._scoreApplied) {
            return;
        }

        enemy._scoreApplied = true;
        this.enemiesDefeated += 1;
        this.score = addEnemyScore(this.score);
        this.hud.setStatus('Враг повержен');
        this.updateHud();
    }

    handlePlayerDamaged() {
        if (this.playerDead || this.levelCompleted) {
        return;
        }

        this.hitsTaken += 1;
        this.cameras.main.shake(120, 0.004);
        this.updateHud();
    }

    handlePlayerDeath() {
        if (this.playerDead) {
            return;
        }

        this.playerDead = true;
        this.hud.setStatus('Вы погибли');
        this.updateHud();

        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    }

    handleLevelComplete() {
        if (this.levelCompleted || this.playerDead) {
            return;
        }

        this.levelCompleted = true;
        this.player.lock();

        const finalScore = calculateScore({
            elapsedMs: this.levelTimer.getMs(),
            enemiesDefeated: this.enemiesDefeated,
            hitsTaken: this.hitsTaken,
            levelCompleted: true
        });

        this.score = finalScore;
        this.updateHud();
        this.hud.setStatus('Уровень пройден');

        this.add
        .text(this.cameras.main.midPoint.x, 220, 'Уровень пройден', {
            fontFamily: 'Arial',
            fontSize: '42px',
            color: '#ffffff',
            backgroundColor: '#0f172a',
            padding: { x: 18, y: 12 }
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(100);

        this.time.delayedCall(3600, () => {
        if (this.scene.get('MenuScene')) {
            this.scene.start('MenuScene');
        } else {
            this.scene.restart();
        }
        });
    }

    updateHud() {
        if (!this.hud || !this.player) {
            return;
        }

        this.hud.setHealth(this.player.health, this.player.maxHealth);
        this.hud.setScore(this.score);
        this.hud.setTime(this.levelTimer ? this.levelTimer.getFormatted() : '00:00');
    }

    createTextures() {
        if (!this.textures.exists('ground')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x7c5a35, 1);
            graphics.fillRect(0, 0, 64, 32);
            graphics.fillStyle(0x6b4f2b, 1);
            graphics.fillRect(0, 0, 64, 8);
            graphics.lineStyle(2, 0x3b2f1c, 0.45);
            graphics.strokeRect(0, 0, 64, 32);
            graphics.generateTexture('ground', 64, 32);
            graphics.destroy();
        }

        if (!this.textures.exists('finish')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xe5e7eb, 1);
            graphics.fillRect(2, 0, 8, 64);
            graphics.fillStyle(0x0f172a, 1);
            graphics.fillRect(10, 0, 20, 12);
            graphics.fillStyle(0x22d3ee, 1);
            graphics.fillRect(10, 12, 20, 12);
            graphics.fillStyle(0x0f172a, 1);
            graphics.fillRect(10, 24, 20, 12);
            graphics.fillStyle(0x22d3ee, 1);
            graphics.fillRect(10, 36, 20, 12);
            graphics.generateTexture('finish', 32, 64);
            graphics.destroy();
        }

        if (!this.textures.exists('spike')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x475569, 1);
            graphics.beginPath();
            graphics.moveTo(0, 24);
            graphics.lineTo(8, 4);
            graphics.lineTo(16, 24);
            graphics.lineTo(24, 4);
            graphics.lineTo(32, 24);
            graphics.lineTo(0, 24);
            graphics.closePath();
            graphics.fillPath();
            graphics.generateTexture('spike', 32, 24);
            graphics.destroy();
        }

        if (!this.textures.exists('player-sheet')) {
            const texture = this.textures.createCanvas('player-sheet', 192, 48);
            const ctx = texture.context;
            const frameWidth = 32;
            const frameHeight = 48;

            const drawPlayerFrame = (frameIndex, options = {}) => {
                const x = frameIndex * frameWidth;
                const bodyColor = options.bodyColor || '#2563eb';
                const legLeftX = options.legLeftX ?? 9;
                const legRightX = options.legRightX ?? 18;
                const armY = options.armY ?? 17;
                const staff = options.staff || false;
                const faceColor = options.faceColor || '#f8fafc';

                ctx.clearRect(x, 0, frameWidth, frameHeight);
                ctx.fillStyle = bodyColor;
                ctx.fillRect(x + 10, 12, 12, 18);
                ctx.fillRect(x + legLeftX, 30, 5, 14);
                ctx.fillRect(x + legRightX, 30, 5, 14);
                ctx.fillRect(x + 7, armY, 18, 4);

                ctx.fillStyle = faceColor;
                ctx.fillRect(x + 10, 2, 12, 12);

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(x + 13, 6, 2, 2);
                ctx.fillRect(x + 18, 6, 2, 2);

                if (staff) {
                    ctx.fillStyle = '#d97706';
                    ctx.fillRect(x + 22, 10, 7, 26);  
                }
        };

        drawPlayerFrame(0, {});
        drawPlayerFrame(1, 
            { 
                legLeftX: 7,
                legRightX: 20 
            });
        drawPlayerFrame(2, 
            {
                legLeftX: 11,
                legRightX: 16 
            });
        drawPlayerFrame(3,
            {
                armY: 12 
            });
        drawPlayerFrame(4, 
            { 
                bodyColor: '#1d4ed8', 
                staff: true, 
                armY: 15 
            });
        drawPlayerFrame(5, 
            { 
                bodyColor: '#ef4444', 
                faceColor: '#fee2e2', 
                armY: 20 
            });

        for (let i = 0; i < 6; i += 1) {
            texture.add(String(i), 0, i * frameWidth, 0, frameWidth, frameHeight);
        }
        texture.refresh();
        }

        if (!this.textures.exists('enemy-sheet')) {

            const texture = this.textures.createCanvas('enemy-sheet', 128, 32);
            const ctx = texture.context;
            const frameWidth = 32;
            const drawEnemyFrame = (frameIndex, options = {}) => {
                const x = frameIndex * frameWidth;
                const color = options.color || '#16a34a';
                const eyeColor = options.eyeColor || '#ffffff';
                const armOffset = options.armOffset ?? 0;

                ctx.clearRect(x, 0, frameWidth, 32);
                ctx.fillStyle = color;
                ctx.fillRect(x + 6, 8, 20, 18);
                ctx.fillRect(x + 8, 26, 5, 4);
                ctx.fillRect(x + 19, 26, 5, 4);
                ctx.fillRect(x + 3 + armOffset, 14, 5, 4);
                ctx.fillRect(x + 24 - armOffset, 14, 5, 4);

                ctx.fillStyle = eyeColor;
                ctx.fillRect(x + 11, 13, 3, 3);
                ctx.fillRect(x + 18, 13, 3, 3);
            };

            drawEnemyFrame(0, {});
            drawEnemyFrame(1, { armOffset: 2 });
            drawEnemyFrame(2, { color: '#f59e0b' });
            drawEnemyFrame(3, { color: '#ef4444', eyeColor: '#fee2e2' });

            for (let i = 0; i < 4; i += 1) {
                texture.add(String(i), 0, i * frameWidth, 0, frameWidth, 32);
            }

            texture.refresh();
        }
    }
}