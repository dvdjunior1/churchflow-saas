import { Hono } from "hono";
import type { Env } from './core-utils';
import { MemberEntity, MinistryEntity, MinistryMemberEntity, FinancialRecordEntity, EventEntity } from "./entities";
import { ok, bad } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // MEMBERS CRUD
  app.get('/api/members', async (c) => {
    await MemberEntity.ensureSeed(c.env);
    const page = await MemberEntity.list(c.env, null, 1000);
    return ok(c, page);
  });
  app.post('/api/members', async (c) => {
    const data = await c.req.json();
    const member = { ...data, id: data.id || crypto.randomUUID(), joinedAt: data.joinedAt || new Date().toISOString() };
    return ok(c, await MemberEntity.create(c.env, member));
  });
  app.put('/api/members/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const entity = new MemberEntity(c.env, id);
    await entity.patch(data);
    return ok(c, await entity.getState());
  });
  app.put('/api/members/self/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    // In a real app, verify that the logged-in user owns this memberId
    const entity = new MemberEntity(c.env, id);
    if (!(await entity.exists())) return bad(c, 'membro não encontrado');
    
    await entity.patch(data);
    const updated = await entity.getState();
    return ok(c, updated);
  });
  app.delete('/api/members/:id', async (c) => {
    const deleted = await MemberEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // MINISTRIES CRUD
  app.get('/api/ministries', async (c) => {
    await MinistryEntity.ensureSeed(c.env);
    const page = await MinistryEntity.list(c.env, null, 100);
    return ok(c, page);
  });
  app.post('/api/ministries', async (c) => {
    const data = await c.req.json();
    const ministry = { ...data, id: data.id || crypto.randomUUID() };
    return ok(c, await MinistryEntity.create(c.env, ministry));
  });
  app.delete('/api/ministries/:id', async (c) => {
    const deleted = await MinistryEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // RELATIONSHIPS
  app.get('/api/ministry-members', async (c) => {
    await MinistryMemberEntity.ensureSeed(c.env);
    const page = await MinistryMemberEntity.list(c.env, null, 2000);
    return ok(c, page);
  });
  app.post('/api/ministry-members', async (c) => {
    const data = await c.req.json();
    const relationship = { ...data, id: data.id || crypto.randomUUID() };
    return ok(c, await MinistryMemberEntity.create(c.env, relationship));
  });
  app.delete('/api/ministry-members/:id', async (c) => {
    const deleted = await MinistryMemberEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // FINANCES
  app.get('/api/finances', async (c) => {
    await FinancialRecordEntity.ensureSeed(c.env);
    const page = await FinancialRecordEntity.list(c.env, null, 1000);
    return ok(c, page);
  });
  app.post('/api/finances', async (c) => {
    const data = await c.req.json();
    const record = { ...data, id: data.id || crypto.randomUUID() };
    return ok(c, await FinancialRecordEntity.create(c.env, record));
  });
  app.get('/api/member-donations/:memberId', async (c) => {
    const memberId = c.req.param('memberId');
    const records = await FinancialRecordEntity.list(c.env, null, 1000);
    const filtered = records.items.filter(r => r.memberId === memberId);
    return ok(c, filtered);
  });
  app.get('/api/finances/stats', async (c) => {
    const records = await FinancialRecordEntity.list(c.env, null, 5000);
    const items = records.items;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const totalMonth = items
      .filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const lastMonth = items
      .filter(r => {
        const d = new Date(r.date);
        const last = new Date(currentYear, currentMonth - 1, 1);
        return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const types = ['tithe', 'offering', 'donation'];
    const distribution = types.map(t => ({
      name: t === 'tithe' ? 'Dízimos' : t === 'offering' ? 'Ofertas' : 'Doações',
      value: items.filter(r => r.type === t).reduce((acc, curr) => acc + curr.amount, 0)
    }));
    return ok(c, {
      totalMonth,
      lastMonth,
      growth: lastMonth > 0 ? ((totalMonth - lastMonth) / lastMonth) * 100 : 0,
      distribution,
      history: []
    });
  });
  // EVENTS CRUD
  app.get('/api/events', async (c) => {
    await EventEntity.ensureSeed(c.env);
    const page = await EventEntity.list(c.env, null, 500);
    return ok(c, page);
  });
  app.post('/api/events', async (c) => {
    const data = await c.req.json();
    const event = { ...data, id: data.id || crypto.randomUUID() };
    return ok(c, await EventEntity.create(c.env, event));
  });
  app.put('/api/events/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const entity = new EventEntity(c.env, id);
    await entity.patch(data);
    return ok(c, await entity.getState());
  });
  app.delete('/api/events/:id', async (c) => {
    const deleted = await EventEntity.delete(c.env, c.req.param('id'));
    return ok(c, { deleted });
  });
  // DASHBOARD STATS
  app.get('/api/dashboard/stats', async (c) => {
    const members = await MemberEntity.list(c.env, null, 1000);
    const ministries = await MinistryEntity.list(c.env, null, 1000);
    const events = await EventEntity.list(c.env, null, 50);
    // Sort upcoming events
    const sortedUpcoming = events.items
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
    return ok(c, {
      totalMembers: members.items.length,
      totalMinistries: ministries.items.length,
      upcomingEvents: sortedUpcoming,
      growthData: [
        { month: 'Jan', count: 120 }, { month: 'Fev', count: 135 }, { month: 'Mar', count: 150 },
        { month: 'Abr', count: 162 }, { month: 'Mai', count: 180 },
      ]
    });
  });
}