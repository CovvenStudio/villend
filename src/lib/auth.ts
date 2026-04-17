// Mock auth using localStorage. Easy to swap for real backend later.
const KEY = 'vyllad_user';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  agencyId: string;
}

const DEMO_USER: MockUser = {
  id: 'u-1',
  name: 'Sofia Ribeiro',
  email: 'sofia@vyllad.pt',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  agencyId: 'agency-1',
};

export const auth = {
  getUser(): MockUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },
  signInWithGoogle(): Promise<MockUser> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(DEMO_USER));
        resolve(DEMO_USER);
      }, 900);
    });
  },
  signOut() {
    localStorage.removeItem(KEY);
  },
  isAuthenticated(): boolean {
    return !!this.getUser();
  },
};
