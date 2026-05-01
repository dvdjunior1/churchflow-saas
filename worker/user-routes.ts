import { Hono } from "hono";
import type { Env } from './core-utils';
import { MemberEntity, MinistryEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // MEMBERS CRUD
  app.get('/api/members', async (c) => {
    await MemberEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await MemberEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
    return ok(c, page);
  });
  app.post('/api/members', async (c) => {
    const data = await c.req.json();
    if (!data.name || !data.email) return bad(c, 'Name and email are required');
    const member = { ...data, id: data.id || crypto.randomUUID(), joinedAt: new Date().toISOString() };
    return ok(c, await MemberEntity.create(c.env, member));
  });
  app.delete('/api/members/:id', async (c) => {
    const deleted = await MemberEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // MINISTRIES CRUD
  app.get('/api/ministries', async (c) => {
    await MinistryEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const page = await MinistryEntity.list(c.env, cursor ?? null, 100);
    return ok(c, page);
  });
  app.post('/api/ministries', async (c) => {
    const data = await c.req.json();
    if (!data.name) return bad(c, 'Ministry name required');
    const ministry = { ...data, id: data.id || crypto.randomUUID(), memberIds: data.memberIds || [] };
    return ok(c, await MinistryEntity.create(c.env, ministry));
  });
  app.delete('/api/ministries/:id', async (c) => {
    const deleted = await MinistryEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // DASHBOARD STATS
  app.get('/api/dashboard/stats', async (c) => {
    const members = await MemberEntity.list(c.env, null, 1000);
    const ministries = await MinistryEntity.list(c.env, null, 1000);
    return ok(c, {
      totalMembers: members.items.length,
      totalMinistries: ministries.items.length,
      growthData: [
        { month: 'Jan', count: 120 },
        { month: 'Fev', count: 135 },
        { month: 'Mar', count: 150 },
        { month: 'Abr', count: 162 },
        { month: 'Mai', count: 180 },
      ]
    });
  });
}