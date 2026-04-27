process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, verifyAccessToken, bearerToken } = require('../utils/jwt');

describe('утилиты для пароля', () => {
    test('hashPassword хеширует пароль, а comparePassword подтверждает его', async () => {
        const password = 'Secret123';
        const hash = await hashPassword(password);

        expect(hash).not.toBe(password);
        expect(hash.startsWith('$2')).toBe(true);
        await expect(comparePassword(password, hash)).resolves.toBe(true);
    });

    test('hashPassword выдаёт ошибку, если пароль пустой', async () => {
        await expect(hashPassword('')).rejects.toThrow();
    });

    test('comparePassword возвращает false, если аргументы отсутствуют', async () => {
        await expect(comparePassword('', 'some-hash')).resolves.toBe(false);
        await expect(comparePassword('Secret123', '')).resolves.toBe(false);
        await expect(comparePassword('', '')).resolves.toBe(false);
    });
});

describe('утилиты для JWT', () => {
    test('signAccessToken и verifyAccessToken сохраняют данные payload', () => {
        const payload = {
            sub: 'user-1',
            email: 'player@example.com',
            role: 'player'
        };

        const token = signAccessToken(payload);
        const decoded = verifyAccessToken(token);

        expect(decoded).toMatchObject(payload);
        expect(typeof decoded.iat).toBe('number');
        expect(typeof decoded.exp).toBe('number');
    });

    test('bearerToken достаёт токен и игнорирует неправильные заголовки', () => {
        expect(bearerToken('Bearer   abc123   ')).toBe('abc123');
        expect(bearerToken('Basic abc123')).toBeNull();
        expect(bearerToken()).toBeNull();
    });
});