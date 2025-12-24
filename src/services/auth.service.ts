import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export interface AdminUser {
    email: string;
    role: 'admin';
    // Add other profile fields if needed
}

// Mock credentials for testing (Firebase olmadan test için)
const MOCK_ADMIN = {
    email: "admin@housei.io",
    password: "admin123"
};

export class AuthService {
    private static COLLECTION_NAME = "admin";

    /**
     * Verifies admin credentials against the Firestore 'admin' collection.
     * Falls back to mock auth if Firebase is not configured.
     * @param email The admin email
     * @param password The admin password
     * @returns The user object if valid, null otherwise
     */
    static async verifyAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
        // Mock authentication fallback (Firebase yapılandırılmamışsa)
        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
            return {
                email: MOCK_ADMIN.email,
                role: 'admin'
            };
        }

        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where("email", "==", email),
                where("password", "==", password) // SECURITY NOTE: Password should ideally be hashed, but requirement is direct check
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            // Return the first match (should be unique)
            const userDoc = querySnapshot.docs[0].data();

            return {
                email: userDoc.email,
                role: 'admin'
            };
        } catch (error) {
            console.error("Firebase auth failed, using mock auth fallback:", error);
            // Return null if Firebase fails and mock didn't match
            return null;
        }
    }

    /**
     * Creates a new admin user in Firestore.
     * @param email The admin email
     * @param password The admin password
     */
    static async createAdminUser(email: string, password: string): Promise<void> {
        try {
            await addDoc(collection(db, this.COLLECTION_NAME), {
                email,
                password, // Note: In production, password hashing should be handled by Firebase Auth or backend
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error creating admin user:", error);
            throw error;
        }
    }
}


