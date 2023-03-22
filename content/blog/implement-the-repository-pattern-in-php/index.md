---
title: "Implement the Repository Pattern in PHP"
date: "2023-03-15T21:30:00.000Z"
description: "Learn how to implement the repository pattern in PHP in a clean and testable way."
tags:
    - php
    - oop
---

# Terminology

* **Repository** - an collection-like object for persisting and accessing domain objects.
* **Domain objects** - objects that represent a concept or entity from the problem domain being modeled.
* **Entity** - a domain object that has an intrinsically unique identity.

# Benefits of the Repository Pattern

Before we begin learning how to create a repository, it's important to know _why_ they're used.

There are many benefits to using repositories, to name a few:

* They provide a simple way to read and write objects between your business logic and data source(s)
* They decouple business logic from the need to understand how data is persisted and reconstituted, even among multiple data sources
* They are easy to mock in unit tests
* They make your code more readable and maintainable
* You can create new data access strategies without modifying existing code (a.k.a. adhering to the [open-closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle))

# Where Repositories Live

Every web application is divided into four layers. These layers separate the concerns of your application to improve modularity, security, testability, and maintainability. These layers are (described in layman's terms):

* _Presentation layer_ - the user interface (UI) or command line interface (CLI) that users use to send commands to your application to do stuff, like submitting a form or clicking a button to delete a record. It's whatever gets _presented_ to the user.
* _Application layer_ - think of this as all of the "out-of-the-box" framework stuff, like controllers, jobs, middleware, requests/responses, service containers, etc. This is basically the layer that intercepts commands from the Presentation layer, deciphers what the users wants to do, and then hands it off to the Domain layer to be fulfilled. Don't confuse "Application layer" to mean "the entire application". This really is referring to all of the code that processes requests. For example, all of the HTTP protocol junk your frameworks typically handle before it hands it off to you to deal with in a controller action. Easy way to understand it: if it was there at the base installation of your project/language, it's part of the Application layer.
* _Domain layer_ - also known as the "business logic" layer or just "business logic", this is all the code that you write that makes your app unique and contains all the logic that describes how your application behaves. It interacts with the Infrastructure layer to fetch necessary information to perform business operations and/or persist their results to storage.
* _Infrastructure_ layer - this is the code that accesses infrastructure, like databases, job queues, event streams, APIs, etc. For example, an HTTP client class that performs a request to an API or a class that executes an SQL query would be part of this layer.

A repository's interface is defined as being part of the Domain layer while its implementations are part of the Infrastruture layer. These two layers comprise the bottom four architectural layers of any codebase.

![Four architecural layers of an application](/blog/implement-the-repository-pattern-in-php/application-layers-1.jpg)

The Domain layer is the layer that consists of your business logic. It should be free from knowing anything about _how_ domain objects are accessed and persisted in the Infrastructure layer. This can be achieved through the proper use of interfaces.

# Implementing a Repository

Full project: https://github.com/grahamsutton/postey-repository-tut

This is the UML diagram to a fictitious app called "Postey" which manages blog posts that we'll base our example code on. I won't write out every single class definition in detail to keep the emphasis on the repository and how to use it.

![UML diagram for repository we'll be implementing](/blog/implement-the-repository-pattern-in-php/repository-uml-1.jpg)

The `PostsRepository` provides methods to manage the `Post` entity's lifecycle. 

And here is how I define the `PostsRepository` interface and its implementation `PostgresPostsRepository`, which uses a `PDO` instance to access records via a PostgreSQL database:

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
     * @return \Postey\Domain\PostCollection
     */
    public function all(): PostCollection;

    /**
     * Find a specific post by its ID.
     *
     * @param int $postId
     * @return ?\Postey\Domain\Post
     */
    public function find(int $postId): ?Post;

    /**
     * Save a post.
     *
     * This creates the post if it doesn't exist or updates
     * it if it does.
     *
     * @param \Postey\Domain\Post $post
     * @return \Postey\Domain\Post
     */
    public function save(Post $post): Post;

    /**
     * Delete a specific post by ID.
     *
     * @param int $postId
     * @return void
     */
    public function delete(int $postId): void;

    /**
     * Return the next ID available to unqiuely identify a post.
     *
     * @return int
     */
    public function nextIdentity(): int;
}
```

<div class="post-file-title"><pre>src/Infra/PostgresPostsRepository.php</pre></div>

```php
<?php

namespace Postey\Infra;

use PDO;
use Postey\Domain\Post;
use Postey\Domain\PostCollection;
use Postey\Domain\PostsRepository;

class PostgresPostsRepository implements PostsRepository
{
    /**
     * The PostgreSQL database connection.
     *
     * @var \PDO
     */
    private PDO $db;

    /**
     * Constructor
     *
     * @param \PDO $db
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Fetch all posts.
     *
     * @return \Postey\Domain\PostCollection
     */
    public function all(): PostCollection
    {
        $posts = new PostCollection();

        $results = $this->db
            ->query('SELECT * FROM posts')
            ->fetchAll();

        foreach ($results as $result) {
            $posts->add($this->mapToObject($result));
        }

        return $posts;
    }

    /**
     * Find a specific post by its ID.
     *
     * @param int $postId
     * @return \Postey\Domain\Post|null
     */
    public function find(int $postId): ?Post
    {
        $stmt = $this->db->prepare('SELECT * FROM posts WHERE id = :id');

        $stmt->execute(['id' => $postId]);

        $result = $stmt->fetch();

        if (!$result) {
            return null;
        }

        return $this->mapToObject($result);
    }

    /**
     * Save a post.
     *
     * This creates the post if it doesn't exist or updates
     * it if it does.
     *
     * @param \Postey\Domain\Post $post
     * @return \Postey\Domain\Post
     */
    public function save(Post $post): Post
    {
        $sql = <<<SQL
            INSERT INTO posts (id, title, body)
            VALUES (:id, :title, :body)
            ON CONFLICT (id)
            DO
            UPDATE SET
                title = :title,
                body = :body;
        SQL;

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'id' => $post->getId(),
            'title' => $post->getTitle(),
            'body' => $post->getBody()
        ]);

        return $this->find($post->getId());
    }

    /**
     * Delete a specific post by ID.
     *
     * @param string $postId
     * @return void
     */
    public function delete(int $postId): void
    {
        $stmt = $this->db->prepare('DELETE FROM posts WHERE id = :id');

        $stmt->execute(['id' => $postId]);
    }

    /**
     * Return the next ID available to unqiuely identify a post.
     *
     * @return int
     */
    public function nextIdentity(): int
    {
        $stmt = $this->db->prepare("SELECT nextval('posts_id_seq')");

        $stmt->execute();

        return $stmt->fetchColumn();
    }

    /**
     * Map a table record from the `posts` table to a \Postey\Domain\Post
     * object.
     *
     * @param array $post
     * @return \Postey\Domain\Post
     */
    private function mapToObject(array $post): Post
    {
        return new Post(
            $post['id'],
            $post['title'],
            $post['body']
        );
    }
}
```

There's a couple things that should be pointed out here:

* The `Post` domain object is an immutable entity.
* The `Post` domain object has `id` assigned to it at construction, regardless of whether it has been persisted or not.
* There is zero business logic in the repository.

I make my objects immutable by default. You don't have to, but I am strongly opposed to introducing the means of changing an object's state unless there is a very good reason for doing so. This makes creating and updating an entity a more interesting endeavor, but not impossible. Most of us have learned ~~from every computer science college professor who taught programming~~ that we should have setters for all of our object properties, but this causes us to undermine the need for good principles around how object state is managed. That topic deserves its own article so I won't digress any further.

Using the repository's `nextIdentity` method, we can generate an ID relative to the entity's repository. I find this approach from [Vaughn Vernon's _Implementing Domain Driven Design_](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577) works rather well because the controller doesn't have to be concerned with how the infrastructure generates the ID and it's a good place to put the ID-generation logic - right alongside the repository that manages those entities.

Lastly, there's no important business decisions being made within the repository. It behaves strictly like a collection of `Post`s. This is a very simple app, so the `PostsRepository` in this example is very straightforward and doesn't convey very well how to keep a repository clean of business decisions. Perhaps that, too, deserves its own article.

When reading data, the repository simply extracts the data from its respective data source, reconstitutes it into a `Post`\\`PostCollection` object, and returns it. When it writes, it deconstructs the `Post` object and stores it into its respective data source. Regardless of the lack of good example, that's as complicated as a repository should get.

# Using a Repository

Repositories should give the illusion of being in-memory collections to the clients that use them. For example, if you were to call the `find` method, don't think of it as "I am finding a post from a Postgres database", but rather as "I am finding a post from a repository of posts". Hence the name _repository_. Notice how the language doesn't make any mention of the data source its accessing - no mention of Postgres or MySQL or MongoDB, etc. Those are infrastructure concerns.

Imagine it now from the perspective of the domain experts - the blog writers of our fictitious app Postey. They are non-technical folks. Their expertise is in journalism, not software development. Do you think they care which database you use? They don't. They _do_ care that they can create, update, find, and delete their blog posts, but they don't care _how_ the app does it or where they're stored. To them, it's as good as magic - implementation details they don't care about. They care that they can _interface_ with a repository of posts, but they don't care how it's _implemented_.

And just how the domain experts don't care, neither does our controller. Controllers live in the Application layer. They communicate with objects in the Domain layer, like our `PostsRepository` interface does. They should not communicate across the Domain layer and directly to the Infrastructure layer (`PostgresPostsRepository`). That type of overreach is the foundation of spaghetti code. If we ever change the implementation, the controller and any other places it's referenced would have to be updated, too.

Let's envision using our `PostsRepository` in a Laravel controller called `PostsController`:

<div class="post-file-title"><pre>app/Http/Controllers/PostsController.php</pre></div>

```php
<?php

