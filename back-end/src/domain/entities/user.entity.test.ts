import { describe, it, expect } from 'vitest'
import UserEntity from './user.entity'

describe('UserEntity — testes de unidade', () => {
    it('deve criar um usuário com id gerado automaticamente', () => {
        const user = UserEntity.create({
            name: 'Ana Silva',
            email: 'ana@uel.br',
            phone: '43999999999',
            password: 'hash_senha',
        })

        expect(user.props.id).toBeDefined()
        expect(user.props.name).toBe('Ana Silva')
        expect(user.props.email).toBe('ana@uel.br')
        expect(user.props.createdAt).toBeInstanceOf(Date)
    })

    it('deve criar dois usuários com ids diferentes', () => {
        const user1 = UserEntity.create({ name: 'A', email: 'a@a.com', phone: '1', password: 'p' })
        const user2 = UserEntity.create({ name: 'B', email: 'b@b.com', phone: '2', password: 'p' })

        expect(user1.props.id).not.toBe(user2.props.id)
    })

    it('deve restaurar um usuário a partir de dados persistidos', () => {
        const now = new Date()
        const user = UserEntity.restore({
            id: 'user-123',
            name: 'Carlos',
            email: 'carlos@email.com',
            phone: '43988887777',
            password: 'hashed',
            createdAt: now,
            updatedAt: now,
        })

        expect(user.props.id).toBe('user-123')
        expect(user.props.name).toBe('Carlos')
    })
})
