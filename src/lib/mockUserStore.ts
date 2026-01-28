import { hash, compare } from "bcryptjs";

export interface User {
    id: string;
    name?: string;
    email: string;
    passwordHash?: string; // Optional for Google users
    image?: string;
}

// Singleton store to persist users in memory during development runtime
class MockUserStore {
    private users: User[] = [];

    constructor() {
        // Add a demo user for testing
        this.addUser({
            id: "demo-user-1",
            name: "Demo User",
            email: "demo@finboard.com",
            passwordHash: "$2a$10$wI.q/m8.d/1.q/m8.d/1.q/m8.d/1.q/m8.d/1.q/m8.d/1.q" // Invalid hash, just placeholder
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(u => u.email === email) || null;
    }

    async createUser(name: string, email: string, password?: string): Promise<User> {
        const existing = await this.findByEmail(email);
        if (existing) {
            throw new Error("User already exists");
        }

        const newUser: User = {
            id: Math.random().toString(36).substring(2, 15),
            name,
            email,
        };

        if (password) {
            newUser.passwordHash = await hash(password, 10);
        }

        this.users.push(newUser);
        return newUser;
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        if (!user.passwordHash) return false;
        return compare(password, user.passwordHash);
    }

    // Helper to inject a pre-filled user if needed
    private addUser(user: User) {
        this.users.push(user);
    }
}

export const mockUserStore = new MockUserStore();
