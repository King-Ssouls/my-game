jest.mock('../models/Level', () => ({
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn()
}));

jest.mock('../services/levelRun.service', () => ({
    createRun: jest.fn()
}));

jest.mock('../cache/levels.cache', () => ({
    getCachedLevels: jest.fn(),
    setCachedLevels: jest.fn()
}));

const Level = require('../models/Level');
const levelRunService = require('../services/levelRun.service');
const { getCachedLevels, setCachedLevels } = require('../cache/levels.cache');
const levelService = require('../services/level.service');

function createLevel(overrides = {}) {
    return {
        _id: {
            toString: () => 'level-1-id'
        },
        number: 1,
        title: 'Level 1',
        slug: 'level-1',
        theme: 'forest',
        isPublished: true,
        minCompletionTimeMs: 8000,
        maxScore: 27500,
        previewBackground: '',
        ...overrides
    };
}

describe('сервис уровней', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('ensureDefaultLevels добавляет 10 стандартных уровней, если база пустая', async () => {
        Level.countDocuments.mockResolvedValue(0);
        Level.insertMany.mockResolvedValue([]);

        await levelService.ensureDefaultLevels();

        expect(Level.insertMany).toHaveBeenCalledTimes(1);
        const insertedLevels = Level.insertMany.mock.calls[0][0];

        expect(insertedLevels).toHaveLength(10);
        expect(insertedLevels[0]).toMatchObject({
            number: 1,
            theme: 'forest',
            isPublished: true
        });
        expect(insertedLevels[9]).toMatchObject({
            number: 10,
            theme: 'crystal',
            isPublished: true
        });
    });

    test('listPublishedLevels возвращает уровни из кэша без запроса списка из базы данных', async () => {
        const cachedLevels = [{ id: 'cached-level-1' }];

        Level.countDocuments.mockResolvedValue(1);
        getCachedLevels.mockReturnValue(cachedLevels);

        const result = await levelService.listPublishedLevels();

        expect(result).toBe(cachedLevels);
        expect(Level.find).not.toHaveBeenCalled();
        expect(setCachedLevels).not.toHaveBeenCalled();
    });

    test('listPublishedLevels загружает, форматирует и кэширует уровни, если кэш пустой', async () => {
        const levelDocument = createLevel({
            previewBackground: null
        });
        const sort = jest.fn().mockResolvedValue([levelDocument]);

        Level.countDocuments.mockResolvedValue(1);
        getCachedLevels.mockReturnValue(null);
        Level.find.mockReturnValue({ sort });

        const result = await levelService.listPublishedLevels();

        expect(Level.find).toHaveBeenCalledWith({ isPublished: true });
        expect(sort).toHaveBeenCalledWith({ number: 1 });
        expect(setCachedLevels).toHaveBeenCalledWith([
            {
                id: 'level-1-id',
                number: 1,
                title: 'Level 1',
                slug: 'level-1',
                theme: 'forest',
                isPublished: true,
                minCompletionTimeMs: 8000,
                maxScore: 27500,
                previewBackground: ''
            }
        ]);
        expect(result).toEqual([
            {
                id: 'level-1-id',
                number: 1,
                title: 'Level 1',
                slug: 'level-1',
                theme: 'forest',
                isPublished: true,
                minCompletionTimeMs: 8000,
                maxScore: 27500,
                previewBackground: ''
            }
        ]);
    });

    test('startLevelForUser выдаёт ошибку 403, если уровень не опубликован', async () => {
        Level.countDocuments.mockResolvedValue(1);
        Level.findOne.mockResolvedValue(
            createLevel({
                number: 2,
                title: 'Hidden Level',
                slug: 'hidden-level',
                isPublished: false
            })
        );

        await expect(
            levelService.startLevelForUser({
                userId: 'user-1',
                levelNumber: 2
            })
        ).rejects.toMatchObject({ status: 403 });

        expect(levelRunService.createRun).not.toHaveBeenCalled();
    });

    test('startLevelForUser возвращает информацию об уровне и данные запуска для опубликованного уровня', async () => {
        const level = createLevel();
        const startedAt = new Date('2026-04-27T10:00:00.000Z');
        const expiresAt = new Date('2026-04-27T10:10:00.000Z');

        Level.countDocuments.mockResolvedValue(1);
        Level.findOne.mockResolvedValue(level);
        levelRunService.createRun.mockResolvedValue({
            runToken: 'run-token-123',
            startedAt,
            expiresAt
        });

        const result = await levelService.startLevelForUser({
            userId: 'user-1',
            levelNumber: 1
        });

        expect(levelRunService.createRun).toHaveBeenCalledWith({
            userId: 'user-1',
            level
        });
        expect(result).toEqual({
            level: {
                id: 'level-1-id',
                number: 1,
                title: 'Level 1',
                slug: 'level-1',
                theme: 'forest',
                isPublished: true,
                minCompletionTimeMs: 8000,
                maxScore: 27500,
                previewBackground: ''
            },
            runToken: 'run-token-123',
            startedAt,
            expiresAt
        });
    });
});