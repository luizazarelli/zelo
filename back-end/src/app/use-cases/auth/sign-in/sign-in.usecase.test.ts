import { IUserRepository } from '@domain/repositories/user.repository';
import { beforeEach, it } from 'node:test';
import { test, vi } from 'vitest';
import { SignInUsecase } from './sign-in.usecase';

const mockUserRepo = {
    findByEmail: vi.fn(),
} as unknown as IUserRepository;

test('SignInUsecase', () => {
    let useCase: SignInUsecase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new SignInUsecase(mockUserRepo);
    });

    it('should throw if the password is wrong', async () => {});
});