namespace App\Http\Controllers;

use Domain\PostsRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PostsController extends Controller
{
    /**
     * The repository of posts being managed.
     *
     * @var \Domain\PostsRepository
     */
    private PostsRepository $postsRepo;

    /**
     * Constructor
     *
     * @param \Domain\PostsRepository $postsRepo
     */
    public function __construct(PostsRepository $postsRepo)
    {
        $this->postsRepo = $postsRepo;
    }

    /**
     * Fetch all posts.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): Response
    {
        $posts = $this->postsRepo->all();

        return view('posts.index', ['posts' => $posts]);
    }

    /**
     * Find and show a specific post.
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function show(string $id): Response
    {
        $post = $this->postsRepo->find($id);

        return view('posts.show', ['post' => $post]);
    }

    /**
     * Render form to create a new post.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(): Response
    {
        return view('posts.create');
    }

    /**
     * Store a new post.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $post = new Post(
            $this->postsRepo->nextIdentity(),
            $request->input('title'),
            $request->input('body')
        );

        $this->postsRepo->save($post);

        return redirect()->route('posts.show', ['id' => $post->getId()]);
    }

    /**
     * Render edit page for an existing post.
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function edit(string $id): Response
    {
        $post = $this->postsRepo->find($id);

        return redirect()->route('posts.edit', ['post' => $post]);
    }

    /**
     * Update an existing post.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $post = $this->postsRepo->find($id);

        $updatedPost = new Post(
            $post->getId(),
            $request->input('title') ?? $post->getTitle(),
            $request->input('body') ?? $post->getBody()
        );

        $this->postsRepo->save($updatedPost);

        return redirect()->route('posts.show', ['id' => $updatedPost->getId()]);
    }

    /**
     * Delete a post.
     *
     * @param string $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(string $id): RedirectResponse
    {
        $this->postsRepo->delete($id);

        return redirect()->route('posts.index');
    }
}
```

We use the `PostsRepository` interface as the type-hint because from the controller's perspective, it doesn't care about _how_ the underlying infrastructure works so long as the `PostsRepository` implementation works.

Using Laravel's `AppServiceProvider`, we can specify which implementation we want to use inject when `PostsRepository` is referenced from the service container:

```php
<?php

namespace App\Providers;

use Domain\PostsRepository;
use PDO;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Infra\PostgresPostsRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('pdo-pgsql', function () {
            $host = config('connections.pgsql.host');
            $port = config('connections.pgsql.port');
            $name = config('connections.pgsql.database');
            $user = config('connections.pgsql.username');
            $pass = config('connections.pgsql.password');

            return new PDO("pgsql:host=$host;port=$port;dbname=$name", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        });

        $this->app->bind(PostsRepository::class, function (Application $app) {
            return new PostgresPostsRepository($app->make('pdo-pgsql'));
        });
    }

    ...
}
```

I separated the instantiation of the `PDO` class into a `singleton` binding to prevent multiple database connections from being created if `PostsRepository` implementations are injected more than once. I also named it `pdo-pgsql` instead of `PDO::class` just on the off chance some other type of connection like `pdo-mysql` is needed in the future.

There are other ways you could make your `PostgresPostsRepository` depend on Laravel's `DB` facade, which would be less of a "Postgres" implementation and more of a "Laravel" implementation, but that would make that implementation  completely dependent on the Laravel framework itself. There's no problem with that as long as you're aware of what you're doing and don't need your repository to be used elsewhere, for instance, in a Composer package or another application that uses a different framework (or no framework at all).

Theoretically, if you ever needed to switch from storing your posts in Postgres to another data source like MongoDB, you would simply need to create a new `MongoPostsRepository` implementation and swap `PostgresPostsRepository` for `MongoPostsRepository` and you wouldn't have to modify a single line of code in your controller.

# Conclusion

Repositories, when approached wisely, can provide tremendous benefits to the long term sustainability of your application. They can keep your domain logic free of infrastructural concerns, allowing your domain code to be more flexible and adaptable to changes in infrastructure in the long run.

Although, I've provided reasons and examples of why you _should_ use repositories, I am also keen on advising when I think you _shouldn't_. Repositories can provide great separation of concerns in large codebases, but I personally would recommend avoiding them for small, simple projects. Unless you absolutely know your codebase is going to benefit from using the repository pattern, I would suggest forgoing it until the benefits of using one start to become clearer and clearer as your app progresses in development. Just because I told you it's a good idea doesn't mean it's a good idea in every scenario. When I spin up a fresh Laravel project, I still use the Eloquent ORM most of the time. If business logic starts to get complex and crazy, repositories are just one tool I use to make my domain model more sane and readable. Don't put the cart before the horse.

If you enjoyed this article, please let me know in the comments below. Feel free to let me know if you have any questions or there's any other aspects related to the repository pattern you would like to see me cover in another article.

Thanks for reading!















