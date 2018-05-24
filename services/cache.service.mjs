import redis from 'redis';

let instance = null;

export class CacheService {
    constructor() {
        if (!instance) {
            this.client = redis.createClient();
            instance = this;
        }

        return instance;
    }

    async setField(key, value, expire = 43200) {
        this.client.set(`${process.env.NODE_ENV}_${key}`, JSON.stringify(value), 'EX', expire);
    }

    async delField(key) {
        return await new Promise((resolve) => {
            this.client.del(`${process.env.NODE_ENV}_${key}`, (err, result) => {
                 return resolve(result);
            });
        });
    }

    async getField(key) {
        return await new Promise((resolve) => {
            this.client.get(`${process.env.NODE_ENV}_${key}`, (err, result) => {
                const originalResult = result;

                if (!result) {
                    return resolve(originalResult);
                }

                try {
                    if (typeof result === 'string') {
                        result = JSON.parse(result);
                        resolve(result);
                    }
                } catch (e) {
                    return resolve(originalResult);
                }
            });
        });
    }
}
