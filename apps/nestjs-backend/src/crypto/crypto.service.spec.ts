import {Test, TestingModule} from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {CryptoService} from './crypto.service';

// Mock bcrypt methods directly with jest
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  describe('hash', () => {
    it('should generate a salt and hash the value', async () => {
      const valueToHash = 'password123';
      const mockSalt = 'generated-salt';
      const mockHashedValue = 'hashed-password';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedValue);

      const result = await service.hash(valueToHash);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(valueToHash, mockSalt);
      expect(result).toBe(mockHashedValue);
    });
  });

  describe('compare', () => {
    it('should correctly compare a value with a hashed value', async () => {
      const value = 'password123';
      const hashedValue = 'hashed-password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(value, hashedValue);

      expect(bcrypt.compare).toHaveBeenCalledWith(value, hashedValue);
      expect(result).toBe(true);
    });

    it('should return false when values do not match', async () => {
      const value = 'wrong-password';
      const hashedValue = 'hashed-password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(value, hashedValue);

      expect(bcrypt.compare).toHaveBeenCalledWith(value, hashedValue);
      expect(result).toBe(false);
    });
  });

  describe('generateRandomCode', () => {
    it('should generate a random numeric code of default length (6)', () => {
      // Mock Math.random to have deterministic tests
      const mockMathRandom = jest.spyOn(Math, 'random');
      mockMathRandom
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.6);

      const result = service.generateRandomCode();

      expect(result).toHaveLength(6);
      expect(result).toMatch(/^\d{6}$/);
      expect(result).toBe('123456');

      mockMathRandom.mockRestore();
    });

    it('should generate a random numeric code of specified length', () => {
      // Mock Math.random to have deterministic tests
      const mockMathRandom = jest.spyOn(Math, 'random');
      mockMathRandom
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.6);

      const result = service.generateRandomCode(4);

      expect(result).toHaveLength(4);
      expect(result).toMatch(/^\d{4}$/);
      expect(result).toBe('9876');

      mockMathRandom.mockRestore();
    });
  });
});
