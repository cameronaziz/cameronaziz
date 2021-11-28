
export type Post = DataWrapper<Post.Schema, 'post'>
export type Posts = DataWrapper<Post.Schema[], 'posts'>

type DataWrapper<T, U extends string> = {
  [key in U]: T;
}


export as namespace Data;
