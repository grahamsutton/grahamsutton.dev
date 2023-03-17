---
title: "Implement the Repository Pattern in PHP"
date: "2023-03-15T21:30:00.000Z"
description: "Learn how to implement the repository pattern in PHP in a clean and testable way."
tags:
    - php
    - oop
---

A _repository_ is an architecural element in code design for accessing objects in data storage.

In this article, you'll learn how to:

* Understand the benefits of the repository pattern
* Implement a basic repository pattern with best practices
* Understand where repositories exist in your application's architecure and _why_
* Use the Specification pattern to handle conditional querying

# Why We Use Repositories

Before we begin learning how to create a repository, you need to know _why_ we use them. Otherwise, you'll be mindlessly implementing a pattern without understanding its benefits.

There are many benefits to using repositories, to name a few:

* They provide a simple way to read and write objects between your business logic and data source(s)
* They decouple business logic from the need to understand how data is persisted and reconstructed, even among multiple data sources
* They are easy to mock in unit tests
* They make your code more readable and maintainable
* You can create new data access strategies without modifying existing code, also known as the [open-closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle)

Every web application is divided into four layers. I dislike overly technical definitions that you would find on Wikipedia, so I'll try to simplify the definition of these layers in a way that's more relatable:

* _Presentation layer_ - the user interface (UI) or command line interface (CLI) that users use to send commands to your application to do stuff, like submitting a form or clicking a button to delete a record.
* _Application layer_ - all of the "out-of-the-box" framework stuff, like controllers, jobs, middleware, requests/responses, service containers, etc. This is basically the layer that intercepts commands from the Presentation layer, deciphers what the users wants to do, and then hands it off to the Domain layer to be fulfilled. Don't confuse "Application layer" to mean "the entire application". This really is referring to just the HTTP protocol junk your frameworks typically handle before it hands it off to you to deal with in a controller action. Easy way to understand it: if it was there when you installed the framework, it's part of the Application layer.
* _Domain layer_ - also known as the "business logic" layer or just "business logic", this is all the code that you write that makes your app unique and contains all the logic that describes how your application behaves. It interacts with the Data layer to fetch necessary information to perform business operations and persist their results to storage.
* _Data_ layer - this is the code that is specifically designed for storing and retrieving data.

![Four architecural layers of an application](/blog/implement-the-repository-pattern-in-php/application-layers-1.jpg)

Repositories have a distinct role to play in your application. **They are _not_ object relational mappers (ORMs)** like Laravel's Eloquent or Rails' ActiveRecord, although they behave similarly. ORMs muddle together the business domain and data layers into one. Repositories don't, which makes them inherently easier to abstract and test. ORMs can be great solutions for smaller and simpler projects because they're quick and easy to work with, but they can become bottlenecks for more complex applications that perform complicated business tasks.

One of the biggest mistakes made when implementing the repository pattern is failing to understand the division between the layers. Developers new to this pattern unknowingly create repositories that combine the Application, Domain, and Data layers all into one messy class and nullify all of the benefits that repositories provide. That's why it's important to be aware of which layers your repository and its implementations reside in and _why_, which we'll cover next.

# Implementing a Repository

For this article we're going to implement the repository pattern easily access and store `Post` objects for our fictitious app called "Postey". I'll show you how to then use the repository we create in a controller to give you a fuller picture.

The ultimate goal is achieve a repository that has an elegant syntax like so:

```php
<?php

// Instantiate a PostsRepository instance (that uses SQL to fetch posts)
$postsRepo = new SQLPostsRepository(
    new PDO('...', 'username', 'password')
);

// Fetch all posts
$posts = $postsRepo->fetchAll(); // PostCollection

foreach ($posts as $post) {
    echo $post->getTitle() . PHP_EOL;
}

// Find a single post
$post = $post->find('1'); // Post

// Create a post
$post = new Post('2', 'My New Post', 'This is my second and newest post.');
$post = $postsRepo->save($post); // Post (id = 2)

// Update existing post
$post = new Post('2', 'This Post is Old Now', 'This is my second post but I\'ve updated it.');
$post = $postsRepo->save($post); // Post (id = 2)

// Delete post
$post->delete('2');
```

Here's what we'll be implementing:

