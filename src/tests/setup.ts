import { config } from 'dotenv';
config({ override: true });

if (!process.env.JWT_SECRET_KEY?.trim()) {
    process.env.JWT_SECRET_KEY = 'jest-test-jwt-secret-key-min-length';
}