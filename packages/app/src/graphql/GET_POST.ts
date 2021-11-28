import { gql } from "@apollo/client";

const GET_POST = gql`
  query Post($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      content
    }
  }
`;

export default GET_POST;
