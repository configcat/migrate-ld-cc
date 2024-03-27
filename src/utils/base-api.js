import NodeFetch from 'node-fetch';

export class BaseApi {
    fetch;
    HEADERS;

    constructor(fetch = NodeFetch) {
        this.fetch = fetch;
    }

    async gets(opts) {
        let { url, queryParams } = opts;

        if (queryParams) {
            url += `?${new URLSearchParams(queryParams).toString()}`;
        }

        const obj = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.HEADERS,
            },
        };

        const resp = await this.fetch(url, obj);
        const resTxt = await resp.text();

        if (!resp.ok) {
            console.dir(opts, { depth: null });
            throw new Error(
                this.processError({
                    status: resp.status,
                    statusText: resp.statusText,
                    msg: resTxt,
                })
            );
        }

        const parsedRes = JSON.parse(resTxt || '{}');
        return parsedRes;
    }

    async post(opts) {
        const { url, body } = opts;
        const obj = {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
                ...this.HEADERS,
            },
        };

        const resp = await this.fetch(url, obj);
        const resTxt = await resp.text();

        if (!resp.ok) {
            console.dir(opts, { depth: null });
            throw new Error(
                `
          Status: ${resp.status}
          statusText: ${resp.statusText}
          msg: ${resTxt}
        `
            );
        }

        const parsedRes = JSON.parse(resTxt || '{}');
        return parsedRes;
    }

    async delete(opts) {
        const { url } = opts;

        const obj = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...this.HEADERS,
            },
        };

        const resp = await this.fetch(url, obj);
        const resTxt = await resp.text();

        if (!resp.ok) {
            console.dir(opts, { depth: null });
            throw new Error(
                this.processError({
                    status: resp.status,
                    statusText: resp.statusText,
                    msg: resTxt,
                })
            );
        }
    }

    processError(obj) {
        return JSON.stringify(obj);
    }
}
