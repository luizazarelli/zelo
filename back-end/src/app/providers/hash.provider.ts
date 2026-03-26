import { compare, genSalt, hash } from 'bcrypt';

export class HashProvider {
    async hash(text: string, cost = 15) {
        const salt = await genSalt(cost);
        return hash(text, salt);
    }

    async compare(text: string, hash: string) {
        return compare(text, hash);
    }
}
