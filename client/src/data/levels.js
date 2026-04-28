import forestBackground from '../assets/images/backgrounds/forest.png';
import crystalBackground from '../assets/images/backgrounds/background 4.png';
import desertBackground1 from '../assets/images/backgrounds/pesir.png';
import desertBackground2 from '../assets/images/backgrounds/pesir2.png';
import desertBackground3 from '../assets/images/backgrounds/pesir3.png';
import templeBackground1 from '../assets/images/backgrounds/hram.png';
import templeBackground2 from '../assets/images/backgrounds/harm2.png';
import templeBackground3 from '../assets/images/backgrounds/hram3.png';
import templeBackground4 from '../assets/images/backgrounds/harm4.png';

import platformPreview1 from '../assets/images/ui/platform.png';
import platformPreview2 from '../assets/images/ui/platform2.png';
import platformPreview3 from '../assets/images/ui/platform3.png';
import platformPreview4 from '../assets/images/ui/platform4.png';
import platformPreview5 from '../assets/images/ui/platform5.png';
import platformPreview6 from '../assets/images/ui/platform6.png';
import platformPreview7 from '../assets/images/ui/platform7.png';

const WORLD_WIDTH = 2400;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const GROUND_Y = 704;

function row(startX, count, y, step = TILE_WIDTH) {
    const result = [];

    for (let index = 0; index < count; index += 1) {
        result.push({
            x: startX + index * step,
            y
        });
    }

    return result;
}

function ground(startX = 32, endX = WORLD_WIDTH - 64, y = GROUND_Y) {
    const result = [];

    for (let x = startX; x <= endX; x += TILE_WIDTH) {
        result.push({ x, y });
    }

    return result;
}

function column(x, baseY, count, step = TILE_HEIGHT) {
    const result = [];

    for (let index = 0; index < count; index += 1) {
        result.push({
            x,
            y: baseY - index * step
        });
    }

    return result;
}

function stairs(startX, startY, count, options = {}) {
    const {
        direction = 1,
        stepX = TILE_WIDTH,
        stepY = TILE_HEIGHT
    } = options;

    const result = [];

    for (let index = 0; index < count; index += 1) {
        result.push({
            x: startX + index * stepX * direction,
            y: startY - index * stepY
        });
    }

    return result;
}

function mergePlatforms(...groups) {
    return groups.flat();
}

function enemy(x, y, options = {}) {
    return {
        x,
        y,
        patrolDistance: options.patrolDistance ?? 110,
        speed: options.speed ?? 64,
        damage: options.damage ?? 1,
        maxHealth: options.maxHealth ?? 3
    };
}

function enemyOn(platformX, platformY, options = {}) {
    return enemy(platformX, platformY - 40, options);
}

function createSpikeRow(startX, count, y = 690, step = 32) {
    const result = [];

    for (let index = 0; index < count; index += 1) {
        result.push({
            x: startX + index * step,
            y
        });
    }

    return result;
}

function finishOn(x, platformY) {
    return {
        x,
        y: platformY - 14
    };
}