![UML diagram for repository we'll be implementing](/blog/implement-the-repository-pattern-in-php/repository-uml-1.jpg)

The `PostsRepository` interface is part of the Domain layer while its implementation(s) belong in the Data layer. The Domain layer uses the repository to read and write `Post` objects, but it is not concerned with the details on _how_ those objects are stored and retrieved. Client classes that use an implmentation of `PostsRepository` don't care which database technology `find($postId)` uses as long as it gets back a `Post` object.

Let's start with defining the `PostsRepository` interface:

<div class="post-file-title"><pre>src/Domain/PostsRepository.php</pre></div>

```php
<?php

namespace Postey\Domain;

use Postey\Domain\Post;
use Postey\Domain\PostCollection;

interface PostsRepository
{
    /**
     * Fetch all posts.
     *
     * @return \Domain\PostCollection
     */
    public function fetchAll(): PostCollection;

    /**
     * Find a specific post by its ID.
     *
     * @param string $postId
     * @return \Domain\Post
     */
    public function find(string $postId): Post;

    /**
     * Save a post.
     *
     * This creates the post if it doesn't exist or updates
     * it if it does.
     *
     * @param string $postId
     * @return \Domain\Post
     */
    public function save(Post $post): Post;

    /**
     * Delete a specific post by ID.
     *
     * @param string $postId
     * @return void
     */
    public function delete(string $postId): void;
}
```

Let's also define the corresponding `Post` and `PostCollection` classes:

<div class="post-file-title"><pre>src/Domain/Post.php</pre></div>

```php
<?php

namespace Postey\Domain;

class Post
{
    private string $id;
    private string $title;
    private string $body;

    /**
     * Constructor
     *
     * Pass all properties via constructor and exclude setters to keep
     * object immutable.
     *
     * @param string $id
     * @param string $title
     * @param string $body
     */
    public function __construct(string $id, string $title, string $body)
    {
        $this->id = $id;
        $this->title = $title;
        $this->body = $body
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getBody(): string
    {
        return $this->body;
    }
}
```

<div class="post-file-title"><pre>src/Domain/PostCollection.php</pre></div>

```php
<?php

namespace Postey\Domain;

use Domain\Post;
use Iterator;

class PostCollection implements Iterator
{
    private array $items = [];

    /**
     * Constructor
     * 
     * Enforce that all items provided on initialization are posts.
     *
     * @param array $items = []
     */
    public function __construct(array $items = [])
    {
        $this->position = 0;

        foreach ($items as $item) {
            $this->add($post);
        }
    }

    /**
     * Add a post to the collection.
     *
     * @param \Domain\Post $post
     * @return void
     */
    public function add(Post $post): void
    {
        $this->items[] = $post;
    }

    /**
     * Get current post.
     *
     * @return mixed
     */
    public function current(): mixed
    {
        return $this->items[$this->position];
    }

    /**
     * Get current index of current post.
     *
     * @return mixed
     */
    public function key(): mixed
    {
        return $this->position;
    }

    /**
     * Reset the pointer to the start of the collection.
     *
     * @return void
     */
    public functio rewind(): void
    {
        $this->position = 0;
    }

    /**
     * Increment the pointer to the next post.
     *
     * @return void
     */
    public function next(): void
    {
        ++$this->position;
    }

    /**
     * Determine if the current element is set and is a post.
     *
     * @return bool
     */
    public function valid(): bool
    {
        return isset($this->items[$this->position])
            && $this->items[$this->position] instanceof Post;
    }
}
```

We _could_ use an array instead of a `PostCollection` object, but I find it's best to go the extra mile to _be as explicit and as strict as possible_ with your code when building something robust. Defining a `PostCollection` class enforces that all elements in the collection are of the same type, protecting it from mutations within the repository and when returned from repository.

It's also worth pointing out that, just how the `PostRepository` interface and its implementations belong to different architecural layers, so does the `Iterator` and `PostCollection` classes. The `Iterator` belongs to the Application layer while `PostCollection` belongs to the Domain layer. The easiest way to understand why is because the `Iterator` interface comes out-of-the-box with PHP, regardless of what your "business" is about. The `Iterator` class  If you were running a business about selling golf balls, do you think you would have a `PostCollection` class? Very unlikely. That's how you know a class belongs in the Domain layer because the existence of the class is directly tied to what the business is about.







