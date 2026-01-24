// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        authorized: async ({ auth }) => {
            // !!auth converts the session object to a boolean
            // If it's null (unauthenticated), it returns false and triggers a redirect
            return !!auth;
        },
    },
    pages: {
        signIn: '/login', // Path to your custom login page
    },
})