export const levels = [
    {
        number: 1,
        title: 'Сумеречная тропа',
        description: 'Мягкий старт с террасами и первой длинной дорожкой наверху',
        background: forestBackground,
        platformPreview: platformPreview1,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(320, 640, 4),
            row(576, 4, 544),
            row(928, 3, 608),
            stairs(1248, 608, 4),
            row(1600, 4, 512),
            row(1936, 3, 576)
        ),
        enemies: [
            enemyOn(704, 544),
            enemyOn(1696, 512, { speed: 68 }),
            enemyOn(2000, 576, { patrolDistance: 90 })
        ],
        traps: [
            ...createSpikeRow(1120, 3),
            ...createSpikeRow(1810, 3)
        ],
        finish: { x: 2260, y: 690 }
    },

    {
        number: 2,
        title: 'Мост шипов',
        description: 'Шипы перекрывают землю, а наверху враги не дают спокойно пройти',
        background: forestBackground,
        platformPreview: platformPreview2,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(256, 640, 5),
            column(576, 704, 6),
            row(672, 7, 544),
            column(1120, 704, 6),
            row(1216, 4, 608),
            row(1664, 4, 512),
            row(1984, 2, 448)
        ),
        enemies: [
            enemyOn(864, 544, { patrolDistance: 160 }),
            enemyOn(1312, 608, { speed: 70 }),
            enemyOn(1760, 512, { speed: 72 }),
            enemyOn(2016, 448, { maxHealth: 4, patrolDistance: 60 })
        ],
        traps: [
            ...createSpikeRow(640, 8),
            ...createSpikeRow(1260, 4),
            ...createSpikeRow(1860, 4)
        ],
        finish: finishOn(2080, 448)
    },

    {
        number: 3,
        title: 'Барханы первого ветра',
        description: 'Пустыня с длинным подвесным маршрутом и короткими спускам',
        background: desertBackground1,
        platformPreview: platformPreview3,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(384, 640, 3),
            row(704, 4, 576),
            stairs(1024, 608, 4),
            row(1344, 6, 512),
            stairs(1888, 544, 3),
            row(2112, 3, 480)
        ),
        enemies: [
            enemyOn(832, 576, { speed: 68 }),
            enemyOn(1536, 512, { patrolDistance: 160 }),
            enemyOn(2200, 480, { maxHealth: 4 })
        ],
        traps: [
            ...createSpikeRow(560, 4),
            ...createSpikeRow(1180, 4),
            ...createSpikeRow(1980, 4)
        ],
        finish: finishOn(2208, 480)
    },

    {
        number: 4,
        title: 'Оазис каменной стены',
        description: 'Большая стена и длинная крыша, но безопасных зон стало меньше',
        background: desertBackground2,
        platformPreview: platformPreview4,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(384, 640, 4),
            stairs(704, 640, 5),
            column(1024, 704, 8),
            row(1088, 8, 480),
            row(1792, 4, 576),
            row(2080, 2, 480)
        ),
        enemies: [
            enemyOn(832, 512),
            enemyOn(1344, 480, { patrolDistance: 210, speed: 72 }),
            enemyOn(1888, 576, { speed: 72 }),
            enemyOn(2112, 480, { maxHealth: 4, patrolDistance: 70 })
        ],
        traps: [
            ...createSpikeRow(640, 4),
            ...createSpikeRow(1560, 5),
            ...createSpikeRow(1984, 3)
        ],
        finish: finishOn(2112, 480)
    },

    {
        number: 5,
        title: 'Двойная башня',
        description: 'Мост между башнями уже не выглядит безопасным, а внизу почти нет права на ошибку',
        background: desertBackground3,
        platformPreview: platformPreview5,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(320, 640, 4),
            column(896, 704, 8),
            column(1472, 704, 8),
            row(960, 8, 480),
            row(1664, 4, 416),
            row(2112, 2, 352)
        ),
        enemies: [
            enemyOn(1184, 480, { patrolDistance: 220, speed: 72 }),
            enemyOn(1728, 416, { maxHealth: 4, speed: 74 }),
            enemyOn(2144, 352, { maxHealth: 4, patrolDistance: 70, speed: 76 }),
            enemyOn(2144, 704, { patrolDistance: 90, speed: 72 })
        ],
        traps: [
            ...createSpikeRow(760, 6),
            ...createSpikeRow(1350, 5),
            ...createSpikeRow(1900, 4)
        ],
        finish: finishOn(2176, 352)
    },

    {
        number: 6,
        title: 'Врата храма',
        description: 'Высокие ворота и верхний маршрут, где враги перекрывают почти каждую площадку',
        background: templeBackground1,
        platformPreview: platformPreview6,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(352, 640, 4),
            column(896, 704, 8),
            column(1472, 704, 8),
            row(960, 8, 480),
            stairs(1664, 544, 4),
            row(1920, 4, 448),
            row(2208, 2, 384)
        ),
        enemies: [
            enemyOn(1216, 480, { patrolDistance: 220, maxHealth: 4 }),
            enemyOn(1728, 448, { speed: 74, maxHealth: 4 }),
            enemyOn(2048, 448, { speed: 76, maxHealth: 4 }),
            enemyOn(2240, 384, { patrolDistance: 60, speed: 76 }),
            enemyOn(2200, 704, { speed: 72 })
        ],
        traps: [
            ...createSpikeRow(700, 3),
            ...createSpikeRow(1560, 4),
            ...createSpikeRow(1760, 3),
            ...createSpikeRow(2080, 3)
        ],
        finish: finishOn(2240, 384)
    },

    {
        number: 7,
        title: 'Алтарь колонн',
        description: 'Уровень на узкие башни и короткие переходы между ними',
        background: templeBackground2,
        platformPreview: platformPreview7,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(352, 640, 3),
            column(736, 704, 7),
            row(800, 2, 512),
            column(1120, 704, 9),
            row(1184, 2, 448),
            column(1536, 704, 8),
            row(1600, 3, 480),
            column(2048, 704, 10),
            row(2112, 3, 416)
        ),
        enemies: [
            enemyOn(1184, 448, { patrolDistance: 70, speed: 72 }),
            enemyOn(1664, 480, { patrolDistance: 100, maxHealth: 4 }),
            enemyOn(2176, 416, { patrolDistance: 110, maxHealth: 4 })
        ],
        traps: [
            ...createSpikeRow(880, 5),
            ...createSpikeRow(1320, 5),
            ...createSpikeRow(1760, 5)
        ],
        finish: finishOn(2176, 416)
    },

    {
        number: 8,
        title: 'Лунное святилище',
        description: 'Зигзаг стал уже, шипов больше, а наверху ждёт самый злой отрезок',
        background: templeBackground3,
        platformPreview: platformPreview1,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            row(320, 2, 608),
            row(608, 2, 544),
            row(928, 2, 480),
            row(1248, 2, 416),
            row(1584, 2, 352),
            row(1920, 2, 288),
            row(2176, 2, 224)
        ),
        enemies: [
            enemyOn(640, 544, { speed: 72 }),
            enemyOn(1280, 416, { maxHealth: 4, speed: 74 }),
            enemyOn(1952, 288, { patrolDistance: 90, speed: 76 }),
            enemyOn(2208, 224, { patrolDistance: 60, speed: 80, maxHealth: 5 })
        ],
        traps: [
            ...createSpikeRow(460, 4),
            ...createSpikeRow(780, 4),
            ...createSpikeRow(1110, 4),
            ...createSpikeRow(1450, 4),
            ...createSpikeRow(1790, 4)
        ],
        finish: finishOn(2240, 224)
    },

    {
        number: 9,
        title: 'Кристальный разлом',
        description: 'Большие полки закончились: теперь нужно сражаться и прыгать почти без запаса',
        background: crystalBackground,
        platformPreview: platformPreview2,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            stairs(384, 640, 4),
            row(704, 4, 544),
            column(1184, 704, 7),
            row(1248, 4, 512),
            stairs(1632, 544, 4),
            row(1920, 3, 448),
            row(2144, 2, 384)
        ),
        enemies: [
            enemyOn(864, 544, { patrolDistance: 150, maxHealth: 4, speed: 74 }),
            enemyOn(1408, 512, { patrolDistance: 170, speed: 76, maxHealth: 4 }),
            enemyOn(1984, 448, { patrolDistance: 90, speed: 78, maxHealth: 5 }),
            enemyOn(2176, 384, { patrolDistance: 70, speed: 80, maxHealth: 5 })
        ],
        traps: [
            ...createSpikeRow(620, 5),
            ...createSpikeRow(1080, 5),
            ...createSpikeRow(1540, 5),
            ...createSpikeRow(2050, 4)
        ],
        finish: finishOn(2176, 384)
    },

    {
        number: 10,
        title: 'Пантеон эха',
        description: 'Финальная и трудная карта: узкие ярусы, шипы под каждым срывом и сильные враги.',
        background: templeBackground4,
        platformPreview: platformPreview3,
        playerSpawn: { x: 120, y: 600 },
        platforms: mergePlatforms(
            ground(),
            row(320, 2, 608),
            row(576, 2, 544),
            row(832, 2, 480),
            row(1088, 2, 416),
            row(1360, 2, 352),
            row(1632, 2, 288),
            row(1888, 2, 352),
            row(2144, 2, 288),
            row(2272, 2, 224),
            column(960, 704, 5),
            column(1504, 704, 7),
            column(2016, 704, 6)
        ),
        enemies: [
            enemyOn(608, 544, { speed: 76, maxHealth: 4, patrolDistance: 60 }),
            enemyOn(1120, 416, { speed: 80, maxHealth: 5, patrolDistance: 70 }),
            enemyOn(1664, 288, { speed: 82, maxHealth: 5, patrolDistance: 60 }),
            enemyOn(1920, 352, { speed: 82, maxHealth: 5, patrolDistance: 60 }),
            enemyOn(2176, 288, { speed: 84, maxHealth: 6, patrolDistance: 60 }),
            enemyOn(2304, 224, { speed: 86, maxHealth: 6, patrolDistance: 40 })
        ],
        traps: [
            ...createSpikeRow(440, 3),
            ...createSpikeRow(700, 3),
            ...createSpikeRow(955, 3),
            ...createSpikeRow(1220, 3),
            ...createSpikeRow(1490, 3),
            ...createSpikeRow(1760, 3),
            ...createSpikeRow(2020, 3)
        ],
        finish: finishOn(2336, 224)
    }
];

export function getLevelByNumber(levelNumber) {
    return levels.find((level) => level.number === levelNumber) || levels[0];
}

export default levels;