import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw Error('Invalid or missing supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase