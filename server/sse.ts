import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

let clients: SSEClient[] = [];

export function addSSEClient(id: string, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Dawa Equips real-time stream', id })}\n\n`);

  const client: SSEClient = { id, res };
  clients.push(client);

  res.on('close', () => {
    clients = clients.filter(c => c.id !== id);
  });
}

export function broadcastSSE(event: 'promo:updated' | 'product:updated' | 'order:updated' | 'stock:updated', data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(c => {
    try {
      c.res.write(payload);
    } catch (err) {
      console.error(`Failed to send SSE to client ${c.id}:`, err);
    }
  });
}
