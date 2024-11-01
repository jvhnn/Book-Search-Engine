import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    savedBooks: Book[];
    bookCount?: number;
}

interface Book {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image?: string;
    link?: string;
}

interface addUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

interface SaveBookArgs {
    input: {
        bookId: string;
        title: string;
        authors: string[];
        description: string;
        image?: string;
        link?: string;
    }
}

interface RemoveBookArgs {
    bookId: string;
}

interface Context {
    user?: User;
}

const resolvers = {
    Query: {
        me: async (_parent: unknown, _args: unknown, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('Not Authenticated');
        }
    },

    Mutation: {
        addUser: async (_parent: unknown, { input }: addUserArgs): Promise<{ token: string; user: User }> => {
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);

            return { token, user };
        },

        loginUser: async (_parent: unknown, { email, password }: { email: string; password: string }): Promise<{ token: string; user: User }> => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Not Authenticated');
            }

            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        saveBook: async (_parent: unknown, { input }: { input: SaveBookArgs }, context: Context): Promise<User> => {
            if (!context.user) {
                throw new AuthenticationError('Not Authenticated');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: input } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('User not found');
            }

            return updatedUser;
        },

        removeBook: async (_parent: unknown, { bookId }: RemoveBookArgs, context: Context): Promise<User> => {
            if (!context.user) {
                throw new AuthenticationError('Not Authenticated');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('User not found');
            }

            return updatedUser;
        }
    }
}

export default resolvers;