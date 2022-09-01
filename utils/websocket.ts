export type WebSocketOptions = {
  maxRetries?: number;
}

export type WebSocketIterator<T> = WebSocket & AsyncGenerator<MessageEvent<T>, void, void>;

// deno-lint-ignore no-explicit-any
export function connect<T = any>(url: string | URL, protocols?: string | string[]) {
  const source = new WebSocket(url, protocols) as WebSocketIterator<T>;

  source[Symbol.asyncIterator] = function () {
    return this
  };

  source.next = function () {
    return new Promise<IteratorResult<MessageEvent<T>>>((resolve, reject) => {
      function onmessage(event: MessageEvent<T>) {
        source.removeEventListener("message", onmessage);
        resolve({
          done: false,
          value: event,
        });
      }
      function onerror(event: Event) {
        source.removeEventListener("error", onerror);
        reject(event);
      }
      function onclose() {
        source.removeEventListener("close", onclose);
        resolve({
          done: true,
          value: undefined,
        });
      }
      source.addEventListener("message", onmessage);
      source.addEventListener("error", onerror);
      source.addEventListener("close", onclose);
    });
  };

  return source;
}