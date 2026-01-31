// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
//import { query } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        })
    ],
    callbacks: {
        async signIn({ user }) {
            console.log("SignIn Callback Invoked for user:", user?.email);

            // 1. Safety check for email
            if (!user?.email) return false;

            try {
                return true;

                // // 2. Query your specific table: tbl_users
                // const result = await query(
                //     "SELECT 1 FROM tbl_users WHERE email = $1 LIMIT 1",
                //     [user.email]
                // );

                // // 3. If a match is found in tbl_users, allow the login
                // if (result.rowCount && result.rowCount > 0) {
                //     return true;
                // }

                // // 4. Otherwise, redirect to login with error parameter
                // return "/login?error=AccessDenied";
            } catch (error) {
                console.error("PostgreSQL Error:", error);
                // Deny access on database failure for security
                return false;
            }
        },
        authorized: async ({ auth }) => {
            return !!auth;
        },
    },
    pages: {
        signIn: '/login',
    },
})
