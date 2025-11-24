import postgres from 'postgres';

// Initialize Postgres connection using the Environment Variable provided by Netlify/Neon
const sql = postgres(process.env.DATABASE_URL || '', {
  ssl: 'require',
});

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // 1. INITIALIZATION (Load everything)
    if (action === 'init' && req.method === 'GET') {
      const [members, transactions, budgets, messages, settings] = await Promise.all([
        sql`SELECT * FROM members`,
        sql`SELECT * FROM transactions ORDER BY created_at DESC`,
        sql`SELECT * FROM budgets`,
        sql`SELECT * FROM messages ORDER BY timestamp ASC`,
        sql`SELECT * FROM settings LIMIT 1`
      ]);

      return new Response(JSON.stringify({
        members,
        transactions,
        budgets,
        messages,
        settings: settings[0] || {}
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 2. AUTH
    if (action === 'login' && req.method === 'POST') {
      const body = await req.json();
      const users = await sql`SELECT * FROM users WHERE email = ${body.email} AND password = ${body.password}`;
      
      if (users.length > 0) {
        return new Response(JSON.stringify({ success: true, user: users[0] }), { headers: { 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({ success: false }), { status: 401 });
      }
    }

    // 3. TRANSACTIONS
    if (action === 'add_transaction' && req.method === 'POST') {
      const t = await req.json();
      await sql`
        INSERT INTO transactions (id, type, category, amount, date, description, performed_by, matricule, function, receipt_number, status, responsible, signature)
        VALUES (${t.id}, ${t.type}, ${t.category}, ${t.amount}, ${t.date}, ${t.description}, ${t.performedBy}, ${t.matricule}, ${t.function}, ${t.receiptNumber}, ${t.status}, ${t.responsible}, ${t.signature})
      `;
      return new Response(JSON.stringify({ success: true }));
    }

    if (action === 'update_transaction_status' && req.method === 'POST') {
      const { id, status } = await req.json();
      await sql`UPDATE transactions SET status = ${status} WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }));
    }
    
    if (action === 'delete_transaction' && req.method === 'POST') {
        const { id } = await req.json();
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }));
    }

    // 4. MEMBERS
    if (action === 'add_member' && req.method === 'POST') {
      const m = await req.json();
      await sql`
        INSERT INTO members (id, unique_id, first_name, last_name, dob, sector, level, gender, dossier_number, ine, balance)
        VALUES (${m.id}, ${m.uniqueId}, ${m.firstName}, ${m.lastName}, ${m.dob}, ${m.sector}, ${m.level}, ${m.gender}, ${m.dossierNumber}, ${m.ine}, ${m.balance})
      `;
      // Also create a user login for them automatically (optional logic)
      return new Response(JSON.stringify({ success: true }));
    }

    if (action === 'delete_member' && req.method === 'POST') {
        const { id } = await req.json();
        await sql`DELETE FROM members WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }));
    }

    // 5. MESSAGES
    if (action === 'add_message' && req.method === 'POST') {
      const m = await req.json();
      await sql`
        INSERT INTO messages (id, user_id, user_name, user_role, member_info_json, content, timestamp)
        VALUES (${m.id}, ${m.userId}, ${m.userName}, ${m.userRole}, ${JSON.stringify(m.memberInfo)}, ${m.content}, ${m.timestamp})
      `;
      return new Response(JSON.stringify({ success: true }));
    }

    if (action === 'delete_message' && req.method === 'POST') {
        const { id } = await req.json();
        await sql`DELETE FROM messages WHERE id = ${id}`;
        return new Response(JSON.stringify({ success: true }));
    }

    // 6. BUDGETS
    if (action === 'update_budget' && req.method === 'POST') {
        const { id, amount, category, year } = await req.json();
        // Upsert logic
        await sql`
            INSERT INTO budgets (id, category, allocated_amount, year)
            VALUES (${id}, ${category}, ${amount}, ${year})
            ON CONFLICT (id) DO UPDATE SET allocated_amount = ${amount};
        `;
        return new Response(JSON.stringify({ success: true }));
    }
    
    // 7. SETTINGS
    if (action === 'update_settings' && req.method === 'POST') {
        const s = await req.json();
        await sql`UPDATE settings SET association_name = ${s.associationName}, currency = ${s.currency}, logo_url = ${s.logoUrl} WHERE id = 1`;
        return new Response(JSON.stringify({ success: true }));
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
};
