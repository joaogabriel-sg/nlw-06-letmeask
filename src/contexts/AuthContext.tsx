import { createContext, ReactNode, useEffect, useState } from 'react';

import { auth, firebase } from '../services/firebase';

type User = {
	id: string;
	name: string;
	avatar: string;
};

type AuthContextType = {
	user: User | undefined;
	signInWithGoogle: () => Promise<void>;
};

type AuthContextProviderProps = {
	children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<User>();

	useEffect(() => {
		// VERIFY IF HAVE A LOGIN CREATED FOR THE USER
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				const { displayName, photoURL, uid } = user;

				if (!displayName || !photoURL) {
					throw new Error('Missing information from Google Account.');
				}

				setUser({ id: uid, name: displayName, avatar: photoURL });
			}
		});

		// WHEN I'VE EVENT LISTENERS, I NEED TO RETURN A CLEAR FUNCTION
		// THAT REMOVES EVENT LISTENERS BECAUSE SIDE EFFECTS CAN OCCUR IN OUR APP
		return () => {
			unsubscribe();
		};
	}, []);

	async function signInWithGoogle() {
		// CREATE GOOGLE AUTHENTICATION
		const provider = new firebase.auth.GoogleAuthProvider();

		// SIGN INT WITH GOOGLE ACCOUNT IN A POPUP
		const result = await auth.signInWithPopup(provider);

		if (result.user) {
			const { displayName, photoURL, uid } = result.user;

			if (!displayName || !photoURL) {
				throw new Error('Missing information from Google Account.');
			}

			setUser({ id: uid, name: displayName, avatar: photoURL });
		}
	}

	return (
		<AuthContext.Provider value={{ user, signInWithGoogle }}>
			{children}
		</AuthContext.Provider>
	);
}
