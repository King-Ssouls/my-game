import Phaser from 'phaser';

import playerIdleSheet from '../assets/images/characters/evil-wizard/idle.png';
import playerAttackSheet from '../assets/images/characters/evil-wizard/attack-1.png';
import playerDeathSheet from '../assets/images/characters/evil-wizard/death.png';
import playerFallSheet from '../assets/images/characters/evil-wizard/fall.png';
import playerJumpSheet from '../assets/images/characters/evil-wizard/jump.png';
import playerRunSheet from '../assets/images/characters/evil-wizard/run.png';
import playerHurtSheet from '../assets/images/characters/evil-wizard/take-hit.png';

import enemyWalkSheet from '../assets/images/enemies/monster-1/walk-right.png';
import enemyDeathSheet from '../assets/images/enemies/monster-1/death-right.png';
import enemyHurtSheet from '../assets/images/enemies/monster-1/hurt-right.png';

import Player from '../entities/Player.js';
import Finish from '../entities/Finish.js';
import SpikeTrap from '../entities/SpikeTrap.js';
import WalkingEnemy from '../entities/WalkingEnemy.js';

import WeaponSystem from '../systems/WeaponSystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import HealthSystem from '../systems/HealthSystem.js';

import HUD from '../ui/HUD.js';

import { getLevelByNumber } from '../data/levels.js';
import { createLevelTimer } from '../utils/timer.js';
import { addEnemyScore, calculateScore } from '../utils/score.js';
import { createPlayerAnimations } from '../animations/playerAnimations.js';
import { createEnemyAnimations } from '../animations/enemyAnimations.js';

const PLAYER_SOURCE_FRAME_WIDTH = 250;
const PLAYER_TRIM_FRAME = {
    x: 68,
    y: 40,
    width: 150,
    height: 132
};

