import type { RenderComponent } from '../../types'

// @ts-ignore
const imageRender: RenderComponent = (data) => {
  if (data?.data?.content.url) {
    return <img src={data.data.content.url} />;
  }

  return <span>[unknown image]</span>
};

export default imageRender;
