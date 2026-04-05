import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

import { auth } from '@/app/lib/auth';
import { database } from '@/app/db';
import { pileItems, PileItemStatus } from '@/app/db/schemas/pileItems';

type PatchBody = {
  status?: PileItemStatus;
  statusUpdatedAt?: string;
  notes?: string;
  notesUpdatedAt?: string;
  owned?: boolean;
  ownedUpdatedAt?: string;
  position?: string;
  positionUpdatedAt?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body: PatchBody = await request.json();

  const [current] = await database
    .select()
    .from(pileItems)
    .where(eq(pileItems.id, id))
    .limit(1);

  if (!current) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const patch: Partial<typeof current> = {};
  const conflicts: Record<string, unknown> = {};

  // Field-level LWW for each syncable field
  if (body.status !== undefined && body.statusUpdatedAt !== undefined) {
    const clientTs = new Date(body.statusUpdatedAt).getTime();
    const serverTs = current.statusUpdatedAt?.getTime() ?? 0;
    if (clientTs > serverTs) {
      patch.status = body.status;
      patch.statusUpdatedAt = new Date(body.statusUpdatedAt);
    } else {
      conflicts.serverStatus = current.status;
      conflicts.serverStatusUpdatedAt = current.statusUpdatedAt?.toISOString() ?? null;
    }
  }

  if (body.notes !== undefined && body.notesUpdatedAt !== undefined) {
    const clientTs = new Date(body.notesUpdatedAt).getTime();
    const serverTs = current.notesUpdatedAt?.getTime() ?? 0;
    if (clientTs > serverTs) {
      patch.notes = body.notes;
      patch.notesUpdatedAt = new Date(body.notesUpdatedAt);
    } else {
      conflicts.serverNotes = current.notes;
      conflicts.serverNotesUpdatedAt = current.notesUpdatedAt?.toISOString() ?? null;
    }
  }

  if (body.owned !== undefined && body.ownedUpdatedAt !== undefined) {
    const clientTs = new Date(body.ownedUpdatedAt).getTime();
    const serverTs = current.ownedUpdatedAt?.getTime() ?? 0;
    if (clientTs > serverTs) {
      patch.owned = body.owned;
      patch.ownedUpdatedAt = new Date(body.ownedUpdatedAt);
    } else {
      conflicts.serverOwned = current.owned;
      conflicts.serverOwnedUpdatedAt = current.ownedUpdatedAt?.toISOString() ?? null;
    }
  }

  if (body.position !== undefined && body.positionUpdatedAt !== undefined) {
    const clientTs = new Date(body.positionUpdatedAt).getTime();
    const serverTs = current.positionUpdatedAt?.getTime() ?? 0;
    if (clientTs > serverTs) {
      patch.position = body.position;
      patch.positionUpdatedAt = new Date(body.positionUpdatedAt);
    } else {
      conflicts.serverPosition = current.position;
      conflicts.serverPositionUpdatedAt = current.positionUpdatedAt?.toISOString() ?? null;
    }
  }

  if (Object.keys(patch).length > 0) {
    await database.update(pileItems).set(patch).where(eq(pileItems.id, id));
  }

  if (Object.keys(conflicts).length > 0) {
    return Response.json({ conflict: true, ...conflicts }, { status: 409 });
  }

  const [updated] = await database
    .select()
    .from(pileItems)
    .where(eq(pileItems.id, id))
    .limit(1);

  return Response.json({
    id: updated.id,
    status: updated.status,
    statusUpdatedAt: updated.statusUpdatedAt?.toISOString() ?? null,
    notes: updated.notes,
    notesUpdatedAt: updated.notesUpdatedAt?.toISOString() ?? null,
    owned: updated.owned,
    ownedUpdatedAt: updated.ownedUpdatedAt?.toISOString() ?? null,
    position: updated.position,
    positionUpdatedAt: updated.positionUpdatedAt?.toISOString() ?? null,
  });
}
