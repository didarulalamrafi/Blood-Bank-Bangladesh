/**
 * ==============================================================
 * lib/auth-client.js  (Frontend / Next.js এর জন্য)
 * ==============================================================
 * এটা দিয়েই frontend থেকে login, logout, এবং session চেক করা হবে।
 * এই ফাইলটা আপনার Next.js প্রজেক্টের "lib" ফোল্ডারে বসান।
 *
 * ইন্সটল করতে হবে:
 *   npm install better-auth
 *
 * ⚠️ NEXT_PUBLIC_API_URL এ আপনার backend এর URL বসাতে হবে
 * (উদাহরণ: http://localhost:5000 অথবা আপনার deployed backend URL)
 * ==============================================================
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// এই দুইটা hook/function সরাসরি component এ ব্যবহার করা যাবে
export const { signIn, signOut, useSession } = authClient;
