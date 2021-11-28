import { gql } from "@apollo/client";

const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
      slug
      author {
        name
      }
    }
  }
`;

export default GET_POSTS;
