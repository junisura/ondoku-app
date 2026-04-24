const supabaseUrl = "https://aewxjfbrpipgfpciolar.supabase.co";
const supabaseKey = "sb_publishable_4Y4JD3wTANVOc-iV7OG-fg_v7Jsn5Hy";

export const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);
