import type { Json } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';

type AuditLogParams = {
  action: string;
  tableName: string;
  recordId: string;
  oldData?: Json | null;
  newData?: Json | null;
};

export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('write_audit_log', {
    p_action: params.action,
    p_table_name: params.tableName,
    p_record_id: params.recordId,
    p_old_data: params.oldData ?? undefined,
    p_new_data: params.newData ?? undefined,
  });
}
