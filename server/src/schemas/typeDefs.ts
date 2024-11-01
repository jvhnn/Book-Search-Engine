const gql = String.raw;

const typeDefs = gql `
    type User {
        _id: ID
        username: String!
        email: String!
        password: String!
        savedBooks: [Book]
        bookCount: Int
        }

    type Book {
        bookId: String!
        title: String!
        authors: [String]
        description: String!
        image: String
        link: String
    }

    type Auth {
        token: ID!
        user: User
    }

    input UserInput {
        username: String!
        email: String!
        password: String!
    }

    input BookInput {
        bookId: String!
        title: String!
        authors: [String]
        description: String!
        image: String
        link: String
    }

    type Query {
        me: User
    }

    type Mutation {
        addUser(input: UserInput!): Auth
        loginUser(email: String!, password: String!): Auth

        saveBook(input: BookInput!): User
        removeBook(bookId: String!): User
    }
`;

export default typeDefs;