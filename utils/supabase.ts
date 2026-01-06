
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vkhltpohmxeahirczfeg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_xk1QWRuelqI-QV38O5zXEA_kbKC1xXu";

export const supabase = createClient(supabaseUrl, supabaseKey);
