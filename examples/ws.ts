import setInterval, { clearPromiseInterval } from './setInterval';

import { WebSocket } from "ws";

export interface Entity {
    fun: string;
    data: string;
}

class Client {
    #ws?: WebSocket;

    static #instance: Client;

    state: 'NONE' | 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR' = 'NONE';

    pingIntervalId: number | null = null;

    private constructor(cb: (data: Entity) => void) {
        this.state = 'CONNECTING';
        try {
            this.#ws = new WebSocket('ws://106.15.251.204:8502');
            this.#ws.onopen = () => {
                this.state = 'OPEN';
                if (this.pingIntervalId !== null && this.pingIntervalId !== undefined) {
                    clearPromiseInterval(this.pingIntervalId);
                }
                this.pingIntervalId = setInterval(
                    async () => this.state === 'OPEN' && this.#ws?.send(JSON.stringify('PING')),
                    () => 10000
                );
            };
            this.#ws.onerror = (_) => {
                this.state =
                    this.#ws?.readyState === 2 ? 'CLOSING' : this.#ws?.readyState === 3 ? 'CLOSED' : 'ERROR';
            };
            this.#ws.onclose = (_) => {
                this.state =
                    this.#ws?.readyState === 2 ? 'CLOSING' : this.#ws?.readyState === 3 ? 'CLOSED' : 'ERROR';
            };
            this.#ws.onmessage = (ctx) => {
                if (ctx.data !== 'PING') cb(JSON.parse(ctx.data.toString()));
            };
            setInterval(
                async () => {
                    if (this.state === 'ERROR' || this.state === 'CLOSED' || this.state === 'CLOSING') {
                        this.#ws && this.#ws.close();
                        this.#ws && (this.#ws = undefined);
                        this.#ws = new WebSocket('ws://106.15.251.204:8502');
                        this.#ws.onopen = () => {
                            this.state = 'OPEN';
                            if (this.pingIntervalId !== null && this.pingIntervalId !== undefined) {
                                clearPromiseInterval(this.pingIntervalId);
                            }
                            this.pingIntervalId = setInterval(
                                async () => this.state === 'OPEN' && this.#ws?.send(JSON.stringify('PING')),
                                () => 10000
                            );
                        };
                        this.#ws.onerror = (_) => {
                            this.state =
                                this.#ws?.readyState === 2
                                    ? 'CLOSING'
                                    : this.#ws?.readyState === 3
                                        ? 'CLOSED'
                                        : 'ERROR';
                        };
                        this.#ws.onclose = (_) => {
                            this.state =
                                this.#ws?.readyState === 2
                                    ? 'CLOSING'
                                    : this.#ws?.readyState === 3
                                        ? 'CLOSED'
                                        : 'ERROR';
                        };
                        this.#ws.onmessage = (ctx) => {
                            if (ctx.data !== 'PING') cb(JSON.parse(ctx.data.toString()));
                        };
                    }
                },
                () => 20000
            );
        } catch (error) {
            this.state = 'ERROR';
        }
    }

    static getInstance(cb: (data: Entity) => void) {
        if (!Client.#instance) Client.#instance = new Client(cb);
        return Client.#instance;
    }

    send(data: Entity) {
        if (this.state === 'OPEN') this.#ws?.send(JSON.stringify(data));
        else throw `WebSocket: ${this.state}`;
    }
}

export default (cb: (data: any) => void) => Client.getInstance(cb);