// @ts-check

/**
 * Clean up previous review artifacts on a pull request.
 *
 * - Resolve outdated inline review threads (when resolveThreads is true)
 * - Dismiss old bot reviews (clears request-changes status)
 * - Minimize old bot summary reviews as OUTDATED
 *
 * @param {object} params
 * @param {import('@octokit/rest').Octokit} params.github
 * @param {typeof import('@actions/github').context} params.context
 * @param {typeof import('@actions/core')} params.core
 * @param {string} params.summaryMarker - Marker string to identify bot summary reviews
 * @param {boolean} params.resolveThreads - Whether to resolve outdated inline threads
 * @param {string} [params.botLogin='claude[bot]'] - Bot login name
 */
module.exports = async ({
  github,
  context,
  core,
  summaryMarker,
  resolveThreads,
  botLogin = 'claude[bot]',
}) => {
  const { owner, repo } = context.repo;
  const prNumber = context.issue.number;

  // Part A: Resolve outdated inline review threads
  if (resolveThreads) {
    const { repository } = await github.graphql(
      `
      query ($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            reviewThreads(first: 100) {
              nodes {
                id
                isOutdated
                isResolved
                comments(first: 1) {
                  nodes {
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
      { owner, repo, number: prNumber },
    );

    const threadsToResolve = repository.pullRequest.reviewThreads.nodes.filter(
      (t) =>
        !t.isResolved &&
        t.isOutdated &&
        t.comments.nodes[0]?.author?.login === botLogin,
    );

    core.info(`Resolving ${threadsToResolve.length} outdated review threads`);

    for (const thread of threadsToResolve) {
      try {
        await github.graphql(
          `
          mutation ($threadId: ID!) {
            resolveReviewThread(input: { threadId: $threadId }) {
              thread {
                isResolved
              }
            }
          }
        `,
          { threadId: thread.id },
        );
      } catch (error) {
        core.warning(`Failed to resolve thread ${thread.id}: ${error.message}`);
      }
    }
  }

  // Part B: Dismiss + minimize old bot summary reviews
  const { data: reviews } = await github.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const botSummaries = reviews
    .filter(
      (r) => r.user?.login === botLogin && r.body?.includes(summaryMarker),
    )
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    );

  // Exclude the latest summary (just posted by the current review step)
  const oldSummaries = botSummaries.slice(1);

  core.info(`Processing ${oldSummaries.length} old summary reviews`);

  for (const review of oldSummaries) {
    // Step 1: Dismiss (clears request-changes status)
    try {
      await github.graphql(
        `
        mutation ($id: ID!, $message: String!) {
          dismissPullRequestReview(
            input: {
              pullRequestReviewId: $id
              message: $message
            }
          ) {
            pullRequestReview {
              state
            }
          }
        }
      `,
        {
          id: review.node_id,
          message:
            '新しいレビューが投稿されたため、前回のレビューをdismissしました',
        },
      );
    } catch (error) {
      core.warning(`Failed to dismiss review ${review.id}: ${error.message}`);
    }

    // Step 2: Minimize as OUTDATED
    try {
      await github.graphql(
        `
        mutation ($id: ID!) {
          minimizeComment(
            input: { subjectId: $id, classifier: OUTDATED }
          ) {
            minimizedComment {
              isMinimized
            }
          }
        }
      `,
        { id: review.node_id },
      );
    } catch (error) {
      core.warning(`Failed to minimize review ${review.id}: ${error.message}`);
    }
  }

  core.info('Review cleanup completed');
};
