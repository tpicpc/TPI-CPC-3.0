// Small helpers for admin-managed collections (keeps the many new routes tiny).
import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import mongoose from "mongoose";

/** Pick only whitelisted keys; "" → default handled by schema; dates parsed. */
export function pick(body = {}, fields = []) {
  const out = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}

export function withAuth(role, handler) {
  return async (req, ctx) => {
    try {
      const auth = requireAuth(req, role);
      if (auth.error) return authError(auth.error, auth.status);
      await connectDB();
      return await handler(req, ctx, auth.user);
    } catch (e) {
      if (e?.name === "ValidationError" || e?.name === "CastError") return fail(e.message, 400);
      return serverError(e);
    }
  };
}

export function withDB(handler) {
  return async (req, ctx) => {
    try {
      await connectDB();
      return await handler(req, ctx);
    } catch (e) {
      if (e?.name === "ValidationError" || e?.name === "CastError") return fail(e.message, 400);
      return serverError(e);
    }
  };
}

/** Optional viewer (user token) without failing on anonymous requests. */
export function optionalUser(req) {
  const auth = requireAuth(req);
  return auth.error ? null : auth.user;
}

/**
 * Admin collection + item handlers.
 * collection(Model, { key, fields, sort, beforeSave, afterCreate })
 */
export function adminCollection(Model, { key, fields, sort = { createdAt: -1 }, beforeSave, afterCreate, populate }) {
  return {
    GET: withAuth("admin", async () => {
      let q = Model.find().sort(sort);
      if (populate) q = q.populate(populate);
      return ok({ [key]: await q.lean() });
    }),
    POST: withAuth("admin", async (req, _ctx, admin) => {
      const body = await req.json();
      let data = pick(body, fields);
      if (beforeSave) data = await beforeSave(data, { body, admin, isNew: true });
      const doc = await Model.create(data);
      const extra = afterCreate ? await afterCreate(doc, { body, admin }) : {};
      return ok({ item: doc, ...extra }, "Created");
    }),
  };
}

export function adminItem(Model, { fields, beforeSave, afterUpdate, afterDelete }) {
  const getId = async (ctx) => {
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error("Invalid id"), { name: "CastError" });
    return id;
  };
  return {
    PUT: withAuth("admin", async (req, ctx, admin) => {
      const id = await getId(ctx);
      const body = await req.json();
      let data = pick(body, fields);
      if (beforeSave) data = await beforeSave(data, { body, admin, isNew: false, id });
      const prev = await Model.findById(id).lean();
      if (!prev) return fail("Not found", 404);
      const doc = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      const extra = afterUpdate ? await afterUpdate(doc, prev, { body, admin }) : {};
      return ok({ item: doc, ...extra }, "Updated");
    }),
    DELETE: withAuth("admin", async (_req, ctx) => {
      const id = await getId(ctx);
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) return fail("Not found", 404);
      if (afterDelete) await afterDelete(doc);
      return ok({}, "Deleted");
    }),
  };
}

export { ok, fail };
