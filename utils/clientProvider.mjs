import request from 'request';

export class ClientProvider {
    static async getChannelUsers(channel) {
        try {
            return await new Promise((resolve, reject) => {
                request.get(`http://localhost:8011?channel=${channel}`, {}, (err, response, body) => {
                    if (err) {
                        resolve([]);
                    } else {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            resolve([]);
                        }
                    };
                });
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    static async joinToChannel(channel) {
        try {
            return await new Promise((resolve, reject) => {
                request.post(`http://localhost:8011?channel=${channel}`, {}, (err, response, body) => {
                    if (err) {
                        resolve({
                            result: false,
                        });
                    } else {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            resolve({
                                result: false,
                            });
                        }
                    };
                });
            });
        } catch (e) {
            console.error(e);
            return {
                result: false,
            };
        }
    }
}
