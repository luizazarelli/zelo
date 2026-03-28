import { compare, genSalt, hash } from 'bcrypt';
import { injectable } from 'tsyringe';

@injectable()
export class HashProviderImpl {
    async hash(text: string, cost = 12) {
        const salt = await genSalt(cost);
        return hash(text, salt);
    }

    async compare(text: string, hash: string) {
        return compare(text, hash);
    }
}
