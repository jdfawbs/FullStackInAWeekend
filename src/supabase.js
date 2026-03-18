import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://emlzifimaltfjdejlkpr.supabase.co";
const supabaseKey = "sb_publishable_NP77ay7BsEyrs1f9ChD4PA_AqjXwTgK";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
