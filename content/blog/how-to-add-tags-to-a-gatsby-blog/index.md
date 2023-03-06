---
title: How to Add Tags to a Gatsby Blog
date: "2023-03-01T21:30:00.000Z"
description: "Learn how to add tags to your Gatsby blog posts. By the end of the article, you will be able to let users filter articles by tag, and it only takes a few minutes!"
tags:
    - gatsby
---

If you have a Gatsby blog site, you may have noticed that there is no way out of the box to support tags on your blog posts. Not to worry though, turns it out it's actually really easy to do and you can do it in about 15 minutes.

Follow along and by the end of the article, you will be able to add tags to your blog posts and let users filter articles by those tags.

# Adding Tags to Blog Posts

If you generated your Gatsby blog using the [gatsby-starter-blog](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-blog), then you should be using markdown to render your blog posts.

Let's imagine you have the following article you're working on:

```markdown
---
title: Understanding Perl vs. PHP
date: "2022-03-01T21:30:00.000Z"
description: "Let's compare Perl with PHP and note the differences."
---

PHP and Perl are both great programming languages in their own right.
```

To add tags to your site, just add a `tags` field in the metadata section and supply it a list of tags, like this:

```diff-markdown
---
title: Understanding Perl vs. PHP
date: "2022-03-01T21:30:00.000Z"
description: "Let's compare Perl with PHP and note the differences."
+ tags:
+     - perl
+     - php
---

PHP and Perl are both great programming languages in their own right.
```

Even though we've added the tags, they're still not showing up on our blog post.

![Gatsby blog post still not displaying tags](/blog/how-to-add-tags-to-a-gatsby-blog/gatsby-tags-1.png)

That's because we need to edit `src/templates/blog-post.jsx` to update the GraphQL query to include the new `tags` property with the page query. We also need to add some JSX to render the tags so they can be visible on the post.

Open `src/templates/blog-post.jsx`, locate the GraphQL page query (should be toward the bottom of the page in a variable called `pageQuery`), and add `tags` just beneath `description` in the `frontmatter` object.

In `src/templates/blog-post.jsx`:

```diff
query BlogPostBySlug(
  ...
) {
  ...
  markdownRemark(id: { eq: $id }) {
    id
    excerpt(pruneLength: 160)
    html
    frontmatter {
      title
      date(formatString: "MMMM DD, YYYY")
      description
+     tags
    }
  }
  ...
}
```

Next, we need to render the tags to the screen. From here, you can exercise your creative freedom however you want to display tags to fit your look and feel. I am going to put mine just beneath the blog post date:

```diff
const BlogPostTemplate = ({
  data: { previous, next, site, markdownRemark: post },
  location,
}) => {
  ...
+ const tags = post.frontmatter?.tags || []
  ...

  return (
    ...
    <header>
      <h1 itemProp="headline">{post.frontmatter.title}</h1>
      <p>{post.frontmatter.date}</p>
+     <div className="post-tag-list">
+       {tags.map(tag => (
+         <div className="post-tag">{tag}</div>
+       ))}
+     </div>
    </header>
    ...
  )
}
```

We can now see the tags, but they don't have any styling:

![Blog post rendering without styles](/blog/how-to-add-tags-to-a-gatsby-blog/gatsby-tags-2.png)

Let's add some CSS to make that look a little better:

```css
.post-tag-list {
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-6);
}

.post-tag-list li {
  margin-right: 1rem;
}

.post-tag-list li:last-child {
  margin-right: 0;
}

.post-tag {
  padding: 0.25rem 0.5rem;
  font-size: var(--fontSize-0);
  font-family: var(--fontFamily-monospace);
  font-weight: var(--fontWeight-bold);
  border: 1px solid #DDD;
  background-color: #EFEFEF;
  cursor: pointer;
  border-radius: 9999px;
  margin-right: 1rem;
}

.post-tag:hover {
  box-shadow: 0 3px 0 hsl(220, 7%, 83%);;
}
```

If we refresh the page, the tags should look a lot better:

![Blog post rendering tags with styles](/blog/how-to-add-tags-to-a-gatsby-blog/gatsby-tags-3.png)

In the next step, we'll make these tags clickable so that we can filter posts by tag.

# Filtering Posts by Tag

What good are tags if we can't filter by them? Now that we have the tags, we need to create a dedicated page where we show all of the latest posts that contain the same tag.

First thing is first, let's created a "tag" template page beneath our `templates` folder.

Create `src/templates/tag.jsx` and paste the following:

```jsx
import * as React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'

const TagTemplate = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const { tag } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <header>
        <p>
          {posts.length} post{posts.length !== 1 ? 's' : ''} for&nbsp;<span className="post-tag">{tag}</span>
        </p>
      </header>
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export const Head = ({ pageContext }) => {
  const { tag } = pageContext

  return <Seo title={`${tag} posts`} />
}

export default TagTemplate

export const pageQuery = graphql`
  query BlogPostsByTag($tag: String!) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
          tags
        }
      }
    }
  }
`
```

Here, we're basically copying the same content from `src/pages/blog.jsx` but with a few changes, notably:

1. We've named the GraphQL query `QueryPostsByTag` which accepts a required `$tag` parameter.
2. The `$tag` parameter is passed to the `allMarkdownRemark` section in an additional `filter` parameter, which filters posts that match `$tag`.

We need to update `gatsby-node.js` now to include the `tag.jsx` template and also to create the static pages for every tag at build time. Remember that Gatsby generates _static_ pages and this means that all pages in your Gatsby site are generated in advance.

In `gatsby-node.js`, add your `tag.jsx` template:

```diff-js
const blogPostTemplate = path.resolve(`./src/templates/blog-post.jsx`)
+ const tagTemplate = path.resolve(`./src/templates/tag.jsx`)
```

and within the `exports.createPages` block, we'll need to add the following:

```diff-js
/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }, limit: 1000) {
        nodes {
          id
+         frontmatter {
+           title
+           description
+           date
+           tags
+         }
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.allMarkdownRemark.nodes
+ const tags = new Set()

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {

    // ==============================================
    //  Blog Posts
    // ==============================================

    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

+     post.frontmatter.tags?.forEach((tag) => {
+       tags.add(tag)
+     })

      createPage({
        path: post.fields.slug,
        component: blogPostTemplate,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })

+   // ==============================================
+   //  Tags
+   // ==============================================
+
+   Array.from(tags).forEach(tag => {
+     createPage({
+       path: `/tags/${tag}/`,
+       component: tagTemplate,
+       context: {
+         tag
+       }
+     })
+   })
  }
}
```

Let's break down what we're doing here, because this is where the real magic is happening:

1. We add all of the frontmatter post details, such as a `title`, `description`, `date`, and `tags` to the GraphQL query so that we can display them on the `tag.jsx` template later.
2. We then create an empty set with `const tags = new Set()`. The reason we create a set instead of an array is because we're going to add each _unique_ tag to the set. Duplicate elements get ignored when trying to be added to a `Set`, so it's a great way to maintain a list of unique elements.
3. While pages are being created for every blog post in `posts.forEach`, we also check to see if the post being iterated on has tags. If it does, then we add each tag to the set of unique tags with `tags.add(tag)`.
4. Lastly, once we have our entire set of unique tags, we create static pages for each tag. Since we cannot iterate over sets with `forEach`, we have to convert it to an array first, and call `createPage` for each unique tag. Here is where we define the route for each tag with `path`, the template we want to use in `component` which is our `tag.jsx` template, and any variables we want to pass into the page component in the `context` field. For context, we're just passing the name of the tag so we can display it in the title, for example, as `"2 posts with <tag>"`.

Go back to your blog post and click on one of the tags and you should get a dedicated tag page now:

![Tag page displaying only page with selected tag](/blog/how-to-add-tags-to-a-gatsby-blog/gatsby-tags-4.png)

And that's it! Let me know in the comments if you found this post beneficial.