const ENEMY_WALK_FRAME_WIDTHS = [308, 308, 308, 308, 308, 308, 308, 308, 308, 307];
const ENEMY_HURT_FRAME_WIDTHS = [249, 249];
const ENEMY_DEATH_FRAME_WIDTHS = [237, 237, 237, 237, 237, 237, 237, 237, 237, 237, 237, 237, 237, 240];
const CAMERA_ZOOM = 1.5;
const CAMERA_FOLLOW_OFFSET_Y = 42;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        this.worldWidth = 2400;
        this.worldHeight = 720;
        this.currentLevel = null;
        this.currentLevelBackgroundKey = null;
    }

    init(data) {
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

        this.pendingAttack = false;
        this.handleAttackKeyDown = null;
        this.handleWindowAttackKeyDown = null;
        this.handleCanvasPointerDown = null;

        this.deathPanel = null;
        this.deathBackdrop = null;
        this.resultBanner = null;

        this.levelNumber = data?.levelNumber || 1;
        this.currentLevel = getLevelByNumber(this.levelNumber);
        this.currentLevelBackgroundKey = `level-background-${this.currentLevel.number}`;
    }

    preload() {
        this.loadImageIfMissing('player-sheet', playerIdleSheet);
        this.loadImageIfMissing('player-run-sheet', playerRunSheet);
        this.loadImageIfMissing('player-jump-sheet', playerJumpSheet);
        this.loadImageIfMissing('player-fall-sheet', playerFallSheet);
        this.loadImageIfMissing('player-attack-sheet', playerAttackSheet);
        this.loadImageIfMissing('player-hurt-sheet', playerHurtSheet);
        this.loadImageIfMissing('player-death-sheet', playerDeathSheet);

        this.loadImageIfMissing('enemy-sheet', enemyWalkSheet);
        this.loadImageIfMissing('enemy-hurt-sheet', enemyHurtSheet);
        this.loadImageIfMissing('enemy-death-sheet', enemyDeathSheet);

        if (this.currentLevel?.background) {
            this.loadImageIfMissing(this.currentLevelBackgroundKey, this.currentLevel.background);
        }
    }

    create() {
        this.createTextures();
        this.definePlayerFrames();
        this.defineEnemyFrames();
        createPlayerAnimations(this);
        createEnemyAnimations(this);

        this.setupSceneLifecycle();

        this.cameras.main.setBackgroundColor('#7dd3fc');
        this.cameras.main.roundPixels = false;
        this.cameras.main.setZoom(CAMERA_ZOOM);

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.createBackground();
        this.createPlatforms();
        this.createControls();

        const playerSpawn = this.currentLevel?.playerSpawn || { x: 120, y: 600 };
        this.player = new Player(this, playerSpawn.x, playerSpawn.y);
        this.physics.add.collider(this.player, this.platforms);

        this.healthSystem = new HealthSystem(this);

        this.healthSystem.bind(this.player, {
            maxHealth: 5,
            invulnerabilityDuration: 900
        });

        this.weaponSystem = new WeaponSystem(this, this.player);

        this.createEnemies();
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

        this.cameras.main.startFollow(this.player, false, 0.18, 0.18, 0, CAMERA_FOLLOW_OFFSET_Y);
    }

    update() {
        if (!this.player?.active) {
            return;
        }

        if (!this.levelCompleted && !this.playerDead) {
            this.player.update(this.cursors, this.keys);

            if (this.pendingAttack) {
                this.pendingAttack = false;

                const strike = this.weaponSystem.attack();

                if (strike) {
                    this.combatSystem?.processAttackHitbox(strike);
                }
            }

            this.enemies.forEach((enemy) => {
                if (enemy?.active) {
                    enemy.update();
                }
            });
        }

        this.updateHud();
    }

    loadImageIfMissing(key, assetPath) {
        if (this.textures.exists(key)) {
            return;
        }

        this.load.image(key, assetPath);
    }

    definePlayerFrames() {
        this.addUniformFrames('player-sheet', 8, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-run-sheet', 8, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-jump-sheet', 2, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-fall-sheet', 2, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-attack-sheet', 8, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-hurt-sheet', 3, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
        this.addUniformFrames('player-death-sheet', 7, PLAYER_SOURCE_FRAME_WIDTH, PLAYER_TRIM_FRAME);
    }

    defineEnemyFrames() {
        this.addStripFrames('enemy-sheet', ENEMY_WALK_FRAME_WIDTHS, 201);
        this.addStripFrames('enemy-hurt-sheet', ENEMY_HURT_FRAME_WIDTHS, 476);
        this.addStripFrames('enemy-death-sheet', ENEMY_DEATH_FRAME_WIDTHS, 211);
    }

    addUniformFrames(textureKey, frameCount, sourceFrameWidth, crop) {
        const texture = this.textures.get(textureKey);

        if (!texture) {
            return;
        }

        for (let index = 0; index < frameCount; index += 1) {
            const frameName = String(index);

            if (!texture.has(frameName)) {
                texture.add(
                    frameName,
                    0,
                    index * sourceFrameWidth + crop.x,
                    crop.y,
                    crop.width,
                    crop.height
                );
            }
        }
    }

    addStripFrames(textureKey, frameWidths, frameHeight) {
        const texture = this.textures.get(textureKey);

        if (!texture) {
            return;
        }

        let x = 0;

        frameWidths.forEach((frameWidth, index) => {
            const frameName = String(index);

            if (!texture.has(frameName)) {
                texture.add(frameName, 0, x, 0, frameWidth, frameHeight);
            }

            x += frameWidth;
        });
    }

    setupSceneLifecycle() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    cleanup() {
        if (this.hud) {
            this.hud.destroy();
            this.hud = null;
        }

        if (this.keys?.F && this.handleAttackKeyDown) {
            this.keys.F.off('down', this.handleAttackKeyDown);
            this.handleAttackKeyDown = null;
        }

        if (typeof window !== 'undefined' && this.handleWindowAttackKeyDown) {
            window.removeEventListener('keydown', this.handleWindowAttackKeyDown, true);
            this.handleWindowAttackKeyDown = null;
        }

        if (this.game?.canvas && this.handleCanvasPointerDown) {
            this.game.canvas.removeEventListener('pointerdown', this.handleCanvasPointerDown);
            this.handleCanvasPointerDown = null;
        }

        this.closeDeathMenu();

        if (this.resultBanner) {
            this.resultBanner.destroy();
            this.resultBanner = null;
        }
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

        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.F
        ]);

        this.bindCanvasFocus();
        this.bindAttackHotkey();
    }

    bindCanvasFocus() {
        if (!this.game?.canvas) {
            return;
        }

        this.game.canvas.tabIndex = 0;
        this.game.canvas.style.outline = 'none';

        this.handleCanvasPointerDown = () => {
            this.restoreGameFocus();
        };

        this.game.canvas.addEventListener('pointerdown', this.handleCanvasPointerDown);
        this.restoreGameFocus();
    }

    bindAttackHotkey() {
        this.handleAttackKeyDown = () => {
            this.queueAttack();
        };

        this.keys.F.reset();
        this.keys.F.setEmitOnRepeat(false);
        this.keys.F.on('down', this.handleAttackKeyDown);

        this.handleWindowAttackKeyDown = (event) => {
            if (!this.isPhysicalAttackKey(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (event.repeat) {
                this.restoreGameFocus();
                return;
            }

            this.queueAttack();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleWindowAttackKeyDown, true);
        }
    }

    isPhysicalAttackKey(event) {
        if (!event) {
            return false;
        }

        const code = typeof event.code === 'string' ? event.code : '';
        const keyCode = typeof event.keyCode === 'number' ? event.keyCode : 0;

        return code === 'KeyF' || keyCode === Phaser.Input.Keyboard.KeyCodes.F;
    }

    queueAttack() {
        if (this.playerDead || this.levelCompleted) {
            return;
        }

        this.pendingAttack = true;
        this.restoreGameFocus();
    }

    restoreGameFocus() {
        if (this.game?.events) {
            this.game.events.off('blur', this.game.onBlur, this.game);
        }

        if (this.game?.loop?.focus) {
            this.game.loop.focus();
        }

        if (this.game) {
            this.game.hasFocus = true;
        }

        if (typeof window !== 'undefined') {
            window.onblur = null;
        }

        if (this.game?.canvas?.focus) {
            this.game.canvas.focus({ preventScroll: true });
        }
    }

    createBackground() {
        if (this.currentLevelBackgroundKey && this.textures.exists(this.currentLevelBackgroundKey)) {
            this.add
                .image(0, 0, this.currentLevelBackgroundKey)
                .setOrigin(0, 0)
                .setDisplaySize(this.worldWidth, this.worldHeight)
                .setDepth(-20);

            this.add
                .rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x0f172a, 0.1)
                .setDepth(-19);

            return;
        }

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

        const platformCoords = this.currentLevel?.platforms?.length
            ? this.currentLevel.platforms
            : [
                { x: 32, y: 704 },
                { x: 96, y: 704 },
                { x: 160, y: 704 },
                { x: 224, y: 704 },
                { x: 288, y: 704 },
                { x: 352, y: 704 },
                { x: 416, y: 704 },
                { x: 480, y: 704 },
                { x: 544, y: 704 },
                { x: 608, y: 704 },
                { x: 672, y: 704 },
                { x: 736, y: 704 },
                { x: 800, y: 704 },
                { x: 864, y: 704 },
                { x: 928, y: 704 },
                { x: 992, y: 704 },
                { x: 1056, y: 704 },
                { x: 1120, y: 704 },
                { x: 1184, y: 704 },
                { x: 1248, y: 704 },
                { x: 1312, y: 704 },
                { x: 1376, y: 704 },
                { x: 1440, y: 704 },
                { x: 1504, y: 704 },
                { x: 1568, y: 704 },
                { x: 1632, y: 704 },
                { x: 1696, y: 704 },
                { x: 1760, y: 704 },
                { x: 1824, y: 704 },
                { x: 1888, y: 704 },
                { x: 1952, y: 704 },
                { x: 2016, y: 704 },
                { x: 2080, y: 704 },
                { x: 2144, y: 704 },
                { x: 2208, y: 704 },
                { x: 2272, y: 704 },
                { x: 2336, y: 704 },
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
        const enemyConfigs = this.currentLevel?.enemies?.length
            ? this.currentLevel.enemies
            : [
                {
                    x: 640,
                    y: 420,
                    patrolDistance: 110,
                    speed: 64,
                    damage: 1,
                    maxHealth: 3
                },
                {
                    x: 1340,
                    y: 520,
                    patrolDistance: 120,
                    speed: 68,
                    damage: 1,
                    maxHealth: 3
                },
                {
                    x: 1840,
                    y: 410,
                    patrolDistance: 100,
                    speed: 72,
                    damage: 1,
                    maxHealth: 3
                }
            ];

        enemyConfigs.forEach((config) => {
            const enemy = new WalkingEnemy(this, config.x, config.y, config);
            this.enemies.push(enemy);
            this.physics.add.collider(enemy, this.platforms);

            this.healthSystem.bind(enemy, {
                maxHealth: config.maxHealth,
                invulnerabilityDuration: 350
            });
        });
    }

    createTraps() {
        const spikes = this.currentLevel?.traps?.length
            ? this.currentLevel.traps
            : [
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
        const finishPosition = this.currentLevel?.finish || { x: 2260, y: 690 };
        this.finish = new Finish(this, finishPosition.x, finishPosition.y);
    }

    handleEnemyKilled(enemy) {
        if (enemy._scoreApplied) {
            return;
        }

        enemy._scoreApplied = true;
        this.enemiesDefeated += 1;
        this.score = addEnemyScore(this.score);

        this.hud?.setStatus('Враг повержен');
        this.updateHud();
    }

    handlePlayerDamaged() {
        if (this.playerDead || this.levelCompleted) {
            return;
        }

        this.hitsTaken += 1;
        this.cameras.main.shake(18, 0.00045);
        this.updateHud();
    }

    handlePlayerDeath() {
        if (this.playerDead) {
            return;
        }

        this.playerDead = true;
        this.player.lock();

        this.hud?.setStatus('Вы погибли');
        this.updateHud();
        this.showDeathMenu();
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

        this.hud?.setStatus('Уровень пройден');

        this.showVictoryMenu();
    }

    updateHud() {
        if (!this.hud || !this.player) {
            return;
        }

        this.hud.setHealth(this.player.health, this.player.maxHealth);
        this.hud.setScore(this.score);
        this.hud.setTime(this.levelTimer ? this.levelTimer.getFormatted() : '00:00');
    }

    showDeathMenu() {
        if (this.deathBackdrop) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '16px';
        overlay.style.background = 'rgba(2, 6, 23, 0.68)';
        overlay.style.zIndex = '2600';
        overlay.style.boxSizing = 'border-box';

        const panel = document.createElement('div');
        panel.style.width = '420px';
        panel.style.maxWidth = '100%';
        panel.style.padding = '24px';
        panel.style.borderRadius = '20px';
        panel.style.background = 'rgba(15, 23, 42, 0.96)';
        panel.style.border = '1px solid rgba(226, 232, 240, 0.2)';
        panel.style.boxShadow = '0 18px 50px rgba(0, 0, 0, 0.38)';
        panel.style.boxSizing = 'border-box';
        panel.style.textAlign = 'center';
        panel.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('div');
        title.textContent = 'Вы погибли';
        title.style.color = '#ffffff';
        title.style.fontFamily = '"Press Start 2P", Arial, sans-serif';
        title.style.fontSize = '14px';
        title.style.lineHeight = '1.7';
        title.style.marginBottom = '18px';

        const subtitle = document.createElement('div');
        subtitle.textContent = 'Выберите действие';
        subtitle.style.color = '#cbd5e1';
        subtitle.style.fontSize = '18px';
        subtitle.style.lineHeight = '1.4';
        subtitle.style.marginBottom = '24px';

        const buttonWrap = document.createElement('div');
        buttonWrap.style.display = 'grid';
        buttonWrap.style.gap = '14px';

        const restartButton = this.createDeathButton('Начать заново', '#9702A7', () => {
            this.restartLevel();
        });

        const menuButton = this.createDeathButton('В главное меню', '#9702A7', () => {
            this.returnToMenu();
        });

        buttonWrap.appendChild(restartButton);
        buttonWrap.appendChild(menuButton);

        panel.appendChild(title);
        panel.appendChild(subtitle);
        panel.appendChild(buttonWrap);
        overlay.appendChild(panel);

        document.body.appendChild(overlay);

        this.deathPanel = panel;
        this.deathBackdrop = overlay;
    }

    showVictoryMenu() {
        if (this.deathBackdrop) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '16px';
        overlay.style.background = 'rgba(2, 6, 23, 0.68)';
        overlay.style.zIndex = '2600';
        overlay.style.boxSizing = 'border-box';

        const panel = document.createElement('div');
        panel.style.width = '440px';
        panel.style.maxWidth = '100%';
        panel.style.padding = '24px';
        panel.style.borderRadius = '20px';
        panel.style.background = 'rgba(15, 23, 42, 0.96)';
        panel.style.border = '1px solid rgba(226, 232, 240, 0.2)';
        panel.style.boxShadow = '0 18px 50px rgba(0, 0, 0, 0.38)';
        panel.style.boxSizing = 'border-box';
        panel.style.textAlign = 'center';
        panel.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('div');
        title.textContent = 'Уровень пройден';
        title.style.color = '#ffffff';
        title.style.fontFamily = '"Press Start 2P", Arial, sans-serif';
        title.style.fontSize = '14px';
        title.style.lineHeight = '1.7';
        title.style.marginBottom = '16px';

        const subtitle = document.createElement('div');
        subtitle.textContent = 'Вы прошли уровень';
        subtitle.style.color = '#cbd5e1';
        subtitle.style.fontSize = '18px';
        subtitle.style.lineHeight = '1.4';
        subtitle.style.marginBottom = '18px';

        const score = document.createElement('div');
        score.textContent = `Очки: ${this.score}`;
        score.style.color = '#f8fafc';
        score.style.fontSize = '28px';
        score.style.fontWeight = '700';
        score.style.marginBottom = '24px';

        const buttonWrap = document.createElement('div');
        buttonWrap.style.display = 'grid';
        buttonWrap.style.gap = '14px';

        const restartButton = this.createDeathButton('Начать заново', '#9702A7', () => {
            this.restartLevel();
        });

        const menuButton = this.createDeathButton('В главное меню', '#9702A7', () => {
            this.returnToMenu();
        });

        buttonWrap.appendChild(restartButton);
        buttonWrap.appendChild(menuButton);

        panel.appendChild(title);
        panel.appendChild(subtitle);
        panel.appendChild(score);
        panel.appendChild(buttonWrap);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        this.deathPanel = panel;
        this.deathBackdrop = overlay;
    }

    createDeathButton(label, background, onClick) {

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.style.width = '100%';
        button.style.padding = '14px 16px';
        button.style.border = 'none';
        button.style.borderRadius = '14px';
        button.style.background = background;
        button.style.color = '#ffffff';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.fontSize = '18px';
        button.style.fontWeight = '700';
        button.style.lineHeight = '1.2';
        button.style.minHeight = '54px';

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            window.requestAnimationFrame(() => {
                onClick();
            });
        });

        return button;
    }

    closeDeathMenu() {
        if (this.deathBackdrop) {
            this.deathBackdrop.remove();
            this.deathBackdrop = null;
        }

        this.deathPanel = null;
    }

    restartLevel() {
        this.input.keyboard?.resetKeys();
        this.closeDeathMenu();
        this.scene.restart({
            levelNumber: this.levelNumber
        });
    }

    returnToMenu() {
        this.input.keyboard?.resetKeys();
        this.closeDeathMenu();
        this.scene.start('MenuScene');
    }

    showResultBanner(text) {
        if (this.resultBanner) {
            this.resultBanner.destroy();
        }

        this.resultBanner = this.add
            .text(this.cameras.main.width / 2, 220, text, {
                fontFamily: 'Arial',
                fontSize: '42px',
                color: '#ffffff',
                backgroundColor: '#0f172a',
                padding: { x: 18, y: 12 }
            })
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setDepth(180);
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

        if (this.textures.exists('finish')) {
            this.textures.remove('finish');
        }

        const finishGraphics = this.add.graphics();
        finishGraphics.fillStyle(0xe5e7eb, 1);
        finishGraphics.fillRect(2, 0, 8, 64);

        finishGraphics.fillStyle(0x000000, 1);
        finishGraphics.fillRect(10, 0, 10, 12);
        finishGraphics.fillStyle(0xffffff, 1);
        finishGraphics.fillRect(20, 0, 10, 12);

        finishGraphics.fillStyle(0xffffff, 1);
        finishGraphics.fillRect(10, 12, 10, 12);
        finishGraphics.fillStyle(0x000000, 1);
        finishGraphics.fillRect(20, 12, 10, 12);

        finishGraphics.fillStyle(0x000000, 1);
        finishGraphics.fillRect(10, 24, 10, 12);
        finishGraphics.fillStyle(0xffffff, 1);
        finishGraphics.fillRect(20, 24, 10, 12);

        finishGraphics.fillStyle(0xffffff, 1);
        finishGraphics.fillRect(10, 36, 10, 12);
        finishGraphics.fillStyle(0x000000, 1);
        finishGraphics.fillRect(20, 36, 10, 12);

        finishGraphics.generateTexture('finish', 32, 64);
        finishGraphics.destroy();

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
            graphics.fillPath()
            graphics.generateTexture('spike', 32, 24);
            graphics.destroy();
        }
    }
}
