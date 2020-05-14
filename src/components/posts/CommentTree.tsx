import { PostId, Blog } from '@subsocial/types/substrate/interfaces';
import { ExtendedPostData } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import React, { useState, useEffect } from 'react'
import { nonEmptyArr, newLogger } from '@subsocial/utils';
import ListData from '../utils/DataList';
import ViewComment from './ViewComment';

const log = newLogger('CommentTree')

type LoadProps = {
  parentId: PostId,
  blog: Blog,
  replies?: ExtendedPostData[],
  newCommentId?: PostId
}

type CommentsTreeProps = {
  blog: Blog,
  comments: ExtendedPostData[]
}

const ViewCommentsTree: React.FunctionComponent<CommentsTreeProps> = ({ comments, blog }) => {
  return nonEmptyArr(comments) ? <ListData
    dataSource={comments}
    renderItem={(item) => {
      const { post: { struct, content }, owner } = item;

      return <ViewComment key={struct.id.toString()} blog={blog} struct={struct} content={content} owner={owner} />
    }}
  /> : null;
}

export const withLoadedComments = (Component: React.ComponentType<CommentsTreeProps>) => {
  return (props: LoadProps) => {
    const { parentId, newCommentId, blog, replies = [] } = props;

    const [ replyComments, setComments ] = useState<ExtendedPostData[]>(replies);
    const [ isCommentReplies, setIsCommentReplies ] = useState(replyComments.length > 0)
    const { subsocial, substrate } = useSubsocialApi();

    console.log('Reload comments', isCommentReplies, replyComments)

    useEffect(() => {
      if (isCommentReplies) return;
      console.log('Load comment')
      const loadComments = async () => {
        const replyIds = await substrate.getReplyIdsByPostId(parentId);
        console.log(replyIds)
        const comments = await subsocial.findPostsWithDetails(replyIds);
        setComments(comments)
        setIsCommentReplies(true);
      }

      loadComments().catch(err => log.error('Failed load comments: %o', err))
    }, [ false ]);

    useEffect(() => {
      if (!newCommentId) return;

      const loadComment = async () => {
        const comment = await subsocial.findPostsWithDetails([ newCommentId ]);
        setComments([ ...replyComments, ...comment ]);
        setIsCommentReplies(true);
      }

      loadComment().catch(err => log.error('Failed load new comment: %o', err))
    }, [ newCommentId ])

    return isCommentReplies ? <Component blog={blog} comments={replyComments} /> : null;
  }
}

export const CommentsTree = React.memo(withLoadedComments(ViewCommentsTree));