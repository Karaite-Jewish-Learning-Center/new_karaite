import CommentTwoToneIcon from '@material-ui/icons/CommentTwoTone';
import Badge from '@material-ui/core/Badge';

export default function CommentBadge({commentsCount, sameChapterAndVerse}) {
    if (commentsCount !== '0') {
        return (
            <span data-for='en' data-tip={"Click to read " + (commentsCount === "1" ? 'this comment' : 'these comments')}>
                <Badge badgeContent={commentsCount} color={(sameChapterAndVerse ? "error" : "secondary")}>
                    <CommentTwoToneIcon/>
                </Badge>
            </span>
        )
    }
    return null
}


