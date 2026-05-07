/** Cuenta moderadora demo: único correo permitido sin dominio universitario. */

const DEFAULT_EMAIL = 'moderador@admin.com';
const DEFAULT_PASSWORD = 'Password123';

export function normalizeModeratorEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function getModeratorEmail(): string {
    const fromEnv = process.env.MODERATOR_EMAIL?.trim();
    const email = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_EMAIL;
    return normalizeModeratorEmail(email);
}

export function getModeratorPassword(): string {
    const fromEnv = process.env.MODERATOR_PASSWORD?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_PASSWORD;
}

export function isBuiltInModeratorEmail(email: string): boolean {
    return normalizeModeratorEmail(email) === getModeratorEmail();
}
