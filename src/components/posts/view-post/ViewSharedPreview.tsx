import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import { Segment } from 'semantic-ui-react';

import { PostVoters } from '../../voting/ListVoters';
import { PostWithAllDetails, BlogData } from '@subsocial/types/dto';
import SummarizeMd from '../../utils/md/SummarizeMd';
import { CommentSection } from '../CommentsSection';
import { PostCreator, PostDropDownMenu, renderPostLink, InfoPostPreview, PostActionsPanel } from './helpers';
import { withLoadedData } from './withLoadedPostData';

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false });

export type SharedPreviewProps = {
  postStruct: PostWithAllDetails,
  blog: BlogData,
  withStats?: boolean,
  withActions?: boolean
}

export const SharedPreview: React.FunctionComponent<SharedPreviewProps> = ({ postStruct, blog, withStats, withActions }) => {
  if (!postStruct.ext) return null;
  const { post: { struct: originalPost, content: originalContent } } = postStruct.ext;

  if (!originalPost || !originalContent) return null;
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ commentsSection, setCommentsSection ] = useState(false)

  const { struct, content } = postStruct.post
  return <>
    <Segment className={`DfPostPreview`}>
      <div className='DfRow'>
        <PostCreator postStruct={postStruct} blog={blog} withBlogName />
        <PostDropDownMenu account={struct.created.account} blog={blog.struct} post={struct}/>
      </div>
      <div className='DfSharedSummary'>
        <SummarizeMd md={content?.body} more={renderPostLink(blog.struct, originalPost, 'See More')} />
      </div>
      <Segment className='DfPostPreview'>
        <InfoPostPreview postStruct={postStruct.ext} blog={blog} />
        {withStats && <StatsPanel id={originalPost.id}/> /* TODO params originPost */}
      </Segment>
      {withActions && <PostActionsPanel postStruct={postStruct.ext} toogleCommentSection={() => setCommentsSection(!commentsSection)} />}
      {commentsSection && <CommentSection post={struct} blog={blog.struct} />}
      {postVotersOpen && <PostVoters id={struct.id} active={0} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
    </Segment>
  </>;
};

export const DynamicSharedPost = withLoadedData(SharedPreview)